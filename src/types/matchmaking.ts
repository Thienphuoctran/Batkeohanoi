// Hợp đồng dữ liệu chuẩn cho Nền tảng Ghép trận bóng đá sân 7 Toàn Hà Nội

export type District = string;

export type SkillTier = 1 | 2 | 3;

export interface SkillTierInfo {
  tier: SkillTier;
  name: string;
  tagline: string;
  badgeColor: string;
  description: string;
  criteria: string;
}

export type WarningBadgeType = "TUNG_BUNG_KEO" | "RUI_RO_CAO" | null;

export interface TeamCredit {
  score: number; // Mặc định 100 điểm
  warningBadge: WarningBadgeType;
  consecutiveCleanMatches: number; // Đếm số trận văn minh liên tiếp (đạt 5 trận xóa nhãn đỏ)
  isLocked: boolean;
  lockedUntil?: string;
  penaltiesCount: number; // Số lần vi phạm bùng kèo
}

export interface TeamProfile {
  id: string;
  name: string;
  shortName: string;
  captainName: string;
  captainPhone: string;
  captainZalo?: string;
  captainTelegramChatId?: string;
  district: District;
  homePitch?: string;
  skillTier: SkillTier;
  avgAge: number; // Độ tuổi trung bình
  memberCount: number;
  jerseyColor: string;
  credit: TeamCredit;
  ratingPunctual: number; // Điểm TB đúng giờ (1 - 5)
  ratingFairplay: number; // Điểm TB lối chơi (1 - 5)
  ratingFinancial: number; // Điểm TB tiền nong (1 - 5)
  totalMatches: number;
  bankInfo?: {
    bankBin: string; // Mã BIN ngân hàng (VD: 970422 - MBBank)
    bankName: string;
    accountNumber: string;
    accountOwner: string;
  };
}

export type MatchStatus =
  | "OPEN"
  | "MATCHED"
  | "SOS"
  | "PLAYING_VERIFIED"
  | "FINISHED"
  | "CANCELLED"
  | "DISPUTED";

export interface EscrowWallet {
  balance: number; // Số dư ví ký quỹ (VNĐ)
  lockedAmount: number; // Số tiền đang tạm khóa cọc cho trận đang đấu (200.000đ)
  availableBalance: number; // Số dư khả dụng
  isRestricted: boolean; // true nếu điểm uy tín < 70 và ví chưa đủ 200k
  canWithdraw: boolean; // true nếu điểm uy tín đã phục hồi >= 70 và có số dư
}

export interface MatchFeedItem {
  id: string;
  hostTeam: TeamProfile;
  guestTeam?: TeamProfile | null;
  district: District;
  pitchName: string;
  pitchAddress: string;
  matchDate: string; // YYYY-MM-DD hoặc định dạng ngày hiển thị
  startTime: string; // HH:mm (VD: 19:00)
  endTime: string;   // HH:mm (VD: 20:30)
  totalCostVnd: number; // Tổng tiền sân (VD: 800.000đ)
  shareCostVnd: number; // Tiền chia đôi mỗi đội (VD: 400.000đ)
  requiredTier: SkillTier;
  status: MatchStatus;
  isSOS: boolean; // Cờ kích hoạt kèo SOS (< 2 tiếng)
  sosCountdownSeconds?: number; // Số giây còn lại cho kèo SOS
  cancellationReason?: string;
  notes?: string;
  matchedAt?: string;
  createdAt: string;
  handshakePin?: string; // Mã Bắt Tay 4 Số ngẫu nhiên (chống vu khống bùng kèo 100%)
  isHandshakeVerified?: boolean; // Hai đội đã nhập mã bắt tay thật sự trên sân
  escrowDepositTeamId?: string; // Đội đã ký quỹ 200k nếu điểm uy tín < 70
}

export interface BlindReview {
  id: string;
  matchId: string;
  reviewerTeamId: string;
  targetTeamId: string;
  punctualRating: number;  // 1 - 5 sao
  fairplayRating: number;  // 1 - 5 sao
  financialRating: number; // 1 - 5 sao
  suggestedTier: SkillTier; // Vote lại Tier thực tế của đối thủ
  comment?: string;
  isRevealed: boolean; // Chỉ true khi cả 2 đã vote hoặc qua 24h
  createdAt: string;
}

export interface SubPlayerPost {
  id: string;
  teamId: string;
  teamName: string;
  positionNeeded: "Thủ Môn (GK)" | "Trung Vệ (CB)" | "Tiền Vệ (MF)" | "Tiền Đạo (FW)";
  quantity: number;
  matchTime: string; // VD: "19:00 - 20:30 Hôm nay"
  pitchName: string;
  district: District;
  shareCostDescription: string; // VD: "Miễn phí 100% cho GK", "Share 50k tiền nước"
  contactPhone: string;
  contactZalo?: string;
  status: "ACTIVE" | "FILLED";
  createdAt: string;
}

export interface RollCallMember {
  id: string;
  name: string;
  number?: number;
  status: "JOIN" | "BUSY" | "PENDING";
  hasPaid: boolean;
  updatedAt: string;
}

export interface RollCallSession {
  id: string;
  matchId: string;
  teamId: string;
  pitchName: string;
  matchTime: string;
  members: RollCallMember[];
  sharePerPlayerVnd?: number;
}
