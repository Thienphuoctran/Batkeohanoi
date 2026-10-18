"use client";

import React from "react";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden bg-[#070b14] transition-bg ${className}`}
    >
      {/* Aurora Ambient Flow Layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        {/* Emerald turf glow */}
        <div
          className="absolute -top-[30%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(5, 150, 105, 0.1) 60%, transparent 80%)",
            animation: "aurora-drift 18s ease-in-out infinite alternate",
          }}
        />

        {/* Lime floodlight beam */}
        <div
          className="absolute top-[10%] -right-[15%] w-[55vw] h-[55vw] rounded-full blur-[140px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle, rgba(132, 204, 22, 0.35) 0%, rgba(101, 163, 13, 0.1) 60%, transparent 80%)",
            animation: "aurora-drift-reverse 22s ease-in-out infinite alternate",
          }}
        />

        {/* Deep electric blue night atmosphere */}
        <div
          className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full blur-[160px] mix-blend-screen"
          style={{
            background:
              "radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)",
            animation: "aurora-pulse 12s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Grid overlay for stadium perspective */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Children content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes aurora-drift {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(80px, 40px) scale(1.15);
          }
          100% {
            transform: translate(-40px, 60px) scale(0.95);
          }
        }
        @keyframes aurora-drift-reverse {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-60px, -30px) scale(1.1);
          }
          100% {
            transform: translate(40px, 50px) scale(0.9);
          }
        }
        @keyframes aurora-pulse {
          0% {
            opacity: 0.2;
            transform: scale(0.95);
          }
          100% {
            opacity: 0.35;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default AuroraBackground;
