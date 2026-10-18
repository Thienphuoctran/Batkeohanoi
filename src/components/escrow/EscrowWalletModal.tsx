"use client";

import React, { useState } from "react";
import {
  Wallet,
  X,
  ShieldAlert,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateVietQRQuickUrl } from "@/constants/mockMatchmaking";
import { EscrowWallet } from "@/types/matchmaking";

interface EscrowWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: EscrowWallet;
  trustScore: number;
  teamName?: string;
  captainPhone?: string;
  onDepositSuccess: (amount: number) => void;
  onWithdrawSuccess: (
    amount: number,
    bankInfo: { bankName?: string; accountNumber?: string; accountName?: string; bank?: string; account?: string; name?: string }
  ) => void;
}

export function EscrowWalletModal({
  isOpen,
  onClose,
  wallet,
  trustScore,
  teamName = "FC Khởi Nghiệp Cầu Giấy",
  captainPhone = "0988666888",
  onDepositSuccess,
  onWithdrawSuccess,
}: EscrowWalletModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "deposit" | "withdraw">("overview");
  const [depositAmount, setDepositAmount] = useState(200000);
  const [withdrawBank, setWithdrawBank] = useState("MBBank (970422)");
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawName, setWithdrawName] = useState("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState(false);
  const [mockDepositing, setMockDepositing] = useState(false);

  if (!isOpen) return null;

  const isRestricted = trustScore < 70 && wallet.balance < 200000;
  const canWithdraw = trustScore >= 70 && wallet.availableBalance > 0;
  const pointsNeeded = Math.max(0, 70 - trustScore);

  // Sinh mã VietQR nạp tiền vào quỹ ký quỹ định danh
  const depositQrUrl = generateVietQRQuickUrl({
    bankBin: "970422",
    accountNumber: "07440948327598",
    accountName: "TRAN QUOC THIEN PHUOC",
    amount: depositAmount,
    description: `BK7 NAP ${captainPhone.slice(-6)} ${teamName.slice(0, 6)}`,
  });

  const handleSimulateDeposit = () => {
    setMockDepositing(true);
    setTimeout(() => {
      onDepositSuccess(depositAmount);
      setMockDepositing(false);
      setActiveTab("overview");
    }, 700);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWithdraw || wallet.availableBalance <= 0) return;
    onWithdrawSuccess(wallet.availableBalance, {
      bank: withdrawBank,
      account: withdrawAccount,
      name: withdrawName,
    });
    setWithdrawSuccessMsg(true);
    setTimeout(() => {
      setWithdrawSuccessMsg(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-[#0f172a] border border-white/[0.1] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Tài Khoản Ký Quỹ Nội Bộ
              </span>
              <h3 className="text-base font-extrabold text-white">
                Ví Ký Quỹ &amp; Chống Bùng Kèo
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.06] bg-slate-950/50 text-xs font-bold p-1 gap-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-2 rounded-xl transition ${
              activeTab === "overview"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Tổng Quan Ví
          </button>
          <button
            onClick={() => setActiveTab("deposit")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "deposit"
                ? "bg-emerald-600 text-white font-extrabold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nạp Cọc (200k)</span>
          </button>
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "withdraw"
                ? "bg-amber-600 text-white font-extrabold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Rút Về Ngân Hàng</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: TỔNG QUAN VÍ */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Thẻ hiển thị số dư ví */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 p-4 space-y-3 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Số dư Ví Ký Quỹ của {teamName}:
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    BẢO CHỨNG TỰ ĐỘNG
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight tabular-nums">
                      {wallet.balance.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Khả dụng:{" "}
                      <strong className="text-slate-200">
                        {wallet.availableBalance.toLocaleString("vi-VN")}đ
                      </strong>{" "}
                      • Tạm khóa trận:{" "}
                      <strong className="text-amber-300">
                        {wallet.lockedAmount.toLocaleString("vi-VN")}đ
                      </strong>
                    </div>
                  </div>

                  <Button
                    onClick={() => setActiveTab(isRestricted ? "deposit" : "withdraw")}
                    className={`h-9 px-3.5 rounded-xl text-xs font-black shadow-md ${
                      isRestricted
                        ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                    }`}
                  >
                    {isRestricted ? "Nạp 200k Mở Khóa" : "Quản lý ví"}
                  </Button>
                </div>
              </div>

              {/* Banner trạng thái theo Điểm Tín Nhiệm */}
              {trustScore >= 70 ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-extrabold text-xs text-emerald-300">
                      Điểm Tín Nhiệm: {trustScore}/100★ • Đạt Chuẩn An Toàn
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Đội bạn thuộc diện <strong>Tín Nhiệm Cao (≥ 70đ)</strong>. Bạn
                    được <strong>Miễn Cọc 100%</strong> trọn đời khi Tạo Kèo &amp;
                    Nhận Kèo (Số dư ví 0đ vẫn sử dụng bình thường).
                  </p>
                  {wallet.balance > 0 && (
                    <div className="pt-1 flex items-center justify-between text-[11px]">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Unlock className="w-3 h-3" /> Đã mở khóa quyền rút tiền
                      </span>
                      <button
                        onClick={() => setActiveTab("withdraw")}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Bấm rút {wallet.availableBalance.toLocaleString("vi-VN")}đ về STK →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                      Điểm Tín Nhiệm: {trustScore}/100★ (Dưới ngưỡng 70đ)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/15">
                      CẦN BẢO CHỨNG
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Do từng bùng kèo hoặc bị báo cáo vi phạm, đội bạn cần duy trì{" "}
                    <strong>200.000đ trong Ví Ký Quỹ</strong> để được mở quyền Tạo Kèo &amp; Nhận Kèo.
                  </p>

                  {/* Thanh tiến trình hồi phục uy tín để rút tiền */}
                  <div className="rounded-lg bg-slate-950/80 p-2.5 border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Tiến trình khôi phục quyền Rút Tiền:</span>
                      <strong className="text-amber-300 font-mono">{trustScore}/70đ</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (trustScore / 70) * 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>
                        Thi đấu văn minh thêm <strong>{pointsNeeded}đ</strong> (khoảng{" "}
                        {Math.ceil(pointsNeeded / 10)} trận đúng giờ) để mở khóa rút 200k về ngân hàng.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Giải thích cơ chế bảo vệ kép */}
              <div className="rounded-xl bg-slate-950/60 border border-white/[0.06] p-3 space-y-2 text-[11px] text-slate-400">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cam kết vận hành Ví Ký Quỹ Minh Bạch:</span>
                </div>
                <ul className="space-y-1 list-disc pl-4 text-[10px] leading-relaxed">
                  <li>200k nạp vào ví là tài sản của bạn, chỉ tạm khóa khi có kèo đấu đang diễn ra.</li>
                  <li>Sau trận, 2 đội nhập <strong>Mã Bắt Tay 4 Số</strong> trên sân là 200k tự động nhả về ví.</li>
                  <li>Nếu đối thủ bùng kèo bạn: 200k cọc của đối thủ được <strong>chuyển thẳng vào ví bạn</strong> đền bù tiền sân.</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: NẠP TIỀN CỌC 200K */}
          {activeTab === "deposit" && (
            <div className="space-y-3.5 text-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Nạp Tiền Bằng VietQR Napas247 Tự Động
                </span>
                <h4 className="text-sm font-extrabold text-white mt-0.5">
                  Nạp 200.000đ Ký Quỹ Đội Bóng
                </h4>
                <p className="text-[10px] text-slate-400">
                  Tiền nạp vào ví sẽ mở khóa quyền Bắt Kèo &amp; Tạo Kèo lập tức.
                </p>
              </div>

              <div className="bg-white p-3 rounded-2xl w-48 mx-auto shadow-xl">
                <img
                  src={depositQrUrl}
                  alt="Mã QR nạp ví ký quỹ"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="rounded-xl bg-slate-950 p-3 border border-white/[0.08] text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-white">MBBank (Quân Đội)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-emerald-400">07440948327598</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="font-bold text-white">TRAN QUOC THIEN PHUOC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="font-mono font-black text-amber-400">200.000 VNĐ</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/[0.06]">
                  <span className="text-slate-400">Nội dung CK:</span>
                  <span className="font-mono font-bold text-sky-400 text-[11px]">
                    BK7 NAP {captainPhone.slice(-6)} {teamName.slice(0, 6)}
                  </span>
                </div>
              </div>

              {/* Nút bấm demo nạp tiền nhanh */}
              <Button
                onClick={handleSimulateDeposit}
                disabled={mockDepositing}
                className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{mockDepositing ? "Đang xác thực giao dịch..." : "Đã Chuyển Khoản 200k (Xác Nhận Nạp Ngay)"}</span>
              </Button>
            </div>
          )}

          {/* TAB 3: RÚT TIỀN VỀ NGÂN HÀNG */}
          {activeTab === "withdraw" && (
            <div className="space-y-3.5">
              {!canWithdraw ? (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 space-y-2 text-center">
                  <Lock className="w-8 h-8 text-rose-400 mx-auto" />
                  <h4 className="font-extrabold text-sm text-rose-300">
                    Chức Năng Rút Tiền Đang Tạm Khóa
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Theo quy chế minh bạch, đội bóng có Điểm Tín Nhiệm dưới 70đ{" "}
                    <strong>(hiện tại: {trustScore}/100★)</strong> chưa đủ điều kiện rút khoản bảo chứng 200k.
                  </p>
                  <p className="text-[10px] text-amber-300 font-semibold">
                    👉 Hãy thi đấu văn minh đạt mốc <strong>70 điểm uy tín</strong> để hệ thống tự động mở khóa nút Rút Tiền này!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Rút Số Dư Ví Ký Quỹ Về Tài Khoản Ngân Hàng
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">
                      Rút {wallet.availableBalance.toLocaleString("vi-VN")}đ
                    </h4>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Ngân hàng thụ hưởng:
                    </label>
                    <select
                      value={withdrawBank}
                      onChange={(e) => setWithdrawBank(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white text-xs"
                    >
                      <option value="MBBank">MBBank (Ngân hàng Quân Đội)</option>
                      <option value="Vietcombank">Vietcombank</option>
                      <option value="Techcombank">Techcombank</option>
                      <option value="BIDV">BIDV</option>
                      <option value="ACB">ACB</option>
                      <option value="VPBank">VPBank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Số tài khoản nhận tiền:
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      placeholder="Nhập số tài khoản ngân hàng chính chủ"
                      className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tên chủ tài khoản (Viết hoa không dấu):
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawName}
                      onChange={(e) => setWithdrawName(e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white uppercase text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {withdrawSuccessMsg && (
                    <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 p-2 text-emerald-300 font-bold text-center">
                      ✅ Đã gửi lệnh rút {wallet.availableBalance.toLocaleString("vi-VN")}đ thành công! Tiền sẽ vào tài khoản trong 5-15 phút.
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Xác Nhận Rút Tiền Về Ngân Hàng</span>
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
