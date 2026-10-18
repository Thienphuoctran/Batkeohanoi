'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock,
  MapPin,
  Coins,
  Send,
} from 'lucide-react';
import { MatchFeedItem } from '@/types/matchmaking';

interface RespondCancelRequestModalProps {
  match: MatchFeedItem | null;
  open: boolean;
  onClose: () => void;
  onAcceptCancel: (matchId: string) => Promise<void> | void;
  onRejectCancel: (matchId: string, reason: string) => Promise<void> | void;
}

export function RespondCancelRequestModal({
  match,
  open,
  onClose,
  onAcceptCancel,
  onRejectCancel,
}: RespondCancelRequestModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!match) return null;

  const cancelReq = match.cancelRequest;
  const compensationAmount = cancelReq?.compensationAmountVnd ?? 200000;
  const penaltyPoints = cancelReq?.penaltyPoints ?? 25;
  const reasonText = cancelReq?.reasonDetail || 'Sự cố sân bãi hoặc thiếu người đột xuất';

  const handleConfirmAccept = async () => {
    setIsSubmitting(true);
    try {
      await onAcceptCancel(match.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    setIsSubmitting(true);
    try {
      await onRejectCancel(match.id, rejectReason.trim() || 'Đội khách đã chuẩn bị xong lực lượng, không chấp nhận hủy sát giờ');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="bg-slate-950 border border-slate-800 text-slate-100 max-w-lg max-h-[92vh] overflow-y-auto p-5 rounded-2xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-amber-500/15 border-amber-500/40 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-white flex items-center gap-2">
                Phê Duyệt Yêu Cầu Hủy Kèo
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]">
                  Cần Phản Hồi
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Đội chủ nhà <strong>{match.hostTeam.name}</strong> xin hủy trận đấu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Match Info Summary */}
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs mt-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Sân bóng:
            </span>
            <span className="font-bold text-white">
              {match.pitchName} ({match.district})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Khung giờ:
            </span>
            <span className="font-bold text-amber-300">
              {match.startTime} - {match.endTime} • {match.matchDate}
            </span>
          </div>
        </div>

        {/* Request Reason Box */}
        <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Lý do chủ sân đưa ra:</span>
          </div>
          <p className="text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 italic">
            “{reasonText}”
          </p>
        </div>

        {/* Benefits & Penalties Explanation */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-white flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Quyền lợi của đội bạn khi phản hồi:</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc pl-4">
            {compensationAmount > 0 ? (
              <li>
                Nếu <strong className="text-emerald-400">Đồng Ý Hủy</strong>: Bạn sẽ nhận ngay khoản bồi thường cọc{' '}
                <strong className="text-emerald-400 font-bold">
                  +{compensationAmount.toLocaleString('vi-VN')} VNĐ
                </strong>{' '}
                cộng trực tiếp vào Ví Ký Quỹ. Chủ nhà bị trừ -{penaltyPoints} điểm Uy Tín.
              </li>
            ) : (
              <li>
                Nếu <strong className="text-emerald-400">Đồng Ý Hủy</strong>: Trận đấu hủy hợp lệ trước 4 tiếng, hoàn lại 100% cọc cho hai bên.
              </li>
            )}
            <li>
              Nếu <strong className="text-rose-400">Từ Chối Hủy</strong>: Kèo sẽ chuyển sang trạng thái Tranh Chấp (Disputed). Ban Quản Trị sẽ can thiệp xử phạt chủ nhà vì hành vi bùng kèo sát giờ.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        {!isRejectMode ? (
          <div className="space-y-2 pt-2">
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmAccept}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              {isSubmitting
                ? 'Đang xử lý...'
                : compensationAmount > 0
                ? `✅ Đồng Ý Hủy (Nhận +${compensationAmount.toLocaleString('vi-VN')}đ Bồi Thường)`
                : '✅ Đồng Ý Hủy Trận Đấu (Miễn Phạt Cho Nhau)'}
            </Button>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-9"
              >
                Để Sau
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsRejectMode(true)}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs h-9"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Không đồng ý hủy &amp; Yêu cầu BQT can thiệp
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-rose-300">
                Lý do từ chối hủy (gửi tới Ban Quản Trị):
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="VD: Đội em đã đi đến sân và thuê áo đấu, yêu cầu phạt bùng kèo và bồi thường 100%..."
                className="w-full rounded-xl bg-slate-950 border border-rose-500/30 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRejectMode(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs h-9"
              >
                Quay lại
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReject}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9 rounded-xl shadow-md shadow-rose-600/30"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {isSubmitting ? 'Đang gửi...' : 'Xác Nhận Từ Chối & Báo BQT'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
