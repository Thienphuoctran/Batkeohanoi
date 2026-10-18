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
import { CustomerSupportModal } from "@/components/support/CustomerSupportModal";
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
import { useRealtimeMatchFeed } from "@/hooks/useRealtimeMatches";
import { useAuthTeam } from "@/hooks/useAuthTeam";
import { AuthModal } from "@/components/auth/AuthModal";
import { TeamOnboardingModal } from "@/components/team/TeamOnboardingModal";
import {
  signOutAction,
  createMatchInDatabaseAction,
  requestWithdrawEscrowAction,
} from "@/actions/auth";
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
  const [editingMatch, setEditingMatch] = useState<MatchFeedItem | null>(null);
  const [cancellingMatch, setCancellingMatch] = useState<MatchFeedItem | null>(null);
  const [latestBroadcast, setLatestBroadcast] = useState<EmergencyBroadcastItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBotDrawerOpen, setIsBotDrawerOpen] = useState(false);
  const [unreadBotCount, setUnreadBotCount] = useState(1);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

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

  // Kết nối Supabase WebSockets Realtime (Zero Reload giữa các thiết bị)
  const {
    matches,
    setMatches,
    broadcastNewMatch,
    broadcastMatchLock,
  } = useRealtimeMatchFeed(MOCK_MATCH_FEEDS, pushBotLog);

  // Lọc danh sách kèo
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
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
  ]);

  const sosMatches = filteredMatches.filter(
    (m) => m.isSOS && m.status !== "MATCHED"
  );
  const regularMatches = filteredMatches.filter(
    (m) => !m.isSOS || m.status === "MATCHED"
  );

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

  const handleCreateNewMatch = async (newMatch: MatchFeedItem) => {
    // Nếu đội có điểm uy tín < 70, tạm khóa 200.000đ trong ví ký quỹ
    if (effectiveTrustScore < 70) {
      setEscrowWallet((prev) => ({
        ...prev,
        lockedAmount: prev.lockedAmount + 200000,
        availableBalance: Math.max(0, prev.balance - (prev.lockedAmount + 200000)),
      }));
    }

    setMatches((prev) => [newMatch, ...prev]);
    setActiveTab(newMatch.isSOS ? "sos" : "feed");

    // Phát sóng Realtime sang các thiết bị khác đang mở bảng tin (Zero Reload)
    await broadcastNewMatch(newMatch);

    // Nếu Đội trưởng đã đăng ký đội chính chủ trên Supabase, lưu kèo thẳng vào bảng public.matches
    if (team?.id) {
      await createMatchInDatabaseAction({
        hostTeamId: team.id,
        pitchCustomName: newMatch.pitchName,
        district: newMatch.district,
        timeSlotLabel: `${newMatch.startTime} - ${newMatch.endTime}`,
        totalFee: newMatch.totalCostVnd,
        splitFee: newMatch.shareCostVnd,
        isSos: newMatch.isSOS,
        notes: newMatch.notes,
        gmapsUrl: newMatch.gmapsUrl,
        isGmapsIntegrated: newMatch.isGmapsIntegrated,
      });
    }

    pushBotLog(
      newMatch.isSOS
        ? "🚨 Đã Phát Tín Hiệu Cứu Hộ SOS"
        : "⚽ Đã Đăng Kèo Mới Lên Bảng Tin",
      `${newMatch.hostTeam.name} tìm đối tại ${newMatch.pitchName} (${newMatch.startTime}). Đã gắn định tuyến Zalo (${newMatch.hostTeam.captainPhone}).`,
      newMatch.isSOS ? "SOS < 2h" : "Kèo Mới",
      newMatch.hostTeam.captainZalo || newMatch.hostTeam.captainPhone,
      `${newMatch.hostTeam.captainName} (${newMatch.hostTeam.shortName})`
    );

    try {
      await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMatch),
      });
    } catch (err) {
      console.log("Local match synchronized");
    }
  };

  const handleSaveEditedMatch = (updatedMatch: MatchFeedItem) => {
    setMatches((prev) =>
      prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m))
    );
    setEditingMatch(null);
    pushBotLog(
      "✏️ Đã Cập Nhật Kèo Đấu",
      `Thông tin kèo đấu tại ${updatedMatch.pitchName} (${updatedMatch.startTime} - ${updatedMatch.district}) đã được cập nhật thành công!`,
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

  const handleConfirmCancelMatch = (
    matchId: string,
    options: {
      incurredPenalty: boolean;
      penaltyPoints: number;
      submittedAppeal?: any;
    }
  ) => {
    const target = matches.find((m) => m.id === matchId);
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    setCancellingMatch(null);

    if (options.incurredPenalty && options.penaltyPoints > 0) {
      setMyTrustScore((prev) => Math.max(0, prev - options.penaltyPoints));
    }

    if (options.submittedAppeal) {
      pushBotLog(
        `🛡️ Đã Gửi Đơn Kháng Cáo (#${options.submittedAppeal.id}) Lên BQT`,
        `Kèo tại ${target?.pitchName || "sân"} đã hủy. Đơn kháng cáo của bạn đã được chuyển tới Trạm Xét Duyệt 1-Chạm (/admin) & Telegram BQT để khôi phục 100 điểm Uy Tín!`,
        "Chờ Duyệt Kháng Cáo"
      );
    } else if (options.incurredPenalty) {
      pushBotLog(
        `⚠️ Đã Hủy Kèo Sát Giờ (Trừ -${options.penaltyPoints}đ Uy Tín)`,
        `Kèo đấu tại ${target?.pitchName || "sân"} (${target?.startTime || ""}) đã bị hủy không kèm kháng cáo. Đội bị trừ -${options.penaltyPoints} điểm Uy Tín theo quy định.`,
        `-${options.penaltyPoints}đ Uy Tín`
      );
    } else {
      pushBotLog(
        "🗑️ Đã Xóa Kèo Đấu Hợp Lệ (Không Trừ Điểm)",
        `Kèo đấu tại ${target?.pitchName || "sân"} (${target?.startTime || ""}) đã được gỡ bỏ khỏi bảng tin trước giờ quy định.`,
        "Đã Xóa Kèo"
      );
    }
  };

  return (
    <div className="min-h-screen bg-stadium-multi text-slate-100 flex flex-col pb-16 relative overflow-x-hidden">
      {/* Dynamic Multi-Color Stadium Flares & Floating Sport Stickers */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Multi-Color Ambient Light Flares */}
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-28 w-[450px] h-[450px] bg-amber-500/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 -left-28 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-[500px] h-[500px] bg-sky-500/12 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Sport Stickers (3D Glassmorphism Badges) */}
        <div className="absolute top-36 left-2 xl:left-8 animate-float-slow hidden md:inline-flex">
          <span className="sport-sticker border-emerald-500/40 text-emerald-300">
            <span className="text-base">⚽</span> Sân 7 Hà Nội
          </span>
        </div>
        <div className="absolute top-56 right-3 xl:right-10 animate-float-reverse hidden md:inline-flex">
          <span className="sport-sticker border-amber-500/40 text-amber-300">
            <span className="text-base">⚡</span> Giờ Vàng 19h00
          </span>
        </div>
        <div className="absolute top-[480px] left-3 xl:left-8 animate-float-reverse hidden lg:inline-flex">
          <span className="sport-sticker border-sky-500/40 text-sky-300">
            <span className="text-base">🧤</span> Thủ Môn Xuất Sắc
          </span>
        </div>
        <div className="absolute top-[640px] right-3 xl:right-10 animate-float-slow hidden lg:inline-flex">
          <span className="sport-sticker border-orange-500/40 text-orange-300">
            <span className="text-base">🏆</span> Cúp Phủi Cầu Giấy
          </span>
        </div>
        <div className="absolute bottom-40 left-4 xl:left-12 animate-float-slow hidden xl:inline-flex">
          <span className="sport-sticker border-teal-500/40 text-teal-300">
            <span className="text-base">👟</span> Đinh Dăm TF Chuẩn
          </span>
        </div>
        <div className="absolute bottom-24 right-4 xl:right-14 animate-float-reverse hidden xl:inline-flex">
          <span className="sport-sticker border-rose-500/40 text-rose-300">
            <span className="text-base">🛡️</span> Cam Kết Không Bùng Kèo
          </span>
        </div>
      </div>

      <div
        className={`w-full mx-auto transition-all duration-300 relative z-10 ${
          isWideLayout
            ? "max-w-6xl"
            : "max-w-md border-x border-slate-800/80 shadow-2xl"
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
          escrowWallet={escrowWallet}
          onOpenEscrowModal={() => setIsEscrowModalOpen(true)}
        />

        {/* Banner Phát Sóng Khẩn Cấp Từ BQT (/admin - Đề xuất 5) */}
        {latestBroadcast && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-900/90 border border-purple-500/40 flex items-start justify-between gap-3 shadow-lg">
            <div className="space-y-0.5 text-xs">
              <div className="font-black text-purple-300 flex items-center gap-1.5">
                <span>📢 THÔNG BÁO TỪ BAN QUẢN TRỊ:</span>
                <span className="text-white">{latestBroadcast.title}</span>
              </div>
              <p className="text-[11px] text-slate-200 leading-relaxed">
                {latestBroadcast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLatestBroadcast(null)}
              className="p-1 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white shrink-0"
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
              />

              {/* Thanh Tìm Kiếm + Chọn Ca Giờ + Quận + 3 Tier */}
              <section id="matches-feed-anchor" className="surface-card rounded-2xl border border-white/[0.08] p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm theo tên sân (Thành Phát, Mễ Trì, Đình Thôn...), tên FC, đội trưởng..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0 hidden sm:inline" />
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      aria-label="Lọc theo khung giờ"
                      className="h-9 px-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ALL">⏰ Mọi khung giờ</option>
                      <option value="17:30">Ca 17:30</option>
                      <option value="19:00">Ca 19:00</option>
                      <option value="19:30">Ca 19:30</option>
                      <option value="20:30">Ca 20:30</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1 border-t border-white/[0.05]">
                  {/* Khu vực Toàn Hà Nội */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
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
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                          selectedDistrict === dist
                            ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400 ring-1 ring-emerald-400 shadow-md"
                            : "bg-slate-950/80 text-slate-400 hover:text-white border border-white/[0.07]"
                        }`}
                      >
                        {dist === "ALL" ? "Tất cả Hà Nội" : dist}
                      </button>
                    ))}
                  </div>

                  {/* 3 Tier */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Shield className="w-3 h-3 text-emerald-400" />
                      Tier:
                    </span>
                    <button
                      onClick={() => setSelectedTier("ALL")}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                        selectedTier === "ALL"
                          ? "bg-slate-200 text-slate-950 font-black"
                          : "bg-slate-950/80 text-slate-400 hover:text-white border border-white/[0.07]"
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
                                ? "bg-[#1d4ed8] text-white border-blue-300 shadow-md ring-1 ring-blue-400"
                                : t === 2
                                ? "bg-[#15803d] text-white border-emerald-300 shadow-md ring-1 ring-emerald-400"
                                : "bg-[#9a3412] text-white border-orange-300 shadow-md ring-1 ring-orange-400"
                              : "bg-slate-950/80 border-white/[0.07] text-slate-400 hover:text-slate-200"
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
                  {sosMatches.map((sos) => (
                    <SosAlertCard
                      key={sos.id}
                      match={sos}
                      onSelectMatch={(m) => setActiveChallengeMatch(m)}
                    />
                  ))}
                </section>
              )}

              {/* Danh sách Kèo Thường */}
              {filteredMatches.length === 0 ? (
                <div className="surface-card rounded-2xl border border-white/[0.08] p-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Chưa có kèo đấu nào đang mở</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Hãy là đội đầu tiên mở kèo giao lưu hôm nay hoặc bấm tạo kèo để tìm đối thủ ngay!
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/15 transition"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Tạo Kèo Mới Ngay</span>
                  </button>
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
              <div className="rounded-2xl bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border border-rose-500/40 p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-black text-rose-400 flex items-center gap-2">
                    <Flame className="w-4 h-4 fill-current animate-bounce" />
                    <span>TRẠM CỨU HỘ KÈO PHÚT CHÓT (&lt; 2 TIẾNG)</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Cứu kèo giúp sân không bị bỏ trống • Giảm ngay 125.000đ tiền sân &amp; Thưởng +8 điểm tín nhiệm
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black">
                  Ưu tiên số 1
                </span>
              </div>

              {sosMatches.length > 0 ? (
                <div className="space-y-3.5">
                  {sosMatches.map((sos) => (
                    <SosAlertCard
                      key={sos.id}
                      match={sos}
                      onSelectMatch={(m) => setActiveChallengeMatch(m)}
                    />
                  ))}
                </div>
              ) : (
                <div className="surface-card rounded-2xl border border-white/[0.08] p-8 text-center text-xs text-slate-400">
                  Hiện tại không có kèo SOS nào cần cứu hộ. Hãy kiểm tra lại sau hoặc mở kèo mới!
                </div>
              )}
            </div>
          )}

          {/* WORKSPACE 3: CHỢ CẦU LẺ */}
          {activeTab === "sub-market" && (
            <SubMarketAndRollCall viewMode="sub-market" />
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
                    await signOutAction();
                    await refreshAuth();
                  }}
                  onRefreshTeam={refreshAuth}
                />
              ) : (
                <div className="surface-card rounded-2xl border border-emerald-500/35 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Định danh minh bạch • 1 SĐT = 1 Đội
                    </span>
                    <h3 className="text-base font-extrabold text-white pt-1">
                      {!isAuthenticated
                        ? "Bạn chưa đăng nhập tài khoản Đội trưởng"
                        : "Hoàn tất 3 bước tạo Hồ sơ Đội bóng của bạn"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Cấp ngay <strong>Thẻ Căn Cước Bóng Đá Số</strong> kèm{" "}
                      <strong className="text-emerald-400">
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
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shrink-0 shadow-lg shadow-emerald-500/20 transition"
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

        {/* Footer kín đáo & liên kết Quản trị ẩn */}
        <footer className="mt-12 pb-6 border-t border-slate-900/90 pt-6 text-center text-xs text-slate-500 space-y-2">
          <p className="font-medium text-slate-400">
            © 2026 BắtKèo7 Hà Nội • Nền tảng Ghép Đối & Chống Bùng Kèo Sân Cỏ Phủi
          </p>
          <div className="flex items-center justify-center gap-3 text-[11px] text-slate-600">
            <span>Tiêu chuẩn Sân 7 Hà Nội</span>
            <span>•</span>
            <span>Bảo chứng VietQR Napas247</span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-slate-600 hover:text-slate-400 transition-colors inline-flex items-center gap-1 opacity-50 hover:opacity-100"
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
      />

      {/* Modal Đăng Kèo Mới */}
      <CreateMatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreateMatch={handleCreateNewMatch}
        verifiedTeam={team}
        verifiedProfile={profile}
        onRequireAuth={() => {
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
      />

      {/* Modal Đăng Nhập / Đăng Ký Đội Trưởng */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async () => {
          await refreshAuth();
          setIsTeamOnboardingOpen(true);
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
          setActiveTab("trust-profile");
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
                    Trung Tâm Thông Báo BắtKèo7
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
      <div className="fixed bottom-5 right-4 sm:right-6 z-40">
        <button
          onClick={() => setIsSupportOpen(true)}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-300/40"
          title="Tư vấn khách hàng & Trợ lý AI BắtKèo7"
        >
          <div className="relative">
            <Bot className="w-5 h-5 fill-current" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="tracking-tight">Tư Vấn Khách Hàng</span>
            <span className="text-[10px] text-slate-900/80 font-bold hidden sm:inline">
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

    </div>
  );
}
