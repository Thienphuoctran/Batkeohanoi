"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  QrCode,
  Share2,
  Check,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { AuthenticatedTeamProfile, UserProfile } from "@/hooks/useAuthTeam";

export interface DigitalTeamCardProps {
  team: AuthenticatedTeamProfile;
  profile?: UserProfile | null;
  onSignOut?: () => void;
  onQuickCreateMatch?: () => void;
}

export const DigitalTeamCard: React.FC<DigitalTeamCardProps> = ({
  team,
  profile,
  onSignOut,
  onQuickCreateMatch,
}) => {
  const [copied, setCopied] = useState(false);

  const tierColor =
    team.skill_tier === 1
      ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-400"
      : team.skill_tier === 2
      ? "border-blue-500/40 bg-blue-950/20 text-blue-400"
      : "border-red-500/40 bg-red-950/20 text-red-400";

  const tierName =
    team.skill_tier === 1
      ? "Tier 1: Dưỡng sinh"
      : team.skill_tier === 2
      ? "Tier 2: Phong trào"
      : "Tier 3: Phủi chiến";

  const captainDisplayName =
    profile?.full_name || team.captain_name || "Đội trưởng";
  const captainDisplayPhone = profile?.phone || team.captain_phone || "";

  const DISTRICT_NAMES: Record<string, string> = {
    CauGiay: "Quận Cầu Giấy",
    NamTuLiem: "Quận Nam Từ Liêm",
    BacTuLiem: "Quận Bắc Từ Liêm",
    ThanhXuan: "Quận Thanh Xuân",
    DongDa: "Quận Đống Đa",
    HaDong: "Quận Hà Đông",
    HoangMai: "Quận Hoàng Mai",
    BaDinh: "Quận Ba Đình",
    HaiBaTrung: "Quận Hai Bà Trưng",
    TayHo: "Quận Tây Hồ",
    LongBien: "Quận Long Biên",
  };

  const displayDistrict =
    DISTRICT_NAMES[team.home_district] ||
    team.home_district ||
    "Hà Nội";

  const handleCopyCardText = () => {
    const appOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://batkeohanoi-wh64.vercel.app";
    const text =
      `⚽ THẺ CĂN CƯỚC BÓNG ĐÁ SỐ: ${team.team_name}\n` +
      `• Trình độ: ${tierName} (Tuổi TB: ${team.avg_age}t)\n` +
      `• Điểm tín nhiệm: ${team.trust_score}/100 ★ (Bảo chứng không bùng kèo)\n` +
      `• Đội trưởng: ${captainDisplayName} (${captainDisplayPhone})\n` +
      `• Địa bàn: ${displayDistrict}\n` +
      `👉 Giao lưu bắt kèo tại: ${appOrigin}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 shadow-2xl space-y-4">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-pitch-600/15 blur-2xl pointer-events-none"></div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pitch-600 to-teal-400 flex items-center justify-center text-white text-xl font-extrabold shadow-lg border border-white/20 shrink-0">
            {team.team_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-extrabold uppercase tracking-wider">
                Đội Chính Chủ Đã Xác Thực
              </span>
            </div>
            <div className="flex items-center space-x-1.5 mt-1">
              <h3 className="text-base font-extrabold text-white">
                {team.team_name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-400">
              Đội trưởng:{" "}
              <strong className="text-slate-200">{captainDisplayName}</strong> •{" "}
              <span className="font-mono text-emerald-300">
                {captainDisplayPhone}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierColor}`}
              >
                {tierName}
              </span>
              <span className="text-[11px] text-slate-400">
                Tuổi TB: {team.avg_age}t
              </span>
              {team.jersey_color && (
                <span className="text-[11px] text-slate-300">
                  • Áo: <strong>{team.jersey_color}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Tín nhiệm
          </span>
          <div className="text-xl font-mono font-extrabold text-pitch-400">
            {team.trust_score}
            <span className="text-xs text-slate-500">/100</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-500 block">Địa bàn</span>
          <span className="font-bold text-slate-200">
            {displayDistrict.replace("Quận ", "")}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Tình trạng</span>
          <span className="font-bold text-emerald-400">
            {team.has_warning_badge ? "⚠️ Có nhãn" : "✅ Chuẩn 5★"}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block">Ký quỹ cọc</span>
          <span className="font-bold text-sky-400">
            {team.trust_score >= 70 ? "Miễn cọc" : "Cọc 200k"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <span className="text-[11px] font-mono text-slate-400 flex items-center">
          <QrCode className="w-3.5 h-3.5 mr-1 text-pitch-400" />
          <span>ID: #{team.id.slice(0, 8).toUpperCase()}</span>
        </span>

        <div className="flex items-center gap-2">
          {onQuickCreateMatch && (
            <button
              onClick={onQuickCreateMatch}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-extrabold flex items-center space-x-1 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Đăng Kèo Đội Tôi</span>
            </button>
          )}

          <button
            onClick={handleCopyCardText}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-pitch-400 rounded-xl text-xs font-bold border border-pitch-500/30 flex items-center space-x-1 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Đã chép thẻ!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ Zalo</span>
              </>
            )}
          </button>

          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Đăng xuất tài khoản"
              className="p-1.5 bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-800 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
