"use client";

import React from "react";
import { Flame } from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SosAlertCard } from "@/components/matchmaking/SosAlertCard";
import { PhuiSticker } from "@/components/phui";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";

interface SosWorkspaceProps {
  sosMatches: MatchFeedItem[];
  currentTeamName?: string;
  onSelectMatch: (match: MatchFeedItem) => void;
  onEditMatch: (match: MatchFeedItem) => void;
  onDeleteMatch: (matchId: string) => void;
  onOpenCreateSos: () => void;
}

export const SosWorkspace: React.FC<SosWorkspaceProps> = ({
  sosMatches,
  currentTeamName,
  onSelectMatch,
  onEditMatch,
  onDeleteMatch,
  onOpenCreateSos,
}) => {
  return (
    <div className="space-y-4">
      <div className="card-retro-paper relative rounded-3xl border-2 border-red-300 p-4 sm:p-5 shadow-lg overflow-hidden">
        <div className="washi-tape -top-2.5 left-8 rotate-[-2deg]" />
        <div className="washi-tape -top-2.5 right-8 rotate-[3deg]" />

        {/* Dải ruy băng sọc cứu hộ khẩn cấp retro */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#fbbf24_10px,#fbbf24_20px)]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 pt-1">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-[10px] font-black text-red-700 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                TRẠM CỨU HỘ KÈO PHÚT CHÓT
              </span>
              <span className="rubber-stamp text-[9px] py-0.5 px-2 border-red-700 text-red-800">
                HỎA TỐC &lt; 1H
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-600 fill-current animate-bounce" />
              <span>TRẠM CỨU HỘ KÈO PHÚT CHÓT HÀ NỘI</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              Cứu kèo giúp sân không bị bỏ trống • Thưởng +8 điểm tín nhiệm &amp;
              Bảo chứng an toàn 100%
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            <PhuiSticker
              variant="the-phat"
              size={70}
              angle={6}
              className="hidden sm:inline-block shrink-0"
            />
            <button
              type="button"
              onClick={onOpenCreateSos}
              className="ticket-stub px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>Phát Tín Hiệu SOS</span>
            </button>
          </div>
        </div>
      </div>

      {sosMatches.length > 0 ? (
        <div className="space-y-3.5">
          {sosMatches.map((sos) => {
            const isOwner =
              Boolean(sos.isCreatedByCurrentUser) ||
              (Boolean(currentTeamName) &&
                sos.hostTeam.name === currentTeamName);
            return (
              <SosAlertCard
                key={sos.id}
                match={sos}
                isOwner={isOwner}
                onSelectMatch={onSelectMatch}
                onEditMatch={onEditMatch}
                onDeleteMatch={onDeleteMatch}
              />
            );
          })}
        </div>
      ) : (
        <div className="card-retro-paper rounded-3xl border border-stone-300 p-6 sm:p-8 text-center space-y-4 text-xs text-stone-600 shadow-md relative overflow-hidden">
          <div className="washi-tape -top-2 left-1/2 -translate-x-1/2" />

          {/* 📰 DẢI BÁO RÁCH KÈO GAY CẤN TỐI NAY */}
          <div className="max-w-md mx-auto mb-2">
            <VintageScrapbookAsset
              asset="torn-banner"
              tape="both"
              className="w-full"
            />
          </div>

          <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mx-auto text-xl shadow-inner">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <p className="font-bold text-stone-900 text-sm">
            Hiện tại không có kèo SOS nào cần cứu hộ.
          </p>
          <p className="text-stone-600 max-w-sm mx-auto">
            Đội bạn đang bị đối thủ bùng kèo hoặc thiếu đối phút chót? Phát tín
            hiệu để các đội quanh khu vực hỗ trợ ngay!
          </p>

          {/* CUỐNG VÉ BẢO CHỨNG */}
          <div className="max-w-xs mx-auto">
            <VintageScrapbookAsset
              asset="ticket-stub"
              tape="left"
              tilt={-1}
              className="w-full"
              caption="Bảo chứng cọc 200k chống bùng"
            />
          </div>

          <button
            type="button"
            onClick={onOpenCreateSos}
            className="ticket-stub inline-flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Phát Tín Hiệu Cứu Kèo Khẩn Cấp Ngay</span>
          </button>
        </div>
      )}
    </div>
  );
};
