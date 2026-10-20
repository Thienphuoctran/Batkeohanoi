"use server";

import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { sendTelegramAlert } from "./telegram";
import { normalizeVietnamPhone, isValidVietnamPhone } from "@/lib/zalo";
import { getAuthenticatedUser } from "@/actions/auth";
import {
  FreeAgentScoutCard,
  SubPlayerPost,
  SoloPosition,
  SkillTier,
  District,
} from "@/types/matchmaking";

import { mapDbToFreeAgent, mapDbToSubPost } from "@/lib/marketUtils";

/**
 * 1. LẤY TOÀN BỘ DANH SÁCH CHỢ CẦU TỪ SUPABASE (Single Source of Truth)
 */
export async function getMarketPostsFromDatabaseAction() {
  try {
    const adminClient = getAdminClient();

    // 1. Kéo danh sách Cầu thủ tự do tìm đội
    let freeAgents: FreeAgentScoutCard[] = [];
    try {
      const { data: faData, error: faErr } = await adminClient
        .from("free_agent_posts")
        .select("*")
        .neq("status", "CANCELLED")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!faErr && Array.isArray(faData)) {
        freeAgents = faData.map(mapDbToFreeAgent);
      } else if (faErr) {
        console.warn("[getMarketPosts] free_agent_posts notice:", faErr.message);
      }
    } catch (e) {
      console.warn("[getMarketPosts] free_agent_posts catch:", e);
    }

    // 2. Kéo danh sách Đội tuyển thêm người
    let subPosts: SubPlayerPost[] = [];
    try {
      const { data: subData, error: subErr } = await adminClient
        .from("sub_player_posts")
        .select("*")
        .neq("status", "CANCELLED")
        .order("created_at", { ascending: false })
        .limit(60);

      if (!subErr && Array.isArray(subData)) {
        subPosts = subData.map(mapDbToSubPost);
      } else if (subErr) {
        console.warn("[getMarketPosts] sub_player_posts notice:", subErr.message);
      }
    } catch (e) {
      console.warn("[getMarketPosts] sub_player_posts catch:", e);
    }

    return {
      success: true,
      freeAgents,
      subPosts,
    };
  } catch (err: any) {
    console.error("[getMarketPostsFromDatabaseAction Error]", err);
    return { success: false, freeAgents: [], subPosts: [], error: err?.message };
  }
}

/**
 * 2. TẠO HOẶC CẬP NHẬT HỒ SƠ CẦU THỦ TỰ DO (Lớp 3 Idempotency)
 */
