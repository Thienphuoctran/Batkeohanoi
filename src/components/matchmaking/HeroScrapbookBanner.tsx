"use client";

import React from "react";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";
import { PhuiSticker, StarRibbon } from "@/components/phui";
import { CountUpNumber } from "@/components/reactbits";

interface HeroScrapbookBannerProps {
  className?: string;
}

export const HeroScrapbookBanner: React.FC<HeroScrapbookBannerProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`card-retro-paper relative rounded-3xl overflow-hidden border border-stone-300/90 p-4 sm:p-5 shadow-paper ${className}`}
    >
      {/* Washi Tape dán góc trang trí */}
      <div className="washi-tape -top-2.5 left-8 rotate-[-3deg]" />
      <div className="washi-tape -top-2.5 right-8 rotate-[2deg]" />

      {/* 📰 DẢI BÁO RÁCH NỔI BẬT: KÈO GAY CẤN TỐI NAY (ASSET 02 TỪ ẢNH NGƯỜI DÙNG) */}
      <div className="mb-3">
        <VintageScrapbookAsset
          asset="torn-banner"
          tape="both"
          className="w-full max-w-xl mx-auto block"
        />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300/80 text-[9px] sm:text-[10px] font-black text-red-700 uppercase tracking-wider shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              BẢN TIN NÓNG SÂN 7 HÀ NỘI
            </span>
            <span className="text-[10px] sm:text-[11px] text-stone-600 font-bold">
              • Ghép Đối Tốc Hành 5 Phút
            </span>
            <span className="rubber-stamp hidden sm:inline-flex text-[9px] py-0.5 px-2">
              KÈO UY TÍN
            </span>
          </div>
          <h2 className="font-headline text-base sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2 flex-wrap">
            <span>SÀN BẮT ĐỐI SÂN 7</span>
            <span className="text-red-700 underline decoration-stone-400">
              CHỐNG BÙNG KÈO
            </span>
            <PhuiSticker
              variant="chong-bung-keo"
              size={110}
              angle={-2}
              className="hidden md:inline-block ml-1 align-middle"
            />
          </h2>
          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 sm:mt-1 max-w-xl leading-relaxed font-medium">
            Cọc bảo chứng 200k • Hủy sát giờ &lt; 1h đền 100% tiền sân • Xác thực
            mã bắt tay OTP 4 số tại cổng sân.
          </p>
        </div>

        {/* 📰 TỜ BÁO NẾP GẤP TƯ LIỆU THỰC TẾ (ASSET 01 TỪ ẢNH NGƯỜI DÙNG) */}
        <div className="hidden sm:block shrink-0">
          <VintageScrapbookAsset
            asset="newspaper-headline"
            tape="right"
            tilt={1.5}
            className="w-44 lg:w-48 shadow-md"
            caption="Bản tin phủi GiaoHuu.vn"
          />
        </div>

        {/* 2 Cột Thống Kê Chuẩn */}
        <div className="relative shrink-0">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 bg-[#ede8dc] border border-stone-300 rounded-2xl p-2.5 sm:p-3.5 shrink-0 shadow-inner relative overflow-hidden">
            <div className="text-center px-2">
              <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold uppercase">
                Cọc Bảo Chứng
              </div>
              <div className="text-sm sm:text-base font-black text-emerald-800">
                <CountUpNumber end={200000} duration={1200} suffix="đ" />
              </div>
            </div>
            <div className="text-center px-2 border-l border-stone-300">
              <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold uppercase">
                Uy Tín Chuẩn
              </div>
              <div className="text-sm sm:text-base font-black text-amber-800">
                <CountUpNumber end={100} duration={1500} suffix="/100" />
              </div>
            </div>
          </div>
          {/* Dải Ruy Băng Sao Vàng Thể Thao Phủi */}
          <div className="absolute -bottom-2.5 -right-1 hidden sm:block">
            <StarRibbon
              starsCount={5}
              className="py-0.5 px-2 text-[10px] rotate-[-2deg]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
