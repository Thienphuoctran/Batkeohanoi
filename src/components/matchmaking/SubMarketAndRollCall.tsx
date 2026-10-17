"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Phone,
  Check,
  Copy,
  Clock,
  AlertTriangle,
  QrCode,
  Plus,
} from "lucide-react";
import { MOCK_SUB_PLAYERS, MOCK_ROLL_CALL } from "@/constants/mockMatchmaking";
import { RollCallMember, SubPlayerPost } from "@/types/matchmaking";
import { Button } from "@/components/ui/button";
import { getZaloDeepLink, normalizeVietnamPhone } from "@/lib/zalo";

interface SubMarketAndRollCallProps {
  viewMode?: "sub-market" | "roll-call" | "both";
  onSwitchToSubMarket?: () => void;
  onSyncToVietQr?: (goingCount: number) => void;
}

export function SubMarketAndRollCall({
  viewMode = "both",
  onSwitchToSubMarket,
  onSyncToVietQr,
}: SubMarketAndRollCallProps) {
  const [subPosts, setSubPosts] = useState<SubPlayerPost[]>(MOCK_SUB_PLAYERS);
  const [posFilter, setPosFilter] = useState<"ALL" | "GK" | "DF" | "FW">("ALL");
  const [showAddSub, setShowAddSub] = useState(false);
  const [newPos, setNewPos] = useState<SubPlayerPost["positionNeeded"]>("Thủ Môn (GK)");
  const [newPitch, setNewPitch] = useState("Sân Trung Kính Hạ (19:00 hôm nay)");
  const [newFee, setNewFee] = useState("FREE 100% + Bao nước");

  const [members, setMembers] = useState<RollCallMember[]>(
    MOCK_ROLL_CALL.members
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredSubs = subPosts.filter((p) => {
    if (posFilter === "ALL") return true;
    if (posFilter === "GK") return p.positionNeeded.includes("GK");
    if (posFilter === "DF")
      return p.positionNeeded.includes("CB") || p.positionNeeded.includes("DF");
    return !p.positionNeeded.includes("GK") && !p.positionNeeded.includes("CB");
  });

  const handleAddSubPost = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SubPlayerPost = {
      id: `sub-${Date.now()}`,
      teamId: "team-cg-01",
      teamName: "FC Anh Em Cầu Giấy",
      positionNeeded: newPos,
      quantity: 1,
      matchTime: "19:00 - 20:30 Hôm nay",
      pitchName: newPitch,
      district: "Cầu Giấy",
      shareCostDescription: newFee,
      contactPhone: "0988.765.432",
      status: "ACTIVE",
      createdAt: "Vừa xong",
    };
    setSubPosts([created, ...subPosts]);
    setShowAddSub(false);
  };

  const setPlayerStatus = (id: string, status: "JOIN" | "BUSY") => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status, updatedAt: "Vừa xong" } : m
      )
    );
  };

  const joinCount = members.filter((m) => m.status === "JOIN").length;
  const pct = Math.min(100, Math.round((joinCount / 7) * 100));

  const showSubCol = viewMode === "sub-market" || viewMode === "both";
  const showRollCol = viewMode === "roll-call" || viewMode === "both";

  return (
    <div
      className={`grid grid-cols-1 ${
        viewMode === "both" ? "lg:grid-cols-12" : ""
      } gap-5`}
    >
      {/* COLUMN 1: CHỢ CẦU LẺ KHẨN CẤP */}
      {showSubCol && (
        <div
          className={`${
            viewMode === "both" ? "lg:col-span-7" : ""
          } space-y-3.5`}
        >
          <div className="surface-card rounded-2xl border border-emerald-500/25 p-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-emerald-400 flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Chợ Cầu Lẻ Khẩn Cấp (Ghép Quân Phút Chót)</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Đội thiếu Thủ môn hoặc 1-2 vị trí sát giờ • Tìm người phủi lấp chỗ trống ngay
              </p>
            </div>
            <Button
              onClick={() => setShowAddSub(!showAddSub)}
              className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Đăng tìm người</span>
            </Button>
          </div>

          {/* Position Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { id: "ALL", label: "Tất cả vị trí" },
              { id: "GK", label: "🧤 Thủ môn (GK)" },
              { id: "DF", label: "🛡️ Hậu vệ (DF)" },
              { id: "FW", label: "🎯 Tiền vệ / Tiền đạo" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setPosFilter(item.id as "ALL" | "GK" | "DF" | "FW")
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                  posFilter === item.id
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Add Sub Form */}
          {showAddSub && (
            <form
              onSubmit={handleAddSubPost}
              className="surface-card rounded-2xl border border-emerald-500/35 p-4 space-y-3"
            >
              <div className="text-xs font-extrabold text-white">
                Đăng tin tuyển cầu lẻ khẩn cấp
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <select
                  value={newPos}
                  onChange={(e) =>
                    setNewPos(e.target.value as SubPlayerPost["positionNeeded"])
                  }
                  className="h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Thủ Môn (GK)">🧤 Cần Thủ Môn (GK)</option>
                  <option value="Trung Vệ (CB)">🛡️ Cần Hậu Vệ / Thòng (DF)</option>
                  <option value="Tiền Đạo (FW)">🎯 Cần Tiền Vệ / Tiền Đạo (FW)</option>
                </select>
                <input
                  value={newPitch}
                  onChange={(e) => setNewPitch(e.target.value)}
                  placeholder="Tên sân & Giờ bóng lăn"
                  className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
                <select
                  value={newFee}
                  onChange={(e) => setNewFee(e.target.value)}
                  className="h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="FREE 100% + Bao nước">FREE 100% (Miễn phí tiền sân)</option>
                  <option value="Share 50.000đ / người">Share nhẹ 50.000đ / người</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddSub(false)}
                  className="h-8 text-xs text-slate-400"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-xs"
                >
                  Đăng lên chợ ngay
                </Button>
              </div>
            </form>
          )}

          {/* Sub Posts List */}
          <div className="space-y-3">
            {filteredSubs.map((post) => (
              <div
                key={post.id}
                className="spotlight-card rounded-2xl border border-white/[0.08] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                      Tuyển {post.quantity} {post.positionNeeded}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold">
                      {post.district}
                    </span>
                    <span className="text-xs text-amber-300 font-bold flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" />
                      {post.matchTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {post.teamName} — {post.pitchName}
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold">
                    💰 Mức đóng góp: {post.shareCostDescription}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={getZaloDeepLink(post.contactPhone, post.contactZalo)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 px-3.5 rounded-xl bg-[#0068FF] hover:bg-[#0057D9] text-white font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition"
                  >
                    <span>💬 Zalo Xin Đá</span>
                  </a>
                  <a
                    href={`tel:${normalizeVietnamPhone(post.contactPhone)}`}
                    className="h-10 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi ({post.contactPhone})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COLUMN 2: ĐIỂM DANH 1-CHẠM */}
      {showRollCol && (
        <div
          className={`${
            viewMode === "both" ? "lg:col-span-5" : ""
          } space-y-3.5`}
        >
          <div className="surface-card rounded-2xl border border-white/[0.09] p-4 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Sân Mễ Trì Hạ • 19:00 Hôm nay
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Điểm Danh Quân Số 1-Chạm
                </h3>
              </div>

              <button
                onClick={() => {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1.5 transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã Copy Link Zalo</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link Gửi Zalo</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress Bar Sân 7 */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">
                  Tiến độ đội hình ra sân (Tối thiểu 7 người):
                </span>
                <span
                  className={`font-black tabular-nums ${
                    joinCount >= 7 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {joinCount} / 7 người (
                  {joinCount >= 7
                    ? "Đủ đội hình sân 7"
                    : `Thiếu ${7 - joinCount} người!`}
                  )
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    joinCount >= 7 ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* Automatic Shortage Alert (< 7 players) */}
            {joinCount < 7 && (
              <div className="rounded-xl bg-rose-500/15 border border-rose-500/40 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-rose-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Đội đang thiếu <strong>{7 - joinCount} vị trí</strong> để đủ đội hình sân 7!
                  </span>
                </div>
                {onSwitchToSubMarket && (
                  <button
                    onClick={onSwitchToSubMarket}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-[11px] shrink-0"
                  >
                    Tuyển Cầu Lẻ Ngay
                  </button>
                )}
              </div>
            )}

            {/* Player List with Đá / Nghỉ 1-Touch Toggle */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {members.map((m) => {
                const isGoing = m.status === "JOIN";
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-2.5 flex items-center justify-between transition ${
                      isGoing
                        ? "bg-slate-900/90 border-emerald-500/25"
                        : "bg-slate-950/60 border-slate-800/80 opacity-65"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-lg font-extrabold text-xs flex items-center justify-center tabular-nums ${
                          isGoing
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        #{m.number}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {m.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {isGoing ? "✅ Sẵn sàng ra sân" : "❌ Báo nghỉ trận này"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(m.id, "JOIN")}
                        className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition ${
                          isGoing
                            ? "bg-emerald-500 text-slate-950"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Đá
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlayerStatus(m.id, "BUSY")}
                        className={`px-2.5 py-1 rounded text-[11px] font-extrabold transition ${
                          !isGoing
                            ? "bg-rose-500 text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        Nghỉ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {onSyncToVietQr && (
              <Button
                onClick={() => onSyncToVietQr(joinCount)}
                className="w-full h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>
                  Chốt quân số ({joinCount} người) &amp; Chia tiền VietQR →
                </span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
