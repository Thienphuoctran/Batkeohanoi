"use client";

import React, { useState } from "react";
import {
  X,
  Trophy,
  Star,
  ShieldCheck,
  MessageSquare,
  Phone,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";
import { FreeAgentScoutCard } from "@/types/matchmaking";
import { getZaloDeepLink, normalizeVietnamPhone } from "@/lib/zalo";
import { HoloCard } from "@/components/reactbits/HoloCard";

interface FutCardModalProps {
  player: FreeAgentScoutCard | null;
  onClose: () => void;
}

export function FutCardModal({ player, onClose }: FutCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!player) return null;

  const isGK = player.position === "GK";

  const handleCopyShare = () => {
    const shareText = `⚽ THẺ CẦU THỦ BẮTKÈO7 FUT CARD: ${player.playerName} (${player.age}t • ${player.position}) | OVR ${player.futStats.ovr} | Uy tín ${player.trustRating.toFixed(1)}★ | Khu vực: ${player.districts.join(", ")} | Kết nối Zalo mời đá ngay tại BắtKèo7.vn!`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute -top-3 right-0 z-10 w-9 h-9 rounded-full bg-slate-900 border border-white/20 text-slate-300 hover:text-white flex items-center justify-center shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* KHUNG THẺ EA FC / FIFA FUT CARD KIM LOẠI 3D HOLO */}
        <HoloCard
          className={`w-full rounded-[28px] p-5 border-2 shadow-2xl relative overflow-hidden ${
            isGK
              ? "bg-gradient-to-b from-amber-500/30 via-[#1e1b0f] to-[#0f172a] border-amber-400/80 shadow-amber-500/20"
              : "bg-gradient-to-b from-emerald-500/30 via-[#0d1f1a] to-[#0f172a] border-emerald-400/80 shadow-emerald-500/20"
          }`}
        >
          {/* Ánh sáng Hologram nền */}
          <div className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-52 h-52 rounded-full bg-emerald-400/15 blur-3xl" />

          {/* Header FUT Card: OVR + Vị trí + Huy hiệu Quốc gia / Hà Nội */}
          <div className="flex items-start justify-between relative z-10">
            <div className="flex flex-col items-center">
              <span
                className={`text-4xl font-black leading-none tracking-tighter ${
                  isGK ? "text-amber-300" : "text-emerald-300"
                }`}
              >
                {player.futStats.ovr}
              </span>
              <span className="text-sm font-black uppercase tracking-widest text-white mt-0.5 px-2 py-0.5 rounded bg-white/10 border border-white/15">
                {player.position}
              </span>
              <span className="text-[10px] font-bold text-slate-300 mt-1.5">
                🇻🇳 HÀ NỘI
              </span>
              <span className="text-[10px] font-extrabold text-amber-300 mt-0.5">
                Tier {player.skillTier}
              </span>
            </div>

            {/* Avatar Cầu Thủ Ảo + Huy Hiệu */}
            <div className="flex flex-col items-center">
              <div
                className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-inner relative ${
                  isGK
                    ? "bg-gradient-to-br from-amber-500/30 to-yellow-900/40 border-amber-300/60"
                    : "bg-gradient-to-br from-emerald-500/30 to-teal-900/40 border-emerald-300/60"
                }`}
              >
                <span className="text-4xl">
                  {player.position === "GK"
                    ? "🧤"
                    : player.position === "DF"
                    ? "🛡️"
                    : player.position === "MF"
                    ? "🎯"
                    : "⚡"}
                </span>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/90 text-amber-300 border border-amber-400/40 mt-1">
                  {player.trustRating.toFixed(1)} ★ UY TÍN
                </span>
              </div>
            </div>

            {/* Cột phải: Thông tin nhanh */}
            <div className="flex flex-col items-end text-right space-y-1">
              {isGK && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow">
                  HÀNG HIẾM GK
                </span>
              )}
              <span className="text-[10px] font-bold text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-white/10">
                {player.age} tuổi
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/20">
                {player.preferredFoot}
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                {player.matchesJoined} trận ghép
              </span>
            </div>
          </div>

          {/* Tên Cầu Thủ */}
          <div className="mt-4 pt-2.5 border-t border-b border-white/15 text-center relative z-10 py-2">
            <h3 className="text-lg font-black uppercase tracking-wide text-white flex items-center justify-center gap-1.5">
              <span>{player.playerName}</span>
              {player.trustRating >= 4.8 && (
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              )}
            </h3>
            <p className="text-[11px] text-amber-300 font-bold mt-0.5">
              {player.districts.join(" • ")} | Ca: {player.availableTimeSlots.join(", ")}
            </p>
          </div>

          {/* 6 Chỉ Số EA FC / FUT Stats */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 my-3.5 px-3 relative z-10 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="text-slate-400 font-bold">PAC (Thể lực)</span>
              <span className="font-black text-white tabular-nums">
                {player.futStats.pac}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="text-slate-400 font-bold">TEC (Kỹ thuật)</span>
              <span className="font-black text-white tabular-nums">
                {player.futStats.tec}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="text-slate-400 font-bold">PAS (Chuyền)</span>
              <span className="font-black text-white tabular-nums">
                {player.futStats.pas}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="text-slate-400 font-bold">DEF (Thủ/Gôn)</span>
              <span className="font-black text-white tabular-nums">
                {player.futStats.def}
              </span>
            </div>
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-emerald-400 font-bold">FPL (Fairplay)</span>
              <span className="font-black text-emerald-300 tabular-nums">
                {player.futStats.fpl}
              </span>
            </div>
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-amber-400 font-bold">TRST (Uy tín)</span>
              <span className="font-black text-amber-300 tabular-nums">
                {player.trustRating.toFixed(1)}★
              </span>
            </div>
          </div>

          {/* Trao đổi chi phí qua Zalo */}
          <div className="rounded-xl bg-slate-950/85 border border-white/10 p-2.5 text-center relative z-10">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
              💬 Trao đổi chi phí sân &amp; trang phục trực tiếp qua Zalo
            </span>
          </div>

          {/* Footer Thương hiệu BắtKèo7 */}
          <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 relative z-10">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              BẮTKÈO7 SCOUT FUT
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Sparkles className="w-3 h-3" />
              Verified Sân 7 HN
            </span>
          </div>
        </HoloCard>

        {/* Các nút tương tác dưới thẻ */}
        <div className="w-full mt-3 grid grid-cols-3 gap-2">
          <a
            href={getZaloDeepLink(player.phone, player.zaloPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span>Mời Zalo</span>
          </a>
          <a
            href={`tel:${normalizeVietnamPhone(player.phone)}`}
            className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Gọi Ngay</span>
          </a>
          <button
            onClick={handleCopyShare}
            className="h-10 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã lưu!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Khoe Thẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
