"use server";

import { getAdminClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendTelegramAlert, sendTelegramPhoto } from "./telegram";
import { normalizeVietnamPhone, isValidVietnamPhone } from "@/lib/zalo";

function getAnonAuthClient() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://lkvrdfqyyigdsxtipfcy.supabase.co"
  )
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("bk7_access_token")?.value;
    const fallbackUserId = cookieStore.get("bk7_user_id")?.value;
    const adminClient = getAdminClient();

    if (accessToken) {
      try {
        const { data, error } = await adminClient.auth.getUser(accessToken);
        if (!error && data?.user) {
          return data.user;
        }
      } catch (err) {
        console.error("[getAuthenticatedUser auth.getUser Error]", err);
      }

      // Fallback 1: Giải mã trực tiếp từ payload JWT nếu Supabase Auth verify timeout/lỗi network
      try {
        const payloadBase64 = accessToken.split(".")[1];
        if (payloadBase64) {
          const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
          const payload = JSON.parse(
            Buffer.from(base64, "base64").toString("utf-8")
          );
          if (payload?.sub) {
            return {
              id: payload.sub,
              email: payload.email || "",
              user_metadata: payload.user_metadata || {},
            } as any;
          }
        }
      } catch (jwtErr) {
        console.error("[getAuthenticatedUser JWT Parse Error]", jwtErr);
      }
    }

    if (fallbackUserId) {
      try {
        const { data, error } = await adminClient.auth.admin.getUserById(
          fallbackUserId
        );
        if (!error && data?.user) {
          return data.user;
        }
      } catch (adminErr) {}

      // Fallback 2: Truy vấn trực tiếp từ bảng public.users (trường hợp chưa cấu hình Service Role Key)
      try {
        const { data: dbUser } = await adminClient
          .from("users")
          .select("id, full_name, avatar_url, phone")
          .eq("id", fallbackUserId)
          .maybeSingle();

        if (dbUser) {
          return {
            id: dbUser.id,
            email: "",
            user_metadata: {
              full_name: dbUser.full_name,
              avatar_url: dbUser.avatar_url,
            },
          } as any;
        }
      } catch (dbErr) {}
    }

    return null;
  } catch (err) {
    console.error("[getAuthenticatedUser Error]", err);
    return null;
  }
}

// 1. Lấy thông tin User hiện tại & Đội bóng họ đang làm Đội trưởng
export async function getCurrentUserAndTeamAction() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { user: null, team: null, profile: null };
    }

    const adminClient = getAdminClient();

    let { data: profile } = await adminClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Tự động khởi tạo profile từ Google User Metadata nếu chưa có trong public.users
    if (!profile) {
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Đội Trưởng Google";
      const avatarUrl =
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        null;

      try {
        const { data: newProfile } = await adminClient
          .from("users")
          .upsert(
            {
              id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              phone: user.phone || null,
            },
            { onConflict: "id" }
          )
          .select("*")
          .maybeSingle();

        profile = newProfile || {
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: "",
        };
      } catch (upsertErr) {
        profile = {
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          phone: "",
        };
      }
    }

    const { data: team } = await adminClient
      .from("teams")
      .select("*")
      .eq("captain_id", user.id)
      .maybeSingle();

    return {
      user: { id: user.id, email: user.email },
      profile: profile || null,
      team: team || null,
    };
  } catch (err) {
    console.error("[getCurrentUserAndTeamAction Error]", err);
    return { user: null, team: null, profile: null };
  }
}

