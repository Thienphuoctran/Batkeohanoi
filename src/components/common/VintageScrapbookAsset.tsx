"use client";

import React, { useState } from "react";

export type ScrapbookAssetType =
  | "newspaper-headline"   // ASSET 01: Tờ báo nếp gấp "BẢN TIN BÓNG ĐÁ PHỦI GIAOHUU.VN" + ảnh đen trắng
  | "torn-banner"          // ASSET 02: Dải báo rách "KÈO GAY CẤN TỐI NAY MƯA PHÙN KHÔNG CẢN ĐƯỢC ĐAM MÊ"
  | "polaroid-trophy"      // ASSET 06: Polaroid "Kỷ niệm sau trận" nâng cúp
  | "polaroid-fairplay"    // ASSET 05: Polaroid "CHƠI ĐẸP - FAIR PLAY" bắt tay
  | "tea-tactics"          // ASSET 04: "UỐNG TRÀ ĐÁ - BÀN CHIẾN THUẬT" + hình minh họa
  | "tactical-board"       // ASSET 07: Sa bàn chiến thuật 3-2-1 trên giấy kẻ ô
  | "notebook-tackle"      // ASSET 08: Sổ tay "Chiến hết mình!" tranh chấp bóng
  | "ticket-stub"          // ASSET 09: Cuống vé "VÉ ĐÁ BÓNG GIAO HỮU - CỌC BẢO ĐẢM"
  | "trophy-badge"         // ASSET 10: Cúp vàng vô địch + tem HÀ NỘI PHỦI
  | "stamp-chong-bung";    // ASSET 06: Dấu mộc đỏ "CHỐNG BÙNG KÈO 100%"

interface VintageScrapbookAssetProps {
  asset: ScrapbookAssetType;
  className?: string;
  tape?: "left" | "right" | "both" | "none";
  tilt?: number; // Góc nghiêng deg (-5 đến 5)
  caption?: string;
  onClick?: () => void;
}

// Bảng tọa độ cắt (CSS Background Clip coordinates) chính xác từng milimet từ ảnh gốc người dùng
const ASSET_SPECS: Record<
  ScrapbookAssetType,
  {
    bgSize: string;
    bgPos: string;
    aspectRatio: string;
    title: string;
    alt: string;
  }
> = {
  "newspaper-headline": {
    // Tờ báo lớn góc trên bên trái: "BẢN TIN BÓNG ĐÁ PHỦI GIAOHUU.VN"
    bgSize: "220%",
    bgPos: "0% 0%",
    aspectRatio: "4 / 3.4",
    title: "Bản Tin Bóng Đá Phủi GiaoHuu.vn",
    alt: "Tờ báo nếp gấp Bản tin bóng đá phủi GiaoHuu.vn",
  },
  "torn-banner": {
    // Dải báo rách ngang phía trên: "KÈO GAY CẤN TỐI NAY MƯA PHÙN KHÔNG CẢN ĐƯỢC ĐAM MÊ"
    bgSize: "375%",
    bgPos: "61.5% 4.8%",
    aspectRatio: "2.1 / 1",
    title: "Kèo Gay Cấn Tối Nay Mưa Phùn Không Cản Được Đam Mê",
    alt: "Dải báo rách Kèo gay cấn tối nay",
  },
  "polaroid-trophy": {
    // Polaroid trên bên phải: "Kỷ niệm sau trận"
    bgSize: "410%",
    bgPos: "96% 7%",
    aspectRatio: "1 / 1.15",
    title: "Kỷ Niệm Sau Trận - Nâng Cúp",
    alt: "Ảnh Polaroid kỷ niệm sau trận nâng cúp",
  },
  "polaroid-fairplay": {
    // Polaroid giữa bên phải: "CHƠI ĐẸP - FAIR PLAY"
    bgSize: "390%",
    bgPos: "96% 54%",
    aspectRatio: "1 / 1.15",
    title: "Chơi Đẹp - Fair Play",
    alt: "Ảnh Polaroid hai đội trưởng bắt tay hữu nghị",
  },
  "tea-tactics": {
    // Thẻ tư liệu ở giữa: "UỐNG TRÀ ĐÁ - BÀN CHIẾN THUẬT"
    bgSize: "440%",
    bgPos: "62% 48%",
    aspectRatio: "1 / 1.4",
    title: "Uống Trà Đá - Bàn Chiến Thuật",
    alt: "Văn hóa trà đá bàn chiến thuật bóng đá phủi",
  },
  "tactical-board": {
    // Sơ đồ chiến thuật 3-2-1 trên giấy kẻ ô
    bgSize: "440%",
    bgPos: "39% 65%",
    aspectRatio: "1.1 / 1",
    title: "Sa Bàn Chiến Thuật 3-2-1 Phủi",
    alt: "Sơ đồ sa bàn 3-2-1 trên giấy kẻ ô",
  },
  "notebook-tackle": {
    // Sổ tay kẻ ô góc dưới trái: "Chiến hết mình!"
    bgSize: "350%",
    bgPos: "8% 85%",
    aspectRatio: "1 / 1.2",
    title: "Chiến Hết Mình! Tranh Chấp Sân 7",
    alt: "Phác họa tranh chấp bóng trên sổ tay phủi",
  },
  "ticket-stub": {
    // Cuống vé cọc 200k có mã vạch
    bgSize: "395%",
    bgPos: "59% 89.5%",
    aspectRatio: "2.05 / 1",
    title: "Vé Đá Bóng Giao Hữu - Cọc Bảo Đảm",
    alt: "Cuống vé giao hữu có mã vạch bảo chứng 200k",
  },
  "trophy-badge": {
    // Cúp vàng + tem HÀ NỘI PHỦI
    bgSize: "370%",
    bgPos: "95% 88%",
    aspectRatio: "1.5 / 1",
    title: "Cúp Vô Địch & Tem Hà Nội Phủi",
    alt: "Cúp vàng và tem chứng nhận phủi Hà Nội",
  },
  "stamp-chong-bung": {
    // Dấu mộc đỏ tròn "CHỐNG BÙNG KÈO"
    bgSize: "580%",
    bgPos: "36% 89%",
    aspectRatio: "1 / 1",
    title: "Dấu Mộc Chống Bùng Kèo 100%",
    alt: "Dấu mộc đỏ chống bùng kèo uy tín",
  },
};

