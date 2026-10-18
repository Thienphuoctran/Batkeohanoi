"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 4,
  className = "",
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`relative inline-block text-transparent bg-clip-text font-bold ${
        disabled ? "text-slate-100" : ""
      } ${className}`}
      style={{
        backgroundImage: disabled
          ? "none"
          : "linear-gradient(120deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.4) 100%)",
        backgroundSize: "200% 100%",
        animation: disabled
          ? "none"
          : `shiny-sweep ${animationDuration} linear infinite`,
        WebkitBackgroundClip: "text",
      }}
    >
      {text}
      <style jsx>{`
        @keyframes shiny-sweep {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </span>
  );
};

export default ShinyText;
