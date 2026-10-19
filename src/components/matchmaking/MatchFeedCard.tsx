"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  UserX,
  Activity,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { maskPhoneNumber, getZaloDeepLink } from "@/lib/zalo";
import { SpotlightCard } from "@/components/reactbits/SpotlightCard";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { PhuiStamp } from "@/components/phui";
import {
  formatFullExpiryLabel,
  formatMatchDateDisplay,
  getMatchKickoffDate,
} from "@/lib/matchTime";

interface MatchFeedCardProps {
  match: MatchFeedItem;
  onSelectMatch: (match: MatchFeedItem) => void;
  onOpenBlindReview?: (teamName: string) => void;
  onOpenHandshake?: (match: MatchFeedItem) => void;
  isOwner?: boolean;
  onEditMatch?: (match: MatchFeedItem) => void;
  onDeleteMatch?: (matchId: string) => void;
  onCancelGuestChallenge?: (match: MatchFeedItem) => void;
  onOpenRespondCancel?: (match: MatchFeedItem) => void;
}

export function MatchFeedCard({
  match,
  onSelectMatch,
  onOpenBlindReview,
  onOpenHandshake,
  isOwner,
  onEditMatch,
  onDeleteMatch,
  onCancelGuestChallenge,
  onOpenRespondCancel,
}: MatchFeedCardProps) {
  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const isMatched = match.status === "MATCHED" || match.status === "PLAYING_VERIFIED";
  const isPlayingVerified = match.status === "PLAYING_VERIFIED";
  const isCancelRequested = match.status === "CANCEL_REQUESTED";
  const isDisputed = match.status === "DISPUTED";
  const host = match.hostTeam;
  const avgStar = (
    (host.ratingPunctual + host.ratingFairplay + host.ratingFinancial) /
    3
  ).toFixed(1);
  const hostZaloUrl = getZaloDeepLink(host.captainPhone, host.captainZalo);

  // ⏱️ Realtime Live Countdown Tracker: Cập nhật mỗi 5 giây
  const [liveNow, setLiveNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const kickoffDate = useMemo(() => {
    try {
      return getMatchKickoffDate({
        matchDate: match.matchDateIso || match.matchDate,
        matchDateIso: match.matchDateIso,
        startTime: match.startTime,
        kickoffTime: match.kickoffTime,
      });
    } catch {
      return new Date(Date.now() + 2 * 3600 * 1000);
    }
  }, [match]);

  const diffMs = kickoffDate.getTime() - liveNow;
  const diffMinutes = Math.round(diffMs / (60 * 1000));

  const liveStatusPill = useMemo(() => {
    if (match.status === "CANCELLED") {
      return {
        label: "Đã hủy trận đấu",
        className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        icon: "🛑",
      };
    }
    if (isCancelRequested) {
      return {
        label: "Chờ duyệt hủy kèo (Cần 2 bên đồng thuận)",
        className: "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse font-bold",
        icon: "⚠️",
      };
    }
    if (isDisputed) {
      return {
        label: "Đang tranh chấp • BQT can thiệp",
        className: "bg-rose-500/25 text-rose-300 border-rose-500/50 font-bold animate-pulse",
        icon: "⚖️",
      };
    }
    if (diffMinutes < -90) {
      return {
        label: "Đã kết thúc trận đấu",
        className: "bg-slate-800/80 text-slate-400 border-slate-700",
        icon: "🏁",
      };
    }
    if (diffMinutes <= 0 && diffMinutes >= -90) {
      return {
        label: `LIVE: Đang thi đấu (${Math.min(90, Math.abs(diffMinutes))}')`,
        className: "bg-emerald-500/25 text-emerald-300 border-emerald-500/50 font-black animate-pulse",
        icon: "⚽",
      };
    }
    if (diffMinutes <= 60) {
      return {
        label: `🚨 Còn ${diffMinutes} phút • Sắp lăn bóng!`,
        className: "bg-rose-500/20 text-rose-300 border-rose-500/40 font-black animate-pulse",
        icon: "🔥",
      };
    }
    if (diffMinutes <= 120) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      return {
        label: `⚠️ Còn ${h}h ${m}m • Sát giờ thi đấu`,
        className: "bg-orange-500/20 text-orange-300 border-orange-500/40 font-bold",
        icon: "⏳",
      };
    }
    if (diffMinutes <= 240) {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      return {
        label: `⚡ Còn ${h}h ${m}m • Khung giờ vàng`,
        className: "bg-amber-500/15 text-amber-300 border-amber-500/30 font-medium",
        icon: "⚡",
      };
    }
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    return {
      label: `⏳ Còn ${h}h ${m}m nữa bóng lăn`,
      className: "bg-slate-800/80 text-slate-300 border-slate-700",
      icon: "⏱️",
    };
  }, [diffMinutes, match.status, isCancelRequested, isDisputed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(24, 24, 27, 0.08)"
      className={`card-retro-paper rounded-2xl border p-4 transition-all flex flex-col justify-between relative overflow-hidden ${
        isMatched
          ? "border-stone-300/80 bg-[#f4f0e6] shadow-sm"
          : "border-stone-300 bg-[#fbf9f4] hover:border-stone-400 hover:-translate-y-0.5 shadow-md hover:shadow-lg"
      }`}
    >
      {/* Phủi Stamp Watermark for Trust & Match Status */}
      <div className="absolute top-2.5 right-12 pointer-events-none select-none z-10 hidden sm:block">
        {isPlayingVerified ? (
          <PhuiStamp variant="coc-200k" size="sm" angle={-8} />
        ) : isMatched ? (
          <PhuiStamp variant="da-ghep" size="sm" angle={6} />
        ) : host.credit.score >= 90 ? (
          <PhuiStamp variant="keo-uy-tin" size="sm" angle={-6} />
        ) : (
          <PhuiStamp variant="san-da-dat" size="sm" angle={-4} />
        )}
      </div>

      <div>
        {/* Warning Banner for Red-Flagged Team */}
        {host.credit.warningBadge === "TUNG_BUNG_KEO" && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-red-100 border border-red-300 flex items-center justify-between text-[11px]">
            <span className="text-red-800 font-bold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-red-600 shrink-0" />
              Nhãn cảnh báo: Từng bùng kèo sát giờ (&lt;1h)
            </span>
            <span className="text-red-900 font-black">Đã cọc 100%</span>
          </div>
        )}

        {/* Top Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0"
              style={{ backgroundColor: host.jerseyColor }}
            >
              {host.shortName.slice(0, 3).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-black text-sm text-stone-900 leading-tight">
                  {host.name}
                </h3>
                {isOwner && (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-400">
                    Kèo của bạn
                  </span>
                )}
                {host.totalMatches !== undefined && host.totalMatches < 3 ? (
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-400 inline-flex items-center gap-0.5"
                    title="Đội bóng mới gia nhập hệ thống (Dưới 3 trận)"
                  >
                    <span>🌱 Đội Mới ({host.totalMatches} trận)</span>
                  </span>
                ) : (
                  <span
                    className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 border border-stone-400 inline-flex items-center gap-0.5"
                    title="Đội bóng phong trào đã thi đấu xác thực"
                  >
                    <span>⭐ Đã Xác Thực ({host.totalMatches || 5} trận)</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5 text-[11px] font-black text-amber-700 tabular-nums">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {avgStar}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded border tabular-nums ${
                    host.credit.score >= 80
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-red-100 text-red-800 border-red-300"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  Uy tín: {host.credit.score}đ
                </span>
                <span className="text-[10px] text-stone-600 font-medium">
                  • ĐT: {host.captainName}
                </span>
                <span className="text-[10px] font-mono font-bold text-stone-800 bg-stone-200/80 px-1.5 py-0.5 rounded border border-stone-300">
                  Zalo: {isMatched ? host.captainPhone : maskPhoneNumber(host.captainPhone)}
                </span>
              </div>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-black border shadow-xs ${
              match.requiredTier === 1
                ? "bg-blue-800 text-white border-blue-900"
                : match.requiredTier === 2
                ? "bg-emerald-800 text-white border-emerald-900"
                : "bg-red-800 text-white border-red-900"
            }`}
          >
            {match.requiredTier === 1
              ? "Tier 1: Dưỡng sinh"
              : match.requiredTier === 2
              ? "Tier 2: Phong trào"
              : "Tier 3: Phủi chiến"}
          </span>
        </div>

        {/* Banner Yêu Cầu Xin Hủy Kèo 2 Bên */}
        {isCancelRequested && (
          <div className="mt-2.5 p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs bg-amber-950/40 border-amber-500/50">
            <div className="flex items-start sm:items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-amber-300">
                  {isOwner
                    ? `⏳ Đang chờ Đội khách (${match.guestTeam?.name || "đối tác"}) phản hồi xin hủy kèo`
                    : `⚠️ Chủ nhà (${host.name}) xin hủy trận: `}
                </span>
                {!isOwner && (
                  <span className="text-slate-300 italic text-[11px]">
                    "{match.cancelRequest?.reasonDetail || 'Sự cố đột xuất'}"
                  </span>
                )}
              </div>
            </div>
            {!isOwner && onOpenRespondCancel && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenRespondCancel(match);
                }}
                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 text-xs font-black shrink-0 shadow-md active:scale-95"
              >
                Phản Hồi Hủy Kèo
              </button>
            )}
          </div>
        )}

        {/* Pitch & Time Box */}
        <div className="mt-3 rounded-xl bg-[#ede8dc] border border-stone-300 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-900 font-bold flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">{match.pitchName}</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-200 text-stone-800 border border-stone-300 shrink-0">
              {match.district}
            </span>
          </div>

          {/* Địa chỉ & Nút Vị trí sân Google Maps (Chủ kèo ghim) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-stone-600">
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-100 hover:bg-sky-200 border border-sky-300 text-sky-800 font-bold text-[10px] transition shrink-0 self-start sm:self-auto shadow-2xs"
                title="Mở Google Maps dẫn đường đến sân bóng"
              >
                <Navigation className="w-2.5 h-2.5 text-sky-700" />
                <span>📍 Vị trí sân Google Maps {match.isGmapsIntegrated ? "(Chủ kèo ghim)" : ""}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
          </div>

          <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-300/70">
            <span className="text-amber-900 font-black flex items-center gap-1.5 tabular-nums">
              <Clock className="w-3.5 h-3.5 text-stone-700" />
              {match.startTime} - {match.endTime} •{" "}
              <span className="text-emerald-800 font-bold">
                {formatMatchDateDisplay(match.matchDateIso || match.matchDate)}
              </span>
            </span>
            <span className="text-stone-700 font-medium">
              Áo:{" "}
              <strong className="text-stone-900 font-bold">
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

          {/* Realtime Live Countdown Tracker */}
          <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-stone-300/70">
            <span className="text-stone-600 font-medium flex items-center gap-1.5">
              <span>{liveStatusPill.icon}</span>
              <span className="text-stone-700 font-semibold">Tiến độ trận:</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border flex items-center gap-1 tabular-nums ${liveStatusPill.className}`}>
              {liveStatusPill.label}
            </span>
          </div>

          {/* Thanh Tiến Trình Thời Gian Thực (Live Time Progress Bar) */}
          {diffMinutes > 0 && diffMinutes <= 360 && (
            <div className="w-full bg-stone-300 rounded-full h-1 overflow-hidden mt-0.5">
              <div
                className={`h-full transition-all duration-1000 ${
                  diffMinutes <= 60
                    ? 'bg-red-600'
                    : diffMinutes <= 120
                    ? 'bg-amber-600'
                    : 'bg-emerald-600'
                }`}
                style={{
                  width: `${Math.max(5, Math.min(100, Math.round(((360 - diffMinutes) / 360) * 100)))}%`,
                }}
              />
            </div>
          )}

          {/* Hạn tự động dọn dẹp bài đăng nếu chưa có đối (Đúng ngày + giờ bóng lăn + 15p) */}
          {!isMatched && (
            <div className="flex items-center justify-between text-[10.5px] text-stone-600 pt-1.5 border-t border-stone-300/50">
              <span className="flex items-center gap-1 text-emerald-800 font-medium">
                <span>🧹 Tự đóng sau 15p bóng lăn</span>
              </span>
              <span className="font-mono text-stone-600 text-[10px]">
                (Đóng lúc:{" "}
                <strong className="text-amber-900 font-bold">
                  {formatFullExpiryLabel(
                    match.startTime,
                    match.matchDateIso || match.matchDate,
                    15
                  )}
                </strong>
                )
              </span>
            </div>
          )}
        </div>

        {match.notes && (
          <p className="text-[11px] text-stone-600 italic mt-2.5 line-clamp-2">
            “{match.notes}”
          </p>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-stone-200">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-stone-900 px-2 py-0.5 rounded-lg bg-stone-200 border border-stone-300">
              Chia {match.splitRatioLabel || "50/50"}
            </span>
            <span className="text-xs font-bold text-stone-800 tabular-nums">
              Sân: {match.totalCostVnd.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                host.credit.score < 70
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {host.credit.score < 70 ? "Ký quỹ 200k" : "Miễn cọc 100%"}
            </span>
          </div>
        </div>

        {isPlayingVerified ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Đã Bắt Tay &amp; Hoàn Cọc</span>
            </span>
            {isOwner && onDeleteMatch && (
              <button
                onClick={() => {
                  if (window.confirm("Bạn có chắc chắn muốn xóa kèo đã hoàn thành này khỏi danh sách?")) {
                    onDeleteMatch(match.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-red-300 bg-red-100 hover:bg-red-200 text-red-700 transition active:scale-95"
                title="Xóa kèo"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </button>
            )}
            {onOpenBlindReview && (
              <button
                onClick={() => onOpenBlindReview(host.name)}
                className="ticket-stub px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-black transition shadow-xs active:scale-95"
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
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition shadow-2xs active:scale-95"
                title="Chỉnh sửa thông tin kèo"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span>Sửa</span>
              </button>
            )}
            {onOpenHandshake && (
              <button
                onClick={() => onOpenHandshake(match)}
                className="ticket-stub inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black transition shadow-xs active:scale-95"
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
                className="ticket-stub inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-amber-400 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black transition shadow-2xs active:scale-95"
                title="Nhắn Zalo trực tiếp cho Đội trưởng chủ sân"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                <span>Zalo ĐT</span>
              </a>
            )}
            {!isOwner && onCancelGuestChallenge && (
              <button
                onClick={() => onCancelGuestChallenge(match)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-300 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black transition active:scale-95 shadow-2xs"
                title="Rút lui / Hủy không nhận kèo này nữa (vì lý do đột xuất)"
              >
                <UserX className="w-3.5 h-3.5 text-red-600" />
                <span>Rút Lui</span>
              </button>
            )}
            {isOwner && onDeleteMatch && (
              <button
                onClick={() => onDeleteMatch(match.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-300 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black transition active:scale-95"
                title="Hủy kèo & Gửi kháng cáo bất khả kháng"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Hủy Kèo</span>
              </button>
            )}
            {onOpenBlindReview && (
              <button
                onClick={() => onOpenBlindReview(host.name)}
                className="ticket-stub px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 text-xs font-black transition shadow-xs active:scale-95"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black transition shadow-2xs active:scale-95"
                title="Chỉnh sửa kèo đấu của bạn"
              >
                <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                <span>Sửa Kèo</span>
              </button>
            )}
            {onDeleteMatch && (
              <button
                onClick={() => onDeleteMatch(match.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-300 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-black transition shadow-2xs active:scale-95"
                title="Hủy / Xóa kèo này (Kèm hộp kháng cáo nếu sát giờ)"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span>Hủy / Xóa Kèo</span>
              </button>
            )}
          </div>
        ) : (
          <ClickSpark sparkColor={["#f97316", "#fbbf24", "#ef4444"]} sparkCount={8}>
            <Button
              onClick={() => onSelectMatch(match)}
              className="ticket-stub h-9 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs gap-1.5 shadow-md shadow-orange-900/20 active:scale-95 transition-all"
            >
              <Handshake className="w-4 h-4 stroke-[2.5]" />
              <span>Nhận Kèo</span>
            </Button>
          </ClickSpark>
        )}
      </div>
    </SpotlightCard>
  );
}
