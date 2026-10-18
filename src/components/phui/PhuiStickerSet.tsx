"use client";

import React from "react";

export type StickerVariant =
  | "tra-da"
  | "the-phat"
  | "coi-trong-tai"
  | "sa-ban"
  | "ve-tran-dau"
  | "dong-ho-90"
  | "fair-play"
  | "co-goc"
  | "bong-co-dien"
  | "bong-da-phui"
  | "chong-bung-keo"
  | "giay-dinh-tf";

interface PhuiStickerProps {
  variant: StickerVariant;
  className?: string;
  size?: number; // width in px
  angle?: number; // rotation angle in degrees (-5 to +8)
  opacity?: number;
  interactive?: boolean;
}

export function PhuiSticker({
  variant,
  className = "",
  size = 120,
  angle = 0,
  opacity = 1,
  interactive = true,
}: PhuiStickerProps) {
  const style: React.CSSProperties = {
    width: size,
    transform: `rotate(${angle}deg)`,
    opacity,
    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease",
  };

  const interactiveClasses = interactive
    ? "cursor-pointer hover:scale-110 hover:-rotate-1 active:scale-95 transition-all select-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
    : "select-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]";

  return (
    <div
      style={style}
      className={`inline-block relative filter ${interactiveClasses} ${className}`}
    >
      {renderStickerSvg(variant)}
    </div>
  );
}

function renderStickerSvg(variant: StickerVariant) {
  switch (variant) {
    case "tra-da":
      return <StickerTraDa />;
    case "the-phat":
      return <StickerThePhat />;
    case "coi-trong-tai":
      return <StickerCoiTrongTai />;
    case "sa-ban":
      return <StickerSaBan />;
    case "ve-tran-dau":
      return <StickerVeTranDau />;
    case "dong-ho-90":
      return <StickerDongHo90 />;
    case "fair-play":
      return <StickerFairPlay />;
    case "co-goc":
      return <StickerCoGoc />;
    case "bong-co-dien":
      return <StickerBongCoDien />;
    case "bong-da-phui":
      return <StickerBongDaPhui />;
    case "chong-bung-keo":
      return <StickerChongBungKeo />;
    case "giay-dinh-tf":
      return <StickerGiayDinhTf />;
    default:
      return null;
  }
}

// 1. Cốc Trà Đá Vỉa Hè "TRÀ ĐÁ FC"
export function StickerTraDa() {
  return (
    <svg viewBox="0 0 160 200" fill="none" className="w-full h-auto">
      {/* Outer Die-cut White Border */}
      <filter id="sticker-white-edge-mug" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#ffffff" floodOpacity="0.95" />
      </filter>
      
      <g filter="url(#sticker-white-edge-mug)">
        {/* White Outline Base */}
        <path
          d="M32 50 C32 40 45 36 78 36 C112 36 124 40 124 50 L118 165 C118 178 108 186 78 186 C48 186 38 178 38 165 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Quai Cốc (Handle) */}
        <path
          d="M120 75 C146 75 148 135 118 142"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="11"
          strokeLinecap="round"
        />
        <path
          d="M120 75 C142 75 144 135 118 142"
          fill="none"
          stroke="#bae6fd"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Thân Cốc Thủy Tinh (Glass Body) */}
        <path
          d="M38 52 C38 45 48 42 78 42 C108 42 118 45 118 52 L112 162 C112 172 104 180 78 180 C52 180 44 172 44 162 Z"
          fill="#e0f2fe"
        />

        {/* Nước Trà Đá Xanh Vàng (Iced Tea Fluid) */}
        <path
          d="M40 78 C55 82 100 76 116 78 L111 160 C111 170 102 178 78 178 C54 178 45 170 45 160 Z"
          fill="url(#tra-da-grad)"
        />

        {/* Ống Hút Nâu (Straw) */}
        <path
          d="M102 16 L94 48 L76 130"
          stroke="#d97706"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M100 18 L94 46 L78 128"
          stroke="#fef3c7"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* 2 Viên Đá Lạnh (Ice Cubes) */}
        {/* Cube 1 */}
        <g transform="translate(50, 85) rotate(-10)">
          <rect x="0" y="0" width="26" height="26" rx="5" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M4 6 L12 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* Cube 2 */}
        <g transform="translate(76, 105) rotate(14)">
          <rect x="0" y="0" width="28" height="28" rx="5" fill="#f8fafc" stroke="#38bdf8" strokeWidth="2.5" />
          <path d="M4 6 L14 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Vệt Sáng Thủy Tinh (Reflections) */}
        <path d="M46 60 L49 155" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        <path d="M53 65 L55 145" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.6" />

        {/* Băng Rôn "TRÀ ĐÁ FC" Dưới Cốc */}
        <g transform="translate(14, 150)">
          {/* Ribbon Shadow & White Border */}
          <path
            d="M8 8 L122 8 L130 28 L118 36 L12 36 L2 24 Z"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          {/* Ribbon Face */}
          <path
            d="M10 10 L120 10 L126 27 L116 34 L14 34 L4 24 Z"
            fill="#ea580c"
          />
          {/* Gold Trim */}
          <line x1="14" y1="12" x2="116" y2="12" stroke="#fef08a" strokeWidth="2" />
          <line x1="18" y1="32" x2="112" y2="32" stroke="#fef08a" strokeWidth="2" />
          {/* Text */}
          <text
            x="65"
            y="26"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="14"
            letterSpacing="1"
          >
            ★ TRÀ ĐÁ FC ★
          </text>
        </g>
      </g>

      <defs>
        <linearGradient id="tra-da-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="60%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#4d7c0f" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 2. Thẻ Vàng - Thẻ Đỏ Rút Túi "BÙNG KÈO?"
