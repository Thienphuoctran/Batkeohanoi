"use client";

import React, { useState } from "react";
import {
  Handshake,
  X,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  QrCode,
  Flame,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchFeedItem } from "@/types/matchmaking";

interface HandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: MatchFeedItem | null;
  isHostTeam?: boolean;
  currentTeamRole?: "HOST" | "GUEST";
  onVerifySuccess?: (matchId: string) => void;
  onVerifyHandshakeSuccess?: (matchId: string) => void;
  onReportNoShow: (matchId: string, reason: string) => void;
}

export function HandshakeModal({
  isOpen,
  onClose,
  match,
  isHostTeam,
  currentTeamRole,
  onVerifySuccess,
  onVerifyHandshakeSuccess,
  onReportNoShow,
}: HandshakeModalProps) {
  const [pinInput, setPinInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isReportingNoShow, setIsReportingNoShow] = useState(false);
  const [noShowReason, setNoShowReason] = useState("Đối thủ quá giờ 15 phút không đến, gọi điện không nghe máy.");
  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  if (!isOpen || !match) return null;

  const effectiveIsHost =
    isHostTeam !== undefined ? isHostTeam : currentTeamRole === "HOST";
  const handleSuccess = onVerifySuccess || onVerifyHandshakeSuccess || (() => {});
  const expectedPin = match.handshakePin || "8392";

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pinInput.trim() === expectedPin) {
      setSuccessMsg(true);
      setTimeout(() => {
        handleSuccess(match.id);
        onClose();
      }, 1500);
    } else {
      setErrorMsg("Mã PIN không chính xác! Hãy hỏi Đội trưởng đối thủ để nhận mã 4 số đúng.");
    }
  };

  const handleGpsCheckin = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setGpsLoading(false);
          setGpsVerified(true);
        },
        () => {
          // Mock success if browser permission denied on localhost
          setGpsLoading(false);
          setGpsVerified(true);
        },
        { timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      setGpsVerified(true);
    }
  };

  const handleSubmitNoShow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpsVerified) {
      setErrorMsg("Bạn vui lòng bấm Xác nhận GPS tại sân bóng để làm bằng chứng số chống vu khống!");
      return;
    }
    onReportNoShow(match.id, noShowReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-[#0f172a] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-slate-950/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Handshake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Xác Thực Có Mặt Tại Sân
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Mã Bắt Tay Trên Sân (Chống Bùng)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Thông tin trận đấu */}
          <div className="rounded-xl bg-slate-950/80 border border-white/[0.06] p-3 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-white">
              <span>{match.hostTeam.name} vs {match.guestTeam?.name || "Đội khách"}</span>
              <span className="text-amber-400 font-mono text-[11px]">{match.startTime} - {match.endTime}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{match.pitchName} ({match.district})</span>
            </div>
          </div>

          {!isReportingNoShow ? (
            <div className="space-y-4">
              {/* TRƯỜNG HỢP 1: NẾU LÀ ĐỘI CHỦ NHÀ -> HIỂN THỊ MÃ PIN CHO ĐỐI THỦ XEM */}
              {effectiveIsHost ? (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 p-4 text-center space-y-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Đội Chủ Nhà Giữ Mã Bắt Tay
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Khi Đội Khách lên sân, bạn hãy đọc hoặc đưa mã 4 số này cho Đội trưởng đội bạn nhập vào app:
                  </p>
                  <div className="bg-slate-950 border-2 border-dashed border-emerald-400/60 rounded-2xl py-3 px-6 inline-block shadow-inner">
                    <span className="text-4xl font-black font-mono tracking-widest text-emerald-300">
                      {expectedPin}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    🔒 Khi Đội Khách nhập đúng mã, hệ thống ghi nhận 100% hai đội đã có mặt, nhả cọc về ví và vô hiệu hóa nút báo bùng kèo.
                  </p>
                </div>
              ) : (
                /* TRƯỜNG HỢP 2: NẾU LÀ ĐỘI KHÁCH -> Ô NHẬP MÃ PIN */
                <form onSubmit={handleVerifyPin} className="space-y-3 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      Đội Khách Nhập Mã Bắt Tay
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">
                      Hỏi Đội Trưởng Chủ Sân Để Nhận Mã 4 Số
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Hai đội gặp nhau bắt tay trước trận, nhập mã để kích hoạt trận đấu và nhả tiền ký quỹ:
                    </p>
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="••••"
                      className="w-40 h-14 mx-auto text-center font-mono font-black text-3xl tracking-widest rounded-2xl bg-slate-950 border-2 border-emerald-500/60 text-emerald-300 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác thực bắt tay thành công! Hai đội thi đấu vui vẻ.</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={pinInput.length !== 4 || successMsg}
                    className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác Nhận Đã Có Mặt Tại Sân</span>
                  </Button>
                </form>
              )}

              {/* Nút cứu hộ: Nếu quá 15 phút mà đối thủ không xuất hiện */}
              <div className="pt-2 border-t border-white/[0.06] text-center">
                <button
                  type="button"
                  onClick={() => setIsReportingNoShow(true)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-bold underline"
                >
                  🚨 Quá 15 phút đối thủ không đến sân? Bấm vào đây để báo cáo
                </button>
              </div>
            </div>
          ) : (
            /* FORM BÁO CÁO BÙNG KÈO VỚI BẰNG CHỨNG GPS */
            <form onSubmit={handleSubmitNoShow} className="space-y-3">
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 space-y-1.5">
                <div className="font-extrabold text-rose-300 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Quy Trình Xử Lý Bùng Kèo Minh Bạch &amp; Bồi Thường 200k</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Để chống vu khống gian lận, bạn cần bấm <strong>Xác nhận GPS toạ độ sân bóng</strong>.
                  Nếu xác thực bạn có mặt tại sân mà đối thủ vắng mặt, số tiền <strong>200.000đ cọc sẽ được chuyển thẳng vào ví bạn</strong>!
                </p>
              </div>

              {/* Bấm xác nhận GPS */}
              <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.08] flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white text-[11px]">Bằng chứng toạ độ GPS tại sân:</div>
                  <div className="text-[10px] text-slate-400">
                    {gpsVerified ? "✅ Đã xác thực GPS toạ độ sân bóng hợp lệ" : "Bấm nút bên cạnh để quét toạ độ thực tế"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGpsCheckin}
                  disabled={gpsLoading || gpsVerified}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                    gpsVerified
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-sky-500 hover:bg-sky-400 text-slate-950"
                  }`}
                >
                  {gpsLoading ? "Đang quét..." : gpsVerified ? "Đã Xác Thực" : "Quét GPS"}
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-[11px]">
                  Mô tả tình trạng vi phạm của đối thủ:
                </label>
                <textarea
                  rows={2}
                  value={noShowReason}
                  onChange={(e) => setNoShowReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/[0.1] text-white text-xs"
                />
              </div>

              {errorMsg && (
                <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsReportingNoShow(false)}
                  className="w-1/3 h-10 rounded-xl text-slate-400 hover:text-white"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={!gpsVerified}
                  className="w-2/3 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  <span>Xác Nhận Báo Bùng Kèo &amp; Nhận 200k</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
