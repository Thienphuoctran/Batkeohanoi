import { NextResponse } from "next/server";
import { confirmMatchChallengeAction } from "@/actions/auth";

export const dynamic = "force-dynamic";

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

    const result = await confirmMatchChallengeAction({
      matchId,
      guestTeamName: body.guestTeamName,
      guestCaptainPhone: body.guestCaptainPhone,
      guestCaptainZalo: body.guestCaptainZalo,
      guestTrustScore: Number(body.guestTrustScore ?? 100),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      code: "LOCKED_SUCCESSFULLY",
      message: "Khóa kèo thành công và đã lưu vào CSDL!",
    });
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
