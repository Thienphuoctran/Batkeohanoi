import { TeamProfile, MatchFeedItem, SubPlayerPost, RollCallSession } from "../types/matchmaking";

export const MOCK_TEAMS: TeamProfile[] = [
  {
    id: "team-cg-01",
    name: "FC Dưỡng Sinh Duy Tân",
    shortName: "Duy Tân FC",
    captainName: "Anh Tuấn (Cap)",
    captainPhone: "0982.345.678",
    captainZalo: "0982345678",
    district: "Cầu Giấy",
    homePitch: "Sân Trung Kính Hạ",
    skillTier: 1,
    avgAge: 34,
    memberCount: 16,
    jerseyColor: "#0284c7",
    credit: {
      score: 100,
      warningBadge: null,
      consecutiveCleanMatches: 12,
      isLocked: false,
      penaltiesCount: 0,
    },
    ratingPunctual: 4.9,
    ratingFairplay: 5.0,
    ratingFinancial: 5.0,
    totalMatches: 24,
    bankInfo: {
      bankBin: "970422",
      bankName: "MBBank",
      accountNumber: "098234567899",
      accountOwner: "NGUYEN ANH TUAN",
    },
  },
  {
    id: "team-cg-02",
    name: "FC Sinh Viên Giao Thông",
    shortName: "UTC FC",
    captainName: "Quang Hùng",
    captainPhone: "0912.888.999",
    captainZalo: "0912888999",
    district: "Cầu Giấy",
    homePitch: "Sân Thành Phát",
    skillTier: 2,
    avgAge: 22,
    memberCount: 18,
    jerseyColor: "#16a34a",
    credit: {
      score: 95,
      warningBadge: null,
      consecutiveCleanMatches: 8,
      isLocked: false,
      penaltiesCount: 0,
    },
    ratingPunctual: 4.7,
    ratingFairplay: 4.8,
    ratingFinancial: 4.9,
    totalMatches: 31,
    bankInfo: {
      bankBin: "970436",
      bankName: "Vietcombank",
      accountNumber: "1028392819",
      accountOwner: "HOANG QUANG HUNG",
    },
  },
  {
    id: "team-ntl-01",
    name: "FC Phủi 36 Mễ Trì",
    shortName: "Phủi 36",
    captainName: "Thành Đạt",
    captainPhone: "0977.111.222",
    captainZalo: "0977111222",
    district: "Nam Từ Liêm",
    homePitch: "Sân Mễ Trì Hạ",
    skillTier: 3,
    avgAge: 26,
    memberCount: 20,
    jerseyColor: "#ea580c",
    credit: {
      score: 100,
      warningBadge: null,
      consecutiveCleanMatches: 15,
      isLocked: false,
      penaltiesCount: 0,
    },
    ratingPunctual: 5.0,
    ratingFairplay: 4.6,
    ratingFinancial: 5.0,
    totalMatches: 45,
    bankInfo: {
      bankBin: "970415",
      bankName: "VietinBank",
      accountNumber: "10982736451",
      accountOwner: "TRAN THANH DAT",
    },
  },
  {
    id: "team-cg-warn",
    name: "FC Cựu Binh Cầu Giấy",
    shortName: "Cựu Binh CG",
    captainName: "Đức Thắng",
    captainPhone: "0904.555.666",
    district: "Cầu Giấy",
    homePitch: "Sân D30 Bộ Công An",
    skillTier: 2,
    avgAge: 29,
    memberCount: 14,
    jerseyColor: "#dc2626",
    credit: {
      score: 35,
      warningBadge: "TUNG_BUNG_KEO",
      consecutiveCleanMatches: 2,
      isLocked: false,
      penaltiesCount: 2,
    },
    ratingPunctual: 3.2,
    ratingFairplay: 4.5,
    ratingFinancial: 4.0,
    totalMatches: 18,
  },
];

export const MOCK_MATCH_FEEDS: MatchFeedItem[] = [
  {
    id: "feed-1",
    hostTeam: MOCK_TEAMS[0],
    district: "Cầu Giấy",
    pitchName: "Sân Bóng Đá Trung Kính Hạ",
    pitchAddress: "Ngõ 112 Trung Kính, Cầu Giấy, Hà Nội",
    matchDate: "Hôm nay",
    startTime: "19:00",
    endTime: "20:30",
    totalCostVnd: 800000,
    shareCostVnd: 400000,
    splitRatio: "50_50",
    splitRatioLabel: "50/50",
    requiredTier: 2,
    status: "OPEN",
    isSOS: false,
    notes: "Đội anh em văn phòng, đá văn minh không cay cú. Giao lưu vui vẻ sau giờ làm.",
    createdAt: "10 phút trước",
    handshakePin: "7829",
    isHandshakeVerified: false,
  },
  {
    id: "feed-2",
    hostTeam: MOCK_TEAMS[1],
    district: "Nam Từ Liêm",
    pitchName: "Sân Bóng Mễ Trì Hạ",
    pitchAddress: "Đường Mễ Trì Hạ, Nam Từ Liêm, Hà Nội",
    matchDate: "Hôm nay",
    startTime: "19:30",
    endTime: "21:00",
    totalCostVnd: 900000,
    shareCostVnd: 270000,
    splitRatio: "70_30",
    splitRatioLabel: "70/30",
    requiredTier: 3,
    status: "OPEN",
    isSOS: false,
    notes: "Kèo chia 70/30, tìm đối đá đều chân nhiệt tình, sân cỏ đẹp.",
    createdAt: "25 phút trước",
    handshakePin: "4512",
    isHandshakeVerified: false,
  },
];

export const MOCK_SUB_PLAYERS: SubPlayerPost[] = [];

export const MOCK_ROLL_CALL: RollCallSession = {
  id: "rc-session-empty",
  matchId: "",
  teamId: "",
  pitchName: "",
  matchTime: "",
  sharePerPlayerVnd: 0,
  members: [],
};

// Hàm tiện ích sinh link ảnh mã VietQR Napas247 tức thì
export function generateVietQRQuickUrl(params: {
  bankBin: string;
  accountNumber: string;
  accountName?: string;
  amount: number;
  description: string;
}): string {
  const cleanAccount = params.accountNumber.trim();
  const encodedDesc = encodeURIComponent(params.description.trim());
  return `https://img.vietqr.io/image/${params.bankBin}-${cleanAccount}-compact2.png?amount=${params.amount}&addInfo=${encodedDesc}&accountName=${encodeURIComponent(params.accountName || "")}`;
}
