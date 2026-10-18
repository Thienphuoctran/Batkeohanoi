'use client';

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  UserX,
  Phone,
  FileWarning,
  Sparkles,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { MatchFeedItem, MatchAppealItem } from '@/types/matchmaking';
import { addStoredAppeal } from '@/lib/adminStore';
import { getMatchKickoffDate } from '@/lib/matchTime';
import { submitMatchAppealAction } from '@/actions/auth';

export type GuestWithdrawReason =
  | 'LACK_OF_PLAYERS'
  | 'INJURY_ACCIDENT'
  | 'BAD_WEATHER'
  | 'URGENT_WORK'
  | 'OTHER';

export const GUEST_WITHDRAW_REASONS: Record<
  GuestWithdrawReason,
  { label: string; description: string }
> = {
  LACK_OF_PLAYERS: {
    label: '👥 Thiếu người đột xuất / Quân số không đủ',
    description: 'Thành viên báo bận phút chót không gom đủ 7 người để thi đấu',
  },
  INJURY_ACCIDENT: {
    label: '🚑 Chấn thương / Sự cố sức khỏe bất ngờ',
    description: 'Cầu thủ chủ chốt hoặc thủ môn gặp chấn thương trước giờ bóng lăn',
  },
  BAD_WEATHER: {
    label: '🌧️ Thời tiết xấu / Sân sấm sét ngập lụt',
    description: 'Trời mưa bão to, sân ngập nước nguy hiểm không đảm bảo an toàn',
  },
  URGENT_WORK: {
    label: '💼 Việc gia đình gấp / Tăng ca công việc',
    description: 'Có công việc khẩn cấp phát sinh ngoài ý muốn',
  },
  OTHER: {
    label: '⚡ Lý do bất khả kháng khác',
    description: 'Các sự cố đột xuất phát sinh khác',
  },
};

interface CancelGuestChallengeModalProps {
  match: MatchFeedItem | null;
  open: boolean;
  onClose: () => void;
  guestTeamName?: string;
  guestCaptainPhone?: string;
  myTrustScore?: number;
  onConfirmWithdraw: (
    matchId: string,
    options: {
      reasonCategory: GuestWithdrawReason;
      reasonDetail: string;
      penaltyPoints: number;
      isConvertedToSos: boolean;
      submittedAppeal?: MatchAppealItem;
    }
  ) => void;
}

