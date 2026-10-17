import { NextResponse } from "next/server";
import { MatchService } from "@/services/matchService";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;
    const body = await request.json();

    if (!body.guestTeamName || !body.guestCaptainPhone) {
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_INFO",
          message: "Vui lòng nhập tên đội bóng và số điện thoại đội trưởng.",
        },
        { status: 400 }
      );
    }

    const result = await MatchService.challengeMatch({
      matchId,
      guestTeamName: body.guestTeamName,
      guestCaptainPhone: body.guestCaptainPhone,
      guestTrustScore: Number(body.guestTrustScore ?? 100),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "Lỗi hệ thống khi thực hiện khóa kèo.",
      },
      { status: 500 }
    );
  }
}
