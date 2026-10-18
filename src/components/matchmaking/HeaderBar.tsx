"use client";

import React, { useState } from "react";
import {
  Flame,
  Users,
  QrCode,
  ShieldCheck,
  CloudSun,
  Plus,
  Bell,
  Maximize2,
  Minimize2,
  Trophy,
  Wallet,
  MapPin,
} from "lucide-react";
import { EscrowWallet } from "@/types/matchmaking";
import { Button } from "@/components/ui/button";

export type ActiveTab =
  | "feed"
  | "sos"
  | "sub-market"
  | "pitch-map"
  | "trust-profile";

interface HeaderBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  sosCount: number;
  openMatchCount: number;
  myTrustScore: number;
  unreadBotCount: number;
  isWideLayout: boolean;
  onToggleWideLayout: () => void;
  onOpenCreateModal: () => void;
  onOpenBotDrawer: () => void;
  isAuthenticated?: boolean;
  hasTeam?: boolean;
  currentTeamName?: string;
  onOpenAuthModal?: () => void;
  onOpenTeamOnboarding?: () => void;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
}

const PITCH_WEATHER_DATA: Record<
  string,
  { temp: string; humidity: string; status: string; tip: string }
> = {
  "Trung Kính Hạ (Cầu Giấy)": {
    temp: "26°C",
    humidity: "65%",
    status: "Cỏ khô ráo • Giày TF",
    tip: "Hệ thống đèn LED cụm sân 1-4 sáng tốt, mặt cỏ nhân tạo vừa bảo dưỡng hạt cao su.",
  },
  "Thành Phát (Hoàng Minh Giám)": {
    temp: "26°C",
    humidity: "64%",
    status: "Thoáng gió • Sân đẹp",
    tip: "Khu vực Hoàng Minh Giám đông xe giờ tan tầm 17h30–18h30, anh em chủ động đi sớm 15 phút.",
  },
  "Mễ Trì Hạ (Nam Từ Liêm)": {
    temp: "25°C",
    humidity: "68%",
    status: "Cỏ khô • Đá tốc độ tốt",
    tip: "Mặt sân Mễ Trì Hạ thoát nước nhanh, độ nảy bóng chuẩn, phù hợp cả Tier 2 và Tier 3.",
  },
  "ĐH Thương Mại (Cầu Giấy)": {
    temp: "26°C",
    humidity: "66%",
    status: "Cỏ êm • Không mưa",
    tip: "Bãi gửi xe ôtô/xe máy rộng rãi ngay cổng phụ, mặt cỏ mềm hạn chế trầy xước.",
  },
  "Đình Thôn (Mỹ Đình)": {
    temp: "25°C",
    humidity: "67%",
    status: "Trời mát • Đinh TF",
    tip: "Gió nhẹ khu vực đại lộ, mặt sân khô ráo, khuyến nghị mang giày đinh dăm TF tiêu chuẩn.",
  },
};

