"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface RollingFootballPitchProps {
  className?: string;
  statusText?: string;
}

export function RollingFootballPitch({
  className = "",
  statusText = "Radar đang quét kèo phủi sân 7 toàn Hà Nội...",
}: RollingFootballPitchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ballRef.current || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Timeline quả bóng lăn qua lại giữa 2 khung thành trên sân
      const tl = gsap.timeline({ repeat: -1, yoyo: true });

      tl.to(ballRef.current, {
        x: 110,
        rotation: 720,
        duration: 2.4,
        ease: "power1.inOut",
      })
        .to(ballRef.current, {
          y: -8,
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: "power2.out",
        })
        .to(ballRef.current, {
          x: -110,
          rotation: -720,
          duration: 2.8,
          ease: "power1.inOut",
        });

      // Vệt sáng lướt theo sau bóng
      if (trailRef.current) {
        gsap.to(trailRef.current, {
          scaleX: 1.4,
          opacity: 0.8,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full max-w-lg mx-auto rounded-2xl overflow-hidden border border-emerald-500/30 bg-[#041a0e]/95 p-3.5 shadow-2xl backdrop-blur-xl ${className}`}
    >
      {/* 1. Sọc Cỏ Sân Bóng 7 Người (Grass Turf Stripes) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #10b981 0px, #10b981 32px, #047857 32px, #047857 64px)",
        }}
      />

      {/* 2. Vạch Kẻ Sân 2D Chuẩn Phủi Hà Nội (Pitch Wireframe) */}
      <div className="relative h-28 sm:h-32 rounded-xl border border-emerald-400/30 flex items-center justify-between p-2 overflow-hidden bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40">
        {/* Vòng Cấm Trái */}
        <div className="w-12 h-20 border-r border-y border-emerald-400/30 rounded-r-xl" />

        {/* Vòng Tròn Giao Bóng Giữa Sân & Vạch Phân Cách */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-emerald-400/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-emerald-400/35 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400/60" />

        {/* Vòng Cấm Phải */}
        <div className="w-12 h-20 border-l border-y border-emerald-400/30 rounded-l-xl" />

        {/* 3. Quả Bóng 2D Lăn Lăn Qua Lại Kèm Vệt Sáng Sonar */}
        <div
          ref={ballRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center cursor-pointer select-none"
        >
          {/* Radar Sonar Ping Wave phát ra từ quả bóng */}
          <span className="absolute -inset-3 rounded-full bg-emerald-400/20 animate-ping opacity-75" />
          <span className="absolute -inset-1 rounded-full border border-emerald-300/40 animate-pulse" />

          {/* Vệt sáng phát quang (Luminous Trail) */}
          <div
            ref={trailRef}
            className="absolute -inset-2 rounded-full bg-emerald-400/25 blur-sm -z-10"
          />

          {/* Icon Quả Bóng ⚽ */}
          <div className="w-9 h-9 rounded-full bg-white text-slate-950 flex items-center justify-center text-xl shadow-[0_0_16px_rgba(16,185,129,0.7)] border-2 border-emerald-300">
            ⚽
          </div>
        </div>
      </div>

      {/* 4. Dòng Trạng Thái Quét Radar Phủi */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] px-1 text-slate-300">
        <div className="flex items-center gap-1.5 font-bold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>RADAR SÂN 7:</span>
          <span className="text-white font-medium truncate">{statusText}</span>
        </div>
        <span className="text-[10px] font-mono text-amber-300 shrink-0">
          Tốc hành 5p
        </span>
      </div>
    </div>
  );
}
