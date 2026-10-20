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
  Camera,
  Upload,
  Award,
  Link2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { AuthenticatedTeamProfile, UserProfile } from "@/hooks/useAuthTeam";
import { SkillTier, EscrowWallet } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { updateTeamProfileAction } from "@/actions/auth";
import { ShinyText, CountUpNumber } from "@/components/reactbits";

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

export interface TeamTrophy {
  id: string;
  name: string;
  type: "cup_gold" | "medal_gold" | "medal_silver" | "medal_bronze" | "shield";
  year: string;
  notes?: string;
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

const PRESET_BADGES = [
  { id: "lion", label: "Sư Tử Vàng", icon: "🦁", bg: "from-amber-500 to-yellow-600" },
  { id: "dragon", label: "Rồng Lửa", icon: "🐉", bg: "from-red-600 to-orange-600" },
  { id: "lightning", label: "Tia Chớp", icon: "⚡", bg: "from-yellow-400 to-amber-600" },
  { id: "eagle", label: "Đại Bàng", icon: "🦅", bg: "from-blue-600 to-indigo-700" },
  { id: "wolf", label: "Sói Xám", icon: "🐺", bg: "from-slate-600 to-slate-800" },
  { id: "tiger", label: "Hổ Phủi", icon: "🐯", bg: "from-orange-500 to-amber-700" },
  { id: "shield", label: "Khiên Thép", icon: "🛡️", bg: "from-emerald-600 to-teal-800" },
  { id: "crown", label: "Vương Miện", icon: "👑", bg: "from-yellow-500 to-amber-500" },
  { id: "ball", label: "Bóng Vàng", icon: "⚽", bg: "from-emerald-500 to-teal-600" },
  { id: "rocket", label: "Tên Lửa", icon: "🚀", bg: "from-cyan-500 to-blue-600" },
];

const getStorageKey = (teamId: string) => `football_profile_team_v3_${teamId}`;

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
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isAddTrophyModalOpen, setIsAddTrophyModalOpen] = useState(false);
  const [isJoinLinkModalOpen, setIsJoinLinkModalOpen] = useState(false);

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

  // TÍNH NĂNG 1: Ảnh Logo / Avatar Đội Bóng
  const [logoUrl, setLogoUrl] = useState<string>("");

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

  // TÍNH NĂNG 2: Tủ Cúp & Danh Hiệu Của Đội
  const [trophies, setTrophies] = useState<TeamTrophy[]>([]);
  const [newTrophyName, setNewTrophyName] = useState("");
  const [newTrophyType, setNewTrophyType] = useState<TeamTrophy["type"]>("cup_gold");
  const [newTrophyYear, setNewTrophyYear] = useState("2026");
  const [newTrophyNotes, setNewTrophyNotes] = useState("");

  // TÍNH NĂNG 3: Mã QR & Link Tham Gia Nhóm Zalo do Chủ Đội Tự Tải Lên
  const [zaloQrImage, setZaloQrImage] = useState<string>("");
  const [zaloGroupLink, setZaloGroupLink] = useState<string>("");
  const [isEditingZaloInvite, setIsEditingZaloInvite] = useState(false);
  const [tempZaloLink, setTempZaloLink] = useState("");
  const [tempZaloQr, setTempZaloQr] = useState("");
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const [inviteMsgCopied, setInviteMsgCopied] = useState(false);

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
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.members !== undefined && Array.isArray(data.members)) {
          setMembers(data.members);
        }
        if (data.dnaTags !== undefined && Array.isArray(data.dnaTags)) {
          setDnaTags(data.dnaTags);
        }
        if (data.matchStats !== undefined) setMatchStats(data.matchStats);
        if (data.trophies !== undefined && Array.isArray(data.trophies)) {
          setTrophies(data.trophies);
        }
        if (data.zaloQrImage !== undefined) {
          setZaloQrImage(data.zaloQrImage);
          setTempZaloQr(data.zaloQrImage);
        }
        if (data.zaloGroupLink !== undefined) {
          setZaloGroupLink(data.zaloGroupLink);
          setTempZaloLink(data.zaloGroupLink);
        }
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

  // Render Logo / Avatar Đội
  const renderTeamLogo = () => {
    if (logoUrl?.startsWith("data:image") || logoUrl?.startsWith("http")) {
      return (
        <img
          src={logoUrl}
          alt={teamName}
          className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/20 shrink-0"
        />
      );
    }
    if (logoUrl?.startsWith("preset:")) {
      const parts = logoUrl.split(":");
      const icon = parts[2] || "⚽";
      const bg = parts[3] || "from-emerald-500 to-teal-400";
      return (
        <div
          className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${bg} flex items-center justify-center text-3xl shadow-lg border-2 border-white/20 shrink-0`}
        >
          {icon}
        </div>
      );
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-2xl font-black shadow-lg border-2 border-white/20 shrink-0">
        {teamName ? teamName.slice(0, 2).toUpperCase() : "FC"}
      </div>
    );
  };

  // Xử lý upload ảnh logo từ máy
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Dung lượng ảnh tối đa là 2MB. Vui lòng chọn ảnh nhẹ hơn.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoUrl(base64);
      persistData({ logoUrl: base64 });
      setIsLogoModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý chọn huy hiệu mẫu
  const handleSelectPresetBadge = (badge: (typeof PRESET_BADGES)[0]) => {
    const badgeVal = `preset:${badge.id}:${badge.icon}:${badge.bg}`;
    setLogoUrl(badgeVal);
    persistData({ logoUrl: badgeVal });
    setIsLogoModalOpen(false);
  };

  // Sao chép Thẻ Căn Cước Bóng Đá Số
  const handleCopyCardText = () => {
    const text =
      `⚽ THẺ CĂN CƯỚC BÓNG ĐÁ SỐ: ${teamName}\n` +
      `• Đội trưởng: ${captainName} (${captainPhone || "Chưa có SĐT"})\n` +
      `• Trình độ: Tier ${skillTier} - ${tierInfo.name} (Tuổi TB: ${avgAge}t)\n` +
      `• Điểm tín nhiệm: ${team.trust_score}/100 ★ (Bảo chứng GiaoHuu.vn)\n` +
      `• Địa bàn: ${homeDistrict || "Chưa cập nhật"} ${
        homePitch ? `• Sân nhà: ${homePitch}` : ""
      }\n` +
      (fixedSchedule ? `• Lịch đá: ${fixedSchedule}\n` : "") +
      (jerseyColor ? `• Màu áo: ${jerseyColor}\n` : "") +
      (slogan ? `• Triết lý: “${slogan}”\n` : "") +
      `👉 Giao lưu bắt kèo tại: https://giaohuu.vn`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Mở modal Mã QR & Link Zalo Đội
  const handleOpenJoinLinkModal = () => {
    setTempZaloLink(zaloGroupLink);
    setTempZaloQr(zaloQrImage);
    // Nếu chưa từng tải ảnh QR hoặc link Zalo, mở thẳng form cài đặt
    if (!zaloQrImage && !zaloGroupLink) {
      setIsEditingZaloInvite(true);
    } else {
      setIsEditingZaloInvite(false);
    }
    setIsJoinLinkModalOpen(true);
  };

  // Xử lý upload ảnh mã QR nhóm Zalo từ máy
  const handleUploadZaloQr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Vui lòng chọn ảnh mã QR dung lượng dưới 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setTempZaloQr(result);
    };
    reader.readAsDataURL(file);
  };

  // Lưu cài đặt mã QR & Link Zalo do Chủ đội tự nhập
  const handleSaveZaloInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setZaloQrImage(tempZaloQr);
    setZaloGroupLink(tempZaloLink.trim());
    persistData({
      zaloQrImage: tempZaloQr,
      zaloGroupLink: tempZaloLink.trim(),
    });
    setIsEditingZaloInvite(false);
  };

  // Sao chép link Zalo của đội
  const handleCopyZaloGroupLink = () => {
    if (!zaloGroupLink) return;
    navigator.clipboard.writeText(zaloGroupLink);
    setInviteLinkCopied(true);
    setTimeout(() => setInviteLinkCopied(false), 2500);
  };

  // Sao chép tin nhắn Zalo gửi anh em
  const handleCopyZaloInviteMsg = () => {
    const link = zaloGroupLink || "(Đội trưởng đang cập nhật link Zalo)";
    const msg =
      `⚽ LỜI MỜI VÀO NHÓM ZALO ĐỘI: ${teamName}\n` +
      `Anh em ơi, đây là link tham gia Nhóm Zalo chính thức của đội ${teamName}:\n` +
      `👉 Link Zalo: ${link}\n` +
      `Anh em bấm vào link hoặc quét mã QR nhóm để nhận thông báo lịch đá và điểm danh nhé!`;
    navigator.clipboard.writeText(msg);
    setInviteMsgCopied(true);
    setTimeout(() => setInviteMsgCopied(false), 2500);
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

  // Thêm Cúp / Danh hiệu mới
  const handleAddTrophy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrophyName.trim()) return;
    const newTrophy: TeamTrophy = {
      id: `trophy-${Date.now()}`,
      name: newTrophyName.trim(),
      type: newTrophyType,
      year: newTrophyYear.trim() || "2026",
      notes: newTrophyNotes.trim() || undefined,
    };
    const nextTrophies = [newTrophy, ...trophies];
    setTrophies(nextTrophies);
    persistData({ trophies: nextTrophies });

    setNewTrophyName("");
    setNewTrophyNotes("");
    setIsAddTrophyModalOpen(false);
  };

  // Xóa Cúp
  const handleDeleteTrophy = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh hiệu này?")) {
      const nextTrophies = trophies.filter((t) => t.id !== id);
      setTrophies(nextTrophies);
      persistData({ trophies: nextTrophies });
    }
  };

  // Helper render biểu tượng cúp
  const getTrophyIcon = (type: TeamTrophy["type"]) => {
    switch (type) {
      case "cup_gold":
        return "🏆";
      case "medal_gold":
        return "🥇";
      case "medal_silver":
        return "🥈";
      case "medal_bronze":
        return "🥉";
      case "shield":
        return "🛡️";
      default:
        return "🏆";
    }
  };

  // Thống kê thành phần quân số
  const gkCount = members.filter((m) => m.position === "GK").length;
  const dfCount = members.filter((m) => m.position === "DF").length;
  const mfCount = members.filter((m) => m.position === "MF").length;
  const fwCount = members.filter((m) => m.position === "FW").length;

  // Tính toán các huy hiệu kỷ lục tự động mở khóa
  const autoBadges = [
    {
      title: "Bảo Chứng 100/100",
      desc: "Ký quỹ uy tín tuyệt đối",
      icon: "🛡️",
      achieved: team.trust_score >= 100,
    },
    {
      title: "Đúng Hẹn Vàng",
      desc: "100% đến sân trước 15 phút",
      icon: "⚡",
      achieved: team.late_cancels_count === 0,
    },
    {
      title: "Quý Ông Fair-play",
      desc: "Văn minh, không quẹt bóng",
      icon: "🤝",
      achieved: true,
    },
    {
      title: "Chiến Thắng Liên Tiếp",
      desc: "Tích lũy từ 3 trận thắng trở lên",
      icon: "🔥",
      achieved: matchStats.wins >= 3,
    },
    {
      title: "Chiến Binh Phủi Sân 7",
      desc: "Thi đấu từ 5 trận giao lưu",
      icon: "⚔️",
      achieved: matchStats.total >= 5,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. THẺ CĂN CƯỚC BÓNG ĐÁ SỐ CHÍNH CHỦ (DIGITAL TEAM ID CARD - VINTAGE PAPER SCRAPBOOK) */}
      <div className="card-retro-paper rounded-3xl border border-stone-300/90 bg-[#fbf9f4] p-5 sm:p-6 shadow-paper space-y-4 relative overflow-hidden">
        {/* Washi tape trang trí phong cách báo phủi */}
        <div className="washi-tape -top-2 left-8 rotate-[-2deg]" />
        <div className="washi-tape -top-2 right-8 rotate-[2deg]" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-3.5">
            {/* TÍNH NĂNG 1: Avatar / Logo Đội Bóng Có Thể Upload & Chọn Mẫu */}
            <div className="relative group shrink-0">
              {renderTeamLogo()}
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-900 hover:bg-emerald-600 border border-stone-400 text-stone-200 hover:text-white flex items-center justify-center text-xs shadow-md transition-all active:scale-95"
                title="Thay đổi ảnh Logo đội bóng"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {matchStats.total < 3 ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold uppercase tracking-wider shadow-2xs">
                    🌱 Đội Mới ({matchStats.total} Trận)
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 border border-sky-300 font-extrabold uppercase tracking-wider shadow-2xs">
                    ⭐ Đã Xác Thực ({matchStats.total} Trận)
                  </span>
                )}
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold shadow-2xs">
                  ★ Bảo Chứng GiaoHuu.vn
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-0.5">
                <h2 className="font-headline text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                  {teamName || "Chưa đặt tên đội"}
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              </div>

              <p className="text-xs text-stone-700">
                Đội trưởng:{" "}
                <strong className="text-stone-900 font-bold">{captainName}</strong>
                {captainPhone ? (
                  <>
                    {" "}
                    •{" "}
                    <span className="font-mono text-emerald-800 font-bold">
                      {captainPhone}
                    </span>
                  </>
                ) : (
                  <span className="text-stone-500 italic ml-1">
                    (Chưa có SĐT)
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border shadow-2xs ${tierInfo.badgeColor}`}
                >
                  Tier {skillTier}: {tierInfo.name}
                </span>
                <span className="text-stone-600 font-medium text-[11px]">
                  Tuổi TB: <strong className="text-stone-800">{avgAge}t</strong>
                </span>
                <span className="text-stone-600 font-medium text-[11px]">
                  • Áo chính:{" "}
                  <strong className="text-emerald-800">
                    {jerseyColor || "Chưa cập nhật"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Khối Điểm Tín Nhiệm & Trạng thái cọc (Phong cách Tem Nhãn Báo Phủi) */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 p-3 rounded-2xl bg-[#ede8dc] border border-stone-300/80 shrink-0 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-600">
              Điểm Tín Nhiệm
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-800">
              <CountUpNumber end={team.trust_score} duration={1200} />
              <span className="text-xs text-stone-500 font-bold">/100</span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
              {team.trust_score >= 70 ? "Miễn cọc 100%" : "Cọc 200k"}
            </span>
          </div>
        </div>

        {/* 3 Thẻ Thông Tin Nhanh */}
        <div className="grid grid-cols-3 gap-2.5 bg-[#ede8dc] p-3 rounded-2xl border border-stone-300/80 text-center text-xs relative z-10 shadow-inner">
          <div>
            <span className="text-[10px] text-stone-600 block font-semibold">
              Địa bàn sinh hoạt
            </span>
            <span className="font-headline font-black text-stone-900 text-xs sm:text-sm">
              {homeDistrict || "Chưa cập nhật"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-600 block font-semibold">
              Đánh giá văn minh
            </span>
            <span className="font-headline font-black text-emerald-800 text-xs sm:text-sm flex items-center justify-center gap-1">
              {matchStats.total > 0 ? (
                <>
                  <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                  5.0 ★ Chuẩn Phủi
                </>
              ) : (
                <span className="text-stone-600 font-bold text-xs">
                  ★ Đội Mới
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-stone-600 block font-semibold">
              Quân số đội
            </span>
            <span className="font-headline font-black text-amber-900 text-xs sm:text-sm">
              {members.length} Cầu thủ
            </span>
          </div>
        </div>

        {/* Lộ Trình Đá Đẹp Xóa Án Tích & Phục Hồi 100 Điểm (Nếu bị trừ điểm) */}
        {team.trust_score < 100 && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs relative z-10 shadow-2xs">
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-600" />
                Lộ Trình Đá Đẹp Xóa Án Tích &amp; Phục Hồi 100 Điểm
              </span>
              <p className="text-[11px] text-stone-700 leading-relaxed">
                Mỗi trận hoàn thành qua Mã Bắt Tay được <strong className="text-emerald-800">+5đ</strong>. Chuỗi <strong className="text-stone-900">5 trận Fair-play liên tiếp</strong> sẽ tự động xóa sạch nhãn đỏ vi phạm và phục hồi trọn vẹn 100/100 điểm tín nhiệm!
              </p>
            </div>
            <div className="flex items-center sm:flex-col items-end gap-1 shrink-0 bg-[#ede8dc] px-3 py-1.5 rounded-xl border border-amber-300">
              <span className="text-[10px] text-stone-600 font-bold uppercase">Tiến Độ Xóa Phạt</span>
              <span className="text-sm font-mono font-black text-amber-900">
                {matchStats.total % 5}/5 Trận
              </span>
            </div>
          </div>
        )}

        {/* Thanh công cụ quản trị đội bóng - Emil Kowalski Tactile Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 relative z-10 border-t border-stone-200/80">
          <span className="text-[11px] font-mono text-stone-600 flex items-center">
            <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>ID: #{team.id.slice(0, 8).toUpperCase()}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nút Sửa Hồ Sơ */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-paper-tactile px-3 py-1.5 bg-[#ede8dc] hover:bg-stone-200 text-stone-800 hover:text-stone-900 rounded-xl text-xs font-bold border border-stone-300/90 flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Sửa Hồ Sơ</span>
            </button>

            {/* TÍNH NĂNG 3: Nút Mời Vào Đội (Mã QR & Link Zalo) */}
            <button
              onClick={handleOpenJoinLinkModal}
              className="btn-paper-tactile px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300/80 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-700" />
              <span>QR &amp; Link Zalo Đội</span>
            </button>

            {/* Nút Đăng Kèo Nhanh */}
            {onQuickCreateMatch && (
              <button
                onClick={onQuickCreateMatch}
                className="btn-paper-tactile px-3.5 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black flex items-center space-x-1.5 transition-all shadow-md shadow-orange-900/20 active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mở Kèo Đội Tôi</span>
              </button>
            )}

            {/* Nút Chia Sẻ Zalo */}
            <button
              onClick={handleCopyCardText}
              className="btn-paper-tactile px-3 py-1.5 bg-[#ede8dc] hover:bg-stone-200 active:scale-95 text-stone-800 rounded-xl text-xs font-bold border border-stone-300/90 flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-emerald-800">Đã chép thẻ!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Chia sẻ Zalo</span>
                </>
              )}
            </button>

            {/* Nút Đăng Xuất */}
            {onSignOut && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản Đội trưởng?")) {
                    onSignOut();
                  }
                }}
                title="Đăng xuất tài khoản Đội trưởng"
                className="btn-paper-tactile px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border border-rose-300/80 flex items-center space-x-1.5 transition-all shadow-2xs active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. VÍ KÝ QUỸ NỘI BỘ & TÍCH HỢP TRỰC TIẾP CHO ĐỘI BÓNG */}
      <div className="card-retro-paper rounded-2xl border border-stone-300/90 bg-[#fbf9f4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-paper">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800 shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-sm font-extrabold text-stone-900">
                Ví Ký Quỹ Nội Bộ Đội {teamName || "Bóng Đá"}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                {team.trust_score >= 70 ? "Miễn cọc 100%" : "Cọc 200k"}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Số dư bảo chứng:{" "}
              <strong className="text-emerald-700 font-mono">
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
            className="btn-paper-tactile h-9 px-3.5 rounded-xl border-sky-300 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs gap-1.5 shrink-0"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Quản Lý Nạp / Rút Ví</span>
          </Button>
        )}
      </div>

      {/* 3. LƯỚI 2 CỘT: SÂN NHÀ & BẢNG THÀNH TÍCH PHONG ĐỘ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cột Trái: Thông tin Sân Nhà, Giờ Đá & Triết Lý */}
        <div className="card-retro-paper rounded-2xl border border-stone-300/90 bg-[#fbf9f4] p-4 space-y-3 shadow-paper">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-headline text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Sân Nhà &amp; Lịch Sinh Hoạt</span>
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-[11px] font-bold text-amber-700 hover:underline"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                Sân hay đá nhất:
              </span>
              {homePitch ? (
                <strong className="text-stone-900">{homePitch}</strong>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-stone-500 hover:text-amber-700 italic text-[11px]"
                >
                  + Bấm để cập nhật sân nhà
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Lịch đá cố định:
              </span>
              {fixedSchedule ? (
                <strong className="text-amber-800 font-mono">
                  {fixedSchedule}
                </strong>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-stone-500 hover:text-amber-700 italic text-[11px]"
                >
                  + Bấm để cập nhật lịch đá
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-sky-700" />
                Màu áo chính / phụ:
              </span>
              <span className="text-stone-800">
                {jerseyColor || awayJerseyColor ? (
                  <>
                    <strong className="text-emerald-800">
                      {jerseyColor || "Chưa chọn"}
                    </strong>{" "}
                    / {awayJerseyColor || "Chưa chọn"}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-stone-500 hover:text-amber-700 italic text-[11px]"
                  >
                    + Cập nhật màu áo
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* Slogan đội */}
          <div className="rounded-xl bg-[#ede8dc] border border-stone-300/80 p-3">
            <span className="text-[10px] text-stone-500 font-bold block uppercase tracking-wider">
              Khẩu hiệu / Triết lý bóng đá
            </span>
            {slogan ? (
              <p className="text-xs text-stone-800 italic mt-1 font-medium">
                “{slogan}”
              </p>
            ) : (
              <p
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-stone-500 italic mt-1 cursor-pointer hover:text-amber-700"
              >
                Chưa có khẩu hiệu. Bấm "Chỉnh sửa" để thêm triết lý bóng đá của
                đội bạn!
              </p>
            )}
          </div>
        </div>

        {/* Cột Phải: Bảng Phong Độ & Thành Tích Thật */}
        <div className="card-retro-paper rounded-2xl border border-stone-300/90 bg-[#fbf9f4] p-4 space-y-3 shadow-paper">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-headline text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span>Phong Độ &amp; Thành Tích Giao Lưu</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLogMatchModalOpen(true)}
                className="text-[11px] font-extrabold text-emerald-800 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>+ Ghi Nhận Trận</span>
              </button>
              {matchStats.total > 0 && (
                <button
                  onClick={handleResetMatchStats}
                  title="Đặt lại thành tích về 0"
                  className="text-stone-400 hover:text-rose-600 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Thống kê tỷ lệ Thắng - Hòa - Thua */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-[#ede8dc] border border-stone-300/80">
              <span className="text-[10px] text-stone-600 block">Tổng trận</span>
              <span className="text-base font-black text-stone-900">
                {matchStats.total}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-100/90 border border-emerald-300">
              <span className="text-[10px] text-emerald-800 block font-bold">
                Thắng
              </span>
              <span className="text-base font-black text-emerald-900">
                {matchStats.wins}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-amber-100/90 border border-amber-300">
              <span className="text-[10px] text-amber-800 block font-bold">
                Hòa
              </span>
              <span className="text-base font-black text-amber-900">
                {matchStats.draws}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-100/90 border border-rose-300">
              <span className="text-[10px] text-rose-800 block font-bold">
                Thua
              </span>
              <span className="text-base font-black text-rose-900">
                {matchStats.losses}
              </span>
            </div>
          </div>

          {/* Chuỗi 5 trận gần nhất */}
          <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-stone-300/80 flex items-center justify-between">
            <span className="text-xs text-stone-600 font-medium">
              Phong độ 5 trận gần nhất:
            </span>
            <div className="flex items-center gap-1.5">
              {matchStats.recentForm.length > 0 ? (
                matchStats.recentForm.map((f, idx) => (
                  <span
                    key={idx}
                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                      f === "W"
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : f === "D"
                        ? "bg-amber-500 text-stone-900"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-stone-500 text-[11px] italic">
                  Chưa có trận đấu nào
                </span>
              )}
            </div>
          </div>

          {/* 3 Cam kết văn minh */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
            <div className="p-1.5 rounded-lg bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 block">Đúng giờ</span>
              <strong className="text-emerald-800 text-xs">
                {matchStats.total > 0 ? "100%" : "Mới"}
              </strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 block">Không bỏ cuộc</span>
              <strong className="text-emerald-800 text-xs">100%</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#ede8dc] border border-stone-300/80">
              <span className="text-stone-600 block">Trả sân sòng phẳng</span>
              <strong className="text-emerald-800 text-xs">100%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* TÍNH NĂNG 2: TỦ CÚP & HUY HIỆU DANH DỰ (TROPHY CABINET & RECORD BADGES) */}
      <div className="card-retro-paper rounded-2xl border border-amber-300/80 bg-[#fbf9f4] p-4 sm:p-5 space-y-4 shadow-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-sm font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-700" />
                <span>Tủ Cúp &amp; Huy Hiệu Danh Dự Của Đội</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {trophies.length} Cúp / Danh hiệu
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Vinh danh các danh hiệu cúp giao lưu, giải phủi và huy hiệu uy tín
              của đội
            </p>
          </div>

          <Button
            onClick={() => setIsAddTrophyModalOpen(true)}
            className="btn-paper-tactile h-8 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs gap-1 shadow-2xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Thêm Cúp / Danh Hiệu</span>
          </Button>
        </div>

        {/* 1. Các Huy Hiệu Kỷ Lục Tự Động */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            ⭐ Huy Hiệu Kỷ Lục Uy Tín (Bảo Chứng BắtKèo7):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {autoBadges.map((badge, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                  badge.achieved
                    ? "bg-[#ede8dc] border-amber-300 text-stone-900 shadow-2xs"
                    : "bg-[#f5f1e8] border-stone-200 text-stone-500 opacity-60"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-xs font-bold leading-tight line-clamp-1">
                  {badge.title}
                </span>
                <span className="text-[9px] text-stone-500 leading-tight line-clamp-1">
                  {badge.desc}
                </span>
                {badge.achieved && (
                  <span className="text-[8px] font-black uppercase text-amber-800 mt-0.5">
                    ✓ Đã Mở Khóa
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. Danh Sách Cúp Giao Lưu Do Đội Tự Thêm */}
        <div className="space-y-2 pt-2 border-t border-stone-200">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            🏆 Cúp &amp; Giải Đấu Từng Đạt Được:
          </span>

          {trophies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {trophies.map((trophy) => (
                <div
                  key={trophy.id}
                  className="p-3 rounded-xl bg-[#ede8dc] border border-amber-300/80 flex items-center justify-between gap-2.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">
                      {getTrophyIcon(trophy.type)}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-stone-900 truncate">
                        {trophy.name}
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold">
                        Năm {trophy.year}
                        {trophy.notes ? ` • ${trophy.notes}` : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteTrophy(trophy.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition shrink-0"
                    title="Xóa danh hiệu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-[#ede8dc]/50 text-center space-y-1">
              <p className="text-xs text-amber-900 font-bold">
                Tủ cúp của đội hiện đang chờ chiếc cúp đầu tiên!
              </p>
              <p className="text-[11px] text-stone-600">
                Hãy bấm{" "}
                <strong className="text-amber-800">
                  + Thêm Cúp / Danh Hiệu
                </strong>{" "}
                để ghi danh cúp tứ hùng, giải phong trào hoặc kỷ niệm chương của
                anh em!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. QUẢN LÝ ĐỘI HÌNH & DANH SÁCH CẦU THỦ */}
      <div className="card-retro-paper rounded-2xl border border-stone-300/90 bg-[#fbf9f4] p-4 sm:p-5 space-y-3.5 shadow-paper">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Danh Sách Cầu Thủ Đội Bóng ({members.length})</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 border border-stone-300">
                {gkCount} GK • {dfCount} DF • {mfCount} MF • {fwCount} FW
              </span>
            </div>
            <p className="text-[11px] text-stone-600 mt-0.5">
              Quản lý danh sách cầu thủ chính thức, số áo và vị trí thi đấu
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenJoinLinkModal}
              variant="outline"
              className="btn-paper-tactile h-8 px-3 rounded-xl border-sky-300 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs gap-1"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>QR &amp; Link Zalo Đội</span>
            </Button>
            <Button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="btn-paper-tactile h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs gap-1 shadow-2xs active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Thêm Cầu Thủ</span>
            </Button>
          </div>
        </div>

        {/* Danh sách cầu thủ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {members.map((mem) => (
            <div
              key={mem.id}
              className="p-3 rounded-xl bg-[#ede8dc] border border-stone-300/80 hover:border-emerald-600/40 transition flex items-center justify-between gap-2 text-stone-900"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Số áo */}
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  #{mem.number}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 truncate">
                      {mem.name}
                    </span>
                    {mem.role === "Đội trưởng" && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-stone-950 shrink-0">
                        C
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-stone-600 flex items-center gap-1.5">
                    <span
                      className={`font-black ${
                        mem.position === "GK"
                          ? "text-amber-700"
                          : mem.position === "DF"
                          ? "text-blue-700"
                          : mem.position === "MF"
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {mem.position}
                    </span>
                    <span>• {mem.role}</span>
                    {mem.phone && (
                      <span className="font-mono text-stone-500">
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
                  className="p-1 text-stone-400 hover:text-rose-600 transition"
                  title="Gỡ cầu thủ"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {members.length <= 1 && (
            <div className="col-span-full p-4 rounded-xl border border-dashed border-stone-300 bg-[#ede8dc]/40 text-center space-y-1.5">
              <p className="text-xs text-stone-800 font-bold">
                Đội hiện chỉ có Đội trưởng trong danh sách
              </p>
              <p className="text-[11px] text-stone-600">
                Hãy bấm{" "}
                <strong className="text-emerald-700 font-semibold">
                  + Thêm Cầu Thủ
                </strong>{" "}
                hoặc bấm{" "}
                <button
                  type="button"
                  onClick={handleOpenJoinLinkModal}
                  className="text-sky-700 font-bold underline hover:text-sky-800"
                >
                  Cài Đặt QR &amp; Link Zalo
                </button>{" "}
                để chia sẻ mã QR vào nhóm cho anh em tham gia!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 5. DNA & VĂN HÓA GIAO LƯU CỦA ĐỘI (1-CLICK PRESET PICKER & CUSTOM) */}
      <div className="card-retro-paper rounded-2xl border border-stone-300/90 bg-[#fbf9f4] p-4 space-y-3 shadow-paper">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>DNA &amp; Văn Hóa Giao Lưu Của Đội</span>
          </h3>
          <span className="text-[11px] text-stone-500">
            {dnaTags.length} nét văn hóa
          </span>
        </div>

        {/* Danh sách Tag đã chọn */}
        {dnaTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-0.5">
            {dnaTags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-[#ede8dc] border border-emerald-400 text-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleToggleDnaTag(tag)}
                  className="w-4 h-4 rounded-full hover:bg-stone-300 flex items-center justify-center text-stone-500 hover:text-rose-600 transition ml-0.5"
                  title="Gỡ tag này"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl border border-dashed border-stone-300 bg-[#ede8dc]/40 text-center text-xs text-stone-500">
            Chưa thiết lập DNA văn hóa đội bóng. Hãy bấm chọn nhanh các nét đặc
            trưng dưới đây:
          </div>
        )}

        {/* Thư viện Tag Gợi Ý 1-Chạm (Quick Preset Chips) */}
        <div className="pt-2 border-t border-stone-200 space-y-2">
          <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block">
            💡 Gợi ý văn hóa bóng đá phủi (Bấm để thêm vào đội):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_DNA_TAGS.filter((t) => !dnaTags.includes(t)).map(
              (tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleDnaTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 border border-stone-300 text-[11px] text-stone-800 font-medium flex items-center gap-1 transition active:scale-95"
                >
                  <Plus className="w-3 h-3 text-emerald-700" />
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
            className="flex-1 h-8 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 text-xs placeholder:text-stone-400"
          />
          <Button
            type="submit"
            className="btn-paper-tactile h-8 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-emerald-300 text-xs font-bold shrink-0"
          >
            + Thêm
          </Button>
        </form>
      </div>

      {/* MODAL 1: CHỈNH SỬA HỒ SƠ ĐỘI BÓNG CHÍNH CHỦ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="modal-spring-enter card-retro-paper w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#fbf9f4] border border-stone-300/90 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-stone-900">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-300 bg-[#ede8dc]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  Quản Trị Hồ Sơ Chính Chủ
                </span>
                <h3 className="font-headline text-base font-extrabold text-stone-900 mt-0.5">
                  Chỉnh Sửa Thông Tin Đội Bóng
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tên Đội Bóng
                  </label>
                  <input
                    type="text"
                    required
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="VD: FC Tấu Hề"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-bold focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tên Đội Trưởng
                  </label>
                  <input
                    type="text"
                    required
                    value={captainName}
                    onChange={(e) => setCaptainName(e.target.value)}
                    placeholder="VD: Anh Tuấn"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SĐT Zalo Đội Trưởng
                  </label>
                  <input
                    type="tel"
                    required
                    value={captainPhone}
                    onChange={(e) => setCaptainPhone(e.target.value)}
                    placeholder="VD: 0988.234.567"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-emerald-800 font-mono font-bold focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Địa Bàn Quận
                  </label>
                  <input
                    type="text"
                    value={homeDistrict}
                    onChange={(e) => setHomeDistrict(e.target.value)}
                    placeholder="VD: Cầu Giấy, Nam Từ Liêm..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tuổi Trung Bình
                  </label>
                  <input
                    type="number"
                    min={16}
                    max={60}
                    value={avgAge}
                    onChange={(e) => setAvgAge(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Phân Tầng Trình Độ
                  </label>
                  <select
                    value={skillTier}
                    onChange={(e) =>
                      setSkillTier(Number(e.target.value) as SkillTier)
                    }
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-bold focus:border-stone-800 focus:outline-none"
                  >
                    <option value={1}>Tier 1: Dưỡng sinh (Cấm va chạm)</option>
                    <option value={2}>Tier 2: Phong trào</option>
                    <option value={3}>Tier 3: Phủi chiến cọ xát</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Màu Áo Đấu Chính
                  </label>
                  <input
                    type="text"
                    value={jerseyColor}
                    onChange={(e) => setJerseyColor(e.target.value)}
                    placeholder="VD: Đỏ truyền thống, Xanh rêu..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Màu Áo Phụ (Dự phòng)
                  </label>
                  <input
                    type="text"
                    value={awayJerseyColor}
                    onChange={(e) => setAwayJerseyColor(e.target.value)}
                    placeholder="VD: Trắng, Xanh..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Sân Nhà Hay Đá
                  </label>
                  <input
                    type="text"
                    value={homePitch}
                    onChange={(e) => setHomePitch(e.target.value)}
                    placeholder="VD: Sân Thành Phát, Sân Mễ Trì..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block font-semibold text-stone-700 mb-1">
                    Lịch Đá Quen Thuộc
                  </label>
                  <input
                    type="text"
                    value={fixedSchedule}
                    onChange={(e) => setFixedSchedule(e.target.value)}
                    placeholder="VD: Tối Thứ 3 & Thứ 5 (19h00)"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Slogan / Triết Lý Bóng Đá
                </label>
                <textarea
                  rows={2}
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="VD: Đá bóng vui vẻ sau giờ làm, văn minh không quẹt bóng, có nước mía giao lưu..."
                  className="w-full p-2.5 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 text-xs focus:border-stone-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-9 text-xs text-stone-600 hover:text-stone-900"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="btn-paper-tactile h-9 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-2xs"
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
          <div className="modal-spring-enter card-retro-paper w-full max-w-sm rounded-2xl bg-[#fbf9f4] border border-stone-300/90 shadow-2xl p-5 space-y-3.5 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-headline text-sm font-extrabold text-stone-900">
                Thêm Cầu Thủ Vào Đội {teamName || "Bóng Đá"}
              </h3>
              <button
                onClick={() => setIsAddMemberModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên / Biệt danh cầu thủ
                </label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="VD: Tuấn 'Cò', Văn Hải..."
                  className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Số áo
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={newMemberNumber}
                    onChange={(e) => setNewMemberNumber(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-emerald-800 font-mono font-bold focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Vị trí
                  </label>
                  <select
                    value={newMemberPosition}
                    onChange={(e) =>
                      setNewMemberPosition(
                        e.target.value as "GK" | "DF" | "MF" | "FW"
                      )
                    }
                    className="w-full h-9 px-2 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
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
                  <label className="block font-semibold text-stone-700 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) =>
                      setNewMemberRole(
                        e.target.value as "Đội trưởng" | "Đội phó" | "Thành viên"
                      )
                    }
                    className="w-full h-9 px-2 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Đội phó">Đội phó</option>
                    <option value="Đội trưởng">Đội trưởng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    SĐT / Zalo (Tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="VD: 0912..."
                    className="w-full h-9 px-2.5 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-mono text-[11px] focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="h-8 text-xs text-stone-600 hover:text-stone-900"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="btn-paper-tactile h-8 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-2xs"
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
          <div className="modal-spring-enter card-retro-paper w-full max-w-sm rounded-2xl bg-[#fbf9f4] border border-stone-300/90 shadow-2xl p-5 space-y-3.5 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800">
                  Ghi Nhận Phong Độ Thật
                </span>
                <h3 className="font-headline text-sm font-extrabold text-stone-900 mt-0.5">
                  Cập Nhật Trận Đấu Mới
                </h3>
              </div>
              <button
                onClick={() => setIsLogMatchModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMatchLog} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Kết quả trận đấu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogResult("W")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "W"
                        ? "bg-emerald-700 text-white border-emerald-800 shadow-2xs"
                        : "bg-[#ede8dc] text-emerald-900 border-stone-300"
                    }`}
                  >
                    🟢 Thắng (W)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogResult("D")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "D"
                        ? "bg-amber-500 text-stone-950 border-amber-600 shadow-2xs"
                        : "bg-[#ede8dc] text-amber-900 border-stone-300"
                    }`}
                  >
                    🟡 Hòa (D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogResult("L")}
                    className={`py-2 rounded-xl text-xs font-black border transition ${
                      logResult === "L"
                        ? "bg-rose-700 text-white border-rose-800 shadow-2xs"
                        : "bg-[#ede8dc] text-rose-900 border-stone-300"
                    }`}
                  >
                    🔴 Thua (L)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên đội đối thủ (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={logOpponent}
                  onChange={(e) => setLogOpponent(e.target.value)}
                  placeholder="VD: FC Giao Thông, FC Vinaconex..."
                  className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tỷ số trận đấu (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={logScore}
                  onChange={(e) => setLogScore(e.target.value)}
                  placeholder="VD: 4 - 2, 3 - 3..."
                  className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-mono focus:border-stone-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsLogMatchModalOpen(false)}
                  className="h-8 text-xs text-stone-600 hover:text-stone-900"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="btn-paper-tactile h-8 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-2xs"
                >
                  Lưu Kết Quả
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TÍNH NĂNG 1: MODAL ĐỔI ẢNH LOGO / AVATAR ĐỘI BÓNG */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="modal-spring-enter card-retro-paper w-full max-w-md rounded-2xl bg-[#fbf9f4] border border-stone-300/90 shadow-2xl p-5 space-y-4 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-800">
                  Nhận Diện Đội Bóng
                </span>
                <h3 className="font-headline text-sm font-extrabold text-stone-900 mt-0.5">
                  Đổi Ảnh Logo / Avatar Đội
                </h3>
              </div>
              <button
                onClick={() => setIsLogoModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Xem trước Logo hiện tại */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ede8dc] border border-stone-300/80">
              {renderTeamLogo()}
              <div>
                <h4 className="text-xs font-bold text-stone-900">Logo hiện tại</h4>
                <p className="text-[10px] text-stone-600">
                  Logo hiển thị trên Thẻ Căn Cước, Thẻ Ghép Kèo và BXH
                </p>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoUrl("");
                      persistData({ logoUrl: "" });
                    }}
                    className="text-[10px] text-rose-700 hover:underline mt-1 font-bold"
                  >
                    Gỡ logo (Dùng 2 chữ cái đầu)
                  </button>
                )}
              </div>
            </div>

            {/* Cách 1: Tải ảnh từ thiết bị */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-stone-700">
                1. Tải ảnh từ điện thoại / máy tính:
              </label>
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-emerald-600/40 bg-emerald-50 hover:bg-emerald-100 cursor-pointer transition text-center space-y-1">
                <Upload className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-stone-900">
                  Chọn tệp ảnh logo (PNG, JPG, WebP)
                </span>
                <span className="text-[10px] text-stone-500">
                  Tối đa 2MB • Tỉ lệ vuông đẹp nhất
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Cách 2: Chọn từ Bộ Huy Hiệu Phủi Có Sẵn */}
            <div className="space-y-1.5 pt-2 border-t border-stone-200">
              <label className="block font-semibold text-stone-700">
                2. Hoặc chọn nhanh từ Bộ Huy Hiệu Phủi Độc Quyền:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_BADGES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectPresetBadge(b)}
                    className="p-2 rounded-xl bg-[#ede8dc] hover:bg-stone-200 border border-stone-300/80 hover:border-amber-500 flex flex-col items-center justify-center gap-1 transition active:scale-95 group"
                    title={b.label}
                  >
                    <span className="text-2xl group-hover:scale-110 transition">
                      {b.icon}
                    </span>
                    <span className="text-[9px] font-bold text-stone-800 text-center leading-tight">
                      {b.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-stone-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsLogoModalOpen(false)}
                className="h-8 text-xs text-stone-600 hover:text-stone-900"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TÍNH NĂNG 2: MODAL THÊM CÚP / DANH HIỆU */}
      {isAddTrophyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="modal-spring-enter card-retro-paper w-full max-w-sm rounded-2xl bg-[#fbf9f4] border border-amber-300 shadow-2xl p-5 space-y-3.5 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800">
                  Vinh Danh Thành Tích
                </span>
                <h3 className="font-headline text-sm font-extrabold text-stone-900 mt-0.5">
                  Thêm Cúp / Danh Hiệu
                </h3>
              </div>
              <button
                onClick={() => setIsAddTrophyModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTrophy} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Biểu tượng danh hiệu
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { type: "cup_gold", icon: "🏆", label: "Cúp Vàng" },
                    { type: "medal_gold", icon: "🥇", label: "HC Vàng" },
                    { type: "medal_silver", icon: "🥈", label: "HC Bạc" },
                    { type: "medal_bronze", icon: "🥉", label: "HC Đồng" },
                    { type: "shield", icon: "🛡️", label: "Kỷ Niệm" },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() =>
                        setNewTrophyType(item.type as TeamTrophy["type"])
                      }
                      className={`p-2 rounded-xl border text-center transition ${
                        newTrophyType === item.type
                          ? "bg-amber-200 border-amber-500 text-amber-950 font-bold ring-1 ring-amber-500"
                          : "bg-[#ede8dc] border-stone-300 text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      <div className="text-xl">{item.icon}</div>
                      <div className="text-[9px] mt-0.5">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tên giải đấu / Cúp đạt được
                </label>
                <input
                  type="text"
                  required
                  value={newTrophyName}
                  onChange={(e) => setNewTrophyName(e.target.value)}
                  placeholder="VD: Vô Địch Giải Tứ Hùng Cầu Giấy..."
                  className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Năm / Mùa giải
                  </label>
                  <input
                    type="text"
                    required
                    value={newTrophyYear}
                    onChange={(e) => setNewTrophyYear(e.target.value)}
                    placeholder="VD: 2026, Mùa Hè 2025"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-mono focus:border-stone-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Ghi chú thêm (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={newTrophyNotes}
                    onChange={(e) => setNewTrophyNotes(e.target.value)}
                    placeholder="VD: Bất bại 5 trận..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:border-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsAddTrophyModalOpen(false)}
                  className="h-8 text-xs text-stone-600 hover:text-stone-900"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="btn-paper-tactile h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-2xs"
                >
                  Lưu Vào Tủ Cúp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TÍNH NĂNG 3: MODAL MÃ QR & LINK NHÓM ZALO DO CHỦ ĐỘI TỰ TẢI LÊN */}
      {isJoinLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="modal-spring-enter card-retro-paper w-full max-w-md rounded-2xl bg-[#fbf9f4] border border-sky-300 shadow-2xl p-5 space-y-4 text-xs text-stone-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-800">
                  Kết Nối Anh Em Đội Bóng
                </span>
                <h3 className="font-headline text-sm font-extrabold text-stone-900 mt-0.5">
                  Mã QR &amp; Link Tham Gia Nhóm Zalo Đội
                </h3>
              </div>
              <button
                onClick={() => setIsJoinLinkModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CHẾ ĐỘ 1: FORM CÀI ĐẶT / TẢI LÊN MÃ QR & LINK ZALO */}
            {isEditingZaloInvite || (!zaloQrImage && !zaloGroupLink) ? (
              <form onSubmit={handleSaveZaloInvite} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-900 leading-relaxed">
                  📢 <strong>Chủ đội tự tải lên:</strong> Hãy tải ảnh mã QR nhóm Zalo thật của đội bạn và dán link mời Zalo vào bên dưới để anh em có thể quét mã hoặc bấm link tham gia đội nhé!
                </div>

                {/* 1. Tải ảnh mã QR Nhóm Zalo */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-800">
                    1. Tải lên ảnh mã QR Nhóm Zalo của đội:
                  </label>
                  {tempZaloQr ? (
                    <div className="p-3 rounded-xl bg-[#ede8dc] border border-stone-300 flex flex-col items-center justify-center gap-2">
                      <img
                        src={tempZaloQr}
                        alt="Ảnh QR Zalo Đội"
                        className="w-40 h-40 rounded-xl p-1.5 bg-white border border-sky-300 shadow-md object-contain"
                      />
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-sky-900 font-bold text-xs inline-flex items-center gap-1 border border-stone-300">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Đổi ảnh QR khác</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadZaloQr}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setTempZaloQr("")}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs inline-flex items-center gap-1 border border-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Gỡ</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-sky-300 hover:border-sky-400 bg-sky-50/50 p-5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition space-y-1.5">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sky-900 text-xs">
                        Bấm để chọn ảnh mã QR Zalo từ máy
                      </span>
                      <span className="text-[10px] text-stone-500 text-center">
                        Hỗ trợ PNG, JPG, WebP tối đa 2MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadZaloQr}
                        className="hidden"
                      />
                    </label>
                  )}
                  <p className="text-[10px] text-stone-500 italic">
                    💡 <strong>Cách lấy mã QR Zalo:</strong> Vào app Zalo ➔ Vào Nhóm đội bóng ➔ Bấm Menu ☰ (góc trên phải) ➔ Chọn "Mã QR của nhóm" ➔ Bấm "Lưu ảnh" rồi tải lên đây.
                  </p>
                </div>

                {/* 2. Dán Link Tham Gia Nhóm Zalo */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-stone-800">
                    2. Dán link mời tham gia Nhóm Zalo của đội:
                  </label>
                  <input
                    type="url"
                    value={tempZaloLink}
                    onChange={(e) => setTempZaloLink(e.target.value)}
                    placeholder="VD: https://zalo.me/g/abcdef123 (hoặc link Zalo Đội trưởng)"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-sky-900 placeholder:text-stone-400 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                  <p className="text-[10px] text-stone-500 italic">
                    💡 <strong>Cách lấy link Zalo:</strong> Vào Nhóm chat Zalo ➔ Chọn "Link tham gia nhóm" ➔ "Sao chép link" rồi dán vào ô trên.
                  </p>
                </div>

                {/* Nút bấm Lưu */}
                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                  {(zaloQrImage || zaloGroupLink) && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditingZaloInvite(false)}
                      className="h-9 text-xs text-stone-600 hover:text-stone-900"
                    >
                      Hủy
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="btn-paper-tactile h-9 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs gap-1.5 shadow-2xs"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Lưu Mã QR &amp; Link Zalo Đội</span>
                  </Button>
                </div>
              </form>
            ) : (
              /* CHẾ ĐỘ 2: HIỂN THỊ MÃ QR & LINK ZALO DO CHỦ ĐỘI TẢI LÊN */
              <div className="space-y-4">
                {/* Khối hiển thị ảnh QR thật */}
                <div className="p-4 rounded-2xl bg-[#ede8dc] border border-stone-300/80 text-center space-y-2">
                  {zaloQrImage ? (
                    <>
                      <img
                        src={zaloQrImage}
                        alt="Mã QR Nhóm Zalo"
                        className="w-44 h-44 rounded-2xl border-2 border-emerald-600/40 p-2 bg-white mx-auto shadow-md object-contain"
                      />
                      <p className="text-xs font-bold text-stone-900">
                        Mã QR Nhóm Zalo: {teamName || "Đội Bóng"}
                      </p>
                      <p className="text-[10px] text-stone-600">
                        Mở camera Zalo trên điện thoại quét mã để vào thẳng nhóm chat của đội
                      </p>
                    </>
                  ) : (
                    <div className="py-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-stone-200 border border-dashed border-stone-300 text-stone-500 mx-auto flex items-center justify-center">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Chưa có ảnh mã QR Zalo
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Chủ đội hãy bấm nút "Cài Đặt / Đổi QR &amp; Link" bên dưới để tải ảnh lên.
                      </p>
                    </div>
                  )}
                </div>

                {/* Khối hiển thị Link Zalo */}
                <div className="space-y-1">
                  <label className="block font-semibold text-stone-800">
                    Link tham gia Nhóm Zalo:
                  </label>
                  {zaloGroupLink ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={zaloGroupLink}
                        className="flex-1 h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-sky-900 font-mono text-[11px] truncate"
                      />
                      <Button
                        type="button"
                        onClick={handleCopyZaloGroupLink}
                        className="btn-paper-tactile h-9 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-900 font-bold text-xs gap-1 shrink-0"
                      >
                        {inviteLinkCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã chép!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </Button>
                      <a
                        href={zaloGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 px-2.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-bold text-xs flex items-center justify-center shrink-0"
                        title="Mở Zalo tham gia nhóm ngay"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-dashed border-stone-300 text-stone-500 text-[11px] text-center">
                      Chủ đội chưa dán link Zalo
                    </div>
                  )}
                </div>

                {/* Soạn sẵn tin nhắn gửi anh em */}
                <div className="p-3 rounded-xl bg-[#ede8dc] border border-stone-300 space-y-2">
                  <span className="text-[10px] font-bold text-stone-800 flex items-center justify-between">
                    <span>💬 Tin nhắn mẫu gửi anh em đội bóng:</span>
                    {inviteMsgCopied && (
                      <span className="text-emerald-700 font-bold">
                        ✓ Đã chép tin nhắn!
                      </span>
                    )}
                  </span>
                  <p className="text-[11px] text-stone-700 italic bg-[#fbf9f4] p-2 rounded-lg border border-stone-300/80">
                    “⚽ Anh em ơi, đây là link tham gia Nhóm Zalo chính thức của đội {teamName}: {zaloGroupLink || "(Chưa có link)"}. Anh em bấm vào link hoặc quét mã QR nhóm để nhận thông báo lịch đá và điểm danh nhé!”
                  </p>
                  <Button
                    type="button"
                    onClick={handleCopyZaloInviteMsg}
                    className="btn-paper-tactile w-full h-8 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs gap-1.5 shadow-2xs"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Sao Chép Tin Nhắn Mẫu Kèm Link Zalo</span>
                  </Button>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setTempZaloLink(zaloGroupLink);
                      setTempZaloQr(zaloQrImage);
                      setIsEditingZaloInvite(true);
                    }}
                    className="text-xs font-bold text-sky-800 hover:text-sky-900 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Cài Đặt / Đổi QR &amp; Link Zalo</span>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsJoinLinkModalOpen(false)}
                    className="h-8 text-xs text-stone-600 hover:text-stone-900"
                  >
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
