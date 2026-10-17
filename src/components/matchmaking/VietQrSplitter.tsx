"use client";

import React, { useState, useEffect } from "react";
import {
  QrCode,
  Calculator,
  Users,
  Handshake,
  Copy,
  Check,
} from "lucide-react";
import { generateVietQRQuickUrl } from "@/constants/mockMatchmaking";
import { Button } from "@/components/ui/button";

const POPULAR_BANKS = [
  { bin: "970422", shortName: "MBBank" },
  { bin: "970436", shortName: "Vietcombank" },
  { bin: "970407", shortName: "Techcombank" },
  { bin: "970418", shortName: "BIDV" },
  { bin: "970432", shortName: "VPBank" },
  { bin: "970416", shortName: "ACB" },
];

interface VietQrSplitterProps {
  syncedPlayerCount?: number;
}

export function VietQrSplitter({ syncedPlayerCount = 8 }: VietQrSplitterProps) {
  const [splitMode, setSplitMode] = useState<"OPPONENT_50_50" | "TEAM_INTERNAL">(
    "OPPONENT_50_50"
  );
  const [pitchCost, setPitchCost] = useState(800000);
  const [ratio, setRatio] = useState<"50_50" | "60_40" | "40_60">("50_50");
  const [playerCount, setPlayerCount] = useState(syncedPlayerCount);

  useEffect(() => {
    setPlayerCount(syncedPlayerCount);
  }, [syncedPlayerCount]);

  const [bankBin, setBankBin] = useState("970422");
  const [accountNumber, setAccountNumber] = useState("07440948327598");
  const [accountName, setAccountName] = useState("TRAN QUOC THIEN PHUOC");
  const [copiedAmount, setCopiedAmount] = useState(false);

  const totalMatchBill = pitchCost;

  const opponentShare =
    ratio === "50_50"
      ? Math.round(totalMatchBill * 0.5)
      : ratio === "60_40"
      ? Math.round(totalMatchBill * 0.6)
      : Math.round(totalMatchBill * 0.4);

  const myTeamShare = totalMatchBill - opponentShare;
  const perMemberAmount =
    playerCount > 0 ? Math.ceil(myTeamShare / playerCount / 1000) * 1000 : 0;

  const finalQrAmount =
    splitMode === "OPPONENT_50_50" ? opponentShare : perMemberAmount;
  const qrMemo =
    splitMode === "OPPONENT_50_50"
      ? "BATKEO7 CHIA TIEN SAN"
      : `TIEN SAN 7 (${playerCount} NGUOI)`;

  const qrUrl = generateVietQRQuickUrl({
    bankBin,
    accountNumber,
    accountName,
    amount: finalQrAmount,
    description: qrMemo,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left 7 Cols: Máy tính chia tiền sân */}
      <div className="lg:col-span-7 surface-card rounded-2xl border border-white/[0.08] p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.07]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Thanh Toán Tiền Sân Tức Thì
            </span>
            <h2 className="text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Máy Tính Chia Tiền Sân &amp; Sinh Mã VietQR</span>
            </h2>
          </div>

          <div className="flex p-1 rounded-xl bg-slate-950 border border-white/[0.08] text-xs font-bold">
            <button
              type="button"
              onClick={() => setSplitMode("OPPONENT_50_50")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                splitMode === "OPPONENT_50_50"
                  ? "bg-emerald-500 text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Chia 50/50 Đối Thủ</span>
            </button>
            <button
              type="button"
              onClick={() => setSplitMode("TEAM_INTERNAL")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                splitMode === "TEAM_INTERNAL"
                  ? "bg-emerald-500 text-slate-950 font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Chia Nội Bộ ({playerCount})</span>
            </button>
          </div>
        </div>

        {/* 1. Nhập Tiền thuê sân (VNĐ) */}
        <div className="rounded-xl bg-slate-950/75 border border-white/[0.06] p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              Tiền thuê sân bóng (VNĐ)
            </label>
            <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
              {pitchCost.toLocaleString("vi-VN")}đ
            </span>
          </div>
          <input
            type="number"
            step={50000}
            value={pitchCost}
            onChange={(e) => setPitchCost(Number(e.target.value))}
            className="w-full h-10 px-3.5 rounded-xl bg-slate-900 border border-white/[0.1] text-white font-bold text-sm tabular-nums focus:outline-none focus:border-emerald-500"
          />
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {[600000, 700000, 750000, 800000, 850000, 900000, 1000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setPitchCost(val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tabular-nums border transition ${
                  pitchCost === val
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400"
                    : "bg-white/[0.04] border-white/[0.06] text-slate-400 hover:text-white"
                }`}
              >
                {val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Tùy chọn tỷ lệ chia hoặc số cầu thủ */}
        {splitMode === "OPPONENT_50_50" ? (
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "50_50", label: "Chia 50 / 50", sub: "Chuẩn giao lưu" },
              { id: "60_40", label: "Thua 60 / Thắng 40", sub: "Đội thua chịu 60%" },
              { id: "40_60", label: "Kèo 40 / 60", sub: "Đối thủ chịu 40%" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRatio(item.id as "50_50" | "60_40" | "40_60")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  ratio === item.id
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                    : "bg-slate-950 border-white/[0.07] text-slate-400"
                }`}
              >
                <div className="text-xs font-extrabold">{item.label}</div>
                <div className="text-[10px] opacity-80">{item.sub}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950/80 border border-white/[0.07] p-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-200">
                Quân số đội mình đi đá (Đồng bộ từ Điểm Danh):
              </div>
              <div className="text-[11px] text-slate-400">
                Tổng phần đội mình: {myTeamShare.toLocaleString("vi-VN")}đ
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[7, 8, 9, 10, 11, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlayerCount(num)}
                  className={`w-8 h-8 rounded-lg font-extrabold text-xs tabular-nums border ${
                    playerCount === num
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-slate-900 border-white/[0.08] text-slate-300"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Tài khoản nhận tiền */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06] text-xs">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">
              Ngân hàng
            </label>
            <select
              value={bankBin}
              onChange={(e) => setBankBin(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl bg-slate-950 border border-white/[0.1] text-white"
            >
              {POPULAR_BANKS.map((b) => (
                <option key={b.bin} value={b.bin}>
                  {b.shortName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">
              Số tài khoản Đội trưởng
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">
              Chủ tài khoản
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-slate-950 border border-white/[0.1] text-white uppercase"
            />
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Thẻ VietQR Napas247 hiển thị trực tiếp */}
      <div className="lg:col-span-5 surface-card rounded-2xl border border-emerald-500/35 p-5 text-center space-y-3.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold">
          <QrCode className="w-3.5 h-3.5" />
          <span>Mã VietQR Napas247 Tự Động</span>
        </div>

        <div>
          <div className="text-xs text-slate-400">
            {splitMode === "OPPONENT_50_50"
              ? "Số tiền đội đối thủ cần chuyển:"
              : `Mỗi anh em trong đội (${playerCount} người) đóng:`}
          </div>
          <div className="text-3xl font-black text-emerald-400 tabular-nums mt-0.5">
            {finalQrAmount.toLocaleString("vi-VN")}đ
          </div>
          <div className="text-[11px] text-slate-400 tabular-nums">
            Tổng tiền thuê sân: {totalMatchBill.toLocaleString("vi-VN")}đ
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl max-w-[220px] mx-auto shadow-xl">
          <img
            src={qrUrl}
            alt="Mã VietQR thanh toán tiền sân"
            className="w-full h-auto rounded-lg"
          />
        </div>

        <div className="text-xs text-slate-300 space-y-0.5">
          <div className="font-bold text-white">{accountName}</div>
          <div className="font-mono text-slate-400">
            STK: {accountNumber} (
            {POPULAR_BANKS.find((b) => b.bin === bankBin)?.shortName})
          </div>
          <div className="text-[10px] font-mono text-emerald-400">
            Nội dung: {qrMemo}
          </div>
        </div>

        <Button
          onClick={() => {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
          }}
          variant="outline"
          className="w-full h-10 rounded-xl border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs gap-2"
        >
          {copiedAmount ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">
                Đã sao chép STK &amp; Số tiền gửi nhóm Zalo
              </span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy STK &amp; Số tiền gửi nhóm Zalo</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
