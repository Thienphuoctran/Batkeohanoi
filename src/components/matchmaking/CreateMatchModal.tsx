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
  Lock,
  Navigation,
  Compass,
  MapPin,
  Calendar,
} from "lucide-react";
import { District, MatchFeedItem, SkillTier, EscrowWallet, SplitCostRatio } from "@/types/matchmaking";
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
import {
  getTodayIsoDate,
  getOffsetIsoDate,
  getQuickDateOptions,
  formatMatchDateDisplay,
  formatFullExpiryLabel,
  getMatchKickoffDate,
  getMatchExpiresDate,
  isMatchExpired,
} from "@/lib/matchTime";

import {
  AuthenticatedTeamProfile,
  UserProfile,
} from "@/hooks/useAuthTeam";

export const POPULAR_HANOI_DISTRICTS = [
  "Cầu Giấy",
  "Nam Từ Liêm",
  "Thanh Xuân",
  "Đống Đa",
  "Hà Đông",
  "Bắc Từ Liêm",
  "Hoàng Mai",
  "Ba Đình",
  "Hai Bà Trưng",
  "Tây Hồ",
  "Long Biên",
];

export const GOLDEN_TIME_SLOTS = [
  "07:00 - 08:30",
  "08:30 - 10:00",
  "16:00 - 17:30",
  "17:30 - 19:00",
  "19:00 - 20:30",
  "19:30 - 21:00",
  "20:00 - 21:30",
  "20:30 - 22:00",
];

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMatch: (newMatch: MatchFeedItem) => void | Promise<any>;
  verifiedTeam?: AuthenticatedTeamProfile | null;
  verifiedProfile?: UserProfile | null;
  onRequireAuth?: () => void;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
  initialIsSos?: boolean;
}

