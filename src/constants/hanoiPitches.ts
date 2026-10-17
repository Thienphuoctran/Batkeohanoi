import { District, SkillTierInfo } from "../types/matchmaking";

export interface PitchLocation {
  id: string;
  name: string;
  shortName: string;
  district: District;
  address: string;
  totalFields: number; // Số lượng sân 7
  surfaceQuality: "Cỏ nhân tạo hạt cao su chuẩn" | "Cỏ nhân tạo sợi đúc mới" | "Cỏ tiêu chuẩn phong trào";
  hasLighting: boolean;
  hasParking: boolean;
  typicalPeakPriceVnd: number; // Giá khung giờ 19h00 - 20h30
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const SKILL_TIERS_CONFIG: Record<1 | 2 | 3, SkillTierInfo> = {
  1: {
    tier: 1,
    name: "Dưỡng sinh (Gentle)",
    tagline: "Văn phòng, rèn sức khỏe, cấm va chạm",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    description: "Độ tuổi trung bình ≥ 32 tuổi, dân văn phòng công sở, đá rèn thể lực sau giờ làm việc. Cấm tuyệt đối xoạc bóng, va chạm mạnh hoặc vào bóng từ phía sau.",
    criteria: "Tuổi TB ≥ 32 | Không va chạm | Tốc độ vừa phải",
  },
  2: {
    tier: 2,
    name: "Phong trào (Standard)",
    tagline: "Thanh niên trẻ, kỹ thuật tốt, fair-play",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Sinh viên, thanh niên trẻ, kỹ thuật và thể lực ổn định. Tranh chấp chừng mực, ưu tiên lối đá cống hiến, fair-play và tôn trọng đối thủ.",
    criteria: "Tuổi 18-35 | Tranh chấp chừng mực | Ưu tiên cống hiến",
  },
  3: {
    tier: 3,
    name: "Phủi chiến (Competitive)",
    tagline: "Tập luyện bài bản, thể lực bền, đối kháng cao",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description: "Đội bóng tập luyện bài bản, thể lực dồi dào, pressing và tranh chấp quyết liệt. Thi đấu tốc độ cao, giàu tính chiến thuật và va chạm đối kháng mạnh mẽ.",
    criteria: "Thể lực cao | Tranh chấp rát | Tốc độ trận đấu cao",
  },
};

export const HANOI_PITCHES: PitchLocation[] = [
  // --- QUẬN CẦU GIẤY ---
  {
    id: "pitch-cg-01",
    name: "Sân Bóng Đá Trung Kính Hạ",
    shortName: "Trung Kính Hạ",
    district: "Cầu Giấy",
    address: "Ngõ 29 Mạc Thái Tổ, Phường Yên Hòa, Cầu Giấy, Hà Nội",
    totalFields: 6,
    surfaceQuality: "Cỏ nhân tạo hạt cao su chuẩn",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 850000,
    coordinates: { lat: 21.0185, lng: 105.7915 },
  },
  {
    id: "pitch-cg-02",
    name: "Sân Bóng Đá Thành Phát",
    shortName: "Thành Phát",
    district: "Cầu Giấy",
    address: "Số 2 Hoàng Minh Giám, Phường Trung Hòa, Cầu Giấy, Hà Nội",
    totalFields: 8,
    surfaceQuality: "Cỏ nhân tạo sợi đúc mới",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 900000,
    coordinates: { lat: 21.0068, lng: 105.7989 },
  },
  {
    id: "pitch-cg-03",
    name: "Sân Bóng Đá D30 Bộ Công An",
    shortName: "D30 Tôn Thất Thuyết",
    district: "Cầu Giấy",
    address: "Số 1 Tôn Thất Thuyết, Phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội",
    totalFields: 4,
    surfaceQuality: "Cỏ tiêu chuẩn phong trào",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 800000,
    coordinates: { lat: 21.0289, lng: 105.7834 },
  },
  {
    id: "pitch-cg-04",
    name: "Sân Bóng Đá Yên Hòa Mini Arena",
    shortName: "Yên Hòa",
    district: "Cầu Giấy",
    address: "Ngõ 259 Phố Yên Hòa, Cầu Giấy, Hà Nội",
    totalFields: 4,
    surfaceQuality: "Cỏ nhân tạo hạt cao su chuẩn",
    hasLighting: true,
    hasParking: false,
    typicalPeakPriceVnd: 750000,
    coordinates: { lat: 21.0212, lng: 105.7955 },
  },

  // --- QUẬN NAM TỪ LIÊM ---
  {
    id: "pitch-ntl-01",
    name: "Sân Bóng Đá Mễ Trì Hạ",
    shortName: "Mễ Trì Hạ",
    district: "Nam Từ Liêm",
    address: "Đường Mễ Trì Hạ (gần The Garden), Mễ Trì, Nam Từ Liêm, Hà Nội",
    totalFields: 7,
    surfaceQuality: "Cỏ nhân tạo sợi đúc mới",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 800000,
    coordinates: { lat: 21.0135, lng: 105.7785 },
  },
  {
    id: "pitch-ntl-02",
    name: "Sân Bóng Đá PVV Trần Hữu Dực",
    shortName: "PVV Trần Hữu Dực",
    district: "Nam Từ Liêm",
    address: "Đường Trần Hữu Dực, Phường Mỹ Đình 2, Nam Từ Liêm, Hà Nội",
    totalFields: 6,
    surfaceQuality: "Cỏ nhân tạo hạt cao su chuẩn",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 850000,
    coordinates: { lat: 21.0331, lng: 105.7592 },
  },
  {
    id: "pitch-ntl-03",
    name: "Sân Bóng Đá Mỹ Đình Pearl Sports",
    shortName: "Mỹ Đình Pearl",
    district: "Nam Từ Liêm",
    address: "Số 1 Châu Văn Liêm, Phường Phú Đô, Nam Từ Liêm, Hà Nội",
    totalFields: 8,
    surfaceQuality: "Cỏ nhân tạo sợi đúc mới",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 950000,
    coordinates: { lat: 21.0055, lng: 105.7728 },
  },
  {
    id: "pitch-ntl-04",
    name: "Sân Bóng Đá Tân Mỹ Lê Đức Thọ",
    shortName: "Tân Mỹ",
    district: "Nam Từ Liêm",
    address: "Đường Tân Mỹ, đối diện SVĐ Quốc Gia Mỹ Đình, Nam Từ Liêm, Hà Nội",
    totalFields: 5,
    surfaceQuality: "Cỏ tiêu chuẩn phong trào",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 750000,
    coordinates: { lat: 21.0252, lng: 105.7681 },
  },
  {
    id: "pitch-ntl-05",
    name: "Sân Bóng Đá Đình Thôn",
    shortName: "Sân Đình Thôn",
    district: "Nam Từ Liêm",
    address: "Đường Đình Thôn, Phường Mỹ Đình 1, Nam Từ Liêm, Hà Nội",
    totalFields: 4,
    surfaceQuality: "Cỏ tiêu chuẩn phong trào",
    hasLighting: true,
    hasParking: true,
    typicalPeakPriceVnd: 800000,
    coordinates: { lat: 21.0185, lng: 105.7745 },
  },
];
