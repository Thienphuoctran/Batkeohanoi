"use client";

import React from "react";

export type StampVariant =
  | "keo-uy-tin"
  | "san-da-dat"
  | "coc-200k"
  | "da-ghep"
  | "sos-khan-cap"
  | "san-7-ha-noi";

interface PhuiStampProps {
  variant?: StampVariant;
  text?: string;
  subText?: string;
  angle?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PhuiStamp({
  variant = "keo-uy-tin",
  text,
  subText,
  angle = -10,
  className = "",
  size = "md",
}: PhuiStampProps) {
  const configs: Record<
    StampVariant,
    { label: string; sub: string; color: string; borderColor: string; bg: string }
  > = {
    "keo-uy-tin": {
      label: "KÈO UY TÍN",
      sub: "★ 100/100 ★",
      color: "text-red-500",
      borderColor: "border-red-500/85",
      bg: "bg-red-950/20",
    },
    "san-da-dat": {
      label: "SÂN ĐÃ ĐẶT",
      sub: "ĐÃ KHÓA GIỜ",
      color: "text-amber-400",
      borderColor: "border-amber-400/85",
      bg: "bg-amber-950/20",
    },
    "coc-200k": {
      label: "CỌC BẢO CHỨNG",
      sub: "200.000đ AN TOÀN",
      color: "text-emerald-400",
      borderColor: "border-emerald-400/85",
      bg: "bg-emerald-950/20",
    },
    "da-ghep": {
      label: "ĐÃ GHÉP KÈO",
      sub: "CHỜ BẮT TAY",
      color: "text-sky-400",
      borderColor: "border-sky-400/85",
      bg: "bg-sky-950/20",
    },
    "sos-khan-cap": {
      label: "CỨU HỘ GẤP",
      sub: "GIẢM 125K TIỀN SÂN",
      color: "text-rose-500",
      borderColor: "border-rose-500/90",
      bg: "bg-rose-950/30",
    },
    "san-7-ha-noi": {
      label: "HÀ NỘI PHỦI",
      sub: "CHỐNG BÙNG KÈO",
      color: "text-orange-400",
      borderColor: "border-orange-400/85",
      bg: "bg-orange-950/20",
    },
  };

  const current = configs[variant];
  const displayLabel = text || current.label;
  const displaySub = subText || current.sub;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[9px] tracking-wider",
    md: "px-2.5 py-1 text-[11px] tracking-widest",
    lg: "px-3.5 py-1.5 text-xs tracking-widest",
  }[size];

  return (
    <div
      style={{ transform: `rotate(${angle}deg)` }}
      className={`inline-flex flex-col items-center justify-center font-black uppercase rounded-lg border-2 ${current.borderColor} ${current.color} ${current.bg} shadow-md backdrop-blur-sm select-none pointer-events-none transition-transform duration-300 ${sizeClasses} ${className}`}
    >
      <div className="flex items-center gap-1 font-extrabold leading-none">
        <span>{displayLabel}</span>
      </div>
      {displaySub && (
        <div className="text-[8px] tracking-tight font-bold opacity-90 leading-none mt-0.5">
          {displaySub}
        </div>
      )}
    </div>
  );
}
