"use client";

import React from "react";
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
import { ClickSpark } from "@/components/reactbits/ClickSpark";

interface LiveMatchBarProps {
  onOpenCreateModal: () => void;
  onSwitchTab: (tab: ActiveTab) => void;
  sosCount: number;
  openMatchCount: number;
  selectedDistrict: "ALL" | District;
  onSimulateExpiredCleanup?: () => void;
  isSimulatingCleanup?: boolean;
}

export function LiveMatchBar({
  onOpenCreateModal,
  onSwitchTab,
  sosCount,
  openMatchCount,
  selectedDistrict,
  onSimulateExpiredCleanup,
  isSimulatingCleanup = false,
}: LiveMatchBarProps) {
  return (
    <div className="card-retro-paper rounded-2xl border border-stone-300/90 p-3 sm:p-3.5 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
      {/* KHỐI TRÁI: LIVE HN + THỜI TIẾT SÂN + MINI PITCH */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* LIVE HN Beacon */}
        <div className="rounded-xl px-2.5 py-1.5 border border-red-300 bg-red-100/80 flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span className="text-[11px] font-black text-red-700 tracking-wider">
            LIVE HN
          </span>
          <div className="flex items-center gap-0.5 h-3">
            <span className="w-0.5 bg-red-600 rounded-full animate-wave-1" />
            <span className="w-0.5 bg-red-600 rounded-full animate-wave-2" />
            <span className="w-0.5 bg-red-600 rounded-full animate-wave-3" />
          </div>
        </div>

        {/* Thời tiết Sân */}
        <div className="rounded-xl bg-[#ede8dc] border border-stone-300 px-3 py-1.5 flex items-center gap-2 shrink-0">
          <CloudSun className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-stone-800">
            {selectedDistrict === "ALL" ? "Hà Nội" : selectedDistrict}:{" "}
            <strong className="text-emerald-700 font-black">26°C</strong> • cỏ khô ráo TF
          </span>
        </div>

        {/* Mini Tactical Pitch 2D Wireframe */}
        <div className="hidden xl:flex items-center rounded-xl bg-emerald-950/10 border border-emerald-600/30 p-1 w-20 h-7 shrink-0">
          <svg
            viewBox="0 0 100 60"
            className="w-full h-full stroke-emerald-700 fill-none stroke-[1.5]"
          >
            <rect x="2" y="2" width="96" height="56" rx="3" />
            <line x1="50" y1="2" x2="50" y2="58" />
            <circle cx="50" cy="30" r="10" />
            <rect x="2" y="14" width="16" height="32" />
            <rect x="82" y="14" width="16" height="32" />
            <circle cx="36" cy="30" r="3" className="fill-emerald-600 stroke-none" />
            <circle cx="64" cy="30" r="3" className="fill-red-600 stroke-none" />
          </svg>
        </div>
      </div>

      {/* KHỐI PHẢI: NÚT GIẢI CỨU KÈO 📣 + ĐÁNH GIÁ KÈO + TẠO KÈO (TICKET STUB VINTAGE) */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-between sm:justify-end">
        {/* Nút Giải Cứu Kèo Ngay 📣 */}
        <ClickSpark sparkColor={["#ef4444", "#f97316", "#fbbf24"]} sparkCount={8}>
          <button
            onClick={() => onSwitchTab("sos")}
            className="ticket-stub flex-1 sm:flex-initial h-9 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-red-900/20 active:scale-95 transition-all inline-flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap"
          >
            <span className="sm:hidden">Cứu Kèo 📣</span>
            <span className="hidden sm:inline">Giải Cứu Kèo Ngay 📣</span>
            {sosCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white text-red-600 font-black">
                {sosCount}
              </span>
            )}
          </button>
        </ClickSpark>

        {/* Nút Đánh giá kèo (Vàng cuống vé vintage) */}
        <button
          onClick={() => onSwitchTab("trust-profile")}
          className="ticket-stub flex-1 sm:flex-initial h-9 px-3 sm:px-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs shadow-sm transition active:scale-95 whitespace-nowrap text-center"
        >
          Đánh giá
        </button>

        {/* Nút Test Mô Phỏng 1-Chạm Xóa Kèo Quá 15 Phút */}
        {onSimulateExpiredCleanup && (
          <button
            type="button"
            onClick={onSimulateExpiredCleanup}
            disabled={isSimulatingCleanup}
            className={`hidden sm:flex h-9 px-2.5 rounded-xl border text-[11px] font-bold transition items-center gap-1.5 shadow-sm active:scale-95 ${
              isSimulatingCleanup
                ? "bg-amber-100 text-amber-900 border-amber-400 animate-pulse"
                : "bg-stone-100 text-stone-700 border-stone-300 hover:border-stone-400 hover:bg-stone-200"
            }`}
            title="Mô phỏng 1-chạm: Tạo bài đăng ca đá và đồng hồ đếm ngược 5s để tự động dọn dẹp khỏi bảng tin"
          >
            <span>🧹</span>
            <span className="hidden lg:inline">{isSimulatingCleanup ? "Đang đếm 5s..." : "Test Xóa Kèo 15p"}</span>
          </button>
        )}

        {/* Nút Tạo Kèo (Cam Lửa Ticket Stub) */}
        <ClickSpark sparkColor={["#f97316", "#fbbf24", "#38bdf8", "#ffffff"]} sparkCount={10}>
          <button
            onClick={onOpenCreateModal}
            className="ticket-stub flex-1 sm:flex-initial h-9 px-3 sm:px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-md shadow-orange-900/20 active:scale-95 transition-all flex items-center justify-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Tạo Kèo</span>
          </button>
        </ClickSpark>
      </div>
    </div>
  );
}
