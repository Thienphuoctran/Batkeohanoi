"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Khởi tạo trạng thái ban đầu
    setIsOffline(!navigator.onLine);

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {isOffline ? (
        <div className="card-retro-paper rounded-2xl border-2 border-amber-600/60 p-2.5 px-3.5 shadow-xl flex items-center justify-between gap-2.5 text-xs bg-[#fef8ea]">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-800 shrink-0">
              <WifiOff className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <div className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                Chế độ Ngoại Tuyến (Offline)
              </div>
              <p className="text-[10px] text-stone-700 font-medium leading-tight">
                Mất sóng 4G sân bóng. Danh bạ 65+ sân &amp; số hotline vẫn tra cứu được!
              </p>
            </div>
          </div>
        </div>
      ) : showReconnected ? (
        <div className="card-retro-paper rounded-2xl border-2 border-emerald-600/60 p-2.5 px-3.5 shadow-xl flex items-center justify-between gap-2.5 text-xs bg-[#f0fdf4]">
          <div className="flex items-center gap-2 text-stone-900 font-bold">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-800 shrink-0">
              <Wifi className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <div className="text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                Đã Khôi Phục Kết Nối
              </div>
              <p className="text-[10px] text-emerald-800 font-medium leading-tight">
                Hệ thống đang tự động cập nhật các kèo đấu mới nhất...
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
