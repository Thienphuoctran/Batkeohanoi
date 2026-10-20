"use client";

import React from "react";
import { PhuiSticker } from "./PhuiStickerSet";

export function PhuiStickerCanvas() {
  return (
    <aside
      aria-label="Họa tiết trang trí chìm"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
    >
      {/* =========================================================================
          WATERMARK CHÌM SÂU DƯỚI NỀN (BACKGROUND AMBIENT - KHÔNG ĐÈ LÊN BÁO/CHỮ)
          Tối ưu giao diện: Đã loại bỏ các sticker trôi nổi góc lề (Trà đá FC, Thẻ phạt,
          Sa bàn, Cuống vé) để giải phóng toàn bộ tầm nhìn cho hai cột báo giấy
          phóng sự phủi và các thẻ thông tin quan trọng.
         ========================================================================= */}
      {/* Watermark 1: Quả bóng da cổ điển ở trung tâm phía trên */}
      <div className="absolute top-[340px] left-1/2 -translate-x-1/2 opacity-[0.05] scale-125 pointer-events-none -z-10 blur-[0.5px]">
        <PhuiSticker
          variant="bong-co-dien"
          size={240}
          angle={-8}
          interactive={false}
        />
      </div>

      {/* Watermark 2: Còi trọng tài ở khu vực giữa danh sách */}
      <div className="absolute top-[820px] right-[15%] opacity-[0.04] pointer-events-none -z-10 blur-[0.5px]">
        <PhuiSticker
          variant="coi-trong-tai"
          size={190}
          angle={12}
          interactive={false}
        />
      </div>

      {/* Watermark 3: Chữ BÓNG ĐÁ PHỦI ở đáy trang */}
      <div className="absolute bottom-[220px] left-[10%] opacity-[0.04] pointer-events-none -z-10 blur-[0.5px]">
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

