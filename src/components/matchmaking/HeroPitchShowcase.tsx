"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  CloudSun,
  ShieldCheck,
  Star,
  Plus,
  Handshake,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { District, SkillTier } from "@/types/matchmaking";
import { ActiveTab } from "./HeaderBar";

interface HeroPitchShowcaseProps {
  onOpenCreateModal: () => void;
  onSelectDistrict: (district: "ALL" | District) => void;
  selectedDistrict: "ALL" | District;
  onSelectTier: (tier: "ALL" | SkillTier) => void;
  selectedTier: "ALL" | SkillTier;
  onSwitchTab: (tab: ActiveTab) => void;
  sosCount: number;
  openMatchCount: number;
  onScrollToFeed?: () => void;
}

export function HeroPitchShowcase({
  onOpenCreateModal,
  onSelectDistrict,
  selectedDistrict,
  onSelectTier,
  selectedTier,
  onSwitchTab,
  sosCount,
  openMatchCount,
  onScrollToFeed,
}: HeroPitchShowcaseProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(3098); // ~00:51:38

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const remSec = sec % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(remSec).padStart(2, "0")}`;
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0c121f] p-3 sm:p-5 shadow-2xl shadow-emerald-950/20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* ========================================================
            CỘT TRÁI: HERO PITCH CARD (SÂN BÓNG 7v7 ĐÊM HÀ NỘI)
            ======================================================== */}
        <div className="lg:col-span-6 relative rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] border border-white/[0.08] shadow-inner flex flex-col justify-between p-4 sm:p-6 group">
          {/* Background Image / Fallback Photo-Realistic Turf Stadium */}
          {!imgFailed ? (
            <img
              src="/images/hanoi-7v7-hero.jpg"
              alt="BatKeo7.vn - Sân bóng đá phủi 7v7 Hà Nội buổi tối"
              onError={() => setImgFailed(true)}
              className="absolute inset-0 w-full h-full object-cover object-left group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1428] via-[#0d2218] to-[#081810]">
              {/* Simulated Stadium Dusk Sky & Floodlights Glow */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-amber-500/15 via-rose-500/10 to-transparent" />
              <div className="absolute -top-12 left-1/4 w-52 h-52 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-12 right-1/4 w-52 h-52 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

              {/* 2D Synthetic Turf Field Texture */}
              <div className="absolute bottom-0 inset-x-0 h-3/5 bg-gradient-to-t from-emerald-950 via-emerald-900/60 to-transparent" />
              <div className="absolute bottom-6 inset-x-4 h-48 border-2 border-emerald-400/25 rounded-2xl bg-emerald-500/[0.03]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-emerald-400/30 rounded-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981]" />
                </div>
              </div>
            </div>
          )}

          {/* Vignette Overlay for High Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-black/30 to-black/60 pointer-events-none" />

          {/* Top Title Overlay */}
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Cụm Sân Hà Nội Giờ Vàng (17h30 - 20h30)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
              BatKeo7<span className="text-emerald-400">.vn</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-slate-200/90 drop-shadow">
              Đặt kèo bóng đá phủi 7v7 tại Hà Nội • Cầu Giấy &amp; Nam Từ Liêm
            </p>
          </div>

          {/* Bottom Pitch Details Overlay */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/15">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span>🏟️ Mặt cỏ nhân tạo TF tiêu chuẩn</span>
              <span className="text-emerald-400">• Đèn LED cao áp</span>
            </div>
            <span className="text-[11px] font-extrabold text-amber-300 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 px-2.5 py-1 rounded-lg">
              {openMatchCount > 0 ? `${openMatchCount} kèo đang mở` : "Hệ thống sẵn sàng"}
            </span>
          </div>
        </div>

        {/* ========================================================
            CỘT PHẢI: BỘ COMPONENT & CONTROL PANEL (CHUẨN ẢNH THIẾT KẾ)
            ======================================================== */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-3.5 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/[0.08] p-4 sm:p-5">
          {/* HÀNG 1: NÚT BẤM HÀNH ĐỘNG CHÍNH (Tạo Kèo, Nhận Kèo, Zalo ĐT) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            <button
              onClick={onOpenCreateModal}
              className="h-11 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Tạo Kèo</span>
            </button>
            <button
              onClick={() => {
                onSwitchTab("feed");
                onScrollToFeed?.();
              }}
              className="h-11 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Handshake className="w-4 h-4 stroke-[2.5]" />
              <span>Nhận Kèo</span>
            </button>
            <a
              href="https://zalo.me/0988765432"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 rounded-xl border border-[#d97706]/70 bg-[#78350f]/25 hover:bg-[#78350f]/45 text-[#f59e0b] font-black text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Zalo ĐT</span>
            </a>
          </div>

          {/* HÀNG 2: "NÚT BẤM" (Pills + Nút Giải Cứu Kèo Ngay) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400">Nút bấm</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenCreateModal}
                className="px-3.5 py-1.5 rounded-full border border-emerald-500/60 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs transition active:scale-95"
              >
                Tạo Kèo
              </button>
              <button
                onClick={() =>
                  onSelectDistrict(
                    selectedDistrict === "Nam Từ Liêm" ? "ALL" : "Nam Từ Liêm"
                  )
                }
                className={`px-3.5 py-1.5 rounded-full border font-bold text-xs transition active:scale-95 ${
                  selectedDistrict === "Nam Từ Liêm"
                    ? "border-teal-400 bg-teal-900/70 text-teal-200 ring-1 ring-teal-400"
                    : "border-teal-500/60 bg-teal-950/40 text-teal-300 hover:bg-teal-900/50"
                }`}
              >
                Nam Từ Liêm
              </button>
              <button
                onClick={() => onSwitchTab("sos")}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 active:scale-95 transition-all inline-flex items-center gap-1.5 animate-pulse ml-auto"
              >
                <span>Giải Cứu Kèo Ngay</span>
                <span>📣</span>
              </button>
            </div>
          </div>

          {/* HÀNG 3: "BỘ LỌC" (Cầu Giấy, Nam Từ Liêm, Mọi Giờ, Đánh giá kèo) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400">Bộ Lọc</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  onSelectDistrict(
                    selectedDistrict === "Cầu Giấy" ? "ALL" : "Cầu Giấy"
                  )
                }
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition active:scale-95 ${
                  selectedDistrict === "Cầu Giấy"
                    ? "border-sky-400 bg-sky-950 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.35)] ring-1 ring-sky-400"
                    : "border-sky-500/50 bg-sky-950/40 text-sky-300 hover:border-sky-400"
                }`}
              >
                Cầu Giấy
              </button>
              <button
                onClick={() =>
                  onSelectDistrict(
                    selectedDistrict === "Nam Từ Liêm" ? "ALL" : "Nam Từ Liêm"
                  )
                }
                className={`px-3.5 py-1.5 rounded-full border text-xs font-bold transition active:scale-95 ${
                  selectedDistrict === "Nam Từ Liêm"
                    ? "border-amber-400 bg-amber-950 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-400"
                    : "border-amber-500/50 bg-amber-950/40 text-amber-300 hover:border-amber-400"
                }`}
              >
                Nam Từ Liêm
              </button>
              <button
                onClick={() => {
                  onSelectDistrict("ALL");
                  onSelectTier("ALL");
                }}
                className="px-3.5 py-1.5 rounded-full border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-white font-bold text-xs transition"
              >
                Mọi Giờ
              </button>
              <button
                onClick={() => onSwitchTab("trust-profile")}
                className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md animate-amber-glow transition active:scale-95"
              >
                Đánh giá kèo
              </button>
            </div>
          </div>

          {/* HÀNG 4: "HUY HIỆU TIER" & "UY TÍN" */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400">Huy hiệu Tier</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onSelectTier(selectedTier === 1 ? "ALL" : 1)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs border transition active:scale-95 ${
                  selectedTier === 1
                    ? "bg-[#1d4ed8] text-white border-blue-300 shadow-md ring-2 ring-blue-400"
                    : "bg-[#1d4ed8]/85 text-white border-blue-400/40 hover:bg-[#1d4ed8]"
                }`}
              >
                Tier 1: Dưỡng sinh
              </button>
              <button
                onClick={() => onSelectTier(selectedTier === 2 ? "ALL" : 2)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs border transition active:scale-95 ${
                  selectedTier === 2
                    ? "bg-[#15803d] text-white border-emerald-300 shadow-md ring-2 ring-emerald-400"
                    : "bg-[#15803d]/85 text-white border-emerald-400/40 hover:bg-[#15803d]"
                }`}
              >
                Tier 2: Phong trào
              </button>
              <button
                onClick={() => onSelectTier(selectedTier === 3 ? "ALL" : 3)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs border transition active:scale-95 ${
                  selectedTier === 3
                    ? "bg-[#9a3412] text-white border-orange-300 shadow-md ring-2 ring-orange-400"
                    : "bg-[#9a3412]/85 text-white border-orange-500/40 hover:bg-[#9a3412]"
                }`}
              >
                Tier 3: Phủi chiến
              </button>
            </div>
            <div className="flex items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Uy tín bạc</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Sao uy tín</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                <span>Uy tín bạc</span>
              </span>
            </div>
          </div>

          {/* HÀNG 5: SOS BOX (NHẤP NHÁY ĐẬP ĐỎ) + LIVE HN + NÚT ĐÁNH DẪN */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Box SOS Cần Đối Gấp */}
            <div
              onClick={() => onSwitchTab("sos")}
              className="flex-1 rounded-2xl p-3 border border-rose-500/50 bg-[#350a0e] animate-natural-pulse cursor-pointer hover:scale-[1.01] transition-transform"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-current text-rose-400" />
                  <span>SOS CẦN ĐỐI GẤP</span>
                </span>
                {sosCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-bounce">
                    {sosCount} kèo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-rose-200/80 mt-1">
                Nhấp nháy đập đỏ dịu nhẹ tự nhiên
              </p>
            </div>

            {/* LIVE HN Beacon */}
            <div className="rounded-2xl p-2.5 px-3.5 border border-rose-500/40 bg-slate-950 flex items-center gap-2.5 shrink-0 justify-center">
              <span className="text-xs font-black text-rose-400 tracking-wider">
                LIVE HN
              </span>
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-1 bg-rose-500 rounded-full animate-wave-1" />
                <span className="w-1 bg-rose-500 rounded-full animate-wave-2" />
                <span className="w-1 bg-rose-500 rounded-full animate-wave-3" />
              </div>
            </div>

            {/* Nút Đánh dồn / Đánh dẫn */}
            <button
              onClick={() => onSwitchTab("trust-profile")}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shrink-0 active:scale-95 transition-all shadow-md shadow-amber-500/20"
            >
              Đánh dồn
            </button>
          </div>

          {/* HÀNG 6: LIVE WIDGETS (Bóng Lăn Sau, Thời Tiết, Mini Pitch 2D) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Countdown Clock */}
            <div className="sm:col-span-5 rounded-2xl bg-slate-950/90 border border-slate-800 p-2.5 flex flex-col justify-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Bóng lăn sau:
              </span>
              <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider tabular-nums">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>

            {/* Weather Radar Card */}
            <div className="sm:col-span-4 rounded-2xl bg-slate-950/90 border border-slate-800 p-2.5 flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 block leading-tight">
                  {selectedDistrict === "Nam Từ Liêm" ? "Nam Từ Liêm" : "Cầu Giấy"}
                </span>
                <span className="text-xs font-extrabold text-slate-100">
                  26°C • khô ráo
                </span>
              </div>
            </div>

            {/* Mini Tactical Pitch (Sa bàn 2D Thu Nhỏ) */}
            <div className="sm:col-span-3 rounded-2xl bg-slate-950/90 border border-slate-800 p-1.5 flex items-center justify-center">
              <svg
                viewBox="0 0 100 60"
                className="w-full h-10 stroke-slate-500 fill-none stroke-[1.2]"
              >
                {/* Outer Field */}
                <rect x="2" y="2" width="96" height="56" rx="3" />
                {/* Midfield Line */}
                <line x1="50" y1="2" x2="50" y2="58" />
                {/* Center Circle & Spot */}
                <circle cx="50" cy="30" r="10" />
                <circle cx="50" cy="30" r="1" className="fill-slate-400" />
                {/* Left Penalty Box */}
                <rect x="2" y="14" width="16" height="32" />
                {/* Right Penalty Box */}
                <rect x="82" y="14" width="16" height="32" />
                {/* Tactical Dots: 2 Đội bóng */}
                <circle cx="36" cy="30" r="2.5" className="fill-emerald-400 stroke-none" />
                <circle cx="64" cy="30" r="2.5" className="fill-rose-400 stroke-none" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