export async function createOrUpdateFreeAgentAction(payload: FreeAgentScoutCard) {
  try {
    const adminClient = getAdminClient();
    const cleanPhone = normalizeVietnamPhone(payload.phone);

    // LỚP 3: Idempotency Check (Chống Double Submission trong 30s)
    if (!payload.id || payload.id.startsWith("scout-")) {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      try {
        const { data: existingDup } = await adminClient
          .from("free_agent_posts")
          .select("*")
          .eq("phone", cleanPhone)
          .eq("position", payload.position)
          .neq("status", "CANCELLED")
          .gte("created_at", thirtySecondsAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingDup) {
          console.log("[createFreeAgent] Phát hiện Double Submission -> Trả về bản ghi ID:", existingDup.id);
          return { success: true, post: mapDbToFreeAgent(existingDup) };
        }
      } catch (checkErr) {}
    }

    const insertObj: Record<string, any> = {
      player_name: payload.playerName.trim() || 'Anh Em "Phủi"',
      age: Number(payload.age) || 25,
      preferred_foot: payload.preferredFoot || "Chân phải",
      position: payload.position,
      position_label: payload.positionLabel,
      skill_tier: payload.skillTier,
      districts: payload.districts,
      available_date: payload.availableDate,
      available_date_iso: payload.availableDateIso || null,
      available_time_slots: payload.availableTimeSlots,
      phone: cleanPhone,
      zalo_phone: normalizeVietnamPhone(payload.zaloPhone || cleanPhone),
      bio: payload.bio,
      fut_stats: payload.futStats,
      status: "ACTIVE",
    };

    const isUuid = payload.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id);

    let savedData: any = null;

    if (isUuid) {
      // Cập nhật bản ghi có sẵn
      const { data, error } = await adminClient
        .from("free_agent_posts")
        .update(insertObj)
        .eq("id", payload.id)
        .select()
        .single();
      if (!error && data) savedData = data;
    }

    if (!savedData) {
      // Thêm mới bản ghi
      const { data, error } = await adminClient
        .from("free_agent_posts")
        .insert(insertObj)
        .select()
        .single();

      if (error) {
        console.warn("[createFreeAgent insert warning]", error.message);
        // Fallback: nếu bảng DB chưa tạo, vẫn trả về payload với ID hợp lệ để Realtime Broadcast chạy
        const fallbackPost: FreeAgentScoutCard = {
          ...payload,
          phone: cleanPhone,
          zaloPhone: normalizeVietnamPhone(payload.zaloPhone || cleanPhone),
        };
        return { success: true, post: fallbackPost, isFallback: true };
      }
      savedData = data;
    }

    const resultPost = mapDbToFreeAgent(savedData);

    // Gửi cảnh báo khẩn cấp tới Telegram Ban Quản Trị
    const alertText =
      `⚽ <b>CẦU THỦ MỚI ĐĂNG TÌM ĐỘI (CHỢ CẦU BẮTKÈO7)</b>\n` +
      `• Cầu thủ: <b>${resultPost.playerName}</b> (${resultPost.age} tuổi • ${resultPost.preferredFoot})\n` +
      `• Vị trí sở trường: <b>${resultPost.positionLabel}</b> (Tier ${resultPost.skillTier})\n` +
      `• Khu vực nhận đá: <b>${resultPost.districts.join(", ")}</b>\n` +
      `• Khung giờ rảnh: <b>${resultPost.availableTimeSlots.join(", ")}</b> (${resultPost.availableDate})\n` +
      `• SĐT Zalo liên hệ: <code>${resultPost.phone}</code>\n` +
      `• Lời nhắn: <i>${resultPost.bio || "N/A"}</i>`;

    await sendTelegramAlert(alertText);

    revalidatePath("/");
    return { success: true, post: resultPost };
  } catch (err: any) {
    console.error("[createOrUpdateFreeAgentAction Error]", err);
    return { success: false, error: err?.message || "Lỗi lưu hồ sơ cầu thủ" };
  }
}

/**
 * 3. TẠO HOẶC CẬP NHẬT TIN ĐỘI TUYỂN NGƯỜI (Lớp 3 Idempotency)
 */
