"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertTriangle,
  Star,
  Lock,
  Copy,
  Check,
  QrCode,
  BellRing,
  ExternalLink,
} from "lucide-react";
import { MatchFeedItem } from "@/types/matchmaking";
import { SKILL_TIERS_CONFIG } from "@/constants/hanoiPitches";
import { Button } from "@/components/ui/button";
import { getAdminEscrowQRUrl } from "@/lib/vietqr";
import {
  normalizeVietnamPhone,
  isValidVietnamPhone,
  formatDisplayPhone,
  maskPhoneNumber,
  getZaloDeepLink,
  getZaloQrImageUrl,
  buildMatchZaloMessage,
  getSmsDeepLink,
  playNotificationChime,
} from "@/lib/zalo";

interface MatchChallengeModalProps {
  match: MatchFeedItem | null;
  myTrustScore?: number;
  onClose: () => void;
  onConfirmMatch: (
    matchId: string,
    challengerTeamName: string,
    challengerPhone: string,
    challengerZalo?: string
  ) => void;
}

export function MatchChallengeModal({
  match,
  myTrustScore = 100,
  onClose,
  onConfirmMatch,
}: MatchChallengeModalProps) {
  const [teamName, setTeamName] = useState("FC Anh Em Cầu Giấy");
  const [phone, setPhone] = useState("0988.666.888");
  const [sameZaloAsPhone, setSameZaloAsPhone] = useState(true);
  const [customZalo, setCustomZalo] = useState("");
  const [guestJersey, setGuestJersey] = useState("Trắng");
  const [agreedRules, setAgreedRules] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [showZaloQr, setShowZaloQr] = useState(false);

  if (!match) return null;

  const tierInfo = SKILL_TIERS_CONFIG[match.requiredTier];
  const host = match.hostTeam;
  const isEscrowRequired = myTrustScore < 70;
  const escrowQrUrl = isEscrowRequired
    ? getAdminEscrowQRUrl(match.id, teamName)
    : "";

  const effectiveGuestZalo = sameZaloAsPhone ? phone : customZalo;
  const isGuestPhoneValid = isValidVietnamPhone(phone);
  const isGuestZaloValid = isValidVietnamPhone(effectiveGuestZalo);

  // Thông tin Zalo & SĐT đã chuẩn hóa của Đội trưởng chủ sân
  const hostCallPhoneNormalized = normalizeVietnamPhone(host.captainPhone);
  const hostZaloLink = getZaloDeepLink(host.captainPhone, host.captainZalo);
  const hostZaloQrUrl = getZaloQrImageUrl(host.captainPhone, host.captainZalo);

  // Nội dung tin nhắn mẫu tự động điền thông tin trận đấu
  const prefilledMessage = buildMatchZaloMessage({
    hostCaptainName: host.captainName,
    hostTeamName: host.name,
    guestTeamName: teamName,
    guestPhone: phone,
    guestJerseyColor: guestJersey,
    pitchName: match.pitchName,
    timeSlot: `${match.startTime} - ${match.endTime}`,
    matchDate: match.matchDate,
    shareCostVnd: match.shareCostVnd,
  });

  const smsDeepLink = getSmsDeepLink(host.captainPhone, prefilledMessage);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(prefilledMessage);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleOpenZaloAndCopy = async () => {
    try {
      await navigator.clipboard.writeText(prefilledMessage);
      setCopiedMsg(true);
    } catch {
      // Ignore clipboard error if restricted
    }
    window.open(hostZaloLink, "_blank", "noopener,noreferrer");
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !agreedRules ||
      !teamName.trim() ||
      !isGuestPhoneValid ||
      !isGuestZaloValid
    )
      return;

    setIsLocking(true);
    setTimeout(() => {
      setIsLocking(false);
      setIsConfirmed(true);
      playNotificationChime();
      onConfirmMatch(
        match.id,
        teamName.trim(),
        formatDisplayPhone(phone),
        normalizeVietnamPhone(effectiveGuestZalo)
      );
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#101624] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-slate-950/60">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {match.isSOS ? "⚡ Cứu Hộ Kèo Khẩn Cấp" : "Khớp Kèo Trực Tiếp"}
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              {match.pitchName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {isConfirmed ? (
            <div className="py-2 space-y-4">
              {/* Header Thành Công */}
              <div className="text-center space-y-2">
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto p-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    Đã Khóa Kèo &amp; Mở Khóa Liên Hệ Đội Trưởng!
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Chuông thông báo trên Web đã gửi tới{" "}
                    <strong className="text-white">{host.name}</strong> • Bạn
                    không cần cài đặt thêm ứng dụng lạ.
                  </p>
                </div>
              </div>

              {/* Khối Thông tin Đội trưởng Chủ sân & Nút Zalo 1-Click */}
              <div className="rounded-2xl bg-gradient-to-br from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/40 p-4 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
                      Đã mở khóa SĐT &amp; Zalo chính chủ
                    </span>
                    <div className="text-sm font-extrabold text-white mt-0.5">
                      {host.captainName} • Đội trưởng {host.shortName}
                    </div>
                    <div className="text-emerald-400 font-mono font-bold text-sm mt-0.5 flex items-center gap-2">
                      <span>{formatDisplayPhone(host.captainPhone)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-sans">
                        Đã xác thực 10 số VN
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowZaloQr(!showZaloQr)}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-200 text-[11px] font-bold flex flex-col items-center gap-1 shrink-0 transition"
                    title="Hiển thị mã QR Zalo để quét bằng điện thoại"
                  >
                    <QrCode className="w-4 h-4 text-sky-400" />
                    <span className="text-[9px]">QR Zalo</span>
                  </button>
                </div>

                {/* Hiển thị QR Zalo nếu người dùng đang dùng máy tính muốn quét bằng điện thoại */}
                {showZaloQr && (
                  <div className="rounded-xl bg-white p-3 text-center space-y-1.5">
                    <img
                      src={hostZaloQrUrl}
                      alt="Mã QR Zalo Đội trưởng"
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                    <p className="text-[11px] font-bold text-slate-800">
                      Mở Camera hoặc Zalo trên điện thoại quét để chat ngay với{" "}
                      {host.captainName}
                    </p>
                  </div>
                )}

                {/* Nút Bấm 1-Click Mở Zalo (Tự động Copy sẵn tin nhắn mẫu) */}
                <button
                  type="button"
                  onClick={handleOpenZaloAndCopy}
                  className="w-full py-3 px-4 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>
                    Mở Zalo Nhắn Đội Trưởng {host.captainName} (Tự Copy Tin Mẫu)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                {/* 2 Nút Dự Phòng: Gọi Điện Trực Tiếp & Gửi SMS */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${hostCallPhoneNormalized}`}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi Điện Ngay</span>
                  </a>
                  <a
                    href={smsDeepLink}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Gửi Tin Nhắn SMS</span>
                  </a>
                </div>
              </div>

              {/* Mẫu tin nhắn chốt kèo tự động để Copy dán vào Zalo */}
              <div className="rounded-xl bg-slate-950 border border-white/[0.08] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">
                    📋 Tin nhắn chốt kèo soạn sẵn (Chỉ cần Dán vào Zalo):
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition"
                  >
                    {copiedMsg ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Đã Copy!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy tin mẫu</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.05] select-all">
                  {prefilledMessage}
                </p>
              </div>

              {/* Trạng thái Chuông thông báo In-App */}
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-center gap-2.5">
                <BellRing className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Hệ thống đã đồng thời rung chuông thông báo trực tiếp trên giao
                  diện Web của đội chủ nhà và lưu lịch sử bảo vệ quyền lợi hai
                  đội.
                </p>
              </div>

              <Button
                onClick={onClose}
                className="w-full min-h-[44px] rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold"
              >
                Hoàn tất &amp; Quay lại bảng kèo
              </Button>
            </div>
          ) : (
            <form onSubmit={handleConfirm} className="space-y-4">
              {/* Match Summary Box */}
              <div className="rounded-xl bg-slate-950/80 border border-white/[0.07] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    Khung giờ bóng lăn:
                  </span>
                  <span className="font-extrabold text-white text-sm tabular-nums">
                    {match.startTime} - {match.endTime} ({match.matchDate})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Địa điểm sân:
                  </span>
                  <span className="font-semibold text-slate-200 text-right">
                    {match.pitchAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-slate-400">
                    Tiền sân chia đôi (50/50):
                  </span>
                  <span className="text-base font-black text-emerald-400 tabular-nums">
                    {match.shareCostVnd.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Host Reputation Breakdown & Masked Zalo Info */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 block">
                      Đội chủ sân: {host.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Đội trưởng: <strong className="text-white">{host.captainName}</strong> • Zalo:{" "}
                      <span className="font-mono text-sky-400">
                        {maskPhoneNumber(host.captainPhone)}
                      </span>{" "}
                      (Mở khóa khi chốt)
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {host.credit.score}/100đ
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="rounded-lg bg-slate-950/70 p-2 border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400">Đúng giờ</div>
                    <div className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5 tabular-nums">
                      {host.ratingPunctual}{" "}
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-2 border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400">Fair-play</div>
                    <div className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5 tabular-nums">
                      {host.ratingFairplay}{" "}
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-950/70 p-2 border border-white/[0.04]">
                    <div className="text-[10px] text-slate-400">Sòng phẳng</div>
                    <div className="font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5 tabular-nums">
                      {host.ratingFinancial}{" "}
                      <Star className="w-3 h-3 fill-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tier Verification Warning */}
              <div className={`rounded-xl border p-3 ${tierInfo.badgeColor}`}>
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Quy chuẩn Tier {match.requiredTier} ({tierInfo.name}):
                  </span>
                </div>
                <p className="mt-1 opacity-90 leading-relaxed">
                  {tierInfo.description}
                </p>
              </div>

              {/* Challenger Info Inputs + Zalo Verification */}
              <div className="rounded-xl bg-slate-950/70 border border-white/[0.08] p-3.5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tên đội của bạn
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Màu áo đội bạn
                    </label>
                    <select
                      value={guestJersey}
                      onChange={(e) => setGuestJersey(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Trắng">Áo Trắng</option>
                      <option value="Đỏ">Áo Đỏ</option>
                      <option value="Xanh Dương">Áo Xanh Dương</option>
                      <option value="Xanh Lá">Áo Xanh Lá</option>
                      <option value="Vàng">Áo Vàng</option>
                      <option value="Đen">Áo Đen</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Số điện thoại Đội trưởng (10 số VN)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988.666.888"
                    className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
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
                    Sử dụng số này làm số <strong>Zalo</strong> để Đội trưởng chủ
                    sân nhắn lại
                  </span>
                </label>

                {!sameZaloAsPhone && (
                  <div>
                    <label className="block text-[11px] font-semibold text-sky-300 mb-1">
                      Số điện thoại đăng ký Zalo riêng của bạn
                    </label>
                    <input
                      type="tel"
                      required
                      value={customZalo}
                      onChange={(e) => setCustomZalo(e.target.value)}
                      placeholder="Nhập SĐT Zalo 10 số (VD: 0912345678)"
                      className="w-full h-9 px-3 rounded-xl bg-slate-900 border border-sky-500/40 text-white text-xs font-mono focus:outline-none focus:border-sky-400"
                    />
                  </div>
                )}

                {(!isGuestPhoneValid || !isGuestZaloValid) && (
                  <p className="text-[11px] text-rose-400 font-semibold">
                    ⚠️ Vui lòng nhập đúng SĐT di động 10 số Việt Nam (đầu 09, 03,
                    07, 08, 05).
                  </p>
                )}
              </div>

              {/* Yêu cầu cọc 200.000đ nếu điểm tín nhiệm < 70 */}
              {isEscrowRequired && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-3.5 space-y-2.5">
                  <div className="text-amber-300 font-bold text-xs flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Điểm tín nhiệm &lt; 70 ({myTrustScore}đ): Bắt buộc ký quỹ
                      200.000đ
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Để bảo vệ chủ sân khỏi rủi ro bùng kèo sát giờ, vui lòng quét
                    VietQR chuyển khoản cọc <strong>200.000 VNĐ</strong> vào TK
                    Ban Quản Trị (MB Bank:{" "}
                    <strong className="text-white">07440948327598</strong> - TRAN
                    QUOC THIEN PHUOC). Hoàn trả 100% sau trận đấu.
                  </p>
                  <div className="bg-white p-2.5 rounded-xl w-44 mx-auto">
                    <img
                      src={escrowQrUrl}
                      alt="VietQR Cọc 200k BQT"
                      className="w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {/* Checkbox Commitment */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-white/[0.06] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedRules}
                  onChange={(e) => setAgreedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-500 rounded"
                />
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Tôi cam kết đội đúng trình độ{" "}
                  <strong>Tier {match.requiredTier}</strong>, không bùng kèo sát
                  giờ (&lt;1h bị trừ 20 điểm tín nhiệm) và thanh toán sòng phẳng
                  50/50 tại sân.
                </span>
              </label>

              <Button
                type="submit"
                disabled={
                  !agreedRules ||
                  isLocking ||
                  !isGuestPhoneValid ||
                  !isGuestZaloValid
                }
                className="w-full min-h-[46px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {isLocking
                    ? "Đang khóa kèo (Row-Level Locking)..."
                    : "Xác Nhận Bắt Đối & Mở Khóa Zalo Chủ Sân"}
                </span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
