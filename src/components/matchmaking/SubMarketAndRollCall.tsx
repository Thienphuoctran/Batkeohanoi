"use client";

import React, { useState } from "react";
import { UserPlus, Phone, Clock, Plus } from "lucide-react";
import { MOCK_SUB_PLAYERS } from "@/constants/mockMatchmaking";
import { SubPlayerPost } from "@/types/matchmaking";
import { Button } from "@/components/ui/button";
import { getZaloDeepLink, normalizeVietnamPhone } from "@/lib/zalo";

interface SubMarketAndRollCallProps {
  viewMode?: "sub-market" | "roll-call" | "both";
  onSwitchToSubMarket?: () => void;
  onSyncToVietQr?: (goingCount: number) => void;
}

export function SubMarketAndRollCall({
  viewMode = "sub-market",
}: SubMarketAndRollCallProps) {
  const [subPosts, setSubPosts] = useState<SubPlayerPost[]>(MOCK_SUB_PLAYERS);
  const [posFilter, setPosFilter] = useState<"ALL" | "GK" | "DF" | "FW">("ALL");
  const [showAddSub, setShowAddSub] = useState(false);
  const [newPos, setNewPos] = useState<SubPlayerPost["positionNeeded"]>("Thủ Môn (GK)");
  const [newTeamName, setNewTeamName] = useState("");
  const [newPitch, setNewPitch] = useState("Sân Trung Kính Hạ (19:00 hôm nay)");
  const [newFee, setNewFee] = useState("FREE 100% + Bao nước");
  const [newPhone, setNewPhone] = useState("");

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
      teamId: `team-${Date.now()}`,
      teamName: newTeamName.trim() || "FC Anh Em Phủi",
      positionNeeded: newPos,
      quantity: 1,
      matchTime: "19:00 - 20:30 Hôm nay",
      pitchName: newPitch.trim() || "Sân bóng Hà Nội",
      district: "Cầu Giấy",
      shareCostDescription: newFee,
      contactPhone: newPhone.trim() || "0988.765.432",
      status: "ACTIVE",
      createdAt: "Vừa xong",
    };
    setSubPosts([created, ...subPosts]);
    setShowAddSub(false);
    setNewTeamName("");
    setNewPhone("");
  };

  return (
    <div className="space-y-4">
      {/* HEADER CARD */}
      <div className="surface-card rounded-2xl border border-emerald-500/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-emerald-400 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span>Chợ Cầu Lẻ Khẩn Cấp (Tuyển Cầu Phút Chót)</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Đội thiếu Thủ môn hoặc 1-2 vị trí sát giờ • Tìm anh em đá phủi lấp chỗ trống ngay
          </p>
        </div>
        <Button
          onClick={() => setShowAddSub(!showAddSub)}
          className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Đăng tìm người</span>
        </Button>
      </div>

      {/* POSITION FILTER PILLS */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "Tất cả vị trí" },
          { id: "GK", label: "🧤 Thủ môn (GK)" },
          { id: "DF", label: "🛡️ Hậu vệ / Thòng (DF)" },
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

      {/* QUICK ADD SUB FORM */}
      {showAddSub && (
        <form
          onSubmit={handleAddSubPost}
          className="surface-card rounded-2xl border border-emerald-500/35 p-4 space-y-3"
        >
          <div className="text-xs font-extrabold text-white">
            Đăng tin tuyển cầu lẻ khẩn cấp cho trận hôm nay
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Tên đội bóng (VD: FC Tuổi Trẻ)"
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newPos}
              onChange={(e) =>
                setNewPos(e.target.value as SubPlayerPost["positionNeeded"])
              }
              className="h-9 px-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Thủ Môn (GK)">🧤 Cần Thủ Môn (GK)</option>
              <option value="Trung Vệ (CB)">🛡️ Cần Hậu Vệ / Thòng (DF)</option>
              <option value="Tiền Đạo (FW)">🎯 Cần Tiền Vệ / Tiền Đạo (FW)</option>
            </select>
            <input
              value={newPitch}
              onChange={(e) => setNewPitch(e.target.value)}
              placeholder="Sân & giờ đá (VD: Sân Đình Thôn 19h)"
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="SĐT / Zalo liên hệ"
              className="h-9 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Chi phí:</span>
              <select
                value={newFee}
                onChange={(e) => setNewFee(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
              >
                <option value="FREE 100% + Bao nước">FREE 100% (Miễn phí tiền sân + nước)</option>
                <option value="Share nhẹ 40.000đ / người">Share nhẹ 40.000đ / người</option>
                <option value="Share 50.000đ / người">Share 50.000đ / người</option>
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
          </div>
        </form>
      )}

      {/* SUB POSTS LIST */}
      <div className="space-y-3">
        {filteredSubs.length > 0 ? (
          filteredSubs.map((post) => (
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
          ))
        ) : (
          <div className="surface-card rounded-2xl border border-white/[0.08] p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Chưa có bài đăng tìm cầu lẻ nào
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Đội bạn đang thiếu Thủ môn hoặc 1-2 vị trí sát giờ bóng lăn? Hãy đăng tin để kết nối ngay anh em phủi tự do!
              </p>
            </div>
            <Button
              onClick={() => setShowAddSub(true)}
              className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Đăng tin tìm người ngay</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export const SubMarket = SubMarketAndRollCall;
