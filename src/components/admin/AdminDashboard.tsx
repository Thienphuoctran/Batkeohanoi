'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  ShieldCheck,
  Lock,
  Flame,
  Scale,
  Wallet,
  Radio,
  ArrowLeft,
  Phone,
  CheckCircle2,
  XCircle,
  QrCode,
  AlertTriangle,
  Sparkles,
  Send,
  RefreshCw,
  Clock,
  MapPin,
  TrendingUp,
  Building2,
  Eye,
} from 'lucide-react';
import { MOCK_MATCH_FEEDS } from '@/constants/mockMatchmaking';
import { MatchFeedItem, MatchAppealItem, EscrowRecordItem } from '@/types/matchmaking';
import {
  getStoredAppeals,
  updateStoredAppealStatus,
  addStoredAppeal,
  getStoredEscrowRecords,
  updateStoredEscrowStatus,
  getStoredBroadcasts,
  addStoredBroadcast,
  APPEAL_REASON_LABELS,
  EmergencyBroadcastItem,
  saveLatestRefundReceipt,
} from '@/lib/adminStore';
import {
  resolveMatchAppealAction,
  sendEmergencyBroadcastAction,
} from '@/actions/auth';

const ADMIN_SECRET_PIN = '777888';
const PIN_SESSION_KEY = 'batkeo7_admin_pin_unlocked';

const MATRIX_DISTRICTS = [
  'Cầu Giấy',
  'Thanh Xuân',
  'Hoàng Mai',
  'Nam Từ Liêm',
  'Đống Đa',
  'Hà Đông',
  'Hai Bà Trưng',
];

const MATRIX_SLOTS = [
  { key: '17:30', label: 'Ca 1: 17:30 - 19:00' },
  { key: '19:00', label: 'Ca 2: 19:00 - 20:30' },
  { key: '19:30', label: 'Ca 2B: 19:30 - 21:00' },
  { key: '20:30', label: 'Ca 3: 20:30 - 22:00' },
];

const BROADCAST_TEMPLATES = [
  {
    id: 'RAIN_ALERT',
    category: 'WEATHER_RAIN' as const,
    label: '🌧️ Cảnh báo Mưa Lớn / Ngập Sân',
    title: 'CẢNH BÁO MƯA LỚN TẠI HÀ NỘI — HỖ TRỢ KHÁNG CÁO HỦY KÈO 0Đ',
    message:
      'Hiện tại khu vực Thanh Xuân, Cầu Giấy, Hoàng Mai đang có mưa lớn gây ngập một số cụm sân. Các đội bóng buộc phải hủy kèo do sân ngập hoặc mất điện vui lòng chọn "Hủy Kèo & Gửi Kháng Cáo" trên web để BQT khôi phục 100 điểm Uy Tín và hoàn cọc 100%!',
  },
  {
    id: 'SOS_SUBSIDY',
    category: 'SOS_SUBSIDY' as const,
    label: '🔥 Kêu gọi Cứu Trợ Kèo SOS (Tặng 100k)',
    title: 'CỨU TRỢ KÈO SOS GIỜ VÀNG TỐI NAY — TÀI TRỢ NGAY 100K TIỀN NƯỚC',
    message:
      'Đang có kèo SOS thiếu đối thủ gấp khung giờ 19:00 và 20:30 tối nay! Đội khách nào bấm "Nhận Kèo SOS" ngay bây giờ sẽ được Quỹ Bình Ổn BắtKèo7 tài trợ trực tiếp 100.000đ tiền nước tại sân + Cộng +15 Điểm Uy Tín!',
  },
  {
    id: 'ESCROW_HOURS',
    category: 'ESCROW_HOURS' as const,
    label: '🏦 Giờ Đối Soát & Hoàn Cọc Ví 200k',
    title: 'THÔNG BÁO ĐỐI SOÁT & HOÀN TIỀN VÍ KÝ QUỸ TRƯỚC 22H00',
    message:
      'Ban Quản Trị BắtKèo7 đang thực hiện đợt đối soát hoàn cọc 200.000đ cho các trận đấu đã hoàn thành trong ngày. Anh em Đội trưởng có lệnh rút tiền vui lòng kiểm tra STK ngân hàng (Xử lý trong 5-15 phút, muộn nhất trước 20h00 - 22h00 mỗi tối).',
  },
];

