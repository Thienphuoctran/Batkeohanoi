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
  Handshake,
  Users,
} from 'lucide-react';
import { MatchFeedItem, AppealReasonCategory, MatchAppealItem } from '@/types/matchmaking';
import { APPEAL_REASON_LABELS, addStoredAppeal, SELECTABLE_APPEAL_REASONS } from '@/lib/adminStore';
import { HANOI_PITCHES } from '@/constants/hanoiPitches';
import { submitMatchAppealAction } from '@/actions/auth';
import { getMatchKickoffDate } from '@/lib/matchTime';

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
  onRequestMutualCancel?: (
    matchId: string,
    options: {
      reasonCategory: string;
      reasonDetail: string;
      penaltyPoints: number;
      compensationAmountVnd: number;
    }
  ) => void;
}

export function CancelMatchAppealModal({
  match,
  open,
  onClose,
  onConfirmCancelMatch,
  onRequestMutualCancel,
}: CancelMatchAppealModalProps) {
  // Kiểm tra kèo đã được ghép đối hay chưa
  const isMatched = useMemo(() => {
    if (!match) return false;
    return match.status === 'MATCHED' || Boolean(match.guestTeam);
  }, [match]);

  // Tính toán số phút còn lại tới giờ bóng lăn
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

  // 4 Cấp độ xử phạt theo khoảng thời gian thực tế
  const penaltyTier = useMemo(() => {
    if (!isMatched) {
      return {
        level: 0,
        penaltyPoints: 0,
        compensationVnd: 0,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Chưa có đối • Miễn phạt 100%',
        description: 'Kèo chưa có ai nhận. Bạn được hủy/xóa bình thường mà không bị áp dụng bất kỳ hình phạt nào.',
      };
    }
    if (diffMinutes > 240) {
      return {
        level: 1,
        penaltyPoints: 0,
        compensationVnd: 0,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'Cấp 1: Hủy sớm (> 4 tiếng)',
        description: 'Báo hủy trước trên 4 tiếng khi đã có đối. Miễn phạt Uy Tín nhưng cần gửi yêu cầu cho đối tác xác nhận.',
      };
    }
    if (diffMinutes > 120) {
      return {
        level: 2,
        penaltyPoints: 15,
        compensationVnd: 0,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        title: 'Cấp 2: Hủy cận giờ (2h - 4h)',
        description: 'Báo hủy trong khung 2h - 4h trước trận. Đội chủ nhà bị phạt -15 điểm Uy Tín nếu hủy trận.',
      };
    }
    if (diffMinutes > 60) {
      return {
        level: 3,
        penaltyPoints: 25,
        compensationVnd: 0,
        badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        title: 'Cấp 3: Sát giờ nguy hiểm (1h - 2h)',
        description: 'Báo hủy khi chỉ còn 1h - 2h là bóng lăn. Đội chủ nhà bị phạt -25 điểm Uy Tín (Không áp dụng phạt tiền).',
      };
    }
    return {
      level: 4,
      penaltyPoints: 40,
      compensationVnd: 200000,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      title: 'Cấp 4: Sát giờ bóng lăn (< 1 tiếng)',
      description: 'Hủy sát giờ bóng lăn hoặc bùng kèo. Đội chủ nhà bị phạt -40 điểm Uy Tín, gắn cảnh báo bùng kèo và bồi thường 200.000đ cọc.',
    };
  }, [isMatched, diffMinutes]);

  // Tự động nhận diện SĐT quản lý sân
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
  const [actionError, setActionError] = useState<string | null>(null);

  if (!match) return null;

  const effectiveManagerPhone = managerPhone || detectedManagerPhone;
  const timeSlotLabel = `${match.startTime} - ${match.endTime}`;
  const dateLabel = match.matchDate || 'Hôm nay';
  const hostTrustScore = match.hostTeam.credit?.score ?? 100;
  const guestTeamName = match.guestTeam?.name || 'Đội Khách';
  const guestTeamPhone = match.guestTeam?.captainPhone || '';

  // 1. TRƯỜNG HỢP 1: XÓA KÈO KHI CHƯA CÓ AI NHẬN (MIỄN PHẠT)
  const handleUnmatchedDirectDelete = () => {
    onConfirmCancelMatch(match.id, {
      incurredPenalty: false,
      penaltyPoints: 0,
    });
    onClose();
  };

  // 2. TRƯỜNG HỢP 2A: GỬI YÊU CẦU XIN HỦY KÈO CHỜ ĐỐI TÁC ĐỒNG THUẬN (CƠ CHẾ 2 BÊN)
  const handleSendMutualCancelRequest = () => {
    setActionError(null);
    if (!reasonDetail.trim() || reasonDetail.trim().length < 6) {
      setActionError('Vui lòng nhập chi tiết lý do xin hủy kèo (tối thiểu 6 ký tự) để gửi cho đội đối tác.');
      return;
    }

    if (onRequestMutualCancel) {
      onRequestMutualCancel(match.id, {
        reasonCategory: APPEAL_REASON_LABELS[reasonCategory]?.label || reasonCategory,
        reasonDetail: reasonDetail.trim(),
        penaltyPoints: penaltyTier.penaltyPoints,
        compensationAmountVnd: penaltyTier.compensationVnd,
      });
      onClose();
    }
  };

  // 2. TRƯỜNG HỢP 2B: HỦY ĐƠN PHƯƠNG KHẨN CẤP KÈM ĐƠN KHÁNG CÁO GỬI BQT
  const handleForceCancelWithAppeal = async () => {
    setActionError(null);
    if (!reasonDetail.trim() || reasonDetail.trim().length < 8) {
      setActionError('Vui lòng nhập chi tiết lý do hủy kèo/sự cố (tối thiểu 8 ký tự) để BQT xét duyệt giải oan.');
      return;
    }

    setIsSubmitting(true);
    const appealId = `AP-${Math.floor(100 + Math.random() * 900)}`;
    const prevScore = hostTrustScore;
    const currentScoreAfterPenalty = Math.max(0, prevScore - penaltyTier.penaltyPoints);

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
      penaltyPoints: penaltyTier.penaltyPoints,
      previousTrustScore: prevScore,
      currentTrustScore: currentScoreAfterPenalty,
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      managerVerifyPhone: effectiveManagerPhone.trim() || undefined,
      status: 'PENDING',
      createdAt: 'Vừa xong',
    };

    addStoredAppeal(newAppeal);

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
      penaltyPoints: penaltyTier.penaltyPoints,
      reasonLabel: APPEAL_REASON_LABELS[reasonCategory]?.label || reasonCategory,
      reasonDetail: reasonDetail.trim(),
      managerVerifyPhone: effectiveManagerPhone.trim() || undefined,
    });

    setIsSubmitting(false);
    onConfirmCancelMatch(match.id, {
      incurredPenalty: true,
      penaltyPoints: penaltyTier.penaltyPoints,
      submittedAppeal: newAppeal,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-slate-950 border border-slate-800 text-slate-100 max-w-lg max-h-[92vh] overflow-y-auto p-5 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                isMatched
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isMatched ? <ShieldAlert className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white flex items-center gap-2">
                {isMatched ? 'Hủy Kèo Đã Ghép Đối (Cần Đồng Thuận)' : 'Xóa Kèo Đang Chờ Đối (OPEN)'}
                <Badge className={`${penaltyTier.badgeColor} text-[10px]`}>
                  {penaltyTier.penaltyPoints > 0 ? `Trừ -${penaltyTier.penaltyPoints}đ Uy Tín` : 'Miễn Phạt 100%'}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {match.hostTeam.name} • {match.pitchName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tóm tắt thông tin trận đấu */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs mt-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Sân thi đấu:
            </span>
            <span className="font-bold text-white">
              {match.pitchName} ({match.district})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Thời gian:
            </span>
            <span className="font-bold text-amber-300">
              {match.startTime} - {match.endTime} • {match.matchDate}
            </span>
          </div>
          {isMatched && (
            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                Đối thủ đã ghép:
              </span>
              <span className="font-bold text-sky-300">
                {guestTeamName} {guestTeamPhone ? `(${guestTeamPhone})` : ''}
              </span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* CASE 1: KÈO CHƯA CÓ AI NHẬN (OPEN / SOS) -> XÓA TỰ DO MIỄN PHẠT */}
        {/* ============================================================== */}
        {!isMatched ? (
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300 leading-relaxed">
                Kèo này đang ở trạng thái <strong>Đang chờ đối (OPEN)</strong> và chưa có đội bóng nào nhận đối. Bạn có thể xóa kèo khỏi bảng tin ngay lập tức mà <strong>không bị trừ bất kỳ điểm Uy Tín nào (Giữ nguyên {hostTrustScore}đ)</strong>.
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
                onClick={handleUnmatchedDirectDelete}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Xác Nhận Xóa Kèo
              </Button>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* CASE 2: KÈO ĐÃ ĐƯỢC GHÉP ĐỐI -> ÁP DỤNG CHẾ TÀI & CƠ CHẾ 2 BÊN */
          /* ============================================================== */
          <div className="space-y-4 pt-2">
            {/* Cảnh báo cấp chế tài dựa trên thời gian thực */}
            <div className={`p-3.5 rounded-xl border space-y-1.5 ${
              penaltyTier.level >= 3 ? 'bg-rose-950/30 border-rose-500/40' : 'bg-amber-950/25 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {penaltyTier.title}
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  (Còn {Math.max(0, Math.floor(diffMinutes / 60))}h {Math.max(0, diffMinutes % 60)}m tới giờ đá)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {penaltyTier.description}
              </p>
              {penaltyTier.compensationVnd > 0 && (
                <div className="mt-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  💰 Cam kết bồi thường cho đội khách: <strong>{penaltyTier.compensationVnd.toLocaleString('vi-VN')} VNĐ</strong> (trừ từ ví ký quỹ nếu hủy sát giờ).
                </div>
              )}
            </div>

            {/* Form chọn lý do */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200">
                  1. Chọn nguyên nhân xin hủy trận đấu:
                </Label>
                <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
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

              {/* Chi tiết sự cố */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200">
                  2. Mô tả chi tiết lý do (Bắt buộc):
                </Label>
                <textarea
                  rows={2}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="VD: Sân Thành Phát bị hỏng dàn đèn sân số 1, chủ sân hẹn bù buổi khác..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SĐT Đối chứng / Chủ sân */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                  <span>3. SĐT Chủ sân hoặc Quản lý để xác minh:</span>
                  {detectedManagerPhone && (
                    <span className="text-[10px] text-emerald-400 font-normal">
                      Đã tự điền SĐT sân
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={effectiveManagerPhone}
                    onChange={(e) => setManagerPhone(e.target.value)}
                    placeholder="VD: 0903218899"
                    className="pl-8 bg-slate-950 border-slate-800 text-xs text-white h-9"
                  />
                </div>
              </div>

              {actionError && (
                <p className="text-xs text-rose-400 font-semibold bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
                  ⚠️ {actionError}
                </p>
              )}

              {/* NÚT HÀNH ĐỘNG 1: CƠ CHẾ 2 BÊN ĐỒNG THUẬN */}
              <Button
                type="button"
                onClick={handleSendMutualCancelRequest}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-amber-500/20"
              >
                <Handshake className="w-4 h-4 mr-1.5" />
                🤝 Gửi Yêu Cầu Xin Hủy Cho Đội Khách ({guestTeamName})
              </Button>
            </div>

            {/* NÚT HÀNH ĐỘNG 2: HỦY ĐƠN PHƯƠNG KHẨN CẤP */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
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
                disabled={isSubmitting}
                variant="ghost"
                onClick={handleForceCancelWithAppeal}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-[11px] h-9"
                title="Hủy ngay lập tức và gửi kháng cáo lên BQT nếu đối tác không online"
              >
                <FileWarning className="w-3.5 h-3.5 mr-1" />
                {isSubmitting ? 'Đang gửi...' : `Hủy Đơn Phương (-${penaltyTier.penaltyPoints}đ & Kháng Cáo)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
