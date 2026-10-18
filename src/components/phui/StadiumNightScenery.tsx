"use client";

import React from "react";

export function StadiumNightScenery() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Dusk Twilight Horizon Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030d08] via-[#051710] to-[#020b06]" />

      {/* 2. Distant Horizon Glow (Sunset Dusk & Stadium Ambient) */}
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-gradient-to-b from-amber-950/20 via-emerald-950/25 to-transparent" />

      {/* 3. Left Floodlight Mast (Cột Đèn Cao Áp Trái 1000W) */}
      <div className="absolute -top-6 left-2 sm:left-12 lg:left-24 w-32 sm:w-48 h-80 z-0 opacity-80 lg:opacity-100">
        {/* Mast Lattice Structure */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-2 h-72 bg-gradient-to-b from-slate-400/80 via-slate-600/40 to-transparent" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-400/60" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-500/50" />

        {/* Floodlight Array Fixture (Hộp Đèn 6 Bóng) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-10 sm:h-12 rounded-md bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-around p-1">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-amber-100 shadow-[0_0_12px_3px_rgba(251,191,36,0.9)] animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>

        {/* Floodlight Beam Cone (Chùm sáng góc trái chiếu xuống sân) */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[420px] sm:w-[600px] h-[900px] pointer-events-none opacity-40"
          style={{
            background:
              "conic-gradient(from 140deg at 50% 0%, rgba(251, 191, 36, 0.22) 0deg, rgba(52, 211, 153, 0.12) 35deg, transparent 70deg)",
            transform: "rotate(15deg)",
          }}
        />
      </div>

      {/* 4. Right Floodlight Mast (Cột Đèn Cao Áp Phải 1000W) */}
      <div className="absolute -top-6 right-2 sm:right-12 lg:right-24 w-32 sm:w-48 h-80 z-0 opacity-80 lg:opacity-100">
        {/* Mast Lattice Structure */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-2 h-72 bg-gradient-to-b from-slate-400/80 via-slate-600/40 to-transparent" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-400/60" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-6 h-1 bg-slate-500/50" />

        {/* Floodlight Array Fixture (Hộp Đèn 6 Bóng) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 sm:w-20 h-10 sm:h-12 rounded-md bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-around p-1">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-amber-100 shadow-[0_0_12px_3px_rgba(251,191,36,0.9)] animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>

        {/* Floodlight Beam Cone (Chùm sáng góc phải chiếu xuống sân) */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-[420px] sm:w-[600px] h-[900px] pointer-events-none opacity-40"
          style={{
            background:
              "conic-gradient(from 220deg at 50% 0%, transparent 0deg, rgba(52, 211, 153, 0.12) 35deg, rgba(251, 191, 36, 0.22) 70deg)",
            transform: "rotate(-15deg)",
          }}
        />
      </div>

      {/* 5. Center Stadium Pitch Atmosphere (Mặt Cỏ Sân Bóng 7 Người) */}
      <div className="absolute bottom-0 inset-x-0 h-[65vh] bg-gradient-to-t from-[#021109] via-[#041a0e]/95 to-transparent">
        {/* Subtle Pitch Grass Turf Stripes (Sọc Cỏ Sân Cắt Ngang) */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #10b981 0px, #10b981 40px, #047857 40px, #047857 80px)",
          }}
        />

        {/* Pitch Lines (Vạch Kẻ Sân Bóng Mờ Ảo) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[85%] max-w-5xl h-64 border-2 border-emerald-400/10 rounded-t-3xl" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-emerald-400/15 rounded-t-2xl" />
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border border-emerald-400/10" />
      </div>

      {/* 6. Soft Deep Emerald Glass Vignette Overlay (Đảm bảo chữ và thẻ đọc nét 100%) */}
      <div className="absolute inset-0 bg-radial-vignette opacity-85" />
    </div>
  );
}
