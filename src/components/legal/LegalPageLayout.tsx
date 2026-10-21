"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, Cookie, RefreshCw, Scale } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  effectiveDate?: string;
  activePath: "/privacy" | "/terms" | "/cookies" | "/refund";
  children: React.ReactNode;
}

const LEGAL_NAV_ITEMS = [
  { href: "/terms", label: "Điều Khoản Sử Dụng", icon: Scale },
  { href: "/privacy", label: "Chính Sách Bảo Mật", icon: Shield },
  { href: "/cookies", label: "Chính Sách Cookie", icon: Cookie },
  { href: "/refund", label: "Quy Chế Hoàn Cọc & Ví", icon: RefreshCw },
];

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  effectiveDate = "01/01/2026",
  activePath,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#f7f4ec] text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Header Thanh Điều Hướng */}
      <header className="sticky top-0 z-40 bg-[#ede8dc]/95 backdrop-blur-md border-b-2 border-stone-800/80 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-stone-800 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Sàn GiaoHuu.VN</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-stone-600">
              Văn bản pháp lý chính thức
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Banner tiêu đề trang */}
        <div className="card-retro-paper bg-[#fbf9f4] border-2 border-stone-800 rounded-3xl p-6 sm:p-8 shadow-paper mb-8 relative overflow-hidden">
          <div className="washi-tape -top-2 left-10 rotate-[-1.5deg]" />
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-800 mb-2">
            <FileText className="w-4 h-4" />
            <span>Hệ Thống Pháp Lý Nền Tảng GiaoHuu.VN</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
          <div className="mt-4 pt-3 border-t border-stone-300 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 font-mono">
            <span>Phiên bản: 2.0 (Cập nhật 2026)</span>
            <span>Hiệu lực áp dụng: {effectiveDate}</span>
          </div>
        </div>

        {/* Thanh chuyển đổi nhanh 4 trang pháp lý */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {LEGAL_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn-paper-tactile flex items-center justify-center gap-2 p-3 rounded-2xl text-xs font-black transition-all border ${
                  isActive
                    ? "bg-stone-900 text-amber-300 border-stone-900 shadow-xs"
                    : "bg-[#ede8dc] text-stone-700 hover:text-stone-950 border-stone-300 hover:bg-stone-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Nội dung chi tiết văn bản pháp lý */}
        <article className="card-retro-paper bg-[#fbf9f4] border border-stone-300 rounded-3xl p-6 sm:p-10 shadow-paper space-y-8 text-stone-800 text-sm leading-relaxed">
          {children}
        </article>

        {/* Footer liên hệ pháp lý */}
        <div className="mt-8 text-center text-xs text-stone-500 space-y-2">
          <p>
            Mọi ý kiến đóng góp hoặc thắc mắc liên quan đến pháp lý &amp; quyền riêng tư, vui lòng liên hệ:
          </p>
          <p className="font-mono font-bold text-stone-800">
            Email: <span className="underline">phuocct998@gmail.com</span> | Hotline: 0988.666.888
          </p>
          <p className="text-[11px] text-stone-400">
            © 2026 GiaoHuu.VN — Nền tảng kết nối thể thao bóng đá phủi văn minh. Bảo lưu mọi quyền.
          </p>
        </div>
      </main>
    </div>
  );
};
