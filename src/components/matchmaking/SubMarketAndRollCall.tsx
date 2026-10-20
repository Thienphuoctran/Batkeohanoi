"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useAuthTeam } from "@/hooks/useAuthTeam";
import {
  UserPlus,
  Phone,
  Clock,
  Plus,
  ShieldCheck,
  Sparkles,
  Trophy,
  MapPin,
  MessageSquare,
  Zap,
  Star,
  Edit3,
  Trash2,
  X,
  Flame,
  Gift,
  Calendar,
} from "lucide-react";
import { MOCK_SUB_PLAYERS, MOCK_FREE_AGENTS } from "@/constants/mockMatchmaking";
import {
  SubPlayerPost,
  FreeAgentScoutCard,
  SoloPosition,
  SkillTier,
  District,
} from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { getZaloDeepLink, normalizeVietnamPhone } from "@/lib/zalo";
import {
  getTodayIsoDate,
  getOffsetIsoDate,
  getQuickDateOptions,
  formatMatchDateDisplay,
  formatMatchDateShort,
  getMatchExpiresDate,
  isMatchExpired,
} from "@/lib/matchTime";
import { FutCardModal } from "./FutCardModal";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";
import { useRealtimeMarket } from "@/hooks/useRealtimeMarket";
import {
  createOrUpdateFreeAgentAction,
  createOrUpdateSubPostAction,
  deleteMarketPostAction,
} from "@/actions/market";

interface SubMarketAndRollCallProps {
  viewMode?: "sub-market" | "roll-call" | "both";
  onSwitchToSubMarket?: () => void;
  onSyncToVietQr?: (goingCount: number) => void;
  onRequireAuth?: () => void;
}

const HANOI_DISTRICTS_FILTER = [
  "ALL",
  "Cầu Giấy",
  "Nam Từ Liêm",
  "Thanh Xuân",
  "Đống Đa",
  "Hà Đông",
  "Bắc Từ Liêm",
  "Hoàng Mai",
  "Ba Đình",
];

const POSITION_OPTIONS: {
  code: SoloPosition;
  label: string;
  short: string;
  icon: string;
}[] = [
  { code: "GK", label: "Thủ Môn (GK)", short: "GK", icon: "🧤" },
  { code: "DF", label: "Hậu Vệ / Thòng (DF)", short: "DF", icon: "🛡️" },
  { code: "MF", label: "Tiền Vệ (MF)", short: "MF", icon: "🎯" },
  { code: "FW", label: "Tiền Đạo (FW)", short: "FW", icon: "⚡" },
];

