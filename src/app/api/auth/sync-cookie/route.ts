import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const accessToken = body?.accessToken;
    let userId = body?.userId;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Missing access token" },
        { status: 400 }
      );
    }

    // Tự động giải mã userId từ JWT nếu client chưa truyền
    if (!userId && accessToken) {
      try {
        const payloadBase64 = accessToken.split(".")[1];
        if (payloadBase64) {
          const payload = JSON.parse(
            Buffer.from(payloadBase64, "base64").toString("utf-8")
          );
          userId = payload.sub || payload.id;
        }
      } catch (e) {
        console.error("[Sync Cookie] Cannot decode token payload", e);
      }
    }

    const cookieStore = await cookies();
    cookieStore.set("bk7_access_token", accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
    });

    if (userId) {
      cookieStore.set("bk7_user_id", userId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      });

      // Tự động kiểm tra và khởi tạo hồ sơ public.users nếu là tài khoản mới từ Google
      try {
        const adminClient = getAdminClient();
        const { data: existingUser } = await adminClient
          .from("users")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        if (!existingUser) {
          const { data: authData } = await adminClient.auth.admin.getUserById(userId);
          const authUser = authData?.user;
          if (authUser) {
            const fullName =
              authUser.user_metadata?.full_name ||
              authUser.user_metadata?.name ||
              authUser.email?.split("@")[0] ||
              "Đội Trưởng Mới";
            const avatarUrl =
              authUser.user_metadata?.avatar_url ||
              authUser.user_metadata?.picture ||
              null;

            await adminClient.from("users").upsert({
              id: userId,
              full_name: fullName,
              avatar_url: avatarUrl,
              phone: authUser.phone || null,
            });
          }
        }
      } catch (dbErr) {
        console.error("[Sync Cookie] Auto-create user profile warning:", dbErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[POST /api/auth/sync-cookie Error]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}
