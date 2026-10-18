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

export interface PersonalTeamProfileHubProps {
  team: AuthenticatedTeamProfile;
  profile?: UserProfile | null;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
  onQuickCreateMatch?: () => void;
  onSignOut?: () => void;
  onRefreshTeam?: () => Promise<void> | void;
}

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

  // Editable Profile States (Lưu trữ và chỉnh sửa thông tin đội bóng thực tế)
  const [teamName, setTeamName] = useState(team.team_name);
  const [captainName, setCaptainName] = useState(
    profile?.full_name || team.captain_name || "Đội trưởng"
  );
  const [captainPhone, setCaptainPhone] = useState(
    profile?.phone || team.captain_phone || ""
  );
  const [homeDistrict, setHomeDistrict] = useState(team.home_district || "Cầu Giấy");
  const [skillTier, setSkillTier] = useState<SkillTier>(
    ([1, 2, 3].includes(Number(team.skill_tier))
      ? Number(team.skill_tier)
      : 1) as SkillTier
  );
  const [avgAge, setAvgAge] = useState(team.avg_age || 22);
  const [jerseyColor, setJerseyColor] = useState(team.jersey_color || "Đỏ truyền thống");
  const [awayJerseyColor, setAwayJerseyColor] = useState("Xanh dương");
  const [homePitch, setHomePitch] = useState("Sân Trung Kính Hạ (Cầu Giấy)");
  const [fixedSchedule, setFixedSchedule] = useState("Tối Thứ 4 & Chủ nhật (19h00)");
  const [slogan, setSlogan] = useState(
    "Đá bóng dưỡng sinh vui vẻ sau giờ làm, văn minh không quẹt bóng, có nước mía giao lưu sau trận."
  );

  // Danh Sách Cầu Thủ Đội Bóng (Team Squad / Roster)
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "mem-1",
      name: profile?.full_name || team.captain_name || "Thiên Phước",
      number: 10,
      position: "MF",
      role: "Đội trưởng",
      phone: profile?.phone || team.captain_phone,
    },
    {
      id: "mem-2",
      name: 'Văn Hùng "Gôn"',
      number: 1,
      position: "GK",
      role: "Đội phó",
    },
    {
      id: "mem-3",
      name: "Minh Đức",
      number: 4,
      position: "DF",
      role: "Thành viên",
    },
    {
      id: "mem-4",
      name: "Quang Huy",
      number: 7,
      position: "FW",
      role: "Thành viên",
    },
    {
      id: "mem-5",
      name: "Tuấn Anh",
      number: 8,
      position: "MF",
      role: "Thành viên",
    },
    {
      id: "mem-6",
      name: "Thành Long",
      number: 5,
      position: "DF",
      role: "Thành viên",
    },
    {
      id: "mem-7",
      name: "Hoàng Nam",
      number: 11,
      position: "FW",
      role: "Thành viên",
    },
  ]);

  // State Thêm thành viên mới
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberNumber, setNewMemberNumber] = useState<number>(9);
  const [newMemberPosition, setNewMemberPosition] = useState<"GK" | "DF" | "MF" | "FW">("MF");
  const [newMemberRole, setNewMemberRole] = useState<"Đội trưởng" | "Đội phó" | "Thành viên">("Thành viên");

  // DNA & Phong Cách Đội Bóng
  const [dnaTags, setDnaTags] = useState<string[]>([
    "🍻 Có Nước Mía / Bia Sau Trận",
    "🛡️ Đá Dưỡng Sinh - Cấm Quẹt Bóng",
    "⏱️ Luôn Có Mặt Trước 15 Phút",
    "👕 Chuẩn Bị Đủ 2 Bộ Áo Đấu",
    "🤝 Sòng Phẳng Tiền Sân Ngay Sau Trận",
  ]);

  // Cập nhật khi team prop thay đổi
  useEffect(() => {
    if (team) {
      setTeamName(team.team_name);
      setCaptainName(profile?.full_name || team.captain_name || "Đội trưởng");
      setCaptainPhone(profile?.phone || team.captain_phone || "");
      setHomeDistrict(team.home_district || "Cầu Giấy");
      if ([1, 2, 3].includes(Number(team.skill_tier))) {
        setSkillTier(Number(team.skill_tier) as SkillTier);
      }
      setAvgAge(team.avg_age || 22);
      if (team.jersey_color) setJerseyColor(team.jersey_color);
    }
  }, [team, profile]);

  const tierInfo = SKILL_TIERS_CONFIG[skillTier];

  const handleCopyCardText = () => {
    const text =
      `⚽ THẺ CĂN CƯỚC BÓNG ĐÁ SỐ: ${teamName}\n` +
      `• Đội trưởng: ${captainName} (${captainPhone})\n` +
      `• Trình độ: Tier ${skillTier} - ${tierInfo.name} (Tuổi TB: ${avgAge}t)\n` +
      `• Điểm tín nhiệm: ${team.trust_score}/100 ★ (Bảo chứng không bùng kèo)\n` +
      `• Địa bàn: ${homeDistrict} • Sân nhà: ${homePitch}\n` +
      `• Slogan: “${slogan}”\n` +
      `👉 Giao lưu bắt kèo tại: https://batkeohanoi-wh64.vercel.app`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const newMem: TeamMember = {
      id: `mem-${Date.now()}`,
      name: newMemberName.trim(),
      number: Number(newMemberNumber) || 9,
      position: newMemberPosition,
      role: newMemberRole,
    };
    setMembers((prev) => [...prev, newMem]);
    setNewMemberName("");
    setIsAddMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn gỡ cầu thủ này khỏi danh sách đội?")) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
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
              {teamName.slice(0, 2).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold uppercase tracking-wider">
                  Đội Chính Chủ Đã Xác Thực
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                  ★ Bảo Chứng BắtKèo7
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {teamName}
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>

              <p className="text-xs text-slate-300">
                Đội trưởng:{" "}
                <strong className="text-white font-bold">{captainName}</strong> •{" "}
                <span className="font-mono text-emerald-300 font-bold">
                  {captainPhone}
                </span>
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
                  • Áo chính: <strong className="text-emerald-300">{jerseyColor}</strong>
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
            <span className="text-[10px] text-slate-400 block font-medium">Địa bàn sinh hoạt</span>
            <span className="font-extrabold text-white text-xs sm:text-sm">
              {homeDistrict}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Đánh giá văn minh</span>
            <span className="font-extrabold text-emerald-400 text-xs sm:text-sm flex items-center justify-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              5.0 ★ Chuẩn Phủi
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Quân số đội</span>
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
                Ví Ký Quỹ Nội Bộ Đội {teamName}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                Miễn cọc 100%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Số dư bảo chứng:{" "}
              <strong className="text-emerald-400 font-mono">
                {(escrowWallet?.balance ?? 0).toLocaleString("vi-VN")}đ
              </strong>{" "}
              • Điểm uy tín 100/100 bảo chứng miễn cọc khi tạo và nhận kèo
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

      {/* 3. LƯỚI 2 CỘT: TRIẾT LÝ SÂN NHÀ & BẢNG THÀNH TÍCH PHONG ĐỘ */}
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
              <strong className="text-white">{homePitch}</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Lịch đá cố định:
              </span>
              <strong className="text-amber-300 font-mono">{fixedSchedule}</strong>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-sky-400" />
                Màu áo chính / phụ:
              </span>
              <span className="text-slate-200">
                <strong className="text-emerald-300">{jerseyColor}</strong> / {awayJerseyColor}
              </span>
            </div>
          </div>

          {/* Slogan đội */}
          <div className="rounded-xl bg-slate-950/80 border border-white/[0.06] p-3">
            <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
              Khẩu hiệu / Triết lý bóng đá
            </span>
            <p className="text-xs text-slate-200 italic mt-1 font-medium">
              “{slogan}”
            </p>
          </div>
        </div>

        {/* Cột Phải: Bảng Phong Độ & Thành Tích 5 Trận Gần Nhất */}
        <div className="surface-card rounded-2xl border border-white/[0.08] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Phong Độ &amp; Thành Tích Giao Lưu</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300">
              Mùa giải 2026
            </span>
          </div>

          {/* Thống kê tỷ lệ Thắng - Hòa - Thua */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-white/[0.05]">
              <span className="text-[10px] text-slate-400 block">Tổng trận</span>
              <span className="text-base font-black text-white">18</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 block font-bold">Thắng</span>
              <span className="text-base font-black text-emerald-300">12</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-[10px] text-amber-400 block font-bold">Hòa</span>
              <span className="text-base font-black text-amber-300">3</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <span className="text-[10px] text-rose-400 block font-bold">Thua</span>
              <span className="text-base font-black text-rose-300">3</span>
            </div>
          </div>

          {/* Chuỗi 5 trận gần nhất (5-Match Form) */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.05] flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              Phong độ 5 trận gần nhất:
            </span>
            <div className="flex items-center gap-1.5">
              {["W", "W", "D", "W", "L"].map((f, idx) => (
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
              ))}
            </div>
          </div>

          {/* 3 Cam kết văn minh */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
            <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block">Đúng giờ</span>
              <strong className="text-emerald-400 text-xs">100%</strong>
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

      {/* 4. QUẢN LÝ ĐỘI HÌNH & DANH SÁCH CẦU THỦ (TEAM SQUAD & ROSTER) */}
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
              Quản lý anh em trong đội, số áo, vị trí thi đấu và liên hệ
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
                  </div>
                </div>
              </div>

              {mem.role !== "Đội trưởng" && (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(mem.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition"
                  title="Xóa cầu thủ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. DNA & PHONG CÁCH PHỦI CỦA ĐỘI BÓNG */}
      <div className="surface-card rounded-2xl border border-white/[0.08] p-4 space-y-2.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>DNA &amp; Văn Hóa Giao Lưu Của Đội</span>
        </h3>
        <div className="flex flex-wrap gap-2 pt-1">
          {dnaTags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
            >
              <span>{tag}</span>
            </span>
          ))}
        </div>
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

            <form onSubmit={handleSaveProfile} className="p-5 overflow-y-auto space-y-4 text-xs">
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
                    onChange={(e) => setSkillTier(Number(e.target.value) as SkillTier)}
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
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Sân Nhà Hay Đá
                  </label>
                  <input
                    type="text"
                    value={homePitch}
                    onChange={(e) => setHomePitch(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Lịch Đá Quen Thuộc
                  </label>
                  <input
                    type="text"
                    value={fixedSchedule}
                    onChange={(e) => setFixedSchedule(e.target.value)}
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
                Thêm Cầu Thủ Vào Đội {teamName}
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
                      setNewMemberPosition(e.target.value as "GK" | "DF" | "MF" | "FW")
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

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Vai trò
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) =>
                    setNewMemberRole(e.target.value as "Đội trưởng" | "Đội phó" | "Thành viên")
                  }
                  className="w-full h-9 px-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                >
                  <option value="Thành viên">Thành viên</option>
                  <option value="Đội phó">Đội phó</option>
                  <option value="Đội trưởng">Đội trưởng</option>
                </select>
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
    </div>
  );
};
