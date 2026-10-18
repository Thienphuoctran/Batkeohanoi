"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  QrCode,
  Share2,
  Check,
  LogOut,
  PlusCircle,
  Edit3,
  Users,
  Trophy,
  Flame,
  Star,
  MapPin,
  Clock,
  Shirt,
  Calendar,
  Wallet,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Medal,
} from "lucide-react";
import { AuthenticatedTeamProfile, UserProfile } from "@/hooks/useAuthTeam";
import { SkillTier, EscrowWallet } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { updateTeamProfileAction } from "@/actions/auth";

export interface TeamMember {
  id: string;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  role: "Đội trưởng" | "Đội phó" | "Thành viên";
  phone?: string;
}

export interface TeamMatchStats {
  total: number;
  wins: number;
  draws: number;
  losses: number;
  recentForm: ("W" | "D" | "L")[];
}

export interface PersonalTeamProfileHubProps {
  team: AuthenticatedTeamProfile;
  profile?: UserProfile | null;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
  onQuickCreateMatch?: () => void;
  onSignOut?: () => void;
  onRefreshTeam?: () => Promise<void> | void;
}

const PRESET_DNA_TAGS = [
  "🥤 Có Nước Mía / Bia Sau Trận",
  "🛡️ Đá Dưỡng Sinh - Cấm Quẹt Bóng",
  "⏱️ Luôn Có Mặt Trước 15 Phút",
  "👕 Chuẩn Bị Đủ 2 Bộ Áo Đấu",
  "🤝 Sòng Phẳng Tiền Sân Ngay Sau Trận",
  "⚽ Ưu Tiên Ban Bật Nhẹ Nhàng",
  "🚫 Không Cay Cú Ăn Thua",
  "🏥 Có Hộp Sơ Cứu & Băng Keo",
  "📸 Chụp Ảnh Đội Kỷ Niệm Sau Trận",
  "🎂 Liên Hoan Sinh Nhật Anh Em Đội",
];

const getStorageKey = (teamId: string) => `football_profile_team_v2_${teamId}`;

