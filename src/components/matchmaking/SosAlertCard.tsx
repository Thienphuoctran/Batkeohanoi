"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  MapPin,
  Clock,
  ShieldCheck,
  Gift,
  Handshake,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { LaserGlowCard } from "@/components/reactbits/LaserGlowCard";
import { PhuiStamp } from "@/components/phui";

interface SosAlertCardProps {
  match: MatchFeedItem;
  onSelectMatch: (match: MatchFeedItem) => void;
}

export function SosAlertCard({ match, onSelectMatch }: SosAlertCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(
    match.sosCountdownSeconds || 3240
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
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

  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const shareCost = match.shareCostVnd;

  return (
    <LaserGlowCard glowColor="red" speed={3.5} className="w-full relative overflow-hidden">
      {/* Top Urgent Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-500/25">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-black tracking-wide uppercase shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
            SOS CẦN ĐỐI GẤP
          </span>
          <PhuiStamp variant="sos-khan-cap" size="sm" angle={-6} className="hidden sm:inline-flex" />
          <span className="text-xs font-semibold text-rose-200/90">
            {match.cancellationReason || "Đối thủ hủy sát giờ (< 1 tiếng)"}
          </span>
        </div>

        {/* Live Countdown Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-rose-500/40 text-xs">
          <Clock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="text-slate-400 text-[11px]">Bóng lăn sau:</span>
          <span className="font-mono font-black text-rose-400 tabular-nums text-xs">
            {formatCountdown(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-3.5 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-sm text-white">
              {match.hostTeam.name}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/[0.08] text-white text-[10px] font-bold">
              {match.district}
            </span>
            <span
              className={`px-2 py-0.5 rounded border text-[10px] font-bold ${tierInfo.badgeColor}`}
            >
              Tier {match.requiredTier} • {tierInfo.name}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Uy tín: {match.hostTeam.credit.score}đ (+8đ thưởng cứu hộ)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {match.pitchName}
            </span>
            <span className="text-amber-300 font-extrabold tabular-nums">
              ⏰ {match.startTime} - {match.endTime} ({match.matchDate})
            </span>
          </div>

          {/* Rescue Benefit Box */}
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-2 flex items-center gap-2 text-xs text-rose-200 font-semibold">
            <Gift className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Quyền lợi cứu hộ: Thưởng ngay +8 điểm uy tín tín nhiệm &amp; hỗ trợ cộng đồng phủi!
            </span>
          </div>
        </div>

        {/* Right: Cost & Action */}
        <div className="md:col-span-4 flex sm:flex-row md:flex-col items-center sm:justify-between md:items-end justify-between gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-rose-500/20">
          <div className="text-left md:text-right">
            <div className="text-[10px] text-slate-400">
              Tiền sân chia sẻ (50/50):
            </div>
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                {shareCost.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <ClickSpark
            sparkColor={["#ef4444", "#f97316", "#fbbf24", "#ffffff"]}
            sparkCount={10}
            className="w-full sm:w-auto md:w-full"
          >
            <Button
              onClick={() => onSelectMatch(match)}
              className="w-full h-10 px-5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:brightness-110 text-white font-black text-xs tracking-wide shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <span>Giải Cứu Kèo Ngay</span>
              <span>📣</span>
            </Button>
          </ClickSpark>
        </div>
      </div>
    </LaserGlowCard>
  );
}
