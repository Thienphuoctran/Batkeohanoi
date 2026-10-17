import { MatchFeedItem } from "@/types/matchmaking";
import { MOCK_MATCH_FEEDS, MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { TelegramBotService } from "./telegramBotService";

export interface ChallengeRequestPayload {
  matchId: string;
  guestTeamName: string;
  guestCaptainPhone: string;
  guestTrustScore: number;
}

export interface ChallengeResponseResult {
  success: boolean;
  code: string;
  message: string;
  escrowRequired: boolean;
  escrowAmountVnd: number;
  match?: MatchFeedItem;
}

export class MatchService {
  private static inMemoryMatches: MatchFeedItem[] = [...MOCK_MATCH_FEEDS];

  public static async getMatches(filters?: {
    district?: string;
    tier?: number;
    timeSlot?: string;
    searchQuery?: string;
    isSosOnly?: boolean;
  }): Promise<MatchFeedItem[]> {
    let result = [...this.inMemoryMatches];

    if (filters?.isSosOnly) {
      result = result.filter((m) => m.isSOS && m.status !== "MATCHED");
    }

    if (filters?.district && filters.district !== "ALL") {
      result = result.filter((m) => m.district === filters.district);
    }

    if (filters?.tier && filters.tier !== 0) {
      result = result.filter((m) => m.requiredTier === filters.tier);
    }

    if (filters?.timeSlot && filters.timeSlot !== "ALL") {
      result = result.filter((m) => m.startTime.includes(filters.timeSlot!));
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.pitchName.toLowerCase().includes(q) ||
          m.hostTeam.name.toLowerCase().includes(q) ||
          m.hostTeam.captainName.toLowerCase().includes(q)
      );
    }

    return result;
  }

  /**
   * Khóa kèo nguyên tử (Atomic Lock Simulation / PostgreSQL Row Lock)
   */
  public static async challengeMatch(
    payload: ChallengeRequestPayload
  ): Promise<ChallengeResponseResult> {
    const targetIdx = this.inMemoryMatches.findIndex(
      (m) => m.id === payload.matchId
    );

    if (targetIdx === -1) {
      return {
        success: false,
        code: "MATCH_NOT_FOUND",
        message: "Không tìm thấy mã trận đấu trên hệ thống.",
        escrowRequired: false,
        escrowAmountVnd: 0,
      };
    }

    const currentMatch = this.inMemoryMatches[targetIdx];

    if (currentMatch.status !== "OPEN") {
      return {
        success: false,
        code: "ALREADY_MATCHED",
        message: "Rất tiếc! Kèo đấu này vừa có đội khác bắt trước trong tích tắc.",
        escrowRequired: false,
        escrowAmountVnd: 0,
      };
    }

    const escrowRequired = payload.guestTrustScore < 70;
    const escrowAmountVnd = escrowRequired ? 200000 : 0;

    // Cập nhật trạng thái khóa kèo
    const updatedMatch: MatchFeedItem = {
      ...currentMatch,
      status: "MATCHED",
      isSOS: false,
      guestTeam: {
        ...MOCK_TEAMS[0],
        name: payload.guestTeamName,
        shortName: payload.guestTeamName,
        captainPhone: payload.guestCaptainPhone,
        credit: {
          ...MOCK_TEAMS[0].credit,
          score: payload.guestTrustScore,
        },
      },
      matchedAt: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    this.inMemoryMatches[targetIdx] = updatedMatch;

    // Kích hoạt bắn tin Telegram Webhook
    await TelegramBotService.sendAlert({
      type: "MATCH_LOCKED",
      title: "Khóa kèo thành công",
      matchId: updatedMatch.id,
      teamName: updatedMatch.hostTeam.name,
      opponentName: payload.guestTeamName,
      pitchName: updatedMatch.pitchName,
      timeSlot: `${updatedMatch.startTime} (${updatedMatch.matchDate})`,
      district: updatedMatch.district,
      tierName: `Tier ${updatedMatch.requiredTier}`,
      phoneContact: payload.guestCaptainPhone,
    });

    return {
      success: true,
      code: "LOCKED_SUCCESSFULLY",
      message: "Khóa kèo thành công! Đã gửi thông báo tới đội trưởng hai bên.",
      escrowRequired,
      escrowAmountVnd,
      match: updatedMatch,
    };
  }

  public static async createMatch(
    newMatch: MatchFeedItem
  ): Promise<MatchFeedItem> {
    this.inMemoryMatches.unshift(newMatch);

    if (newMatch.isSOS) {
      await TelegramBotService.sendAlert({
        type: "SOS_BROADCAST",
        title: "Kèo Cứu Hộ SOS Khẩn Cấp",
        matchId: newMatch.id,
        teamName: newMatch.hostTeam.name,
        pitchName: newMatch.pitchName,
        timeSlot: `${newMatch.startTime} (${newMatch.matchDate})`,
        district: newMatch.district,
        tierName: `Tier ${newMatch.requiredTier}`,
        phoneContact: newMatch.hostTeam.captainPhone,
      });
    }

    return newMatch;
  }
}
