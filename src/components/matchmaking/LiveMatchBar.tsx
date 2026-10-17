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

interface LiveMatchBarProps {
  onOpenCreateModal: () => void;
  onSwitchTab: (tab: ActiveTab) => void;
  sosCount: number;
  openMatchCount: number;
  selectedDistrict: "ALL" | District;
}

export function LiveMatchBar({
  onOpenCreateModal,
  onSwitchTab,
  sosCount,
  openMatchCount,
  selectedDistrict,
}: LiveMatchBarProps) {
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
    <div className="surface-card rounded-2xl border border-white/[0.1] p-3 sm:p-3.5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
      {/* KHỐI TRÁI: LIVE HN + ĐỒNG HỒ ĐẾM NGƯỢC + THỜI TIẾT */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* LIVE HN Beacon */}
        <div className="rounded-xl px-2.5 py-1.5 border border-rose-500/40 bg-rose-950/40 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-[11px] font-black text-rose-400 tracking-wider">
            LIVE HN
          </span>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 bg-rose-500 rounded-full animate-wave-1" />
            <span className="w-0.5 bg-rose-500 rounded-full animate-wave-2" />
            <span className="w-0.5 bg-rose-500 rounded-full animate-wave-3" />
          </div>
        </div>

        {/* Đồng hồ đếm ngược Bóng lăn sau */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800 px-3 py-1.5 flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Bóng lăn sau:
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-300 font-mono tracking-wider tabular-nums">
            {formatCountdown(countdownSeconds)}
          </span>
        </div>

        {/* Thời tiết Sân */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800 px-3 py-1.5 flex items-center gap-2 shrink-0">
          <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200">
            {selectedDistrict === "Nam Từ Liêm" ? "Nam Từ Liêm" : "Cầu Giấy"}:{" "}
            <strong className="text-emerald-400">26°C</strong> • khô ráo TF
          </span>
        </div>

        {/* Mini Tactical Pitch 2D Wireframe */}
        <div className="hidden xl:flex items-center rounded-xl bg-slate-950/90 border border-slate-800 p-1 w-20 h-7 shrink-0">
          <svg
            viewBox="0 0 100 60"
            className="w-full h-full stroke-slate-500 fill-none stroke-[1.5]"
          >
            <rect x="2" y="2" width="96" height="56" rx="3" />
            <line x1="50" y1="2" x2="50" y2="58" />
            <circle cx="50" cy="30" r="10" />
            <rect x="2" y="14" width="16" height="32" />
            <rect x="82" y="14" width="16" height="32" />
            <circle cx="36" cy="30" r="3" className="fill-emerald-400 stroke-none" />
            <circle cx="64" cy="30" r="3" className="fill-rose-400 stroke-none" />
          </svg>
        </div>
      </div>

      {/* KHỐI PHẢI: NÚT GIẢI CỨU KÈO 📣 + ĐÁNH GIÁ KÈO + TẠO KÈO */}
      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
        {/* Nút Giải Cứu Kèo Ngay 📣 */}
        <button
          onClick={() => onSwitchTab("sos")}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-red-600/25 active:scale-95 transition-all inline-flex items-center gap-1.5 animate-pulse"
        >
          <span>Giải Cứu Kèo Ngay</span>
          <span>📣</span>
          {sosCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white text-red-600 font-black">
              {sosCount}
            </span>
          )}
        </button>

        {/* Nút Đánh giá kèo (Vàng dạ quang) */}
        <button
          onClick={() => onSwitchTab("trust-profile")}
          className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md animate-amber-glow transition active:scale-95"
        >
          Đánh giá kèo
        </button>

        {/* Nút Tạo Kèo (Xanh cỏ neon) */}
        <button
          onClick={onOpenCreateModal}
          className="h-9 px-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Tạo Kèo</span>
        </button>
      </div>
    </div>
  );
}
