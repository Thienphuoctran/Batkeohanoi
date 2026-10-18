"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MatchFeedItem, District, SkillTier } from "@/types/matchmaking";
import { MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { playNotificationChime } from "@/lib/zalo";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface MatchItem {
  id: string;
  host_team_id: string;
  guest_team_id: string | null;
  pitch_custom_name: string;
  district: string;
  kickoff_time: string;
  time_slot_label: string;
  total_fee: number;
  split_fee: number;
  is_sos: boolean;
  status: "open" | "matched" | "completed" | "cancelled";
  notes: string | null;
  teams?: {
    team_name: string;
    trust_score: number;
    skill_tier: number;
    has_warning_badge: boolean;
    captain_name?: string;
    captain_phone?: string;
    captain_zalo?: string;
  };
}

/**
 * Hook chuẩn theo đặc tả Pha 3 (Mục 2): Lắng nghe postgres_changes trên bảng public.matches
 */
export function useRealtimeMatches(initialMatches: MatchItem[]) {
  const [matches, setMatches] = useState<MatchItem[]>(initialMatches);

  useEffect(() => {
    // Đăng ký kênh lắng nghe WebSocket trên bảng matches
    const channel = supabase
      .channel("realtime-matches-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Lấy thêm thông tin đội bóng của kèo mới tạo
            const { data: newMatch } = await supabase
              .from("matches")
              .select(
                "*, teams:host_team_id(team_name, trust_score, skill_tier, has_warning_badge)"
              )
              .eq("id", payload.new.id)
              .single();

            if (newMatch) {
              setMatches((prev) => [newMatch as MatchItem, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setMatches((prev) =>
              prev.map((m) =>
                m.id === payload.new.id
                  ? ({ ...m, ...payload.new } as MatchItem)
                  : m
              )
            );
          } else if (payload.eventType === "DELETE") {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { matches, setMatches };
}

/**
 * Chuyển đổi bản ghi MatchItem từ PostgreSQL sang MatchFeedItem hiển thị trên UI
 */
export function mapDbMatchToFeedItem(row: MatchItem): MatchFeedItem {
  const district: District =
    row.district === "NamTuLiem" || row.district === "Nam Từ Liêm"
      ? "Nam Từ Liêm"
      : "Cầu Giấy";
  const tier = ([1, 2, 3].includes(Number(row.teams?.skill_tier))
    ? Number(row.teams?.skill_tier)
    : 2) as SkillTier;
  const [startTime, endTime] = (row.time_slot_label || "19:00 - 20:30").split(
    " - "
  );

  return {
    id: row.id,
    hostTeam: {
      ...MOCK_TEAMS[0],
      id: row.host_team_id || MOCK_TEAMS[0].id,
      name: row.teams?.team_name || MOCK_TEAMS[0].name,
      shortName: (row.teams?.team_name || MOCK_TEAMS[0].shortName).slice(0, 12),
      captainName: row.teams?.captain_name || MOCK_TEAMS[0].captainName,
      captainPhone: row.teams?.captain_phone || MOCK_TEAMS[0].captainPhone,
      captainZalo: row.teams?.captain_zalo || row.teams?.captain_phone,
      district,
      skillTier: tier,
      credit: {
        ...MOCK_TEAMS[0].credit,
        score: row.teams?.trust_score ?? 100,
        warningBadge: row.teams?.has_warning_badge ? "TUNG_BUNG_KEO" : null,
      },
    },
    district,
    pitchName: row.pitch_custom_name || "Sân Thành Phát",
    pitchAddress: `Khu vực ${district}, Hà Nội`,
    matchDate: "Hôm nay",
    startTime: startTime || "19:00",
    endTime: endTime || "20:30",
    totalCostVnd: Number(row.total_fee) || 800000,
    shareCostVnd: Number(row.split_fee) || 400000,
    splitRatio: "50_50",
    splitRatioLabel: "50/50",
    requiredTier: tier,
    status:
      row.status === "matched"
        ? "MATCHED"
        : row.is_sos
        ? "SOS"
        : row.status === "completed"
        ? "FINISHED"
        : row.status === "cancelled"
        ? "CANCELLED"
        : "OPEN",
    isSOS: Boolean(row.is_sos),
    sosCountdownSeconds: row.is_sos ? 3600 : undefined,
    notes: row.notes || undefined,
    createdAt: "Real-time",
  };
}

/**
 * Hook kết nối trực tiếp Bảng tin UI với kênh WebSockets Supabase Realtime (Zero Reload)
 * Đồng bộ tức thì cả Postgres Changes lẫn Supabase Realtime Broadcast giữa nhiều thiết bị
 */
export function useRealtimeMatchFeed(
  initialFeed: MatchFeedItem[],
  onNewRealtimeEvent?: (
    title: string,
    msg: string,
    badge: string,
    zaloPhone?: string,
    captainName?: string
  ) => void
) {
  const [matches, setMatches] = useState<MatchFeedItem[]>(initialFeed);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // 0. Tải các trận đấu thực tế đã lưu trong CSDL Supabase (loại trừ kèo đã hủy)
    const fetchExistingMatches = async () => {
      try {
        const { data: dbData, error } = await supabase
          .from("matches")
          .select(
            "*, teams:host_team_id(team_name, trust_score, skill_tier, has_warning_badge, captain_name, captain_phone, captain_zalo)"
          )
          .neq("status", "cancelled")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && dbData && dbData.length > 0) {
          const mapped = dbData
            .filter((d: any) => d.status !== "cancelled")
            .map((d) => mapDbMatchToFeedItem(d as MatchItem));
          setMatches((prev) => {
            const map = new Map<string, MatchFeedItem>();
            mapped.forEach((m) => map.set(m.id, m));
            prev.forEach((m) => {
              if (!map.has(m.id) && m.status !== "CANCELLED") map.set(m.id, m);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error("fetchExistingMatches error:", err);
      }
    };

    fetchExistingMatches();

    const channel = supabase
      .channel("realtime-matches-channel", {
        config: { broadcast: { self: false } },
      })
      // 1. Lắng nghe thay đổi trực tiếp từ bảng PostgreSQL public.matches
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data: newRow } = await supabase
              .from("matches")
              .select(
                "*, teams:host_team_id(team_name, trust_score, skill_tier, has_warning_badge, captain_name, captain_phone, captain_zalo)"
              )
              .eq("id", payload.new.id)
              .single();

            const mapped = mapDbMatchToFeedItem(
              (newRow || payload.new) as MatchItem
            );
            if (mapped.status === "CANCELLED") return;
            setMatches((prev) => {
              if (prev.some((item) => item.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
            playNotificationChime();
            onNewRealtimeEvent?.(
              mapped.isSOS
                ? "🚨 [Realtime] Kèo SOS Mới Vừa Mở!"
                : "⚽ [Realtime] Kèo Đấu Mới Vừa Đăng!",
              `${mapped.hostTeam.name} vừa đăng kèo tại ${mapped.pitchName} (${mapped.startTime}).`,
              "WebSocket Live",
              mapped.hostTeam.captainZalo || mapped.hostTeam.captainPhone,
              mapped.hostTeam.captainName
            );
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as MatchItem;
            if (updated.status === "cancelled") {
              setMatches((prev) => prev.filter((m) => m.id !== updated.id));
              return;
            }
            setMatches((prev) =>
              prev.map((m) =>
                m.id === updated.id
                  ? {
                      ...m,
                      status:
                        updated.status === "matched"
                          ? "MATCHED"
                          : updated.is_sos
                          ? "SOS"
                          : m.status,
                      isSOS: Boolean(updated.is_sos),
                    }
                  : m
              )
            );
            playNotificationChime();
          } else if (payload.eventType === "DELETE") {
            setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      // 2. Lắng nghe gói tin WebSocket Broadcast trực tiếp giữa Thiết bị A và Thiết bị B
      .on("broadcast", { event: "match_created" }, ({ payload }) => {
        const incoming = payload as MatchFeedItem;
        if (!incoming?.id) return;
        setMatches((prev) => {
          if (prev.some((item) => item.id === incoming.id)) return prev;
          return [incoming, ...prev];
        });
        playNotificationChime();
        onNewRealtimeEvent?.(
          incoming.isSOS
            ? "🚨 [Realtime] Kèo SOS Mới Từ Thiết Bị Khác!"
            : "⚽ [Realtime] Kèo Mới Vừa Đăng (Zero-Reload)!",
          `${incoming.hostTeam.name} vừa mở kèo tại ${incoming.pitchName} (${incoming.startTime}).`,
          "Realtime Sync",
          incoming.hostTeam.captainZalo || incoming.hostTeam.captainPhone,
          incoming.hostTeam.captainName
        );
      })
      .on("broadcast", { event: "match_locked" }, ({ payload }) => {
        const { matchId, challengerTeamName, challengerPhone, challengerZalo } =
          payload as {
            matchId: string;
            challengerTeamName: string;
            challengerPhone: string;
            challengerZalo?: string;
          };
        if (!matchId) return;
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
        playNotificationChime();
        onNewRealtimeEvent?.(
          `⚡ [Realtime] Kèo #${matchId.slice(0, 6)} Vừa Được Chốt!`,
          `Đội ${challengerTeamName} (${challengerPhone}) vừa bắt kèo thành công.`,
          "Realtime Lock",
          challengerZalo || challengerPhone,
          challengerTeamName
        );
      })
      .on("broadcast", { event: "match_deleted" }, ({ payload }) => {
        const { matchId } = payload as { matchId: string };
        if (!matchId) return;
        setMatches((prev) => prev.filter((m) => m.id !== matchId));
      })
      .subscribe((status) => {
        setIsRealtimeConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const broadcastNewMatch = useCallback(async (newMatch: MatchFeedItem) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "match_created",
        payload: newMatch,
      });
    }
  }, []);

  const broadcastMatchLock = useCallback(
    async (
      matchId: string,
      challengerTeamName: string,
      challengerPhone: string,
      challengerZalo?: string
    ) => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "match_locked",
          payload: {
            matchId,
            challengerTeamName,
            challengerPhone,
            challengerZalo,
          },
        });
      }
    },
    []
  );

  const broadcastMatchDelete = useCallback(async (matchId: string) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "match_deleted",
        payload: { matchId },
      });
    }
  }, []);

  return {
    matches,
    setMatches,
    isRealtimeConnected,
    broadcastNewMatch,
    broadcastMatchLock,
    broadcastMatchDelete,
  };
}
