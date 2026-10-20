"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Shield,
  Search,
  Clock,
  Bell,
  X,
  Flame,
  MessageSquare,
  Phone,
  Volume2,
  Trophy,
  Plus,
  Lock,
  Bot,
  BookOpen,
  Scale,
} from "lucide-react";
import { MOCK_MATCH_FEEDS, MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { District, MatchFeedItem, SkillTier, EscrowWallet, BankWithdrawInfo } from "@/types/matchmaking";
import { HeaderBar, ActiveTab } from "@/components/matchmaking/HeaderBar";
import { SosAlertCard } from "@/components/matchmaking/SosAlertCard";
import { MatchFeedCard } from "@/components/matchmaking/MatchFeedCard";
import { MatchChallengeModal } from "@/components/matchmaking/MatchChallengeModal";
import { CreateMatchModal } from "@/components/matchmaking/CreateMatchModal";
import { EditMatchModal } from "@/components/matchmaking/EditMatchModal";
import { CancelMatchAppealModal } from "@/components/matchmaking/CancelMatchAppealModal";
import { CancelGuestChallengeModal } from "@/components/matchmaking/CancelGuestChallengeModal";
import { CustomerSupportModal } from "@/components/support/CustomerSupportModal";
import { AppGuideModal } from "@/components/guide/AppGuideModal";
import { PlatformRulesModal } from "@/components/guide/PlatformRulesModal";
import { LiveMatchBar } from "@/components/matchmaking/LiveMatchBar";
import { EscrowWalletModal } from "@/components/escrow/EscrowWalletModal";
import { HandshakeModal } from "@/components/matchmaking/HandshakeModal";
import { SubMarketAndRollCall } from "@/components/matchmaking/SubMarketAndRollCall";
import { PersonalTeamProfileHub } from "@/components/team/PersonalTeamProfileHub";
import PitchMapSection from "@/components/pitch/PitchMapSection";
import {
  getZaloDeepLink,
  normalizeVietnamPhone,
  playNotificationChime,
} from "@/lib/zalo";
import { markDeviceAsPenalized } from "@/lib/deviceFingerprint";
import { isMatchExpired } from "@/lib/matchTime";
import { useRealtimeMatchFeed } from "@/hooks/useRealtimeMatches";
import { useAuthTeam } from "@/hooks/useAuthTeam";
import {
  ShinyText,
  CountUpNumber,
  ClickSpark,
  SpotlightCard,
} from "@/components/reactbits";
import {
  StadiumNightScenery,
  PhuiStamp,
  StarRibbon,
  RollingFootballPitch,
  PhuiSticker,
  PhuiStickerCanvas,
} from "@/components/phui";
import { VintageScrapbookAsset } from "@/components/common/VintageScrapbookAsset";
import { AuthModal } from "@/components/auth/AuthModal";
import { TeamOnboardingModal } from "@/components/team/TeamOnboardingModal";
import {
  signOutAction,
  createMatchInDatabaseAction,
  requestWithdrawEscrowAction,
  deleteOrCancelMatchAction,
  guestWithdrawFromMatchAction,
  confirmMatchChallengeAction,
  requestHostMatchCancelAction,
  respondMatchCancelRequestAction,
} from "@/actions/auth";
import { RespondCancelRequestModal } from "@/components/matchmaking/RespondCancelRequestModal";
import {
  addStoredEscrowRecord,
  getStoredBroadcasts,
  EmergencyBroadcastItem,
} from "@/lib/adminStore";

interface BotLogItem {
  id: string;
  title: string;
  msg: string;
  badge: string;
  time: string;
  zaloPhone?: string;
  captainName?: string;
}

export default function HanoiMatchmakingPlatform() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("feed");
  const [isWideLayout, setIsWideLayout] = useState(true);
  const [myTrustScore, setMyTrustScore] = useState(100);

  // Quản lý xác thực Đội trưởng & Hồ sơ Đội bóng chính chủ (1 SĐT = 1 Đội)
  const {
    profile,
    team,
    refreshAuth,
    signOut,
    isAuthenticated,
    hasTeam,
  } = useAuthTeam();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTeamOnboardingOpen, setIsTeamOnboardingOpen] = useState(false);

  // Bộ lọc đa chiều: Tìm kiếm + Khung giờ + Quận + 3 Tier
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<"ALL" | District>(
    "ALL"
  );
  const [selectedTier, setSelectedTier] = useState<"ALL" | SkillTier>("ALL");

  // Modal & Trung tâm Chuông thông báo In-App + Zalo 1-Click
  const [activeChallengeMatch, setActiveChallengeMatch] =
    useState<MatchFeedItem | null>(null);
  const [pendingChallengeMatch, setPendingChallengeMatch] =
    useState<MatchFeedItem | null>(null);
  const [editingMatch, setEditingMatch] = useState<MatchFeedItem | null>(null);
  const [cancellingMatch, setCancellingMatch] = useState<MatchFeedItem | null>(null);
  const [cancellingGuestMatch, setCancellingGuestMatch] = useState<MatchFeedItem | null>(null);
  const [respondingCancelMatch, setRespondingCancelMatch] = useState<MatchFeedItem | null>(null);
  const [latestBroadcast, setLatestBroadcast] = useState<EmergencyBroadcastItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateSosMode, setIsCreateSosMode] = useState(false);
  const [isBotDrawerOpen, setIsBotDrawerOpen] = useState(false);
  const [unreadBotCount, setUnreadBotCount] = useState(1);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Quản lý Ví Ký Quỹ Nội Bộ (In-App Escrow Balance) & Mã Bắt Tay Sân
  const effectiveTrustScore = team?.trust_score ?? myTrustScore;
  const [escrowWallet, setEscrowWallet] = useState<EscrowWallet>({
    balance: 0,
    lockedAmount: 0,
    availableBalance: 0,
    isRestricted: false,
    canWithdraw: true,
  });
  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [activeHandshakeMatch, setActiveHandshakeMatch] =
    useState<MatchFeedItem | null>(null);

  // Đồng bộ quyền tạo/nhận kèo & quyền rút tiền theo điểm tín nhiệm (<70: hạn chế; >=70: miễn cọc & được rút)
  React.useEffect(() => {
    setEscrowWallet((prev) => {
      const isRestricted = effectiveTrustScore < 70 && prev.balance < 200000;
      const canWithdraw = effectiveTrustScore >= 70;
      return {
        ...prev,
        isRestricted,
        canWithdraw,
      };
    });
  }, [effectiveTrustScore]);

  // Lắng nghe sự kiện từ Admin Hub (/admin): Duyệt kháng cáo khôi phục 100đ & Phát sóng khẩn cấp
  React.useEffect(() => {
    const syncAdminBroadcasts = () => {
      const list = getStoredBroadcasts();
      if (list.length > 0) {
        setLatestBroadcast(list[0]);
      }
      const restored = localStorage.getItem("batkeo7_restored_trust_score");
      if (restored === "100") {
        setMyTrustScore(100);
        localStorage.removeItem("batkeo7_restored_trust_score");
      }
    };

    const handleRefundEvent = (e: any) => {
      const receipt = e.detail;
      if (receipt) {
        pushBotLog(
          `🎉 ĐÃ HOÀN TRẢ CỌC (+${receipt.amount?.toLocaleString("vi-VN") || "200.000"}đ) THÀNH CÔNG`,
          `BQT BắtKèo7 đã chuyển khoản trả về STK ${receipt.bankShortName} - ${receipt.bankAccountNo} (${receipt.bankAccountName}). Vui lòng kiểm tra biến động số dư ngân hàng!`,
          "Đã Hoàn Tiền"
        );
        setUnreadBotCount((prev) => prev + 1);
      }
    };

    syncAdminBroadcasts();
    window.addEventListener("batkeo7-admin-sync", syncAdminBroadcasts);
    window.addEventListener("batkeo7-refund-success", handleRefundEvent);
    window.addEventListener("storage", syncAdminBroadcasts);
    return () => {
      window.removeEventListener("batkeo7-admin-sync", syncAdminBroadcasts);
      window.removeEventListener("batkeo7-refund-success", handleRefundEvent);
      window.removeEventListener("storage", syncAdminBroadcasts);
    };
  }, []);


  const [botLogs, setBotLogs] = useState<BotLogItem[]>([
    {
      id: "log-1",
      title: "⚽ Chào mừng bạn đến với BắtKèo7 Hà Nội",
      msg: "Hệ thống hỗ trợ ghép đối sân 7 Cầu Giấy & Nam Từ Liêm. Đăng ký tài khoản Đội trưởng để nhận Thẻ Căn Cước Bóng Đá Số và bảo vệ lịch đấu.",
      badge: "Hệ Thống",
      time: "Vừa xong",
    },
    {
      id: "log-2",
      title: "💬 Liên kết Zalo 1-Chạm & Chuông Web",
      msg: "Đội trưởng các đội không cần cài Telegram. Khi có đối bắt kèo, hệ thống tự mở khóa liên kết Zalo trực tiếp theo SĐT chính chủ.",
      badge: "Zalo Verified",
      time: "5 phút trước",
    },
  ]);

  const pushBotLog = (
    title: string,
    msg: string,
    badge: string,
    zaloPhone?: string,
    captainName?: string
  ) => {
    playNotificationChime();
    setBotLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        title,
        msg,
        badge,
        time: "Vừa xong",
        zaloPhone,
        captainName,
      },
      ...prev,
    ]);
    setUnreadBotCount((c) => c + 1);
  };

  // 🛡️ Khôi phục dữ liệu Ví Ký Quỹ, Điểm Uy Tín & Lịch Sử Bot từ localStorage khi F5 / Tải lại trang
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedScore = localStorage.getItem("batkeo7_my_trust_score");
      if (savedScore !== null) {
        const parsed = Number(savedScore);
        if (!isNaN(parsed)) setMyTrustScore(parsed);
      }

      const savedWallet = localStorage.getItem("batkeo7_escrow_wallet");
      if (savedWallet) {
        const parsed = JSON.parse(savedWallet);
        if (parsed && typeof parsed.balance === "number") {
          setEscrowWallet(parsed);
        }
      }

      const savedLogs = localStorage.getItem("batkeo7_bot_logs");
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBotLogs(parsed);
        }
      }
    } catch (e) {
      console.warn("Error restoring state from localStorage", e);
    }
  }, []);

  // Tự động lưu biến động sang localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("batkeo7_my_trust_score", String(myTrustScore));
    }
  }, [myTrustScore]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("batkeo7_escrow_wallet", JSON.stringify(escrowWallet));
    }
  }, [escrowWallet]);

  React.useEffect(() => {
    if (typeof window !== "undefined" && botLogs.length > 0) {
      localStorage.setItem("batkeo7_bot_logs", JSON.stringify(botLogs.slice(0, 50)));
    }
  }, [botLogs]);

  // Kết nối Supabase WebSockets Realtime (Zero Reload giữa các thiết bị)
  const {
    matches,
    setMatches,
    isLoadingMatches,
    broadcastNewMatch,
    broadcastMatchLock,
    broadcastMatchDelete,
    broadcastGuestWithdrawal,
    broadcastCancelRequest,
    broadcastCancelResponse,
  } = useRealtimeMatchFeed(MOCK_MATCH_FEEDS, pushBotLog);

  // TẦNG 2: Realtime Client Engine - Quét định kỳ mỗi 10 giây để tự động ẩn các kèo quá 15 phút sau bóng lăn
  const [nowTick, setNowTick] = useState(Date.now());
  const [isSimulatingCleanup, setIsSimulatingCleanup] = useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Lọc danh sách kèo: Loại bỏ kèo đã hủy, đã hết hạn hoặc quá 15 phút sau bóng lăn
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (m.status === "CANCELLED" || m.status === "EXPIRED") return false;
      // TẦNG 2: Tự động loại bỏ kèo mở quá thời hạn (Kèo thường 15 phút, Kèo SOS 90 phút)
      if (isMatchExpired(m, m.isSOS ? 90 : 15, nowTick)) return false;

      const passDistrict =
        selectedDistrict === "ALL" ||
        m.district.toLowerCase().includes(selectedDistrict.toLowerCase()) ||
        selectedDistrict.toLowerCase().includes(m.district.toLowerCase());
      const passTier =
        selectedTier === "ALL" || m.requiredTier === selectedTier;
      const passTime =
        selectedTimeSlot === "ALL" || m.startTime.includes(selectedTimeSlot);
      const q = searchQuery.trim().toLowerCase();
      const passSearch =
        !q ||
        m.pitchName.toLowerCase().includes(q) ||
        m.pitchAddress.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.hostTeam.name.toLowerCase().includes(q) ||
        m.hostTeam.captainName.toLowerCase().includes(q);
      return passDistrict && passTier && passTime && passSearch;
    });
  }, [
    matches,
    selectedDistrict,
    selectedTier,
    selectedTimeSlot,
    searchQuery,
    nowTick,
  ]);

  // Nút Test Mô Phỏng 1-Chạm Xóa Kèo Quá 15 Phút (Bản Kế Hoạch Mục V)
  const handleSimulateExpiredMatchCleanup = () => {
    const testMatchId = `test-expired-${Date.now()}`;
    const mockKickoff = new Date(Date.now() - 14 * 60 * 1000 - 55 * 1000); // 14p 55s trước
    const testMatch: MatchFeedItem = {
      id: testMatchId,
      hostTeam: {
        ...MOCK_TEAMS[0],
        name: team?.team_name || "FC Test Mô Phỏng 15P",
        captainName: profile?.full_name || "Đội Trưởng",
      },
      district: "Cầu Giấy",
      pitchName: "Sân Thử Nghiệm Tự Động Xóa Kèo",
      pitchAddress: "Cụm sân cỏ Cầu Giấy, Hà Nội",
      matchDate: "Hôm nay",
      startTime: `${mockKickoff.getHours().toString().padStart(2, "0")}:${mockKickoff.getMinutes().toString().padStart(2, "0")}`,
      endTime: "22:00",
      totalCostVnd: 800000,
      shareCostVnd: 400000,
      requiredTier: 2,
      status: "OPEN",
      isSOS: false,
      notes: "⚡ KÈO TEST: Đang đếm ngược tới mốc 15 phút. Đúng 5 giây nữa thẻ này sẽ tự động biến mất khỏi trang chủ!",
      createdAt: "Vừa xong",
      expiresAt: new Date(Date.now() + 5000).toISOString(),
      isCreatedByCurrentUser: true,
    };

    setMatches((prev) => [testMatch, ...prev]);
    setIsSimulatingCleanup(true);
    pushBotLog(
      "🧪 Đang Test Mô Phỏng Xóa Kèo (15 Phút)",
      `Đã mở bài đăng thử nghiệm ca ${testMatch.startTime}. Đúng 5 giây nữa (khi chạm mốc 15 phút sau bóng lăn), thẻ này sẽ tự động dọn dẹp khỏi bảng tin!`,
      "Test Engine"
    );

    setTimeout(() => {
      setNowTick(Date.now());
      setIsSimulatingCleanup(false);
      pushBotLog(
        "🧹 [Auto-Cleanup] Đã Tự Động Xóa Kèo Quá Hạn!",
        `Kèo #${testMatchId} đã vượt quá 15 phút sau bóng lăn chưa có đối. Hệ thống tự động làm mờ và dọn dẹp khỏi bảng tin!`,
        "Đã Dọn Dẹp"
      );
    }, 5200);
  };

  // 🚨 Kèo SOS: Độc lập với bộ lọc khung giờ khắt khe của Feed để hiển thị 100% trên toàn thành phố (hoạt động 90 phút sau bóng lăn)
  const sosMatches = useMemo(() => {
    return matches.filter((m) => {
      if (!m.isSOS || m.status === "MATCHED" || m.status === "CANCELLED" || m.status === "EXPIRED") return false;
      if (isMatchExpired(m, 90, nowTick)) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        m.pitchName.toLowerCase().includes(q) ||
        m.pitchAddress.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.hostTeam.name.toLowerCase().includes(q) ||
        m.hostTeam.captainName.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery, nowTick]);

  const regularMatches = useMemo(() => {
    return filteredMatches.filter(
      (m) => !m.isSOS || m.status === "MATCHED"
    );
  }, [filteredMatches]);

  // Xử lý nạp tiền vào Ví Ký Quỹ Nội Bộ (VietQR Napas247)
  const handleDepositEscrow = (amount: number) => {
    setEscrowWallet((prev) => {
      const newBal = prev.balance + amount;
      const isRestricted = effectiveTrustScore < 70 && newBal < 200000;
      return {
        ...prev,
        balance: newBal,
        availableBalance: newBal - prev.lockedAmount,
        isRestricted,
        canWithdraw: effectiveTrustScore >= 70,
      };
    });

    // Đồng bộ sang Admin Hub (Đề xuất 3 - Bước 1: Chờ duyệt nạp cọc)
    addStoredEscrowRecord({
      id: `ESC-${Math.floor(100 + Math.random() * 900)}`,
      matchId: "m-wallet",
      teamId: team?.id,
      teamName: team?.team_name || "Đội Chủ Sân",
      captainName: profile?.full_name || "Đội trưởng",
      captainPhone: profile?.phone || team?.captain_phone || "0988666888",
      amount,
      transferCode: `BK7 ${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      pitchName: "Nạp Ví Ký Quỹ Bảo Chứng",
      timeSlot: "Hôm nay",
      bankBin: "970422",
      bankShortName: "MBBank",
      bankAccountNo: "07440948327598",
      bankAccountName: "TRAN QUOC THIEN PHUOC",
      status: "PENDING_APPROVAL",
      createdAt: "Vừa xong",
    });

    pushBotLog(
      `💰 Nạp Ví Ký Quỹ Thành Công (+${amount.toLocaleString("vi-VN")}đ)`,
      `Bạn đã nạp thành công ${amount.toLocaleString("vi-VN")}đ vào Ví Ký Quỹ Nội Bộ qua VietQR Napas247. Số dư đã sẵn sàng bảo chứng cho các trận đấu.`,
      "Ví Ký Quỹ"
    );
  };

  // Xử lý rút tiền ký quỹ về tài khoản ngân hàng (chỉ mở khi uy tín >= 70)
  const handleWithdrawEscrow = async (
    amount: number,
    bankInfo: BankWithdrawInfo
  ) => {
    setEscrowWallet((prev) => {
      const newBal = Math.max(0, prev.balance - amount);
      return {
        ...prev,
        balance: newBal,
        availableBalance: Math.max(0, newBal - prev.lockedAmount),
      };
    });
    const bankCode = bankInfo.bankCode || "MB";
    const bankName = bankInfo.bankName || bankInfo.bank || "MBBank";
    const accNumber = bankInfo.accountNumber || bankInfo.account || "";
    const accName = bankInfo.accountName || bankInfo.name || "";
    const customQrImage = bankInfo.customQrImage;

    // Đồng bộ sang Admin Hub (Đề xuất 3 - Bước 2: Yêu cầu hoàn cọc kèm VietQR)
    addStoredEscrowRecord({
      id: `ESC-${Math.floor(100 + Math.random() * 900)}`,
      matchId: "m-withdraw",
      teamId: team?.id,
      teamName: team?.team_name || "Đội Chủ Ví",
      captainName: accName || profile?.full_name || "Đội trưởng",
      captainPhone: profile?.phone || team?.captain_phone || "0988666888",
      amount,
      transferCode: `BK7 ${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      pitchName: "Lệnh Rút Tiền Ví Ký Quỹ",
      timeSlot: "Trước 22h00 hôm nay",
      bankBin: bankCode,
      bankShortName: bankName,
      bankAccountNo: accNumber,
      bankAccountName: accName,
      customQrImageUrl: customQrImage,
      status: "WITHDRAW_REQUESTED",
      createdAt: "Vừa xong",
    });

    // Gửi cảnh báo Telegram khẩn cấp đến Quản trị viên kèm ảnh mã QR
    await requestWithdrawEscrowAction({
      amount,
      teamName: team?.team_name || "Đội bóng",
      captainPhone: profile?.phone || team?.captain_phone || "0988666888",
      bankCode,
      bankName,
      accountNumber: accNumber,
      accountName: accName,
      customQrImage,
    });

    pushBotLog(
      `🏦 Đã Gửi Lệnh Hoàn Cọc (-${amount.toLocaleString("vi-VN")}đ)`,
      `✅ Đã gửi lệnh rút ${amount.toLocaleString("vi-VN")}đ về tài khoản ${bankName} - ${accNumber} (${accName}) tới Ban Quản Trị! BQT sẽ chuyển khoản trả về STK của bạn trong 5-15 phút. Muộn nhất là 8h tối mỗi ngày ( thời gian hoạt động rút tiền từ ví là trước 22h nha )`,
      "Chờ Hoàn Cọc"
    );
  };

  // Xử lý xác thực thành công Mã Bắt Tay 4 Số Trên Sân
  const handleVerifyHandshakeSuccess = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: "PLAYING_VERIFIED", isHandshakeVerified: true }
          : m
      )
    );
    // Nhả 200k cọc bị tạm khóa về ví khả dụng
    setEscrowWallet((prev) => {
      const newLocked = Math.max(0, prev.lockedAmount - 200000);
      return {
        ...prev,
        lockedAmount: newLocked,
        availableBalance: prev.balance - newLocked,
      };
    });
    // Thưởng +10 điểm uy tín thi đấu đẹp
    setMyTrustScore((prev) => Math.min(100, prev + 10));
    pushBotLog(
      "🤝 Bắt Tay Thành Công — Trận Đấu Khởi Tranh!",
      "Hai đội đã nhập đúng Mã Bắt Tay 4 số tại sân bóng. Xác thực thi đấu văn minh thành công, số tiền 200.000đ được hoàn trả 100% về số dư khả dụng và đội bạn được thưởng +10 điểm tín nhiệm!",
      "Đã Bắt Tay"
    );
  };

  // Xử lý khi bị đối thủ bùng kèo (xác thực GPS tại sân bóng) -> Bồi thường 200k vào ví
  const handleReportNoShow = (matchId: string, reason: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (target) {
      const penalizedTeamName =
        target.hostTeam.name === team?.team_name
          ? target.guestTeam?.name || "Đội khách"
          : target.hostTeam.name;
      markDeviceAsPenalized(penalizedTeamName, reason || "Bùng kèo sân bóng");
    }

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status: "DISPUTED" } : m
      )
    );
    // Bồi thường 200k vào ví người bị bùng
    setEscrowWallet((prev) => ({
      ...prev,
      balance: prev.balance + 200000,
      availableBalance: prev.availableBalance + 200000,
    }));
    pushBotLog(
      "🛡️ Bồi Thường 200.000đ Tiền Sân Thành Công",
      `Hệ thống đã xác thực toạ độ GPS tại sân. Đối thủ bùng kèo bị trừ 30 điểm tín nhiệm. Toàn bộ 200.000đ tiền cọc bảo chứng đã được chuyển thẳng vào Ví Ký Quỹ của bạn để bù chi phí đặt sân!`,
      "Đền Bù Bùng Kèo"
    );
  };

  // Xử lý xác nhận bắt đối (Khóa kèo Row-Level Lock qua API + Đồng bộ WebSocket)
  const handleConfirmChallenge = async (
    matchId: string,
    challengerTeamName: string,
    challengerPhone: string,
    challengerZalo?: string
  ) => {
    const target = matches.find((m) => m.id === matchId);

    // Nếu đội có điểm uy tín < 70, tạm khóa 200.000đ trong ví ký quỹ
    if (effectiveTrustScore < 70) {
      setEscrowWallet((prev) => ({
        ...prev,
        lockedAmount: prev.lockedAmount + 200000,
        availableBalance: Math.max(0, prev.balance - (prev.lockedAmount + 200000)),
      }));
    }

    // Cập nhật trạng thái Optimistic UI
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: "MATCHED",
              isSOS: false,
              isChallengedByCurrentUser: true,
              guestTeam: {
                ...MOCK_TEAMS[0],
                name: challengerTeamName,
                shortName: challengerTeamName,
                captainPhone: challengerPhone,
                captainZalo: challengerZalo || challengerPhone,
              },
            }
          : m
      )
    );

    // Phát sóng Realtime sang các thiết bị khác đang mở bảng tin (Zero Reload)
    await broadcastMatchLock(
      matchId,
      challengerTeamName,
      challengerPhone,
      challengerZalo
    );

    // Đẩy thông báo vào Trung tâm Chuông Web kèm nút Zalo 1-Click
    if (target) {
      pushBotLog(
        `⚡ Đã Khóa Kèo Thành Công (#${matchId})`,
        `${challengerTeamName} (${challengerPhone}) đã chốt kèo với ${target.hostTeam.name} tại ${target.pitchName} (${target.startTime}). Bấm nút bên dưới để mở Zalo trao đổi màu áo ngay!`,
        "Đã Chốt Kèo",
        target.hostTeam.captainZalo || target.hostTeam.captainPhone,
        `${target.hostTeam.captainName} (${target.hostTeam.shortName})`
      );
    }

    // 🛡️ Lưu trạng thái Khóa Kèo trực tiếp vào CSDL Supabase (Zero Data Loss khi F5)
    await confirmMatchChallengeAction({
      matchId,
      guestTeamName: challengerTeamName,
      guestCaptainPhone: challengerPhone,
      guestCaptainZalo: challengerZalo,
      guestTrustScore: effectiveTrustScore,
    });

    try {
      await fetch(`/api/matches/${matchId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestTeamName: challengerTeamName,
          guestCaptainPhone: challengerPhone,
          guestCaptainZalo: challengerZalo || challengerPhone,
          guestTrustScore: effectiveTrustScore,
        }),
      });
    } catch (err) {
      console.log("Local challenge synchronized");
    }
  };

  const isCreatingMatchRef = React.useRef(false);

  const handleCreateNewMatch = async (newMatch: MatchFeedItem) => {
    if (isCreatingMatchRef.current) {
      console.warn("🛡️ [Anti-Double-Submit] Đang xử lý tạo kèo, bỏ qua yêu cầu đúp.");
      return;
    }
    isCreatingMatchRef.current = true;

    try {
      // Nếu đội có điểm uy tín < 70, tạm khóa 200.000đ trong ví ký quỹ
      if (effectiveTrustScore < 70) {
        setEscrowWallet((prev) => ({
          ...prev,
          lockedAmount: prev.lockedAmount + 200000,
          availableBalance: Math.max(0, prev.balance - (prev.lockedAmount + 200000)),
        }));
      }

      // 🛡️ BƯỚC 1: LƯU VÀO CSDL SUPABASE TRƯỚC TIÊN (Database as Single Source of Truth)
      const hostTeamIdToSave = team?.id || "team-cg-01";
      const dbRes = await createMatchInDatabaseAction({
        hostTeamId: hostTeamIdToSave,
        hostTeamName: newMatch.hostTeam.name,
        captainName: newMatch.hostTeam.captainName,
        captainPhone: newMatch.hostTeam.captainPhone,
        captainZalo: newMatch.hostTeam.captainZalo,
        skillTier: newMatch.requiredTier,
        pitchCustomName: newMatch.pitchName,
        district: newMatch.district,
        timeSlotLabel: `${newMatch.startTime} - ${newMatch.endTime}`,
        kickoffTimeIso: newMatch.kickoffTime,
        expiresAtIso: newMatch.expiresAt,
        totalFee: newMatch.totalCostVnd,
        splitFee: newMatch.shareCostVnd,
        isSos: newMatch.isSOS,
        notes: newMatch.notes,
        gmapsUrl: newMatch.gmapsUrl,
        isGmapsIntegrated: newMatch.isGmapsIntegrated,
        pitchAddress: newMatch.pitchAddress,
      });

      if (!dbRes?.success || !dbRes.match?.id) {
        console.error("❌ createMatchInDatabaseAction failed:", dbRes?.error);
        pushBotLog(
          "❌ Lỗi Khi Lưu Kèo Vào CSDL",
          `Không thể lưu bài đăng kèo vào máy chủ Supabase: ${dbRes?.error || "Lỗi không xác định"}. Vui lòng thử lại!`,
          "Lỗi Lưu Kèo"
        );
        alert(`⚠️ Không thể lưu kèo đấu vào CSDL: ${dbRes?.error || "Lỗi kết nối. Vui lòng thử lại!"}`);
        throw new Error(dbRes?.error || "Lỗi lưu CSDL");
      }

      // 🛡️ BƯỚC 2: CSDL ĐÃ XÁC NHẬN THÀNH CÔNG -> Tạo đối tượng chính thức với UUID từ PostgreSQL
      const officialId = dbRes.match.id;
      const officialMatch: MatchFeedItem = {
        ...newMatch,
        id: officialId,
        isCreatedByCurrentUser: true,
        pitchAddress: newMatch.pitchAddress,
        gmapsUrl: newMatch.gmapsUrl,
        isGmapsIntegrated: newMatch.isGmapsIntegrated,
      };

      // 🛡️ BƯỚC 3: Cập nhật State và chuyển Tab
      setMatches((prev) => [officialMatch, ...prev.filter((m) => m.id !== officialId)]);
      setActiveTab(officialMatch.isSOS ? "sos" : "feed");

      // 🛡️ BƯỚC 4: Phát sóng WebSocket Realtime kèm UUID chính thức tới toàn bộ thiết bị
      await broadcastNewMatch(officialMatch);

      pushBotLog(
        officialMatch.isSOS
          ? "🚨 Đã Phát Tín Hiệu Cứu Hộ SOS"
          : "⚽ Đã Đăng Kèo Mới Lên Bảng Tin",
        `${officialMatch.hostTeam.name} tìm đối tại ${officialMatch.pitchName} (${officialMatch.startTime} - ${officialMatch.matchDate}). Kèo đã lưu thành công vào CSDL.`,
        officialMatch.isSOS ? "SOS < 1h" : "Kèo Mới",
        officialMatch.hostTeam.captainZalo || officialMatch.hostTeam.captainPhone,
        `${officialMatch.hostTeam.captainName} (${officialMatch.hostTeam.shortName})`
      );

      try {
        await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(officialMatch),
        });
      } catch (err) {
        console.log("Local match synchronized");
      }
    } finally {
      isCreatingMatchRef.current = false;
    }
  };

  // Xử lý khi Đội Khách (Bên nhận) xin rút lui / hủy nhận kèo
  const handleConfirmGuestWithdraw = async (
    matchId: string,
    options: {
      reasonCategory: any;
      reasonDetail: string;
      penaltyPoints: number;
      isConvertedToSos: boolean;
      submittedAppeal?: any;
    }
  ) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const prevGuestName =
      target.guestTeam?.name || team?.team_name || "Đội bạn";

    // 1. Cập nhật Optimistic UI: Gỡ bỏ guestTeam, chuyển status sang SOS (nếu < 2h) hoặc OPEN
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: options.isConvertedToSos ? "SOS" : "OPEN",
              isSOS: options.isConvertedToSos,
              guestTeam: null,
              isChallengedByCurrentUser: false,
            }
          : m
      )
    );
    setCancellingGuestMatch(null);

    // 2. Trừ điểm uy tín nếu có phạt
    if (options.penaltyPoints > 0) {
      setMyTrustScore((prev) => Math.max(0, prev - options.penaltyPoints));
    }

    // 3. Phát sóng Realtime qua Supabase WebSocket tới toàn sàn
    await broadcastGuestWithdrawal(
      matchId,
      options.isConvertedToSos,
      prevGuestName
    );

    // 4. Đồng bộ CSDL Supabase & Gửi cảnh báo Telegram BQT
    await guestWithdrawFromMatchAction({
      matchId,
      guestTeamName: prevGuestName,
      captainPhone: profile?.phone || team?.captain_phone || "0988666888",
      reasonCategory: options.reasonCategory,
      reasonDetail: options.reasonDetail,
      penaltyPoints: options.penaltyPoints,
      pitchName: target.pitchName,
      timeSlot: `${target.startTime} - ${target.endTime}`,
      isConvertedToSos: options.isConvertedToSos,
      appealSubmitted: Boolean(options.submittedAppeal),
    });

    // 5. Ghi nhận nhật ký Bot Log
    if (options.submittedAppeal) {
      pushBotLog(
        `🛡️ Đã Rút Lui Kèm Kháng Cáo (#${options.submittedAppeal.id})`,
        `Đội bạn đã rút lui khỏi trận tại ${target.pitchName}. Kèo đã mở lại thành ${
          options.isConvertedToSos ? "🚨 KÈO CỨU HỘ SOS (< 2H)" : "kèo thường"
        } để chủ sân tìm đối mới. Đơn kháng cáo đã chuyển tới BQT!`,
        "Chờ Duyệt Kháng Cáo"
      );
    } else if (options.penaltyPoints > 0) {
      pushBotLog(
        `⚠️ Đã Rút Lui Khỏi Kèo (-${options.penaltyPoints}đ Uy Tín)`,
        `Đội bạn đã hủy nhận kèo tại ${target.pitchName}. Bị trừ -${
          options.penaltyPoints
        } điểm Uy Tín theo quy định. Kèo đã tự động chuyển sang ${
          options.isConvertedToSos ? "🚨 KÈO CỨU HỘ SOS (< 2H)" : "kèo thường"
        } để chủ sân tìm đối!`,
        `-${options.penaltyPoints}đ Uy Tín`
      );
    } else {
      pushBotLog(
        "✅ Đã Rút Lui Hợp Lệ (Miễn Phạt)",
        `Đội bạn đã rút lui thành công khỏi trận tại ${target.pitchName} trước 4 tiếng. Kèo đã mở lại cho chủ sân đón đối mới.`,
        "Đã Rút Lui"
      );
    }
  };

  const handleSaveEditedMatch = (updatedMatch: MatchFeedItem) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
    setEditingMatch(null);
    pushBotLog(
      "✏️ Đã Cập Nhật Kèo Đấu",
      `Thông tin kèo đấu tại ${updatedMatch.pitchName} (${updatedMatch.startTime} • ${updatedMatch.matchDate} - ${updatedMatch.district}) đã được cập nhật thành công!`,
      "Đã Cập Nhật"
    );
  };

  const handleDeleteMatch = (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;
    if (editingMatch?.id === matchId) {
      setEditingMatch(null);
    }
    setCancellingMatch(target);
  };

  const handleConfirmCancelMatch = async (
    matchId: string,
    options: {
      incurredPenalty: boolean;
      penaltyPoints: number;
      submittedAppeal?: any;
    }
  ) => {
    const target = matches.find((m) => m.id === matchId);
    setCancellingMatch(null);

    // 🛡️ BƯỚC 1: XÓA TRỰC TIẾP TRONG CSDL SUPABASE TRƯỚC (Database as Single Source of Truth)
    const dbRes = await deleteOrCancelMatchAction(
      matchId,
      team?.id || team?.team_name || target?.hostTeam?.name
    );

    if (!dbRes?.success) {
      console.error("❌ deleteOrCancelMatchAction failed:", dbRes?.error);
      pushBotLog(
        "❌ Lỗi Khi Xóa Kèo Trên CSDL",
        `Không thể xóa kèo #${matchId} khỏi CSDL Supabase: ${dbRes?.error || "Lỗi khóa ngoại hoặc quyền truy cập"}. Vui lòng thử lại!`,
        "Lỗi Xóa Kèo"
      );
      alert(`⚠️ Không thể xóa kèo khỏi máy chủ CSDL: ${dbRes?.error || "Vui lòng thử lại!"}`);
      return;
    }

    // 🛡️ BƯỚC 2: CSDL ĐÃ XÁC NHẬN THÀNH CÔNG -> Gỡ khỏi State và phát sóng
    setMatches((prev) => prev.filter((m) => m.id !== matchId));

    // 🛡️ BƯỚC 3: Phát sóng WebSocket Realtime cho các thiết bị khác đồng bộ
    await broadcastMatchDelete(matchId);

    // 🛡️ BƯỚC 4: Đồng bộ xóa sạch khỏi localStorage
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("batkeo7_matches_v2");
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            localStorage.setItem(
              "batkeo7_matches_v2",
              JSON.stringify(list.filter((m: any) => m.id !== matchId))
            );
          }
        }
        localStorage.removeItem("batkeo7_matches_v1");
      } catch {}
    }

    if (options.incurredPenalty && options.penaltyPoints > 0) {
      setMyTrustScore((prev) => Math.max(0, prev - options.penaltyPoints));
      markDeviceAsPenalized(
        team?.team_name || "Đội của tôi",
        `Hủy kèo bị phạt -${options.penaltyPoints}đ Uy Tín`
      );
    }

    if (options.submittedAppeal) {
      pushBotLog(
        `🛡️ Đã Gửi Đơn Kháng Cáo (#${options.submittedAppeal.id}) Lên BQT`,
        `Kèo tại ${target?.pitchName || "sân"} đã hủy trên CSDL. Đơn kháng cáo của bạn đã được chuyển tới Trạm Xét Duyệt 1-Chạm (/admin) & Telegram BQT để khôi phục 100 điểm Uy Tín!`,
        "Chờ Duyệt Kháng Cáo"
      );
    } else if (options.incurredPenalty) {
      pushBotLog(
        `⚠️ Đã Hủy Kèo Sát Giờ (Trừ -${options.penaltyPoints}đ Uy Tín)`,
        `Kèo đấu tại ${target?.pitchName || "sân"} (${target?.startTime || ""}) đã bị hủy thành công trên CSDL. Đội bị trừ -${options.penaltyPoints} điểm Uy Tín theo quy định.`,
        `-${options.penaltyPoints}đ Uy Tín`
      );
    } else {
      pushBotLog(
        "🗑️ Đã Xóa Kèo Đấu Hợp Lệ (Không Trừ Điểm)",
        `Kèo đấu tại ${target?.pitchName || "sân"} (${target?.startTime || ""}) đã được xóa vĩnh viễn khỏi CSDL và bảng tin.`,
        "Đã Xóa Kèo"
      );
    }
  };

  // Xử lý khi Đội Chủ Nhà gửi yêu cầu xin hủy kèo (Cần 2 bên đồng thuận khi đã có đối)
  const handleRequestMutualCancel = async (
    matchId: string,
    options: {
      reasonCategory: string;
      reasonDetail: string;
      penaltyPoints: number;
      compensationAmountVnd: number;
    }
  ) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    // 1. Cập nhật Optimistic UI: status -> CANCEL_REQUESTED
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: "CANCEL_REQUESTED",
              cancelRequest: {
                requestedBy: "HOST",
                requestedByName: target.hostTeam.name,
                requestedByPhone: target.hostTeam.captainPhone,
                requestedAt: new Date().toLocaleTimeString("vi-VN"),
                reasonCategory: options.reasonCategory,
                reasonDetail: options.reasonDetail,
                penaltyPoints: options.penaltyPoints,
                compensationAmountVnd: options.compensationAmountVnd,
              },
            }
          : m
      )
    );
    setCancellingMatch(null);

    // 2. Phát sóng WebSocket Realtime sang toàn bộ người dùng
    await broadcastCancelRequest(
      matchId,
      target.hostTeam.name,
      options.reasonDetail,
      options.penaltyPoints,
      options.compensationAmountVnd
    );

    // 3. Đồng bộ Supabase DB & Báo Telegram BQT
    await requestHostMatchCancelAction({
      matchId,
      hostTeamName: target.hostTeam.name,
      guestTeamName: target.guestTeam?.name || "Đội Khách",
      hostPhone: target.hostTeam.captainPhone,
      guestPhone: target.guestTeam?.captainPhone || "",
      pitchName: target.pitchName,
      timeSlot: `${target.startTime} - ${target.endTime}`,
      reasonCategory: options.reasonCategory,
      reasonDetail: options.reasonDetail,
      penaltyPoints: options.penaltyPoints,
      compensationAmountVnd: options.compensationAmountVnd,
    });

    pushBotLog(
      "⏳ Đã Gửi Yêu Cầu Xin Hủy Kèo Tới Đối Tác",
      `Yêu cầu xin hủy trận tại ${target.pitchName} (${target.startTime}) đã được gửi tới ${target.guestTeam?.name || "đối thủ"}. Trận đấu tạm khóa chờ đối tác phản hồi đồng thuận.`,
      "Chờ Đối Duyệt"
    );
  };

  // Xử lý khi Đội Khách đồng ý chấp thuận yêu cầu hủy từ Chủ Nhà
  const handleAcceptCancelRequest = async (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const compensation = target.cancelRequest?.compensationAmountVnd || 0;
    const penalty = target.cancelRequest?.penaltyPoints || 0;
    const hostName = target.hostTeam.name;
    const guestName = target.guestTeam?.name || team?.team_name || "Đội bạn";

    // 1. Gỡ trận đấu khỏi danh sách
    setMatches((prev) => prev.filter((m) => m.id !== matchId));

    // 2. Nếu có tiền bồi thường, cộng thẳng vào Ví Ký Quỹ của Đội Khách
    if (compensation > 0) {
      setEscrowWallet((prev) => ({
        ...prev,
        balance: prev.balance + compensation,
        availableBalance: prev.availableBalance + compensation,
      }));
    }

    // 3. Phát sóng Realtime
    await broadcastCancelResponse(matchId, "ACCEPTED", guestName);

    // 4. Đồng bộ Supabase CSDL
    await respondMatchCancelRequestAction({
      matchId,
      decision: "ACCEPTED",
      guestTeamName: guestName,
      hostTeamName: hostName,
      penaltyPoints: penalty,
      compensationAmountVnd: compensation,
    });

    pushBotLog(
      compensation > 0
        ? `✅ Đã Đồng Thuận Hủy Trận (+${compensation.toLocaleString("vi-VN")}đ)`
        : "✅ Đã Đồng Thuận Hủy Trận Đấu",
      `Đội bạn đã chấp thuận yêu cầu hủy từ ${hostName}. ${
        compensation > 0
          ? `Khoản bồi thường cọc ${compensation.toLocaleString("vi-VN")}đ đã được cộng vào Ví Ký Quỹ của bạn!`
          : "Trận đấu đã được hủy hợp lệ trước 4 tiếng."
      }`,
      "Đã Hủy Trận"
    );
  };

  // Xử lý khi Đội Khách TỪ CHỐI yêu cầu hủy kèo từ Chủ Nhà
  const handleRejectCancelRequest = async (matchId: string, reason: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const hostName = target.hostTeam.name;
    const guestName = target.guestTeam?.name || team?.team_name || "Đội bạn";

    // 1. Chuyển trạng thái trận đấu sang DISPUTED
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              status: "DISPUTED",
            }
          : m
      )
    );

    // 2. Phát sóng Realtime
    await broadcastCancelResponse(matchId, "REJECTED", guestName);

    // 3. Đồng bộ Supabase DB & Gửi cảnh báo khẩn Telegram BQT
    await respondMatchCancelRequestAction({
      matchId,
      decision: "REJECTED",
      guestTeamName: guestName,
      hostTeamName: hostName,
      penaltyPoints: target.cancelRequest?.penaltyPoints || 25,
      compensationAmountVnd: target.cancelRequest?.compensationAmountVnd || 200000,
      rejectReason: reason,
    });

    pushBotLog(
      "🚨 Đã Từ Chối Hủy Kèo — Chuyển BQT Xử Lý Bùng Kèo",
      `Đội bạn đã từ chối yêu cầu hủy của ${hostName}. Vụ việc đã được chuyển tới Ban Trọng Tài / BQT (/admin) để xử phạt theo quy định bùng kèo!`,
      "Tranh Chấp"
    );
  };

  return (
    <div className="min-h-screen bg-kraft-newspaper text-stone-900 flex flex-col pb-16 relative overflow-x-hidden selection:bg-amber-300 selection:text-stone-900">
      {/* 📰 CỘT BÁO PHÓNG SỰ BÓNG ĐÁ PHỦI RÌA TRÁI (DESKTOP VINTAGE SCRAPBOOK) */}
      <aside aria-hidden="true" className={`hidden ${isWideLayout ? "2xl:flex" : "xl:flex"} flex-col gap-4 fixed left-2 2xl:left-5 top-20 w-56 2xl:w-64 pointer-events-auto opacity-100 z-10`}>
        {/* 1. TỜ BÁO PHỦI IN CHÍNH THỨC CÓ ẢNH TƯ LIỆU */}
        <div className="card-retro-paper p-3 rounded-2xl border border-stone-300 shadow-md rotate-[-2deg] relative overflow-hidden pointer-events-auto">
          <div className="washi-tape -top-2 left-6 rotate-[-2deg]" />
          <div className="flex items-center justify-between border-b border-stone-300 pb-1.5 mb-2">
            <span className="text-[10px] font-black uppercase text-red-700 tracking-wider flex items-center gap-1">
              <span>📰 BẢN TIN PHỦI</span>
            </span>
            <span className="text-[9px] font-mono text-stone-500 font-bold">SỐ 2026</span>
          </div>

          <VintageScrapbookAsset
            asset="newspaper-headline"
            tape="none"
            className="w-full mb-2"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-900 leading-tight">
              Khung giờ vàng 19h00: Cụm sân Cầu Giấy kín lịch đối đầu
            </div>
            <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
              Các đội bóng phủi Thủ đô đang tích cực ghép kèo giao hữu sân 7. Hệ thống cọc 200k giúp triệt tiêu 100% tình trạng bùng kèo.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
            <span className="rubber-stamp text-[8px] py-0.5 px-1.5">KÈO UY TÍN</span>
            <span className="text-[9px] text-stone-600 font-extrabold font-mono">GiaoHuu.vn</span>
          </div>
        </div>

        {/* 2. ẢNH POLAROID: CẦU THỦ NÂNG CÚP / KỶ NIỆM SAU TRẬN */}
        <div className="bg-white p-2 pb-3 rounded-xl border border-stone-300 shadow-md rotate-[2.5deg] relative pointer-events-auto">
          <div className="washi-tape -top-2.5 right-6 rotate-[3deg]" />
          <VintageScrapbookAsset
            asset="polaroid-trophy"
            tape="none"
            className="w-full mb-1"
          />
          <div className="text-center mt-1">
            <p className="text-[10px] font-bold text-stone-800 tracking-tight">
              “Kỷ niệm sau trận giao hữu 7v7”
            </p>
            <span className="text-[8px] text-stone-500 font-medium">Bắt tay hữu nghị • Nâng cúp vàng</span>
          </div>
        </div>

        {/* 3. TỜ SỔ TAY KẺ Ô: SA BÀN CHIẾN THUẬT 3-2-1 */}
        <div className="card-retro-paper p-2.5 rounded-xl border border-stone-300 shadow-sm rotate-[-1.5deg] relative text-[10px] pointer-events-auto">
          <div className="washi-tape -top-2 left-8 rotate-[-1deg]" />
          <VintageScrapbookAsset
            asset="tactical-board"
            tape="none"
            className="w-full mb-1.5"
            caption="Sơ đồ chiến thuật 3-2-1 phủi"
          />
          <p className="text-[9px] text-stone-500 mt-1 italic text-center">
            “Kỷ luật vị trí — Không ham dâng cao!”
          </p>
        </div>
      </aside>

      {/* 📰 CỘT BÁO PHÓNG SỰ BÓNG ĐÁ PHỦI RÌA PHẢI (DESKTOP VINTAGE SCRAPBOOK) */}
      <aside aria-hidden="true" className={`hidden ${isWideLayout ? "2xl:flex" : "xl:flex"} flex-col gap-4 fixed right-2 2xl:right-5 top-20 w-56 2xl:w-64 pointer-events-auto opacity-100 z-10`}>
        {/* 1. TỜ BÁO TIÊU ĐIỂM SÂN CỎ */}
        <div className="card-retro-paper p-3 rounded-2xl border border-stone-300 shadow-md rotate-[2deg] relative overflow-hidden pointer-events-auto">
          <div className="washi-tape -top-2 right-6 rotate-[2deg]" />
          <div className="flex items-center justify-between border-b border-stone-300 pb-1.5 mb-2">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
              <span>🌱 TIÊU ĐIỂM SÂN CỎ</span>
            </span>
            <span className="text-[9px] font-mono text-stone-600 font-bold">26°C TF</span>
          </div>

          <VintageScrapbookAsset
            asset="polaroid-fairplay"
            tape="none"
            className="w-full mb-2"
          />

          <div className="space-y-1">
            <div className="text-[11px] font-black text-stone-900 leading-tight">
              Thời tiết tối nay toàn Hà Nội: Cỏ khô ráo, gió mát lý tưởng
            </div>
            <p className="text-[10px] text-stone-600 line-clamp-2 leading-relaxed">
              Mặt sân cỏ nhân tạo đạt độ bám tối đa, thích hợp thi đấu tốc độ cao và sút xa uy lực.
            </p>
          </div>
          <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
            <span className="rubber-stamp text-[8px] py-0.5 px-1.5 border-emerald-700 text-emerald-800">HÀ NỘI 7v7</span>
            <span className="text-[9px] text-stone-500 font-bold font-mono">Bản Tin Tối</span>
          </div>
        </div>

        {/* 2. CUỐNG VÉ TRẬN ĐẤU RETRO (MATCH TICKET STUB) */}
        <div className="ticket-stub p-3 bg-[#fbf9f4] rounded-xl border border-stone-300 shadow-md rotate-[-2deg] relative pointer-events-auto">
          <div className="washi-tape -top-2 left-6 rotate-[-1deg]" />
          <VintageScrapbookAsset
            asset="ticket-stub"
            tape="none"
            className="w-full mb-1"
          />
          <div className="space-y-1 text-[10px] mt-2">
            <div className="flex justify-between text-stone-800 font-bold">
              <span>BẢO CHỨNG:</span>
              <span className="text-emerald-800 font-black">200.000đ</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>QUY CHUẨN:</span>
              <span className="font-bold text-stone-800">Sân 7 Phủi Hà Nội</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>HỦY SÁT GIỜ:</span>
              <span className="font-bold text-red-700">Đền 100% tiền sân</span>
            </div>
          </div>
        </div>

        {/* 3. POLAROID: TRÀ ĐÁ VÀ CHIẾN THUẬT */}
        <div className="bg-white p-2 pb-3 rounded-xl border border-stone-300 shadow-md rotate-[1.5deg] relative pointer-events-auto">
          <div className="washi-tape -top-2 right-8 rotate-[2deg]" />
          <VintageScrapbookAsset
            asset="tea-tactics"
            tape="none"
            className="w-full mb-1"
          />
          <div className="text-center mt-1">
            <p className="text-[10px] font-bold text-stone-800">
              “Uống Trà Đá - Bàn Chiến Thuật”
            </p>
            <span className="text-[8px] text-stone-500">Mã Bắt Tay OTP 4 Số Nhận +10 Uy Tín</span>
          </div>
        </div>
      </aside>

      {/* 🎨 LAYER 1: LỚP STICKER & HOẠ TIẾT TRANG TRÍ PHỦI */}
      <PhuiStickerCanvas />

      <div
        className={`w-full mx-auto transition-all duration-300 relative z-10 ${
          isWideLayout
            ? "max-w-6xl"
            : "max-w-md border-x border-stone-300 shadow-2xl bg-[#fbf9f4]/95"
        }`}
      >
        {/* Thanh Header + Marquee + Radar Thời Tiết Sân */}
        <HeaderBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sosCount={
            matches.filter((m) => m.isSOS && m.status !== "MATCHED").length
          }
          openMatchCount={matches.filter((m) => m.status !== "MATCHED").length}
          myTrustScore={team?.trust_score ?? myTrustScore}
          unreadBotCount={unreadBotCount}
          isWideLayout={isWideLayout}
          onToggleWideLayout={() => setIsWideLayout(!isWideLayout)}
          onOpenCreateModal={() => setIsCreateOpen(true)}
          onOpenBotDrawer={() => {
            setIsBotDrawerOpen(true);
            setUnreadBotCount(0);
          }}
          isAuthenticated={isAuthenticated}
          hasTeam={hasTeam}
          currentTeamName={team?.team_name}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenTeamOnboarding={() => setIsTeamOnboardingOpen(true)}
          onSignOut={async () => {
            await signOut();
            pushBotLog(
              "👋 Đã Đăng Xuất Tài Khoản",
              "Bạn đã đăng xuất an toàn khỏi hệ thống. Bấm Đăng nhập khi cần quản lý đội bóng hoặc mở kèo!",
              "Đã Đăng Xuất"
            );
          }}
          escrowWallet={escrowWallet}
          onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
        />

        {/* Banner Phát Sóng Khẩn Cấp Từ BQT (/admin) */}
        {latestBroadcast && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-stone-900 border border-stone-700 flex items-start justify-between gap-3 shadow-lg">
            <div className="space-y-0.5 text-xs">
              <div className="font-black text-amber-300 flex items-center gap-1.5">
                <span>📢 THÔNG BÁO TỪ BAN QUẢN TRỊ:</span>
                <span className="text-white">{latestBroadcast.title}</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {latestBroadcast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLatestBroadcast(null)}
              className="p-1 rounded-lg bg-stone-800 text-stone-400 hover:text-white shrink-0"
              title="Đóng thông báo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Content Container */}
        <main className="px-4 pt-4 space-y-5">
          {/* WORKSPACE 1: BẢNG TIN KÈO ĐẤU */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              {/* 🏟️ HERO BANNER: PHONG CÁCH BẢN TIN BÁO GIẤY & RETRO SCRAPBOOK */}
              <div className="card-retro-paper relative rounded-3xl overflow-hidden border border-stone-300 p-4 sm:p-5 shadow-lg">
                {/* Washi Tape dán góc trang trí */}
                <div className="washi-tape -top-2.5 left-8 rotate-[-3deg]" />
                <div className="washi-tape -top-2.5 right-8 rotate-[2deg]" />

                {/* 📰 DẢI BÁO RÁCH NỔI BẬT: KÈO GAY CẤN TỐI NAY (ASSET 02 TỪ ẢNH NGƯỜI DÙNG) */}
                <div className="mb-3">
                  <VintageScrapbookAsset
                    asset="torn-banner"
                    tape="both"
                    className="w-full max-w-xl mx-auto block"
                  />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-[9px] sm:text-[10px] font-black text-red-700 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        BẢN TIN NÓNG SÂN 7 HÀ NỘI
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-stone-600 font-bold">• Ghép Đối Tốc Hành 5 Phút</span>
                      <span className="rubber-stamp hidden sm:inline-flex text-[9px] py-0.5 px-2">KÈO UY TÍN</span>
                    </div>
                    <h2 className="text-base sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2 flex-wrap">
                      <span>SÀN BẮT ĐỐI SÂN 7</span>
                      <span className="text-red-700 underline decoration-stone-400">CHỐNG BÙNG KÈO</span>
                      <PhuiSticker variant="chong-bung-keo" size={110} angle={-2} className="hidden md:inline-block ml-1 align-middle" />
                    </h2>
                    <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 sm:mt-1 max-w-xl leading-relaxed font-medium">
                      Cọc bảo chứng 200k • Hủy sát giờ &lt; 1h đền 100% tiền sân • Xác thực mã bắt tay OTP 4 số tại cổng sân.
                    </p>
                  </div>

                  {/* 📰 TỜ BÁO NẾP GẤP TƯ LIỆU THỰC TẾ (ASSET 01 TỪ ẢNH NGƯỜI DÙNG) */}
                  <div className="hidden sm:block shrink-0">
                    <VintageScrapbookAsset
                      asset="newspaper-headline"
                      tape="right"
                      tilt={1.5}
                      className="w-44 lg:w-48 shadow-md"
                      caption="Bản tin phủi GiaoHuu.vn"
                    />
                  </div>

                  {/* 2 Cột Thống Kê Chuẩn (ĐÃ XÓA Ô 1.450+ THEO ĐÚNG YÊU CẦU NGƯỜI DÙNG) */}
                  <div className="relative shrink-0">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 bg-[#ede8dc] border border-stone-300 rounded-2xl p-2.5 sm:p-3.5 shrink-0 shadow-inner relative overflow-hidden">
                      <div className="text-center px-2">
                        <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold uppercase">Cọc Bảo Chứng</div>
                        <div className="text-sm sm:text-base font-black text-emerald-800">
                          <CountUpNumber end={200000} duration={1200} suffix="đ" />
                        </div>
                      </div>
                      <div className="text-center px-2 border-l border-stone-300">
                        <div className="text-[9px] sm:text-[10px] text-stone-600 font-bold uppercase">Uy Tín Chuẩn</div>
                        <div className="text-sm sm:text-base font-black text-amber-800">
                          <CountUpNumber end={100} duration={1500} suffix="/100" />
                        </div>
                      </div>
                    </div>
                    {/* Dải Ruy Băng Sao Vàng Thể Thao Phủi */}
                    <div className="absolute -bottom-2.5 -right-1 hidden sm:block">
                      <StarRibbon starsCount={5} className="py-0.5 px-2 text-[10px] rotate-[-2deg]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE TELEMETRY STRIP (Đồng hồ đếm ngược + Thời tiết + Live HN + Sân 2D) */}
              <LiveMatchBar
                onOpenCreateModal={() => setIsCreateOpen(true)}
                onSwitchTab={(tab) => setActiveTab(tab)}
                sosCount={
                  matches.filter((m) => m.isSOS && m.status !== "MATCHED").length
                }
                openMatchCount={
                  matches.filter((m) => m.status !== "MATCHED").length
                }
                selectedDistrict={selectedDistrict}
                onSimulateExpiredCleanup={handleSimulateExpiredMatchCleanup}
                isSimulatingCleanup={isSimulatingCleanup}
              />

              {/* Thanh Tìm Kiếm + Chọn Ca Giờ + Quận + 3 Tier (Vintage Newspaper Style) */}
              <section id="matches-feed-anchor" className="card-retro-paper rounded-2xl border border-stone-300 p-3.5 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-600 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên sân (Thành Phát, Mễ Trì, Đình Thôn...), tên FC, đội trưởng..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#f4f0e6] border border-stone-300 text-xs text-stone-900 placeholder-stone-500 font-medium focus:outline-none focus:border-stone-600"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-600 shrink-0 hidden sm:inline" />
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      aria-label="Lọc theo khung giờ"
                      className="h-9 px-3 rounded-xl bg-[#f4f0e6] border border-stone-300 text-xs font-bold text-stone-900 focus:outline-none focus:border-stone-600 cursor-pointer"
                    >
                      <option value="ALL">⏰ Mọi khung giờ</option>
                      <option value="17:30">Ca 17:30</option>
                      <option value="19:00">Ca 19:00</option>
                      <option value="19:30">Ca 19:30</option>
                      <option value="20:30">Ca 20:30</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 border-t border-stone-200">
                  {/* Khu vực Toàn Hà Nội (Pill Buttons) */}
                  <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
                    <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-1 shrink-0">
                      <MapPin className="w-3 h-3 text-red-600" />
                      Khu vực:
                    </span>
                    {[
                      "ALL",
                      "Cầu Giấy",
                      "Nam Từ Liêm",
                      "Thanh Xuân",
                      "Đống Đa",
                      "Hà Đông",
                      "Bắc Từ Liêm",
                      "Hoàng Mai",
                      "Ba Đình",
                    ].map((dist) => (
                      <button
                        key={dist}
                        onClick={() => setSelectedDistrict(dist as any)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 shrink-0 whitespace-nowrap ${
                          selectedDistrict === dist
                            ? "bg-stone-900 text-white font-black border border-stone-900 shadow-sm"
                            : "bg-[#ede8dc] text-stone-700 hover:text-stone-900 hover:bg-stone-200 border border-stone-300"
                        }`}
                      >
                        {dist === "ALL" ? "Tất cả Hà Nội" : dist}
                      </button>
                    ))}
                  </div>

                  {/* 3 Tier (Pill Buttons) */}
                  <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center gap-1.5 pb-1 sm:pb-0">
                    <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1 mr-1 shrink-0">
                      <Shield className="w-3 h-3 text-amber-700" />
                      Tier:
                    </span>
                    <button
                      onClick={() => setSelectedTier("ALL")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                        selectedTier === "ALL"
                          ? "bg-stone-900 text-white font-black shadow-sm"
                          : "bg-[#ede8dc] text-stone-700 hover:text-stone-900 hover:bg-stone-200 border border-stone-300"
                      }`}
                    >
                      Mọi Tier
                    </button>
                    {([1, 2, 3] as SkillTier[]).map((t) => {
                      const active = selectedTier === t;
                      return (
                        <button
                          key={t}
                          onClick={() => setSelectedTier(t)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 ${
                            active
                              ? t === 1
                                ? "bg-blue-800 text-white border-blue-900 shadow-sm"
                                : t === 2
                                ? "bg-emerald-800 text-white border-emerald-900 shadow-sm"
                                : "bg-red-800 text-white border-red-900 shadow-sm"
                              : "bg-[#ede8dc] border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-200"
                          }`}
                        >
                          {t === 1 ? "Tier 1: Dưỡng sinh" : t === 2 ? "Tier 2: Phong trào" : "Tier 3: Phủi chiến"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Kèo SOS nổi bật trên đầu Bảng Kèo */}
              {sosMatches.length > 0 && (
                <section className="space-y-3">
                  {sosMatches.map((sos) => {
                    const isOwner =
                      Boolean(sos.isCreatedByCurrentUser) ||
                      (Boolean(team?.team_name) && sos.hostTeam.name === team?.team_name);
                    return (
                      <SosAlertCard
                        key={sos.id}
                        match={sos}
                        isOwner={isOwner}
                        onSelectMatch={(m) => setActiveChallengeMatch(m)}
                        onEditMatch={(m) => setEditingMatch(m)}
                        onDeleteMatch={handleDeleteMatch}
                      />
                    );
                  })}
                </section>
              )}

              {/* Danh sách Kèo Thường / Khối Ghép Trận Phủi */}
              {isLoadingMatches ? (
                <div className="card-retro-paper relative rounded-3xl border border-stone-300 p-8 sm:p-12 text-center space-y-4 shadow-lg overflow-hidden">
                  <div className="py-2">
                    <RollingFootballPitch statusText="Đang kết nối Realtime & đồng bộ dữ liệu sân phủi..." />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-stone-800 animate-pulse">
                      Đang tải danh sách kèo đấu trực tuyến từ máy chủ...
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Tự động cập nhật tức thì mọi thay đổi mà không cần tải lại trang
                    </p>
                  </div>
                </div>
              ) : filteredMatches.length === 0 ? (
                <div className="card-retro-paper relative rounded-3xl border border-stone-300 p-6 sm:p-8 text-center space-y-4 shadow-lg overflow-hidden">
                  {/* Watermark Stamps Phủi */}
                  <div className="absolute top-4 right-4 hidden sm:block">
                    <PhuiStamp variant="keo-uy-tin" size="sm" angle={8} />
                  </div>
                  <div className="absolute bottom-4 left-4 hidden sm:block">
                    <PhuiStamp variant="san-7-ha-noi" size="sm" angle={-6} />
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <h3 className="text-base sm:text-xl font-black text-red-800 tracking-tight flex items-center justify-center gap-2 flex-wrap">
                      <span>BẢN TIN GHÉP TRẬN HÔM NAY -</span>
                      <span className="text-stone-900 underline decoration-red-600">HÀ NỘI</span>
                    </h3>
                    <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                      Chưa có đội nào mở kèo tại khu vực hoặc khung giờ này. Hãy là đội tiên phong mở bát để nhận đối thủ ngay trong 5 phút!
                    </p>
                  </div>

                  {/* 📰 BỘ ẢNH TƯ LIỆU BÁO CHÍ & SCRAPBOOK BÓNG ĐÁ PHỦI (ẢNH 2 TỪ NGƯỜI DÙNG) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 max-w-2xl mx-auto relative z-10">
                    {/* ASSET 01: TỜ BÁO NẾP GẤP */}
                    <div className="flex flex-col items-center">
                      <VintageScrapbookAsset
                        asset="newspaper-headline"
                        tape="both"
                        tilt={-2}
                        className="w-full max-w-[210px] shadow-md"
                        caption="Bản tin phủi GiaoHuu.vn"
                      />
                    </div>
                    {/* ASSET 05: POLAROID CHƠI ĐẸP - FAIR PLAY */}
                    <div className="flex flex-col items-center">
                      <VintageScrapbookAsset
                        asset="polaroid-fairplay"
                        tape="both"
                        tilt={2}
                        className="w-full max-w-[175px] shadow-md"
                        caption="CHƠI ĐẸP - FAIR PLAY"
                      />
                    </div>
                    {/* ASSET 07: SA BÀN 3-2-1 TRÊN GIẤY KẺ Ô */}
                    <div className="flex flex-col items-center">
                      <VintageScrapbookAsset
                        asset="tactical-board"
                        tape="both"
                        tilt={-1.5}
                        className="w-full max-w-[185px] shadow-md"
                        caption="Sơ đồ 3-2-1 Phủi"
                      />
                    </div>
                  </div>

                  {/* ⚽ 2D MINI PITCH ROLLING FOOTBALL RADAR ANIMATION */}
                  <div className="py-1 relative z-10">
                    <RollingFootballPitch statusText="Quét các cụm sân Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Đống Đa..." />
                  </div>

                  <div className="relative z-10 pt-1">
                    <ClickSpark sparkColor={["#f97316", "#fbbf24", "#ef4444"]}>
                      <button
                        onClick={() => setIsCreateOpen(true)}
                        className="ticket-stub inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-md shadow-orange-900/20 transition active:scale-95"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                        <span>Mở Kèo Mới Ngay</span>
                      </button>
                    </ClickSpark>
                  </div>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 ${
                    isWideLayout ? "md:grid-cols-2" : ""
                  } gap-3.5`}
                >
                  {regularMatches.map((match) => {
                    const isOwner =
                      Boolean(match.isCreatedByCurrentUser) ||
                      (Boolean(team?.team_name) && match.hostTeam.name === team?.team_name);
                    return (
                      <MatchFeedCard
                        key={match.id}
                        match={match}
                        isOwner={isOwner}
                        onSelectMatch={(m) => setActiveChallengeMatch(m)}
                        onOpenBlindReview={() => setActiveTab("trust-profile")}
                        onOpenHandshake={(m) => setActiveHandshakeMatch(m)}
                        onEditMatch={(m) => setEditingMatch(m)}
                        onDeleteMatch={handleDeleteMatch}
                        onCancelGuestChallenge={(m) => setCancellingGuestMatch(m)}
                        onOpenRespondCancel={(m) => setRespondingCancelMatch(m)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 2: TAB CỨU HỘ SOS CHUYÊN BIỆT */}
          {activeTab === "sos" && (
            <div className="space-y-4">
              <div className="card-retro-paper relative rounded-3xl border-2 border-red-300 p-4 sm:p-5 shadow-lg overflow-hidden">
                <div className="washi-tape -top-2.5 left-8 rotate-[-2deg]" />
                <div className="washi-tape -top-2.5 right-8 rotate-[3deg]" />

                {/* Dải ruy băng sọc cứu hộ khẩn cấp retro */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#fbbf24_10px,#fbbf24_20px)]" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 pt-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 text-[10px] font-black text-red-700 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        TRẠM CỨU HỘ KÈO PHÚT CHÓT
                      </span>
                      <span className="rubber-stamp text-[9px] py-0.5 px-2 border-red-700 text-red-800">
                        HỎA TỐC &lt; 1H
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-red-600 fill-current animate-bounce" />
                      <span>TRẠM CỨU HỘ KÈO PHÚT CHÓT HÀ NỘI</span>
                    </h2>
                    <p className="text-xs text-stone-600 mt-0.5 font-medium">
                      Cứu kèo giúp sân không bị bỏ trống • Thưởng +8 điểm tín nhiệm &amp; Bảo chứng an toàn 100%
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    <PhuiSticker variant="the-phat" size={70} angle={6} className="hidden sm:inline-block shrink-0" />
                    <button
                      onClick={() => {
                        setIsCreateSosMode(true);
                        setIsCreateOpen(true);
                      }}
                      className="ticket-stub px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
                    >
                      <Flame className="w-4 h-4 fill-current" />
                      <span>Phát Tín Hiệu SOS</span>
                    </button>
                  </div>
                </div>
              </div>

              {sosMatches.length > 0 ? (
                <div className="space-y-3.5">
                  {sosMatches.map((sos) => {
                    const isOwner =
                      Boolean(sos.isCreatedByCurrentUser) ||
                      (Boolean(team?.team_name) && sos.hostTeam.name === team?.team_name);
                    return (
                      <SosAlertCard
                        key={sos.id}
                        match={sos}
                        isOwner={isOwner}
                        onSelectMatch={(m) => setActiveChallengeMatch(m)}
                        onEditMatch={(m) => setEditingMatch(m)}
                        onDeleteMatch={handleDeleteMatch}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="card-retro-paper rounded-3xl border border-stone-300 p-6 sm:p-8 text-center space-y-4 text-xs text-stone-600 shadow-md relative overflow-hidden">
                  <div className="washi-tape -top-2 left-1/2 -translate-x-1/2" />
                  
                  {/* 📰 DẢI BÁO RÁCH KÈO GAY CẤN TỐI NAY */}
                  <div className="max-w-md mx-auto mb-2">
                    <VintageScrapbookAsset
                      asset="torn-banner"
                      tape="both"
                      className="w-full"
                    />
                  </div>

                  <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 text-red-600 flex items-center justify-center mx-auto text-xl shadow-inner">
                    <Flame className="w-6 h-6 fill-current animate-pulse" />
                  </div>
                  <p className="font-bold text-stone-900 text-sm">Hiện tại không có kèo SOS nào cần cứu hộ.</p>
                  <p className="text-stone-600 max-w-sm mx-auto">
                    Đội bạn đang bị đối thủ bùng kèo hoặc thiếu đối phút chót? Phát tín hiệu để các đội quanh khu vực hỗ trợ ngay!
                  </p>

                  {/* CUỐNG VÉ BẢO CHỨNG */}
                  <div className="max-w-xs mx-auto">
                    <VintageScrapbookAsset
                      asset="ticket-stub"
                      tape="left"
                      tilt={-1}
                      className="w-full"
                      caption="Bảo chứng cọc 200k chống bùng"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setIsCreateSosMode(true);
                      setIsCreateOpen(true);
                    }}
                    className="ticket-stub inline-flex items-center gap-1.5 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition active:scale-95"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Phát Tín Hiệu Cứu Kèo Khẩn Cấp Ngay</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 3: CHỢ CẦU LẺ */}
          {activeTab === "sub-market" && (
            <SubMarketAndRollCall
              viewMode="sub-market"
              onRequireAuth={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true);
                } else {
                  setIsTeamOnboardingOpen(true);
                }
              }}
            />
          )}

          {/* WORKSPACE 4: BẢN ĐỒ CỤM SÂN BÓNG ĐÁ HÀ NỘI & CHỈ ĐƯỜNG 1-CHẠM */}
          {activeTab === "pitch-map" && (
            <div className="space-y-4">
              <PitchMapSection />
            </div>
          )}

          {/* WORKSPACE 6: HỒ SƠ ĐỘI TÔI & THẺ CĂN CƯỚC BÓNG ĐÁ SỐ CHÍNH CHỦ */}
          {activeTab === "trust-profile" && (
            <div className="space-y-4">
              {hasTeam && team ? (
                <PersonalTeamProfileHub
                  team={team}
                  profile={profile}
                  escrowWallet={escrowWallet}
                  onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
                  onQuickCreateMatch={() => setIsCreateOpen(true)}
                  onSignOut={async () => {
                    await signOut();
                    pushBotLog(
                      "👋 Đã Đăng Xuất Tài Khoản",
                      "Bạn đã đăng xuất an toàn khỏi hệ thống. Bấm Đăng nhập khi cần quản lý đội bóng hoặc mở kèo!",
                      "Đã Đăng Xuất"
                    );
                  }}
                  onRefreshTeam={refreshAuth}
                />
              ) : (
                <div className="card-retro-paper relative rounded-3xl border border-stone-300 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md overflow-hidden">
                  <div className="washi-tape -top-2 left-6 rotate-[-2deg]" />
                  <div className="space-y-1 relative z-10">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Định danh minh bạch • 1 SĐT = 1 Đội
                    </span>
                    <h3 className="text-base font-black text-stone-900 pt-1">
                      {!isAuthenticated
                        ? "Bạn chưa đăng nhập tài khoản Đội trưởng"
                        : "Hoàn tất 3 bước tạo Hồ sơ Đội bóng của bạn"}
                    </h3>
                    <p className="text-xs text-stone-600">
                      Cấp ngay <strong>Thẻ Căn Cước Bóng Đá Số</strong> kèm{" "}
                      <strong className="text-emerald-800">
                        100/100 điểm tín nhiệm
                      </strong>{" "}
                      (Miễn cọc tiền mặt) và khóa SĐT Zalo chính chủ chống bùng kèo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        setIsAuthModalOpen(true);
                      } else {
                        setIsTeamOnboardingOpen(true);
                      }
                    }}
                    className="ticket-stub px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shrink-0 shadow-md transition active:scale-95"
                  >
                    {!isAuthenticated
                      ? "Đăng ký / Đăng nhập Đội trưởng"
                      : "Thiết lập Đội bóng ngay"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer báo giấy & liên kết Quản trị ẩn */}
        <footer className="mt-12 pb-8 border-t border-stone-300 pt-6 text-center text-xs text-stone-600 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-6 rounded bg-[#15803d] text-white font-black text-[10px] flex items-center justify-center shadow-xs">
              7v7
            </span>
            <span className="font-black text-stone-900 text-sm tracking-tight">
              GiaoHuu<span className="text-[#15803d]">.vn</span>
            </span>
          </div>
          <p className="font-semibold text-stone-700">
            © 2026 GiaoHuu.vn Hà Nội • Nền tảng Ghép Trận Sân 7 &amp; Chống Bùng Kèo
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-stone-600 flex-wrap">
            <button
              onClick={() => setIsRulesOpen(true)}
              className="text-stone-800 hover:text-red-700 transition-colors inline-flex items-center gap-1 font-bold"
              title="Bảng Nội Quy & Quy Chế Kỷ Luật GiaoHuu.vn"
            >
              <Scale className="w-3 h-3 text-amber-700" />
              <span>Bảng Nội Quy &amp; Kỷ Luật</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGuideOpen(true)}
              className="text-stone-800 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 font-semibold"
            >
              <BookOpen className="w-2.5 h-2.5 text-stone-600" />
              <span>Hướng dẫn sử dụng</span>
            </button>
            <span>•</span>
            <span>Tiêu chuẩn Sân 7 Hà Nội</span>
            <span>•</span>
            <span>Bảo chứng VietQR Napas247</span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1 opacity-70 hover:opacity-100 font-medium"
              title="Quản trị hệ thống (Khóa PIN)"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>Quản trị</span>
            </Link>
          </div>
        </footer>
      </div>

      {/* Modal Khớp Kèo */}
      <MatchChallengeModal
        match={activeChallengeMatch}
        myTrustScore={team?.trust_score ?? myTrustScore}
        onClose={() => setActiveChallengeMatch(null)}
        onConfirmMatch={handleConfirmChallenge}
        escrowWallet={escrowWallet}
        onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
        verifiedTeam={team}
        verifiedProfile={profile}
        isAuthenticated={isAuthenticated}
        onRequireAuth={() => {
          setPendingChallengeMatch(activeChallengeMatch);
          setActiveChallengeMatch(null);
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsTeamOnboardingOpen(true);
          }
        }}
      />

      {/* Modal Đăng Kèo Mới */}
      <CreateMatchModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setIsCreateSosMode(false);
        }}
        initialIsSos={isCreateSosMode}
        onCreateMatch={handleCreateNewMatch}
        verifiedTeam={team}
        verifiedProfile={profile}
        onRequireAuth={() => {
          setIsCreateOpen(false);
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsTeamOnboardingOpen(true);
          }
        }}
        escrowWallet={escrowWallet}
        onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
      />

      {/* Modal Chỉnh Sửa Kèo Đấu (Chỉ dành cho Đội Trưởng Tạo Kèo) */}
      <EditMatchModal
        isOpen={!!editingMatch}
        onClose={() => setEditingMatch(null)}
        match={editingMatch}
        onSaveMatch={handleSaveEditedMatch}
        onDeleteMatch={handleDeleteMatch}
      />

      {/* Modal Xác Nhận Hủy / Xóa Kèo & Hộp Kháng Cáo Giải Oan (Đề xuất 2) */}
      <CancelMatchAppealModal
        match={cancellingMatch}
        open={!!cancellingMatch}
        onClose={() => setCancellingMatch(null)}
        onConfirmCancelMatch={handleConfirmCancelMatch}
        onRequestMutualCancel={handleRequestMutualCancel}
      />

      {/* Modal Đội Khách Xin Rút Lui / Hủy Nhận Kèo Đột Xuất & Kháng Cáo BQT */}
      <CancelGuestChallengeModal
        match={cancellingGuestMatch}
        open={!!cancellingGuestMatch}
        onClose={() => setCancellingGuestMatch(null)}
        guestTeamName={team?.team_name || "Đội bạn"}
        guestCaptainPhone={profile?.phone || team?.captain_phone || ""}
        myTrustScore={effectiveTrustScore}
        onConfirmWithdraw={handleConfirmGuestWithdraw}
      />

      {/* Modal Đội Khách Phản Hồi Yêu Cầu Xin Hủy Kèo Từ Chủ Sân (Đồng thuận 2 bên) */}
      <RespondCancelRequestModal
        match={respondingCancelMatch}
        open={!!respondingCancelMatch}
        onClose={() => setRespondingCancelMatch(null)}
        onAcceptCancel={handleAcceptCancelRequest}
        onRejectCancel={handleRejectCancelRequest}
      />

      {/* Modal Đăng Nhập / Đăng Ký Đội Trưởng */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          await refreshAuth();
          if (pendingChallengeMatch) {
            setActiveChallengeMatch(pendingChallengeMatch);
            setPendingChallengeMatch(null);
          } else {
            const hasDraft =
              typeof window !== "undefined" &&
              !!localStorage.getItem("batkeo7_pending_match_draft");
            if (hasDraft) {
              setIsCreateOpen(true);
            } else if (!hasTeam) {
              setIsTeamOnboardingOpen(true);
            }
          }
        }}
      />

      {/* Modal Wizard 3 Bước Tạo Hồ Sơ Đội Bóng Chính Chủ */}
      <TeamOnboardingModal
        isOpen={isTeamOnboardingOpen}
        onClose={() => setIsTeamOnboardingOpen(false)}
        initialCaptainName={profile?.full_name || ""}
        initialPhone={profile?.phone || ""}
        onSuccess={async (createdTeam) => {
          await refreshAuth();
          if (pendingChallengeMatch) {
            setActiveChallengeMatch(pendingChallengeMatch);
            setPendingChallengeMatch(null);
          } else {
            const hasDraft =
              typeof window !== "undefined" &&
              !!localStorage.getItem("batkeo7_pending_match_draft");
            if (hasDraft) {
              setIsCreateOpen(true);
            } else {
              setActiveTab("trust-profile");
            }
          }
          pushBotLog(
            `🎉 Đã Cấp Thẻ Căn Cước Đội: ${createdTeam?.team_name || "Đội mới"}`,
            `Đội bóng đã được xác thực chính chủ với 100/100 điểm tín nhiệm (Miễn cọc tiền mặt).`,
            "100/100 ★",
            profile?.phone,
            profile?.full_name
          );
        }}
      />

      {/* Modal Quản Lý Ví Ký Quỹ Nội Bộ (In-App Escrow Balance) */}
      <EscrowWalletModal
        isOpen={isEscrowModalOpen}
        onClose={() => setIsEscrowModalOpen(false)}
        wallet={escrowWallet}
        trustScore={effectiveTrustScore}
        teamName={team?.team_name || "Đội bóng"}
        captainPhone={profile?.phone || team?.captain_phone || "0988666888"}
        onDepositSuccess={handleDepositEscrow}
        onWithdrawSuccess={handleWithdrawEscrow}
      />

      {/* Modal Mã Bắt Tay 4 Số Trên Sân & Check-in GPS Chống Vu Khống */}
      <HandshakeModal
        isOpen={!!activeHandshakeMatch}
        onClose={() => setActiveHandshakeMatch(null)}
        match={activeHandshakeMatch}
        currentTeamRole={
          activeHandshakeMatch?.hostTeam.name ===
          (team?.team_name || "FC Khởi Nghiệp Cầu Giấy")
            ? "HOST"
            : "GUEST"
        }
        onVerifySuccess={handleVerifyHandshakeSuccess}
        onReportNoShow={handleReportNoShow}
      />

      {/* Trung Tâm Chuông Thông Báo In-App & Liên Kết Zalo 1-Click */}
      {isBotDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[84vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Trung Tâm Thông Báo GiaoHuu.vn
                  </h3>
                  <p className="text-[11px] text-emerald-400">
                    ● Chuông Web Trực Tiếp &amp; Mở Zalo 1-Chạm
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBotDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl bg-sky-500/10 border border-sky-500/30 p-3 text-[11px] text-slate-300 leading-relaxed">
              💡 <strong className="text-sky-300">Khách hàng / Đội trưởng</strong>{" "}
              nhận chuông báo trực tiếp trên Web và bấm 1 chạm nhảy thẳng sang{" "}
              <strong className="text-white">Zalo</strong> theo số điện thoại đã
              chuẩn hóa (không cần cài Telegram).
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {botLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {log.badge}
                    </span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{log.title}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {log.msg}
                  </p>

                  {log.zaloPhone && (
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={getZaloDeepLink(log.zaloPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-[#0068FF] hover:bg-[#0057D9] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <MessageSquare className="w-3 h-3 fill-current" />
                        <span>
                          Mở Zalo {log.captainName || "Đội trưởng"}
                        </span>
                      </a>
                      <a
                        href={`tel:${normalizeVietnamPhone(log.zaloPhone)}`}
                        className="py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Gọi</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  pushBotLog(
                    "🔔 Test Chuông Báo Chốt Kèo & Zalo 1-Chạm",
                    "Đội FC Anh Em Cầu Giấy (0988.666.888) vừa nhận đối ca 19:00 tại Sân Thành Phát. Bấm nút bên dưới để nhảy thẳng sang Zalo Đội trưởng!",
                    "Test In-App",
                    "0988666888",
                    "Đội trưởng Tuấn"
                  );
                }}
                className="w-full h-9 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chuông Web &amp; Nút Mở Zalo Đội Trưởng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nút Nổi Tư Vấn Khách Hàng (AI Agent & Zalo BQT) */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-7 z-50">
        {/* Bản Mobile: Nút tròn 48px tinh gọn, chống che lấp nội dung */}
        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="sm:hidden w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-2xl shadow-emerald-500/50 flex items-center justify-center relative border-2 border-emerald-300 active:scale-95 transition-transform"
          title="Tư vấn khách hàng & Trợ lý AI GiaoHuu.vn"
        >
          <Bot className="w-6 h-6 fill-current" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-950" />
        </button>

        {/* Bản Desktop / Máy tính: Giữ nguyên 100% giao diện nút to chữ nhật */}
        <button
          type="button"
          onClick={() => setIsSupportOpen(true)}
          className="hidden sm:flex group relative items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-300/60 cursor-pointer"
          title="Tư vấn khách hàng & Trợ lý AI GiaoHuu.vn"
        >
          <div className="relative">
            <Bot className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex flex-col items-start leading-tight text-left">
            <span className="tracking-tight text-slate-950 font-black">Tư Vấn Khách Hàng</span>
            <span className="text-[10px] text-slate-900/80 font-bold">
              AI Trợ Lý &amp; Zalo BQT
            </span>
          </div>
        </button>
      </div>

      {/* Modal Tư Vấn Khách Hàng Thông Minh (AI Agent + Zalo 1-Chạm) */}
      <CustomerSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        onOpenWallet={() => setIsEscrowModalOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {/* Modal Cẩm Nang Hướng Dẫn Sử Dụng & Quy Chế GiaoHuu.vn */}
      <AppGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenWallet={() => setIsEscrowModalOpen(true)}
        onSelectTab={(tab) => setActiveTab(tab as ActiveTab)}
      />

      {/* Modal Bảng Nội Quy & Kỷ Luật Thể Thao BắtKèo7 */}
      <PlatformRulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

    </div>
  );
}