// 2. Đăng ký tài khoản bằng Email, SĐT Zalo & Mật khẩu (1 SĐT = 1 Đội trưởng duy nhất)
export async function signUpWithEmailAction(formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = (formData.get("password") as string)?.trim();
    const fullName = (formData.get("fullName") as string)?.trim();
    const rawPhone = (formData.get("phone") as string)?.trim();
    const phone = normalizeVietnamPhone(rawPhone || "");

    if (!email || !password || !fullName || !phone) {
      return {
        success: false,
        message: "Vui lòng điền đầy đủ các thông tin bắt buộc.",
      };
    }

    if (!isValidVietnamPhone(phone)) {
      return {
        success: false,
        message:
          "Số điện thoại không hợp lệ. Vui lòng nhập đúng SĐT di động 10 số Việt Nam (09/03/07/08/05).",
      };
    }

    const adminClient = getAdminClient();

    // Kiểm tra SĐT đã gắn với Đội trưởng nào chưa (Chống tạo acc phụ bùng kèo)
    const { data: existingUser } = await adminClient
      .from("users")
      .select("id, full_name")
      .eq("phone", phone)
      .maybeSingle();

    if (existingUser) {
      return {
        success: false,
        message: `Số điện thoại ${phone} đã được đăng ký bởi đội trưởng ${existingUser.full_name}. Mỗi số điện thoại chỉ gắn với 1 đội bóng duy nhất để đảm bảo tính minh bạch!`,
      };
    }

    // Tạo tài khoản qua Admin API với email_confirm: true để vào thẳng không bị kẹt mail xác nhận
    const { data: createdAuth, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone },
      });

    if (createError || !createdAuth?.user) {
      const msg = createError?.message?.includes("already")
        ? "Email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập!"
        : createError?.message || "Không thể tạo tài khoản.";
      return { success: false, message: msg };
    }

    // Lưu vào bảng public.users
    await adminClient.from("users").upsert({
      id: createdAuth.user.id,
      full_name: fullName,
      phone: phone,
      is_phone_verified: true,
    });

    // Đăng nhập tự động lấy session token lưu vào Cookie
    const anonClient = getAnonAuthClient();
    const { data: signInData } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    const cookieStore = await cookies();
    if (signInData?.session?.access_token) {
      cookieStore.set("bk7_access_token", signInData.session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    cookieStore.set("bk7_user_id", createdAuth.user.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    revalidatePath("/");
    return {
      success: true,
      message:
        "Đăng ký tài khoản thành công! Hãy tiếp tục tạo hồ sơ đội bóng của bạn.",
    };
  } catch (err: any) {
    console.error("[signUpWithEmailAction Error]", err);
    return {
      success: false,
      message: err?.message || "Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.",
    };
  }
}

// 3. Đăng nhập bằng Email (hoặc Số điện thoại) & Mật khẩu
export async function signInWithEmailAction(formData: FormData) {
  try {
    let identifier = (formData.get("email") as string)?.trim();
    const password = (formData.get("password") as string)?.trim();

    if (!identifier || !password) {
      return {
        success: false,
        message: "Vui lòng nhập Email (hoặc SĐT) và mật khẩu.",
      };
    }

    const adminClient = getAdminClient();

    // Hỗ trợ đăng nhập thông minh bằng cả Số điện thoại lẫn Email
    if (!identifier.includes("@")) {
      const normalizedPhone = normalizeVietnamPhone(identifier);
      const { data: userByPhone } = await adminClient
        .from("users")
        .select("id")
        .eq("phone", normalizedPhone)
        .maybeSingle();

      if (userByPhone?.id) {
        const { data: authUser } = await adminClient.auth.admin.getUserById(
          userByPhone.id
        );
        if (authUser?.user?.email) {
          identifier = authUser.user.email;
        }
      } else {
        return {
          success: false,
          message: `Số điện thoại ${identifier} chưa từng đăng ký tài khoản. Vui lòng bấm tab "Tạo tài khoản" bên cạnh để đăng ký nhé!`,
        };
      }
    }

    const anonClient = getAnonAuthClient();
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error || !data?.user) {
      const isInvalidCreds =
        error?.message?.toLowerCase().includes("invalid login credentials") ||
        error?.message?.toLowerCase().includes("invalid grant");
      return {
        success: false,
        message: isInvalidCreds
          ? "Sai mật khẩu hoặc tài khoản chưa từng được đăng ký. Nếu chưa có tài khoản, vui lòng bấm tab 'Tạo tài khoản' bên cạnh!"
          : error?.message || "Sai thông tin đăng nhập. Vui lòng kiểm tra lại.",
      };
    }

    const cookieStore = await cookies();
    if (data?.session?.access_token) {
      cookieStore.set("bk7_access_token", data.session.access_token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (data?.user?.id) {
      cookieStore.set("bk7_user_id", data.user.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    revalidatePath("/");
    return { success: true, message: "Đăng nhập thành công!" };
  } catch (err: any) {
    console.error("[signInWithEmailAction Error]", err);
    return {
      success: false,
      message: err?.message || "Lỗi hệ thống khi đăng nhập. Vui lòng thử lại.",
    };
  }
}

// 3.1. Đăng nhập nhanh Trải nghiệm Đội trưởng Mẫu (1-Chạm không cần mật khẩu)
export async function signInAsDemoCaptainAction() {
  try {
    const adminClient = getAdminClient();
    const demoPhone = "0988666888";
    const demoEmail = "fc.caugiay.captain@giaohuu.vn";
    const demoName = "Đội Trưởng FC Cầu Giấy";

    let { data: existingUser } = await adminClient
      .from("users")
      .select("id, full_name, phone")
      .eq("phone", demoPhone)
      .maybeSingle();

    let userId = existingUser?.id;

    if (!userId) {
      const { data: authUser } = await adminClient.auth.admin.createUser({
        email: demoEmail,
        password: "Demopassword123@",
        email_confirm: true,
        user_metadata: { full_name: demoName, phone: demoPhone },
      });

      if (authUser?.user?.id) {
        userId = authUser.user.id;
        await adminClient.from("users").upsert({
          id: userId,
          full_name: demoName,
          phone: demoPhone,
          is_phone_verified: true,
        });
      }
    }

    if (userId) {
      const { data: existingTeam } = await adminClient
        .from("teams")
        .select("id")
        .eq("captain_id", userId)
        .maybeSingle();

      if (!existingTeam) {
        await adminClient.from("teams").insert({
          captain_id: userId,
          team_name: "FC Cầu Giấy Phủi",
          captain_name: demoName,
          captain_phone: demoPhone,
          captain_zalo: demoPhone,
          jersey_color: "Xanh lá / Đen",
          avg_age: 26,
          skill_tier: 2,
          trust_score: 100,
          home_district: "CauGiay",
        });
      }

      const cookieStore = await cookies();
      cookieStore.set("bk7_user_id", userId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      revalidatePath("/");
      return { success: true, message: "Đăng nhập Đội trưởng Mẫu thành công!" };
    }

    return { success: false, message: "Không thể tạo tài khoản mẫu." };
  } catch (err: any) {
    console.error("[signInAsDemoCaptainAction Error]", err);
    return {
      success: false,
      message: err?.message || "Lỗi khi đăng nhập tài khoản mẫu.",
    };
  }
}

// 3.2. Kiểm tra xem Google OAuth có đang được bật trên Supabase Dashboard không
export async function checkGoogleOAuthStatusAction() {
  try {
    const rawUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://lkvrdfqyyigdsxtipfcy.supabase.co";
    const baseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
    const testUrl = `${baseUrl}/auth/v1/authorize?provider=google`;

    const res = await fetch(testUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.status === 400) {
      const data = await res.json().catch(() => null);
      if (
        data?.msg?.includes("not enabled") ||
        data?.error_code === "validation_failed"
      ) {
        return {
          enabled: false,
          message:
            "Google OAuth chưa được kích hoạt trên Supabase Dashboard (Cần cấu hình Client ID & Secret từ Google Cloud).",
        };
      }
    }

    return { enabled: true };
  } catch (err: any) {
    console.error("[checkGoogleOAuthStatusAction Error]", err);
    return { enabled: true };
  }
}

// 3.3. Đồng bộ Session OAuth từ Client sang Server Cookie (khi Google chuyển hướng về kèm token)
export async function syncClientSessionAction(
  accessToken: string,
  userId: string
) {
  try {
    const cookieStore = await cookies();
    if (accessToken) {
      cookieStore.set("bk7_access_token", accessToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    if (userId) {
      cookieStore.set("bk7_user_id", userId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("[syncClientSessionAction Error]", err);
    return { success: false };
  }
}

// 4. Đăng xuất
export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bk7_access_token");
  cookieStore.delete("bk7_user_id");
  revalidatePath("/");
  return { success: true };
}

// 5. ONBOARDING TẠO HỒ SƠ ĐỘI BÓNG (Wizard 3 bước + Ký cam kết Fair-play)
export async function createTeamOnboardingAction(formData: FormData) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: "Phiên làm việc hết hạn. Vui lòng đăng nhập lại.",
    };
  }

  const adminClient = getAdminClient();

  const { data: existingTeam } = await adminClient
    .from("teams")
    .select("id, team_name")
    .eq("captain_id", user.id)
    .maybeSingle();

  if (existingTeam) {
    return {
      success: false,
      message: `Bạn đã là Đội trưởng của đội "${existingTeam.team_name}". Không thể tạo thêm đội mới.`,
    };
  }

  const captainName = (formData.get("captainName") as string)?.trim();
  const rawPhone = (formData.get("phone") as string)?.trim();
  const phone = normalizeVietnamPhone(rawPhone || "");
  const jerseyColor =
    (formData.get("jerseyColor") as string)?.trim() || "Đỏ truyền thống";

  const teamName = (formData.get("teamName") as string)?.trim();
  const avgAge = parseInt(formData.get("avgAge") as string) || 28;
  const homeDistrict = (formData.get("homeDistrict") as string) || "CauGiay";
  const skillTier = parseInt(formData.get("skillTier") as string) || 2;
  const bankAccountNo =
    (formData.get("bankAccountNo") as string)?.trim() || "";
  const bankAccountName =
    (formData.get("bankAccountName") as string)?.trim() || "";
  const bankCode = (formData.get("bankCode") as string)?.trim() || "MB";

  if (!captainName || !phone || !teamName) {
    return {
      success: false,
      message:
        "Vui lòng nhập đầy đủ tên Đội trưởng, SĐT Zalo và Tên đội bóng.",
    };
  }

  // Kiểm tra trùng SĐT với đội khác
  const { data: phoneConflict } = await adminClient
    .from("users")
    .select("id, full_name")
    .eq("phone", phone)
    .neq("id", user.id)
    .maybeSingle();

  if (phoneConflict) {
    return {
      success: false,
      message: `Số điện thoại ${phone} đã thuộc về Đội trưởng ${phoneConflict.full_name}. Mỗi SĐT chỉ được đại diện 1 đội bóng!`,
    };
  }

  await adminClient.from("users").upsert({
    id: user.id,
    full_name: captainName,
    phone: phone,
    is_phone_verified: true,
  });

  const { data: newTeam, error: teamErr } = await adminClient
    .from("teams")
    .insert({
      captain_id: user.id,
      team_name: teamName,
      captain_name: captainName,
      captain_phone: phone,
      captain_zalo: phone,
      jersey_color: jerseyColor,
      avg_age: avgAge,
      skill_tier: skillTier,
      trust_score: 100,
      late_cancels_count: 0,
      clean_streak_count: 0,
      has_warning_badge: false,
      home_district: homeDistrict,
      bank_account_no: bankAccountNo,
      bank_account_name: bankAccountName,
      bank_code: bankCode,
    })
    .select()
    .single();

  if (teamErr || !newTeam) {
    return {
      success: false,
      message: "Lỗi khi tạo hồ sơ đội: " + teamErr?.message,
    };
  }

  const tierName =
    skillTier === 1
      ? "Tier 1: Dưỡng sinh (U32+)"
      : skillTier === 2
      ? "Tier 2: Phong trào"
      : "Tier 3: Phủi chiến";

  const alertText =
    `🎉 <b>CHÀO MỪNG ĐỘI BÓNG MỚI GIA NHẬP BẮTKÈO7!</b>\n` +
    `• Tên đội: <b>${teamName}</b> (${tierName})\n` +
    `• Đội trưởng: <b>${captainName}</b> (SĐT/Zalo: ${phone})\n` +
    `• Khu vực: ${
      homeDistrict === "CauGiay" ? "Quận Cầu Giấy" : "Quận Nam Từ Liêm"
    } • Tuổi TB: ${avgAge}t\n` +
    `• Điểm tín nhiệm ban đầu: <b>100/100 ★</b> (Đã ký cam kết Fair-play)\n` +
    `👉 Đội đã sẵn sàng phát kèo và bắt đối trên hệ thống!`;

  await sendTelegramAlert(alertText);

  revalidatePath("/");
  return {
    success: true,
    message: `Chúc mừng bạn đã tạo thành công đội ${teamName}!`,
    team: newTeam,
  };
}

// 6. Lưu kèo đấu thật vào bảng public.matches trên Supabase khi Đội trưởng tạo kèo
const matchCreationRateLimitMap = new Map<string, number[]>();

export async function createMatchInDatabaseAction(payload: {
  hostTeamId: string;
  pitchCustomName: string;
  district: string;
  timeSlotLabel: string;
  kickoffTimeIso?: string;
  expiresAtIso?: string;
  totalFee: number;
  splitFee: number;
  isSos: boolean;
  notes?: string;
  gmapsUrl?: string;
  isGmapsIntegrated?: boolean;
  pitchAddress?: string;
  botHoneypot?: string;
}) {
  try {
    // 1. Chống Bot (Mục 13): Nếu trường ẩn honeypot có dữ liệu, hủy yêu cầu ngay lập tức
    if (payload.botHoneypot && payload.botHoneypot.trim().length > 0) {
      console.warn("[Bot Protection Triggered] Honeypot field filled:", payload.botHoneypot);
      return { success: false, error: "Yêu cầu bị từ chối do phát hiện bot tự động." };
    }

    // 2. Giới hạn tần suất tạo kèo (Mục 12 - Rate Limiting): Tối đa 5 kèo/phút cho 1 đội
    const now = Date.now();
    const timestamps = matchCreationRateLimitMap.get(payload.hostTeamId) || [];
    const recent = timestamps.filter((t) => now - t < 60000);
    if (recent.length >= 5) {
      return {
        success: false,
        error: "Bạn đang thao tác quá nhanh. Vui lòng đợi 1 phút trước khi mở thêm kèo mới!",
      };
    }
    recent.push(now);
    matchCreationRateLimitMap.set(payload.hostTeamId, recent);

    const adminClient = getAdminClient();
    const parsedKickoff = payload.kickoffTimeIso
      ? new Date(payload.kickoffTimeIso)
      : null;
    const kickoffDate =
      parsedKickoff && !isNaN(parsedKickoff.getTime())
        ? parsedKickoff
        : new Date(Date.now() + 2 * 3600 * 1000);

    const parsedExpires = payload.expiresAtIso
      ? new Date(payload.expiresAtIso)
      : null;
    const expiresDate =
      parsedExpires && !isNaN(parsedExpires.getTime())
        ? parsedExpires
        : new Date(kickoffDate.getTime() + 15 * 60 * 1000);

    let hostTeamId = payload.hostTeamId;
    const isValidUuid =
      typeof hostTeamId === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        hostTeamId
      );

    if (!isValidUuid) {
      const { data: firstTeam } = await adminClient
        .from("teams")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (firstTeam?.id) {
        hostTeamId = firstTeam.id;
      } else {
        const { data: newTeam } = await adminClient
          .from("teams")
          .insert({
            team_name: "FC Cầu Giấy Phủi",
            captain_name: "Đội Trưởng Mẫu",
            captain_phone: "0988666888",
            captain_zalo: "0988666888",
            home_district: "CauGiay",
            skill_tier: 2,
            trust_score: 100,
          })
          .select("id")
          .single();
        if (newTeam?.id) {
          hostTeamId = newTeam.id;
        }
      }
    }

    const insertObj: Record<string, any> = {
      host_team_id: hostTeamId,
      pitch_custom_name: payload.pitchCustomName,
      district: payload.district || "Hà Nội",
      kickoff_time: kickoffDate.toISOString(),
      expires_at: expiresDate.toISOString(),
      time_slot_label: payload.timeSlotLabel,
      total_fee: payload.totalFee,
      split_fee: payload.splitFee,
      is_sos: payload.isSos,
      notes: payload.notes || "Giao lưu văn minh, đúng giờ",
      status: "open",
    };

    if (payload.pitchAddress) {
      insertObj.pitch_address = payload.pitchAddress;
    }

    if (payload.gmapsUrl) {
      insertObj.gmaps_url = payload.gmapsUrl;
      insertObj.is_gmaps_integrated = payload.isGmapsIntegrated ?? true;
    }

    let { data, error } = await adminClient
      .from("matches")
      .insert(insertObj)
      .select("*, teams:host_team_id(team_name, trust_score)")
      .single();

    // Fallback nếu CSDL chưa thêm cột gmaps, expires_at hoặc pitch_address hoặc lỗi host_team_id foreign key
    if (error && (error.message?.includes("gmaps") || error.message?.includes("expires") || error.message?.includes("pitch_address") || error.message?.includes("foreign key") || error.message?.includes("host_team_id"))) {
      if (error.message.includes("pitch_address")) {
        delete insertObj.pitch_address;
      }
      if (error.message.includes("gmaps")) {
        delete insertObj.gmaps_url;
        delete insertObj.is_gmaps_integrated;
      }
      if (error.message.includes("expires")) {
        delete insertObj.expires_at;
      }
      if (error.message.includes("foreign key") || error.message.includes("host_team_id")) {
        const { data: fallbackTeam } = await adminClient
          .from("teams")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (fallbackTeam?.id) {
          insertObj.host_team_id = fallbackTeam.id;
        } else {
          const { data: newTeam } = await adminClient
            .from("teams")
            .insert({
              team_name: "FC Cầu Giấy Phủi",
              captain_name: "Đội Trưởng Mẫu",
              captain_phone: "0988666888",
              captain_zalo: "0988666888",
              home_district: "CauGiay",
              skill_tier: 2,
              trust_score: 100,
            })
            .select("id")
            .single();
          if (newTeam?.id) {
            insertObj.host_team_id = newTeam.id;
          }
        }
      }
      const retry = await adminClient
        .from("matches")
        .insert(insertObj)
        .select("*, teams:host_team_id(team_name, trust_score)")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error("[createMatchInDatabaseAction Error]", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, match: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 7. Cập nhật hồ sơ Đội bóng chính chủ trên Supabase
export async function updateTeamProfileAction(payload: {
  teamId: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  captainZalo?: string;
  jerseyColor?: string;
  avgAge?: number;
  skillTier?: number;
  homeDistrict?: string;
}) {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("teams")
      .update({
        team_name: payload.teamName,
        captain_name: payload.captainName,
        captain_phone: payload.captainPhone,
        captain_zalo: payload.captainZalo || payload.captainPhone,
        jersey_color: payload.jerseyColor,
        avg_age: payload.avgAge,
        skill_tier: payload.skillTier,
        home_district: payload.homeDistrict,
      })
      .eq("id", payload.teamId)
      .select()
      .single();

    if (error) {
      console.error("[updateTeamProfileAction Error]", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true, team: data };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 8. Gửi yêu cầu rút tiền ký quỹ (Hoàn cọc) & Bắn thông báo Telegram khẩn cấp đến Admin
export async function requestWithdrawEscrowAction(payload: {
  amount: number;
  teamName: string;
  captainPhone: string;
  bankCode?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  customQrImage?: string;
}) {
  try {
    const bankIdentifier = payload.bankCode || payload.bankName || "MB";
    const vietQrLink = `https://img.vietqr.io/image/${encodeURIComponent(
      bankIdentifier
    )}-${encodeURIComponent(payload.accountNumber)}-compact2.png?amount=${
      payload.amount
    }&addInfo=${encodeURIComponent(
      `HOAN COC ${payload.teamName.slice(0, 15)}`
    )}&accountName=${encodeURIComponent(payload.accountName)}`;

    const alertText =
      `🚨 <b>YÊU CẦU HOÀN TIỀN KÝ QUỸ (RÚT TIỀN CỌC)</b>\n` +
      `• Đội bóng: <b>${payload.teamName}</b>\n` +
      `• Đội trưởng / SĐT: <b>${payload.captainPhone}</b>\n` +
      `• Số tiền cần hoàn: <b>${payload.amount.toLocaleString("vi-VN")} VNĐ</b>\n` +
      `--------------------------------\n` +
      `🏦 <b>THÔNG TIN TÀI KHOẢN NHẬN TIỀN:</b>\n` +
      `• Ngân hàng: <b>${payload.bankName}</b>\n` +
      `• Số tài khoản: <code>${payload.accountNumber}</code>\n` +
      `• Chủ tài khoản: <b>${payload.accountName}</b>\n` +
      `👉 <i>Admin mở app ngân hàng quét mã QR đính kèm để chuyển tiền hoàn cọc nhanh trong 5-15 phút.</i>`;

    // Gửi ảnh trực tiếp vào Telegram qua sendTelegramPhoto
    await sendTelegramPhoto(vietQrLink, alertText);

    // Lưu vào bảng withdraw_requests nếu database có bảng
    try {
      const adminClient = getAdminClient();
      await adminClient.from("withdraw_requests").insert({
        team_name: payload.teamName,
        captain_phone: payload.captainPhone,
        amount: payload.amount,
        bank_name: payload.bankName,
        account_number: payload.accountNumber,
        account_name: payload.accountName,
        status: "pending",
      });
    } catch (dbErr) {
      // Fallback an toàn nếu bảng chưa tạo
    }

    return { success: true };
  } catch (err: any) {
    console.error("[requestWithdrawEscrowAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function submitMatchAppealAction(payload: {
  appealId: string;
  matchId: string;
  teamId?: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  pitchName: string;
  district: string;
  timeSlot: string;
  penaltyPoints: number;
  reasonLabel: string;
  reasonDetail: string;
  managerVerifyPhone?: string;
}) {
  try {
    const alertText =
      `⚖️ <b>ĐƠN KHÁNG CÁO HỦY KÈO BẤT KHẢ KHÁNG (${payload.appealId})</b>\n` +
      `• Đội gửi kháng cáo: <b>${payload.teamName}</b>\n` +
      `• Đội trưởng: <b>${payload.captainName} (${payload.captainPhone})</b>\n` +
      `• Sân bóng: <b>${payload.pitchName} (${payload.district})</b>\n` +
      `• Khung giờ: <b>${payload.timeSlot}</b>\n` +
      `• Mức trừ điểm tạm tính: <b>-${payload.penaltyPoints} điểm Uy Tín</b>\n` +
      `--------------------------------\n` +
      `📌 <b>Lý do kháng cáo:</b> ${payload.reasonLabel}\n` +
      `📝 <b>Chi tiết sự cố:</b> <i>${payload.reasonDetail}</i>\n` +
      `📞 <b>SĐT Chủ sân / Đối chứng:</b> <code>${payload.managerVerifyPhone || "Không cung cấp"}</code>\n` +
      `👉 <i>Admin vui lòng vào Trung Tâm Quản Trị (/admin) để Duyệt Kháng Cáo (Khôi phục 100đ) hoặc Bác Bỏ!</i>`;

    await sendTelegramAlert(alertText);

    try {
      const adminClient = getAdminClient();
      await adminClient.from("match_appeals").insert({
        appeal_code: payload.appealId,
        match_id: payload.matchId,
        team_id: payload.teamId || null,
        team_name: payload.teamName,
        captain_name: payload.captainName,
        captain_phone: payload.captainPhone,
        pitch_name: payload.pitchName,
        district: payload.district,
        time_slot: payload.timeSlot,
        penalty_points: payload.penaltyPoints,
        reason_label: payload.reasonLabel,
        reason_detail: payload.reasonDetail,
        manager_verify_phone: payload.managerVerifyPhone || null,
        status: "PENDING",
      });
    } catch {
      // Fallback an toàn nếu bảng match_appeals chưa tạo trong Supabase
    }

    return { success: true };
  } catch (err: any) {
    console.error("[submitMatchAppealAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function resolveMatchAppealAction(payload: {
  appealId: string;
  teamId?: string;
  teamName: string;
  decision: "APPROVED" | "REJECTED";
  adminNote?: string;
}) {
  try {
    if (payload.decision === "APPROVED" && payload.teamId) {
      try {
        const adminClient = getAdminClient();
        await adminClient
          .from("teams")
          .update({ trust_score: 100 })
          .eq("id", payload.teamId);
      } catch {
        // Fallback nếu là team mock
      }
    }

    try {
      const adminClient = getAdminClient();
      await adminClient
        .from("match_appeals")
        .update({
          status: payload.decision,
          admin_note: payload.adminNote || null,
        })
        .eq("appeal_code", payload.appealId);
    } catch {
      // Fallback an toàn
    }

    const decisionText =
      payload.decision === "APPROVED"
        ? `✅ <b>ĐÃ DUYỆT KHÁNG CÁO (${payload.appealId})</b>\n• Đội bóng: <b>${payload.teamName}</b>\n• Kết quả: <b>Khôi phục 100 Điểm Uy Tín & Gỡ án phạt hủy kèo</b>`
        : `❌ <b>ĐÃ BÁC BỎ KHÁNG CÁO (${payload.appealId})</b>\n• Đội bóng: <b>${payload.teamName}</b>\n• Kết quả: <b>Giữ nguyên mức phạt trừ điểm Uy Tín</b>\n• Lý do từ BQT: <i>${payload.adminNote || "Không đủ căn cứ bất khả kháng"}</i>`;

    await sendTelegramAlert(decisionText);
    return { success: true };
  } catch (err: any) {
    console.error("[resolveMatchAppealAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

export async function sendEmergencyBroadcastAction(payload: {
  title: string;
  message: string;
  category: string;
}) {
  try {
    const broadcastAlert =
      `📢 <b>THÔNG BÁO KHẨN CẤP TỪ BQT BẮTKÈO7</b>\n` +
      `🏷️ <b>Chủ đề:</b> ${payload.title}\n` +
      `--------------------------------\n` +
      `${payload.message}\n` +
      `--------------------------------\n` +
      `🕒 <i>Phát sóng lúc: ${new Date().toLocaleString("vi-VN")}</i>`;

    await sendTelegramAlert(broadcastAlert);
    return { success: true };
  } catch (err: any) {
    console.error("[sendEmergencyBroadcastAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 9. Xóa hoặc Hủy Kèo Đấu Trực Tiếp Trong Database Supabase (Chống Tái Xuất Hiện Khi F5)
export async function deleteOrCancelMatchAction(matchId: string) {
  try {
    const adminClient = getAdminClient();

    // 1. Dọn dẹp bản ghi kháng cáo liên kết (nếu có) để tránh xung đột Foreign Key
    try {
      await adminClient.from("match_appeals").delete().eq("match_id", matchId);
    } catch {}

    // 2. Thử xóa hoàn toàn khỏi bảng matches
    const { error: delError } = await adminClient
      .from("matches")
      .delete()
      .eq("id", matchId);

    // 3. Nếu có lỗi ràng buộc khóa ngoại khác, cập nhật status = 'cancelled'
    if (delError) {
      console.warn("[deleteMatch] delete error, fallback update to cancelled:", delError.message);
      await adminClient
        .from("matches")
        .update({ status: "cancelled" })
        .eq("id", matchId);
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[deleteOrCancelMatchAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 10. Xóa tất cả các kèo test của một đội bóng
export async function deleteAllMatchesByHostTeamAction(hostTeamId: string) {
  try {
    const adminClient = getAdminClient();
    await adminClient
      .from("matches")
      .delete()
      .eq("host_team_id", hostTeamId);

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[deleteAllMatchesByHostTeamAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 11. Tự động quét và dọn dẹp các kèo quá 15 phút sau bóng lăn (Tầng 3 Server Action)
export async function cleanupExpiredMatchesServerAction() {
  try {
    const adminClient = getAdminClient();
    
    // Thử gọi RPC fn_auto_cleanup_expired_matches
    const { data: rpcData, error: rpcError } = await adminClient.rpc("fn_auto_cleanup_expired_matches");
    if (!rpcError && rpcData) {
      revalidatePath("/");
      return rpcData;
    }

    // Fallback: Quét trực tiếp bằng query
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: updated, error: updateErr } = await adminClient
      .from("matches")
      .update({
        status: "expired",
        notes: "[Tự động đóng bài đăng do quá giờ bóng lăn 15 phút chưa có đối]",
      })
      .eq("status", "open")
      .lte("kickoff_time", fifteenMinutesAgo)
      .select("id");

    if (updateErr) {
      return { success: false, error: updateErr.message };
    }

    revalidatePath("/");
    return {
      success: true,
      cleaned_count: updated?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error("[cleanupExpiredMatchesServerAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 12. Đội Khách Xin Rút Lui / Hủy Nhận Kèo Đột Xuất (Tự động mở lại slot hoặc nâng cấp thành SOS)
export async function guestWithdrawFromMatchAction(payload: {
  matchId: string;
  guestTeamName: string;
  captainPhone?: string;
  reasonCategory: string;
  reasonDetail: string;
  penaltyPoints: number;
  pitchName: string;
  timeSlot: string;
  isConvertedToSos: boolean;
  appealSubmitted?: boolean;
}) {
  try {
    const adminClient = getAdminClient();

    // 1. Cập nhật trận đấu trên Supabase: gỡ bỏ guest_team_id, reset status về 'open', kích hoạt is_sos nếu < 2h
    const updateObj: Record<string, any> = {
      guest_team_id: null,
      status: "open",
      is_sos: payload.isConvertedToSos,
    };
    await adminClient.from("matches").update(updateObj).eq("id", payload.matchId);

    // 2. Gửi cảnh báo khẩn cấp tới Telegram BQT
    const alertText =
      `⚠️ <b>ĐỘI KHÁCH XIN RÚT LUI KHỎI KÈO ĐẤU</b>\n` +
      `• Đội rút lui: <b>${payload.guestTeamName}</b> (${payload.captainPhone || "N/A"})\n` +
      `• Sân bóng: <b>${payload.pitchName}</b> (${payload.timeSlot})\n` +
      `• Mức trừ điểm áp dụng: <b>-${payload.penaltyPoints} Điểm Uy Tín</b>\n` +
      `• Lý do: <i>${payload.reasonDetail || payload.reasonCategory}</i>\n` +
      `• Trạng thái trận đấu: <b>${payload.isConvertedToSos ? "🚨 ĐÃ TỰ ĐỘNG KÍCH HOẠT KÈO SOS (< 2H)" : "⚽ ĐÃ TỰ ĐỘNG MỞ LẠI SLOT TÌM ĐỐI MỚI"}</b>\n` +
      (payload.appealSubmitted ? `👉 <i>Đội có gửi kèm Đơn Kháng Cáo Bất Khả Kháng lên BQT!</i>` : "");

    await sendTelegramAlert(alertText);

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[guestWithdrawFromMatchAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 13. Lấy toàn bộ danh sách trận đấu thực tế từ Supabase Database (Bypass RLS, bảo đảm không bị mất dữ liệu khi F5)
export async function getRealtimeMatchesFromDatabaseAction() {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("matches")
      .select(
        "*, teams:host_team_id(team_name, trust_score, skill_tier, has_warning_badge, captain_name, captain_phone, captain_zalo)"
      )
      .neq("status", "cancelled")
      .neq("status", "expired")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.warn("[getRealtimeMatchesFromDatabaseAction Warning]", error.message);
      return { success: false, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("[getRealtimeMatchesFromDatabaseAction Error]", err);
    return { success: false, data: [] };
  }
}

// 14. Khóa Kèo / Xác nhận bắt kèo lưu trạng thái kiên cố vào Supabase
export async function confirmMatchChallengeAction(payload: {
  matchId: string;
  guestTeamName: string;
  guestCaptainPhone: string;
  guestCaptainZalo?: string;
  guestTrustScore?: number;
}) {
  try {
    const adminClient = getAdminClient();

    const updateObj: Record<string, any> = {
      status: "matched",
      is_sos: false,
      notes: `[Đã bắt kèo bởi ${payload.guestTeamName} - ${payload.guestCaptainPhone}]`,
    };

    const { error } = await adminClient
      .from("matches")
      .update(updateObj)
      .eq("id", payload.matchId);

    if (error) {
      console.warn("[confirmMatchChallengeAction Error]", error.message);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[confirmMatchChallengeAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 15. Đội Chủ Kèo Gửi Yêu Cầu Xin Hủy Kèo (Cần Sự Chấp Thuận Của 2 Bên Khi Đã Có Đối)
export async function requestHostMatchCancelAction(payload: {
  matchId: string;
  hostTeamName: string;
  guestTeamName: string;
  hostPhone: string;
  guestPhone: string;
  pitchName: string;
  timeSlot: string;
  reasonCategory: string;
  reasonDetail: string;
  penaltyPoints: number;
  compensationAmountVnd: number;
}) {
  try {
    const adminClient = getAdminClient();

    const updateObj: Record<string, any> = {
      status: "cancel_requested",
      notes: `[Chủ nhà ${payload.hostTeamName} xin hủy kèo - Lý do: ${payload.reasonDetail}]`,
    };

    await adminClient.from("matches").update(updateObj).eq("id", payload.matchId);

    const alertText =
      `⚠️ <b>YÊU CẦU XIN HỦY KÈO TỪ CHỦ NHÀ (CHỜ ĐỐI XÁC NHẬN)</b>\n` +
      `• Chủ kèo xin hủy: <b>${payload.hostTeamName}</b> (${payload.hostPhone})\n` +
      `• Đội đối tác (Khách): <b>${payload.guestTeamName}</b> (${payload.guestPhone})\n` +
      `• Sân thi đấu: <b>${payload.pitchName}</b> (${payload.timeSlot})\n` +
      `• Mức phạt áp dụng nếu hủy: <b>-${payload.penaltyPoints} Điểm Uy Tín</b>\n` +
      (payload.compensationAmountVnd > 0
        ? `• Bồi thường dự kiến cho khách: <b>${payload.compensationAmountVnd.toLocaleString("vi-VN")} VNĐ</b>\n`
        : "") +
      `• Lý do: <i>${payload.reasonDetail || payload.reasonCategory}</i>\n` +
      `👉 <i>Hệ thống đã gửi thông báo xác nhận tới Đội khách để phê duyệt đồng thuận!</i>`;

    await sendTelegramAlert(alertText);
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[requestHostMatchCancelAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}

// 16. Phản Hồi Yêu Cầu Hủy Kèo (Đội Khách Phê Duyệt Đồng Ý Hoặc Từ Chối)
export async function respondMatchCancelRequestAction(payload: {
  matchId: string;
  decision: "ACCEPTED" | "REJECTED";
  guestTeamName: string;
  hostTeamName: string;
  penaltyPoints: number;
  compensationAmountVnd: number;
  rejectReason?: string;
}) {
  try {
    const adminClient = getAdminClient();

    if (payload.decision === "ACCEPTED") {
      // Hủy trận đấu hoàn toàn
      await adminClient
        .from("matches")
        .update({
          status: "cancelled",
          notes: `[Đã hủy đồng thuận giữa ${payload.hostTeamName} và ${payload.guestTeamName}]`,
        })
        .eq("id", payload.matchId);

      const alertText =
        `✅ <b>ĐÃ ĐỒNG THUẬN HỦY TRẬN ĐẤU</b>\n` +
        `• Đội khách <b>${payload.guestTeamName}</b> đã chấp thuận yêu cầu hủy từ <b>${payload.hostTeamName}</b>.\n` +
        `• Chế tài áp dụng: Chủ nhà bị trừ <b>-${payload.penaltyPoints} Điểm Uy Tín</b>` +
        (payload.compensationAmountVnd > 0
          ? ` và bồi thường <b>${payload.compensationAmountVnd.toLocaleString("vi-VN")}đ</b> cọc cho đội khách.`
          : ".");

      await sendTelegramAlert(alertText);
    } else {
      // Đội khách từ chối hủy -> Chuyển sang tranh chấp DISPUTED để BQT can thiệp
      await adminClient
        .from("matches")
        .update({
          status: "disputed",
          notes: `[Tranh chấp: Đội khách từ chối hủy kèo - ${payload.rejectReason || "Yêu cầu bồi thường theo luật"}]`,
        })
        .eq("id", payload.matchId);

      const alertText =
        `🚨 <b>TRANH CHẤP BÙNG KÈO: ĐỘI KHÁCH TỪ CHỐI CHO HỦY</b>\n` +
        `• Đội khách: <b>${payload.guestTeamName}</b> KHÔNG ĐỒNG Ý hủy kèo của <b>${payload.hostTeamName}</b>.\n` +
        `• Lý do từ chối: <i>${payload.rejectReason || "Đội khách đã chuẩn bị xong lực lượng, không chấp nhận hủy sát giờ"}</i>\n` +
        `👉 <i>Admin vui lòng vào /admin kiểm tra và xử lý trừng phạt tài khoản chủ sân theo quy định!</i>`;

      await sendTelegramAlert(alertText);
    }

    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("[respondMatchCancelRequestAction Error]", err);
    return { success: false, error: err?.message || "Unknown error" };
  }
}


