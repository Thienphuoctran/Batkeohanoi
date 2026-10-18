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
  Edit3,
  Trash2,
  Navigation,
  ExternalLink,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { maskPhoneNumber, getZaloDeepLink } from "@/lib/zalo";

interface MatchFeedCardProps {
  match: MatchFeedItem;
  onSelectMatch: (match: MatchFeedItem) => void;
  onOpenBlindReview?: (teamName: string) => void;
  onOpenHandshake?: (match: MatchFeedItem) => void;
  isOwner?: boolean;
  onEditMatch?: (match: MatchFeedItem) => void;
  onDeleteMatch?: (matchId: string) => void;
}

export function MatchFeedCard({
  match,
  onSelectMatch,
  onOpenBlindReview,
  onOpenHandshake,
  isOwner,
  onEditMatch,
  onDeleteMatch,
}: MatchFeedCardProps) {
  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const isMatched = match.status === "MATCHED" || match.status === "PLAYING_VERIFIED";
  const isPlayingVerified = match.status === "PLAYING_VERIFIED";
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
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm text-white leading-tight">
                  {host.name}
                </h3>
                {isOwner && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Kèo của bạn
                  </span>
                )}
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
            className={`px-3 py-1 rounded-full text-[10px] font-black border shadow-sm ${
              match.requiredTier === 1
                ? "bg-[#1d4ed8] text-white border-blue-400/50"
                : match.requiredTier === 2
                ? "bg-[#15803d] text-white border-emerald-400/50"
                : "bg-[#9a3412] text-white border-orange-400/50"
            }`}
          >
            {match.requiredTier === 1
              ? "Tier 1: Dưỡng sinh"
              : match.requiredTier === 2
              ? "Tier 2: Phong trào"
              : "Tier 3: Phủi chiến"}
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

          {/* Địa chỉ & Nút Vị trí sân Google Maps (Chủ kèo ghim) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400">
            <span className="truncate">{match.pitchAddress || `Khu vực ${match.district}`}</span>

            {(match.gmapsUrl || match.isGmapsIntegrated || match.pitchName) && (
              <a
                href={
                  match.gmapsUrl ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${match.pitchName} ${match.pitchAddress || match.district} Hà Nội`
                  )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-bold text-[10px] transition shrink-0 self-start sm:self-auto shadow-sm"
                title="Mở Google Maps dẫn đường đến sân bóng"
              >
                <Navigation className="w-2.5 h-2.5 text-sky-400" />
                <span>📍 Vị trí sân Google Maps {match.isGmapsIntegrated ? "(Chủ kèo ghim)" : ""}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
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
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-emerald-300 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
              Chia {match.splitRatioLabel || "50/50"}
            </span>
            <span className="text-xs font-bold text-slate-300 tabular-nums">
              Sân: {match.totalCostVnd.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                host.credit.score < 70
                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                  : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              }`}
            >
              {host.credit.score < 70 ? "Ký quỹ 200k" : "Miễn cọc 100%"}
            </span>
          </div>
        </div>

        {isPlayingVerified ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã Bắt Tay &amp; Hoàn Cọc</span>
            </span>
            {isOwner && onDeleteMatch && (
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn xóa kèo đã hoàn thành này khỏi danh sách?")) {
                    onDeleteMatch(match.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition active:scale-95"
                title="Xóa kèo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
            {onOpenBlindReview && (
              <button
                onClick={() => onOpenBlindReview(host.name)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-slate-950 text-xs font-black transition shadow-sm active:scale-95"
              >
                ★ Đánh giá
              </button>
            )}
          </div>
        ) : isMatched ? (
          <div className="flex items-center gap-1.5">
            {isOwner && onEditMatch && (
              <button
                onClick={() => onEditMatch(match)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition shadow-sm active:scale-95"
                title="Chỉnh sửa thông tin kèo"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Sửa</span>
              </button>
            )}
            {onOpenHandshake && (
              <button
                onClick={() => onOpenHandshake(match)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition shadow-md shadow-emerald-500/20 active:scale-95"
                title="Nhập mã bắt tay 4 số tại sân để xác thực thi đấu & giải phóng cọc 200k"
              >
                <Handshake className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Mã Bắt Tay</span>
              </button>
            )}
            {!isOwner && (
              <a
                href={hostZaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#d97706]/70 bg-[#78350f]/25 hover:bg-[#78350f]/45 text-[#f59e0b] text-xs font-black transition shadow-md shadow-amber-900/20 active:scale-95"
                title="Nhắn Zalo trực tiếp cho Đội trưởng chủ sân"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Zalo ĐT</span>
              </a>
            )}
            {isOwner && onDeleteMatch && (
              <button
                onClick={() => {
                  if (window.confirm("Kèo này đã có đối thủ nhận. Bạn có chắc chắn muốn hủy và xóa kèo?")) {
                    onDeleteMatch(match.id);
                  }
                }}
                className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition active:scale-95"
                title="Xóa kèo"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              </button>
            )}
            {onOpenBlindReview && (
              <button
                onClick={() => onOpenBlindReview(host.name)}
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 text-slate-950 text-xs font-black transition shadow-md shadow-amber-500/20 active:scale-95"
              >
                ★ Đánh giá
              </button>
            )}
          </div>
        ) : isOwner ? (
          <div className="flex items-center gap-2">
            {onEditMatch && (
              <button
                onClick={() => onEditMatch(match)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-black transition shadow-sm active:scale-95"
                title="Chỉnh sửa kèo đấu của bạn"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Sửa Kèo</span>
              </button>
            )}
            {onDeleteMatch && (
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn xóa kèo này không? Kèo sẽ được gỡ khỏi bảng tin.")) {
                    onDeleteMatch(match.id);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-black transition shadow-sm active:scale-95"
                title="Xóa kèo này khỏi bảng tin"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Xóa Kèo</span>
              </button>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onSelectMatch(match)}
            className="h-9 px-4 rounded-xl bg-[#2dd4bf] hover:bg-[#14b8a6] text-slate-950 font-black text-xs gap-1.5 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
          >
            <Handshake className="w-4 h-4 stroke-[2.5]" />
            <span>Nhận Kèo</span>
          </Button>
        )}
      </div>
    </div>
  );
}
