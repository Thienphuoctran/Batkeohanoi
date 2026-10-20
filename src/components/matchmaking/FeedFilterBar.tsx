"use client";

import React from "react";
import { Search, Clock, MapPin, Shield } from "lucide-react";
import { District, SkillTier } from "@/types/matchmaking";

interface FeedFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTimeSlot: string;
  onTimeSlotChange: (value: string) => void;
  selectedDistrict: "ALL" | District;
  onDistrictChange: (district: "ALL" | District) => void;
  selectedTier: "ALL" | SkillTier;
  onTierChange: (tier: "ALL" | SkillTier) => void;
}

const DISTRICT_LIST: ("ALL" | District)[] = [
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

export const FeedFilterBar: React.FC<FeedFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedTimeSlot,
  onTimeSlotChange,
  selectedDistrict,
  onDistrictChange,
  selectedTier,
  onTierChange,
}) => {
  return (
    <section
      id="matches-feed-anchor"
      className="card-retro-paper rounded-2xl border border-stone-300/90 p-3.5 sm:p-4 space-y-3 shadow-paper"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-600 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên sân (Thành Phát, Mễ Trì, Đình Thôn...), tên FC, đội trưởng..."
            className="w-full h-9.5 pl-9 pr-3 rounded-xl bg-[#f5f0e4] border border-stone-300 text-xs text-stone-900 placeholder-stone-500 font-medium focus:outline-none focus:ring-2 focus:ring-stone-400/30 focus:border-stone-600 transition shadow-2xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0 hidden sm:inline" />
          <select
            value={selectedTimeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            aria-label="Lọc theo khung giờ"
            className="h-9.5 px-3 rounded-xl bg-[#f5f0e4] border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400/30 focus:border-stone-600 cursor-pointer transition shadow-2xs"
          >
            <option value="ALL">⏰ Mọi khung giờ</option>
            <option value="17:30">Ca 17:30</option>
            <option value="19:00">Ca 19:00</option>
            <option value="19:30">Ca 19:30</option>
            <option value="20:30">Ca 20:30</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-2.5 border-t border-stone-200/90">
        {/* Khu vực Toàn Hà Nội (Pill Buttons - Emil Kowalski Spring) */}
        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0 scroll-smooth">
          <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-1 shrink-0 select-none">
            <MapPin className="w-3 h-3 text-red-600" />
            Khu vực:
          </span>
          {DISTRICT_LIST.map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => onDistrictChange(dist)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all duration-160 ease-spring active:scale-95 shrink-0 whitespace-nowrap ${
                selectedDistrict === dist
                  ? "bg-stone-900 text-white font-black border border-stone-900 shadow-paper"
                  : "bg-[#ede8dc] text-stone-800 hover:text-stone-900 hover:bg-stone-200/90 border border-stone-300/80 shadow-2xs"
              }`}
            >
              {dist === "ALL" ? "Tất cả Hà Nội" : dist}
            </button>
          ))}
        </div>

        {/* 3 Tier (Pill Buttons - Emil Kowalski Spring) */}
        <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0 scroll-smooth">
          <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-1 shrink-0 select-none">
            <Shield className="w-3 h-3 text-amber-700" />
            Tier:
          </span>
          <button
            type="button"
            onClick={() => onTierChange("ALL")}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-160 ease-spring active:scale-95 shrink-0 whitespace-nowrap ${
              selectedTier === "ALL"
                ? "bg-stone-900 text-white font-black shadow-paper border border-stone-900"
                : "bg-[#ede8dc] text-stone-800 hover:text-stone-900 hover:bg-stone-200/90 border border-stone-300/80 shadow-2xs"
            }`}
          >
            Mọi Tier
          </button>
          {([1, 2, 3] as SkillTier[]).map((t) => {
            const active = selectedTier === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTierChange(t)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all duration-160 ease-spring active:scale-95 shrink-0 ${
                  active
                    ? t === 1
                      ? "bg-blue-800 text-white border-blue-900 shadow-paper"
                      : t === 2
                      ? "bg-emerald-800 text-white border-emerald-900 shadow-paper"
                      : "bg-red-800 text-white border-red-900 shadow-paper"
                    : "bg-[#ede8dc] border-stone-300/80 text-stone-800 hover:text-stone-900 hover:bg-stone-200/90 shadow-2xs"
                }`}
              >
                {t === 1
                  ? "Tier 1: Dưỡng sinh"
                  : t === 2
                  ? "Tier 2: Phong trào"
                  : "Tier 3: Phủi chiến"}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