export const PersonalTeamProfileHub: React.FC<PersonalTeamProfileHubProps> = ({
  team,
  profile,
  escrowWallet,
  onOpenEscrowModal,
  onQuickCreateMatch,
  onSignOut,
  onRefreshTeam,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isLogMatchModalOpen, setIsLogMatchModalOpen] = useState(false);

  // Editable Profile States (Trống hoàn toàn mặc định cho từng tài khoản tự điền)
  const [teamName, setTeamName] = useState(team.team_name || "");
  const [captainName, setCaptainName] = useState(
    profile?.full_name || team.captain_name || "Đội trưởng"
  );
  const [captainPhone, setCaptainPhone] = useState(
    profile?.phone || team.captain_phone || ""
  );
  const [homeDistrict, setHomeDistrict] = useState(team.home_district || "");
  const [skillTier, setSkillTier] = useState<SkillTier>(
    ([1, 2, 3].includes(Number(team.skill_tier))
      ? Number(team.skill_tier)
      : 1) as SkillTier
  );
  const [avgAge, setAvgAge] = useState(team.avg_age || 25);
  const [jerseyColor, setJerseyColor] = useState(team.jersey_color || "");
  const [awayJerseyColor, setAwayJerseyColor] = useState("");
  const [homePitch, setHomePitch] = useState("");
  const [fixedSchedule, setFixedSchedule] = useState("");
  const [slogan, setSlogan] = useState("");

  // Danh Sách Cầu Thủ Đội Bóng: Mặc định chỉ có DUY NHẤT 1 người là Đội trưởng chính chủ
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "mem-cap",
      name: profile?.full_name || team.captain_name || "Đội trưởng",
      number: 10,
      position: "MF",
      role: "Đội trưởng",
      phone: profile?.phone || team.captain_phone || "",
    },
  ]);

  // State Thêm thành viên mới
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberNumber, setNewMemberNumber] = useState<number>(9);
  const [newMemberPosition, setNewMemberPosition] = useState<
    "GK" | "DF" | "MF" | "FW"
  >("MF");
  const [newMemberRole, setNewMemberRole] = useState<
    "Đội trưởng" | "Đội phó" | "Thành viên"
  >("Thành viên");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  // DNA & Phong Cách Đội Bóng (Mặc định mảng rỗng để đội tự chọn / tự điền)
  const [dnaTags, setDnaTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");

  // Bảng Phong Độ & Thành Tích (Mặc định 0 trận cho tài khoản mới)
  const [matchStats, setMatchStats] = useState<TeamMatchStats>({
    total: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    recentForm: [],
  });

  // State cho Modal Ghi Nhận Trận Đấu
  const [logResult, setLogResult] = useState<"W" | "D" | "L">("W");
  const [logOpponent, setLogOpponent] = useState("");
  const [logScore, setLogScore] = useState("");

  // Lưu trữ cục bộ theo từng team.id (Persistent Local Hub per Team)
  const persistData = (updates: Record<string, any>) => {
    if (typeof window === "undefined" || !team?.id) return;
    try {
      const raw = localStorage.getItem(getStorageKey(team.id));
      const current = raw ? JSON.parse(raw) : {};
      const next = { ...current, ...updates };
      localStorage.setItem(getStorageKey(team.id), JSON.stringify(next));
    } catch (e) {
      console.error("Failed to persist team profile to storage", e);
    }
  };

  // Nạp dữ liệu đã lưu của tài khoản này từ localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !team?.id) return;
    try {
      const raw = localStorage.getItem(getStorageKey(team.id));
      if (raw) {
        const data = JSON.parse(raw);
        if (data.homePitch !== undefined) setHomePitch(data.homePitch);
        if (data.fixedSchedule !== undefined) setFixedSchedule(data.fixedSchedule);
        if (data.awayJerseyColor !== undefined)
          setAwayJerseyColor(data.awayJerseyColor);
        if (data.slogan !== undefined) setSlogan(data.slogan);
        if (data.members !== undefined && Array.isArray(data.members)) {
          setMembers(data.members);
        }
        if (data.dnaTags !== undefined && Array.isArray(data.dnaTags)) {
          setDnaTags(data.dnaTags);
        }
        if (data.matchStats !== undefined) setMatchStats(data.matchStats);
      }
    } catch (e) {
      console.error("Failed to read team profile from storage", e);
    }
  }, [team?.id]);

  // Cập nhật khi team / profile prop từ server thay đổi
  useEffect(() => {
    if (team) {
      setTeamName(team.team_name || "");
      setCaptainName(profile?.full_name || team.captain_name || "Đội trưởng");
      setCaptainPhone(profile?.phone || team.captain_phone || "");
      if (team.home_district) setHomeDistrict(team.home_district);
      if ([1, 2, 3].includes(Number(team.skill_tier))) {
        setSkillTier(Number(team.skill_tier) as SkillTier);
      }
      if (team.avg_age) setAvgAge(team.avg_age);
      if (team.jersey_color) setJerseyColor(team.jersey_color);
    }
  }, [team, profile]);

  const tierInfo = SKILL_TIERS_CONFIG[skillTier];

  // Sao chép Thẻ Căn Cước Bóng Đá Số
  const handleCopyCardText = () => {
    const text =
      `⚽ THẺ CĂN CƯỚC BÓNG ĐÁ SỐ: ${teamName}\n` +
      `• Đội trưởng: ${captainName} (${captainPhone || "Chưa có SĐT"})\n` +
      `• Trình độ: Tier ${skillTier} - ${tierInfo.name} (Tuổi TB: ${avgAge}t)\n` +
      `• Điểm tín nhiệm: ${team.trust_score}/100 ★ (Bảo chứng BắtKèo7)\n` +
      `• Địa bàn: ${homeDistrict || "Chưa cập nhật"} ${
        homePitch ? `• Sân nhà: ${homePitch}` : ""
      }\n` +
      (fixedSchedule ? `• Lịch đá: ${fixedSchedule}\n` : "") +
      (jerseyColor ? `• Màu áo: ${jerseyColor}\n` : "") +
      (slogan ? `• Triết lý: “${slogan}”\n` : "") +
      `👉 Giao lưu bắt kèo tại: https://batkeohanoi-wh64.vercel.app`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Lưu thông tin hồ sơ đội bóng
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      persistData({
        homePitch,
        fixedSchedule,
        awayJerseyColor,
        slogan,
        jerseyColor,
      });

      await updateTeamProfileAction({
        teamId: team.id,
        teamName,
        captainName,
        captainPhone,
        captainZalo: captainPhone,
        jerseyColor,
        avgAge,
        skillTier,
        homeDistrict,
      });

      await onRefreshTeam?.();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Save profile error", err);
      setIsEditModalOpen(false);
    }
  };

  // Thêm cầu thủ mới vào danh sách đội
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMem: TeamMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      number: Number(newMemberNumber) || 9,
      position: newMemberPosition,
      role: newMemberRole,
      phone: newMemberPhone.trim() || undefined,
    };
    const nextMembers = [...members, newMem];
    setMembers(nextMembers);
    persistData({ members: nextMembers });

    setNewMemberName("");
    setNewMemberPhone("");
    setIsAddMemberModalOpen(false);
  };

  // Xóa cầu thủ khỏi đội
  const handleDeleteMember = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn gỡ cầu thủ này khỏi danh sách đội?")) {
      const nextMembers = members.filter((m) => m.id !== id);
      setMembers(nextMembers);
      persistData({ members: nextMembers });
    }
  };

  // Thêm/Xóa Tag DNA
  const handleToggleDnaTag = (tag: string) => {
    let nextTags: string[];
    if (dnaTags.includes(tag)) {
      nextTags = dnaTags.filter((t) => t !== tag);
    } else {
      nextTags = [...dnaTags, tag];
    }
    setDnaTags(nextTags);
    persistData({ dnaTags: nextTags });
  };

  const handleAddCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const formatted = customTagInput.trim().startsWith("⭐")
      ? customTagInput.trim()
      : `⭐ ${customTagInput.trim()}`;
    if (!dnaTags.includes(formatted)) {
      const nextTags = [...dnaTags, formatted];
      setDnaTags(nextTags);
      persistData({ dnaTags: nextTags });
    }
    setCustomTagInput("");
  };

  // Ghi nhận kết quả trận đấu thật
  const handleSaveMatchLog = (e: React.FormEvent) => {
    e.preventDefault();
    const nextStats: TeamMatchStats = {
      total: matchStats.total + 1,
      wins: matchStats.wins + (logResult === "W" ? 1 : 0),
      draws: matchStats.draws + (logResult === "D" ? 1 : 0),
      losses: matchStats.losses + (logResult === "L" ? 1 : 0),
      recentForm: [logResult, ...matchStats.recentForm].slice(0, 5),
    };
    setMatchStats(nextStats);
    persistData({ matchStats: nextStats });

    setLogOpponent("");
    setLogScore("");
    setIsLogMatchModalOpen(false);
  };

  // Đặt lại bảng thành tích (về 0 trận)
  const handleResetMatchStats = () => {
    if (
      window.confirm(
        "Bạn có muốn đặt lại thành tích về 0 trận để bắt đầu mùa giải mới?"
      )
    ) {
      const resetStats: TeamMatchStats = {
        total: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        recentForm: [],
      };
      setMatchStats(resetStats);
      persistData({ matchStats: resetStats });
    }
  };

  // Thống kê thành phần quân số
  const gkCount = members.filter((m) => m.position === "GK").length;
  const dfCount = members.filter((m) => m.position === "DF").length;
  const mfCount = members.filter((m) => m.position === "MF").length;
  const fwCount = members.filter((m) => m.position === "FW").length;

  return (
    <div className="space-y-4">
      {/* 1. THẺ CĂN CƯỚC BÓNG ĐÁ SỐ CHÍNH CHỦ (DIGITAL TEAM ID CARD) */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-slate-900 via-[#0B132B] to-slate-950 p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Glow hiệu ứng sân cỏ */}
        <div className="pointer-events-none absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 -top-8 w-40 h-40 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            {/* Logo Đội Bóng */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg border-2 border-white/20 shrink-0">
              {teamName ? teamName.slice(0, 2).toUpperCase() : "FC"}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold uppercase tracking-wider">
                  Đội Chính Chủ Đã Xác Thực
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  ★ Bảo Chứng BắtKèo7
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {teamName || "Chưa đặt tên đội"}
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              <p className="text-xs text-slate-300">
                Đội trưởng:{" "}
                <strong className="text-white font-bold">{captainName}</strong>
                {captainPhone ? (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-mono text-emerald-300 font-bold">
                      {captainPhone}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 italic ml-1">
                    (Chưa có SĐT)
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${tierInfo.badgeColor}`}
                >
                  Tier {skillTier}: {tierInfo.name}
                </span>
                <span className="text-slate-400 font-medium text-[11px]">
                  Tuổi TB: <strong className="text-slate-200">{avgAge}t</strong>
                </span>
                <span className="text-slate-400 font-medium text-[11px]">
                  • Áo chính:{" "}
                  <strong className="text-emerald-300">
                    {jerseyColor || "Chưa cập nhật"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Khối Điểm Tín Nhiệm & Trạng thái cọc */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 p-3 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Điểm Tín Nhiệm
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
              {team.trust_score}
              <span className="text-xs text-slate-500 font-bold">/100</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {team.trust_score >= 70 ? "Miễn cọc 100%" : "Cọc 200k"}
            </span>
          </div>
        </div>

        {/* 3 Thẻ Thông Tin Nhanh */}
        <div className="grid grid-cols-3 gap-2.5 bg-slate-950/70 p-3 rounded-2xl border border-white/[0.08] text-center text-xs relative z-10">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Địa bàn sinh hoạt
            </span>
            <span className="font-extrabold text-white text-xs sm:text-sm">
              {homeDistrict || "Chưa cập nhật"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Đánh giá văn minh
            </span>
            <span className="font-extrabold text-emerald-400 text-xs sm:text-sm flex items-center justify-center gap-1">
              {matchStats.total > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-current" />
                  5.0 ★ Chuẩn Phủi
                </>
              ) : (
                <span className="text-slate-400 font-bold text-xs">
                  ★ Đội Mới
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              Quân số đội
            </span>
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm">
              {members.length} Cầu thủ
            </span>
          </div>
        </div>

        {/* Thanh công cụ quản trị đội bóng */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 relative z-10">
          <span className="text-[11px] font-mono text-slate-400 flex items-center">
            <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            <span>ID: #{team.id.slice(0, 8).toUpperCase()}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Sửa Hồ Sơ */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white rounded-xl text-xs font-bold border border-amber-500/30 flex items-center space-x-1.5 transition-all shadow-sm active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Sửa Hồ Sơ</span>
            </button>

            {/* Nút Đăng Kèo Nhanh */}
            {onQuickCreateMatch && (
              <button
                onClick={onQuickCreateMatch}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mở Kèo Đội Tôi</span>
              </button>
            )}

            {/* Nút Chia Sẻ Zalo */}
            <button
              onClick={handleCopyCardText}
              className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-xl text-xs font-bold border border-white/10 flex items-center space-x-1.5 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Đã chép thẻ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chia sẻ Zalo</span>
                </>
              )}
            </button>

            {/* Nút Đăng Xuất */}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Đăng xuất tài khoản Đội trưởng"
                className="p-2 bg-slate-900/90 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-800 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. VÍ KÝ QUỸ NỘI BỘ & TÍCH HỢP TRỰC TIẾP CHO ĐỘI BÓNG */}
      <div className="surface-card rounded-2xl border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">
                Ví Ký Quỹ Nội Bộ Đội {teamName || "Bóng Đá"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                {team.trust_score >= 70 ? "Miễn cọc 100%" : "Cọc 200k"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Số dư bảo chứng:{" "}
              <strong className="text-emerald-400 font-mono">
                {(escrowWallet?.balance ?? 0).toLocaleString("vi-VN")}đ
              </strong>{" "}
              • Điểm uy tín {team.trust_score}/100 bảo chứng an toàn khi tạo và
              nhận kèo
            </p>
          </div>
        </div>

        {onOpenEscrowModal && (
          <Button
            onClick={onOpenEscrowModal}
            variant="outline"
            className="h-9 px-3.5 rounded-xl border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs gap-1.5 shrink-0"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Quản Lý Nạp / Rút Ví</span>
          </Button>
        )}
      </div>

      {/* 3. LƯỚI 2 CỘT: SÂN NHÀ & BẢNG THÀNH TÍCH PHONG ĐỘ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột Trái: Thông tin Sân Nhà, Giờ Đá & Triết Lý */}
        <div className="surface-card rounded-2xl border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Sân Nhà &amp; Lịch Sinh Hoạt</span>
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-amber-400 hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Sân hay đá nhất:
              </span>
              {homePitch ? (
                <strong className="text-white">{homePitch}</strong>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-slate-500 hover:text-amber-300 italic text-[11px]"
                >
                  + Bấm để cập nhật sân nhà
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Lịch đá cố định:
              </span>
              {fixedSchedule ? (
                <strong className="text-amber-300 font-mono">
                  {fixedSchedule}
                </strong>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-slate-500 hover:text-amber-300 italic text-[11px]"
                >
                  + Bấm để cập nhật lịch đá
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-sky-400" />
                Màu áo chính / phụ:
              </span>
              <span className="text-slate-200">
                {jerseyColor || awayJerseyColor ? (
                  <>
                    <strong className="text-emerald-300">
                      {jerseyColor || "Chưa chọn"}
                    </strong>{" "}
                    / {awayJerseyColor || "Chưa chọn"}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-slate-500 hover:text-amber-300 italic text-[11px]"
                  >
                    + Cập nhật màu áo
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* Slogan đội */}
          <div className="rounded-xl bg-slate-950/80 border border-white/[0.06] p-3">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
              Khẩu hiệu / Triết lý bóng đá
            </span>
            {slogan ? (
              <p className="text-xs text-slate-200 italic mt-1 font-medium">
                “{slogan}”
              </p>
            ) : (
              <p
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-slate-500 italic mt-1 cursor-pointer hover:text-amber-300"
              >
                Chưa có khẩu hiệu. Bấm "Chỉnh sửa" để thêm triết lý bóng đá của
                đội bạn!
              </p>
            )}
          </div>
        </div>

        {/* Cột Phải: Bảng Phong Độ & Thành Tích Thật */}
        <div className="surface-card rounded-2xl border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Phong Độ &amp; Thành Tích Giao Lưu</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLogMatchModalOpen(true)}
                className="text-[11px] font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>+ Ghi Nhận Trận</span>
              </button>
              {matchStats.total > 0 && (
                <button
                  onClick={handleResetMatchStats}
                  title="Đặt lại thành tích về 0"
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Thống kê tỷ lệ Thắng - Hòa - Thua */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block">Tổng trận</span>
              <span className="text-base font-black text-white">
                {matchStats.total}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block font-bold">
                Thắng
              </span>
              <span className="text-base font-black text-emerald-300">
                {matchStats.wins}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-400 block font-bold">
                Hòa
              </span>
              <span className="text-base font-black text-amber-300">
                {matchStats.draws}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 block font-bold">
                Thua
              </span>
              <span className="text-base font-black text-rose-300">
                {matchStats.losses}
              </span>
            </div>
          </div>

          {/* Chuỗi 5 trận gần nhất */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.05] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Phong độ 5 trận gần nhất:
            </span>
            <div className="flex items-center gap-1.5">
              {matchStats.recentForm.length > 0 ? (
                matchStats.recentForm.map((f, idx) => (
                  <span
                    key={idx}
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                      f === "W"
                        ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30"
                        : f === "D"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-[11px] italic">
                  Chưa có trận đấu nào
                </span>
              )}
            </div>
          </div>

          {/* 3 Cam kết văn minh */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Đúng giờ</span>
              <strong className="text-emerald-400 text-xs">
                {matchStats.total > 0 ? "100%" : "Mới"}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Không bỏ cuộc</span>
              <strong className="text-emerald-400 text-xs">100%</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Trả sân sòng phẳng</span>
              <strong className="text-emerald-400 text-xs">100%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. QUẢN LÝ ĐỘI HÌNH & DANH SÁCH CẦU THỦ */}
      <div className="surface-card rounded-2xl border border-white/[0.08] p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Danh Sách Cầu Thủ Đội Bóng ({members.length})</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {gkCount} GK • {dfCount} DF • {mfCount} MF • {fwCount} FW
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quản lý danh sách cầu thủ chính thức, số áo và vị trí thi đấu
            </p>
          </div>

          <Button
            onClick={() => setIsAddMemberModalOpen(true)}
            className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs gap-1 shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Thêm Cầu Thủ</span>
          </Button>
        </div>

        {/* Danh sách cầu thủ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {members.map((mem) => (
            <div
              key={mem.id}
              className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] hover:border-emerald-500/30 transition flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Số áo */}
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  #{mem.number}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {mem.name}
                    </span>
                    {mem.role === "Đội trưởng" && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950 shrink-0">
                        C
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span
                      className={`font-black ${
                        mem.position === "GK"
                          ? "text-amber-300"
                          : mem.position === "DF"
                          ? "text-blue-300"
                          : mem.position === "MF"
                          ? "text-emerald-300"
                          : "text-rose-300"
                      }`}
                    >
                      {mem.position}
                    </span>
                    <span>• {mem.role}</span>
                    {mem.phone && (
                      <span className="font-mono text-slate-500">
                        • {mem.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {mem.role !== "Đội trưởng" && (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(mem.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Gỡ cầu thủ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {members.length <= 1 && (
            <div className="col-span-full p-4 rounded-xl border border-dashed border-white/10 bg-slate-950/40 text-center space-y-1.5">
              <p className="text-xs text-slate-300 font-bold">
                Đội hiện chỉ có Đội trưởng trong danh sách
              </p>
              <p className="text-[11px] text-slate-400">
                Hãy bấm{" "}
                <strong className="text-emerald-400 font-semibold">
                  + Thêm Cầu Thủ
                </strong>{" "}
                để ghi danh anh em trong đội, số áo và phân chia vị trí thi đấu!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. DNA & VĂN HÓA GIAO LƯU CỦA ĐỘI (1-CLICK PRESET PICKER & CUSTOM) */}
      <div className="surface-card rounded-2xl border border-white/[0.08] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>DNA &amp; Văn Hóa Giao Lưu Của Đội</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            {dnaTags.length} nét văn hóa
          </span>
        </div>

        {/* Danh sách Tag đã chọn */}
        {dnaTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {dnaTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleToggleDnaTag(tag)}
                  className="w-4 h-4 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-rose-400 transition ml-0.5"
                  title="Gỡ tag này"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-white/10 bg-slate-950/40 text-center text-xs text-slate-400">
            Chưa thiết lập DNA văn hóa đội bóng. Hãy bấm chọn nhanh các nét đặc
            trưng dưới đây:
          </div>
        )}

        {/* Thư viện Tag Gợi Ý 1-Chạm (Quick Preset Chips) */}
        <div className="pt-2 border-t border-white/[0.05] space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            💡 Gợi ý văn hóa bóng đá phủi (Bấm để thêm vào đội):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_DNA_TAGS.filter((t) => !dnaTags.includes(t)).map(
              (tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleDnaTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-[11px] text-slate-300 hover:text-white font-medium flex items-center gap-1 transition active:scale-95"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>{tag}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Ô tự nhập Tag riêng */}
        <form
          onSubmit={handleAddCustomTag}
          className="flex items-center gap-2 pt-1"
        >
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            placeholder="Tự nhập nét văn hóa riêng (VD: Team U30 văn phòng, Thứ 5 hàng tuần...)"
            className="flex-1 h-8 px-3 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500"
          />
          <Button
            type="submit"
            className="h-8 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold shrink-0"
          >
            + Thêm
          </Button>
        </form>
      </div>

      {/* MODAL 1: CHỈNH SỬA HỒ SƠ ĐỘI BÓNG CHÍNH CHỦ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/80">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Quản Trị Hồ Sơ Chính Chủ
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Chỉnh Sửa Thông Tin Đội Bóng
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveProfile}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tên Đội Bóng
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="VD: FC Tấu Hề"
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tên Đội Trưởng
                  </label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="VD: Anh Tuấn"
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    SĐT Zalo Đội Trưởng
                  </label>
                  <input
                    type="tel"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="VD: 0988.234.567"
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-emerald-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Địa Bàn Quận
                  </label>
                  <input
                    type="text"
                    value={homeDistrict}
                    onChange={(e) => setHomeDistrict(e.target.value)}
                    placeholder="VD: Cầu Giấy, Nam Từ Liêm..."
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tuổi Trung Bình
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={60}
                    value={avgAge}
                    onChange={(e) => setAvgAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Phân Tầng Trình Độ
                  </label>
                  <select
                    value={skillTier}
                    onChange={(e) =>
                      setSkillTier(Number(e.target.value) as SkillTier)
                    }
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white font-bold"
                  >
                    <option value={1}>Tier 1: Dưỡng sinh (Cấm va chạm)</option>
                    <option value={2}>Tier 2: Phong trào</option>
                    <option value={3}>Tier 3: Phủi chiến cọ xát</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Màu Áo Đấu Chính
                  </label>
                  <input
                    type="text"
                    value={jerseyColor}
                    onChange={(e) => setJerseyColor(e.target.value)}
                    placeholder="VD: Đỏ truyền thống, Xanh rêu..."
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Màu Áo Phụ (Dự phòng)
                  </label>
                  <input
                    type="text"
                    value={awayJerseyColor}
                    onChange={(e) => setAwayJerseyColor(e.target.value)}
                    placeholder="VD: Trắng, Xanh..."
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Sân Nhà Hay Đá
                  </label>
                  <input
                    type="text"
                    value={homePitch}
                    onChange={(e) => setHomePitch(e.target.value)}
                    placeholder="VD: Sân Thành Phát, Sân Mễ Trì..."
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-slate-300 mb-1">
                    Lịch Đá Quen Thuộc
                  </label>
                  <input
                    type="text"
                    value={fixedSchedule}
                    onChange={(e) => setFixedSchedule(e.target.value)}
                    placeholder="VD: Tối Thứ 3 & Thứ 5 (19h00)"
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Slogan / Triết Lý Bóng Đá
                </label>
                <textarea
                  rows={2}
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="VD: Đá bóng vui vẻ sau giờ làm, văn minh không quẹt bóng, có nước mía giao lưu..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 text-xs text-slate-400"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: THÊM CẦU THỦ VÀO ĐỘI HÌNH */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-extrabold text-white">
                Thêm Cầu Thủ Vào Đội {teamName || "Bóng Đá"}
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tên / Biệt danh cầu thủ
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="VD: Tuấn 'Cò', Văn Hải..."
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Số áo
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={newMemberNumber}
                    onChange={(e) => setNewMemberNumber(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Vị trí
                  </label>
                  <select
                    value={newMemberPosition}
                    onChange={(e) =>
                      setNewMemberPosition(
                        e.target.value as "GK" | "DF" | "MF" | "FW"
                      )
                    }
                    className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="GK">🧤 Thủ môn (GK)</option>
                    <option value="DF">🛡️ Hậu vệ (DF)</option>
                    <option value="MF">🎯 Tiền vệ (MF)</option>
                    <option value="FW">⚡ Tiền đạo (FW)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) =>
                      setNewMemberRole(
                        e.target.value as "Đội trưởng" | "Đội phó" | "Thành viên"
                      )
                    }
                    className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Đội phó">Đội phó</option>
                    <option value="Đội trưởng">Đội trưởng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    SĐT / Zalo (Tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="VD: 0912..."
                    className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="h-8 text-xs text-slate-400"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  Thêm Cầu Thủ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: GHI NHẬN KẾT QUẢ TRẬN ĐẤU (MATCH RESULT LOGGER) */}
      {isLogMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400">
                  Ghi Nhận Phong Độ Thật
                </span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">
                  Cập Nhật Trận Đấu Mới
                </h3>
              </div>
              <button
                onClick={() => setIsLogMatchModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMatchLog} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Kết quả trận đấu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogResult("W")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "W"
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 text-emerald-400 border-white/10"
                    }`}
                  >
                    🟢 Thắng (W)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogResult("D")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "D"
                        ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/20"
                        : "bg-slate-950 text-amber-400 border-white/10"
                    }`}
                  >
                    🟡 Hòa (D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogResult("L")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "L"
                        ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                        : "bg-slate-950 text-rose-400 border-white/10"
                    }`}
                  >
                    🔴 Thua (L)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tên đội đối thủ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={logOpponent}
                  onChange={(e) => setLogOpponent(e.target.value)}
                  placeholder="VD: FC Giao Thông, FC Vinaconex..."
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tỷ số trận đấu (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={logScore}
                  onChange={(e) => setLogScore(e.target.value)}
                  placeholder="VD: 4 - 2, 3 - 3..."
                  className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogMatchModalOpen(false)}
                  className="h-8 text-xs text-slate-400"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                >
                  Lưu Kết Quả
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