export function HeaderBar({
  activeTab,
  setActiveTab,
  sosCount,
  openMatchCount,
  myTrustScore,
  unreadBotCount,
  isWideLayout,
  onToggleWideLayout,
  onOpenCreateModal,
  onOpenBotDrawer,
  isAuthenticated,
  hasTeam,
  currentTeamName,
  onOpenAuthModal,
  onOpenTeamOnboarding,
  escrowWallet,
  onOpenEscrowModal,
}: HeaderBarProps) {
  const [selectedPitch, setSelectedPitch] = useState(
    "Trung Kính Hạ (Cầu Giấy)"
  );
  const weather = PITCH_WEATHER_DATA[selectedPitch];

  const navTabs: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    isSos?: boolean;
  }[] = [
    { id: "feed", label: "Kèo Đấu", icon: <Trophy className="w-3.5 h-3.5" /> },
    {
      id: "sos",
      label: "Cứu Hộ",
      icon: <Flame className="w-3.5 h-3.5" />,
      badge: sosCount,
      isSos: true,
    },
    { id: "sub-market", label: "Chợ Cầu", icon: <Users className="w-3.5 h-3.5" /> },
    { id: "pitch-map", label: "Bản Đồ", icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0B1120]/90 backdrop-blur-xl">
      {/* 1. Magic UI Live Marquee Ticker */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 py-1.5 px-3 overflow-hidden flex items-center gap-2">
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE HN
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full text-[11px] text-slate-300 font-medium">
          <div className="animate-marquee inline-flex items-center gap-8">
            <span>⚡ FC Vinaconex vừa mở kèo Sân Thành Phát (19:00 hôm nay)</span>
            <span>🛡️ Quy chế v2.0: Hủy sát giờ &lt;1h lần 2 gắn nhãn đỏ &amp; cọc 100%</span>
            <span>🔥 Kèo Cứu Hộ SOS Sân ĐH Thương Mại giảm ngay 150k tiền sân hỗ trợ anh em</span>
            <span>🌤️ Thời tiết Toàn Hà Nội tối nay: 25-26°C, mặt cỏ khô ráo đá cực đã</span>
            <span>⚡ FC Vinaconex vừa mở kèo Sân Thành Phát (19:00 hôm nay)</span>
            <span>🛡️ Quy chế v2.0: Hủy sát giờ &lt;1h lần 2 gắn nhãn đỏ &amp; cọc 100%</span>
          </div>
        </div>
      </div>

      {/* 2. Main Top Bar */}
      <div className="px-4 pt-3 pb-2.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-base">
              7v7
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">
                  BắtKèo7<span className="text-emerald-400">.vn</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Hà Nội v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Toàn Hà Nội • Ghép Đối Sân 7 &amp; Chống Bùng Kèo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleWideLayout}
              title="Chuyển đổi khung nhìn Mobile / Bento Dashboard"
              className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            >
              {isWideLayout ? (
                <Minimize2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onOpenBotDrawer}
              title="Telegram Bot Webhook Logs (@BatkeoHanoi_bot)"
              className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Bell className="w-4 h-4 text-sky-400" />
              {unreadBotCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadBotCount}
                </span>
              )}
            </button>

            {!isAuthenticated ? (
              <button
                onClick={onOpenAuthModal}
                className="h-9 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 font-extrabold text-xs inline-flex items-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Đăng nhập / Tạo Đội</span>
              </button>
            ) : !hasTeam ? (
              <button
                onClick={onOpenTeamOnboarding}
                className="h-9 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-xs inline-flex items-center gap-1.5 transition animate-pulse"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Hoàn tất Tạo Đội</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab("trust-profile")}
                className="h-9 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-extrabold text-xs inline-flex items-center gap-1.5 transition max-w-[140px]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentTeamName}</span>
              </button>
            )}

            {/* Quick Pill Ví Ký Quỹ */}
            <button
              onClick={onOpenEscrowModal}
              title="Ví Ký Quỹ Nội Bộ (Bảo chứng 200k & Hoàn tiền tự động)"
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/35 font-extrabold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="hidden sm:inline">Ví:</span>
              <span className="tabular-nums font-mono text-sky-200">
                {(escrowWallet?.balance ?? 0).toLocaleString("vi-VN")}đ
              </span>
              {escrowWallet && escrowWallet.lockedAmount > 0 && (
                <span
                  title={`Đang tạm khóa ${escrowWallet.lockedAmount.toLocaleString("vi-VN")}đ`}
                  className="w-2 h-2 rounded-full bg-amber-400 animate-ping"
                />
              )}
            </button>

            <Button
              onClick={onOpenCreateModal}
              className="h-9 px-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tạo Kèo</span>
            </Button>
          </div>
        </div>

        {/* 3. Hyper-Local Pitch Weather Radar Selector */}
        <div className="rounded-xl bg-slate-900/95 border border-slate-800/90 px-3 py-2 flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedPitch}
                onChange={(e) => setSelectedPitch(e.target.value)}
                aria-label="Chọn cụm sân xem thời tiết"
                className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                {Object.keys(PITCH_WEATHER_DATA).map((pitch) => (
                  <option key={pitch} value={pitch} className="bg-slate-900 text-white">
                    Sân {pitch}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                {weather.status}
              </span>
              <span className="text-[11px] font-extrabold text-amber-300 tabular-nums">
                {weather.temp} • {weather.humidity}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">
            <span className="truncate">{weather.tip}</span>
            <button
              onClick={() => setActiveTab("trust-profile")}
              className="shrink-0 ml-2 inline-flex items-center gap-1 font-bold text-emerald-400 hover:underline"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Uy tín đội bạn: {myTrustScore}/100</span>
            </button>
          </div>
        </div>

        {/* 4. 5-Tab Navigation Bar + Trust Profile Pill */}
        <div className="grid grid-cols-5 gap-1.5 bg-slate-900/95 p-1 rounded-xl border border-slate-800/90 text-[11px] font-semibold">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  active
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm"
                    : tab.isSos
                    ? "text-rose-400 hover:bg-slate-800/60 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab("trust-profile")}
            className={`py-2 px-1 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === "trust-profile"
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-sm"
                : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="truncate">Đội Tôi</span>
          </button>
        </div>
      </div>
    </header>
  );
}