export function SubMarketAndRollCall({ onRequireAuth }: SubMarketAndRollCallProps) {
  // Chế độ 2 chiều: "free-agents" (Cầu thủ tìm đội) | "team-recruit" (Đội tuyển thêm người)
  const [marketMode, setMarketMode] = useState<"free-agents" | "team-recruit">(
    "free-agents"
  );

  // Dữ liệu 2 chiều kết nối Supabase Realtime & Database (Single Source of Truth)
  const {
    freeAgents,
    setFreeAgents,
    subPosts,
    setSubPosts,
    isLoadingMarket,
    broadcastFreeAgentCreated,
    broadcastFreeAgentDeleted,
    broadcastSubPostCreated,
    broadcastSubPostDeleted,
  } = useRealtimeMarket();

  const { team, profile } = useAuthTeam();

  // 🛡️ QUẢN LÝ QUYỀN CHÍNH CHỦ (OWNERSHIP):
  // Chỉ tài khoản hoặc thiết bị đăng bài mới có quyền Sửa / Xóa bài của chính họ
  const [ownedAgentIds, setOwnedAgentIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("batkeo7_my_owned_agent_ids");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [ownedSubPostIds, setOwnedSubPostIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("batkeo7_my_owned_sub_post_ids");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  const [savedPhones, setSavedPhones] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("batkeo7_my_phones");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Tự động sao lưu quyền sở hữu sang localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("batkeo7_my_owned_agent_ids", JSON.stringify(ownedAgentIds));
      } catch {}
    }
  }, [ownedAgentIds]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("batkeo7_my_owned_sub_post_ids", JSON.stringify(ownedSubPostIds));
      } catch {}
    }
  }, [ownedSubPostIds]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("batkeo7_my_phones", JSON.stringify(savedPhones));
      } catch {}
    }
  }, [savedPhones]);

  // Kiểm tra quyền chính chủ cho hồ sơ Cầu Thủ Tìm Đội
  const isAgentOwner = useCallback(
    (agent: FreeAgentScoutCard): boolean => {
      if (agent.isCreatedByCurrentUser) return true;
      if (ownedAgentIds.includes(agent.id)) return true;
      const cleanPhone = normalizeVietnamPhone(agent.phone);
      if (profile?.phone && normalizeVietnamPhone(profile.phone) === cleanPhone) return true;
      if (team?.captain_phone && normalizeVietnamPhone(team.captain_phone) === cleanPhone) return true;
      if (savedPhones.some((p) => normalizeVietnamPhone(p) === cleanPhone)) return true;
      // Nhận diện theo tên tài khoản nếu tên trùng khớp
      if (profile?.full_name && agent.playerName.trim().toLowerCase() === profile.full_name.trim().toLowerCase()) return true;
      return false;
    },
    [ownedAgentIds, profile, team, savedPhones]
  );

  // Kiểm tra quyền chính chủ cho tin Đội Tuyển Thêm Người
  const isSubPostOwner = useCallback(
    (post: SubPlayerPost): boolean => {
      if (post.isCreatedByCurrentUser) return true;
      if (ownedSubPostIds.includes(post.id)) return true;
      const cleanContactPhone = normalizeVietnamPhone(post.contactPhone);
      if (profile?.phone && normalizeVietnamPhone(profile.phone) === cleanContactPhone) return true;
      if (team?.captain_phone && normalizeVietnamPhone(team.captain_phone) === cleanContactPhone) return true;
      if (team?.team_name && team.team_name.trim().toLowerCase() === post.teamName.trim().toLowerCase()) return true;
      if (savedPhones.some((p) => normalizeVietnamPhone(p) === cleanContactPhone)) return true;
      return false;
    },
    [ownedSubPostIds, profile, team, savedPhones]
  );

  // 🛡️ LỚP 1: Khóa nút bấm chống spam & gửi đúp
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSavingRef = useRef(false);

  // Bộ lọc đa chiều
  const [posFilter, setPosFilter] = useState<"ALL" | SoloPosition>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<"ALL" | SkillTier>("ALL");
  const [onlyGkHotline, setOnlyGkHotline] = useState(false);

  // Modal Thẻ Cầu Thủ FUT Card Ảo
  const [selectedFutPlayer, setSelectedFutPlayer] =
    useState<FreeAgentScoutCard | null>(null);

  // Modal Tạo / Chỉnh sửa tin đăng 2 chiều
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // Form State dùng chung & riêng cho 2 chế độ
  const [formMode, setFormMode] = useState<"free-agents" | "team-recruit">(
    "free-agents"
  );
  const [playerName, setPlayerName] = useState("");
  const [playerAge, setPlayerAge] = useState(25);
  const [preferredFoot, setPreferredFoot] = useState<
    "Chân phải" | "Chân trái" | "Hai chân"
  >("Chân phải");
  const [positionCode, setPositionCode] = useState<SoloPosition>("MF");
  const [skillTier, setSkillTier] = useState<SkillTier>(2);
  const [district, setDistrict] = useState<District>("Cầu Giấy");
  const [matchDateIso, setMatchDateIso] = useState<string>(() => getTodayIsoDate());
  const [timeSlot, setTimeSlot] = useState("19:00 - 20:30");
  const [phone, setPhone] = useState("");
  const [bioOrNotes, setBioOrNotes] = useState("");

  const quickDates = useMemo(() => getQuickDateOptions(4), []);

  // Riêng cho Đội tuyển người
  const [teamName, setTeamName] = useState("");
  const [pitchName, setPitchName] = useState("Sân Thành Phát (Cầu Giấy)");
  const [quantity, setQuantity] = useState(1);

  // Thuật toán Quick Match 100% (Phát hiện trùng khớp Vị trí + Khu vực giữa Đội cần người & Cầu thủ tìm đội)
  const quickMatchPairs = useMemo(() => {
    const pairs: {
      id: string;
      agent: FreeAgentScoutCard;
      teamPost: SubPlayerPost;
    }[] = [];

    for (const post of subPosts) {
      if (post.status !== "ACTIVE") continue;
      const pCode: SoloPosition =
        post.positionCode ||
        (post.positionNeeded.includes("GK")
          ? "GK"
          : post.positionNeeded.includes("CB")
          ? "DF"
          : post.positionNeeded.includes("MF")
          ? "MF"
          : "FW");

      const matchedAgent = freeAgents.find(
        (ag) =>
          ag.position === pCode &&
          ag.districts.some(
            (d) => d.toLowerCase() === post.district.toLowerCase()
          )
      );

      if (matchedAgent) {
        pairs.push({
          id: `${post.id}-${matchedAgent.id}`,
          agent: matchedAgent,
          teamPost: post,
        });
      }
    }
    return pairs.slice(0, 2);
  }, [freeAgents, subPosts]);

  // Lọc danh sách Cầu thủ tìm đội (Scout Cards)
  const filteredFreeAgents = useMemo(() => {
    return freeAgents.filter((ag) => {
      if (onlyGkHotline && ag.position !== "GK") return false;
      if (posFilter !== "ALL" && ag.position !== posFilter) return false;
      if (
        districtFilter !== "ALL" &&
        !ag.districts.some((d) =>
          d.toLowerCase().includes(districtFilter.toLowerCase())
        )
      ) {
        return false;
      }
      if (tierFilter !== "ALL" && ag.skillTier !== tierFilter) return false;
      return true;
    });
  }, [freeAgents, posFilter, districtFilter, tierFilter, onlyGkHotline]);

  // Lọc danh sách Đội tuyển người (Tự động dọn dẹp các tin quá 15 phút sau bóng lăn)
  const filteredSubPosts = useMemo(() => {
    return subPosts.filter((p) => {
      if (p.status !== "ACTIVE") return false;
      if (
        isMatchExpired(
          {
            matchDate: p.matchDate || p.matchDateIso,
            matchDateIso: p.matchDateIso,
            startTime: p.matchTime,
            expiresAt: p.expiresAt,
          },
          15
        )
      ) {
        return false;
      }
      const code: SoloPosition =
        p.positionCode ||
        (p.positionNeeded.includes("GK")
          ? "GK"
          : p.positionNeeded.includes("CB")
          ? "DF"
          : p.positionNeeded.includes("MF")
          ? "MF"
          : "FW");
      if (onlyGkHotline && code !== "GK") return false;
      if (posFilter !== "ALL" && code !== posFilter) return false;
      if (
        districtFilter !== "ALL" &&
        !p.district.toLowerCase().includes(districtFilter.toLowerCase())
      ) {
        return false;
      }
      if (tierFilter !== "ALL" && p.skillTier && p.skillTier !== tierFilter) {
        return false;
      }
      return true;
    });
  }, [subPosts, posFilter, districtFilter, tierFilter, onlyGkHotline]);

  // Mở modal tạo mới (Tự động điền thông tin chính chủ nếu đã có)
  const handleOpenCreateModal = (mode: "free-agents" | "team-recruit") => {
    setEditingAgentId(null);
    setEditingSubId(null);
    setFormMode(mode);
    setPlayerName(profile?.full_name || "");
    setPlayerAge(26);
    setPreferredFoot("Chân phải");
    setPositionCode("MF");
    setSkillTier(team?.skill_tier || 2);
    setDistrict((team?.home_district === "NamTuLiem" ? "Nam Từ Liêm" : "Cầu Giấy") as District);
    setMatchDateIso(getTodayIsoDate());
    setTimeSlot("19:00 - 20:30");
    setPhone(profile?.phone || team?.captain_phone || (savedPhones[0] || ""));
    setBioOrNotes("");
    setTeamName(team?.team_name || "");
    setPitchName("Sân Thành Phát");
    setQuantity(1);
    setIsPostModalOpen(true);
  };

  // Mở modal sửa hồ sơ Cầu thủ tự do
  const handleOpenEditAgent = (agent: FreeAgentScoutCard) => {
    setEditingAgentId(agent.id);
    setEditingSubId(null);
    setFormMode("free-agents");
    setPlayerName(agent.playerName);
    setPlayerAge(agent.age);
    setPreferredFoot(agent.preferredFoot);
    setPositionCode(agent.position);
    setSkillTier(agent.skillTier);
    setDistrict(agent.districts[0] || "Cầu Giấy");
    if (agent.availableDateIso) setMatchDateIso(agent.availableDateIso);
    setTimeSlot(agent.availableTimeSlots.join(", ") || "19:00");
    setPhone(agent.phone);
    setBioOrNotes(agent.bio || "");
    setIsPostModalOpen(true);
  };

  // Mở modal sửa tin Đội tuyển người
  const handleOpenEditSubPost = (post: SubPlayerPost) => {
    setEditingSubId(post.id);
    setEditingAgentId(null);
    setFormMode("team-recruit");
    setTeamName(post.teamName);
    setPitchName(post.pitchName);
    setDistrict(post.district);
    if (post.matchDateIso) setMatchDateIso(post.matchDateIso);
    setTimeSlot(post.matchTime);
    setQuantity(post.quantity);
    setSkillTier(post.skillTier || 2);
    setPositionCode(post.positionCode || "GK");
    setPhone(post.contactPhone);
    setBioOrNotes(post.notes || "");
    setIsPostModalOpen(true);
  };

  // 🛡️ Xóa hồ sơ Cầu thủ tự do (Chỉ chính chủ mới có quyền xóa)
  const handleDeleteAgent = async (agent: FreeAgentScoutCard) => {
    if (!isAgentOwner(agent)) {
      alert("⚠️ Bạn không có quyền xóa bài đăng này. Chỉ người đăng chính chủ mới có thể xóa!");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài đăng tìm đội của "${agent.playerName}"? Thao tác này sẽ gỡ bài khỏi toàn bộ hệ thống.`)) {
      const res = await deleteMarketPostAction(agent.id, "free-agents", agent.phone);
      if (res && !res.success) {
        alert(`⚠️ ${res.error || "Không thể xóa bài đăng. Vui lòng thử lại!"}`);
        return;
      }
      setFreeAgents((prev) => prev.filter((a) => a.id !== agent.id));
      setOwnedAgentIds((prev) => prev.filter((id) => id !== agent.id));
      await broadcastFreeAgentDeleted(agent.id);
    }
  };

  // 🛡️ Xóa tin Đội tuyển người (Chỉ chính chủ mới có quyền xóa)
  const handleDeleteSubPost = async (post: SubPlayerPost) => {
    if (!isSubPostOwner(post)) {
      alert("⚠️ Bạn không có quyền xóa bài đăng này. Chỉ đội trưởng đăng tin mới có thể xóa!");
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa tin tuyển quân của đội "${post.teamName}"? Thao tác này sẽ gỡ bài khỏi toàn bộ hệ thống.`)) {
      const res = await deleteMarketPostAction(post.id, "team-recruit", post.contactPhone);
      if (res && !res.success) {
        alert(`⚠️ ${res.error || "Không thể xóa bài đăng. Vui lòng thử lại!"}`);
        return;
      }
      setSubPosts((prev) => prev.filter((p) => p.id !== post.id));
      setOwnedSubPostIds((prev) => prev.filter((id) => id !== post.id));
      await broadcastSubPostDeleted(post.id);
    }
  };

  // 🛡️ Lưu form Đăng tin / Cập nhật (Database-First + 3 Lớp Chốt Chặn)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingRef.current || isSubmitting) return;

    if (formMode === "team-recruit" && !team) {
      setIsPostModalOpen(false);
      if (onRequireAuth) onRequireAuth();
      return;
    }

    isSavingRef.current = true;
    setIsSubmitting(true);

    try {
      const posObj =
        POSITION_OPTIONS.find((p) => p.code === positionCode) ||
        POSITION_OPTIONS[2];

      if (formMode === "free-agents") {
        const isGK = positionCode === "GK";
        const newCard: FreeAgentScoutCard = {
          id: editingAgentId || `scout-${Date.now()}`,
          playerName: playerName.trim() || 'Anh Em "Phủi"',
          age: Number(playerAge) || 25,
          preferredFoot,
          position: positionCode,
          positionLabel: posObj.label,
          skillTier,
          districts: [district],
          availableTimeSlots: timeSlot
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          trustRating: 5.0,
          matchesJoined: editingAgentId
            ? freeAgents.find((a) => a.id === editingAgentId)?.matchesJoined || 1
            : 1,
          futStats: {
            ovr: isGK ? 88 : 85,
            pac: positionCode === "FW" ? 91 : 83,
            tec: positionCode === "MF" ? 89 : 84,
            pas: 86,
            def: isGK || positionCode === "DF" ? 91 : 76,
            fpl: 98,
          },
          phone: phone.trim() || "0988.666.888",
          zaloPhone: normalizeVietnamPhone(phone.trim() || "0988666888"),
          availableDate: formatMatchDateDisplay(matchDateIso),
          availableDateIso: matchDateIso,
          bio:
            bioOrNotes.trim() ||
            "Đá nhiệt tình, văn minh, đúng giờ, tìm đội giao lưu lâu dài.",
          hasFirstTimerVoucher: false,
          isCreatedByCurrentUser: true,
          createdAt: editingAgentId ? "Đã cập nhật" : "Vừa xong",
        };

        // 🛡️ BƯỚC 1: LƯU VÀO CSDL SUPABASE TRƯỚC TIÊN (Database-First)
        const dbRes = await createOrUpdateFreeAgentAction(newCard);
        if (!dbRes.success) {
          alert(`⚠️ Không thể lưu hồ sơ cầu thủ vào máy chủ: ${dbRes.error || "Vui lòng thử lại!"}`);
          return;
        }

        const officialCard = dbRes.post || newCard;

        // Lưu quyền sở hữu chính chủ vào State và localStorage
        setOwnedAgentIds((prev) => Array.from(new Set([officialCard.id, ...prev])));
        const cleanP = normalizeVietnamPhone(phone.trim());
        if (cleanP) {
          setSavedPhones((prev) => Array.from(new Set([cleanP, ...prev])));
        }

        // 🛡️ BƯỚC 2: Cập nhật State máy A
        if (editingAgentId) {
          setFreeAgents((prev) =>
            prev.map((a) => (a.id === editingAgentId ? officialCard : a))
          );
        } else {
          setFreeAgents((prev) => [officialCard, ...prev.filter((a) => a.id !== officialCard.id)]);
          setSelectedFutPlayer(officialCard);
        }

        // 🛡️ BƯỚC 3: Phát sóng WebSocket Realtime cho máy B
        await broadcastFreeAgentCreated(officialCard);
        setMarketMode("free-agents");
      } else {
        const mappedPosNeeded: SubPlayerPost["positionNeeded"] =
          positionCode === "GK"
            ? "Thủ Môn (GK)"
            : positionCode === "DF"
            ? "Trung Vệ (CB)"
            : positionCode === "MF"
            ? "Tiền Vệ (MF)"
            : "Tiền Đạo (FW)";

        const formattedDate = formatMatchDateDisplay(matchDateIso);
        const expiresDateObj = getMatchExpiresDate(
          {
            matchDate: matchDateIso,
            matchDateIso,
            startTime: timeSlot,
          },
          15
        );

        const newPost: SubPlayerPost = {
          id: editingSubId || `sub-${Date.now()}`,
          teamId: `team-${Date.now()}`,
          teamName: teamName.trim() || "FC Anh Em Hà Nội",
          positionNeeded: mappedPosNeeded,
          positionCode,
          quantity: Number(quantity) || 1,
          matchDate: formattedDate,
          matchDateIso,
          matchTime: timeSlot.trim() || "19:00 - 20:30",
          expiresAt: expiresDateObj.toISOString(),
          pitchName: pitchName.trim() || "Sân Cỏ Nhân Tạo",
          district,
          skillTier,
          contactPhone: phone.trim() || "0988.765.432",
          contactZalo: normalizeVietnamPhone(phone.trim() || "0988765432"),
          notes:
            bioOrNotes.trim() ||
            "Đội vui vẻ hòa đồng, cần anh em ra sân đúng giờ.",
          isCreatedByCurrentUser: true,
          status: "ACTIVE",
          createdAt: editingSubId ? "Đã cập nhật" : "Vừa xong",
        };

        // 🛡️ BƯỚC 1: LƯU VÀO CSDL SUPABASE TRƯỚC TIÊN (Database-First)
        const dbRes = await createOrUpdateSubPostAction(newPost);
        if (!dbRes.success) {
          alert(`⚠️ Không thể lưu tin tuyển quân vào máy chủ: ${dbRes.error || "Vui lòng thử lại!"}`);
          return;
        }

        const officialPost = dbRes.post || newPost;

        // Lưu quyền sở hữu chính chủ vào State và localStorage
        setOwnedSubPostIds((prev) => Array.from(new Set([officialPost.id, ...prev])));
        const cleanP = normalizeVietnamPhone(phone.trim());
        if (cleanP) {
          setSavedPhones((prev) => Array.from(new Set([cleanP, ...prev])));
        }

        // 🛡️ BƯỚC 2: Cập nhật State máy A
        if (editingSubId) {
          setSubPosts((prev) =>
            prev.map((p) => (p.id === editingSubId ? officialPost : p))
          );
        } else {
          setSubPosts((prev) => [officialPost, ...prev.filter((p) => p.id !== officialPost.id)]);
        }

        // 🛡️ BƯỚC 3: Phát sóng WebSocket Realtime cho máy B
        await broadcastSubPostCreated(officialPost);
        setMarketMode("team-recruit");
      }

      setIsPostModalOpen(false);
    } catch (err: any) {
      console.error("[handleSavePost Error]", err);
    } finally {
      isSavingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. HEADER & SEGMENTED SWITCHER 2 CHIỀU (VINTAGE NEWSPAPER STYLE) */}
      <div className="card-retro-paper rounded-3xl border border-stone-300 p-4 sm:p-5 space-y-4 shadow-lg relative overflow-hidden">
        <div className="washi-tape -top-2.5 left-8 rotate-[-2deg]" />
        <div className="washi-tape -top-2.5 right-8 rotate-[2deg]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 pt-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                Chợ Cầu 2 Chiều • Toàn Hà Nội
              </span>
              <span className="rubber-stamp text-[9px] py-0.5 px-2 border-amber-700 text-amber-800 font-bold">
                ⚡ GHÉP ĐỐI 24/7
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-stone-900 mt-1.5 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-800" />
              <span>Chợ Cầu Lẻ &amp; Cầu Thủ Tự Do Tìm Đội</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-medium max-w-lg">
              Ghép cầu thủ tự do vào đội thiếu người sát giờ • Đánh giá uy tín cá nhân &amp; Xuất thẻ FUT Card
            </p>
          </div>

          {/* 📰 TƯ LIỆU BÁO CHÍ & VĂN HÓA TRÀ ĐÁ PHỦI */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <VintageScrapbookAsset
              asset="tea-tactics"
              tape="right"
              tilt={2}
              className="w-24 lg:w-28 shadow-sm"
              caption="Trà đá phủi"
            />
            <VintageScrapbookAsset
              asset="polaroid-fairplay"
              tape="left"
              tilt={-1.5}
              className="w-24 lg:w-28 shadow-sm"
              caption="Fair Play"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => handleOpenCreateModal(marketMode)}
              className="ticket-stub h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>
                {marketMode === "free-agents"
                  ? "Đăng Hồ Sơ Cầu Thủ"
                  : "Đăng Tuyển Người"}
              </span>
            </Button>
          </div>
        </div>

        {/* NÚT CHUYỂN CHẾ ĐỘ (SEGMENTED SWITCHER 2 CHIỀU) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#ede8dc] border border-stone-300 relative z-10">
          <button
            type="button"
            onClick={() => setMarketMode("free-agents")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
              marketMode === "free-agents"
                ? "bg-stone-900 text-white shadow-md border border-stone-900"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/70"
            }`}
          >
            <span className="text-base">🏃</span>
            <span>Cầu Thủ Tìm Đội (Scout Feed)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                marketMode === "free-agents"
                  ? "bg-white/20 text-white"
                  : "bg-stone-300 text-stone-800"
              }`}
            >
              {freeAgents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMarketMode("team-recruit")}
            className={`py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
              marketMode === "team-recruit"
                ? "bg-stone-900 text-white shadow-md border border-stone-900"
                : "text-stone-700 hover:text-stone-900 hover:bg-stone-200/70"
            }`}
          >
            <span className="text-base">🛡️</span>
            <span>Đội Tuyển Thêm Người (Team Feed)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                marketMode === "team-recruit"
                  ? "bg-white/20 text-white"
                  : "bg-stone-300 text-stone-800"
              }`}
            >
              {subPosts.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. THUẬT TOÁN QUICK MATCH 100% (GHÉP ĐÔI TỨC THÌ) */}
      {quickMatchPairs.length > 0 && (
        <div className="rounded-3xl bg-[#fbf9f4] border-2 border-amber-300/80 p-4 space-y-3 shadow-md text-stone-900 relative overflow-hidden">
          <div className="washi-tape -top-2 left-6 rotate-[-2deg]" />
          <div className="flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shadow-inner">
                <Zap className="w-4 h-4 fill-current" />
              </span>
              <div>
                <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  ⚡ Thuật Toán Quick Match 100% — Phát Hiện Trùng Khớp Tức Thì
                </h3>
                <p className="text-[11px] text-stone-600 font-medium">
                  Hệ thống tự động khớp vị trí &amp; khu vực giữa Đội đang thiếu người và Cầu thủ tự do
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black">
              Khớp trong 30s
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 relative z-10">
            {quickMatchPairs.map(({ id, agent, teamPost }) => (
              <div
                key={id}
                className="rounded-xl bg-[#ede8dc] border border-stone-300 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-amber-200 border border-amber-400 text-stone-900 font-black text-[10px]">
                      100% MATCH • {agent.position}
                    </span>
                    <span className="text-stone-600 text-[11px] font-bold">
                      📍 {teamPost.district} ({teamPost.matchTime})
                    </span>
                  </div>
                  <div className="text-stone-900 font-bold">
                    🏃 <span className="text-emerald-800 font-black">{agent.playerName}</span>{" "}
                    <span className="text-stone-400">⇄</span> 🛡️{" "}
                    <span className="text-amber-800 font-black">{teamPost.teamName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={getZaloDeepLink(agent.phone, agent.zaloPhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ticket-stub px-3 py-1.5 rounded-lg bg-[#0068FF] hover:bg-[#0057D9] text-white text-[11px] font-extrabold transition shadow-xs"
                  >
                    Zalo Cầu Thủ
                  </a>
                  <a
                    href={getZaloDeepLink(
                      teamPost.contactPhone,
                      teamPost.contactZalo
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ticket-stub px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-extrabold transition shadow-xs"
                  >
                    Zalo Đội
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BỘ LỌC VỊ TRÍ + GK HOTLINE + QUẬN + TIER */}
      <div className="card-retro-paper rounded-2xl border border-stone-300 p-3.5 space-y-3 shadow-sm">
        {/* Hàng 1: Vị trí + GK Hotline */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "Tất cả vị trí" },
              { id: "GK", label: "🧤 Thủ Môn (GK)" },
              { id: "DF", label: "🛡️ Hậu Vệ (DF)" },
              { id: "MF", label: "🎯 Tiền Vệ (MF)" },
              { id: "FW", label: "⚡ Tiền Đạo (FW)" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setPosFilter(item.id as "ALL" | SoloPosition);
                  if (item.id !== "GK") setOnlyGkHotline(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                  posFilter === item.id && !onlyGkHotline
                    ? "bg-stone-900 text-white font-black border-stone-900 shadow-sm"
                    : "bg-[#ede8dc] text-stone-700 border-stone-300 hover:text-stone-900 hover:bg-stone-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Nút GK Hotline - Cứu Tinh Thủ Môn */}
          <button
            type="button"
            onClick={() => {
              const next = !onlyGkHotline;
              setOnlyGkHotline(next);
              setPosFilter(next ? "GK" : "ALL");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 transition ${
              onlyGkHotline
                ? "ticket-stub bg-amber-500 text-stone-950 border-amber-600 shadow-sm"
                : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200 font-bold"
            }`}
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>🧤 GK Hotline (Ưu Tiên Thủ Môn)</span>
          </button>
        </div>

        {/* Hàng 2: Lọc theo Quận Hà Nội & Tier */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 border-t border-stone-200">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-1">
              <MapPin className="w-3 h-3 text-red-600" />
              Khu vực:
            </span>
            {HANOI_DISTRICTS_FILTER.map((dist) => (
              <button
                key={dist}
                onClick={() => setDistrictFilter(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  districtFilter === dist
                    ? "bg-stone-900 text-white font-black border border-stone-900 shadow-sm"
                    : "bg-[#ede8dc] text-stone-700 hover:text-stone-900 hover:bg-stone-200 border border-stone-300"
                }`}
              >
                {dist === "ALL" ? "Toàn Hà Nội" : dist}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-stone-700 mr-1">
              Trình độ:
            </span>
            {(["ALL", 1, 2, 3] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                  tierFilter === t
                    ? t === 1
                      ? "bg-blue-800 text-white border-blue-900 shadow-sm font-black"
                      : t === 2
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-sm font-black"
                      : t === 3
                      ? "bg-red-800 text-white border-red-900 shadow-sm font-black"
                      : "bg-stone-900 text-white font-black border-stone-900 shadow-sm"
                    : "bg-[#ede8dc] text-stone-700 border-stone-300 hover:text-stone-900 hover:bg-stone-200"
                }`}
              >
                {t === "ALL" ? "Mọi Tier" : `Tier ${t}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. DANH SÁCH CHẾ ĐỘ 1: CẦU THỦ TÌM ĐỘI (FREE AGENT SCOUT FEED) */}
      {marketMode === "free-agents" && (
        isLoadingMarket ? (
          <div className="card-retro-paper rounded-2xl border border-stone-300 p-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-700">Đang đồng bộ hồ sơ cầu thủ tự do từ CSDL Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFreeAgents.length > 0 ? (
            filteredFreeAgents.map((agent) => {
              const isGK = agent.position === "GK";
              const isHighTrust = agent.trustRating >= 4.8;
              const tierInfo = SKILL_TIERS_CONFIG[agent.skillTier];
              const isOwner = isAgentOwner(agent);

              return (
                <div
                  key={agent.id}
                  className={`card-retro-paper rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                    isGK
                      ? "border-2 border-amber-400 bg-amber-50/40 shadow-md"
                      : "border-stone-300 shadow-sm"
                  }`}
                >
                  <div>
                    {/* Hàng Huy hiệu đầu thẻ: Vị trí + Hàng hiếm GK + Tier + Uy tín */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isGK ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 text-[11px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1 border border-amber-500">
                            <span>🧤 HÀNG HIẾM - THỦ MÔN</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black">
                            {agent.position === "DF"
                              ? "🛡️"
                              : agent.position === "MF"
                              ? "🎯"
                              : "⚡"}{" "}
                            {agent.positionLabel}
                          </span>
                        )}

                        <span
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold border bg-[#ede8dc] border-stone-300 text-stone-700"
                        >
                          Tier {agent.skillTier}: {tierInfo.name}
                        </span>

                        {isOwner && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            ★ BÀI CỦA BẠN
                          </span>
                        )}
                      </div>

                      {/* Nút mở Thẻ Cầu Thủ FUT Card Ảo */}
                      <button
                        type="button"
                        onClick={() => setSelectedFutPlayer(agent)}
                        className="ticket-stub px-2.5 py-1 rounded-xl bg-stone-900 text-amber-300 border border-amber-400/50 text-[11px] font-black flex items-center gap-1 shadow-xs transition active:scale-95"
                        title="Xem Thẻ Cầu Thủ EA FC / FIFA FUT Card Ảo"
                      >
                        <Trophy className="w-3 h-3 text-amber-400" />
                        <span>FUT {agent.futStats.ovr}</span>
                      </button>
                    </div>

                    {/* Tên & Biệt danh + Tuổi + Chân thuận */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-black text-stone-900 flex items-center gap-1.5">
                          <span>{agent.playerName}</span>
                          <span className="text-xs font-bold text-stone-500">
                            • {agent.age}t • {agent.preferredFoot}
                          </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-700">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {agent.trustRating.toFixed(1)} ★
                          </span>
                          {isHighTrust && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-[10px] font-bold text-emerald-800">
                              <ShieldCheck className="w-3 h-3" />
                              Cầu thủ uy tín ({agent.matchesJoined} trận)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Khu vực & Khung giờ rảnh + Đóng góp kinh phí */}
                    <div className="mt-3 rounded-xl bg-[#ede8dc] border border-stone-200 p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-stone-700 flex items-center gap-1.5 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          Khu vực:{" "}
                          <strong className="text-stone-900">
                            {agent.districts.join(", ")}
                          </strong>
                        </span>
                        <span className="text-amber-800 font-bold flex items-center gap-1 tabular-nums">
                          <Clock className="w-3.5 h-3.5" />
                          Ca: {agent.availableTimeSlots.join(", ")}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-stone-300/80 flex items-center justify-between text-stone-600 text-[11px]">
                        <span>Kinh phí &amp; Màu áo:</span>
                        <span className="text-emerald-800 font-bold flex items-center gap-1">
                          💬 Trao đổi qua Zalo
                        </span>
                      </div>
                    </div>

                    {agent.bio && (
                      <p className="text-[11px] text-stone-600 italic mt-2 line-clamp-2">
                        “{agent.bio}”
                      </p>
                    )}
                  </div>

                  {/* Footer Nút Hành Động 1-Chạm */}
                  <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-stone-200">
                    {isOwner ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAgent(agent)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAgent(agent)}
                          className="px-2.5 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-1 transition active:scale-95"
                          title="Chỉ người đăng bài mới có quyền xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa hồ sơ</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-500">
                        Đăng {agent.createdAt}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <ClickSpark sparkColor={["#0068FF", "#38bdf8", "#ffffff"]}>
                        <a
                          href={getZaloDeepLink(agent.phone, agent.zaloPhone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ticket-stub h-9 px-3.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>Mời vào đội (Zalo)</span>
                        </a>
                      </ClickSpark>
                      <a
                        href={`tel:${normalizeVietnamPhone(agent.phone)}`}
                        className="ticket-stub h-9 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Gọi trực tiếp</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 card-retro-paper rounded-2xl border border-stone-300 p-10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto text-xl shadow-inner">
                🏃
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-stone-900">
                  Chưa có cầu thủ tự do nào đăng hồ sơ
                </p>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Bạn đang tìm đội đá bóng tối nay hoặc cố định hàng tuần? Tạo hồ sơ để các đội bóng khu vực của bạn kết nối Zalo ngay!
                </p>
              </div>
              <Button
                onClick={() => handleOpenCreateModal("free-agents")}
                className="ticket-stub h-10 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Đăng Hồ Sơ Cầu Thủ Tự Do Ngay</span>
              </Button>
            </div>
          )}
        </div>
        )
      )}

      {/* 5. DANH SÁCH CHẾ ĐỘ 2: ĐỘI TUYỂN THÊM NGƯỜI (TEAM RECRUITMENT FEED) */}
      {marketMode === "team-recruit" && (
        isLoadingMarket ? (
          <div className="card-retro-paper rounded-2xl border border-stone-300 p-10 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-700">Đang đồng bộ danh sách đội tuyển người từ CSDL Supabase...</p>
          </div>
        ) : (
          <div className="space-y-3">
          {filteredSubPosts.length > 0 ? (
            filteredSubPosts.map((post) => {
              const isGK = post.positionNeeded.includes("GK");
              const isOwner = isSubPostOwner(post);

              return (
                <div
                  key={post.id}
                  className={`card-retro-paper rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                    isGK
                      ? "border-2 border-amber-400 bg-amber-50/40"
                      : "border-stone-300"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${
                          isGK
                            ? "bg-amber-400 text-stone-950 border-amber-500"
                            : "bg-emerald-100 text-emerald-800 border-emerald-300"
                        }`}
                      >
                        {isGK ? "🧤 CẦN GẤP THỦ MÔN:" : "🛡️ Tuyển"}{" "}
                        {post.quantity} {post.positionNeeded}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#ede8dc] border border-stone-300 text-stone-800 text-[11px] font-bold">
                        📍 {post.district}
                      </span>
                      {post.skillTier && (
                        <span className="px-2 py-0.5 rounded bg-[#ede8dc] border border-stone-300 text-amber-800 text-[11px] font-bold">
                          Tier {post.skillTier}
                        </span>
                      )}
                      <span className="text-xs text-stone-700 font-bold flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>{post.matchTime}</span>
                        {post.matchDate && (
                          <span className="text-emerald-800 font-bold">
                            • {post.matchDate}
                          </span>
                        )}
                      </span>
                      {isOwner && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          ★ TIN CỦA ĐỘI BẠN
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      {post.teamName} —{" "}
                      <span className="text-emerald-800 font-bold">{post.pitchName}</span>
                    </h3>

                    <p className="text-xs text-stone-600 font-medium flex items-center gap-1">
                      💬 Kinh phí &amp; trang phục trao đổi trực tiếp qua Zalo
                    </p>

                    {post.notes && (
                      <p className="text-[11px] text-stone-600 italic">
                        “{post.notes}”
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {isOwner && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEditSubPost(post)}
                          className="h-9 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-800 text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubPost(post)}
                          className="h-9 px-3 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 text-xs font-bold inline-flex items-center gap-1 transition active:scale-95"
                          title="Chỉ đội trưởng đăng bài mới có quyền xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa tin</span>
                        </button>
                      </>
                    )}
                    <a
                      href={getZaloDeepLink(
                        post.contactPhone,
                        post.contactZalo
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ticket-stub h-9 px-3.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Zalo Xin Đá</span>
                    </a>
                    <a
                      href={`tel:${normalizeVietnamPhone(post.contactPhone)}`}
                      className="ticket-stub h-9 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi Đội Trưởng</span>
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card-retro-paper rounded-2xl border border-stone-300 p-10 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mx-auto text-xl shadow-inner">
                🛡️
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-stone-900">
                  Chưa có đội bóng nào đăng tuyển vị trí này
                </p>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Đội của bạn đang thiếu vị trí (Thủ môn, Hậu vệ, Tiền vệ, Tiền đạo) trước giờ bóng lăn? Đăng tin để tìm cầu thủ xung quanh khu vực sân!
                </p>
              </div>
              <Button
                onClick={() => handleOpenCreateModal("team-recruit")}
                className="ticket-stub h-10 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Đăng Tin Tuyển Người Ngay</span>
              </Button>
            </div>
          )}
        </div>
        )
      )}

      {/* 6. MODAL ĐĂNG TIN / CHỈNH SỬA 2 CHIỀU (VINTAGE RETRO SCRAPBOOK STYLE) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl card-retro-paper border border-stone-300 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-stone-900 relative">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-300 bg-[#ede8dc]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  Chợ Cầu 2 Chiều • BắtKèo7 Hà Nội
                </span>
                <h3 className="text-base font-black text-stone-900 mt-0.5">
                  {editingAgentId || editingSubId
                    ? "Chỉnh Sửa Tin Đăng Chợ Cầu"
                    : formMode === "free-agents"
                    ? "Đăng Hồ Sơ Cầu Thủ Tự Do (Scout Card)"
                    : "Đăng Tin Đội Tuyển Thêm Người"}
                </h3>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 hover:text-stone-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSavePost}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              {/* Chuyển đổi loại tin nếu đang tạo mới */}
              {!editingAgentId && !editingSubId && (
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#ede8dc] border border-stone-300">
                  <button
                    type="button"
                    onClick={() => setFormMode("free-agents")}
                    className={`py-2 rounded-lg font-black text-xs transition ${
                      formMode === "free-agents"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-700 hover:text-stone-900"
                    }`}
                  >
                    🏃 Tôi là Cầu Thủ Tìm Đội
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode("team-recruit")}
                    className={`py-2 rounded-lg font-black text-xs transition ${
                      formMode === "team-recruit"
                        ? "bg-stone-900 text-white shadow-xs"
                        : "text-stone-700 hover:text-stone-900"
                    }`}
                  >
                    🛡️ Đội Tôi Cần Tuyển Người
                  </button>
                </div>
              )}

              {/* Banner yêu cầu Đội Trưởng nếu đang ở chế độ tuyển người và chưa có đội */}
              {formMode === "team-recruit" && !team && onRequireAuth && (
                <div className="rounded-xl bg-amber-100 border border-amber-300 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-stone-900 shadow-xs">
                  <div className="text-[11px] leading-snug">
                    🛡️ <strong>Tin tuyển quân chính chủ:</strong> Bạn cần đăng nhập tài khoản Đội Trưởng để gắn tin đăng với hồ sơ đội và nhận liên hệ trực tiếp qua Zalo.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPostModalOpen(false);
                      onRequireAuth();
                    }}
                    className="ticket-stub px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shrink-0 active:scale-95 transition"
                  >
                    Đăng Nhập 1-Chạm
                  </button>
                </div>
              )}

              {/* Nội dung riêng cho Cầu thủ tự do */}
              {formMode === "free-agents" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-stone-700 mb-1">
                      Tên &amp; Biệt danh cầu thủ
                    </label>
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder='VD: Tuấn "Cò", Hùng "Gôn"...'
                      className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tuổi
                    </label>
                    <input
                      type="number"
                      min={15}
                      max={65}
                      value={playerAge}
                      onChange={(e) => setPlayerAge(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tên Đội Bóng
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="VD: FC Anh Em Cầu Giấy"
                      className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Tên Sân Bóng Thi Đấu
                    </label>
                    <input
                      type="text"
                      required
                      value={pitchName}
                      onChange={(e) => setPitchName(e.target.value)}
                      placeholder="VD: Sân Thành Phát"
                      className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                </div>
              )}

              {/* Chọn Vị Trí Thi Đấu */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">
                  Vị trí thi đấu (Chọn GK để kích hoạt Huy hiệu Hàng Hiếm Thủ Môn)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POSITION_OPTIONS.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setPositionCode(p.code)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        positionCode === p.code
                          ? p.code === "GK"
                            ? "bg-amber-400 border-amber-500 text-stone-950 font-black shadow-xs"
                            : "bg-stone-900 border-stone-900 text-white font-black shadow-xs"
                          : "bg-[#ede8dc] border-stone-300 text-stone-700 hover:text-stone-900"
                      }`}
                    >
                      <div className="text-base">{p.icon}</div>
                      <div className="text-[11px] font-bold mt-0.5">
                        {p.short}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngày thi đấu & Chọn nhanh ngày */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-[#ede8dc] border border-stone-300">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span>Ngày đá ({formatMatchDateDisplay(matchDateIso)})</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={getTodayIsoDate()}
                    value={matchDateIso}
                    onChange={(e) => setMatchDateIso(e.target.value)}
                    className="h-7 px-2 rounded-lg bg-[#fbf9f4] border border-stone-300 text-stone-900 font-mono text-[11px] font-bold"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {quickDates.map((d) => (
                    <button
                      type="button"
                      key={d.isoDate}
                      onClick={() => setMatchDateIso(d.isoDate)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition border ${
                        matchDateIso === d.isoDate
                          ? "bg-stone-900 border-stone-900 text-white font-black"
                          : "bg-[#fbf9f4] border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-200"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Khu vực, Khung giờ & Chân thuận / Số lượng */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Khu vực Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="VD: Cầu Giấy, Nam Từ Liêm..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Khung giờ đá
                  </label>
                  <input
                    type="text"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    placeholder="VD: 19:00 - 20:30, 20:30..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-amber-800 font-bold focus:outline-none focus:border-stone-800"
                  />
                </div>
                {formMode === "free-agents" ? (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Chân thuận
                    </label>
                    <select
                      value={preferredFoot}
                      onChange={(e) =>
                        setPreferredFoot(e.target.value as any)
                      }
                      className="w-full h-9 px-2.5 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    >
                      <option value="Chân phải">Chân phải</option>
                      <option value="Chân trái">Chân trái</option>
                      <option value="Hai chân">Hai chân</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Số lượng cần tuyển
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                    />
                  </div>
                )}
              </div>

              {/* Chọn Tier & Ghi chú trao đổi kinh phí */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Phân tầng trình độ (Tier)
                  </label>
                  <select
                    value={skillTier}
                    onChange={(e) =>
                      setSkillTier(Number(e.target.value) as SkillTier)
                    }
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                  >
                    <option value={1}>Tier 1: Dưỡng sinh (Cấm va chạm)</option>
                    <option value={2}>Tier 2: Phong trào văn phòng</option>
                    <option value={3}>Tier 3: Phủi chiến cọ xát</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="p-2.5 rounded-xl bg-[#ede8dc] border border-stone-300 text-[11px] text-stone-700 flex items-center gap-2">
                    <span className="text-base">💬</span>
                    <span>
                      <strong className="text-emerald-800">Trao đổi qua Zalo:</strong> Tiền sân, nước uống và màu áo hai bên chủ động thống nhất khi kết nối.
                    </span>
                  </div>
                </div>
              </div>

              {/* Số điện thoại Zalo & Ghi chú */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    SĐT / Zalo liên hệ 1-chạm
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988.234.567"
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 font-mono focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Giới thiệu lối đá / Lời nhắn
                  </label>
                  <input
                    type="text"
                    value={bioOrNotes}
                    onChange={(e) => setBioOrNotes(e.target.value)}
                    placeholder="VD: Đá nhiệt tình, không vào bóng rát..."
                    className="w-full h-9 px-3 rounded-xl bg-[#fbf9f4] border border-stone-300 text-stone-900 focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-300">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPostModalOpen(false)}
                  className="h-9 text-xs text-stone-600 hover:text-stone-900"
                >
                  Hủy
                </Button>
                {formMode === "team-recruit" && !team ? (
                  <Button
                    type="button"
                    onClick={() => {
                      setIsPostModalOpen(false);
                      onRequireAuth?.();
                    }}
                    className="ticket-stub h-9 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                  >
                    🛡️ Đăng Nhập Đội Trưởng Để Đăng Tin
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="ticket-stub h-9 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Lưu Lên Chợ Cầu...</span>
                      </>
                    ) : editingAgentId || editingSubId ? (
                      "Lưu Thay Đổi"
                    ) : formMode === "free-agents" ? (
                      "Đăng Hồ Sơ & Xuất Thẻ FUT"
                    ) : (
                      "Đăng Tin Tuyển Người"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL THẺ CẦU THỦ FUT CARD ẢO (VIRAL MARKETING) */}
      <FutCardModal
        player={selectedFutPlayer}
        onClose={() => setSelectedFutPlayer(null)}
      />
    </div>
  );
}
