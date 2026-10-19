"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Scale,
  Bot,
  BookOpen,
  LogOut,
} from "lucide-react";
import { EscrowWallet } from "@/types/matchmaking";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/reactbits/ShinyText";

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
  onSignOut?: () => void;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
  onOpenSupport?: () => void;
  onOpenGuide?: () => void;
  onOpenRules?: () => void;
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
  onSignOut,
  escrowWallet,
  onOpenEscrowModal,
  onOpenSupport,
  onOpenGuide,
  onOpenRules,
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
    <header className="sticky top-0 z-40 border-b border-emerald-500/20 bg-[#04160d]/85 backdrop-blur-xl">
      {/* 1. Magic UI Live Marquee Ticker */}
      <div className="bg-[#020d07]/90 border-b border-emerald-950/80 py-1.5 px-3 overflow-hidden flex items-center gap-2">
        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-400 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE HN
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full text-[11px] text-slate-300 font-medium">
          <div className="animate-marquee inline-flex items-center gap-8">
            <span>⚡ FC Vinaconex vừa mở kèo Sân Thành Phát (19:00 hôm nay)</span>
            <span>🛡️ Quy chế v2.0: Hủy sát giờ &lt;1h lần 2 gắn nhãn đỏ &amp; cọc 100%</span>
            <span>🔥 Kèo Cứu Hộ SOS Sân ĐH Thương Mại đang tìm đối gấp, thưởng +8đ uy tín</span>
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
            {/* Logo Thương Hiệu GiaoHuu.vn (Ảnh 2) */}
            <div className="relative group shrink-0">
              <img
                src="/api/logo"
                alt="GiaoHuu.vn - Sân Ghép Trận Sân 7"
                className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-[0_2px_12px_rgba(16,185,129,0.35)] transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback nếu ảnh chưa tải xong
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center">
                  <ShinyText text="GiaoHuu" speed={3.5} className="text-white" />
                  <span className="text-emerald-400 font-black">.vn</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Hà Nội v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block">
                Sân Ghép Trận Sân 7 &amp; Chống Bùng Kèo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={onToggleWideLayout}
              title="Chuyển đổi khung nhìn Mobile / Bento Dashboard"
              className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0a2318]/90 hover:bg-[#0e2f20] text-slate-300 border border-emerald-500/25 transition"
            >
              {isWideLayout ? (
                <Minimize2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onOpenBotDrawer}
              title="Telegram Bot Webhook Logs (@GiaohuuHanoi_bot)"
              className="relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0a2318]/90 hover:bg-[#0e2f20] text-slate-200 border border-emerald-500/25 transition shrink-0"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              {unreadBotCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadBotCount}
                </span>
              )}
            </button>

            {onOpenRules && (
              <button
                onClick={onOpenRules}
                title="Bảng Nội Quy & Quy Chế Kỷ Luật BắtKèo7"
                className="inline-flex items-center justify-center w-8 h-8 sm:w-auto px-0 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-[#1c1917]/90 hover:bg-[#292524] text-amber-300 border border-amber-500/35 text-xs font-bold gap-1.5 transition active:scale-95 shadow-sm shadow-amber-500/10 shrink-0"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Nội Quy</span>
              </button>
            )}

            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                title="Cẩm Nang Hướng Dẫn Sử Dụng GiaoHuu.vn"
                className="inline-flex items-center justify-center w-8 h-8 sm:w-auto px-0 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-[#0a2318]/90 hover:bg-[#0e2f20] text-slate-200 border border-emerald-500/25 text-xs font-bold gap-1.5 transition active:scale-95 shadow-sm shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Hướng Dẫn</span>
              </button>
            )}

            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                title="Tư Vấn Khách Hàng & AI Trợ Lý GiaoHuu.vn"
                className="relative inline-flex items-center justify-center w-8 h-8 sm:w-auto px-0 sm:px-2.5 h-8 sm:h-9 rounded-xl bg-[#0a2318]/90 hover:bg-[#0e2f20] text-emerald-300 border border-emerald-500/35 text-xs font-bold gap-1.5 transition active:scale-95 shadow-sm shadow-emerald-500/10 shrink-0"
              >
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="hidden sm:inline">Tư Vấn</span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>
            )}

            {!isAuthenticated ? (
              <button
                onClick={onOpenAuthModal}
                className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-[#0a2318] hover:bg-[#0e2f20] text-emerald-300 border border-emerald-500/40 font-extrabold text-xs inline-flex items-center gap-1 sm:gap-1.5 transition whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="sm:hidden">Đăng nhập</span>
                <span className="hidden sm:inline">Đăng nhập / Tạo Đội</span>
              </button>
            ) : !hasTeam ? (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={onOpenTeamOnboarding}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-xs inline-flex items-center gap-1 sm:gap-1.5 transition animate-pulse whitespace-nowrap shrink-0"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="sm:hidden">Tạo Đội</span>
                  <span className="hidden sm:inline">Hoàn tất Tạo Đội</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
                        onSignOut();
                      }
                    }}
                    title="Đăng xuất tài khoản"
                    className="h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => setActiveTab("trust-profile")}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-xl bg-[#0a2318] hover:bg-[#0e2f20] text-emerald-300 border border-emerald-500/40 font-extrabold text-xs inline-flex items-center gap-1 sm:gap-1.5 transition max-w-[110px] sm:max-w-[140px]"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentTeamName}</span>
                </button>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Bạn có chắc chắn muốn đăng xuất tài khoản?")) {
                        onSignOut();
                      }
                    }}
                    title="Đăng xuất tài khoản"
                    className="h-8 sm:h-9 w-8 sm:w-auto px-0 sm:px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold inline-flex items-center justify-center gap-1 transition active:scale-95 shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đăng xuất</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Pill Ví Ký Quỹ */}
            <button
              onClick={onOpenEscrowModal}
              title="Ví Ký Quỹ Nội Bộ (Bảo chứng 200k & Hoàn tiền tự động)"
              className="h-9 px-2.5 sm:px-3 rounded-xl bg-[#0a2318] hover:bg-[#0e2f20] text-amber-300 border border-amber-500/35 font-extrabold text-xs inline-flex items-center gap-1.5 transition"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Ví:</span>
              <span className="tabular-nums font-mono text-amber-200">
                {(escrowWallet?.balance ?? 0).toLocaleString("vi-VN")}đ
              </span>
              {escrowWallet && escrowWallet.lockedAmount > 0 && (
                <span
                  title={`Đang tạm khóa ${escrowWallet.lockedAmount.toLocaleString("vi-VN")}đ`}
                  className="w-2 h-2 rounded-full bg-amber-400 animate-ping"
                />
              )}
            </button>

            {/* Concept 2: Nút Tạo Kèo Cam Lửa Bắt Mắt */}
            <Button
              onClick={onOpenCreateModal}
              className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs gap-1.5 shadow-lg shadow-orange-500/30 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Tạo Kèo</span>
            </Button>
          </div>
        </div>

        {/* 3. Hyper-Local Pitch Weather Radar Selector */}
        <div className="rounded-xl bg-[#061e13]/90 border border-emerald-500/25 px-2.5 sm:px-3 py-1.5 sm:py-2 flex flex-col gap-1 sm:gap-1.5">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <CloudSun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
              <select
                value={selectedPitch}
                onChange={(e) => setSelectedPitch(e.target.value)}
                aria-label="Chọn cụm sân xem thời tiết"
                className="bg-transparent text-[11px] font-bold text-slate-200 focus:outline-none cursor-pointer truncate max-w-[130px] sm:max-w-none"
              >
                {Object.keys(PITCH_WEATHER_DATA).map((pitch) => (
                  <option key={pitch} value={pitch} className="bg-slate-900 text-white">
                    Sân {pitch}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                {weather.status}
              </span>
              <span className="text-[10px] sm:text-[11px] font-extrabold text-amber-300 tabular-nums whitespace-nowrap">
                {weather.temp}
              </span>
              <button
                onClick={() => setActiveTab("trust-profile")}
                className="sm:hidden ml-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                title="Điểm tín nhiệm đội của bạn"
              >
                ★{myTrustScore}đ
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-1">
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
        <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-1 sm:gap-1.5 bg-[#061e13]/90 p-1 sm:p-1.5 rounded-xl border border-emerald-500/20 text-[11px] font-semibold backdrop-blur-md">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-1.5 sm:py-2 px-2.5 sm:px-1 rounded-lg flex items-center justify-center gap-1 transition-all flex-shrink-0 min-w-fit sm:min-w-0 ${
                  active
                    ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                    : tab.isSos
                    ? "text-rose-400 hover:bg-[#0a2318] font-bold"
                    : "text-slate-300 hover:text-white hover:bg-[#0a2318]"
                }`}
              >
                {tab.icon}
                <span className="whitespace-nowrap">{tab.label}</span>
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
            className={`py-1.5 sm:py-2 px-2.5 sm:px-1 rounded-lg flex items-center justify-center gap-1 transition-all flex-shrink-0 min-w-fit sm:min-w-0 ${
              activeTab === "trust-profile"
                ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                : "text-slate-300 hover:text-white hover:bg-[#0a2318]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="whitespace-nowrap">Đội Tôi</span>
          </button>
        </div>
      </div>
    </header>
  );
}
