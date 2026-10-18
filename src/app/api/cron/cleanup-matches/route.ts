import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * API Cron dọn dẹp tự động các kèo quá 15 phút sau bóng lăn (Tầng 3)
 * Được lập lịch gọi mỗi 1 phút thông qua Vercel Cron hoặc Supabase pg_cron
 */
export async function GET(request: Request) {
  // 1. Xác thực bảo mật nếu có CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = getAdminClient();

  // 2. Thử gọi RPC fn_auto_cleanup_expired_matches nếu đã nạp vào CSDL
  try {
    const { data, error } = await supabase.rpc("fn_auto_cleanup_expired_matches");
    if (!error && data) {
      return NextResponse.json(data);
    }
  } catch (rpcErr) {
    console.warn("RPC fn_auto_cleanup_expired_matches not found, executing direct query fallback:", rpcErr);
  }

  // 3. Fallback dọn dẹp trực tiếp qua Supabase Client nếu RPC chưa khởi tạo
  try {
    const nowIso = new Date().toISOString();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    const { data: updatedRows, error: updateError } = await supabase
      .from("matches")
      .update({
        status: "expired",
        notes: "[Tự động đóng bài đăng do quá giờ bóng lăn 15 phút chưa có đối]",
      })
      .eq("status", "open")
      .lte("kickoff_time", fifteenMinutesAgo)
      .select("id");

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cleaned_count: updatedRows?.length || 0,
      timestamp: nowIso,
      message: `Đã tự động đóng ${updatedRows?.length || 0} bài đăng quá giờ bóng lăn 15 phút.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
