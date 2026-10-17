"use server";

import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export interface ReviewInput {
  matchId: string;
  reviewerTeamId: string;
  revieweeTeamId: string;
  punctualityScore: number; // 1-5 sao
  fairPlayScore: number; // 1-5 sao
  paymentScore: number; // 1-5 sao
  verifiedTier: number; // 1, 2, hoặc 3
  comment?: string;
}

export async function submitBlindReviewAction(input: ReviewInput) {
  const supabase = getAdminClient();

  // 1. Ghi nhận đánh giá của đội hiện tại (ẩn ban đầu)
  const { error: insertErr } = await supabase.from("blind_reviews").insert({
    match_id: input.matchId,
    reviewer_team_id: input.reviewerTeamId,
    reviewed_team_id: input.revieweeTeamId,
    punctuality_stars: input.punctualityScore,
    fairplay_stars: input.fairPlayScore,
    payment_stars: input.paymentScore,
    verified_tier:
      input.verifiedTier === 1
        ? "match"
        : input.verifiedTier === 2
        ? "match"
        : "higher",
    comment: input.comment,
    is_revealed: false,
  });

  if (insertErr) {
    return {
      success: false,
      message: "Không thể lưu đánh giá: " + insertErr.message,
    };
  }

  // 2. Kiểm tra xem đối thủ đã nộp đánh giá chưa
  const { data: peerReview } = await supabase
    .from("blind_reviews")
    .select("id, punctuality_stars, fairplay_stars, payment_stars")
    .eq("match_id", input.matchId)
    .eq("reviewer_team_id", input.revieweeTeamId)
    .single();

  let bothSubmitted = false;

  if (peerReview) {
    bothSubmitted = true;
    // Cả 2 đã nộp -> Mở khóa hiển thị công khai đánh giá
    await supabase
      .from("blind_reviews")
      .update({ is_revealed: true })
      .eq("match_id", input.matchId);

    // Kiểm tra nếu cả hai bên đều đánh giá 5 sao fair-play -> Gọi thủ tục cộng điểm & xóa nhãn
    if (input.fairPlayScore === 5 && peerReview.fairplay_stars === 5) {
      await supabase.rpc("fn_complete_clean_match", {
        p_team_id: input.reviewerTeamId,
      });
      await supabase.rpc("fn_complete_clean_match", {
        p_team_id: input.revieweeTeamId,
      });
    }
  }

  revalidatePath("/");
  return {
    success: true,
    bothSubmitted,
    message: bothSubmitted
      ? "Cả hai đội đã hoàn tất đánh giá! Kết quả đã được công khai và cộng điểm tín nhiệm."
      : "Đã lưu đánh giá kín. Kết quả sẽ tự động mở khi đối thủ hoàn tất nộp đánh giá của họ.",
  };
}
