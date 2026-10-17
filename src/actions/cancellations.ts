"use server";

import { getAdminClient } from "@/lib/supabase";
import { sendTelegramAlert } from "./telegram";
import { revalidatePath } from "next/cache";

export async function cancelMatchAction(
  matchId: string,
  cancellingTeamId: string,
  reason: string = "Hủy đột xuất"
) {
  const supabase = getAdminClient();

  // Gọi stored procedure tự động tính khoảng cách thời gian và trừ điểm
  const { data, error } = await supabase.rpc("fn_process_cancellation", {
    p_match_id: matchId,
    p_cancelling_team_id: cancellingTeamId,
  });

  if (error || !data?.success) {
    return {
      success: false,
      message: data?.message || "Lỗi xử lý hủy trận đấu.",
    };
  }

  // Bắn thông báo bot Telegram
  let botMessage = "";
  if (data.penalty_points === 0) {
    botMessage = `ℹ️ Đội <b>${data.team_name || "chủ nhà"}</b> đã hủy kèo trước > 4 tiếng (Hợp lệ, không trừ điểm). Trận đấu đã được mở lại cho đối thủ khác.`;
  } else if (data.penalty_points === 5) {
    botMessage = `⚠️ KÈO CẬN GIỜ: Đội <b>${data.team_name || "chủ nhà"}</b> hủy trước 1h–4h (-5 điểm tín nhiệm). Trận đấu được tự động chuyển sang tab KÈO CỨU HỘ PHÚT CHÓT (SOS)!`;
  } else {
    botMessage =
      `🚨 <b>CẢNH BÁO BÙNG KÈO SÁT GIỜ (< 1 TIẾNG)!</b>\n` +
      `• Đội vi phạm: <b>${data.team_name || "Đội bóng"}</b>\n` +
      `• Mức phạt: -${data.penalty_points} điểm (Tín nhiệm còn: ${data.new_trust_score}/100)\n` +
      `• Tình trạng nhãn: ${
        data.has_warning_badge
          ? "ĐÃ GẮN NHÃN CÔNG KHAI ⚠️ Từng bùng kèo"
          : "Nhắc nhở nội bộ lần 1"
      }\n` +
      `• Kèo đang được kích hoạt trợ giá SOS để tìm đối cứu viện khẩn cấp!`;
  }

  await sendTelegramAlert(botMessage);
  revalidatePath("/");
  return { success: true, message: data.message, data };
}
