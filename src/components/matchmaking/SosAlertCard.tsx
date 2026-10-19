"use client";

import React from "react";
import {
  Flame,
  MapPin,
  Clock,
  ShieldCheck,
  Handshake,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { ClickSpark } from "@/components/reactbits/ClickSpark";
import { LaserGlowCard } from "@/components/reactbits/LaserGlowCard";
import { PhuiStamp } from "@/components/phui";
import { formatMatchDateDisplay, formatFullExpiryLabel } from "@/lib/matchTime";

interface SosAlertCardProps {
  match: MatchFeedItem;
  onSelectMatch: (match: MatchFeedItem) => void;
  isOwner?: boolean;
  onEditMatch?: (match: MatchFeedItem) => void;
  onDeleteMatch?: (matchId: string) => void;
}

export function SosAlertCard({
  match,
  onSelectMatch,
  isOwner = false,
  onEditMatch,
  onDeleteMatch,
}: SosAlertCardProps) {
  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const shareCost = match.shareCostVnd;

  return (
    <LaserGlowCard glowColor="red" speed={3.5} className="w-full relative overflow-hidden">
      {/* Top Urgent Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-rose-500/25">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-black tracking-wide uppercase shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-current animate-bounce" />
            SOS CẦN ĐỐI GẤP
          </span>
          <PhuiStamp variant="sos-khan-cap" size="sm" angle={-5} className="hidden sm:inline-flex" />
          <span className="text-xs font-semibold text-rose-200/90">
            {match.cancellationReason || "Cần tìm đối thay thế khẩn cấp trước giờ bóng lăn"}
          </span>
        </div>

        {/* Trạng thái Kèo của bạn hoặc Nhãn Khẩn Cấp (Đã gỡ bỏ đồng hồ đếm ngược theo yêu cầu) */}
        {isOwner ? (
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
            ★ KÈO SOS CỦA BẠN
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold tracking-wider">
            ⚡ KHẨN CẤP
          </span>
        )}
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
            <span className="text-amber-300 font-extrabold tabular-nums flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {match.startTime} - {match.endTime} •{" "}
              <span className="text-emerald-300">
                {formatMatchDateDisplay(match.matchDateIso || match.matchDate)}
              </span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              (🧹 Tự đóng:{" "}
              <strong className="text-amber-300">
                {formatFullExpiryLabel(
                  match.startTime,
                  match.matchDateIso || match.matchDate,
                  15
                )}
              </strong>
              )
            </span>
          </div>

          {/* Rescue Policy Box - Sòng phẳng 100%, bảo chứng an toàn */}
          <div className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-2 flex items-center gap-2 text-xs text-rose-200 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Quy chuẩn cứu hộ: Ghép đối khẩn cấp • Thưởng +8 điểm uy tín tín nhiệm • Bảo chứng cọc 200k an toàn 100%!
            </span>
          </div>
        </div>

        {/* Right: Cost & Actions */}
        <div className="md:col-span-4 flex sm:flex-row md:flex-col items-center sm:justify-between md:items-end justify-between gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-rose-500/20">
          <div className="text-left md:text-right">
            <div className="text-[10px] text-slate-400 font-medium">
              Tiền sân chia đôi (50/50):
            </div>
            <div className="flex items-baseline gap-2 md:justify-end">
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                {shareCost.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              Tổng sân: {match.totalCostVnd.toLocaleString("vi-VN")}đ
            </div>
          </div>

          {/* NÚT THAO TÁC: NẾU LÀ CHỦ BÀI ĐĂNG SOS -> CHO PHÉP SỬA & HỦY/XÓA; NẾU LÀ ĐỘI KHÁC -> NÚT GIẢI CỨU */}
          {isOwner ? (
            <div className="flex items-center gap-2 w-full sm:w-auto md:w-full justify-end">
              {onEditMatch && (
                <button
                  type="button"
                  onClick={() => onEditMatch(match)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-black transition shadow-sm active:scale-95"
                  title="Chỉnh sửa thông tin bài đăng SOS của bạn"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sửa SOS</span>
                </button>
              )}
              {onDeleteMatch && (
                <button
                  type="button"
                  onClick={() => onDeleteMatch(match.id)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/40 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-black transition shadow-sm active:scale-95"
                  title="Hủy hoặc xóa bài đăng SOS này khỏi bảng tin"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hủy / Xóa</span>
                </button>
              )}
            </div>
          ) : (
            <ClickSpark
              sparkColor={["#ef4444", "#f97316", "#fbbf24", "#ffffff"]}
              sparkCount={10}
              className="w-full sm:w-auto md:w-full"
            >
              <Button
                onClick={() => onSelectMatch(match)}
                className="ticket-stub w-full h-10 px-5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white font-black text-xs tracking-wide shadow-md shadow-red-900/30 flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <span>Giải Cứu Kèo Ngay</span>
                <span>📣</span>
              </Button>
            </ClickSpark>
          )}
        </div>
      </div>
    </LaserGlowCard>
  );
}

export default SosAlertCard;
