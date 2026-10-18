"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertOctagon,
  Star,
  EyeOff,
  Eye,
  LifeBuoy,
  CheckCircle2,
  RotateCcw,
  Activity,
} from "lucide-react";
import { SkillTier, EscrowWallet } from "@/types/matchmaking";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface TeamTrustProfileProps {
  myTrustScore: number;
  setMyTrustScore: React.Dispatch<React.SetStateAction<number>>;
  onPushBotLog?: (title: string, msg: string, badge: string) => void;
  escrowWallet?: EscrowWallet;
  onOpenEscrowModal?: () => void;
}

export function TeamTrustProfile({
  myTrustScore,
  setMyTrustScore,
  onPushBotLog,
  escrowWallet,
  onOpenEscrowModal,
}: TeamTrustProfileProps) {
  const [under1hViolations, setUnder1hViolations] = useState(0);
  const [cleanStreak, setCleanStreak] = useState(0);
  const [hasRedFlag, setHasRedFlag] = useState(false);
  const [history, setHistory] = useState<{ label: string; score: number }[]>([
    { label: "T1", score: 90 },
    { label: "T2", score: 95 },
    { label: "T3", score: 95 },
    { label: "T4", score: 100 },
    { label: "T5", score: 100 },
    { label: "Hiện tại", score: 100 },
  ]);

  const [punctualStar, setPunctualStar] = useState(5);
  const [fairplayStar, setFairplayStar] = useState(5);
  const [financialStar, setFinancialStar] = useState(5);
  const [votedTier, setVotedTier] = useState<SkillTier>(2);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [appealReason, setAppealReason] = useState("");
  const [showAppealBox, setShowAppealBox] = useState(false);

  const pushHistoryPoint = (label: string, newScore: number) => {
    setHistory((prev) => [...prev.slice(1), { label, score: newScore }]);
  };

  const simulateAction = (
    type: "early" | "warning" | "noshow" | "good" | "reset"
  ) => {
    if (type === "early") {
      pushHistoryPoint("Hủy >4h", myTrustScore);
      onPushBotLog?.(
        "Báo hủy kèo sớm (> 4 tiếng)",
        "Hệ thống miễn trừ điểm tín nhiệm (0đ) và tự động mở lại kèo trên bảng tin.",
        "Hợp lệ 0đ"
      );
    } else if (type === "warning") {
      const next = Math.max(0, myTrustScore - 5);
      setMyTrustScore(next);
      setCleanStreak(0);
      pushHistoryPoint("Hủy 1-4h", next);
      onPushBotLog?.(
        "Hủy cận giờ (1h - 4h trước trận)",
        `Trừ nhẹ -5 điểm (Còn ${next}/100). Kèo đã được đẩy lên tab Cứu Hộ SOS.`,
        "-5đ Uy tín"
      );
    } else if (type === "noshow") {
      const nextViolation = under1hViolations + 1;
      setUnder1hViolations(nextViolation);
      setCleanStreak(0);
      if (nextViolation === 1) {
        const next = Math.max(0, myTrustScore - 25);
        setMyTrustScore(next);
        pushHistoryPoint("Vi phạm L1", next);
        onPushBotLog?.(
          "Vi phạm hủy sát giờ (<1h) - LẦN 1",
          `Trừ -25 điểm (Còn ${next}/100). Nhắc nhở nội bộ đội trưởng, chưa gắn nhãn đỏ công khai.`,
          "Lần 1 (-25đ)"
        );
      } else if (nextViolation === 2) {
        const next = Math.max(0, myTrustScore - 40);
        setMyTrustScore(next);
        setHasRedFlag(true);
        pushHistoryPoint("Vi phạm L2", next);
        onPushBotLog?.(
          "CẢNH BÁO ĐỎ: Bùng kèo (<1h) - LẦN 2",
          `Trừ -40 điểm (Còn ${next}/100). Đã gắn nhãn 'Từng bùng kèo' công khai & bắt buộc cọc 100%.`,
          "Nhãn Đỏ (-40đ)"
        );
      } else {
        setMyTrustScore(0);
        setHasRedFlag(true);
        pushHistoryPoint("Khóa 14d", 0);
        onPushBotLog?.(
          "KHÓA TÀI KHOẢN 14 NGÀY (Vi phạm lần 3+)",
          "Điểm tín nhiệm về 0/100. Tạm khóa quyền tạo/nhận kèo 14 ngày.",
          "Khóa 14 ngày"
        );
      }
    } else if (type === "good") {
      const next = Math.min(100, myTrustScore + 5);
      const nextStreak = cleanStreak + 1;
      setMyTrustScore(next);
      setCleanStreak(nextStreak);
      if (hasRedFlag && nextStreak >= 5) {
        setHasRedFlag(false);
        setUnder1hViolations(0);
      }
      pushHistoryPoint("Đá đẹp +5", next);
      onPushBotLog?.(
        "Hoàn thành trận đấu 5 sao (+5đ)",
        `Cộng +5 điểm tín nhiệm (Lên ${next}/100). Chuỗi trận sạch: ${nextStreak}/5 trận.`,
        "+5đ Uy tín"
      );
    } else if (type === "reset") {
      setMyTrustScore(100);
      setUnder1hViolations(0);
      setCleanStreak(0);
      setHasRedFlag(false);
      setHistory([
        { label: "T1", score: 90 },
        { label: "T2", score: 95 },
        { label: "T3", score: 95 },
        { label: "T4", score: 100 },
        { label: "T5", score: 100 },
        { label: "Hiện tại", score: 100 },
      ]);
    }
  };

  // SVG Line Chart coordinates
  const svgWidth = 420;
  const svgHeight = 110;
  const points = history
    .map((pt, idx) => {
      const x = 25 + (idx * (svgWidth - 50)) / (history.length - 1);
      const y = svgHeight - 20 - (pt.score / 100) * (svgHeight - 35);
      return `${x},${y}`;
    })
    .join(" ");

  const strokeColor = myTrustScore >= 70 ? "#10b981" : "#f43f5e";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* Left 7 Cols: Hồ sơ đội tôi + Biểu đồ Tremor + Bộ giả lập */}
      <div className="lg:col-span-7 space-y-4">
        <div className="surface-card rounded-2xl border border-white/[0.09] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/[0.07]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-emerald-400 text-base">
                CG7
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  FC Anh Em Cầu Giấy (Đội Của Bạn)
                </h2>
                <p className="text-xs text-slate-400">
                  Tier 2: Phong trào • Đội trưởng: Thiên Phước
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/90 border border-white/[0.08] px-3.5 py-2 rounded-2xl">
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Điểm tín nhiệm</div>
                <div
                  className={`text-xl font-black tabular-nums ${
                    myTrustScore >= 70 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {myTrustScore}
                  <span className="text-xs text-slate-500 font-normal">/100</span>
                </div>
              </div>
              <ShieldCheck
                className={`w-7 h-7 ${
                  myTrustScore >= 70 ? "text-emerald-400" : "text-rose-400"
                }`}
              />
            </div>
          </div>

          {/* Red Flag Alert */}
          {(hasRedFlag || myTrustScore < 70) && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-500/40 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  ĐỘI ĐANG BỊ GẮN NHÃN CẢNH BÁO CÔNG KHAI (CỌC 100%)
                </span>
                <span className="text-[11px] font-bold text-emerald-300">
                  Chuỗi gỡ nhãn: {cleanStreak}/5 trận
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80">
                Khi nhận kèo bắt buộc đặt cọc ký quỹ 200.000đ. Hoàn thành đủ 5 trận 5★ liên tiếp sẽ tự động xóa nhãn đỏ.
              </p>
            </div>
          )}

          {/* Tremor-style Real-Time SVG Trust Chart */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Biểu Đồ Biến Động Điểm Tín Nhiệm (Real-time)
              </span>
              <span className="text-[10px] text-slate-400">
                Ngưỡng miễn cọc: &ge; 70đ
              </span>
            </div>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-28 overflow-visible"
            >
              {/* Threshold 70 line */}
              <line
                x1="20"
                y1={svgHeight - 20 - 0.7 * (svgHeight - 35)}
                x2={svgWidth - 20}
                y2={svgHeight - 20 - 0.7 * (svgHeight - 35)}
                stroke="rgba(244,63,94,0.3)"
                strokeDasharray="4 4"
              />
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {history.map((pt, idx) => {
                const x = 25 + (idx * (svgWidth - 50)) / (history.length - 1);
                const y =
                  svgHeight - 20 - (pt.score / 100) * (svgHeight - 35);
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#0B1120"
                      stroke={strokeColor}
                      strokeWidth="2.5"
                    />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {pt.score}đ
                    </text>
                    <text
                      x={x}
                      y={svgHeight - 4}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Interactive Progressive Penalty Simulator (< 1h Rules) */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white">
                🎛️ Giả Lập Chế Tài Bậc Thang (&lt;1h) &amp; Cơ Chế Gỡ Nhãn:
              </span>
              <button
                onClick={() => simulateAction("reset")}
                className="text-[11px] font-bold text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Khôi phục 100đ
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => simulateAction("early")}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-slate-200">1. Hủy sớm &gt; 4h</div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  0đ • Hợp lệ miễn phạt
                </div>
              </button>

              <button
                onClick={() => simulateAction("warning")}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition"
              >
                <div className="font-bold text-amber-300">
                  2. Hủy cận giờ (1h-4h)
                </div>
                <div className="text-[10px] text-amber-400 font-semibold">
                  -5đ &amp; Tự đẩy lên SOS
                </div>
              </button>

              <button
                onClick={() => simulateAction("noshow")}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition"
              >
                <div className="font-bold text-rose-300">
                  3. Bùng sát giờ (&lt;1h)
                </div>
                <div className="text-[10px] text-rose-400 font-semibold">
                  L1: -25đ | L2: -40đ + Nhãn đỏ
                </div>
              </button>

              <button
                onClick={() => simulateAction("good")}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition"
              >
                <div className="font-bold text-emerald-300">
                  4. Đá đẹp 5★ (+5đ)
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold">
                  Đủ chuỗi 5 trận xóa nhãn đỏ
                </div>
              </button>
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Mưa ngập sân, mất điện cụm sân hoặc chủ sân hủy đột xuất?
              </span>
              <button
                onClick={() => setShowAppealBox(!showAppealBox)}
                className="text-[11px] font-bold text-sky-400 hover:underline flex items-center gap-1"
              >
                <LifeBuoy className="w-3 h-3" />
                Gửi kháng cáo sự cố (12h)
              </button>
            </div>

            {showAppealBox && (
              <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/30 space-y-2">
                <input
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Nhập lý do & link ảnh mặt sân ngập nước / thông báo chủ sân..."
                  className="w-full h-9 px-3 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <Button
                  onClick={() => {
                    simulateAction("reset");
                    setShowAppealBox(false);
                    onPushBotLog?.(
                      "Đã duyệt kháng cáo bất khả kháng",
                      "Hệ thống đã khôi phục 100/100 điểm tín nhiệm và gỡ mọi nhãn cảnh báo.",
                      "Khôi phục 100đ"
                    );
                  }}
                  className="w-full h-8 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs"
                >
                  Xác nhận kháng cáo &amp; Khôi phục 100đ
                </Button>
              </div>
            )}
          </div>

          {/* Thẻ Ví Ký Quỹ & Điều Kiện Rút Tiền Phân Tầng */}
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ví Ký Quỹ Nội Bộ (Escrow Balance)</h4>
                  <p className="text-[10px] text-slate-400">Số dư bảo chứng không cần Admin duyệt tay</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-sky-400 tabular-nums">
                  {(escrowWallet?.balance ?? 0).toLocaleString("vi-VN")}đ
                </div>
                <div className="text-[10px] text-slate-400">
                  Khả dụng: {(escrowWallet?.availableBalance ?? 0).toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>

            {myTrustScore < 70 ? (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 space-y-1.5">
                <div className="text-[11px] font-bold text-rose-300 flex items-center justify-between">
                  <span>⚠️ Uy tín &lt; 70đ ({myTrustScore}đ) — Bị giới hạn dịch vụ</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
                    Khóa Rút Tiền
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Để tạo/nhận kèo, bạn bắt buộc phải có ít nhất <strong>200.000đ</strong> trong ví. Quyền rút tiền về ngân hàng sẽ tự động mở khóa khi bạn thi đấu nghiêm túc và khôi phục điểm uy tín lên <strong>≥ 70 điểm</strong>.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 space-y-1.5">
                <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-between">
                  <span>✅ Uy tín an toàn ({myTrustScore}đ ≥ 70đ)</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                    Được Phép Rút Tiền
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Bạn được <strong>miễn cọc 100%</strong> khi tạo &amp; nhận kèo. Nếu có số dư trong ví, bạn có thể rút về tài khoản ngân hàng bất cứ lúc nào (Hệ thống xử lý tự động trong 30 giây).
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onOpenEscrowModal}
              className="w-full h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-sky-300 border border-sky-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>Mở Chi Tiết Ví Ký Quỹ &amp; Nạp / Rút Tiền (Napas247)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right 5 Cols: Đánh giá Mù hai chiều (Blind Review) */}
      <div className="lg:col-span-5 surface-card rounded-2xl border border-white/[0.09] p-5 space-y-4">
        <div className="pb-3 border-b border-white/[0.07]">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Cơ Chế Đánh Giá Mù 2 Chiều (Blind Review)</span>
          </div>
          <h3 className="text-base font-extrabold text-white mt-1">
            Chấm Điểm Đối Thủ Sau Trận
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kết quả được ẩn hoàn toàn cho tới khi cả 2 đội cùng gửi hoặc sau 24h để chống trả đũa vote 1 sao.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          {[
            {
              label: "1. Đúng giờ (Có mặt trước 15p)",
              val: punctualStar,
              setter: setPunctualStar,
            },
            {
              label: "2. Thái độ Fair-play (Đúng cam kết Tier)",
              val: fairplayStar,
              setter: setFairplayStar,
            },
            {
              label: "3. Sòng phẳng tiền sân & nước",
              val: financialStar,
              setter: setFinancialStar,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950/75 border border-white/[0.05]"
            >
              <span className="font-semibold text-slate-200">{item.label}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => item.setter(star)}
                    className="p-0.5 transition-transform active:scale-90"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= item.val
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-2">
            <span className="font-semibold text-slate-200 block">
              4. Xác thực trình độ thực tế của đối thủ (Chống khai gian Tier):
            </span>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as SkillTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setVotedTier(t)}
                  className={`py-2 px-2 rounded-lg font-bold border text-center transition-all ${
                    votedTier === t
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-white/[0.07] text-slate-400"
                  }`}
                >
                  Đúng Tier {t}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => {
              setReviewSubmitted(true);
              simulateAction("good");
            }}
            className="w-full h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-2"
          >
            {reviewSubmitted ? (
              <>
                <Eye className="w-4 h-4" />
                <span>Đã Mở Khóa Kết Quả 2 Chiều (+5 Điểm Tín Nhiệm)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Gửi Đánh Giá Mù &amp; Nhận +5 Điểm Uy Tín</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
