"use client";

import React from "react";

interface StarRibbonProps {
  className?: string;
  starsCount?: number;
}

export function StarRibbon({ className = "", starsCount = 5 }: StarRibbonProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-gradient-to-r from-red-600 via-amber-600 to-red-600 border border-amber-300/60 shadow-lg select-none pointer-events-none ${className}`}
    >
      {[...Array(starsCount)].map((_, i) => (
        <span
          key={i}
          className="text-amber-300 text-xs font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] animate-pulse"
          style={{ animationDelay: `${i * 180}ms` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
