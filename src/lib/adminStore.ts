import { MatchAppealItem, EscrowRecordItem, AppealReasonCategory } from '@/types/matchmaking';

const APPEALS_STORAGE_KEY = 'batkeo7_admin_appeals_v2';
const ESCROW_STORAGE_KEY = 'batkeo7_admin_escrow_v2';
const BROADCAST_STORAGE_KEY = 'batkeo7_admin_broadcasts_v2';

export interface EmergencyBroadcastItem {
  id: string;
  title: string;
  message: string;
  category: 'WEATHER_RAIN' | 'SOS_SUBSIDY' | 'ESCROW_HOURS' | 'CUSTOM';
  createdAt: string;
}

export const INITIAL_APPEALS: MatchAppealItem[] = [];

export const INITIAL_ESCROW_RECORDS: EscrowRecordItem[] = [];

export const APPEAL_REASON_LABELS: Record<
  string,
  { label: string; badgeColor: string; desc: string }
> = {
  WEATHER_FLOOD: {
    label: '🌧️ Mưa bão / Ngập sân không thể đá',
    badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    desc: 'Thời tiết cực đoan, mưa lớn ngập mặt cỏ hoặc sấm sét nguy hiểm',
  },
  FLOODLIGHT_OUTAGE: {
    label: '💡 Sân mất điện / Hỏng dàn đèn chiếu sáng',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    desc: 'Sự cố kỹ thuật điện lưới hoặc nổ tụ đèn tại cụm sân',
  },
  PITCH_DOUBLE_BOOKED: {
    label: '🏟️ Chủ sân báo trùng lịch / Thu hồi sân đột xuất',
    badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    desc: 'Lỗi từ ban quản lý sân cỏ xếp chồng lịch hoặc giải đấu lấy sân',
  },
  MEDICAL_EMERGENCY: {
    label: '🚑 Sự cố y tế / Tai nạn bất khả kháng',
    badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    desc: 'Đội trưởng hoặc trụ cột gặp sự cố khẩn cấp trên đường di chuyển',
  },
  MUTUAL_AGREEMENT: {
    label: '🤝 Hai đội tự thỏa thuận dời lịch hòa bình',
    badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    desc: 'Cả chủ nhà và đội khách đều đồng thuận hủy/dời sang hôm khác',
  },
  OTHER_FORCE_MAJEURE: {
    label: '📋 Lý do khách quan khác (Kèm SĐT xác minh)',
    badgeColor: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
    desc: 'Cung cấp chi tiết lý do và số điện thoại đối chứng',
  },
  WEATHER: {
    label: '🌧️ Mưa bão / Thời tiết cực đoan',
    badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
    desc: 'Mặt cỏ ngập úng không đảm bảo an toàn thi đấu',
  },
  PITCH_ISSUE: {
    label: '🏟️ Sự cố sân bóng / Dàn đèn',
    badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    desc: 'Sân mất điện hoặc ban quản lý xếp trùng lịch',
  },
  OTHER: {
    label: '📋 Lý do bất khả kháng khác',
    badgeColor: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
    desc: 'Có xác minh từ quản lý sân hoặc đối thủ',
  },
};

export const SELECTABLE_APPEAL_REASONS: AppealReasonCategory[] = [
  'WEATHER_FLOOD',
  'FLOODLIGHT_OUTAGE',
  'PITCH_DOUBLE_BOOKED',
  'MEDICAL_EMERGENCY',
  'MUTUAL_AGREEMENT',
  'OTHER_FORCE_MAJEURE',
];

export function getStoredAppeals(): MatchAppealItem[] {
  if (typeof window === 'undefined') return INITIAL_APPEALS;
  try {
    const raw = localStorage.getItem(APPEALS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(INITIAL_APPEALS));
      return INITIAL_APPEALS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_APPEALS;
  }
}

export function saveStoredAppeals(items: MatchAppealItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPEALS_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('batkeo7-admin-sync'));
}

export function addStoredAppeal(appeal: MatchAppealItem): MatchAppealItem[] {
  const current = getStoredAppeals();
  const next = [appeal, ...current];
  saveStoredAppeals(next);
  return next;
}

export function updateStoredAppealStatus(
  id: string,
  status: 'APPROVED' | 'REJECTED',
  adminNote?: string
): MatchAppealItem[] {
  const current = getStoredAppeals();
  const next = current.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          currentTrustScore: status === 'APPROVED' ? 100 : item.currentTrustScore,
          adminNote: adminNote || item.adminNote,
          resolvedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
      : item
  );
  saveStoredAppeals(next);
  return next;
}

export function getStoredEscrowRecords(): EscrowRecordItem[] {
  if (typeof window === 'undefined') return INITIAL_ESCROW_RECORDS;
  try {
    const raw = localStorage.getItem(ESCROW_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(INITIAL_ESCROW_RECORDS));
      return INITIAL_ESCROW_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ESCROW_RECORDS;
  }
}

export function saveStoredEscrowRecords(items: EscrowRecordItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ESCROW_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('batkeo7-admin-sync'));
}

export function addStoredEscrowRecord(record: EscrowRecordItem): EscrowRecordItem[] {
  const current = getStoredEscrowRecords();
  const next = [record, ...current];
  saveStoredEscrowRecords(next);
  return next;
}

export function updateStoredEscrowStatus(
  id: string,
  status: EscrowRecordItem['status'],
  note?: string
): EscrowRecordItem[] {
  const current = getStoredEscrowRecords();
  const next = current.map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          note: note || item.note,
          updatedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
      : item
  );
  saveStoredEscrowRecords(next);
  return next;
}

export function getStoredBroadcasts(): EmergencyBroadcastItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(BROADCAST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addStoredBroadcast(item: EmergencyBroadcastItem): EmergencyBroadcastItem[] {
  if (typeof window === 'undefined') return [];
  const current = getStoredBroadcasts();
  const next = [item, ...current].slice(0, 15);
  localStorage.setItem(BROADCAST_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('batkeo7-admin-sync'));
  return next;
}

export interface RefundReceiptItem {
  id: string;
  teamName: string;
  captainName?: string;
  captainPhone: string;
  amount: number;
  bankShortName?: string;
  bankAccountNo?: string;
  bankAccountName?: string;
  transferCode?: string;
  refundedAt: string;
  note?: string;
}

const LATEST_REFUND_KEY = 'batkeo7_latest_refund_receipt';

export function getLatestRefundReceipt(): RefundReceiptItem | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LATEST_REFUND_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLatestRefundReceipt(receipt: RefundReceiptItem): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LATEST_REFUND_KEY, JSON.stringify(receipt));
  window.dispatchEvent(new CustomEvent('batkeo7-refund-success', { detail: receipt }));
}

export function clearLatestRefundReceipt(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LATEST_REFUND_KEY);
}
