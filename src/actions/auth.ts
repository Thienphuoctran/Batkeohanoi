"use server";

import { getAdminClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendTelegramAlert } from "./telegram";
import { normalizeVietnamPhone, isValidVietnamPhone } from "@/lib/zalo";

function getAnonAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("bk7_access_token")?.value;
  const fallbackUserId = cookieStore.get("bk7_user_id")?.value;
  const adminClient = getAdminClient();

  if (accessToken) {
    const { data, error } = await adminClient.auth.getUser(accessToken);
    if (!error && data.user) {
      return data.user;
    }
  }

  if (fallbackUserId) {
    const { data, error } = await adminClient.auth.admin.getUserById(
      fallbackUserId
    );
    if (!error && data.user) {
      return data.user;
    }
  }

  return null;
}

// 1. Lấy thông tin User hiện tại & Đội bóng họ đang làm Đội trưởng
export async function getCurrentUserAndTeamAction() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { user: null, team: null, profile: null };
    }

    const adminClient = getAdminClient();

    const { data: profile } = await adminClient
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

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
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
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

  if (createError || !createdAuth.user) {
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
  if (signInData.session) {
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
}

// 3. Đăng nhập bằng Email (hoặc Số điện thoại) & Mật khẩu
export async function signInWithEmailAction(formData: FormData) {
  let identifier = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

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
    }
  }

  const anonClient = getAnonAuthClient();
  const { data, error } = await anonClient.auth.signInWithPassword({
    email: identifier,
    password,
  });

  if (error || !data.user) {
    return {
      success: false,
      message: "Sai thông tin Email/SĐT hoặc mật khẩu đăng nhập.",
    };
  }

  const cookieStore = await cookies();
  if (data.session) {
    cookieStore.set("bk7_access_token", data.session.access_token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  cookieStore.set("bk7_user_id", data.user.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/");
  return { success: true, message: "Đăng nhập thành công!" };
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
export async function createMatchInDatabaseAction(payload: {
  hostTeamId: string;
  pitchCustomName: string;
  district: string;
  timeSlotLabel: string;
  totalFee: number;
  splitFee: number;
  isSos: boolean;
  notes?: string;
}) {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from("matches")
      .insert({
        host_team_id: payload.hostTeamId,
        pitch_custom_name: payload.pitchCustomName,
        district: payload.district || "Hà Nội",
        kickoff_time: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        time_slot_label: payload.timeSlotLabel,
        total_fee: payload.totalFee,
        split_fee: payload.splitFee,
        is_sos: payload.isSos,
        notes: payload.notes || "Giao lưu văn minh, đúng giờ",
        status: "open",
      })
      .select("*, teams:host_team_id(team_name, trust_score)")
      .single();

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

