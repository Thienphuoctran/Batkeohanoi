import React from "react";
import PitchMapSection from "@/components/pitch/PitchMapSection";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bản Đồ Cụm Sân 7 & Tiện Ích Kèo Đệ Tam Hà Nội | BắtKèo7",
  description:
    "Định vị các cụm sân 7 Hà Nội, chủ kèo ghim vị trí Google Maps 1-chạm và cẩm nang quán bia hơi, lẩu bình dân quanh sân dưới 500m.",
};

export default function PitchMapPage() {
  return (
    <main className="min-h-screen bg-[#070b14] text-slate-100 py-4 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Bảng Tin Ghép Trận</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500">
            batkeo7.vn/ban-do
          </span>
        </div>

        {/* Pitch Map Section */}
        <PitchMapSection />
      </div>
    </main>
  );
}