export function AdminDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [matches, setMatches] = useState<MatchFeedItem[]>(MOCK_MATCH_FEEDS);
  const [appeals, setAppeals] = useState<MatchAppealItem[]>([]);
  const [escrowRecords, setEscrowRecords] = useState<EscrowRecordItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcastItem[]>([]);

  // Selected items for modals / actions
  const [selectedMatrixMatch, setSelectedMatrixMatch] = useState<MatchFeedItem | null>(null);
  const [rejectingAppealId, setRejectingAppealId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [qrPreviewRecord, setQrPreviewRecord] = useState<EscrowRecordItem | null>(null);
  const [forfeitingRecord, setForfeitingRecord] = useState<EscrowRecordItem | null>(null);
  const [victimTeamName, setVictimTeamName] = useState('');
  const [victimBankBin, setVictimBankBin] = useState('MB');
  const [victimAccountNo, setVictimAccountNo] = useState('');
  const [victimAccountName, setVictimAccountName] = useState('');
  const [forfeitOption, setForfeitOption] = useState<'VICTIM' | 'SOS'>('VICTIM');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Broadcast form
  const [broadcastTitle, setBroadcastTitle] = useState(BROADCAST_TEMPLATES[0].title);
  const [broadcastMessage, setBroadcastMessage] = useState(BROADCAST_TEMPLATES[0].message);
  const [broadcastCategory, setBroadcastCategory] =
    useState<EmergencyBroadcastItem['category']>('WEATHER_RAIN');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 4500);
  };

  const syncDataFromStorage = () => {
    setAppeals(getStoredAppeals());
    setEscrowRecords(getStoredEscrowRecords());
    setBroadcasts(getStoredBroadcasts());
    try {
      const savedMatches = localStorage.getItem('batkeo7_matches_v1');
      if (savedMatches) {
        const parsed = JSON.parse(savedMatches);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMatches(parsed);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const unlocked = sessionStorage.getItem(PIN_SESSION_KEY) === 'true';
      setIsUnlocked(unlocked);
      syncDataFromStorage();

      const handleSync = () => syncDataFromStorage();
      window.addEventListener('batkeo7-admin-sync', handleSync);
      window.addEventListener('storage', handleSync);
      return () => {
        window.removeEventListener('batkeo7-admin-sync', handleSync);
        window.removeEventListener('storage', handleSync);
      };
    }
  }, []);

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_SECRET_PIN) {
      sessionStorage.setItem(PIN_SESSION_KEY, 'true');
      setIsUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Mã PIN Quản Trị không chính xác! (Gợi ý mặc định cho Founder: 777888)');
    }
  };

  // KPI Metrics
  const pendingAppealsCount = useMemo(
    () => appeals.filter((a) => a.status === 'PENDING').length,
    [appeals]
  );
  const sosMatchesCount = useMemo(
    () => matches.filter((m) => m.isSOS && m.status === 'OPEN').length,
    [matches]
  );
  const activeEscrowTotal = useMemo(
    () =>
      escrowRecords
        .filter(
          (r) =>
            r.status === 'PENDING_APPROVAL' ||
            r.status === 'LOCKED_IN_MATCH' ||
            r.status === 'WITHDRAW_REQUESTED'
        )
        .reduce((sum, r) => sum + r.amount, 0),
    [escrowRecords]
  );
  const sosSubsidyFundTotal = useMemo(
    () =>
      escrowRecords
        .filter((r) => r.status === 'FORFEITED_TO_SOS_FUND')
        .reduce((sum, r) => sum + r.amount, 0),
    [escrowRecords]
  );

  // Proposal 2: 1-Click Appeal Resolution
  const handleApproveAppeal = async (appeal: MatchAppealItem) => {
    const next = updateStoredAppealStatus(
      appeal.id,
      'APPROVED',
      'BQT đã xác minh sự cố khách quan & khôi phục 100 điểm Uy Tín.'
    );
    setAppeals(next);

    // Đồng bộ khôi phục 100 điểm uy tín vào localStorage cho đội chủ nhà nếu đang lưu
    if (typeof window !== 'undefined') {
      localStorage.setItem('batkeo7_restored_trust_score', '100');
      window.dispatchEvent(new CustomEvent('batkeo7-trust-restored', { detail: { teamName: appeal.teamName, trustScore: 100 } }));
    }

    await resolveMatchAppealAction({
      appealId: appeal.id,
      teamId: appeal.teamId,
      teamName: appeal.teamName,
      decision: 'APPROVED',
      adminNote: 'Đã xác minh sự cố khách quan, khôi phục 100 điểm Uy Tín.',
    });

    showToast(`✅ Đã DUYỆT kháng cáo ${appeal.id}! Khôi phục 100 điểm Uy Tín cho ${appeal.teamName}.`);
  };

  const handleRejectAppeal = async (appeal: MatchAppealItem) => {
    const note = rejectNote.trim() || 'Không đủ căn cứ bất khả kháng sau khi đối chứng SĐT sân.';
    const next = updateStoredAppealStatus(appeal.id, 'REJECTED', note);
    setAppeals(next);
    setRejectingAppealId(null);
    setRejectNote('');

    await resolveMatchAppealAction({
      appealId: appeal.id,
      teamId: appeal.teamId,
      teamName: appeal.teamName,
      decision: 'REJECTED',
      adminNote: note,
    });

    showToast(`❌ Đã BÁC BỎ kháng cáo ${appeal.id} của ${appeal.teamName}. Giữ nguyên mức trừ -${appeal.penaltyPoints}đ.`);
  };

  const handleCreateDemoAppeal = () => {
    const demoId = `AP-${Math.floor(100 + Math.random() * 900)}`;
    const demoAppeal: MatchAppealItem = {
      id: demoId,
      matchId: 'm-demo',
      teamName: 'FC Anh Em Thanh Xuân',
      captainName: 'Hải Đăng (C)',
      captainPhone: '0977112288',
      pitchName: 'Cụm Sân Đầm Hồng 2 - Khương Trung',
      district: 'Thanh Xuân',
      matchDate: 'Hôm nay',
      timeSlot: '19:00 - 20:30',
      penaltyPoints: 25,
      previousTrustScore: 100,
      currentTrustScore: 75,
      reasonCategory: 'WEATHER_FLOOD',
      reasonDetail: 'Mưa lớn 45 phút làm ngập mặt cỏ sân số 1 Đầm Hồng, chủ sân xác nhận cho nghỉ và bảo lưu tiền sân.',
      managerVerifyPhone: '0912345678',
      status: 'PENDING',
      createdAt: 'Vừa xong',
    };
    const next = addStoredAppeal(demoAppeal);
    setAppeals(next);
    showToast(`⚖️ Đã tạo đơn kháng cáo mẫu ${demoId} để Admin test duyệt 1-chạm!`);
  };

  // Proposal 3: Escrow 200k 3-Step Handlers
  const handleEscrowStep1ApproveDeposit = (record: EscrowRecordItem) => {
    const next = updateStoredEscrowStatus(
      record.id,
      'LOCKED_IN_MATCH',
      'Đã nhận đủ 200.000đ vào TK MB Bank 07440948327598 — Đã mở khóa kèo!'
    );
    setEscrowRecords(next);
    showToast(`✅ Bước 1 hoàn tất: Đã duyệt cọc 200.000đ mã ${record.transferCode} cho ${record.teamName}!`);
  };

  const handleEscrowStep2Refund = (record: EscrowRecordItem) => {
    const next = updateStoredEscrowStatus(
      record.id,
      'REFUNDED',
      'Đã chuyển khoản hoàn 100% cọc (200.000đ) về STK Đội trưởng.'
    );
    setEscrowRecords(next);
    setQrPreviewRecord(null);

    // Bắn thông báo hoàn tiền cọc thành công sang giao diện khách hàng (web & ví)
    saveLatestRefundReceipt({
      id: record.id,
      teamName: record.teamName,
      captainName: record.captainName || 'Đội trưởng',
      captainPhone: record.captainPhone,
      amount: record.amount,
      bankShortName: record.bankShortName || record.bankName || 'MBBank',
      bankAccountNo: record.bankAccountNo || record.accountNumber || '',
      bankAccountName: record.bankAccountName || record.accountName || '',
      transferCode: record.transferCode || record.id,
      refundedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      note: 'BQT BắtKèo7 đã hoàn tất chuyển khoản 200.000đ hoàn cọc về STK của bạn qua Napas247.',
    });

    showToast(`💸 Bước 2 hoàn tất: Đã xác nhận hoàn cọc 200.000đ về ${record.bankShortName || 'ngân hàng'} cho ${record.teamName}!`);
  };

  const handleOpenForfeitModal = (record: EscrowRecordItem) => {
    setForfeitingRecord(record);
    setForfeitOption('VICTIM');
    setVictimTeamName('');
    setVictimAccountNo('');
    setVictimAccountName('');
  };

  const handleConfirmForfeitToVictim = () => {
    if (!forfeitingRecord) return;
    const note = `Đã tịch thu cọc 200.000đ của ${forfeitingRecord.teamName} do bùng kèo & bồi hoàn tiền sân cho ${victimTeamName || 'Đội bị bùng'} (${victimBankBin} - ${victimAccountNo || 'Đã nhận'}).`;
    const next = updateStoredEscrowStatus(forfeitingRecord.id, 'FORFEITED', note);
    setEscrowRecords(next);
    setForfeitingRecord(null);
    showToast(`🛡️ Đã tịch thu cọc 200.000đ của ${forfeitingRecord.teamName} & bồi hoàn tiền sân cho ${victimTeamName || 'Đội bị bùng'}!`);
  };

  const handleConfirmForfeitToSos = () => {
    if (!forfeitingRecord) return;
    const note = `Tịch thu 200.000đ của ${forfeitingRecord.teamName} do bùng kèo — Chuyển vào Quỹ Cứu Trợ Kèo SOS.`;
    const next = updateStoredEscrowStatus(forfeitingRecord.id, 'FORFEITED_TO_SOS_FUND', note);
    setEscrowRecords(next);
    setForfeitingRecord(null);
    showToast(`🔥 Đã tịch thu 200.000đ của ${forfeitingRecord.teamName} nạp vào Quỹ Cứu Trợ Kèo SOS!`);
  };

  // Proposal 5: Emergency Broadcast Handler
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);

    const newItem: EmergencyBroadcastItem = {
      id: `BC-${Date.now().toString().slice(-4)}`,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      category: broadcastCategory,
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const next = addStoredBroadcast(newItem);
    setBroadcasts(next);

    await sendEmergencyBroadcastAction({
      title: newItem.title,
      message: newItem.message,
      category: newItem.category,
    });

    setIsSendingBroadcast(false);
    showToast('📢 Đã phát sóng thông báo khẩn cấp tới Telegram @BatKeo7_AlertBot và Chuông thông báo toàn sàn!');
  };

  // Lock Screen if PIN not entered
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-900/95 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Lock className="w-7 h-7" />
            </div>
            <CardTitle className="text-xl font-black text-white tracking-tight">
              BẮTKÈO7 ADMIN HUB
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Trung Tâm Chỉ Huy & Điều Phối Sàn Bóng Đá Phủi Hà Nội
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleUnlockPin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-300">
                  Nhập Mã PIN Bí Mật Dành Cho Founder / BQT:
                </Label>
                <Input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Nhập mã PIN 6 số (Mặc định: 777888)"
                  className="bg-slate-950 border-slate-700 text-center text-lg font-black tracking-[0.35em] text-emerald-400 h-12 rounded-xl"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 text-center">
                  💡 Mã PIN mặc định cho Chủ dự án (Founder):{' '}
                  <button
                    type="button"
                    onClick={() => setPinInput('777888')}
                    className="text-emerald-400 font-bold underline hover:text-emerald-300"
                  >
                    777888 (Bấm để điền nhanh)
                  </button>
                </p>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-300 font-semibold text-center">
                  {pinError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Mở Khóa Trung Tâm Quản Trị
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Quay về Trang Chủ BắtKèo7
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 pb-16">
      {/* Top Command Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
              title="Quay lại Sàn Bắt Kèo"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  BẮTKÈO<span className="text-emerald-400">7</span> COMMAND CENTER
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                  LIVE ADMIN HUB
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Quản trị viên: <strong>TRAN QUOC THIEN PHUOC</strong> • MB Bank: <code>07440948327598</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={syncDataFromStorage}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs h-9 rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Làm mới dữ liệu
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                sessionStorage.removeItem(PIN_SESSION_KEY);
                setIsUnlocked(false);
              }}
              className="text-slate-400 hover:text-rose-400 text-xs h-9"
            >
              <Lock className="w-3.5 h-3.5 mr-1" />
              Khóa PIN
            </Button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 border-2 border-emerald-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold leading-relaxed">{actionToast}</p>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-6 space-y-6">
        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="bg-slate-900/90 border-slate-800 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Tổng Kèo Sàn Hôm Nay</p>
                <p className="text-2xl font-black text-white mt-1">{matches.length} Kèo</p>
                <p className="text-[11px] text-emerald-400 mt-0.5">
                  {matches.filter((m) => m.status === 'MATCHED').length} đã chốt •{' '}
                  {matches.filter((m) => m.status === 'OPEN').length} chờ đối
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-rose-500/30 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-rose-300 font-semibold uppercase">Kèo SOS Sát Giờ (&lt;2h)</p>
                <p className="text-2xl font-black text-rose-400 mt-1">{sosMatchesCount} SOS</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quỹ trợ giá SOS: <strong className="text-amber-300">{sosSubsidyFundTotal.toLocaleString('vi-VN')}đ</strong>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 animate-pulse">
                <Flame className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-amber-500/30 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-amber-300 font-semibold uppercase">Đơn Kháng Cáo Chờ Duyệt</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{pendingAppealsCount} Đơn</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Tổng lịch sử: {appeals.length} đơn kháng cáo
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Scale className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/90 border-sky-500/30 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-sky-300 font-semibold uppercase">Quỹ Ký Quỹ Đang Giữ</p>
                <p className="text-2xl font-black text-sky-400 mt-1">
                  {activeEscrowTotal.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {escrowRecords.filter((r) => r.status === 'WITHDRAW_REQUESTED').length} lệnh chờ hoàn cọc
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Wallet className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main 4 Operational Pillars (Proposals 1, 2, 3, 5 — Proposal 4 Excluded per User Request) */}
        <Tabs defaultValue="appeals" className="space-y-4">
          <TabsList className="bg-slate-900/95 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap h-auto gap-1.5">
            <TabsTrigger
              value="appeals"
              className="flex-1 min-w-[180px] data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-black text-xs py-2.5 rounded-xl"
            >
              <Scale className="w-4 h-4 mr-1.5" />
              1. Trạm Duyệt Kháng Cáo ({pendingAppealsCount})
            </TabsTrigger>
            <TabsTrigger
              value="escrow"
              className="flex-1 min-w-[180px] data-[state=active]:bg-sky-500 data-[state=active]:text-slate-950 font-black text-xs py-2.5 rounded-xl"
            >
              <Wallet className="w-4 h-4 mr-1.5" />
              2. Đối Soát Cọc 200k ({escrowRecords.length})
            </TabsTrigger>
            <TabsTrigger
              value="matrix"
              className="flex-1 min-w-[180px] data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 font-black text-xs py-2.5 rounded-xl"
            >
              <Flame className="w-4 h-4 mr-1.5" />
              3. Ma Trận Nhiệt Độ Kèo Đấu
            </TabsTrigger>
            <TabsTrigger
              value="broadcast"
              className="flex-1 min-w-[180px] data-[state=active]:bg-purple-500 data-[state=active]:text-white font-black text-xs py-2.5 rounded-xl"
            >
              <Radio className="w-4 h-4 mr-1.5" />
              4. Phát Sóng Khẩn Cấp Telegram
            </TabsTrigger>
          </TabsList>

          {/* TAB 1 (ĐỀ XUẤT 2): TRẠM XÉT DUYỆT KHÁNG CÁO 1-CHẠM */}
          <TabsContent value="appeals" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80 flex flex-row flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-black text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" />
                    Trạm Xét Duyệt Kháng Cáo Bất Khả Kháng 1-Chạm (Appeal Fast-Track)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-1">
                    Khi đội bóng bấm <strong>&quot;Hủy Kèo / Xóa Kèo&quot;</strong> trên trang chủ trong trường hợp bị trừ điểm (hủy sát giờ hoặc đã chốt đối), đơn kháng cáo từ <strong>Hộp Kháng Cáo</strong> sẽ đổ trực tiếp về đây.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {appeals.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Hiện chưa có đơn kháng cáo nào.
                  </div>
                ) : (
                  appeals.map((appeal) => {
                    const reasonInfo =
                      APPEAL_REASON_LABELS[appeal.reasonCategory] ||
                      APPEAL_REASON_LABELS.OTHER_FORCE_MAJEURE;

                    return (
                      <div
                        key={appeal.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          appeal.status === 'PENDING'
                            ? 'bg-slate-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : appeal.status === 'APPROVED'
                            ? 'bg-emerald-950/15 border-emerald-500/30'
                            : 'bg-rose-950/15 border-rose-500/30'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="bg-slate-800 text-slate-200 border-slate-700 text-[10px] font-mono">
                                #{appeal.id}
                              </Badge>
                              <span className="text-sm font-black text-white">
                                {appeal.teamName}
                              </span>
                              <span className="text-xs text-slate-400">
                                • ĐT: <strong className="text-slate-200">{appeal.captainName}</strong> ({appeal.captainPhone})
                              </span>
                              <Badge className={`border text-[10px] ${reasonInfo.badgeColor}`}>
                                {reasonInfo.label}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                {appeal.pitchName} ({appeal.district})
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-sky-400" />
                                Ca đá: {appeal.timeSlot} ({appeal.matchDate})
                              </span>
                              <span>• Gửi lúc: {appeal.createdAt}</span>
                            </div>
                          </div>

                          {/* Trạng thái điểm Uy tín */}
                          <div className="flex items-center gap-2">
                            {appeal.status === 'PENDING' && (
                              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-bold">
                                Đang tạm trừ -{appeal.penaltyPoints}đ ({appeal.previousTrustScore}đ ➔ {appeal.currentTrustScore}đ)
                              </Badge>
                            )}
                            {appeal.status === 'APPROVED' && (
                              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold">
                                ✅ ĐÃ DUYỆT — KHÔI PHỤC 100Đ UY TÍN
                              </Badge>
                            )}
                            {appeal.status === 'REJECTED' && (
                              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-bold">
                                ❌ ĐÃ BÁC BỎ — GIỮ ÁN PHẠT (-{appeal.penaltyPoints}Đ)
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Nội dung giải trình từ Hộp Kháng Cáo */}
                        <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                          <p className="text-slate-200 leading-relaxed">
                            <strong className="text-amber-300">Giải trình từ Đội trưởng:</strong>{' '}
                            &ldquo;{appeal.reasonDetail}&rdquo;
                          </p>
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            <span className="text-slate-400">
                              📞 SĐT Chủ sân / Đối chứng:{' '}
                              <strong className="text-emerald-400">
                                {appeal.managerVerifyPhone || 'Không đính kèm'}
                              </strong>
                            </span>
                            <div className="flex items-center gap-2">
                              {appeal.managerVerifyPhone && (
                                <a
                                  href={`tel:${appeal.managerVerifyPhone}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-bold"
                                >
                                  <Phone className="w-3 h-3" />
                                  Gọi Chủ Sân Xác Minh ({appeal.managerVerifyPhone})
                                </a>
                              )}
                              <a
                                href={`tel:${appeal.captainPhone}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 text-[11px] font-bold"
                              >
                                <Phone className="w-3 h-3" />
                                Gọi Đội Trưởng
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Nút 1-Click Duyệt / Bác Bỏ */}
                        {appeal.status === 'PENDING' ? (
                          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2.5">
                            {rejectingAppealId === appeal.id ? (
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                                <Input
                                  value={rejectNote}
                                  onChange={(e) => setRejectNote(e.target.value)}
                                  placeholder="Nhập lý do bác bỏ (VD: Chủ sân báo đèn vẫn sáng bình thường)..."
                                  className="bg-slate-950 border-slate-800 text-xs text-white h-9 flex-1"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setRejectingAppealId(null)}
                                    className="text-xs text-slate-400 h-9"
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleRejectAppeal(appeal)}
                                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs h-9"
                                  >
                                    Xác Nhận Bác Bỏ
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap items-center justify-end gap-2.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRejectingAppealId(appeal.id)}
                                  className="border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold text-xs h-9 rounded-xl"
                                >
                                  <XCircle className="w-4 h-4 mr-1.5" />
                                  ❌ Bác Bỏ (Giữ nguyên mức phạt -{appeal.penaltyPoints}đ)
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveAppeal(appeal)}
                                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs h-9 rounded-xl shadow-lg shadow-emerald-500/20"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                  ✅ Duyệt Kháng Cáo (Khôi phục 100đ & Gỡ nhãn phạt)
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              Ghi chú BQT: <strong className="text-slate-300">{appeal.adminNote}</strong>
                            </span>
                            {appeal.resolvedAt && <span>Xử lý lúc: {appeal.resolvedAt}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2 (ĐỀ XUẤT 3): ĐỐI SOÁT TIỀN CỌC 200K KHÉP KÍN */}
          <TabsContent value="escrow" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base font-black text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-sky-400" />
                      Quy Trình Đối Soát Tiền Cọc 200.000đ Khép Kín (Escrow Life-cycle)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Tài khoản nhận quỹ: <strong>MB Bank — 07440948327598 (TRAN QUOC THIEN PHUOC)</strong> • Khung giờ hoàn cọc: Trước 22h00 hàng ngày.
                    </CardDescription>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                    Quỹ Cứu Trợ Kèo SOS (Từ cọc phạt):{' '}
                    <strong className="text-amber-300 font-black">
                      {sosSubsidyFundTotal.toLocaleString('vi-VN')} VNĐ
                    </strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {escrowRecords.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    Hiện chưa có giao dịch ký quỹ nào trong hệ thống.
                  </div>
                ) : (
                  escrowRecords.map((rec) => {
                    const bin = rec.bankBin || rec.bankCode || '970422';
                    const accNo = rec.bankAccountNo || rec.accountNumber || '07440948327598';
                    const code = rec.transferCode || rec.id;
                    const accName = rec.bankAccountName || rec.accountName || 'CHU TAI KHOAN';

                    const vietQrUrl = `https://img.vietqr.io/image/${bin}-${accNo}-compact2.png?amount=${rec.amount}&addInfo=${encodeURIComponent(
                      `HOAN COC ${code}`
                    )}&accountName=${encodeURIComponent(accName)}`;

                    return (
                      <div
                        key={rec.id}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-sky-500/15 text-sky-300 border-sky-500/30 font-mono text-xs">
                              {rec.transferCode}
                            </Badge>
                            <span className="text-sm font-black text-white">{rec.teamName}</span>
                            <span className="text-xs text-slate-400">
                              • ĐT: {rec.captainName} ({rec.captainPhone})
                            </span>
                            <Badge
                              className={
                                rec.status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px]'
                                  : rec.status === 'LOCKED_IN_MATCH'
                                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 text-[10px]'
                                  : rec.status === 'WITHDRAW_REQUESTED'
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] animate-pulse'
                                  : rec.status === 'REFUNDED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]'
                                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]'
                              }
                            >
                              {rec.status === 'PENDING_APPROVAL' && '⏳ BƯỚC 1: CHỜ DUYỆT NẠP CỌC 200K'}
                              {rec.status === 'LOCKED_IN_MATCH' && '🔒 ĐANG TẠM GIỮ TRONG KÈO'}
                              {rec.status === 'WITHDRAW_REQUESTED' && '💸 BƯỚC 2: YÊU CẦU RÚT / HOÀN CỌC 200K'}
                              {rec.status === 'REFUNDED' && '✅ ĐÃ HOÀN CỌC 100% VỀ STK ĐỘI'}
                              {rec.status === 'FORFEITED' && '🛡️ ĐÃ BỒI THƯỜNG CHO ĐỘI BỊ BÙNG'}
                              {rec.status === 'FORFEITED_TO_SOS_FUND' && '🔥 ĐÃ TỊCH THU VÀO QUỸ SOS'}
                            </Badge>
                          </div>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                            <span>🏟️ {rec.pitchName}</span>
                            <span>🕒 {rec.timeSlot}</span>
                            <span className="text-slate-300">
                              <Building2 className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                              STK Nhận hoàn:{' '}
                              <strong>
                                {rec.bankShortName} - {rec.bankAccountNo} ({rec.bankAccountName})
                              </strong>
                            </span>
                          </div>

                          {rec.note && (
                            <p className="text-[11px] text-emerald-400/90 italic">📌 {rec.note}</p>
                          )}
                        </div>

                        {/* 3-Step Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {rec.status === 'PENDING_APPROVAL' && (
                            <Button
                              size="sm"
                              onClick={() => handleEscrowStep1ApproveDeposit(rec)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-9 rounded-xl"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              Bước 1: Duyệt Cọc 200k & Mở Khóa Kèo
                            </Button>
                          )}

                          {(rec.status === 'LOCKED_IN_MATCH' ||
                            rec.status === 'WITHDRAW_REQUESTED') && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setQrPreviewRecord(qrPreviewRecord?.id === rec.id ? null : rec)
                                }
                                className="border-sky-500/40 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 font-bold text-xs h-9 rounded-xl"
                              >
                                <QrCode className="w-3.5 h-3.5 mr-1.5" />
                                Quét VietQR Hoàn 200k
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleEscrowStep2Refund(rec)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-9 rounded-xl"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Bước 2: Xác Nhận Đã Hoàn 100%
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenForfeitModal(rec)}
                                className="border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 font-bold text-xs h-9 rounded-xl"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                                Bước 3: Tịch Thu Cọc (Bùng Kèo)
                              </Button>
                            </>
                          )}

                        {/* VietQR Inline Drawer when clicked */}
                        {qrPreviewRecord?.id === rec.id && (
                          <div className="w-full mt-3 p-3.5 rounded-2xl bg-slate-900 border border-sky-500/40 flex flex-col sm:flex-row items-center gap-4">
                            <img
                              src={rec.customQrImageUrl || vietQrUrl}
                              alt="VietQR Hoàn Cọc"
                              className="w-36 h-36 rounded-xl bg-white p-1.5 object-contain shrink-0"
                            />
                            <div className="space-y-1.5 text-xs">
                              <p className="font-black text-sky-300 uppercase">
                                Mã QR Chuyển Khoản Hoàn Cọc 200.000đ
                              </p>
                              <p className="text-slate-300">
                                • Ngân hàng thụ hưởng: <strong>{rec.bankShortName || rec.bankName || 'MBBank'}</strong>
                              </p>
                              <p className="text-slate-300">
                                • Số tài khoản: <code>{rec.bankAccountNo || rec.accountNumber || '—'}</code>
                              </p>
                              <p className="text-slate-300">
                                • Chủ tài khoản: <strong>{rec.bankAccountName || rec.accountName || 'CHU TAI KHOAN'}</strong>
                              </p>
                              <p className="text-[11px] text-slate-400">
                                Mở app MB Bank của Admin quét mã trên để tự điền đúng 200.000đ, sau đó bấm <strong>&quot;Bước 2: Xác Nhận Đã Hoàn 100%&quot;</strong>.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3 (ĐỀ XUẤT 1): MA TRẬN NHIỆT ĐỘ KÈO ĐẤU THEO KHUNG GIỜ & QUẬN */}
          <TabsContent value="matrix" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-black text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-emerald-400" />
                      Ma Trận Nhiệt Độ Kèo Đấu Theo Khung Giờ Vàng & Quận (Live Match Matrix)
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 mt-1">
                      Bấm vào từng ô kèo đấu để xem nhanh SĐT 2 Đội trưởng hoặc kích hoạt gói trợ giá SOS.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                      Đã chốt (MATCHED)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      Đang tìm đối (OPEN)
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
                      SOS Sát Giờ (&lt;2h)
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4 overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 px-3 text-left font-bold uppercase">Quận / Khu vực</th>
                      {MATRIX_SLOTS.map((slot) => (
                        <th key={slot.key} className="py-2.5 px-3 text-left font-bold uppercase">
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {MATRIX_DISTRICTS.map((district) => (
                      <tr key={district} className="hover:bg-slate-950/40">
                        <td className="py-3 px-3 font-black text-white whitespace-nowrap">
                          📍 {district}
                        </td>
                        {MATRIX_SLOTS.map((slot) => {
                          const cellMatches = matches.filter(
                            (m) =>
                              m.district.toLowerCase().includes(district.toLowerCase()) &&
                              m.startTime.startsWith(slot.key)
                          );

                          return (
                            <td key={slot.key} className="py-2.5 px-3 align-top">
                              {cellMatches.length === 0 ? (
                                <span className="text-[11px] text-slate-600">— Trống —</span>
                              ) : (
                                <div className="space-y-1.5">
                                  {cellMatches.map((m) => {
                                    const isMatched = m.status === 'MATCHED';
                                    const isSos = m.isSOS && !isMatched;
                                    return (
                                      <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setSelectedMatrixMatch(m)}
                                        className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                                          isMatched
                                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/25'
                                            : isSos
                                            ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 animate-pulse hover:bg-rose-500/30'
                                            : 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                                        }`}
                                      >
                                        <div className="truncate">
                                          <div className="font-black text-[11px] truncate">
                                            {m.hostTeam.name}
                                          </div>
                                          <div className="text-[10px] opacity-80 truncate">
                                            {m.pitchName}
                                          </div>
                                        </div>
                                        <Eye className="w-3.5 h-3.5 shrink-0 opacity-75" />
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Chi tiết kèo khi bấm vào ô trên Ma Trận */}
                {selectedMatrixMatch && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                          CHI TIẾT CA ĐẤU
                        </Badge>
                        <span className="font-black text-white text-sm">
                          {selectedMatrixMatch.hostTeam.name} (Tier {selectedMatrixMatch.requiredTier})
                        </span>
                      </div>
                      <p className="text-slate-300">
                        🏟️ Sân: <strong>{selectedMatrixMatch.pitchName}</strong> ({selectedMatrixMatch.district}) • Ca đá:{' '}
                        <strong>{selectedMatrixMatch.startTime} - {selectedMatrixMatch.endTime}</strong>
                      </p>
                      <p className="text-slate-400">
                        📞 Đội trưởng chủ sân:{' '}
                        <strong className="text-emerald-400">
                          {selectedMatrixMatch.hostTeam.captainName} — {selectedMatrixMatch.hostTeam.captainPhone}
                        </strong>{' '}
                        • Uy tín: <strong>{selectedMatrixMatch.hostTeam.credit?.score ?? 100}đ</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${selectedMatrixMatch.hostTeam.captainPhone}`}
                        className="px-3 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs inline-flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Gọi Đội Trưởng
                      </a>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          showToast(
                            `🔥 Đã bật gói Trợ Giá 100.000đ tiền nước từ Quỹ Bình Ổn cho kèo ${selectedMatrixMatch.pitchName}!`
                          );
                        }}
                        className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-bold rounded-xl"
                      >
                        🎁 Tài Trợ 100k Tiền Nước SOS
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4 (ĐỀ XUẤT 5): PHÁT SÓNG THÔNG BÁO KHẨN CẤP TELEGRAM & WEB */}
          <TabsContent value="broadcast" className="space-y-4">
            <Card className="bg-slate-900/90 border-slate-800 rounded-2xl">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <CardTitle className="text-base font-black text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-purple-400" />
                  Phát Sóng Thông Báo Khẩn Cấp Toàn Sàn (Telegram @BatKeo7_AlertBot & Chuông Web)
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 mt-1">
                  Chọn 1 trong 3 kịch bản mẫu hoặc soạn nội dung tùy chỉnh để bắn thông báo tới Telegram và hiển thị trên thanh thông báo trang chủ BắtKèo7.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {BROADCAST_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setBroadcastTitle(tpl.title);
                        setBroadcastMessage(tpl.message);
                        setBroadcastCategory(tpl.category);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        broadcastTitle === tpl.title
                          ? 'bg-purple-500/15 border-purple-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black">{tpl.label}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{tpl.message}</p>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-3 pt-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-200">Tiêu đề phát sóng:</Label>
                    <Input
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-white font-bold h-10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-200">
                      Nội dung chi tiết gửi tới các Đội trưởng:
                    </Label>
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSendingBroadcast}
                    className="bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black text-xs h-10 px-5 rounded-xl shadow-lg shadow-purple-500/20"
                  >
                    <Send className="w-3.5 h-3.5 mr-2" />
                    {isSendingBroadcast
                      ? 'Đang phát sóng tới Telegram & Web...'
                      : '📢 Phát Sóng Ngay Tới @BatKeo7_AlertBot & Trang Chủ'}
                  </Button>
                </form>

                {broadcasts.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">
                      Lịch sử phát sóng gần đây:
                    </p>
                    {broadcasts.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">{b.title}</span>
                          <span className="text-[10px] text-slate-500">{b.createdAt}</span>
                        </div>
                        <p className="text-slate-300 text-[11px]">{b.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* MODAL TỊCH THU CỌC & BỒI THƯỜNG ĐỘI BỊ BÙNG */}
      {forfeitingRecord && (
        <Dialog open={!!forfeitingRecord} onOpenChange={(open) => !open && setForfeitingRecord(null)}>
          <DialogContent className="bg-slate-950 border border-slate-800 text-slate-100 max-w-lg p-5 rounded-2xl shadow-2xl space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-black text-white">
                    Tịch Thu Cọc 200k &amp; Bồi Thường Bùng Kèo
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400">
                    Xử lý chế tài vi phạm bùng kèo sân cỏ nhân tạo
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Thông tin đội bùng */}
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rose-300 font-bold">Đội vi phạm bùng kèo:</span>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px]">
                  Tịch thu: 200.000 VNĐ
                </Badge>
              </div>
              <p className="text-white font-black text-sm">{forfeitingRecord.teamName}</p>
              <p className="text-slate-400">
                Đội trưởng: <strong>{forfeitingRecord.captainName}</strong> ({forfeitingRecord.captainPhone})
              </p>
              <p className="text-slate-400">
                Trận đấu: <strong>{forfeitingRecord.pitchName}</strong> ({forfeitingRecord.timeSlot})
              </p>
            </div>

            {/* Chọn hướng giải quyết 200k */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-200">
                Chọn phương án xử lý số tiền 200.000đ tịch thu:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForfeitOption('VICTIM')}
                  className={`p-3 rounded-xl border text-left transition ${
                    forfeitOption === 'VICTIM'
                      ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-emerald-300">
                    🎯 Đền Bù Đội Bị Bùng
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Chuyển 200k bù tiền sân cho đội có mặt
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForfeitOption('SOS')}
                  className={`p-3 rounded-xl border text-left transition ${
                    forfeitOption === 'SOS'
                      ? 'bg-amber-500/15 border-amber-500/60 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-amber-300">
                    🔥 Quỹ Cứu Trợ SOS
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Nạp vào quỹ trợ giá kèo thiếu người
                  </div>
                </button>
              </div>
            </div>

            {/* Form chi tiết khi chọn bồi thường cho đội bị bùng */}
            {forfeitOption === 'VICTIM' ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-300">
                    Tên Đội bóng bị bùng (Đội nạn nhân có mặt tại sân):
                  </Label>
                  <Input
                    placeholder="VD: FC Anh Em Cầu Giấy"
                    value={victimTeamName}
                    onChange={(e) => setVictimTeamName(e.target.value)}
                    className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-300">Ngân hàng:</Label>
                    <select
                      value={victimBankBin}
                      onChange={(e) => setVictimBankBin(e.target.value)}
                      className="w-full h-9 rounded-xl bg-slate-950 border border-slate-800 px-2.5 text-xs text-white"
                    >
                      <option value="MB">MBBank</option>
                      <option value="VCB">Vietcombank</option>
                      <option value="TCB">Techcombank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="ICB">VietinBank</option>
                      <option value="ACB">ACB</option>
                      <option value="VPB">VPBank</option>
                      <option value="TPB">TPBank</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-slate-300">Số tài khoản nhận bồi thường:</Label>
                    <Input
                      placeholder="VD: 0988777666"
                      value={victimAccountNo}
                      onChange={(e) => setVictimAccountNo(e.target.value)}
                      className="h-9 bg-slate-950 border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-300">Tên chủ tài khoản:</Label>
                  <Input
                    placeholder="VD: NGUYEN VAN A"
                    value={victimAccountName}
                    onChange={(e) => setVictimAccountName(e.target.value.toUpperCase())}
                    className="h-9 bg-slate-950 border-slate-800 text-xs text-white font-mono uppercase"
                  />
                </div>

                {victimAccountNo.trim() && (
                  <div className="pt-2 flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                    <img
                      src={`https://img.vietqr.io/image/${victimBankBin}-${victimAccountNo.trim()}-compact2.png?amount=200000&addInfo=${encodeURIComponent(
                        'BOI THUONG TIEN SAN'
                      )}&accountName=${encodeURIComponent(victimAccountName.trim() || 'DOI BI BUNG')}`}
                      alt="VietQR Bồi Thường"
                      className="w-24 h-24 bg-white p-1 rounded-lg shrink-0 object-contain"
                    />
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <p className="font-bold text-emerald-300">⚡ Quét VietQR Bắn 200.000đ Bồi Thường</p>
                      <p className="text-slate-400">Admin mở app ngân hàng quét mã để chuyển 200k đền bù tiền sân cho đội bị bùng.</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleConfirmForfeitToVictim}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Xác Nhận Đã Chuyển 200.000đ Đền Bù Tiền Sân
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  Toàn bộ <strong>200.000 VNĐ</strong> tiền cọc của đội bùng kèo sẽ được chuyển thẳng vào <strong>Quỹ Cứu Trợ Kèo SOS</strong>. Quỹ này dùng để tài trợ 100.000đ - 150.000đ tiền nước cho các đội nhận kèo cứu hộ giờ vàng tối nay!
                </p>
                <Button
                  onClick={handleConfirmForfeitToSos}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs h-10 rounded-xl shadow-lg shadow-amber-500/20"
                >
                  <Flame className="w-4 h-4 mr-1.5" />
                  Nạp 200.000đ Vào Quỹ Cứu Trợ SOS
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
