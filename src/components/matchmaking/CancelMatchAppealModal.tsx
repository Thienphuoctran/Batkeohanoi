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
  FileWarning,
  Phone,
  CheckCircle2,
  Trash2,
  Send,
  Sparkles,
  Clock,
  MapPin,
} from 'lucide-react';
import { MatchFeedItem, AppealReasonCategory, MatchAppealItem } from '@/types/matchmaking';
import { APPEAL_REASON_LABELS, addStoredAppeal, SELECTABLE_APPEAL_REASONS } from '@/lib/adminStore';
import { HANOI_PITCHES } from '@/constants/hanoiPitches';
import { submitMatchAppealAction } from '@/actions/auth';

interface CancelMatchAppealModalProps {
  match: MatchFeedItem | null;
  open: boolean;
  onClose: () => void;
  onConfirmCancelMatch: (
    matchId: string,
    options: {
      incurredPenalty: boolean;
      penaltyPoints: number;
      submittedAppeal?: MatchAppealItem;
    }
  ) => void;
}

export function CancelMatchAppealModal({
  match,
  open,
  onClose,
  onConfirmCancelMatch,
}: CancelMatchAppealModalProps) {
  // Check if this match naturally falls under penalty rules (MATCHED or SOS / <2h)
  const isNaturallyPenalized = useMemo(() => {
    if (!match) return false;
    return match.status === 'MATCHED' || Boolean(match.isSOS);
  }, [match]);

  // Allow user to toggle late-cancel simulation if match is OPEN so they can still submit an appeal if cancelling <2h
  const [isLateCancelMode, setIsLateCancelMode] = useState<boolean>(false);
  const showPenaltyAndAppealBox = isNaturallyPenalized || isLateCancelMode;

  const penaltyPoints = useMemo(() => {
    if (!match) return 25;
    if (match.status === 'MATCHED' && match.isSOS) return 40;
    if (match.isSOS || isLateCancelMode) return 40;
    if (match.status === 'MATCHED') return 25;
    return 0;
  }, [match, isLateCancelMode]);

  // Auto-detect pitch manager phone from HANOI_PITCHES if available
  const detectedManagerPhone = useMemo(() => {
    if (!match) return '';
    const found = HANOI_PITCHES.find(
      (p) =>
        match.pitchName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(match.pitchName.toLowerCase())
    );
    return found?.phone || found?.managerPhone || '';
  }, [match]);

  const [reasonCategory, setReasonCategory] = useState<AppealReasonCategory>('WEATHER_FLOOD');
  const [reasonDetail, setReasonDetail] = useState('');
  const [managerPhone, setManagerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appealError, setAppealError] = useState<string | null>(null);

  if (!match) return null;

  const effectiveManagerPhone = managerPhone || detectedManagerPhone;
  const timeSlotLabel = `${match.startTime} - ${match.endTime}`;
  const dateLabel = match.matchDate || 'Hôm nay';
  const hostTrustScore = match.hostTeam.credit?.score ?? 100;

  const handleCancelWithAppeal = async () => {
    setAppealError(null);
    if (!reasonDetail.trim() || reasonDetail.trim().length < 8) {
      setAppealError('Vui lòng nhập chi tiết lý do hủy kèo/sự cố (tối thiểu 8 ký tự) để BQT xét duyệt.');
      return;
    }

    setIsSubmitting(true);
    const appealId = `AP-${Math.floor(100 + Math.random() * 900)}`;
    const prevScore = hostTrustScore;
    const currentScoreAfterPenalty = Math.max(0, prevScore - penaltyPoints);

    const newAppeal: MatchAppealItem = {
      id: appealId,
      matchId: match.id,
      teamId: match.hostTeam.id,
      teamName: match.hostTeam.name,
      captainName: match.hostTeam.captainName,
      captainPhone: match.hostTeam.captainPhone,
      pitchName: match.pitchName,
      district: match.district,
      matchDate: dateLabel,
      timeSlot: timeSlotLabel,
      penaltyPoints,
      previousTrustScore: prevScore,
      currentTrustScore: currentScoreAfterPenalty,
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      managerVerifyPhone: effectiveManagerPhone.trim() || undefined,
      status: 'PENDING',
      createdAt: 'Vừa xong',
    };

    // Lưu vào localStorage để đồng bộ ngay với trang /admin (Đề xuất 2)
    addStoredAppeal(newAppeal);

    // Gửi thông báo về Telegram Bot BQT
    await submitMatchAppealAction({
      appealId,
      matchId: match.id,
      teamId: match.hostTeam.id,
      teamName: match.hostTeam.name,
      captainName: match.hostTeam.captainName,
      captainPhone: match.hostTeam.captainPhone,
      pitchName: match.pitchName,
      district: match.district,
      timeSlot: `${timeSlotLabel} (${dateLabel})`,
      penaltyPoints,
      reasonLabel: APPEAL_REASON_LABELS[reasonCategory]?.label || reasonCategory,
      reasonDetail: reasonDetail.trim(),
      managerVerifyPhone: effectiveManagerPhone.trim() || undefined,
    });

    setIsSubmitting(false);
    onConfirmCancelMatch(match.id, {
      incurredPenalty: true,
      penaltyPoints,
      submittedAppeal: newAppeal,
    });
    onClose();
  };

  const handleDirectCancelWithoutAppeal = () => {
    onConfirmCancelMatch(match.id, {
      incurredPenalty: showPenaltyAndAppealBox,
      penaltyPoints: showPenaltyAndAppealBox ? penaltyPoints : 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-slate-950 border border-slate-800 text-slate-100 max-w-lg max-h-[92vh] overflow-y-auto p-5 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                showPenaltyAndAppealBox
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              }`}
            >
              {showPenaltyAndAppealBox ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white flex items-center gap-2">
                Xác Nhận Hủy / Xóa Kèo Đấu
                {showPenaltyAndAppealBox && (
                  <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">
                    Trừ -{penaltyPoints}đ Uy Tín
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {match.hostTeam.name} • {match.pitchName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tóm tắt thông tin trận đấu */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {match.pitchName} ({match.district})
            </span>
            <Badge
              variant="outline"
              className={
                match.status === 'MATCHED'
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]'
                  : match.isSOS
                  ? 'border-rose-500/40 text-rose-400 bg-rose-500/10 text-[10px]'
                  : 'border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]'
              }
            >
              {match.status === 'MATCHED'
                ? 'ĐÃ CHỐT ĐỐI THỦ'
                : match.isSOS
                ? 'KÈO SOS SÁT GIỜ'
                : 'ĐANG TÌM ĐỐI'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Ca đá: <strong>{timeSlotLabel}</strong> ({dateLabel})
            </span>
            <span className="text-slate-400">
              Uy tín hiện tại:{' '}
              <strong className="text-emerald-400">{hostTrustScore}đ</strong>
            </span>
          </div>
        </div>

        {/* Nếu kèo đang OPEN bình thường, cho phép chọn tình huống hủy sát giờ để mở hộp kháng cáo */}
        {!isNaturallyPenalized && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="text-xs">
              <p className="font-bold text-slate-200">Tình trạng thời gian hủy kèo:</p>
              <p className="text-[11px] text-slate-400">
                Nếu bạn hủy sát giờ lăn bóng (&lt; 2 tiếng) hoặc do sự cố sân bãi, hãy bật chế độ Kháng Cáo.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isLateCancelMode ? 'default' : 'outline'}
              onClick={() => setIsLateCancelMode(!isLateCancelMode)}
              className={
                isLateCancelMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white text-xs shrink-0'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800 text-xs shrink-0'
              }
            >
              {isLateCancelMode ? 'Đang bật: Hủy sát giờ (-40đ)' : 'Hủy sát giờ / Kháng cáo?'}
            </Button>
          </div>
        )}

        {/* Cảnh báo trừ điểm & HỘP KHÁNG CÁO GIẢI OAN */}
        {showPenaltyAndAppealBox ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-950/35 border border-rose-500/40 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                CẢNH BÁO VI PHẠM QUY ĐỊNH HỦY KÈO SÁT GIỜ / ĐÃ CHỐT ĐỐI
              </div>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                Theo quy định BắtKèo7, hủy kèo khi{' '}
                <strong>{match.status === 'MATCHED' ? 'đã bắt cặp thành công' : 'sát giờ thi đấu (< 2h)'}</strong>{' '}
                sẽ tự động bị hệ thống trừ <strong>-{penaltyPoints} điểm Uy Tín</strong> (từ{' '}
                {hostTrustScore}đ xuống còn{' '}
                <strong>{Math.max(0, hostTrustScore - penaltyPoints)}đ</strong>) và gắn nhãn cảnh báo.
              </p>
            </div>

            {/* HỘP KHÁNG CÁO BẤT KHẢ KHÁNG */}
            <div className="p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    🛡️ Hộp Kháng Cáo Bất Khả Kháng (Giải Oan 100đ)
                  </span>
                </div>
                <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                  Duyệt 1-Chạm tại BQT
                </Badge>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Nếu bạn buộc phải hủy kèo vì lý do khách quan (Mưa ngập sân, mất điện dàn đèn, chủ sân báo trùng lịch...), hãy điền thông tin bên dưới. Ban Quản Trị sẽ đối chứng và <strong>khôi phục ngay 100 điểm Uy Tín</strong> cho đội!
              </p>

              {/* Chọn nhóm lý do */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200">
                  1. Chọn nguyên nhân hủy kèo bất khả kháng:
                </Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {SELECTABLE_APPEAL_REASONS.map((key) => {
                    const item = APPEAL_REASON_LABELS[key];
                    if (!item) return null;
                    const selected = reasonCategory === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setReasonCategory(key)}
                        className={`w-full text-left px-3 py-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          selected
                            ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                        {selected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200">
                  2. Mô tả chi tiết sự cố (Bắt buộc khi gửi kháng cáo):
                </Label>
                <textarea
                  rows={2}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="VD: Sân Thành Phát nổ tụ điện sân số 2 lúc 18h30, chủ sân đã xác nhận hoàn cọc..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SĐT Chủ sân / Đối chứng */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>3. SĐT Chủ sân hoặc Đội bạn để BQT gọi xác minh (1 chạm):</span>
                  {detectedManagerPhone && (
                    <span className="text-[10px] text-emerald-400 font-normal">
                      Đã tự điền SĐT chủ sân
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={effectiveManagerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    placeholder="VD: 0903218899 (SĐT Quản lý sân / Đội đối thủ)"
                    className="pl-8 bg-slate-950 border-slate-800 text-xs text-white h-9"
                  />
                </div>
              </div>

              {appealError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                  ⚠️ {appealError}
                </p>
              )}

              {/* Nút hành động chính: Gửi kháng cáo */}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelWithAppeal}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-amber-500/20"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSubmitting
                  ? 'Đang gửi đơn kháng cáo lên BQT...'
                  : '🛡️ Hủy Kèo & Gửi Kháng Cáo Lên BQT (Xin Khôi Phục 100đ)'}
              </Button>
            </div>

            {/* Nút phụ: Chấp nhận bị trừ điểm không kháng cáo */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-9"
              >
                Quay Lại Giữ Kèo
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDirectCancelWithoutAppeal}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs h-9"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Chấp nhận trừ -{penaltyPoints}đ & Xóa kèo (Không kháng cáo)
              </Button>
            </div>
          </div>
        ) : (
          /* Trường hợp kèo đang OPEN bình thường, hủy trước giờ quy định -> Không bị trừ điểm */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                Kèo này đang ở trạng thái <strong>Đang chờ đối (OPEN)</strong> và hủy đúng quy định trước giờ bóng lăn nên đội của bạn <strong>không bị trừ điểm Uy Tín (Giữ nguyên {hostTrustScore}đ)</strong>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Giữ Lại Kèo
              </Button>
              <Button
                type="button"
                onClick={handleDirectCancelWithoutAppeal}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Xác Nhận Xóa Kèo
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
