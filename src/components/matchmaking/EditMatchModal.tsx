"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Flame,
  MapPin,
  Clock,
  Shield,
  Trash2,
  AlertTriangle,
  Navigation,
  Compass,
  ExternalLink,
} from "lucide-react";
import {
  MatchFeedItem,
  SkillTier,
  SplitCostRatio,
} from "@/types/matchmaking";
import { POPULAR_HANOI_DISTRICTS, GOLDEN_TIME_SLOTS } from "./CreateMatchModal";
import { HANOI_PITCHES, SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchFeedItem | null;
  onSaveMatch: (updatedMatch: MatchFeedItem) => void;
  onDeleteMatch?: (matchId: string) => void;
}

export function EditMatchModal({
  isOpen,
  onClose,
  match,
  onSaveMatch,
  onDeleteMatch,
}: EditMatchModalProps) {
  const [pitchName, setPitchName] = useState("");
  const [pitchAddress, setPitchAddress] = useState("");
  const [district, setDistrict] = useState("Cầu Giấy");
  const [timeSlot, setTimeSlot] = useState("19:00 - 20:30");
  const [tier, setTier] = useState<SkillTier>(2);
  const [totalCost, setTotalCost] = useState(800000);
  const [splitRatio, setSplitRatio] = useState<SplitCostRatio>("50_50");
  const [customRatioText, setCustomRatioText] = useState("");
  const [isSOS, setIsSOS] = useState(false);
  const [notes, setNotes] = useState("");
  const [isGmapsIntegrated, setIsGmapsIntegrated] = useState(true);
  const [customGmapsUrl, setCustomGmapsUrl] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (match) {
      setPitchName(match.pitchName);
      setPitchAddress(match.pitchAddress);
      setDistrict(match.district);
      setTimeSlot(`${match.startTime} - ${match.endTime}`);
      setTier(match.requiredTier);
      setTotalCost(match.totalCostVnd);
      setSplitRatio(match.splitRatio || "50_50");
      if (match.splitRatio === "CUSTOM") {
        setCustomRatioText(match.splitRatioLabel || "");
      } else {
        setCustomRatioText("");
      }
      setIsSOS(match.isSOS);
      setNotes(match.notes || "");
      setIsGmapsIntegrated(match.isGmapsIntegrated ?? true);
      setCustomGmapsUrl(match.gmapsUrl ?? "");
      setShowConfirmDelete(false);
    }
  }, [match]);

  const effectiveGmapsUrl = React.useMemo(() => {
    if (!isGmapsIntegrated) return undefined;
    let custom = customGmapsUrl.trim();
    if (custom) {
      if (!custom.startsWith("http://") && !custom.startsWith("https://")) {
        custom = "https://" + custom;
      }
      return custom;
    }
    const query = encodeURIComponent(
      `${pitchName.trim()} ${pitchAddress.trim()} ${district.trim()} Hà Nội`.trim()
    );
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [isGmapsIntegrated, customGmapsUrl, pitchName, pitchAddress, district]);

  if (!isOpen || !match) return null;

  const guestCost =
    splitRatio === "50_50"
      ? Math.round(totalCost * 0.5)
      : splitRatio === "60_40"
      ? Math.round(totalCost * 0.4)
      : splitRatio === "70_30"
      ? Math.round(totalCost * 0.3)
      : Math.round(totalCost * 0.5);

  const hostCost = Math.max(0, totalCost - guestCost);

  const splitRatioLabel =
    splitRatio === "50_50"
      ? "50/50"
      : splitRatio === "60_40"
      ? "60/40"
      : splitRatio === "70_30"
      ? "70/30"
      : customRatioText.trim() || "50/50";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeParts = timeSlot.includes("-")
      ? timeSlot.split("-").map((t) => t.trim())
      : [timeSlot.trim(), ""];
    const startTime = timeParts[0] || match.startTime;
    const endTime = timeParts[1] || match.endTime;

    const updatedMatch: MatchFeedItem = {
      ...match,
      pitchName: pitchName.trim() || match.pitchName,
      pitchAddress: pitchAddress.trim() || match.pitchAddress,
      district,
      startTime,
      endTime,
      requiredTier: tier,
      totalCostVnd: totalCost,
      shareCostVnd: guestCost,
      hostCostVnd: hostCost,
      splitRatio,
      splitRatioLabel,
      isSOS,
      notes,
      gmapsUrl: effectiveGmapsUrl,
      isGmapsIntegrated: isGmapsIntegrated,
    };

    onSaveMatch(updatedMatch);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteMatch) {
      onDeleteMatch(match.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0f172a] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-slate-950/80">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Quản Trị Kèo Của Đội Bạn
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Chỉnh Sửa Thông Tin Kèo Đấu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Sân bóng & Quận */}
          <div className="space-y-3 rounded-2xl bg-slate-950/70 border border-white/[0.08] p-3.5">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tên sân bóng / Cụm sân
              </label>
              <input
                type="text"
                required
                value={pitchName}
                onChange={(e) => setPitchName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Khu vực / Quận
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white"
                >
                  {POPULAR_HANOI_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      Quận {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Khung giờ thi đấu
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-amber-300 font-mono font-bold"
                >
                  {GOLDEN_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TÍNH NĂNG CHỦ KÈO TÍCH HỢP VỊ TRÍ GOOGLE MAPS */}
            <div className="rounded-xl bg-slate-900/90 border border-sky-500/35 p-3 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isGmapsIntegrated}
                    onChange={(e) => setIsGmapsIntegrated(e.target.checked)}
                    className="w-4 h-4 accent-sky-500 rounded"
                  />
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    <span>Tích hợp ghim vị trí sân lên Google Maps</span>
                  </span>
                </label>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                  Chỉ đường 1-chạm
                </span>
              </div>

              {isGmapsIntegrated && (
                <div className="space-y-2 pt-1 border-t border-white/[0.06]">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customGmapsUrl}
                      onChange={(e) => setCustomGmapsUrl(e.target.value)}
                      placeholder="Dán link Google Maps ghim sẵn (hoặc để trống để tự sinh link tìm kiếm)"
                      className="flex-1 h-8 px-2.5 rounded-lg bg-slate-950 border border-white/[0.1] text-sky-300 placeholder:text-slate-500 font-mono text-[11px] focus:outline-none focus:border-sky-400"
                    />
                    {effectiveGmapsUrl && (
                      <a
                        href={effectiveGmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-2.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-400/40 text-[11px] font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
                        title="Mở thử Google Maps kiểm tra vị trí sân"
                      >
                        <Navigation className="w-3 h-3 text-sky-400" />
                        <span>Test</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                      </a>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    💡 {customGmapsUrl.trim()
                      ? "Đang dùng link Google Maps thủ công."
                      : `Hệ thống tự động sinh link: “${pitchName} ${pitchAddress || district} Hà Nội”.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Trình độ Tier */}
          <div className="rounded-2xl bg-slate-950/70 border border-white/[0.08] p-3.5">
            <label className="block font-semibold text-slate-300 mb-1.5">
              Yêu cầu trình độ đối thủ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as SkillTier[]).map((t) => {
                const info = SKILL_TIERS_CONFIG[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTier(t)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      tier === t
                        ? info.badgeColor + " ring-1 ring-current font-bold"
                        : "bg-slate-900 border-white/[0.08] text-slate-400"
                    }`}
                  >
                    <div>Tier {t}</div>
                    <div className="text-[10px] truncate opacity-80">{info.name}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tiền sân & Mức chia tiền */}
          <div className="space-y-3 rounded-2xl bg-slate-950/70 border border-white/[0.08] p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tổng tiền sân (VNĐ)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={totalCost}
                  onChange={(e) => setTotalCost(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-emerald-400 font-extrabold tabular-nums"
                />
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 cursor-pointer sm:mt-6">
                <input
                  type="checkbox"
                  checked={isSOS}
                  onChange={(e) => setIsSOS(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <div>
                  <div className="font-bold text-rose-300 flex items-center gap-1 text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    Bật Kèo SOS Khẩn Cấp
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Trận sát giờ &lt; 2 tiếng
                  </div>
                </div>
              </label>
            </div>

            {/* Mức chia tiền */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Mức chia tiền sân:
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: "50_50", label: "50/50" },
                  { id: "60_40", label: "60/40" },
                  { id: "70_30", label: "70/30" },
                  { id: "CUSTOM", label: "Tự điền" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSplitRatio(item.id as SplitCostRatio);
                    }}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      splitRatio === item.id
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 font-black shadow-sm ring-1 ring-emerald-400"
                        : "bg-slate-900 border-white/[0.08] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-extrabold text-xs">{item.label}</div>
                  </button>
                ))}
              </div>

              {splitRatio === "CUSTOM" && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    value={customRatioText}
                    onChange={(e) => setCustomRatioText(e.target.value)}
                    placeholder="Nhập mức chia (VD: 80/20, 55/45, Tùy tâm...)"
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-white font-bold text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Lời nhắn cho đối thủ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/[0.1] text-white text-xs"
            />
          </div>

          {/* Khu vực Hủy / Xóa kèo kèm Kháng Cáo */}
          <div className="pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="text-rose-400 hover:text-rose-300 font-bold text-xs inline-flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hủy / Xóa kèo đấu này (Mở Hộp Kháng Cáo nếu hủy sát giờ)</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="w-1/3 h-10 rounded-xl text-slate-400 hover:text-white"
            >
              Đóng
            </Button>
            <Button
              type="submit"
              className="w-2/3 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cập Nhật Kèo</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