export function CancelGuestChallengeModal({
  match,
  open,
  onClose,
  guestTeamName = 'Đội Khách',
  guestCaptainPhone = '',
  myTrustScore = 100,
  onConfirmWithdraw,
}: CancelGuestChallengeModalProps) {
  // 1. Tính toán khoảng cách thời gian từ hiện tại tới giờ bóng lăn (phút)
  const diffMinutes = useMemo(() => {
    if (!match) return 300;
    try {
      const kickoff = getMatchKickoffDate({
        matchDate: match.matchDateIso || match.matchDate,
        matchDateIso: match.matchDateIso,
        startTime: match.startTime,
        kickoffTime: match.kickoffTime,
      });
      const diffMs = kickoff.getTime() - Date.now();
      return Math.round(diffMs / (60 * 1000));
    } catch {
      return 180;
    }
  }, [match]);

  // 2. Xác định 4 cấp độ chế tài dựa trên số phút còn lại
  const penaltyTier = useMemo(() => {
    if (diffMinutes > 240) {
      return {
        level: 1,
        penaltyPoints: 0,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Cấp 1: Hủy sớm hợp lệ (> 4 tiếng)',
        description:
          'Báo hủy trước trên 4 tiếng. Bạn được miễn trừ xử phạt hoặc chỉ nhắc nhở nhẹ. Kèo sẽ tự động mở lại trạng thái thường.',
        isSos: false,
      };
    }
    if (diffMinutes > 120) {
      return {
        level: 2,
        penaltyPoints: 15,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        title: 'Cấp 2: Rút lui cận giờ (2h - 4h)',
        description:
          'Báo hủy trong khung 2h - 4h trước trận. Đội bạn bị trừ -15 điểm Uy Tín. Kèo sẽ tự động mở lại để chủ sân tiếp tục tìm đối.',
        isSos: false,
      };
    }
    if (diffMinutes > 60) {
      return {
        level: 3,
        penaltyPoints: 25,
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        title: 'Cấp 3: Hủy sát giờ nguy hiểm (1h - 2h)',
        description:
          'Báo hủy khi chỉ còn 1h - 2h là bóng lăn. Đội bạn bị trừ -25 điểm Uy Tín. Hệ thống sẽ TỰ ĐỘNG CHUYỂN KÈO THÀNH SOS để cứu sân khẩn cấp cho chủ nhà!',
        isSos: true,
      };
    }
    return {
      level: 4,
      penaltyPoints: 40,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      title: 'Cấp 4: Sát giờ bóng lăn (< 1 tiếng)',
      description:
        'Hủy cực sát giờ hoặc bùng kèo. Đội bạn bị trừ -40 điểm Uy Tín và có nguy cơ bị gắn nhãn Đỏ "TỪNG BÙNG KÈO". Kèo tự động đẩy lên đầu Trạm Cứu Hộ SOS!',
      isSos: true,
    };
  }, [diffMinutes]);

  const [reasonCategory, setReasonCategory] =
    useState<GuestWithdrawReason>('LACK_OF_PLAYERS');
  const [reasonDetail, setReasonDetail] = useState('');
  const [isAppealMode, setIsAppealMode] = useState(false);
  const [managerPhone, setManagerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!match) return null;

  const currentGuestTeam =
    match.guestTeam?.name || guestTeamName || 'Đội bạn';
  const effectivePhone =
    match.guestTeam?.captainPhone || guestCaptainPhone || '0988666888';

  const handleConfirm = async () => {
    setErrorMessage(null);
    if (!reasonDetail.trim() || reasonDetail.trim().length < 6) {
      setErrorMessage(
        'Vui lòng nhập chi tiết lý do rút lui (tối thiểu 6 ký tự) để gửi thông báo cho Đội chủ nhà.'
      );
      return;
    }

    setIsSubmitting(true);

    let submittedAppeal: MatchAppealItem | undefined;

    // Nếu người dùng chọn kháng cáo bất khả kháng gửi BQT
    if (isAppealMode && penaltyTier.penaltyPoints > 0) {
      const appealId = `AP-GUEST-${Math.floor(100 + Math.random() * 900)}`;
      submittedAppeal = {
        id: appealId,
        matchId: match.id,
        teamId: match.guestTeam?.id || 'team-guest',
        teamName: currentGuestTeam,
        captainName: match.guestTeam?.captainName || 'Đội Trưởng Khách',
        captainPhone: effectivePhone,
        pitchName: match.pitchName,
        district: match.district,
        matchDate: match.matchDate || 'Hôm nay',
        timeSlot: `${match.startTime} - ${match.endTime}`,
        penaltyPoints: penaltyTier.penaltyPoints,
        previousTrustScore: myTrustScore,
        currentTrustScore: Math.max(0, myTrustScore - penaltyTier.penaltyPoints),
        reasonCategory: reasonCategory as any,
        reasonDetail: `[Đội Khách Rút Lui]: ${reasonDetail.trim()}`,
        managerVerifyPhone: managerPhone.trim() || undefined,
        status: 'PENDING',
        createdAt: 'Vừa xong',
      };

      // Lưu đơn kháng cáo vào admin store
      addStoredAppeal(submittedAppeal);

      // Gửi Telegram alert cho BQT
      await submitMatchAppealAction({
        appealId,
        matchId: match.id,
        teamId: match.guestTeam?.id,
        teamName: currentGuestTeam,
        captainName: match.guestTeam?.captainName || 'Đội Trưởng Khách',
        captainPhone: effectivePhone,
        pitchName: match.pitchName,
        district: match.district,
        timeSlot: `${match.startTime} - ${match.endTime} (${match.matchDate})`,
        penaltyPoints: penaltyTier.penaltyPoints,
        reasonLabel: GUEST_WITHDRAW_REASONS[reasonCategory]?.label || reasonCategory,
        reasonDetail: reasonDetail.trim(),
        managerVerifyPhone: managerPhone.trim() || undefined,
      });
    }

    setIsSubmitting(false);

    onConfirmWithdraw(match.id, {
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      penaltyPoints: isAppealMode ? penaltyTier.penaltyPoints : penaltyTier.penaltyPoints,
      isConvertedToSos: penaltyTier.isSos,
      submittedAppeal,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-[#0c1322] border border-white/10 text-slate-100 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-white/[0.08] bg-slate-950/70">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
              <UserX className="w-4 h-4" />
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-black uppercase tracking-wider text-rose-300 border-rose-500/30"
            >
              RÚT LUI KHỎI KÈO ĐẤU
            </Badge>
          </div>
          <DialogTitle className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>Xác Nhận Hủy Nhận Kèo</span>
            <span className="text-xs text-rose-400 font-semibold">(Đột xuất)</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-300/80">
            Trận đấu tại <strong className="text-white">{match.pitchName}</strong> ({match.startTime} • {match.matchDate})
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* 1. Hộp Cảnh Báo Mốc Thời Gian & Mức Xử Phạt */}
          <div className={`rounded-xl border p-3.5 space-y-2 ${penaltyTier.badgeColor}`}>
            <div className="flex items-center justify-between">
              <div className="font-black text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{penaltyTier.title}</span>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                {diffMinutes > 0
                  ? `Còn ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}p tới trận`
                  : 'Đã tới giờ đá'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {penaltyTier.description}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px]">
              <span className="text-slate-300">Điểm Uy Tín áp dụng:</span>
              <strong className="font-black text-sm">
                {penaltyTier.penaltyPoints > 0
                  ? `-${penaltyTier.penaltyPoints} điểm`
                  : 'Miễn trừ (0 điểm)'}
              </strong>
            </div>
          </div>

          {/* 2. Thông tin Trận đấu & Chủ nhà */}
          <div className="rounded-xl bg-[#040914] border border-white/[0.06] p-3 space-y-1.5">
            <div className="flex items-center justify-between text-slate-300 text-[11px]">
              <span className="flex items-center gap-1 font-semibold text-white">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {match.pitchName}
              </span>
              <span className="font-mono text-amber-300">
                {match.startTime} - {match.endTime}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Chủ sân: <strong className="text-slate-200">{match.hostTeam.name}</strong></span>
              <span>Đội rút lui: <strong className="text-rose-300">{currentGuestTeam}</strong></span>
            </div>
          </div>

          {/* 3. Chọn Lý Do Rút Lui */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-200">
              Lý do rút lui không thể tham gia:
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {(
                Object.keys(GUEST_WITHDRAW_REASONS) as GuestWithdrawReason[]
              ).map((k) => {
                const item = GUEST_WITHDRAW_REASONS[k];
                const isSelected = reasonCategory === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setReasonCategory(k)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500/50 text-white font-bold ring-1 ring-rose-500/40'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{item.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Chi tiết lý do */}
          <div className="space-y-1.5">
            <Label htmlFor="guest-reason-detail" className="text-xs font-bold text-slate-200">
              Mô tả chi tiết sự cố đột xuất:
            </Label>
            <textarea
              id="guest-reason-detail"
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="Ví dụ: Đội em có 2 bạn bị tai nạn nhẹ và 1 bạn tăng ca đột xuất nên chỉ còn 4 người, xin phép anh cho bọn em rút lui..."
              rows={3}
              className="w-full rounded-xl bg-black/50 border border-white/10 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* 5. Tùy chọn: Gửi Đơn Kháng Cáo Bất Khả Kháng (nếu có phạt điểm) */}
          {penaltyTier.penaltyPoints > 0 && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAppealMode}
                  onChange={(e) => setIsAppealMode(e.target.checked)}
                  className="mt-0.5 rounded border-purple-400 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div className="text-[11.5px]">
                  <span className="font-black text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Gửi Đơn Kháng Cáo Bất Khả Kháng lên BQT
                  </span>
                  <p className="text-slate-300 text-[10.5px] mt-0.5 leading-relaxed">
                    Nếu việc rút lui do nguyên nhân khách quan (mưa bão ngập sân, chủ sân cắt điện, tai nạn khẩn cấp), hãy tích chọn để BQT duyệt khôi phục 100 điểm Uy Tín cho đội bạn.
                  </p>
                </div>
              </label>

              {isAppealMode && (
                <div className="pt-2 border-t border-purple-500/20 space-y-1.5">
                  <Label className="text-[11px] text-purple-200 font-bold">
                    SĐT Chủ sân / Quản lý sân để BQT đối chứng:
                  </Label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-2.5" />
                    <Input
                      type="text"
                      value={managerPhone}
                      onChange={(e) => setManagerPhone(e.target.value)}
                      placeholder="09xx.xxx.xxx (để BQT liên hệ xác minh miễn phạt)"
                      className="h-8 pl-8 text-xs bg-black/60 border-purple-500/30 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cơ chế tự động mở lại kèo / SOS */}
          <div className="rounded-xl bg-sky-950/20 border border-sky-500/25 p-2.5 flex items-start gap-2 text-[11px] text-sky-200">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Hệ thống tự động:</strong> Ngay khi bạn bấm xác nhận, bài đăng của Đội chủ nhà sẽ lập tức được{' '}
              {penaltyTier.isSos ? (
                <strong className="text-rose-300">kích hoạt KÈO CỨU HỘ SOS</strong>
              ) : (
                <strong className="text-emerald-300">mở lại slot tìm đối mới</strong>
              )}{' '}
              để đảm bảo chủ sân không bị lỡ trận!
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs h-9"
          >
            Giữ Kèo (Không Hủy)
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-black text-xs gap-1.5 shadow-lg shadow-rose-600/25 active:scale-95"
          >
            <UserX className="w-3.5 h-3.5" />
            <span>
              {isSubmitting
                ? 'Đang xử lý...'
                : isAppealMode
                ? 'Rút Lui & Gửi Kháng Cáo'
                : 'Xác Nhận Rút Lui'}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
