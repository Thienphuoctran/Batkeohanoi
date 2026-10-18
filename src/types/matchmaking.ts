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
  | "DISPUTED"
  | "EXPIRED";

export interface EscrowWallet {
  balance: number; // Số dư ví ký quỹ (VNĐ)
  lockedAmount: number; // Số tiền đang tạm khóa cọc cho trận đang đấu (200.000đ)
  availableBalance: number; // Số dư khả dụng
  isRestricted: boolean; // true nếu điểm uy tín < 70 và ví chưa đủ 200k
  canWithdraw: boolean; // true nếu điểm uy tín đã phục hồi >= 70 và có số dư
}

export type SplitCostRatio = "50_50" | "60_40" | "70_30" | "CUSTOM";

export interface MatchFeedItem {
  id: string;
  hostTeam: TeamProfile;
  guestTeam?: TeamProfile | null;
  district: District;
  pitchName: string;
  pitchAddress: string;
  matchDate: string; // Chuỗi hiển thị ngày (VD: "Ngày mai (19/10/2026)")
  matchDateIso?: string; // YYYY-MM-DD (VD: "2026-10-19")
  startTime: string; // HH:mm (VD: 19:00)
  endTime: string;   // HH:mm (VD: 20:30)
  totalCostVnd: number; // Tổng tiền sân (VD: 800.000đ)
  shareCostVnd: number; // Tiền đội khách (đối thủ) chịu
  hostCostVnd?: number; // Tiền đội chủ nhà chịu
  splitRatio?: SplitCostRatio; // Tỷ lệ chia: 50_50, 60_40, 70_30, CUSTOM
  splitRatioLabel?: string; // Nhãn hiển thị: "Chia 50/50", "Chủ 60% / Khách 40%", v.v.
  requiredTier: SkillTier;
  status: MatchStatus;
  isSOS: boolean; // Cờ kích hoạt kèo SOS (< 2 tiếng)
  sosCountdownSeconds?: number; // Số giây còn lại cho kèo SOS
  cancellationReason?: string;
  notes?: string;
  matchedAt?: string;
  createdAt: string;
  kickoffTime?: string; // Thời điểm bóng lăn chuẩn ISO (Ngày + Giờ)
  expiresAt?: string; // Thời điểm tự động đóng bài (kickoffTime + 15 phút)
  handshakePin?: string; // Mã Bắt Tay 4 Số ngẫu nhiên (chống vu khống bùng kèo 100%)
  isHandshakeVerified?: boolean; // Hai đội đã nhập mã bắt tay thật sự trên sân
  escrowDepositTeamId?: string; // Đội đã ký quỹ 200k nếu điểm uy tín < 70
  isCreatedByCurrentUser?: boolean; // Đánh dấu kèo của chính người dùng hiện tại
  isChallengedByCurrentUser?: boolean; // Đánh dấu người dùng hiện tại là bên nhận kèo
  creatorId?: string;
  gmapsUrl?: string; // Link vị trí sân trên Google Maps (chủ kèo ghim hoặc tự sinh)
  isGmapsIntegrated?: boolean; // Cờ tích hợp Google Maps
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

export type SoloPosition = "GK" | "DF" | "MF" | "FW";

export interface FreeAgentScoutCard {
  id: string;
  playerName: string; // VD: Tuấn "Cò"
  age: number; // VD: 27
  preferredFoot: "Chân phải" | "Chân trái" | "Hai chân";
  position: SoloPosition;
  positionLabel: string; // VD: "Thủ Môn (GK)", "Hậu Vệ (DF)", "Tiền Vệ (MF)", "Tiền Đạo (FW)"
  skillTier: SkillTier; // 1 | 2 | 3
  districts: string[]; // VD: ["Cầu Giấy", "Nam Từ Liêm"]
  availableDate?: string; // Ngày rảnh đi đá (VD: "Hôm nay (18/10/2026)" hoặc "Mọi ngày")
  availableDateIso?: string; // YYYY-MM-DD
  availableTimeSlots: string[]; // VD: ["19:00", "20:30"]
  feeContribution?: string; // Tùy chọn (trao đổi trực tiếp qua Zalo)
  trustRating: number; // VD: 4.9 (thang 5.0 ★)
  matchesJoined: number;
  futStats: {
    ovr: number;
    pac: number; // Thể lực / Tốc độ
    tec: number; // Kỹ thuật
    pas: number; // Chuyền bóng
    def: number; // Phòng ngự
    fpl: number; // Fair-play
  };
  phone: string;
  zaloPhone?: string;
  bio?: string;
  hasFirstTimerVoucher?: boolean;
  isCreatedByCurrentUser?: boolean;
  createdAt: string;
}

export interface SubPlayerPost {
  id: string;
  teamId: string;
  teamName: string;
  positionNeeded: "Thủ Môn (GK)" | "Trung Vệ (CB)" | "Tiền Vệ (MF)" | "Tiền Đạo (FW)";
  positionCode?: SoloPosition;
  quantity: number;
  matchDate?: string; // VD: "Ngày mai (19/10/2026)"
  matchDateIso?: string; // YYYY-MM-DD
  matchTime: string; // VD: "19:00 - 20:30"
  expiresAt?: string; // Thời điểm tự đóng tin tuyển người (kickoff + 15p)
  pitchName: string;
  district: District;
  skillTier?: SkillTier;
  shareCostDescription?: string; // Tùy chọn (trao đổi trực tiếp qua Zalo)
  contactPhone: string;
  contactZalo?: string;
  notes?: string;
  isCreatedByCurrentUser?: boolean;
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

export interface BankWithdrawInfo {
  bankCode?: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  customQrImage?: string;
  bank?: string;
  account?: string;
  name?: string;
}

export type AppealReasonCategory =
  | "WEATHER_FLOOD"
  | "FLOODLIGHT_OUTAGE"
  | "PITCH_DOUBLE_BOOKED"
  | "MEDICAL_EMERGENCY"
  | "MUTUAL_AGREEMENT"
  | "OTHER_FORCE_MAJEURE"
  | "WEATHER"
  | "PITCH_ISSUE"
  | "LACK_OF_PLAYERS"
  | "INJURY_ACCIDENT"
  | "BAD_WEATHER"
  | "URGENT_WORK"
  | "OTHER";

export interface MatchAppealItem {
  id: string;
  matchId: string;
  teamId?: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  pitchName: string;
  district: string;
  matchDate?: string;
  timeSlot?: string;
  matchTime?: string;
  penaltyPoints: number; // -25đ hoặc -40đ
  previousTrustScore: number;
  currentTrustScore: number;
  reasonCategory: AppealReasonCategory;
  reasonLabel?: string;
  reasonDetail: string;
  managerVerifyPhone?: string;
  proofContact?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface EscrowRecordItem {
  id: string;
  matchId?: string;
  teamId?: string;
  teamName: string;
  captainName?: string;
  captainPhone: string;
  amount: number;
  transferCode?: string;
  pitchName?: string;
  timeSlot?: string;
  type?: "DEPOSIT" | "WITHDRAW_REQUEST";
  status:
    | "PENDING_APPROVAL"
    | "PENDING_DEPOSIT"
    | "LOCKED_IN_MATCH"
    | "VERIFIED_HELD"
    | "WITHDRAW_REQUESTED"
    | "REFUNDED"
    | "FORFEITED"
    | "FORFEITED_TO_SOS_FUND";
  bankBin?: string;
  bankCode?: string;
  bankName?: string;
  bankShortName?: string;
  bankAccountNo?: string;
  accountNumber?: string;
  bankAccountName?: string;
  accountName?: string;
  qrImageUrl?: string;
  customQrImageUrl?: string;
  matchInfo?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

