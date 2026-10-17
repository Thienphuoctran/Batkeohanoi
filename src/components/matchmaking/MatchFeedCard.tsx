"use client";

import React from "react";
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertOctagon,
  Star,
  Handshake,
  Lock,
  MessageSquare,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { maskPhoneNumber, getZaloDeepLink } from "@/lib/zalo";

interface MatchFeedCardProps {
  match: MatchFeedItem;
  onSelectMatch: (match: MatchFeedItem) => void;
  onOpenBlindReview?: (teamName: string) => void;
}

export function MatchFeedCard({
  match,
  onSelectMatch,
  onOpenBlindReview,
}: MatchFeedCardProps) {
  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const isMatched = match.status === "MATCHED";
  const host = match.hostTeam;
  const avgStar = (
    (host.ratingPunctual + host.ratingFairplay + host.ratingFinancial) /
    3
  ).toFixed(1);
  const hostZaloUrl = getZaloDeepLink(host.captainPhone, host.captainZalo);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`spotlight-card rounded-2xl border p-4 transition-all flex flex-col justify-between ${
        isMatched
          ? "border-emerald-500/25 bg-slate-900/60"
          : "border-white/[0.09] hover:border-emerald-500/45 hover:-translate-y-0.5"
      }`}
    >
      <div>
        {/* Warning Banner for Red-Flagged Team */}
        {host.credit.warningBadge === "TUNG_BUNG_KEO" && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-between text-[11px]">
            <span className="text-rose-300 font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              Nhãn cảnh báo: Từng bùng kèo sát giờ (&lt;1h)
            </span>
            <span className="text-rose-400 font-extrabold">Đã cọc 100%</span>
          </div>
        )}

        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0"
              style={{ backgroundColor: host.jerseyColor }}
            >
              {host.shortName.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white leading-tight">
                  {host.name}
                </h3>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-400 tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {avgStar}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border tabular-nums ${
                    host.credit.score >= 80
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Uy tín: {host.credit.score}đ
                </span>
                <span className="text-[10px] text-slate-400">
                  • ĐT: {host.captainName}
                </span>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                  Zalo: {isMatched ? host.captainPhone : maskPhoneNumber(host.captainPhone)}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold ${tierInfo.badgeColor}`}
          >
            Tier {match.requiredTier} • {tierInfo.name.split(" ")[0]}{" "}
            {tierInfo.name.split(" ")[1]}
          </span>
        </div>

        {/* Pitch & Time Box */}
        <div className="mt-3 rounded-xl bg-slate-950/75 border border-white/[0.06] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{match.pitchName}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
              {match.district}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
            <span className="text-amber-300 font-bold flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5" />
              {match.startTime} - {match.endTime} ({match.matchDate})
            </span>
            <span className="text-slate-300 font-medium">
              Áo:{" "}
              <strong className="text-white">
                {host.jerseyColor === "#0284c7"
                  ? "Xanh Dương"
                  : host.jerseyColor === "#16a34a"
                  ? "Xanh Lá"
                  : host.jerseyColor === "#ea580c"
                  ? "Cam"
                  : "Đỏ"}
              </strong>
            </span>
          </div>
        </div>

        {match.notes && (
          <p className="text-[11px] text-slate-400 italic mt-2.5 line-clamp-2">
            “{match.notes}”
          </p>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-white/[0.06]">
        <div>
          <span className="text-[10px] text-slate-400 block">
            Tiền sân chia đôi (50/50)
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-emerald-400 tabular-nums">
              {match.shareCostVnd.toLocaleString("vi-VN")}đ
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                host.credit.score < 70
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-slate-800 text-slate-300"
              }`}
            >
              {host.credit.score < 70 ? "Cọc 200k BQT" : "Miễn cọc tiền mặt"}
            </span>
          </div>
        </div>

        {isMatched ? (
          <div className="flex items-center gap-1.5">
            <a
              href={hostZaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white text-[11px] font-bold transition shadow-md shadow-blue-600/20"
              title="Nhắn Zalo trực tiếp cho Đội trưởng chủ sân"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Zalo ĐT</span>
            </a>
            {onOpenBlindReview && (
              <button
                onClick={() => onOpenBlindReview(host.name)}
                className="px-2.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition"
              >
                ★ Đánh giá mù
              </button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onSelectMatch(match)}
            className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-1.5 shadow-md shadow-emerald-500/15 active:scale-95 transition"
          >
            <Handshake className="w-3.5 h-3.5 stroke-[2.3]" />
            <span>Nhận Kèo</span>
          </Button>
        )}
      </div>
    </div>
  );
}
