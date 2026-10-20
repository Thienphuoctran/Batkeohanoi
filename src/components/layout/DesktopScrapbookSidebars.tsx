"use client";

import React from "react";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";

interface DesktopScrapbookSidebarsProps {
  isWideLayout: boolean;
}

export const DesktopScrapbookSidebars: React.FC<DesktopScrapbookSidebarsProps> = ({
  isWideLayout,
}) => {
  return (
    <>
      {/* 📰 CỘT BÁO PHÓNG SỰ BÓNG ĐÁ PHỦI RÌA TRÁI (DESKTOP VINTAGE SCRAPBOOK) */}
      <aside
        aria-hidden="true"
        className={`hidden ${
          isWideLayout ? "2xl:flex" : "xl:flex"
        } flex-col gap-4 fixed left-2 2xl:left-5 top-20 w-56 2xl:w-64 pointer-events-auto opacity-100 z-10`}
      >
        {/* 1. TỜ BÁO PHỦI IN CHÍNH THỨC CÓ ẢNH TƯ LIỆU */}
        <div className="card-retro-paper p-3 rounded-2xl border border-stone-300 shadow-md rotate-[-2deg] relative overflow-hidden pointer-events-auto">
          <div className="washi-tape -top-2 left-6 rotate-[-2deg]" />
          <div className="flex items-center justify-between border-b border-stone-300 pb-1.5 mb-2">
            <span className="text-[10px] font-black uppercase text-red-700 tracking-wider flex items-center gap-1">
              <span>📰 BẢN TIN PHỦI</span>
            </span>
            <span className="text-[9px] font-mono text-stone-500 font-bold">
              SỐ 2026
            </span>
          </div>

          <VintageScrapbookAsset
            asset="newspaper-headline"
            tape="none"
            className="w-full mb-2"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-900 leading-tight">
              Khung giờ vàng 19h00: Cụm sân Cầu Giấy kín lịch đối đầu
            </div>
            <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
              Các đội bóng phủi Thủ đô đang tích cực ghép kèo giao hữu sân 7. Hệ
              thống cọc 200k giúp triệt tiêu 100% tình trạng bùng kèo.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
            <span className="rubber-stamp text-[8px] py-0.5 px-1.5">
              KÈO UY TÍN
            </span>
            <span className="text-[9px] text-stone-600 font-extrabold font-mono">
              GiaoHuu.vn
            </span>
          </div>
        </div>

        {/* 2. ẢNH POLAROID: CẦU THỦ NÂNG CÚP / KỶ NIỆM SAU TRẬN */}
        <div className="bg-white p-2 pb-3 rounded-xl border border-stone-300 shadow-md rotate-[2.5deg] relative pointer-events-auto">
          <div className="washi-tape -top-2.5 right-6 rotate-[3deg]" />
          <VintageScrapbookAsset
            asset="polaroid-trophy"
            tape="none"
            className="w-full mb-1"
          />
          <div className="text-center mt-1">
            <p className="text-[10px] font-bold text-stone-800 tracking-tight">
              “Kỷ niệm sau trận giao hữu 7v7”
            </p>
            <span className="text-[8px] text-stone-500 font-medium">
              Bắt tay hữu nghị • Nâng cúp vàng
            </span>
          </div>
        </div>

        {/* 3. TỜ SỔ TAY KẺ Ô: SA BÀN CHIẾN THUẬT 3-2-1 */}
        <div className="card-retro-paper p-2.5 rounded-xl border border-stone-300 shadow-sm rotate-[-1.5deg] relative text-[10px] pointer-events-auto">
          <div className="washi-tape -top-2 left-8 rotate-[-1deg]" />
          <VintageScrapbookAsset
            asset="tactical-board"
            tape="none"
            className="w-full mb-1.5"
            caption="Sơ đồ chiến thuật 3-2-1 phủi"
          />
          <p className="text-[9px] text-stone-500 mt-1 italic text-center">
            “Kỷ luật vị trí — Không ham dâng cao!”
          </p>
        </div>
      </aside>

      {/* 📰 CỘT BÁO PHÓNG SỰ BÓNG ĐÁ PHỦI RÌA PHẢI (DESKTOP VINTAGE SCRAPBOOK) */}
      <aside
        aria-hidden="true"
        className={`hidden ${
          isWideLayout ? "2xl:flex" : "xl:flex"
        } flex-col gap-4 fixed right-2 2xl:right-5 top-20 w-56 2xl:w-64 pointer-events-auto opacity-100 z-10`}
      >
        {/* 1. TỜ BÁO TIÊU ĐIỂM SÂN CỎ */}
        <div className="card-retro-paper p-3 rounded-2xl border border-stone-300 shadow-md rotate-[2deg] relative overflow-hidden pointer-events-auto">
          <div className="washi-tape -top-2 right-6 rotate-[2deg]" />
          <div className="flex items-center justify-between border-b border-stone-300 pb-1.5 mb-2">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <span>🌱 TIÊU ĐIỂM SÂN CỎ</span>
            </span>
            <span className="text-[9px] font-mono text-stone-600 font-bold">
              26°C TF
            </span>
          </div>

          <VintageScrapbookAsset
            asset="polaroid-fairplay"
            tape="none"
            className="w-full mb-2"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-900 leading-tight">
              Thời tiết tối nay toàn Hà Nội: Cỏ khô ráo, gió mát lý tưởng
            </div>
            <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
              Mặt sân cỏ nhân tạo đạt độ bám tối đa, thích hợp thi đấu tốc độ
              cao và sút xa uy lực.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
            <span className="rubber-stamp text-[8px] py-0.5 px-1.5 border-emerald-700 text-emerald-800">
              HÀ NỘI 7v7
            </span>
            <span className="text-[9px] text-stone-500 font-bold font-mono">
              Bản Tin Tối
            </span>
          </div>
        </div>

        {/* 2. CUỐNG VÉ TRẬN ĐẤU RETRO (MATCH TICKET STUB) */}
        <div className="ticket-stub p-3 bg-[#fbf9f4] rounded-xl border border-stone-300 shadow-md rotate-[-2deg] relative pointer-events-auto">
          <div className="washi-tape -top-2 left-6 rotate-[-1deg]" />
          <VintageScrapbookAsset
            asset="ticket-stub"
            tape="none"
            className="w-full mb-1"
          />
          <div className="space-y-1 text-[10px] mt-2">
            <div className="flex justify-between text-stone-800 font-bold">
              <span>BẢO CHỨNG:</span>
              <span className="text-emerald-800 font-black">200.000đ</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>QUY CHUẨN:</span>
              <span className="font-bold text-stone-800">Sân 7 Phủi Hà Nội</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>HỦY SÁT GIỜ:</span>
              <span className="font-bold text-red-700">Đền 100% tiền sân</span>
            </div>
          </div>
        </div>

        {/* 3. POLAROID: TRÀ ĐÁ VÀ CHIẾN THUẬT */}
        <div className="bg-white p-2 pb-3 rounded-xl border border-stone-300 shadow-md rotate-[1.5deg] relative pointer-events-auto">
          <div className="washi-tape -top-2 right-8 rotate-[2deg]" />
          <VintageScrapbookAsset
            asset="tea-tactics"
            tape="none"
            className="w-full mb-1"
          />
          <div className="text-center mt-1">
            <p className="text-[10px] font-bold text-stone-800">
              “Uống Trà Đá - Bàn Chiến Thuật”
            </p>
            <span className="text-[8px] text-stone-500">
              Mã Bắt Tay OTP 4 Số Nhận +10 Uy Tín
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
