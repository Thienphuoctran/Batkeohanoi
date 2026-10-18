"use client";

import React from "react";

interface LaserGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: "red" | "orange" | "emerald" | "blue";
  speed?: number; // seconds per cycle
}

export const LaserGlowCard: React.FC<LaserGlowCardProps> = ({
  children,
  className = "",
  glowColor = "red",
  speed = 3,
  ...props
}) => {
  const colorGradients = {
    red: "conic-gradient(from 0deg, transparent 0 340deg, #ef4444 360deg)",
    orange: "conic-gradient(from 0deg, transparent 0 340deg, #f97316 360deg)",
    emerald: "conic-gradient(from 0deg, transparent 0 340deg, #10b981 360deg)",
    blue: "conic-gradient(from 0deg, transparent 0 340deg, #3b82f6 360deg)",
  };

  const shadowColors = {
    red: "rgba(239, 68, 68, 0.25)",
    orange: "rgba(249, 115, 22, 0.25)",
    emerald: "rgba(16, 185, 129, 0.25)",
    blue: "rgba(59, 130, 246, 0.25)",
  };

  return (
    <div
      className={`relative p-[2px] rounded-2xl overflow-hidden group shadow-lg ${className}`}
      style={{
        boxShadow: `0 0 25px ${shadowColors[glowColor]}`,
      }}
      {...props}
    >
      {/* Laser beam rotating around the border */}
      <div
        className="absolute inset-[-100%] rounded-2xl pointer-events-none"
        style={{
          background: colorGradients[glowColor],
          animation: `spin-laser ${speed}s linear infinite`,
        }}
      />

      {/* Inner card background */}
      <div className="relative z-10 w-full h-full rounded-[14px] bg-slate-900/90 backdrop-blur-xl border border-white/10 p-4">
        {children}
      </div>

      <style jsx>{`
        @keyframes spin-laser {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LaserGlowCard;
