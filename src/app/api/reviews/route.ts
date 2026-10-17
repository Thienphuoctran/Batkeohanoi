import { NextResponse } from "next/server";
import { TelegramBotService } from "@/services/telegramBotService";

interface StoredReview {
  id: string;
  matchId: string;
  reviewerTeam: string;
  targetTeam: string;
  ratingPunctual: number;
  ratingFairplay: number;
  ratingFinancial: number;
  votedTier: number;
  createdAt: string;
}

const inMemoryReviews: StoredReview[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.matchId || !body.reviewerTeam) {
      return NextResponse.json(
        { success: false, message: "Thiếu mã trận đấu hoặc tên đội đánh giá." },
        { status: 400 }
      );
    }

    const review: StoredReview = {
      id: `rev-${Date.now()}`,
      matchId: body.matchId,
      reviewerTeam: body.reviewerTeam,
      targetTeam: body.targetTeam || "Đối thủ",
      ratingPunctual: Number(body.ratingPunctual || 5),
      ratingFairplay: Number(body.ratingFairplay || 5),
      ratingFinancial: Number(body.ratingFinancial || 5),
      votedTier: Number(body.votedTier || 2),
      createdAt: new Date().toISOString(),
    };

    inMemoryReviews.push(review);

    // Kiểm tra xem cả 2 đội cùng trận đấu đã gửi đánh giá chưa
    const matchReviews = inMemoryReviews.filter((r) => r.matchId === body.matchId);
    const bothSubmitted = matchReviews.length >= 2;

    if (bothSubmitted) {
      await TelegramBotService.sendAlert({
        type: "REVIEW_UNLOCKED",
        title: "Đã mở khóa kết quả Đánh Giá Mù 2 Chiều",
        matchId: body.matchId,
        teamName: body.reviewerTeam,
        opponentName: body.targetTeam,
        pitchName: "Sân bóng",
        timeSlot: "Trận vừa đấu",
        district: "Hà Nội",
        tierName: `Tier ${body.votedTier}`,
        phoneContact: "Đã xác thực",
      });
    }

    return NextResponse.json({
      success: true,
      message: bothSubmitted
        ? "Cả hai đội đã hoàn thành! Hệ thống đã công khai kết quả đánh giá mù."
        : "Đã lưu đánh giá mù! Kết quả được bảo mật cho tới khi đối thủ cũng gửi đánh giá.",
      bothSubmitted,
      data: review,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi lưu đánh giá." },
      { status: 500 }
    );
  }
}