export function VintageScrapbookAsset({
  asset,
  className = "",
  tape = "none",
  tilt = 0,
  caption,
  onClick,
}: VintageScrapbookAssetProps) {
  const [imgSrc, setImgSrc] = useState<string>("/images/vintage-scrapbook.jpg");
  const [hasError, setHasError] = useState(false);

  const spec = ASSET_SPECS[asset] || ASSET_SPECS["newspaper-headline"];

  const handleFallback = () => {
    if (imgSrc === "/images/vintage-scrapbook.jpg") {
      // Thử endpoint API nếu file tĩnh chưa sẵn sàng
      setImgSrc("/api/vintage-image");
    } else {
      setHasError(true);
    }
  };

  const transformStyle = tilt ? `rotate(${tilt}deg)` : undefined;

  return (
    <div
      onClick={onClick}
      style={{ transform: transformStyle }}
      className={`relative inline-block transition-transform duration-300 hover:scale-[1.02] select-none ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Washi Tape Băng Keo Dán Góc Retro */}
      {(tape === "left" || tape === "both") && (
        <div
          className="washi-tape -top-2 left-3 rotate-[-4deg] z-20 pointer-events-none"
          aria-hidden="true"
        />
      )}
      {(tape === "right" || tape === "both") && (
        <div
          className="washi-tape -top-2 right-3 rotate-[3deg] z-20 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Khung Chứa Ảnh Cắt Trích Xuất Từ Ảnh Gốc Của Người Dùng */}
      <div
        className="relative overflow-hidden rounded-xl border border-stone-300/90 shadow-md bg-[#f4f0e6]"
        style={{ aspectRatio: spec.aspectRatio }}
      >
        {!hasError ? (
          <div
            className="w-full h-full bg-no-repeat filter contrast-[1.06] sepia-[0.08]"
            style={{
              backgroundImage: `url(${imgSrc})`,
              backgroundSize: spec.bgSize,
              backgroundPosition: spec.bgPos,
            }}
            title={spec.title}
            aria-label={spec.alt}
          >
            {/* Hidden image element to detect network error and trigger fallback */}
            <img
              src={imgSrc}
              alt={spec.alt}
              className="hidden"
              onError={handleFallback}
            />
          </div>
        ) : (
          /* Fallback Vintage Paper Typography nếu trình duyệt chặn ảnh */
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#ede8dc] text-stone-800">
            <span className="text-xl mb-1">📰</span>
            <span className="text-[10px] font-black uppercase tracking-tight">
              {spec.title}
            </span>
            <span className="text-[9px] text-stone-500 font-mono mt-0.5">
              GiaoHuu.vn Sân 7 Hà Nội
            </span>
          </div>
        )}
      </div>

      {/* Chú Thích Bút Chì Dưới Ảnh (Vintage Handwriting Caption) */}
      {caption && (
        <p className="text-[10px] font-bold text-stone-700 text-center mt-1.5 italic tracking-tight font-serif">
          “{caption}”
        </p>
      )}
    </div>
  );
}