export function StickerThePhat() {
  return (
    <svg viewBox="0 0 170 170" fill="none" className="w-full h-auto">
      {/* Outer Die-cut White Padding */}
      <g>
        {/* Thẻ Vàng (Nằm Phía Sau, Lệch Phải) */}
        <g transform="translate(68, 14) rotate(18)">
          <rect
            x="0"
            y="0"
            width="64"
            height="96"
            rx="8"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <rect x="2" y="2" width="60" height="92" rx="6" fill="#facc15" />
          <path d="M6 10 L25 10" stroke="#fef9c3" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Thẻ Đỏ (Nằm Phía Trước, Lệch Trái) */}
        <g transform="translate(22, 28) rotate(-6)">
          {/* White border & shadow */}
          <rect
            x="0"
            y="0"
            width="72"
            height="104"
            rx="10"
            fill="#ffffff"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <rect x="2" y="2" width="68" height="100" rx="8" fill="#dc2626" />
          <rect x="5" y="5" width="62" height="94" rx="6" fill="url(#red-card-grad)" />

          {/* Vạch Phản Quang */}
          <path d="M8 12 L30 12" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />

          {/* Typography "BÙNG KÈO?" */}
          <text
            x="36"
            y="46"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="16"
            letterSpacing="0.5"
          >
            BÙNG
          </text>
          <text
            x="36"
            y="70"
            textAnchor="middle"
            fill="#fef08a"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="16"
            letterSpacing="0.5"
          >
            KÈO?
          </text>
          <text
            x="36"
            y="88"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fontSize="9"
          >
            -40Đ UY TÍN
          </text>
        </g>
      </g>

      <defs>
        <linearGradient id="red-card-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 3. Chiếc Còi Đồng / Còi Trọng Tài (Whistle "XOAN")
export function StickerCoiTrongTai() {
  return (
    <svg viewBox="0 0 180 150" fill="none" className="w-full h-auto">
      <g>
        {/* Dây Đeo Còi (Lanyard Loop) */}
        <path
          d="M102 78 C125 105 160 95 162 118 C163 135 125 138 98 128 C80 120 70 115 52 118 C38 120 30 134 46 140 C65 147 115 142 144 135"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M102 78 C125 105 160 95 162 118 C163 135 125 138 98 128 C80 120 70 115 52 118 C38 120 30 134 46 140 C65 147 115 142 144 135"
          stroke="#78350f"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="4 3"
          fill="none"
        />

        {/* Khối Thân Còi Trọng Tài Màu Vàng Đồng */}
        {/* White Border Die-cut */}
        <path
          d="M16 88 L60 48 L100 48 C122 48 138 64 138 86 C138 108 122 124 100 124 C82 124 68 112 64 96 L22 108 C16 110 10 102 12 96 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        {/* Yellow/Gold Gradient Body */}
        <path
          d="M20 90 L62 52 L98 52 C118 52 134 66 134 86 C134 106 118 120 98 120 C82 120 70 110 66 96 L24 104 C19 105 15 100 17 94 Z"
          fill="url(#whistle-gold-grad)"
        />

        {/* Khuyên Treo Dây Còi */}
        <circle cx="100" cy="86" r="14" fill="#fef08a" stroke="#1e293b" strokeWidth="4" />
        <circle cx="100" cy="86" r="6" fill="#1e293b" />

        {/* Khe Thổi Còi (Air Vent) */}
        <rect x="56" y="56" width="10" height="28" rx="3" fill="#1e293b" />
        <rect x="22" y="88" width="8" height="12" rx="2" fill="#78350f" />

        {/* Vệt Sáng Bóng */}
        <path d="M68 62 L94 62" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M112 68 C122 74 126 84 126 92" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" />

        {/* Tia Âm Thanh & Chữ "XOAN" (Tiếng Còi Phủi) */}
        <path d="M42 32 L36 18" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <path d="M54 26 L56 12" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <path d="M68 28 L78 16" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />

        {/* Chữ "TOÉT / XOAN" */}
        <g transform="translate(12, 10)">
          <rect x="0" y="0" width="54" height="20" rx="6" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text
            x="27"
            y="15"
            textAnchor="middle"
            fill="#1e293b"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="12"
            letterSpacing="0.5"
          >
            TOÉT!
          </text>
        </g>
      </g>

      <defs>
        <linearGradient id="whistle-gold-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 4. Bảng Sa Bàn Chiến Thuật "SƠ ĐỒ CHIẾN THUẬT" (3-2-1 / X, O)
export function StickerSaBan() {
  return (
    <svg viewBox="0 0 190 140" fill="none" className="w-full h-auto">
      <g>
        {/* Khung Gỗ Bo Viền Trắng Die-cut */}
        <rect
          x="6"
          y="6"
          width="178"
          height="128"
          rx="12"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
        />
        {/* Gỗ Nâu Bọc Ngoài */}
        <rect x="10" y="10" width="170" height="120" rx="9" fill="#92400e" stroke="#78350f" strokeWidth="3" />

        {/* Mặt Bảng Đen / Xanh Đậm (Green Chalkboard) */}
        <rect x="18" y="18" width="154" height="104" rx="6" fill="#14532d" />

        {/* Tiêu Đề Bảng */}
        <text
          x="95"
          y="32"
          textAnchor="middle"
          fill="#fef08a"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="9.5"
          letterSpacing="0.8"
        >
          SƠ ĐỒ CHIẾN THUẬT 3-2-1
        </text>

        {/* Vạch Kẻ Sân Bóng (White Chalk Lines) */}
        <rect x="26" y="38" width="138" height="76" rx="3" fill="none" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.8" />
        {/* Đường Giữa Sân & Vòng Tròn Trung Tâm */}
        <line x1="95" y1="38" x2="95" y2="114" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.8" />
        <circle cx="95" cy="76" r="14" fill="none" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.8" />
        {/* Vòng Cấm 2 Đầu */}
        <rect x="26" y="52" width="18" height="48" fill="none" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.8" />
        <rect x="146" y="52" width="18" height="48" fill="none" stroke="#86efac" strokeWidth="1.5" strokeOpacity="0.8" />

        {/* Các Điểm Quân Cờ X & O */}
        {/* Thủ môn GK */}
        <circle cx="34" cy="76" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
        {/* Hàng Thủ 3 Người (LB - CB - RB) */}
        <text x="56" y="54" fill="#ffffff" fontWeight="bold" fontSize="9">X</text>
        <text x="52" y="79" fill="#ffffff" fontWeight="bold" fontSize="9">X</text>
        <text x="56" y="104" fill="#ffffff" fontWeight="bold" fontSize="9">X</text>
        {/* 2 Tiền Vệ Trung Tâm (CM) */}
        <text x="78" y="66" fill="#ffffff" fontWeight="bold" fontSize="9">X</text>
        <text x="78" y="92" fill="#ffffff" fontWeight="bold" fontSize="9">X</text>
        {/* Tiền Đạo Cắm (ST) */}
        <text x="115" y="79" fill="#ffffff" fontWeight="bold" fontSize="10">X</text>

        {/* Mũi Tên Tấn Công Phản Công */}
        <path d="M56 50 Q 85 44 135 60" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="3 2" />
        <path d="M116 75 L144 75" fill="none" stroke="#facc15" strokeWidth="2.5" />
        <polygon points="144,72 150,75 144,78" fill="#facc15" />

        {/* Khay Để Phấn Dưới Cùng */}
        <rect x="65" y="117" width="60" height="4" rx="2" fill="#fef08a" />
      </g>
    </svg>
  );
}

// 5. Cuống Vé Xem Trận Đấu Cổ Điển (Ticket Stub "HÀ NỘI")
export function StickerVeTranDau() {
  return (
    <svg viewBox="0 0 190 100" fill="none" className="w-full h-auto">
      <g>
        {/* White Die-cut Border Base */}
        <path
          d="M10 10 L180 10 C180 10 180 34 172 38 C164 42 164 58 172 62 C180 66 180 90 180 90 L10 90 C10 90 10 66 18 62 C26 58 26 42 18 38 C10 34 10 10 10 10 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Ticket Surface (Vintage Parchment / Golden Cream) */}
        <path
          d="M13 13 L177 13 C177 13 177 34 169 38 C161 42 161 58 169 62 C177 66 177 87 177 87 L13 87 C13 87 13 66 21 62 C29 58 29 42 21 38 C13 34 13 13 13 13 Z"
          fill="#fef3c7"
        />

        {/* Đường Răng Cưa Phân Tách Cuống Vé */}
        <line x1="134" y1="13" x2="134" y2="87" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />

        {/* Nội Dung Cuống Vé Trái */}
        <text
          x="74"
          y="30"
          textAnchor="middle"
          fill="#64748b"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="9"
          letterSpacing="1"
        >
          VÉ XEM TRẬN ĐẤU
        </text>

        <text
          x="74"
          y="56"
          textAnchor="middle"
          fill="#0f172a"
          fontFamily="Impact, sans-serif"
          fontSize="24"
          letterSpacing="2"
        >
          HÀ NỘI
        </text>

        <text
          x="74"
          y="74"
          textAnchor="middle"
          fill="#ea580c"
          fontFamily="Arial, sans-serif"
          fontWeight="bold"
          fontSize="10"
        >
          ★ SÂN 7 CỎ NHÂN TẠO ★
        </text>

        {/* Mã Vạch Cuống Vé Phải (Barcode) */}
        <g transform="translate(142, 22)">
          {/* Vertical Barcode lines */}
          <line x1="2" y1="0" x2="2" y2="44" stroke="#0f172a" strokeWidth="2" />
          <line x1="6" y1="0" x2="6" y2="44" stroke="#0f172a" strokeWidth="1" />
          <line x1="9" y1="0" x2="9" y2="44" stroke="#0f172a" strokeWidth="3" />
          <line x1="15" y1="0" x2="15" y2="44" stroke="#0f172a" strokeWidth="1" />
          <line x1="18" y1="0" x2="18" y2="44" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="23" y1="0" x2="23" y2="44" stroke="#0f172a" strokeWidth="1.5" />
          <line x1="27" y1="0" x2="27" y2="44" stroke="#0f172a" strokeWidth="3" />
          <text
            x="15"
            y="54"
            textAnchor="middle"
            fill="#475569"
            fontFamily="monospace"
            fontSize="7"
            fontWeight="bold"
          >
            200K-OTP
          </text>
        </g>
      </g>
    </svg>
  );
}

// 6. Đồng Hồ Bấm Giờ Cơ Học (Stopwatch Digital "90:00")
export function StickerDongHo90() {
  return (
    <svg viewBox="0 0 150 170" fill="none" className="w-full h-auto">
      <g>
        {/* Nút bấm trên cùng (Top Crown & Buttons) */}
        <rect x="65" y="10" width="20" height="14" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="7" />
        <rect x="67" y="12" width="16" height="10" rx="2" fill="#cbd5e1" />

        {/* 2 Nút Phụ Trái / Phải */}
        <g transform="translate(35, 26) rotate(-35)">
          <rect x="0" y="0" width="14" height="10" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="4" />
        </g>
        <g transform="translate(105, 18) rotate(35)">
          <rect x="0" y="0" width="14" height="10" rx="2" fill="#cbd5e1" stroke="#1e293b" strokeWidth="4" />
        </g>

        {/* Thân Đồng Hồ Tròn (Metallic Circular Shell) */}
        <circle cx="75" cy="95" r="58" fill="#ffffff" stroke="#1e293b" strokeWidth="8" />
        <circle cx="75" cy="95" r="53" fill="url(#stopwatch-shell-grad)" stroke="#64748b" strokeWidth="3" />

        {/* Mặt Đồng Hồ Điện Tử (Digital Display Screen) */}
        <rect x="36" y="68" width="78" height="42" rx="8" fill="#020617" stroke="#334155" strokeWidth="2.5" />

        {/* Số Điện Tử Màu Đỏ LED "90:00" */}
        <text
          x="75"
          y="98"
          textAnchor="middle"
          fill="#ef4444"
          fontFamily="'Courier New', monospace"
          fontWeight="900"
          fontSize="24"
          letterSpacing="1"
          style={{ textShadow: "0 0 8px rgba(239,68,68,0.8)" }}
        >
          90:00
        </text>

        {/* Nhãn Phút Hiệp 2 */}
        <text
          x="75"
          y="124"
          textAnchor="middle"
          fill="#334155"
          fontFamily="Arial, sans-serif"
          fontWeight="900"
          fontSize="9"
          letterSpacing="1"
        >
          MATCH TIME
        </text>

        {/* Cán Cầm Dưới Cùng (Neck Handle) */}
        <path d="M70 148 L70 162 C70 165 80 165 80 162 L80 148 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="4" />
      </g>

      <defs>
        <linearGradient id="stopwatch-shell-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 7. Huy Hiệu Ngôi Sao Uy Tín (Golden Badge "FAIR PLAY 100/100")
export function StickerFairPlay() {
  return (
    <svg viewBox="0 0 160 180" fill="none" className="w-full h-auto">
      <g>
        {/* Khiên Vàng (Golden Shield) With White Die-cut Border */}
        <path
          d="M80 14 C120 14 146 22 146 54 C146 112 108 146 80 164 C52 146 14 112 14 54 C14 22 40 14 80 14 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* Shield Body Face */}
        <path
          d="M80 20 C116 20 138 27 138 56 C138 106 104 138 80 154 C56 138 22 106 22 56 C22 27 44 20 80 20 Z"
          fill="url(#gold-shield-grad)"
        />

        {/* Lớp Viền Trong Điểm Sao */}
        <path
          d="M80 28 C110 28 128 34 128 58 C128 98 98 126 80 140 C62 126 32 98 32 58 C32 34 50 28 80 28 Z"
          fill="none"
          stroke="#ca8a04"
          strokeWidth="2.5"
          strokeDasharray="4 3"
        />

        {/* Chữ "FAIR PLAY" */}
        <text
          x="80"
          y="52"
          textAnchor="middle"
          fill="#1e293b"
          fontFamily="Impact, Arial, sans-serif"
          fontWeight="900"
          fontSize="18"
          letterSpacing="1"
        >
          FAIR PLAY
        </text>

        {/* Biểu Tượng Chiếc Cúp Vàng Nhỏ */}
        <g transform="translate(62, 60)">
          {/* Cúp Vàng */}
          <path d="M6 4 L30 4 L28 18 C28 26 22 30 18 30 C14 30 8 26 8 18 Z" fill="#fef08a" stroke="#78350f" strokeWidth="2" />
          {/* 2 Quai Cúp */}
          <path d="M6 8 C0 8 0 16 6 18" stroke="#78350f" strokeWidth="2" fill="none" />
          <path d="M30 8 C36 8 36 16 30 18" stroke="#78350f" strokeWidth="2" fill="none" />
          {/* Đế Cúp */}
          <path d="M18 30 L18 36 M12 36 L24 36" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Ngôi sao trên cúp */}
          <polygon points="18,10 20,15 25,15 21,18 23,23 18,20 13,23 15,18 11,15 16,15" fill="#f59e0b" />
        </g>

        {/* 3 Ngôi Sao Điểm Nhấn */}
        <polygon points="44,78 46,82 50,82 47,85 48,89 44,86 40,89 41,85 38,82 42,82" fill="#ca8a04" />
        <polygon points="116,78 118,82 122,82 119,85 120,89 116,86 112,89 113,85 110,82 114,82" fill="#ca8a04" />

        {/* Dải Băng Dưới: UY TÍN 100/100 */}
        <g transform="translate(20, 120)">
          <rect x="0" y="0" width="120" height="22" rx="7" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
          <text
            x="60"
            y="15"
            textAnchor="middle"
            fill="#1e293b"
            fontFamily="Arial, sans-serif"
            fontWeight="900"
            fontSize="10"
            letterSpacing="0.5"
          >
            ★ UY TÍN 100/100 ★
          </text>
        </g>
      </g>

      <defs>
        <linearGradient id="gold-shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 8. Cờ Góc Sân Cỏ Nhân Tạo (Corner Flag on Grass Patch)
export function StickerCoGoc() {
  return (
    <svg viewBox="0 0 160 170" fill="none" className="w-full h-auto">
      <g>
        {/* Mảng Cỏ Xanh Góc Sân (Grass Patch) */}
        <ellipse cx="65" cy="145" rx="55" ry="18" fill="#ffffff" stroke="#1e293b" strokeWidth="7" />
        <ellipse cx="65" cy="145" rx="50" ry="14" fill="#22c55e" />
        {/* Vòng Cung Góc Sân (Corner Arc Line) */}
        <path d="M30 148 C50 135 85 135 105 148" stroke="#ffffff" strokeWidth="4" fill="none" />

        {/* Cột Cờ Trắng Tròn */}
        <line x1="60" y1="30" x2="60" y2="145" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
        <line x1="60" y1="30" x2="60" y2="145" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
        {/* Vòng Khuyên Đỉnh Cột */}
        <circle cx="60" cy="28" r="6" fill="#facc15" stroke="#1e293b" strokeWidth="3" />

        {/* Lá Cờ Đỏ Tung Bay (Red Flag Fluttering) */}
        {/* White Border Die-cut */}
        <path
          d="M60 30 C88 20 102 44 140 32 L136 78 C102 88 88 64 60 76 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinejoin="round"
        />
        {/* Red Flag Cloth */}
        <path
          d="M60 33 C86 24 100 46 135 35 L132 75 C100 84 86 62 60 73 Z"
          fill="#ef4444"
        />
        {/* Shadow/Waving crease */}
        <path d="M96 28 C96 50 90 65 92 80" stroke="#b91c1c" strokeWidth="3" fill="none" opacity="0.6" />
      </g>
    </svg>
  );
}

// 9. Quả Bóng Da Cổ Điển ("BẮT KÈO 7" / Classic Leather Football)
export function StickerBongCoDien() {
  return (
    <svg viewBox="0 0 160 160" fill="none" className="w-full h-auto">
      <g>
        {/* White Die-cut Border Base */}
        <circle cx="80" cy="80" r="70" fill="#ffffff" stroke="#1e293b" strokeWidth="8" />

        {/* Classic Brown Leather Ball */}
        <circle cx="80" cy="80" r="65" fill="url(#leather-ball-grad)" />

        {/* Leather Stitched Panels (Múi da bóng đá cổ điển) */}
        <path d="M30 45 C50 65 110 65 130 45" stroke="#451a03" strokeWidth="3" fill="none" />
        <path d="M20 80 C50 75 110 75 140 80" stroke="#451a03" strokeWidth="3" fill="none" />
        <path d="M30 115 C50 95 110 95 130 115" stroke="#451a03" strokeWidth="3" fill="none" />
        <line x1="80" y1="15" x2="80" y2="145" stroke="#451a03" strokeWidth="3" />
        <line x1="50" y1="25" x2="50" y2="135" stroke="#451a03" strokeWidth="2.5" />
        <line x1="110" y1="25" x2="110" y2="135" stroke="#451a03" strokeWidth="2.5" />

        {/* Chữ BẮT KÈO / GIAO HỮU In Đậm */}
        <g transform="translate(80, 68)">
          <rect x="-48" y="-18" width="96" height="36" rx="10" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
          <text
            x="0"
            y="7"
            textAnchor="middle"
            fill="#1e293b"
            fontFamily="Impact, Arial, sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="1"
          >
            BẮT KÈO
          </text>
        </g>

        {/* Chữ số 7 Đỏ Viền Trắng */}
        <g transform="translate(80, 114)">
          <text
            x="0"
            y="12"
            textAnchor="middle"
            fill="#ef4444"
            fontFamily="Impact, Arial, sans-serif"
            fontWeight="900"
            fontSize="34"
            stroke="#ffffff"
            strokeWidth="3"
            style={{ paintOrder: "stroke fill" }}
          >
            7
          </text>
        </g>
      </g>

      <defs>
        <linearGradient id="leather-ball-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="60%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// 10. Typography "BÓNG ĐÁ PHỦI"
export function StickerBongDaPhui() {
  return (
    <svg viewBox="0 0 200 110" fill="none" className="w-full h-auto">
      <g>
        {/* White Border Die-cut Bubble */}
        <path
          d="M14 26 C14 14 28 6 50 6 L150 6 C176 6 188 14 188 28 L188 78 C188 94 172 102 148 102 L48 102 C22 102 14 92 14 78 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Row 1: BÓNG ĐÁ */}
        <g transform="translate(24, 44)">
          <text
            x="76"
            y="0"
            textAnchor="middle"
            fill="#16a34a"
            fontFamily="Impact, Arial, sans-serif"
            fontWeight="900"
            fontSize="32"
            letterSpacing="1"
            stroke="#14532d"
            strokeWidth="2"
          >
            BÓNG ĐÁ
          </text>
        </g>

        {/* Row 2: PHỦI */}
        <g transform="translate(24, 88)">
          <text
            x="76"
            y="0"
            textAnchor="middle"
            fill="#ea580c"
            fontFamily="Impact, Arial, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="2"
            stroke="#7c2d12"
            strokeWidth="2.5"
          >
            PHỦI
          </text>
        </g>
      </g>
    </svg>
  );
}

// 11. Băng Rôn Cảnh Báo "CHỐNG BÙNG KÈO"
export function StickerChongBungKeo() {
  return (
    <svg viewBox="0 0 260 70" fill="none" className="w-full h-auto">
      <g>
        {/* Outer White Die-cut Border */}
        <rect
          x="6"
          y="6"
          width="248"
          height="58"
          rx="12"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
        />

        {/* Hazard Stripes Background (Vàng & Đen) */}
        <g clipPath="url(#hazard-clip)">
          <rect x="10" y="10" width="240" height="50" rx="9" fill="#facc15" />
          {[...Array(14)].map((_, i) => (
            <polygon
              key={i}
              points={`${i * 24 - 10},10 ${i * 24 + 4},10 ${i * 24 - 12},60 ${i * 24 - 26},60`}
              fill="#1e293b"
            />
          ))}
        </g>

        {/* Center Plaque (Bảng Chữ Ở Giữa) */}
        <rect x="28" y="15" width="204" height="40" rx="8" fill="#fef08a" stroke="#1e293b" strokeWidth="3" />
        <text
          x="130"
          y="42"
          textAnchor="middle"
          fill="#0f172a"
          fontFamily="Impact, Arial, sans-serif"
          fontWeight="900"
          fontSize="22"
          letterSpacing="1.5"
        >
          CHỐNG BÙNG KÈO
        </text>
      </g>

      <defs>
        <clipPath id="hazard-clip">
          <rect x="10" y="10" width="240" height="50" rx="9" />
        </clipPath>
      </defs>
    </svg>
  );
}

// 12. Đôi Giày Đinh Dăm TF Bám Cỏ (Turf Soccer Boot)
export function StickerGiayDinhTf() {
  return (
    <svg viewBox="0 0 160 110" fill="none" className="w-full h-auto">
      <g>
        {/* Outer White Die-cut Border */}
        <path
          d="M12 70 C16 48 35 35 60 38 L95 44 C110 40 125 45 142 62 C152 72 148 85 132 88 L22 88 C14 88 10 80 12 70 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="7"
          strokeLinejoin="round"
        />

        {/* Thân Giày Thể Thao Màu Xanh Cyan/Neon */}
        <path
          d="M16 68 C20 50 38 40 62 42 L96 48 C110 44 124 48 138 64 C146 72 144 82 130 84 L24 84 C18 84 14 78 16 68 Z"
          fill="#0284c7"
        />

        {/* Vệt Sọc Thể Thao Màu Vàng Chanh */}
        <path d="M45 46 Q 70 65 115 58" stroke="#facc15" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M52 56 Q 74 72 118 67" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Dây Giày (Shoelaces) */}
        <line x1="68" y1="44" x2="64" y2="52" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="78" y1="46" x2="74" y2="54" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="88" y1="48" x2="84" y2="56" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

        {/* Đế Đinh Dăm TF (Turf Studs Rubber Sole) */}
        <rect x="22" y="84" width="112" height="8" rx="2" fill="#1e293b" />
        {[...Array(9)].map((_, i) => (
          <circle key={i} cx={28 + i * 12} cy="95" r="2.5" fill="#facc15" stroke="#1e293b" strokeWidth="1" />
        ))}
      </g>
    </svg>
  );
}
