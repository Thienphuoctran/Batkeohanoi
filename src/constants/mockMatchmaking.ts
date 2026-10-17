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
  // 1. KÈO SOS KHẨN CẤP (<2h, Viền đỏ phát sáng, ưu tiên cứu hộ)
  {
    id: "match-sos-01",
    hostTeam: MOCK_TEAMS[1], // UTC FC
    district: "Cầu Giấy",
    pitchName: "Sân Bóng Đá Thành Phát (Sân 3)",
    pitchAddress: "Số 2 Hoàng Minh Giám, Cầu Giấy, Hà Nội",
    matchDate: "Hôm nay",
    startTime: "19:00",
    endTime: "20:30",
    totalCostVnd: 900000,
    shareCostVnd: 450000,
    requiredTier: 2,
    status: "SOS",
    isSOS: true,
    sosCountdownSeconds: 3240, // ~54 phút
    cancellationReason: "Đối thủ hủy gấp trước 1h vì bận họp đột xuất",
    notes: "Đội đã có mặt sớm, bóng nước đầy đủ, cần đối đá văn minh, giao lưu bia cỏ sau trận!",
    createdAt: "Vừa xong",
  },

  // 2. KÈO DƯỠNG SINH TIER 1 - CẦU GIẤY
  {
    id: "match-feed-02",
    hostTeam: MOCK_TEAMS[0], // FC Duy Tân
    district: "Cầu Giấy",
    pitchName: "Sân Bóng Đá Trung Kính Hạ (Sân 1)",
    pitchAddress: "Ngõ 29 Mạc Thái Tổ, Yên Hòa, Cầu Giấy",
    matchDate: "Hôm nay",
    startTime: "20:30",
    endTime: "22:00",
    totalCostVnd: 850000,
    shareCostVnd: 425000,
    requiredTier: 1,
    status: "OPEN",
    isSOS: false,
    notes: "Kèo dưỡng sinh anh em IT văn phòng 3x tuổi, đá rèn sức khỏe, tuyệt đối cấm xoạc bóng!",
    createdAt: "15 phút trước",
  },

  // 3. KÈO PHỦI CHIẾN TIER 3 - NAM TỪ LIÊM
  {
    id: "match-feed-03",
    hostTeam: MOCK_TEAMS[2], // FC Phủi 36
    district: "Nam Từ Liêm",
    pitchName: "Sân Bóng Đá Mễ Trì Hạ (Sân VIP)",
    pitchAddress: "Đường Mễ Trì Hạ, Nam Từ Liêm (Gần The Garden)",
    matchDate: "Hôm nay",
    startTime: "19:30",
    endTime: "21:00",
    totalCostVnd: 800000,
    shareCostVnd: 400000,
    requiredTier: 3,
    status: "OPEN",
    isSOS: false,
    notes: "Đội tập luyện chuẩn bị đá giải quận, cần đối cứng thể lực tốt, đá nhanh pressing cao.",
    createdAt: "30 phút trước",
  },

  // 4. KÈO PHONG TRÀO TIER 2 - NAM TỪ LIÊM
  {
    id: "match-feed-04",
    hostTeam: {
      ...MOCK_TEAMS[1],
      id: "team-ntl-sub",
      name: "FC Thanh Niên Phú Đô",
      shortName: "Phú Đô FC",
      district: "Nam Từ Liêm",
    },
    district: "Nam Từ Liêm",
    pitchName: "Sân Bóng Mỹ Đình Pearl Sports",
    pitchAddress: "Số 1 Châu Văn Liêm, Nam Từ Liêm",
    matchDate: "Ngày mai",
    startTime: "17:30",
    endTime: "19:00",
    totalCostVnd: 950000,
    shareCostVnd: 475000,
    requiredTier: 2,
    status: "OPEN",
    isSOS: false,
    notes: "Đá cống hiến giờ sớm sau giờ làm, sân cỏ đẹp chuẩn quốc tế.",
    createdAt: "1 giờ trước",
  },

  // 5. KÈO ĐÃ KHỚP (MATCHED)
  {
    id: "match-feed-05",
    hostTeam: MOCK_TEAMS[0],
    guestTeam: MOCK_TEAMS[1],
    district: "Cầu Giấy",
    pitchName: "Sân Bóng D30 Tôn Thất Thuyết",
    pitchAddress: "Số 1 Tôn Thất Thuyết, Cầu Giấy",
    matchDate: "Hôm qua",
    startTime: "19:00",
    endTime: "20:30",
    totalCostVnd: 800000,
    shareCostVnd: 400000,
    requiredTier: 1,
    status: "MATCHED",
    isSOS: false,
    matchedAt: "18:20",
    createdAt: "2 giờ trước",
  },
];

