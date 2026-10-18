"use client";

import React, { useEffect, useState, useRef } from "react";

interface CountUpNumberProps {
  end: number;
  start?: number;
  duration?: number; // in milliseconds
  formatter?: (val: number) => string;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  end,
  start = 0,
  duration = 1500,
  formatter,
  className = "",
  suffix = "",
  prefix = "",
}) => {
  const [count, setCount] = useState(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = timestamp - startTimeRef.current;
      const rate = Math.min(progress / duration, 1);

      // Ease out exponential curve
      const easeOut = rate === 1 ? 1 : 1 - Math.pow(2, -10 * rate);
      const currentVal = Math.floor(start + (end - start) * easeOut);

      setCount(currentVal);

      if (rate < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, start, duration]);

  const displayValue = formatter
    ? formatter(count)
    : count.toLocaleString("vi-VN");

  return (
    <span className={`inline-block font-mono tracking-tight ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};

export default CountUpNumber;
