"use client";

import React, { useState } from "react";
import {
  X,
  PlusCircle,
  Flame,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { District, MatchFeedItem, SkillTier } from "@/types/matchmaking";
import { HANOI_PITCHES, SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { Button } from "@/components/ui/button";
import {
  normalizeVietnamPhone,
  isValidVietnamPhone,
  formatDisplayPhone,
  maskPhoneNumber,
  getZaloDeepLink,
} from "@/lib/zalo";

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (newMatch: MatchFeedItem) => void;
}

export function CreateMatchModal({
  isOpen,
  onClose,
  onCreateMatch,
}: CreateMatchModalProps) {
  const [hostTeamName, setHostTeamName] = useState(MOCK_TEAMS[0].name);
  const [captainName, setCaptainName] = useState(MOCK_TEAMS[0].captainName);
  const [captainPhone, setCaptainPhone] = useState(MOCK_TEAMS[0].captainPhone);
  const [sameZaloAsPhone, setSameZaloAsPhone] = useState(true);
  const [customZaloPhone, setCustomZaloPhone] = useState("");
  const [district, setDistrict] = useState<District>("Cầu Giấy");
  const [pitchId, setPitchId] = useState<string>("pitch-cg-01");
  const [tier, setTier] = useState<SkillTier>(2);
  const [timeSlot, setTimeSlot] = useState("19:00 - 20:30");
  const [totalCost, setTotalCost] = useState(850000);
  const [isSOS, setIsSOS] = useState(false);
  const [notes, setNotes] = useState(
    "Đội văn minh, đúng giờ, giao lưu vui vẻ sau giờ làm."
  );

  if (!isOpen) return null;

  const filteredPitches = HANOI_PITCHES.filter((p) => p.district === district);
  const selectedPitch =
    HANOI_PITCHES.find((p) => p.id === pitchId) || filteredPitches[0];

  const effectiveZaloPhone = sameZaloAsPhone ? captainPhone : customZaloPhone;
  const isPhoneValid = isValidVietnamPhone(captainPhone);
  const isZaloValid = isValidVietnamPhone(effectiveZaloPhone);
  const previewZaloLink = getZaloDeepLink(captainPhone, effectiveZaloPhone);

  const handleDistrictChange = (newDist: District) => {
    setDistrict(newDist);
    const firstPitch = HANOI_PITCHES.find((p) => p.district === newDist);
    if (firstPitch) {
      setPitchId(firstPitch.id);
      setTotalCost(firstPitch.typicalPeakPriceVnd);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !isZaloValid) return;

    const [startTime, endTime] = timeSlot.split(" - ");
    const normalizedCallPhone = formatDisplayPhone(captainPhone);
    const normalizedZalo = normalizeVietnamPhone(effectiveZaloPhone);

    const newMatch: MatchFeedItem = {
      id: `match-new-${Date.now()}`,
      hostTeam: {
        ...MOCK_TEAMS[0],
        name: hostTeamName.trim() || MOCK_TEAMS[0].name,
        shortName: (hostTeamName.trim() || MOCK_TEAMS[0].shortName).slice(0, 12),
        captainName: captainName.trim() || MOCK_TEAMS[0].captainName,
        captainPhone: normalizedCallPhone,
        captainZalo: normalizedZalo,
      },
      district,
      pitchName: selectedPitch.name,
      pitchAddress: selectedPitch.address,
      matchDate: "Hôm nay",
      startTime: startTime || "19:00",
      endTime: endTime || "20:30",
      totalCostVnd: totalCost,
      shareCostVnd: Math.round(totalCost / 2),
      requiredTier: tier,
      status: isSOS ? "SOS" : "OPEN",
      isSOS,
      sosCountdownSeconds: isSOS ? 3600 : undefined,
      cancellationReason: isSOS
        ? "Cần tìm đối thay thế khẩn cấp trước giờ bóng lăn"
        : undefined,
      notes,
      createdAt: "Vừa xong",
    };

    onCreateMatch(newMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101624] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-slate-950/60">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Đăng Tin Tìm Đối Sân 7
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Tạo Kèo Đấu Mới &amp; Định Tuyến Zalo
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4 text-xs"
        >
          {/* 0. Xác thực SĐT & Zalo Đội trưởng Chủ sân */}
          <div className="rounded-xl bg-slate-950/90 border border-sky-500/30 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sky-400 text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Thông tin Đội trưởng &amp; Định tuyến Zalo 1-Click
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 font-bold">
                Chống lộ SĐT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Tên FC chủ nhà
                </label>
                <input
                  type="text"
                  required
                  value={hostTeamName}
                  onChange={(e) => setHostTeamName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Tên Đội trưởng
                </label>
                <input
                  type="text"
                  required
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Số điện thoại nghe gọi chính (10 số VN)
              </label>
              <input
                type="tel"
                required
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="VD: 0988.765.432 hoặc +84988765432"
                className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sameZaloAsPhone}
                onChange={(e) => setSameZaloAsPhone(e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded"
              />
              <span className="text-[11px] text-slate-300">
                Tài khoản <strong>Zalo</strong> của tôi dùng chính số điện thoại
                này
              </span>
            </label>

            {!sameZaloAsPhone && (
              <div>
                <label className="block text-[11px] font-semibold text-sky-300 mb-1">
                  Số điện thoại đăng ký Zalo riêng (nếu dùng 2 số khác nhau)
                </label>
                <input
                  type="tel"
                  required
                  value={customZaloPhone}
                  onChange={(e) => setCustomZaloPhone(e.target.value)}
                  placeholder="Nhập SĐT bạn dùng để đăng ký Zalo (VD: 0912345678)"
                  className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-sky-500/40 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                />
              </div>
            )}

            {/* Trạng thái kiểm tra chuẩn hóa link Zalo */}
            {isZaloValid ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/25 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Link Zalo chuẩn:{" "}
                    <code className="text-white font-mono">
                      zalo.me/{normalizeVietnamPhone(effectiveZaloPhone)}
                    </code>
                  </span>
                  <a
                    href={previewZaloLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-bold transition shrink-0"
                  >
                    <span>Test mở Zalo</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  🔒 Khi chưa khớp kèo, bảng tin sẽ che số thành{" "}
                  <strong className="text-slate-200 font-mono">
                    {maskPhoneNumber(captainPhone)}
                  </strong>{" "}
                  để chống spam. Chỉ khi đối thủ bấm chốt kèo mới mở nút{" "}
                  <strong className="text-sky-300">Nhắn Zalo 1-Chạm</strong>.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-[11px] text-rose-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Vui lòng nhập đúng SĐT di động 10 số Việt Nam (đầu
                  09/03/07/08/05) để hệ thống tạo đúng link Zalo.
                </span>
              </div>
            )}
          </div>

          {/* 1. Chọn Quận */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              1. Khu vực sân bóng
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Cầu Giấy", "Nam Từ Liêm"] as District[]).map((dist) => (
                <button
                  type="button"
                  key={dist}
                  onClick={() => handleDistrictChange(dist)}
                  className={`py-2.5 px-3 rounded-xl font-bold border transition-all ${
                    district === dist
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-white/[0.08] text-slate-400 hover:text-white"
                  }`}
                >
                  Quận {dist}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Chọn Cụm Sân & Giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                2. Cụm sân
              </label>
              <select
                value={pitchId}
                onChange={(e) => {
                  setPitchId(e.target.value);
                  const found = HANOI_PITCHES.find(
                    (p) => p.id === e.target.value
                  );
                  if (found) setTotalCost(found.typicalPeakPriceVnd);
                }}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white"
              >
                {filteredPitches.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">
                Khung giờ (90 phút)
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white tabular-nums"
              >
                <option value="17:30 - 19:00">17:30 - 19:00</option>
                <option value="19:00 - 20:30">19:00 - 20:30 (Giờ vàng)</option>
                <option value="20:30 - 22:00">20:30 - 22:00</option>
              </select>
            </div>
          </div>

          {/* 3. Chọn Tier trình độ */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              3. Phân tầng trình độ mong muốn (Chống lệch trình)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as SkillTier[]).map((t) => {
                const info = SKILL_TIERS_CONFIG[t];
                return (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTier(t)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      tier === t
                        ? info.badgeColor + " ring-1 ring-current"
                        : "bg-slate-950 border-white/[0.07] text-slate-400"
                    }`}
                  >
                    <div className="font-extrabold">Tier {t}</div>
                    <div className="text-[11px] font-medium mt-0.5 truncate">
                      {info.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tiền sân & Chế độ SOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tổng tiền sân (VNĐ)
              </label>
              <input
                type="number"
                step={50000}
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-emerald-400 font-extrabold tabular-nums"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Mỗi đội chia 50/50: {(totalCost / 2).toLocaleString("vi-VN")}đ
              </span>
            </div>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 cursor-pointer mt-2 sm:mt-4">
              <input
                type="checkbox"
                checked={isSOS}
                onChange={(e) => setIsSOS(e.target.checked)}
                className="w-4 h-4 accent-rose-500"
              />
              <div>
                <div className="font-bold text-rose-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  Bật Kèo SOS Khẩn Cấp
                </div>
                <div className="text-[10px] text-slate-400">
                  Dành cho trận sát giờ &lt;2h bị bùng
                </div>
              </div>
            </label>
          </div>

          {/* 5. Ghi chú */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Lời nhắn cho đối thủ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white text-xs"
            />
          </div>

          <Button
            type="submit"
            disabled={!isPhoneValid || !isZaloValid}
            className="w-full min-h-[46px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng Kèo Lên Bảng Tin Ngay</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