export const MOCK_SUB_PLAYERS: SubPlayerPost[] = [
  {
    id: "sub-01",
    teamId: "team-cg-01",
    teamName: "FC Dưỡng Sinh Duy Tân",
    positionNeeded: "Thủ Môn (GK)",
    quantity: 1,
    matchTime: "19:00 - 20:30 Hôm nay",
    pitchName: "Sân Trung Kính Hạ (Cầu Giấy)",
    district: "Cầu Giấy",
    shareCostDescription: "Miễn phí 100% tiền sân + Mời nước tăng lực",
    contactPhone: "0982.345.678",
    contactZalo: "0982345678",
    status: "ACTIVE",
    createdAt: "10 phút trước",
  },
  {
    id: "sub-02",
    teamId: "team-ntl-01",
    teamName: "FC Phủi 36 Mễ Trì",
    positionNeeded: "Trung Vệ (CB)",
    quantity: 1,
    matchTime: "19:30 - 21:00 Hôm nay",
    pitchName: "Sân Mễ Trì Hạ (Nam Từ Liêm)",
    district: "Nam Từ Liêm",
    shareCostDescription: "Hỗ trợ share nhẹ 40k, anh em hòa đồng vui vẻ",
    contactPhone: "0977.111.222",
    contactZalo: "0977111222",
    status: "ACTIVE",
    createdAt: "25 phút trước",
  },
];

export const MOCK_ROLL_CALL: RollCallSession = {
  id: "rc-session-01",
  matchId: "match-sos-01",
  teamId: "team-cg-02",
  pitchName: "Sân Thành Phát (Cầu Giấy)",
  matchTime: "19:00 - 20:30 Hôm nay",
  sharePerPlayerVnd: 45000,
  members: [
    { id: "m1", name: "Quang Hùng (Cap)", number: 10, status: "JOIN", hasPaid: true, updatedAt: "15:30" },
    { id: "m2", name: "Minh Đức", number: 7, status: "JOIN", hasPaid: true, updatedAt: "15:45" },
    { id: "m3", name: "Văn Hậu", number: 5, status: "JOIN", hasPaid: false, updatedAt: "16:10" },
    { id: "m4", name: "Hoàng Long", number: 9, status: "JOIN", hasPaid: true, updatedAt: "16:20" },
    { id: "m5", name: "Đình Trọng", number: 21, status: "JOIN", hasPaid: false, updatedAt: "16:30" },
    { id: "m6", name: "Tuấn Hải", number: 18, status: "JOIN", hasPaid: false, updatedAt: "16:45" },
    { id: "m7", name: "Văn Lâm (GK)", number: 1, status: "JOIN", hasPaid: true, updatedAt: "17:00" },
    { id: "m8", name: "Tiến Dũng", number: 4, status: "JOIN", hasPaid: false, updatedAt: "17:15" },
    { id: "m9", name: "Công Phượng", number: 11, status: "BUSY", hasPaid: false, updatedAt: "16:00" },
    { id: "m10", name: "Xuân Trường", number: 6, status: "PENDING", hasPaid: false, updatedAt: "Chưa phản hồi" },
  ],
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
