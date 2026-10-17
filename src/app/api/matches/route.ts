import { NextResponse } from "next/server";
import { MatchService } from "@/services/matchService";
import { MatchFeedItem } from "@/types/matchmaking";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district") || undefined;
    const tier = searchParams.get("tier") ? Number(searchParams.get("tier")) : undefined;
    const timeSlot = searchParams.get("timeSlot") || undefined;
    const searchQuery = searchParams.get("q") || undefined;
    const isSosOnly = searchParams.get("sos") === "true";

    const matches = await MatchService.getMatches({
      district,
      tier,
      timeSlot,
      searchQuery,
      isSosOnly,
    });

    return NextResponse.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách kèo đấu." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.pitchName || !body.startTime || !body.hostTeam) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin bắt buộc (sân, giờ đá, đội chủ nhà)." },
        { status: 400 }
      );
    }

    const newMatch: MatchFeedItem = {
      id: body.id || `match-${Date.now()}`,
      hostTeam: body.hostTeam,
      district: body.district || "Cầu Giấy",
      pitchName: body.pitchName,
      pitchAddress: body.pitchAddress || "Hà Nội",
      matchDate: body.matchDate || "Hôm nay",
      startTime: body.startTime,
      endTime: body.endTime || "20:30",
      totalCostVnd: body.totalCostVnd || 850000,
      shareCostVnd: body.shareCostVnd || 425000,
      requiredTier: body.requiredTier || 2,
      status: "OPEN",
      isSOS: Boolean(body.isSOS),
      sosCountdownSeconds: body.isSOS ? 3600 : undefined,
      cancellationReason: body.cancellationReason,
      notes: body.notes || "",
      createdAt: "Vừa xong",
    };

    const saved = await MatchService.createMatch(newMatch);

    return NextResponse.json({
      success: true,
      message: "Đã tạo kèo đấu thành công và phát sóng lên hệ thống.",
      data: saved,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo kèo đấu mới." },
      { status: 500 }
    );
  }
}
