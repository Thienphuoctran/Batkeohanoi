"use client";

import React from "react";
import { Plus } from "lucide-react";
import { PhuiStamp, RollingFootballPitch } from "@/components/phui";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";
import { ClickSpark } from "@/components/reactbits";

interface EmptyFeedStateProps {
  onOpenCreateModal: () => void;
}

export const EmptyFeedState: React.FC<EmptyFeedStateProps> = ({
  onOpenCreateModal,
}) => {
  return (
    <div className="card-retro-paper relative rounded-3xl border border-stone-300 p-6 sm:p-8 text-center space-y-4 shadow-lg overflow-hidden">
      {/* Watermark Stamps Phủi */}
      <div className="absolute top-4 right-4 hidden sm:block">
        <PhuiStamp variant="keo-uy-tin" size="sm" angle={8} />
      </div>
      <div className="absolute bottom-4 left-4 hidden sm:block">
        <PhuiStamp variant="san-7-ha-noi" size="sm" angle={-6} />
      </div>

      <div className="space-y-1.5 relative z-10">
        <h3 className="text-base sm:text-xl font-black text-red-800 tracking-tight flex items-center justify-center gap-2 flex-wrap">
          <span>BẢN TIN GHÉP TRẬN HÔM NAY -</span>
          <span className="text-stone-900 underline decoration-red-600">
            HÀ NỘI
          </span>
        </h3>
        <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
          Chưa có đội nào mở kèo tại khu vực hoặc khung giờ này. Hãy là đội tiên
          phong mở bát để nhận đối thủ ngay trong 5 phút!
        </p>
      </div>

      {/* 📰 BỘ ẢNH TƯ LIỆU BÁO CHÍ & SCRAPBOOK BÓNG ĐÁ PHỦI (ẢNH 2 TỪ NGƯỜI DÙNG) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 max-w-2xl mx-auto relative z-10">
        {/* ASSET 01: TỜ BÁO NẾP GẤP */}
        <div className="flex flex-col items-center">
          <VintageScrapbookAsset
            asset="newspaper-headline"
            tape="both"
            tilt={-2}
            className="w-full max-w-[210px] shadow-md"
            caption="Bản tin phủi GiaoHuu.vn"
          />
        </div>
        {/* ASSET 05: POLAROID CHƠI ĐẸP - FAIR PLAY */}
        <div className="flex flex-col items-center">
          <VintageScrapbookAsset
            asset="polaroid-fairplay"
            tape="both"
            tilt={2}
            className="w-full max-w-[175px] shadow-md"
            caption="CHƠI ĐẸP - FAIR PLAY"
          />
        </div>
        {/* ASSET 07: SA BÀN 3-2-1 TRÊN GIẤY KẺ Ô */}
        <div className="flex flex-col items-center">
          <VintageScrapbookAsset
            asset="tactical-board"
            tape="both"
            tilt={-1.5}
            className="w-full max-w-[185px] shadow-md"
            caption="Sơ đồ 3-2-1 Phủi"
          />
        </div>
      </div>

      {/* ⚽ 2D MINI PITCH ROLLING FOOTBALL RADAR ANIMATION */}
      <div className="py-1 relative z-10">
        <RollingFootballPitch statusText="Quét các cụm sân Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Đống Đa..." />
      </div>

      <div className="relative z-10 pt-1">
        <ClickSpark sparkColor={["#f97316", "#fbbf24", "#ef4444"]}>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="ticket-stub inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-md shadow-orange-900/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Mở Kèo Mới Ngay</span>
          </button>
        </ClickSpark>
      </div>
    </div>
  );
};
