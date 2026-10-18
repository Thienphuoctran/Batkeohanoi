"use client";

import React, { useRef, useState } from "react";

interface HoloCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const HoloCard: React.FC<HoloCardProps> = ({
  children,
  className = "",
  maxTilt = 15,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) scale3d(1.02, 1.02, 1.02)`
    );

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.8 });
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl overflow-hidden transition-transform duration-150 ease-out will-change-transform cursor-pointer border border-white/10 bg-slate-900/80 backdrop-blur-xl ${className}`}
      style={{
        transform,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Holographic Rainbow Foil Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge transition-opacity duration-300"
        style={{
          opacity: glarePosition.opacity,
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.8) 0%, rgba(255,0,128,0.3) 25%, rgba(0,255,255,0.3) 50%, rgba(255,255,0,0.3) 75%, transparent 100%)`,
        }}
      />

      {/* Surface Sparkle Shimmer */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.4) 40%, transparent 60%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Card Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default HoloCard;
