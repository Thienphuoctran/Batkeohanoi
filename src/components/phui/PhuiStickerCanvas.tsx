"use client";

import React from "react";
import { PhuiSticker } from "./PhuiStickerSet";

export function PhuiStickerCanvas() {
  return (
    <aside aria-label="Họa tiết trang trí phủi" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden select-none">
      {/* =========================================================================
          LAYER 1A: CÁC STICKER RÌA MÀN HÌNH BÊN TRÁI (LEFT GUTTER MARGIN)
          Phân bố ngoài lề thẻ chính, góc nghiêng tự nhiên từ -5° đến +8°
         ========================================================================= */}
      
      {/* 1. Trà đá vỉa hè "TRÀ ĐÁ FC" (Phía trên bên trái) */}
      <div className="hidden xl:block absolute top-28 left-4 2xl:left-12 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="tra-da"
          size={110}
          angle={-4}
          className="animate-float-slow"
        />
      </div>

      {/* 2. Cờ góc sân cỏ viền đỏ (Giữa sườn bên trái) */}
      <div className="hidden lg:block absolute top-[440px] left-2 2xl:left-8 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="co-goc"
          size={120}
          angle={6}
          className="animate-float-reverse"
        />
      </div>

      {/* 3. Bảng sa bàn kẹp giấy 3-2-1 (Phía dưới bên trái) */}
      <div className="hidden xl:block absolute bottom-36 left-4 2xl:left-10 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="sa-ban"
          size={140}
          angle={-5}
          className="animate-float-slow"
        />
      </div>

      {/* 4. Giày đinh dăm TF bám cỏ (Cận đáy trái) */}
      <div className="hidden 2xl:block absolute bottom-6 left-6 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="giay-dinh-tf"
          size={115}
          angle={4}
        />
      </div>


      {/* =========================================================================
          LAYER 1B: CÁC STICKER RÌA MÀN HÌNH BÊN PHẢI (RIGHT GUTTER MARGIN)
         ========================================================================= */}
      
      {/* 5. Thẻ vàng - Thẻ đỏ "BÙNG KÈO?" (Phía trên bên phải) */}
      <div className="hidden xl:block absolute top-28 right-4 2xl:right-12 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="the-phat"
          size={110}
          angle={5}
          className="animate-float-reverse"
        />
      </div>

      {/* 6. Đồng hồ bấm giờ 90:00 (Giữa sườn bên phải) */}
      <div className="hidden lg:block absolute top-[430px] right-2 2xl:right-8 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="dong-ho-90"
          size={105}
          angle={-3}
          className="animate-float-slow"
        />
      </div>

      {/* 7. Cuống vé xem trận đấu Hà Nội (Phía dưới bên phải) */}
      <div className="hidden xl:block absolute bottom-44 right-4 2xl:right-10 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="ve-tran-dau"
          size={135}
          angle={6}
          className="animate-float-reverse"
        />
      </div>

      {/* 8. Huy hiệu FAIR PLAY 100/100 (Cận đáy phải) */}
      <div className="hidden 2xl:block absolute bottom-8 right-8 pointer-events-auto transition-transform hover:scale-110">
        <PhuiSticker
          variant="fair-play"
          size={105}
          angle={-4}
        />
      </div>


      {/* =========================================================================
          LAYER 1C: WATERMARK CHÌM 15% - 20% DƯỚI BẢNG DANH SÁCH TRẬN ĐẤU
          Nằm ẩn dưới nền tạo chiều sâu nghệ thuật mà không che khuất chữ
         ========================================================================= */}
      {/* Watermark 1: Quả bóng da cổ điển ở trung tâm phía trên */}
      <div className="absolute top-[340px] left-1/2 -translate-x-1/2 opacity-[0.14] scale-125 pointer-events-none -z-10 blur-[0.5px]">
        <PhuiSticker
          variant="bong-co-dien"
          size={240}
          angle={-8}
          interactive={false}
        />
      </div>

      {/* Watermark 2: Còi trọng tài ở khu vực giữa danh sách */}
      <div className="absolute top-[820px] right-[15%] opacity-[0.12] pointer-events-none -z-10 blur-[0.5px]">
        <PhuiSticker
          variant="coi-trong-tai"
          size={190}
          angle={12}
          interactive={false}
        />
      </div>

      {/* Watermark 3: Chữ BÓNG ĐÁ PHỦI ở đáy trang */}
      <div className="absolute bottom-[220px] left-[10%] opacity-[0.12] pointer-events-none -z-10 blur-[0.5px]">
        <PhuiSticker
          variant="bong-da-phui"
          size={210}
          angle={-6}
          interactive={false}
        />
      </div>
    </aside>
  );
}