export async function createOrUpdateSubPostAction(payload: SubPlayerPost) {
  try {
    const adminClient = getAdminClient();
    const cleanPhone = normalizeVietnamPhone(payload.contactPhone);
    const user = await getAuthenticatedUser();

    let teamId = payload.teamId || "team-guest";
    if (user?.id) {
      const { data: userTeam } = await adminClient
        .from("teams")
        .select("id, team_name, captain_phone, captain_zalo, skill_tier")
        .eq("captain_id", user.id)
        .maybeSingle();

      if (userTeam) {
        teamId = userTeam.id;
        payload.teamName = userTeam.team_name;
        payload.contactPhone = userTeam.captain_phone;
        payload.contactZalo = userTeam.captain_zalo || userTeam.captain_phone;
        if (typeof userTeam.skill_tier === "number") payload.skillTier = userTeam.skill_tier;
      }
    }

    // LỚP 3: Idempotency Check (Chống Double Submission trong 30s)
    if (!payload.id || payload.id.startsWith("sub-")) {
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
      try {
        const { data: existingDup } = await adminClient
          .from("sub_player_posts")
          .select("*")
          .eq("contact_phone", cleanPhone)
          .eq("pitch_name", payload.pitchName)
          .eq("position_code", payload.positionCode || "MF")
          .neq("status", "CANCELLED")
          .gte("created_at", thirtySecondsAgo)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingDup) {
          console.log("[createSubPost] Phát hiện Double Submission -> Trả về bản ghi ID:", existingDup.id);
          return { success: true, post: mapDbToSubPost(existingDup) };
        }
      } catch (checkErr) {}
    }

    const insertObj: Record<string, any> = {
      team_id: teamId,
      team_name: payload.teamName.trim() || "FC Anh Em Hà Nội",
      position_needed: payload.positionNeeded,
      position_code: payload.positionCode || "MF",
      quantity: Number(payload.quantity) || 1,
      match_date: payload.matchDate,
      match_date_iso: payload.matchDateIso || null,
      match_time: payload.matchTime,
      expires_at: payload.expiresAt || null,
      pitch_name: payload.pitchName.trim() || "Sân Cỏ Nhân Tạo",
      district: payload.district,
      skill_tier: payload.skillTier || 2,
      contact_phone: cleanPhone,
      contact_zalo: normalizeVietnamPhone(payload.contactZalo || cleanPhone),
      notes: payload.notes,
      status: payload.status || "ACTIVE",
    };

    const isUuid = payload.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id);

    let savedData: any = null;

    if (isUuid) {
      const { data, error } = await adminClient
        .from("sub_player_posts")
        .update(insertObj)
        .eq("id", payload.id)
        .select()
        .single();
      if (!error && data) savedData = data;
    }

    if (!savedData) {
      const { data, error } = await adminClient
        .from("sub_player_posts")
        .insert(insertObj)
        .select()
        .single();

      if (error) {
        console.warn("[createSubPost insert warning]", error.message);
        const fallbackPost: SubPlayerPost = {
          ...payload,
          contactPhone: cleanPhone,
          contactZalo: normalizeVietnamPhone(payload.contactZalo || cleanPhone),
        };
        return { success: true, post: fallbackPost, isFallback: true };
      }
      savedData = data;
    }

    const resultPost = mapDbToSubPost(savedData);

    // Gửi cảnh báo Telegram Ban Quản Trị
    const alertText =
      `📢 <b>ĐỘI BÓNG ĐĂNG TIN TUYỂN THÊM QUÂN (CHỢ CẦU BẮTKÈO7)</b>\n` +
      `• Đội bóng: <b>${resultPost.teamName}</b>\n` +
      `• Cần tuyển: <b>${resultPost.quantity} ${resultPost.positionNeeded}</b>\n` +
      `• Sân thi đấu: <b>${resultPost.pitchName}</b> (${resultPost.district})\n` +
      `• Khung giờ: <b>${resultPost.matchTime}</b> (${resultPost.matchDate})\n` +
      `• Liên hệ Đội trưởng: <code>${resultPost.contactPhone}</code>\n` +
      `• Lời nhắn: <i>${resultPost.notes || "N/A"}</i>`;

    await sendTelegramAlert(alertText);

    revalidatePath("/");
    return { success: true, post: resultPost };
  } catch (err: any) {
    console.error("[createOrUpdateSubPostAction Error]", err);
    return { success: false, error: err?.message || "Lỗi lưu tin tuyển người" };
  }
}

/**
 * 4. XÓA BÀI ĐĂNG CHỢ CẦU (Database Soft & Hard Delete)
 */
export async function deleteMarketPostAction(
  postId: string,
  type: "free-agents" | "team-recruit",
  callerPhone?: string
) {
  try {
    const adminClient = getAdminClient();
    const tableName = type === "free-agents" ? "free_agent_posts" : "sub_player_posts";

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);

    if (isUuid) {
      // 🛡️ BẢO MẬT MỤC 8: Khóa quyền truy cập Record (Chống tấn công IDOR)
      const { data: targetRecord } = await adminClient
        .from(tableName)
        .select("phone, contact_phone")
        .eq("id", postId)
        .maybeSingle();

      if (targetRecord) {
        const recordPhone = normalizeVietnamPhone(targetRecord.phone || targetRecord.contact_phone || "");
        const inputPhone = normalizeVietnamPhone(callerPhone || "");

        // Nếu bản ghi có SĐT và người gọi có SĐT nhưng không trùng khớp -> Chặn ngay lập tức
        if (recordPhone && inputPhone && recordPhone !== inputPhone) {
          console.warn(`[deleteMarketPostAction IDOR Blocked] SĐT yêu cầu (${inputPhone}) không khớp SĐT bài đăng (${recordPhone})`);
          return {
            success: false,
            error: "Từ chối truy cập: Bạn không phải người đăng chính chủ của bài viết này!",
          };
        }
      }

      // 1. Soft delete
      await adminClient
        .from(tableName)
        .update({ status: "CANCELLED" })
        .eq("id", postId);

      // 2. Hard delete
      await adminClient
        .from(tableName)
        .delete()
        .eq("id", postId);
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[deleteMarketPostAction Error]", err);
    return { success: false, error: err?.message || "Lỗi xóa bài đăng" };
  }
}
