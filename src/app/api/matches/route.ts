import { NextResponse } from "next/server";
import { getRealtimeMatchesFromDatabaseAction, createMatchInDatabaseAction } from "@/actions/auth";
import { mapDbMatchToFeedItem, MatchItem } from "@/hooks/useRealtimeMatches";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district = searchParams.get("district") || undefined;
    const tier = searchParams.get("tier") ? Number(searchParams.get("tier")) : undefined;
    const timeSlot = searchParams.get("timeSlot") || undefined;
    const searchQuery = searchParams.get("q")?.toLowerCase() || undefined;
    const isSosOnly = searchParams.get("sos") === "true";

    const dbRes = await getRealtimeMatchesFromDatabaseAction();
    if (!dbRes.success || !Array.isArray(dbRes.data)) {
      return NextResponse.json(
        { success: false, message: "Lỗi khi lấy danh sách kèo đấu từ CSDL." },
        { status: 500 }
      );
    }

    let matches = dbRes.data
      .filter((d: any) => d.status !== "cancelled" && d.status !== "expired")
      .map((d) => mapDbMatchToFeedItem(d as MatchItem));

    if (isSosOnly) {
      matches = matches.filter((m) => m.isSOS && m.status !== "MATCHED");
    }

    if (district && district !== "ALL") {
      matches = matches.filter((m) => m.district.toLowerCase().includes(district.toLowerCase()));
    }

    if (tier && tier !== 0) {
      matches = matches.filter((m) => m.requiredTier === tier);
    }

    if (timeSlot && timeSlot !== "ALL") {
      matches = matches.filter((m) => m.startTime.includes(timeSlot));
    }

    if (searchQuery) {
      matches = matches.filter(
        (m) =>
          m.pitchName.toLowerCase().includes(searchQuery) ||
          m.hostTeam.name.toLowerCase().includes(searchQuery) ||
          m.hostTeam.captainName.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách kèo đấu." },
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

    const hostTeamIdToSave = body.hostTeam?.id || "team-cg-01";
    const dbRes = await createMatchInDatabaseAction({
      hostTeamId: hostTeamIdToSave,
      hostTeamName: body.hostTeam?.name,
      captainName: body.hostTeam?.captainName,
      captainPhone: body.hostTeam?.captainPhone,
      captainZalo: body.hostTeam?.captainZalo,
      skillTier: body.requiredTier || 2,
      pitchCustomName: body.pitchName,
      district: body.district || "Cầu Giấy",
      timeSlotLabel: `${body.startTime} - ${body.endTime || "20:30"}`,
      kickoffTimeIso: body.kickoffTime,
      expiresAtIso: body.expiresAt,
      totalFee: body.totalCostVnd || 850000,
      splitFee: body.shareCostVnd || 425000,
      isSos: Boolean(body.isSOS),
      notes: body.notes,
      gmapsUrl: body.gmapsUrl,
      isGmapsIntegrated: body.isGmapsIntegrated,
      pitchAddress: body.pitchAddress,
    });

    if (!dbRes.success || !dbRes.match) {
      return NextResponse.json(
        { success: false, message: dbRes.error || "Không thể lưu kèo vào CSDL." },
        { status: 500 }
      );
    }

    const officialMatch = mapDbMatchToFeedItem(dbRes.match as MatchItem);

    return NextResponse.json({
      success: true,
      message: "Đã tạo kèo đấu thành công và lưu vào CSDL.",
      data: officialMatch,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo kèo đấu mới." },
      { status: 500 }
    );
  }
}
