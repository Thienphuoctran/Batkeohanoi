"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  Shield,
  Search,
  Clock,
  Bell,
  X,
  Flame,
  MessageSquare,
  Phone,
  Volume2,
  Trophy,
  Plus,
} from "lucide-react";
import { MOCK_MATCH_FEEDS, MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { District, MatchFeedItem, SkillTier } from "@/types/matchmaking";
import { HeaderBar, ActiveTab } from "@/components/matchmaking/HeaderBar";
import { SosAlertCard } from "@/components/matchmaking/SosAlertCard";
import { MatchFeedCard } from "@/components/matchmaking/MatchFeedCard";
import { MatchChallengeModal } from "@/components/matchmaking/MatchChallengeModal";
import { CreateMatchModal } from "@/components/matchmaking/CreateMatchModal";
import { HeroPitchShowcase } from "@/components/matchmaking/HeroPitchShowcase";
import { SubMarketAndRollCall } from "@/components/matchmaking/SubMarketAndRollCall";
import { VietQrSplitter } from "@/components/matchmaking/VietQrSplitter";
import { TeamTrustProfile } from "@/components/matchmaking/TeamTrustProfile";
import {
  getZaloDeepLink,
  normalizeVietnamPhone,
  playNotificationChime,
} from "@/lib/zalo";
import { useRealtimeMatchFeed } from "@/hooks/useRealtimeMatches";
import { useAuthTeam } from "@/hooks/useAuthTeam";
import { AuthModal } from "@/components/auth/AuthModal";
import { TeamOnboardingModal } from "@/components/team/TeamOnboardingModal";
import { DigitalTeamCard } from "@/components/team/DigitalTeamCard";
import { signOutAction, createMatchInDatabaseAction } from "@/actions/auth";

interface BotLogItem {
  id: string;
  title: string;
  msg: string;
  badge: string;
  time: string;
  zaloPhone?: string;
  captainName?: string;
}

export default function HanoiMatchmakingPlatform() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("feed");
  const [isWideLayout, setIsWideLayout] = useState(true);
  const [myTrustScore, setMyTrustScore] = useState(100);

  // Quản lý xác thực Đội trưởng & Hồ sơ Đội bóng chính chủ (1 SĐT = 1 Đội)
  const {
    profile,
    team,
    refreshAuth,
    isAuthenticated,
    hasTeam,
  } = useAuthTeam();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTeamOnboardingOpen, setIsTeamOnboardingOpen] = useState(false);

  // Bộ lọc đa chiều: Tìm kiếm + Khung giờ + Quận + 3 Tier
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<"ALL" | District>(
    "ALL"
  );
  const [selectedTier, setSelectedTier] = useState<"ALL" | SkillTier>("ALL");

  // Modal & Trung tâm Chuông thông báo In-App + Zalo 1-Click
  const [activeChallengeMatch, setActiveChallengeMatch] =
    useState<MatchFeedItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBotDrawerOpen, setIsBotDrawerOpen] = useState(false);
  const [unreadBotCount, setUnreadBotCount] = useState(1);
  const [botLogs, setBotLogs] = useState<BotLogItem[]>([
    {
      id: "log-1",
      title: "⚽ Chào mừng bạn đến với BắtKèo7 Hà Nội",
      msg: "Hệ thống hỗ trợ ghép đối sân 7 Cầu Giấy & Nam Từ Liêm. Đăng ký tài khoản Đội trưởng để nhận Thẻ Căn Cước Bóng Đá Số và bảo vệ lịch đấu.",
      badge: "Hệ Thống",
      time: "Vừa xong",
    },
    {
      id: "log-2",
      title: "💬 Liên kết Zalo 1-Chạm & Chuông Web",
      msg: "Đội trưởng các đội không cần cài Telegram. Khi có đối bắt kèo, hệ thống tự mở khóa liên kết Zalo trực tiếp theo SĐT chính chủ.",
      badge: "Zalo Verified",
      time: "5 phút trước",
    },
  ]);

  const pushBotLog = (
    title: string,
    msg: string,
    badge: string,
    zaloPhone?: string,
    captainName?: string
  ) => {
    playNotificationChime();
    setBotLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title,
        msg,
        badge,
        time: "Vừa xong",
        zaloPhone,
        captainName,
      },
      ...prev,
    ]);
    setUnreadBotCount((c) => c + 1);
  };

  // Kết nối Supabase WebSockets Realtime (Zero Reload giữa các thiết bị)
  const {
    matches,
    setMatches,
    broadcastNewMatch,
    broadcastMatchLock,
  } = useRealtimeMatchFeed(MOCK_MATCH_FEEDS, pushBotLog);

  // Lọc danh sách kèo
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const passDistrict =
        selectedDistrict === "ALL" || m.district === selectedDistrict;
      const passTier =
        selectedTier === "ALL" || m.requiredTier === selectedTier;
      const passTime =
        selectedTimeSlot === "ALL" || m.startTime.includes(selectedTimeSlot);
      const q = searchQuery.trim().toLowerCase();
      const passSearch =
        !q ||
        m.pitchName.toLowerCase().includes(q) ||
        m.hostTeam.name.toLowerCase().includes(q) ||
        m.hostTeam.captainName.toLowerCase().includes(q);
      return passDistrict && passTier && passTime && passSearch;
    });
  }, [
    matches,
    selectedDistrict,
    selectedTier,
    selectedTimeSlot,
    searchQuery,
  ]);

  const sosMatches = filteredMatches.filter(
    (m) => m.isSOS && m.status !== "MATCHED"
  );
  const regularMatches = filteredMatches.filter(
    (m) => !m.isSOS || m.status === "MATCHED"
  );

  // Xử lý xác nhận bắt đối (Khóa kèo Row-Level Lock qua API + Đồng bộ WebSocket)
  const handleConfirmChallenge = async (
    matchId: string,
    challengerTeamName: string,
    challengerPhone: string,
    challengerZalo?: string
  ) => {
    const target = matches.find((m) => m.id === matchId);

    // Cập nhật trạng thái Optimistic UI
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: "MATCHED",
              isSOS: false,
              guestTeam: {
                ...MOCK_TEAMS[0],
                name: challengerTeamName,
                shortName: challengerTeamName,
                captainPhone: challengerPhone,
                captainZalo: challengerZalo || challengerPhone,
              },
            }
          : m
      )
    );

    // Phát sóng Realtime sang các thiết bị khác đang mở bảng tin (Zero Reload)
    await broadcastMatchLock(
      matchId,
      challengerTeamName,
      challengerPhone,
      challengerZalo
    );

    // Đẩy thông báo vào Trung tâm Chuông Web kèm nút Zalo 1-Click
    if (target) {
      pushBotLog(
        `⚡ Đã Khóa Kèo Thành Công (#${matchId})`,
        `${challengerTeamName} (${challengerPhone}) đã chốt kèo với ${target.hostTeam.name} tại ${target.pitchName} (${target.startTime}). Bấm nút bên dưới để mở Zalo trao đổi màu áo ngay!`,
        "Đã Chốt Kèo",
        target.hostTeam.captainZalo || target.hostTeam.captainPhone,
        `${target.hostTeam.captainName} (${target.hostTeam.shortName})`
      );
    }

    try {
      await fetch(`/api/matches/${matchId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestTeamName: challengerTeamName,
          guestCaptainPhone: challengerPhone,
          guestCaptainZalo: challengerZalo || challengerPhone,
          guestTrustScore: myTrustScore,
        }),
      });
    } catch (err) {
      console.log("Local challenge synchronized");
    }
  };

  const handleCreateNewMatch = async (newMatch: MatchFeedItem) => {
    setMatches((prev) => [newMatch, ...prev]);
    setActiveTab(newMatch.isSOS ? "sos" : "feed");

    // Phát sóng Realtime sang các thiết bị khác đang mở bảng tin (Zero Reload)
    await broadcastNewMatch(newMatch);

    // Nếu Đội trưởng đã đăng ký đội chính chủ trên Supabase, lưu kèo thẳng vào bảng public.matches
    if (team?.id) {
      await createMatchInDatabaseAction({
        hostTeamId: team.id,
        pitchCustomName: newMatch.pitchName,
        district: newMatch.district,
        timeSlotLabel: `${newMatch.startTime} - ${newMatch.endTime}`,
        totalFee: newMatch.totalCostVnd,
        splitFee: newMatch.shareCostVnd,
        isSos: newMatch.isSOS,
        notes: newMatch.notes,
      });
    }

    pushBotLog(
      newMatch.isSOS
        ? "🚨 Đã Phát Tín Hiệu Cứu Hộ SOS"
        : "⚽ Đã Đăng Kèo Mới Lên Bảng Tin",
      `${newMatch.hostTeam.name} tìm đối tại ${newMatch.pitchName} (${newMatch.startTime}). Đã gắn định tuyến Zalo (${newMatch.hostTeam.captainPhone}).`,
      newMatch.isSOS ? "SOS < 2h" : "Kèo Mới",
      newMatch.hostTeam.captainZalo || newMatch.hostTeam.captainPhone,
      `${newMatch.hostTeam.captainName} (${newMatch.hostTeam.shortName})`
    );

    try {
      await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });
    } catch (err) {
      console.log("Local match synchronized");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] bg-stadium-grid text-slate-100 flex flex-col pb-16">
      <div
        className={`w-full mx-auto transition-all duration-300 ${
          isWideLayout
            ? "max-w-6xl"
            : "max-w-md border-x border-slate-800/80 shadow-2xl"
        }`}
      >
        {/* Thanh Header + Marquee + Radar Thời Tiết Sân */}
        <HeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sosCount={
            matches.filter((m) => m.isSOS && m.status !== "MATCHED").length
          }
          openMatchCount={matches.filter((m) => m.status !== "MATCHED").length}
          myTrustScore={team?.trust_score ?? myTrustScore}
          unreadBotCount={unreadBotCount}
          isWideLayout={isWideLayout}
          onToggleWideLayout={() => setIsWideLayout(!isWideLayout)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenBotDrawer={() => {
            setIsBotDrawerOpen(true);
            setUnreadBotCount(0);
          }}
          isAuthenticated={isAuthenticated}
          hasTeam={hasTeam}
          currentTeamName={team?.team_name}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenTeamOnboarding={() => setIsTeamOnboardingOpen(true)}
        />

        {/* Main Content Container */}
        <main className="px-4 pt-4 space-y-5">
          {/* WORKSPACE 1: BẢNG TIN KÈO ĐẤU */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {/* HERO PITCH SHOWCASE & COMPONENT KIT PANEL (BatKeo7.vn) */}
              <HeroPitchShowcase
                onOpenCreateModal={() => setIsCreateOpen(true)}
                onSelectDistrict={(dist) => setSelectedDistrict(dist)}
                selectedDistrict={selectedDistrict}
                onSelectTier={(tier) => setSelectedTier(tier)}
                selectedTier={selectedTier}
                onSwitchTab={(tab) => setActiveTab(tab)}
                sosCount={
                  matches.filter((m) => m.isSOS && m.status !== "MATCHED").length
                }
                openMatchCount={
                  matches.filter((m) => m.status !== "MATCHED").length
                }
                onScrollToFeed={() => {
                  const el = document.getElementById("matches-feed-anchor");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              />

              {/* Thanh Tìm Kiếm + Chọn Ca Giờ + Quận + 3 Tier */}
              <section id="matches-feed-anchor" className="surface-card rounded-2xl border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên sân (Thành Phát, Mễ Trì, Đình Thôn...), tên FC, đội trưởng..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden sm:inline" />
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      aria-label="Lọc theo khung giờ"
                      className="h-9 px-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">⏰ Mọi khung giờ</option>
                      <option value="17:30">Ca 17:30</option>
                      <option value="19:00">Ca 19:00</option>
                      <option value="19:30">Ca 19:30</option>
                      <option value="20:30">Ca 20:30</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 border-t border-white/[0.05]">
                  {/* Quận */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      Quận:
                    </span>
                    {(["ALL", "Cầu Giấy", "Nam Từ Liêm"] as const).map(
                      (dist) => (
                        <button
                          key={dist}
                          onClick={() => setSelectedDistrict(dist)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                            selectedDistrict === dist
                              ? dist === "Cầu Giấy"
                                ? "bg-sky-500/25 text-sky-200 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)] ring-1 ring-sky-400"
                                : dist === "Nam Từ Liêm"
                                ? "bg-amber-500/25 text-amber-200 border border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-400"
                                : "bg-emerald-500/25 text-emerald-200 border border-emerald-400 ring-1 ring-emerald-400"
                              : "bg-slate-950/80 text-slate-400 hover:text-white border border-white/[0.07]"
                          }`}
                        >
                          {dist === "ALL" ? "Tất cả (2 Quận)" : dist}
                        </button>
                      )
                    )}
                  </div>

                  {/* 3 Tier */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      Tier:
                    </span>
                    <button
                      onClick={() => setSelectedTier("ALL")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTier === "ALL"
                          ? "bg-slate-200 text-slate-950 font-black"
                          : "bg-slate-950/80 text-slate-400 hover:text-white border border-white/[0.07]"
                      }`}
                    >
                      Mọi Tier
                    </button>
                    {([1, 2, 3] as SkillTier[]).map((t) => {
                      const active = selectedTier === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTier(t)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                            active
                              ? t === 1
                                ? "bg-[#1d4ed8] text-white border-blue-300 shadow-md ring-1 ring-blue-400"
                                : t === 2
                                ? "bg-[#15803d] text-white border-emerald-300 shadow-md ring-1 ring-emerald-400"
                                : "bg-[#9a3412] text-white border-orange-300 shadow-md ring-1 ring-orange-400"
                              : "bg-slate-950/80 border-white/[0.07] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {t === 1 ? "Tier 1: Dưỡng sinh" : t === 2 ? "Tier 2: Phong trào" : "Tier 3: Phủi chiến"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Kèo SOS nổi bật trên đầu Bảng Kèo */}
              {sosMatches.length > 0 && (
                <section className="space-y-3">
                  {sosMatches.map((sos) => (
                    <SosAlertCard
                      key={sos.id}
                      match={sos}
                      onSelectMatch={(m) => setActiveChallengeMatch(m)}
                    />
                  ))}
                </section>
              )}

              {/* Danh sách Kèo Thường */}
              {filteredMatches.length === 0 ? (
                <div className="surface-card rounded-2xl border border-white/[0.08] p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Chưa có kèo đấu nào đang mở</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Hãy là đội đầu tiên mở kèo giao lưu hôm nay hoặc bấm tạo kèo để tìm đối thủ ngay!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/15 transition"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Tạo Kèo Mới Ngay</span>
                  </button>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 ${
                    isWideLayout ? "md:grid-cols-2" : ""
                  } gap-3.5`}
                >
                  {regularMatches.map((match) => (
                    <MatchFeedCard
                      key={match.id}
                      match={match}
                      onSelectMatch={(m) => setActiveChallengeMatch(m)}
                      onOpenBlindReview={() => setActiveTab("trust-profile")}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 2: TAB CỨU HỘ SOS CHUYÊN BIỆT */}
          {activeTab === "sos" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/40 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-rose-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 fill-current animate-bounce" />
                    <span>TRẠM CỨU HỘ KÈO PHÚT CHÓT (&lt; 2 TIẾNG)</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cứu kèo giúp sân không bị bỏ trống • Giảm ngay 125.000đ tiền sân &amp; Thưởng +8 điểm tín nhiệm
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black">
                  Ưu tiên số 1
                </span>
              </div>

              {sosMatches.length > 0 ? (
                <div className="space-y-3.5">
                  {sosMatches.map((sos) => (
                    <SosAlertCard
                      key={sos.id}
                      match={sos}
                      onSelectMatch={(m) => setActiveChallengeMatch(m)}
                    />
                  ))}
                </div>
              ) : (
                <div className="surface-card rounded-2xl border border-white/[0.08] p-8 text-center text-xs text-slate-400">
                  Hiện tại không có kèo SOS nào cần cứu hộ. Hãy kiểm tra lại sau hoặc mở kèo mới!
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 3: CHỢ CẦU LẺ */}
          {activeTab === "sub-market" && (
            <SubMarketAndRollCall viewMode="sub-market" />
          )}

          {/* WORKSPACE 4: MÁY TÍNH VIETQR */}
          {activeTab === "vietqr" && (
            <VietQrSplitter />
          )}

          {/* WORKSPACE 6: HỒ SƠ ĐỘI TÔI & THẺ CĂN CƯỚC BÓNG ĐÁ SỐ */}
          {activeTab === "trust-profile" && (
            <div className="space-y-4">
              {hasTeam && team ? (
                <DigitalTeamCard
                  team={team}
                  profile={profile}
                  onQuickCreateMatch={() => setIsCreateOpen(true)}
                  onSignOut={async () => {
                    await signOutAction();
                    await refreshAuth();
                  }}
                />
              ) : (
                <div className="surface-card rounded-2xl border border-emerald-500/35 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Định danh minh bạch • 1 SĐT = 1 Đội
                    </span>
                    <h3 className="text-base font-extrabold text-white pt-1">
                      {!isAuthenticated
                        ? "Bạn chưa đăng nhập tài khoản Đội trưởng"
                        : "Hoàn tất 3 bước tạo Hồ sơ Đội bóng của bạn"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cấp ngay <strong>Thẻ Căn Cước Bóng Đá Số</strong> kèm{" "}
                      <strong className="text-emerald-400">
                        100/100 điểm tín nhiệm
                      </strong>{" "}
                      (Miễn cọc tiền mặt) và khóa SĐT Zalo chính chủ chống bùng kèo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsTeamOnboardingOpen(true);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shrink-0 shadow-lg shadow-emerald-500/20 transition"
                  >
                    {!isAuthenticated
                      ? "Đăng ký / Đăng nhập Đội trưởng"
                      : "Thiết lập Đội bóng ngay"}
                  </button>
                </div>
              )}

              <TeamTrustProfile
                myTrustScore={team?.trust_score ?? myTrustScore}
                setMyTrustScore={setMyTrustScore}
                onPushBotLog={pushBotLog}
              />
            </div>
          )}
        </main>
      </div>

      {/* Modal Khớp Kèo */}
      <MatchChallengeModal
        match={activeChallengeMatch}
        myTrustScore={team?.trust_score ?? myTrustScore}
        onClose={() => setActiveChallengeMatch(null)}
        onConfirmMatch={handleConfirmChallenge}
      />

      {/* Modal Đăng Kèo Mới */}
      <CreateMatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateMatch={handleCreateNewMatch}
        verifiedTeam={team}
        verifiedProfile={profile}
        onRequireAuth={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsTeamOnboardingOpen(true);
          }
        }}
      />

      {/* Modal Đăng Nhập / Đăng Ký Đội Trưởng */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          await refreshAuth();
          setIsTeamOnboardingOpen(true);
        }}
      />

      {/* Modal Wizard 3 Bước Tạo Hồ Sơ Đội Bóng Chính Chủ */}
      <TeamOnboardingModal
        isOpen={isTeamOnboardingOpen}
        onClose={() => setIsTeamOnboardingOpen(false)}
        initialCaptainName={profile?.full_name || ""}
        initialPhone={profile?.phone || ""}
        onSuccess={async (createdTeam) => {
          await refreshAuth();
          setActiveTab("trust-profile");
          pushBotLog(
            `🎉 Đã Cấp Thẻ Căn Cước Đội: ${createdTeam?.team_name || "Đội mới"}`,
            `Đội bóng đã được xác thực chính chủ với 100/100 điểm tín nhiệm (Miễn cọc tiền mặt).`,
            "100/100 ★",
            profile?.phone,
            profile?.full_name
          );
        }}
      />

      {/* Trung Tâm Chuông Thông Báo In-App & Liên Kết Zalo 1-Click */}
      {isBotDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[84vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Trung Tâm Thông Báo BắtKèo7
                  </h3>
                  <p className="text-[11px] text-emerald-400">
                    ● Chuông Web Trực Tiếp &amp; Mở Zalo 1-Chạm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBotDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-3 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong className="text-sky-300">Khách hàng / Đội trưởng</strong>{" "}
              nhận chuông báo trực tiếp trên Web và bấm 1 chạm nhảy thẳng sang{" "}
              <strong className="text-white">Zalo</strong> theo số điện thoại đã
              chuẩn hóa (không cần cài Telegram).
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {botLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {log.badge}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{log.title}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {log.msg}
                  </p>

                  {log.zaloPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={getZaloDeepLink(log.zaloPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#0068FF] hover:bg-[#0057D9] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>
                          Mở Zalo {log.captainName || "Đội trưởng"}
                        </span>
                      </a>
                      <a
                        href={`tel:${normalizeVietnamPhone(log.zaloPhone)}`}
                        className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  pushBotLog(
                    "🔔 Test Chuông Báo Chốt Kèo & Zalo 1-Chạm",
                    "Đội FC Anh Em Cầu Giấy (0988.666.888) vừa nhận đối ca 19:00 tại Sân Thành Phát. Bấm nút bên dưới để nhảy thẳng sang Zalo Đội trưởng!",
                    "Test In-App",
                    "0988666888",
                    "Đội trưởng Tuấn"
                  );
                }}
                className="w-full h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chuông Web &amp; Nút Mở Zalo Đội Trưởng</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
