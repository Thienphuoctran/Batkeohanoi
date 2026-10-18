"use client";

import React, { useState, useCallback } from "react";

interface Spark {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  color: string;
}

interface ClickSparkProps {
  children: React.ReactNode;
  sparkColor?: string[];
  sparkCount?: number;
  sparkSize?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const ClickSpark: React.FC<ClickSparkProps> = ({
  children,
  sparkColor = ["#10b981", "#84cc16", "#38bdf8", "#fbbf24"],
  sparkCount = 8,
  className = "",
  onClick,
}) => {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newSparks: Spark[] = Array.from({ length: sparkCount }).map(
        (_, i) => ({
          id: Date.now() + i,
          x,
          y,
          angle: (i * (360 / sparkCount) * Math.PI) / 180,
          speed: 25 + Math.random() * 20,
          color: sparkColor[Math.floor(Math.random() * sparkColor.length)],
        })
      );

      setSparks((prev) => [...prev, ...newSparks]);

      setTimeout(() => {
        setSparks((prev) =>
          prev.filter((s) => !newSparks.some((ns) => ns.id === s.id))
        );
      }, 600);

      if (onClick) onClick(e);
    },
    [sparkColor, sparkCount, onClick]
  );

  return (
    <div
      onClick={handleClick}
      className={`relative inline-block cursor-pointer select-none overflow-visible ${className}`}
    >
      {children}
      {/* Sparks layer */}
      {sparks.map((spark) => (
        <span
          key={spark.id}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full z-50 animate-spark-fly"
          style={
            {
              left: `${spark.x}px`,
              top: `${spark.y}px`,
              backgroundColor: spark.color,
              boxShadow: `0 0 8px ${spark.color}`,
              "--tx": `${Math.cos(spark.angle) * spark.speed}px`,
              "--ty": `${Math.sin(spark.angle) * spark.speed}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        @keyframes sparkFly {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
        .animate-spark-fly {
          animation: sparkFly 0.6s cubic-bezier(0, 0.7, 0.1, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ClickSpark;
