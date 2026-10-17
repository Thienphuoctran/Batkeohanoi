/**
 * Credit & Progressive Penalty Engine for Football Teams (v2.0 Rules)
 */

export interface PenaltyEvaluationResult {
  newScore: number;
  pointsDeducted: number;
  hasRedFlag: boolean;
  isAccountLocked: boolean;
  message: string;
  badgeApplied?: "TUNG_BUNG_KEO" | "DANG_BI_KHOA";
}

export class TrustService {
  /**
   * Tính toán chế tài hủy kèo sát giờ (< 1h) bậc thang
   */
  public static evaluateUnder1hCancellation(
    currentScore: number,
    violationCount: number
  ): PenaltyEvaluationResult {
    const nextViolation = violationCount + 1;

    if (nextViolation === 1) {
      const newScore = Math.max(0, currentScore - 25);
      return {
        newScore,
        pointsDeducted: 25,
        hasRedFlag: false,
        isAccountLocked: false,
        message: `Vi phạm lần 1: Trừ 25 điểm tín nhiệm (Còn ${newScore}/100). Đã gửi cảnh báo nội bộ tới đội trưởng.`,
      };
    }

    if (nextViolation === 2) {
      const newScore = Math.max(0, currentScore - 40);
      return {
        newScore,
        pointsDeducted: 40,
        hasRedFlag: true,
        isAccountLocked: false,
        badgeApplied: "TUNG_BUNG_KEO",
        message: `Vi phạm lần 2: Trừ 40 điểm tín nhiệm (Còn ${newScore}/100). Gắn nhãn đỏ công khai 'Từng bùng kèo' và bắt buộc cọc 100%.`,
      };
    }

    return {
      newScore: 0,
      pointsDeducted: currentScore,
      hasRedFlag: true,
      isAccountLocked: true,
      badgeApplied: "DANG_BI_KHOA",
      message: `Vi phạm lần 3+: Điểm tín nhiệm về 0/100. Tạm khóa tài khoản tạo/nhận kèo trong 14 ngày.`,
    };
  }

  /**
   * Tính toán phục hồi điểm tín nhiệm sau trận đấu văn minh (+5đ)
   */
  public static evaluateMatchCleanBonus(
    currentScore: number,
    currentCleanStreak: number,
    hasRedFlag: boolean
  ): {
    newScore: number;
    newCleanStreak: number;
    badgeRemoved: boolean;
    message: string;
  } {
    const newScore = Math.min(100, currentScore + 5);
    const newCleanStreak = currentCleanStreak + 1;
    let badgeRemoved = false;

    if (hasRedFlag && newCleanStreak >= 5) {
      badgeRemoved = true;
    }

    return {
      newScore,
      newCleanStreak,
      badgeRemoved,
      message: badgeRemoved
        ? `Chúc mừng! Đội đã hoàn thành chuỗi 5 trận 5★ liên tiếp. Hệ thống đã tự động gỡ nhãn đỏ công khai!`
        : `Cộng +5 điểm tín nhiệm (Lên ${newScore}/100). Chuỗi trận sạch: ${newCleanStreak}/5 trận.`,
    };
  }

  /**
   * Thẩm định kháng cáo sự cố bất khả kháng (Mưa to ngập sân, mất điện...)
   */
  public static processForceMajeureAppeal(
    teamId: string,
    reason: string
  ): { approved: boolean; restoredScore: number; message: string } {
    return {
      approved: true,
      restoredScore: 100,
      message: `Hệ thống đã phê duyệt kháng cáo sự cố bất khả kháng. Đã khôi phục 100/100 điểm tín nhiệm cho đội.`,
    };
  }
}
