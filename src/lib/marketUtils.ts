import {
  FreeAgentScoutCard,
  SubPlayerPost,
  SoloPosition,
  SkillTier,
  District,
} from "@/types/matchmaking";

/**
 * Chuyển đổi bản ghi DB sang FreeAgentScoutCard
 */
export function mapDbToFreeAgent(row: any): FreeAgentScoutCard {
  return {
    id: String(row.id),
    playerName: row.player_name || 'Anh Em "Phủi"',
    age: Number(row.age) || 25,
    preferredFoot: row.preferred_foot || "Chân phải",
    position: (row.position || "MF") as SoloPosition,
    positionLabel: row.position_label || "Tiền Vệ (MF)",
    skillTier: (Number(row.skill_tier) || 2) as SkillTier,
    districts: Array.isArray(row.districts) && row.districts.length > 0
      ? row.districts
      : [row.district || "Cầu Giấy"],
    availableDate: row.available_date || "Hôm nay",
    availableDateIso: row.available_date_iso || undefined,
    availableTimeSlots: Array.isArray(row.available_time_slots) && row.available_time_slots.length > 0
      ? row.available_time_slots
      : ["19:00 - 20:30"],
    trustRating: 5.0,
    matchesJoined: 1,
    futStats: row.fut_stats || {
      ovr: 85,
      pac: 85,
      tec: 85,
      pas: 85,
      def: 85,
      fpl: 98,
    },
    phone: row.phone || "",
    zaloPhone: row.zalo_phone || row.phone || "",
    bio: row.bio || "",
    hasFirstTimerVoucher: false,
    isCreatedByCurrentUser: false,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Vừa xong",
  };
}

/**
 * Chuyển đổi bản ghi DB sang SubPlayerPost
 */
export function mapDbToSubPost(row: any): SubPlayerPost {
  return {
    id: String(row.id),
    teamId: row.team_id || "team-guest",
    teamName: row.team_name || "FC Anh Em Hà Nội",
    positionNeeded: row.position_needed || "Tiền Vệ (MF)",
    positionCode: (row.position_code || "MF") as SoloPosition,
    quantity: Number(row.quantity) || 1,
    matchDate: row.match_date || "Hôm nay",
    matchDateIso: row.match_date_iso || undefined,
    matchTime: row.match_time || "19:00 - 20:30",
    expiresAt: row.expires_at || undefined,
    pitchName: row.pitch_name || "Sân Cỏ Nhân Tạo",
    district: (row.district || "Cầu Giấy") as District,
    skillTier: (Number(row.skill_tier) || 2) as SkillTier,
    contactPhone: row.contact_phone || "",
    contactZalo: row.contact_zalo || row.contact_phone || "",
    notes: row.notes || "",
    status: (row.status || "ACTIVE") as "ACTIVE" | "FILLED",
    isCreatedByCurrentUser: false,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Vừa xong",
  };
}
