"use server";

import { getAdminClient } from "@/lib/supabase";
import { sendTelegramAlert } from "./telegram";
import { revalidatePath } from "next/cache";

export interface MatchResponse {
  success: boolean;
  message: string;
  data?: any;
}

export async function matchMakeAction(
  matchId: string,
  guestTeamId: string
): Promise<MatchResponse> {
  const supabase = getAdminClient();

  // 1. Kiểm tra điểm tín nhiệm của đội bắt kèo
  const { data: guestTeam, error: teamErr } = await supabase
    .from("teams")
    .select("team_name, trust_score, has_warning_badge")
    .eq("id", guestTeamId)
    .single();

  if (teamErr || !guestTeam) {
    return {
      success: false,
      message: "Không tìm thấy thông tin đội bóng của bạn.",
    };
  }

  // 2. Nếu điểm tín nhiệm < 70, kiểm tra giao dịch cọc 200k đã xác nhận chưa
  if (guestTeam.trust_score < 70) {
    const { data: escrow } = await supabase
      .from("escrow_deposits")
      .select("status")
      .eq("match_id", matchId)
      .eq("team_id", guestTeamId)
      .eq("status", "verified")
      .single();

    if (!escrow) {
      return {
        success: false,
        message:
          "Điểm tín nhiệm của đội bạn dưới 70. Vui lòng chuyển khoản ký quỹ 200.000 VNĐ vào STK Ban Quản Trị trước khi chốt kèo!",
      };
    }
  }

  // 3. Gọi Stored Procedure khóa dòng chống xung đột đồng thời (Race Condition)
  const { data: result, error: rpcErr } = await supabase.rpc(
    "fn_lock_and_match",
    {
      p_match_id: matchId,
      p_guest_team_id: guestTeamId,
    }
  );

  if (rpcErr || !result?.success) {
    return {
      success: false,
      message:
        result?.message || "Kèo này vừa có đội khác bắt trước trong tích tắc!",
    };
  }

  // 4. Bắn thông báo Telegram tức thì về máy Đội trưởng đội nhà & đội khách
  const matchInfo = result.match_data || {};
  const alertText =
    `⚽ <b>BẮT KÈO THÀNH CÔNG!</b>\n` +
    `• Đội bắt đối: <b>${guestTeam.team_name}</b> (Tín nhiệm: ${guestTeam.trust_score}/100)\n` +
    `• Sân: ${matchInfo.pitch_custom_name || "Sân cỏ nhân tạo"}\n` +
    `• Giờ đá: ${matchInfo.time_slot_label || "19:00"}\n` +
    `• Tiền sân chia đôi: ${(matchInfo.split_fee || 350000).toLocaleString()}đ/đội\n` +
    `👉 Đội trưởng vui lòng mở mục VietQR để kiểm tra thanh toán tại sân.`;

  await sendTelegramAlert(alertText);

  revalidatePath("/");
  return {
    success: true,
    message: "Chốt kèo thành công! Chúc hai đội giao lưu vui vẻ.",
    data: result,
  };
}
