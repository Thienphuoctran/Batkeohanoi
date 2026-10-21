"use client";

import React from "react";
import Link from "next/link";
import {
  Scale,
  BookOpen,
  Lock,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface LegalFooterProps {
  onOpenRules: () => void;
  onOpenGuide: () => void;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({
  onOpenRules,
  onOpenGuide,
}) => {
  return (
    <footer className="mt-14 pb-10 border-t-2 border-stone-800/70 pt-8 text-stone-700 space-y-6">
      {/* 1. Phần Đầu: Logo & Khẩu hiệu */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-stone-300/80 pb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-[#15803d] text-white font-black text-xs flex items-center justify-center shadow-xs border border-emerald-700">
            7v7
          </span>
          <div className="text-left">
            <span className="font-headline font-black text-stone-900 text-base tracking-tight block">
              GiaoHuu<span className="text-[#15803d]">.vn</span>
            </span>
            <span className="text-[10px] text-stone-500 font-mono block">
              Sàn Kết Nối Đối Sân 7 &amp; Bảo Chứng Bắt Kèo Thủ Đô
            </span>
          </div>
        </div>

        {/* Huy Hiệu Tuân Thủ Pháp Lý & An Toàn Số */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Mã Hóa SSL / TLS 256-Bit</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
            <span>Tuân Thủ Nghị Định 13/2023/NĐ-CP</span>
          </span>
        </div>
      </div>

      {/* 2. Phần Giữa: Thông tin đơn vị vận hành & Liên hệ (Chuẩn Nghị định TMĐT 52/2013 & 85/2021) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600 text-left">
        {/* Cột 1: Thông tin chủ thể vận hành */}
        <div className="space-y-1.5">
          <span className="font-headline font-black text-stone-900 text-xs uppercase tracking-wider block flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-stone-700" />
            <span>Đơn Vị Vận Hành Nền Tảng</span>
          </span>
          <p className="font-bold text-stone-800">
            Ban Quản Trị Thể Thao Phong Trào GiaoHuu.VN
          </p>
          <p>
            <strong>Đại diện phụ trách nội dung:</strong> Trần Quốc Thiên Phước
          </p>
          <p>
            <strong>Địa chỉ liên hệ:</strong> Cụm sân Cầu Giấy &amp; Nam Từ Liêm, TP. Hà Nội
          </p>
          <p className="text-[11px] text-stone-500 italic">
            * Đang hoàn tất hồ sơ Thông báo Website TMĐT với Bộ Công Thương theo NĐ 52/2013/NĐ-CP.
          </p>
        </div>

        {/* Cột 2: Hotline & Hỗ trợ kỹ thuật */}
        <div className="space-y-1.5">
          <span className="font-headline font-black text-stone-900 text-xs uppercase tracking-wider block flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-stone-700" />
            <span>Kênh Tiếp Nhận &amp; Kháng Cáo</span>
          </span>
          <p className="flex items-center gap-1.5">
            <strong>Hotline / Zalo BQT:</strong>{" "}
            <a
              href="https://zalo.me/0393407855"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono font-bold text-emerald-800 hover:underline"
            >
              0393.407.855
            </a>
          </p>
          <p className="flex items-center gap-1.5">
            <strong>Email bảo mật &amp; Xóa data:</strong>{" "}
            <a
              href="mailto:phuocct998@gmail.com"
              className="font-mono text-stone-800 hover:underline"
            >
              phuocct998@gmail.com
            </a>
          </p>
          <p className="flex items-center gap-1.5 text-stone-500">
            <Clock className="w-3 h-3" />
            <span>Thời gian hỗ trợ: 07:00 – 22:00 hàng ngày</span>
          </p>
        </div>

        {/* Cột 3: Tuyên bố miễn trừ thể thao */}
        <div className="space-y-1.5 p-3 rounded-2xl bg-[#ede8dc] border border-stone-300 text-[11px] leading-relaxed">
          <span className="font-headline font-black text-amber-900 uppercase tracking-wide block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>Miễn Trừ Trách Nhiệm Thể Thao</span>
          </span>
          <p className="text-stone-700">
            GiaoHuu.VN là nền tảng trung gian công nghệ hỗ trợ kết nối thông tin giữa các đội bóng. Người tham gia tự chịu trách nhiệm về an toàn thân thể, thể lực cá nhân và tuân thủ luật bóng đá sân 7 văn minh.
          </p>
        </div>
      </div>

      {/* 3. Phần Cuối: Menu Pháp Lý & Bản Quyền */}
      <div className="pt-4 border-t border-stone-300/80 space-y-3 text-center">
        {/* Dòng 1: Tính năng hướng dẫn */}
        <div className="flex items-center justify-center gap-3 text-xs text-stone-700 flex-wrap">
          <button
            type="button"
            onClick={onOpenRules}
            className="text-stone-800 hover:text-red-700 transition-colors inline-flex items-center gap-1 font-bold"
          >
            <Scale className="w-3.5 h-3.5 text-amber-700" />
            <span>Bảng Nội Quy &amp; Kỷ Luật Sân Phủi</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-stone-800 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 font-bold"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <span>Hướng Dẫn Sử Dụng Sàn</span>
          </button>
          <span>•</span>
          <span>Bảo Chứng VietQR Napas247</span>
          <span>•</span>
          <Link
            href="/admin"
            className="text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1 opacity-70 hover:opacity-100 font-medium"
            title="Quản trị hệ thống (Khóa PIN)"
          >
            <Lock className="w-3 h-3" />
            <span>Quản trị Hub</span>
          </Link>
        </div>

        {/* Dòng 2: 4 Văn bản pháp lý độc lập */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-stone-600 flex-wrap">
          <Link
            href="/terms"
            className="text-stone-700 hover:text-stone-950 font-semibold hover:underline"
          >
            Điều khoản dịch vụ
          </Link>
          <span>•</span>
          <Link
            href="/privacy"
            className="text-stone-700 hover:text-stone-950 font-semibold hover:underline"
          >
            Chính sách bảo mật (NĐ 13)
          </Link>
          <span>•</span>
          <Link
            href="/cookies"
            className="text-stone-700 hover:text-stone-950 font-semibold hover:underline"
          >
            Chính sách Cookie
          </Link>
          <span>•</span>
          <Link
            href="/refund"
            className="text-stone-700 hover:text-stone-950 font-semibold hover:underline"
          >
            Quy chế hoàn cọc &amp; Ví
          </Link>
        </div>

        <p className="text-[11px] text-stone-500 font-mono">
          © 2026 GiaoHuu.VN — Nền tảng kết nối giao hữu bóng đá phủi Thủ đô. Mọi quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
};