export function CreateMatchModal({
  isOpen,
  onClose,
  onCreateMatch,
  verifiedTeam,
  verifiedProfile,
  onRequireAuth,
  escrowWallet,
  onOpenEscrowModal,
  initialIsSos,
}: CreateMatchModalProps) {
  const [hostTeamName, setHostTeamName] = useState(
    verifiedTeam?.team_name || MOCK_TEAMS[0].name
  );
  const [captainName, setCaptainName] = useState(
    verifiedProfile?.full_name ||
      verifiedTeam?.captain_name ||
      MOCK_TEAMS[0].captainName
  );
  const [captainPhone, setCaptainPhone] = useState(
    verifiedProfile?.phone ||
      verifiedTeam?.captain_phone ||
      MOCK_TEAMS[0].captainPhone
  );
  const [sameZaloAsPhone, setSameZaloAsPhone] = useState(true);
  const [customZaloPhone, setCustomZaloPhone] = useState("");
  const [district, setDistrict] = useState<District>(
    verifiedTeam?.home_district === "NamTuLiem" ? "Nam Từ Liêm" : "Cầu Giấy"
  );
  const [pitchName, setPitchName] = useState("Sân Bóng Đá Đình Thôn");
  const [pitchAddress, setPitchAddress] = useState(
    "Ngõ 39 Đình Thôn, Nam Từ Liêm, Hà Nội"
  );
  const [tier, setTier] = useState<SkillTier>(
    ([1, 2, 3].includes(Number(verifiedTeam?.skill_tier))
      ? Number(verifiedTeam?.skill_tier)
      : 2) as SkillTier
  );
  // Mặc định thông minh: Nếu đã qua 20h00 tối thì mặc định chọn Ngày mai để tránh tạo nhầm kèo quá khứ
  const [matchDateIso, setMatchDateIso] = useState<string>(() => {
    const now = new Date();
    return now.getHours() >= 20 ? getOffsetIsoDate(1) : getTodayIsoDate();
  });
  const [timeSlot, setTimeSlot] = useState("19:00 - 20:30");
  const [totalCost, setTotalCost] = useState(850000);
  const [splitRatio, setSplitRatio] = useState<SplitCostRatio>("50_50");
  const [customRatioText, setCustomRatioText] = useState("");
  const [isSOS, setIsSOS] = useState(Boolean(initialIsSos));
  const [notes, setNotes] = useState(
    "Đội văn minh, đúng giờ, giao lưu vui vẻ sau giờ làm."
  );
  // Google Maps Integration
  const [isGmapsIntegrated, setIsGmapsIntegrated] = useState(true);
  const [customGmapsUrl, setCustomGmapsUrl] = useState("");
  // Honeypot Chống Bot (Mục 13)
  const [botHoneypot, setBotHoneypot] = useState("");
  // 🛡️ LỚP 1: Trạng thái khóa nút bấm chống gửi đúp (Double Submission)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 🛡️ Khôi phục bản nháp thông minh khi đăng nhập lại
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      if (typeof initialIsSos === "boolean") {
        setIsSOS(initialIsSos);
      }
      try {
        const savedDraft = localStorage.getItem("batkeo7_pending_match_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === "object") {
            if (parsed.pitchName) setPitchName(parsed.pitchName);
            if (parsed.pitchAddress) setPitchAddress(parsed.pitchAddress);
            if (parsed.district) setDistrict(parsed.district);
            if (parsed.matchDateIso) setMatchDateIso(parsed.matchDateIso);
            if (parsed.timeSlot) setTimeSlot(parsed.timeSlot);
            if (typeof parsed.totalCost === "number") setTotalCost(parsed.totalCost);
            if (parsed.splitRatio) setSplitRatio(parsed.splitRatio);
            if (parsed.customRatioText) setCustomRatioText(parsed.customRatioText);
            if (typeof parsed.isSOS === "boolean") setIsSOS(parsed.isSOS);
            if (parsed.notes) setNotes(parsed.notes);
            if (typeof parsed.isGmapsIntegrated === "boolean") setIsGmapsIntegrated(parsed.isGmapsIntegrated);
            if (parsed.customGmapsUrl) setCustomGmapsUrl(parsed.customGmapsUrl);
            if (parsed.tier) setTier(parsed.tier);
            setHasRestoredDraft(true);
          }
        }
      } catch (e) {
        console.warn("Failed to restore match draft", e);
      }
    }
  }, [isOpen, initialIsSos]);

  const quickDates = React.useMemo(() => getQuickDateOptions(4), [isOpen]);

  const isSelectedTimeExpired = React.useMemo(() => {
    return isMatchExpired(
      { matchDate: matchDateIso, matchDateIso, startTime: timeSlot },
      isSOS ? 90 : 15,
      Date.now()
    );
  }, [matchDateIso, timeSlot, isSOS]);

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

  const guestCost = React.useMemo(() => {
    if (splitRatio === "50_50") return Math.round(totalCost * 0.5);
    if (splitRatio === "60_40") return Math.round(totalCost * 0.4);
    if (splitRatio === "70_30") return Math.round(totalCost * 0.3);
    const matchRatio = customRatioText.match(/(\d+)\s*\/\s*(\d+)/);
    if (matchRatio) {
      const guestPercent = Number(matchRatio[2]);
      if (!isNaN(guestPercent) && guestPercent >= 0 && guestPercent <= 100) {
        return Math.round((totalCost * guestPercent) / 100);
      }
    }
    return Math.round(totalCost * 0.5);
  }, [splitRatio, totalCost, customRatioText]);

  const hostCost = Math.max(0, totalCost - guestCost);

  const splitRatioLabel = React.useMemo(() => {
    if (splitRatio === "50_50") return "50/50";
    if (splitRatio === "60_40") return "60/40";
    if (splitRatio === "70_30") return "70/30";
    return customRatioText.trim() || "50/50";
  }, [splitRatio, customRatioText]);

  React.useEffect(() => {
    if (verifiedTeam) {
      setHostTeamName(verifiedTeam.team_name);
      setCaptainName(
        verifiedProfile?.full_name ||
          verifiedTeam.captain_name ||
          MOCK_TEAMS[0].captainName
      );
      setCaptainPhone(
        verifiedProfile?.phone ||
          verifiedTeam.captain_phone ||
          MOCK_TEAMS[0].captainPhone
      );
      if ([1, 2, 3].includes(Number(verifiedTeam.skill_tier))) {
        setTier(Number(verifiedTeam.skill_tier) as SkillTier);
      }
      if (verifiedTeam.home_district) {
        const dMap: Record<string, string> = {
          NamTuLiem: "Nam Từ Liêm",
          CauGiay: "Cầu Giấy",
          BacTuLiem: "Bắc Từ Liêm",
          ThanhXuan: "Thanh Xuân",
          DongDa: "Đống Đa",
          HaDong: "Hà Đông",
          HoangMai: "Hoàng Mai",
          BaDinh: "Ba Đình",
          HaiBaTrung: "Hai Bà Trưng",
          TayHo: "Tây Hồ",
          LongBien: "Long Biên",
        };
        setDistrict(dMap[verifiedTeam.home_district] || verifiedTeam.home_district);
      }
    }
  }, [verifiedTeam, verifiedProfile]);

  if (!isOpen) return null;

  const effectiveZaloPhone = sameZaloAsPhone ? captainPhone : customZaloPhone;
  const isPhoneValid = isValidVietnamPhone(captainPhone);
  const isZaloValid = isValidVietnamPhone(effectiveZaloPhone);
  const previewZaloLink = getZaloDeepLink(captainPhone, effectiveZaloPhone);

  const handleQuickSelectPitch = (pitch: (typeof HANOI_PITCHES)[0]) => {
    setPitchName(pitch.name);
    setPitchAddress(pitch.address);
    setDistrict(pitch.district);
    setTotalCost(pitch.typicalPeakPriceVnd);
  };

  const currentTrustScore = verifiedTeam?.trust_score ?? 100;
  const isEscrowLocked =
    currentTrustScore < 70 && (!escrowWallet || escrowWallet.balance < 200000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // 🛡️ Chặn ngay nếu đang gửi
    if (botHoneypot && botHoneypot.trim().length > 0) return; // Chặn bot âm thầm
    if (isEscrowLocked || isSelectedTimeExpired) return;

    // 🛡️ PHƯƠNG ÁN 4: NẾU CHƯA ĐĂNG NHẬP HOẶC CHƯA CÓ ĐỘI CHÍNH CHỦ
    // Tự động lưu nháp toàn bộ thông tin form và chuyển sang xác thực 1-chạm
    if (!verifiedTeam) {
      try {
        const draftData = {
          district,
          pitchName,
          pitchAddress,
          matchDateIso,
          timeSlot,
          totalCost,
          splitRatio,
          customRatioText,
          isSOS,
          notes,
          isGmapsIntegrated,
          customGmapsUrl,
          tier,
        };
        localStorage.setItem("batkeo7_pending_match_draft", JSON.stringify(draftData));
      } catch (err) {
        console.warn("Could not save match draft", err);
      }
      onClose();
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    if (!isPhoneValid || !isZaloValid) return;

    setIsSubmitting(true);
    try {
      const timeParts = timeSlot.includes("-")
        ? timeSlot.split("-").map((t) => t.trim())
        : [timeSlot.trim(), ""];
      const startTime = timeParts[0] || "19:00";
      const endTime = timeParts[1] || "20:30";
      const normalizedCallPhone = formatDisplayPhone(captainPhone);
      const normalizedZalo = normalizeVietnamPhone(effectiveZaloPhone);

      const finalPitchName = pitchName.trim() || "Sân Cỏ Nhân Tạo";
      const finalPitchAddress =
        pitchAddress.trim() || `Khu vực ${district.trim() || "Hà Nội"}`;

      const formattedMatchDate = formatMatchDateDisplay(matchDateIso);
      const kickoffDateObj = getMatchKickoffDate({
        matchDate: matchDateIso,
        matchDateIso,
        startTime: startTime || "19:00",
      });
      const expiresDateObj = getMatchExpiresDate(
        {
          matchDate: matchDateIso,
          matchDateIso,
          startTime: startTime || "19:00",
        },
        isSOS ? 90 : 15
      );

      const newMatch: MatchFeedItem = {
        id: `match-new-${Date.now()}`,
        hostTeam: {
          ...MOCK_TEAMS[0],
          id: verifiedTeam?.id || MOCK_TEAMS[0].id,
          name: hostTeamName.trim() || MOCK_TEAMS[0].name,
          shortName: (hostTeamName.trim() || MOCK_TEAMS[0].shortName).slice(0, 12),
          captainName: captainName.trim() || MOCK_TEAMS[0].captainName,
          captainPhone: normalizedCallPhone,
          captainZalo: normalizedZalo,
          credit: {
            ...MOCK_TEAMS[0].credit,
            score: currentTrustScore,
          },
        },
        district,
        pitchName: finalPitchName,
        pitchAddress: finalPitchAddress,
        matchDate: formattedMatchDate,
        matchDateIso,
        startTime: startTime || "19:00",
        endTime: endTime || "20:30",
        totalCostVnd: totalCost,
        shareCostVnd: guestCost,
        hostCostVnd: hostCost,
        splitRatio: splitRatio,
        splitRatioLabel: splitRatioLabel,
        isCreatedByCurrentUser: true,
        requiredTier: tier,
        status: isSOS ? "SOS" : "OPEN",
        isSOS,
        sosCountdownSeconds: isSOS ? 3600 : undefined,
        cancellationReason: isSOS
          ? "Cần tìm đối thay thế khẩn cấp trước giờ bóng lăn"
          : undefined,
        notes,
        createdAt: "Vừa xong",
        kickoffTime: kickoffDateObj.toISOString(),
        expiresAt: expiresDateObj.toISOString(),
        handshakePin: Math.floor(1000 + Math.random() * 9000).toString(),
        isHandshakeVerified: false,
        escrowDepositTeamId: currentTrustScore < 70 ? (verifiedTeam?.id || "team-escrow") : undefined,
        gmapsUrl: effectiveGmapsUrl,
        isGmapsIntegrated: isGmapsIntegrated,
      };

      await onCreateMatch(newMatch);
      try {
        localStorage.removeItem("batkeo7_pending_match_draft");
      } catch {}
      onClose();
    } catch (err) {
      console.error("[handleSubmit Error]", err);
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Honeypot Chống Bot (Mục 13) - Người thật không thấy, bot tự động sẽ điền */}
          <div className="hidden" aria-hidden="true" style={{ display: "none" }}>
            <input
              type="text"
              name="website_url_honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={botHoneypot}
              onChange={(e) => setBotHoneypot(e.target.value)}
            />
          </div>

          {/* Banner Cảnh Báo Khóa Ký Quỹ nếu uy tín < 70đ & ví < 200k */}
          {isEscrowLocked && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  Điểm Tín Nhiệm: {currentTrustScore}/100★ (Dưới ngưỡng 70đ)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-slate-950">
                  TẠM KHÓA TẠO KÈO
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Do điểm tín nhiệm dưới 70đ, đội bạn cần duy trì{" "}
                <strong className="text-amber-300">200.000đ trong Ví Ký Quỹ</strong> để bảo chứng trước khi được đăng kèo mới lên bảng tin.
              </p>
              {onOpenEscrowModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEscrowModal();
                  }}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Mở Ví Ký Quỹ &amp; Nạp 200.000đ Để Mở Khóa Ngay</span>
                </button>
              )}
            </div>
          )}

          {/* Banner Thông báo Khôi phục bản nháp nếu có */}
          {hasRestoredDraft && (
            <div className="rounded-xl bg-sky-500/15 border border-sky-500/40 p-2.5 flex items-center justify-between text-sky-300 text-[11px] font-bold">
              <span className="flex items-center gap-1.5">
                <span>⚡</span>
                <span>Đã khôi phục bản nháp bạn vừa nhập trước khi đăng nhập!</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.removeItem("batkeo7_pending_match_draft");
                  } catch {}
                  setHasRestoredDraft(false);
                }}
                className="text-slate-400 hover:text-white underline text-[10px]"
              >
                Xóa nháp
              </button>
            </div>
          )}

          {/* Banner trạng thái Xác thực Đội trưởng chính chủ */}
          {verifiedTeam ? (
            <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-extrabold text-emerald-300">
                    Đội chính chủ: {verifiedTeam.team_name} ({verifiedTeam.trust_score}/100★)
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Thông tin Đội trưởng &amp; SĐT Zalo đã được khóa xác thực tự động.
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px] shrink-0">
                VERIFIED
              </span>
            </div>
          ) : (
            onRequireAuth && (
              <div className="rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-sky-500/15 border border-amber-500/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                <div className="text-[11px] text-amber-200 leading-snug">
                  🛡️ <strong>Chế độ Bảo Vệ Kèo 100★:</strong> Bạn có thể điền thông tin sân và giờ đá trước. Khi bấm đăng kèo, hệ thống tự lưu nháp và yêu cầu đăng nhập Đội Trưởng 1-chạm để cấp <strong>Thẻ Căn Cước 100 Điểm Tín Nhiệm</strong> và mở kết nối Zalo.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequireAuth();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition shadow-sm active:scale-95"
                >
                  Đăng Nhập 1-Chạm
                </button>
              </div>
            )
          )}

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
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Tên FC chủ nhà</span>
                  {verifiedTeam && (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Chính chủ</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  readOnly={!!verifiedTeam}
                  value={hostTeamName}
                  onChange={(e) => setHostTeamName(e.target.value)}
                  className={`w-full h-9 px-3 rounded-xl border text-xs focus:outline-none ${
                    verifiedTeam
                      ? "bg-slate-950/70 border-emerald-500/40 text-emerald-300 font-bold cursor-not-allowed"
                      : "bg-slate-900 border-white/[0.1] text-white focus:border-emerald-500"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Tên Đội trưởng</span>
                  {verifiedProfile?.full_name && (
                    <span className="text-[10px] text-emerald-400 font-bold">✓ Đã xác thực</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  readOnly={!!verifiedProfile?.full_name || !!verifiedTeam?.captain_name}
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className={`w-full h-9 px-3 rounded-xl border text-xs focus:outline-none ${
                    verifiedProfile?.full_name || verifiedTeam?.captain_name
                      ? "bg-slate-950/70 border-emerald-500/40 text-emerald-300 font-bold cursor-not-allowed"
                      : "bg-slate-900 border-white/[0.1] text-white focus:border-emerald-500"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Số điện thoại nghe gọi chính (10 số VN)</span>
                {verifiedProfile?.phone && (
                  <span className="text-[10px] text-emerald-400 font-bold">✓ SĐT 1 Đội</span>
                )}
              </label>
              <input
                type="tel"
                required
                readOnly={!!verifiedProfile?.phone || !!verifiedTeam?.captain_phone}
                value={captainPhone}
                onChange={(e) => setCaptainPhone(e.target.value)}
                placeholder="VD: 0988.765.432 hoặc +84988765432"
                className={`w-full h-9 px-3 rounded-xl border font-mono text-xs focus:outline-none ${
                  verifiedProfile?.phone || verifiedTeam?.captain_phone
                    ? "bg-slate-950/70 border-emerald-500/40 text-emerald-300 font-bold cursor-not-allowed"
                    : "bg-slate-900 border-white/[0.1] text-white focus:border-emerald-500"
                }`}
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

          {/* 1. Chọn / Tự điền Quận (Toàn Hà Nội) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <span>1. Khu vực / Quận Huyện (Toàn Hà Nội)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Toàn Hà Nội
                </span>
              </label>
              <span className="text-[10px] text-slate-400">
                Tự điền hoặc bấm chọn nhanh
              </span>
            </div>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="VD: Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Hà Đông, Đống Đa..."
              className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 mb-2"
            />
            {/* Quick chips gợi ý quận */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_HANOI_DISTRICTS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDistrict(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                    district.trim().toLowerCase() === d.toLowerCase()
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400"
                      : "bg-slate-950/80 border-white/[0.07] text-slate-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Cụm Sân & Khung Giờ Đá (Tự điền) */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-300">
                  2. Tên cụm sân &amp; Địa chỉ (Tự điền)
                </label>
                {/* Dropdown chọn nhanh sân mẫu */}
                <select
                  aria-label="Chọn nhanh sân bóng mẫu"
                  onChange={(e) => {
                    const found = HANOI_PITCHES.find((p) => p.id === e.target.value);
                    if (found) handleQuickSelectPitch(found);
                  }}
                  defaultValue=""
                  className="text-[10px] bg-slate-950 border border-white/[0.1] text-emerald-400 rounded-lg px-2 py-0.5 focus:outline-none"
                >
                  <option value="" disabled>⚡ Gợi ý sân bóng mẫu...</option>
                  {HANOI_PITCHES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.shortName} ({p.district})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={pitchName}
                  onChange={(e) => setPitchName(e.target.value)}
                  placeholder="Nhập tên sân (VD: Sân Đình Thôn, Sân C500, Sân Mễ Trì, Sân Mic...)"
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-emerald-500/50 text-white text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={pitchAddress}
                  onChange={(e) => setPitchAddress(e.target.value)}
                  placeholder="Địa chỉ sân (VD: Ngõ 39 Đình Thôn, Nam Từ Liêm / Đường Nguyễn Trãi...)"
                  className="w-full h-8 px-3 rounded-lg bg-slate-900/80 border border-white/[0.08] text-white text-[11px] placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
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
                          <span>Test vị trí</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      💡 {customGmapsUrl.trim()
                        ? "Đang dùng link Google Maps thủ công do bạn cung cấp."
                        : `Hệ thống tự động tạo link tìm kiếm Google Maps: “${pitchName} ${pitchAddress || district} Hà Nội”. Đối thủ bấm vào là chỉ đường bằng giọng nói ngay!`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Ngày & Thời gian thi đấu (Chuẩn thời gian thực) */}
            <div className="rounded-2xl bg-slate-950/75 border border-white/[0.08] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>3. Ngày &amp; Giờ thi đấu (Chuẩn thời gian thực)</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                  Đang chọn: {formatMatchDateDisplay(matchDateIso)}
                </span>
              </div>

              {/* Chọn ngày thi đấu (Quick Chips + Lịch) */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1">
                    <span className="block text-[10px] text-slate-400 mb-1">
                      Chọn nhanh ngày đá:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {quickDates.map((d) => (
                        <button
                          type="button"
                          key={d.isoDate}
                          onClick={() => setMatchDateIso(d.isoDate)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                            matchDateIso === d.isoDate
                              ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400 shadow-sm"
                              : "bg-slate-900 border-white/[0.08] text-slate-400 hover:text-white"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sm:w-44">
                    <span className="block text-[10px] text-slate-400 mb-1">
                      Hoặc chọn ngày trên lịch:
                    </span>
                    <input
                      type="date"
                      required
                      min={getTodayIsoDate()}
                      value={matchDateIso}
                      onChange={(e) => setMatchDateIso(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* Chọn khung giờ thi đấu */}
              <div className="pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Khung giờ bóng lăn (Tự điền hoặc chọn nhanh):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Ca 90 phút tiêu chuẩn
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="VD: 07:00 - 08:30, 19:00 - 20:30, 20:30 - 22:00..."
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-white font-mono text-xs font-bold placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 mb-2"
                />
                {/* Quick chips gợi ý ca giờ vàng */}
                <div className="flex flex-wrap gap-1.5">
                  {GOLDEN_TIME_SLOTS.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setTimeSlot(slot)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition border ${
                        timeSlot === slot
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400"
                          : "bg-slate-900 border-white/[0.07] text-slate-400 hover:text-white"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cảnh báo nếu chọn Ngày Hôm Nay nhưng giờ đá đã qua > 15 phút */}
              {isSelectedTimeExpired ? (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 space-y-2">
                  <div className="flex items-start gap-2 text-rose-300 text-[11px] font-bold leading-snug">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>
                      Khung giờ <strong className="text-white">{timeSlot}</strong> của ngày{" "}
                      <strong className="text-amber-300">{formatMatchDateDisplay(matchDateIso)}</strong>{" "}
                      đã trôi qua quá 15 phút so với giờ hiện tại! Vui lòng chuyển sang{" "}
                      <strong className="text-emerald-300">Ngày mai</strong> hoặc chọn khung giờ muộn hơn.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMatchDateIso(getOffsetIsoDate(1))}
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] transition flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Chuyển sang {formatMatchDateDisplay(getOffsetIsoDate(1))} ngay (1-Click)
                    </span>
                  </button>
                </div>
              ) : (
                /* Cam kết tự động đóng bài sau 15p bóng lăn đúng ngày & giờ */
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <span>🧹</span>
                    <span>
                      Tự động đóng nếu chưa có đối lúc:{" "}
                      <strong className="text-amber-300 font-bold">
                        {formatFullExpiryLabel(timeSlot, matchDateIso, 15)}
                      </strong>
                    </span>
                  </span>
                  <span className="text-emerald-400 font-bold text-[10px] sm:text-right">
                    15p sau bóng lăn • Bảo toàn 100% Uy Tín
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Chọn Tier trình độ */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              4. Phân tầng trình độ mong muốn (Chống lệch trình)
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

          {/* 5. Tiền sân & Mức chia tiền sân */}
          <div className="space-y-3 rounded-2xl bg-slate-950/70 border border-white/[0.08] p-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  5. Tổng tiền sân (VNĐ)
                </label>
                <input
                  type="number"
                  step={50000}
                  value={totalCost}
                  onChange={(e) => setTotalCost(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-xl bg-slate-900 border border-white/[0.1] text-emerald-400 font-extrabold tabular-nums"
                />
              </div>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 cursor-pointer sm:mt-6">
                <input
                  type="checkbox"
                  checked={isSOS}
                  onChange={(e) => setIsSOS(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 rounded"
                />
                <div>
                  <div className="font-bold text-rose-300 flex items-center gap-1 text-xs">
                    <Flame className="w-3.5 h-3.5" />
                    Bật Kèo SOS Khẩn Cấp (&lt;2h)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Ưu tiên nổi bật trên đầu bảng tin
                  </div>
                </div>
              </label>
            </div>

            {/* Mức chia tiền sân */}
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

          {/* 6. Ghi chú */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              6. Lời nhắn cho đối thủ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white text-xs"
            />
          </div>

          {isEscrowLocked ? (
            <Button
              type="button"
              onClick={() => {
                onClose();
                onOpenEscrowModal?.();
              }}
              className="w-full min-h-[46px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Nạp 200k Ký Quỹ Mở Khóa Tạo Kèo ({currentTrustScore}★)</span>
            </Button>
          ) : !verifiedTeam ? (
            <Button
              type="submit"
              className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs gap-2 shadow-lg active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Đăng Nhập 1-Chạm Để Xuất Bản Kèo (Bảo Lưu Dữ Liệu)</span>
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || !isPhoneValid || !isZaloValid || isSelectedTimeExpired}
              className="w-full min-h-[46px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang Lưu Kèo Vào CSDL Supabase...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>
                    {isSelectedTimeExpired
                      ? "Khung Giờ Đã Qua — Vui Lòng Chọn Ngày Mai Hoặc Đổi Giờ"
                      : `Đăng Kèo ${formatMatchDateDisplay(matchDateIso)} Lên Bảng Tin Ngay`}
                  </span>
                </>
              )}
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
