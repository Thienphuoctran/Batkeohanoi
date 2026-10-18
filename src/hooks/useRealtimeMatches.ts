"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { MatchFeedItem, District, SkillTier } from "@/types/matchmaking";
import { MOCK_TEAMS } from "@/constants/mockMatchmaking";
import { playNotificationChime } from "@/lib/zalo";
import {
  toLocalIsoDate,
  getTodayIsoDate,
  formatMatchDateDisplay,
  getMatchExpiresDate,
} from "@/lib/matchTime";
import { getRealtimeMatchesFromDatabaseAction } from "@/actions/auth";
import type { RealtimeChannel } from "@supabase/supabase-js";

export const MATCHES_STORAGE_KEY = "batkeo7_matches_v2";

export interface MatchItem {
  id: string;
  host_team_id: string;
  guest_team_id: string | null;
  pitch_custom_name: string;
  district: string;
  kickoff_time: string;
  expires_at?: string | null;
  time_slot_label: string;
  total_fee: number;
  split_fee: number;
  is_sos: boolean;
  status: "open" | "matched" | "completed" | "cancelled" | "expired";
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
      : row.district || "Cầu Giấy";
  const tier = ([1, 2, 3].includes(Number(row.teams?.skill_tier))
    ? Number(row.teams?.skill_tier)
    : 2) as SkillTier;
  const [startTime, endTime] = (row.time_slot_label || "19:00 - 20:30").split(
    " - "
  );

  let matchDateIso = getTodayIsoDate();
  if (row.kickoff_time) {
    const parsedKickoff = new Date(row.kickoff_time);
    if (!isNaN(parsedKickoff.getTime())) {
      matchDateIso = toLocalIsoDate(parsedKickoff);
    }
  }
  const matchDateLabel = formatMatchDateDisplay(matchDateIso);

  const resolvedExpiresAt =
    row.expires_at ||
    getMatchExpiresDate(
      {
        matchDate: matchDateIso,
        matchDateIso,
        startTime: startTime || "19:00",
        kickoffTime: row.kickoff_time,
      },
      15
    ).toISOString();

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
    pitchAddress:
      (row as any).pitch_address ||
      (row as any).pitchAddress ||
      `Khu vực ${district}, Hà Nội`,
    gmapsUrl: (row as any).gmaps_url || undefined,
    isGmapsIntegrated:
      (row as any).is_gmaps_integrated ?? Boolean((row as any).gmaps_url),
    matchDate: matchDateLabel,
    matchDateIso,
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
        : row.status === "cancel_requested"
        ? "CANCEL_REQUESTED"
        : row.status === "disputed"
        ? "DISPUTED"
        : row.status === "expired"
        ? "EXPIRED"
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
    kickoffTime: row.kickoff_time || undefined,
    expiresAt: resolvedExpiresAt,
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
  const [matches, setMatches] = useState<MatchFeedItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("batkeo7_matches_v1");
        const saved = localStorage.getItem(MATCHES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Lọc sạch toàn bộ các kèo mẫu / kèo ảo (seed-*, mock-*)
            return parsed.filter(
              (m: any) =>
                !m.id?.startsWith("seed-") &&
                !m.id?.startsWith("mock-")
            );
          }
        }
      } catch (e) {
        console.warn("Failed to read matches from localStorage", e);
      }
    }
    return (initialFeed || []).filter(
      (m) => !m.id?.startsWith("seed-") && !m.id?.startsWith("mock-")
    );
  });
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Tự động sao lưu dữ liệu sang localStorage sau mỗi biến động (chống mất dữ liệu khi F5)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cleanMatches = (matches || []).filter(
          (m) => !m.id?.startsWith("seed-") && !m.id?.startsWith("mock-")
        );
        localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(cleanMatches));
      } catch (e) {
        console.warn("Failed to save matches to localStorage", e);
      }
    }
  }, [matches]);

  useEffect(() => {
    // 0. Tải các trận đấu thực tế đã lưu trong CSDL Supabase (Bypass RLS qua getRealtimeMatchesFromDatabaseAction)
    const fetchExistingMatches = async () => {
      try {
        let rawMatches: any[] = [];
        const serverRes = await getRealtimeMatchesFromDatabaseAction();
        if (serverRes.success && serverRes.data && serverRes.data.length > 0) {
          rawMatches = serverRes.data;
        } else {
          const { data: dbData, error } = await supabase
            .from("matches")
            .select("*")
            .neq("status", "cancelled")
            .neq("status", "expired")
            .order("created_at", { ascending: false })
            .limit(50);
          if (!error && dbData && dbData.length > 0) {
            const hostTeamIds = Array.from(new Set(dbData.map((m: any) => m.host_team_id).filter(Boolean)));
            if (hostTeamIds.length > 0) {
              const { data: teamsList } = await supabase
                .from("teams")
                .select("id, team_name, trust_score, skill_tier, has_warning_badge, captain_name, captain_phone, captain_zalo")
                .in("id", hostTeamIds);
              const teamMap = new Map(teamsList?.map((t: any) => [t.id, t]) || []);
              rawMatches = dbData.map((m: any) => ({
                ...m,
                teams: teamMap.get(m.host_team_id) || undefined,
              }));
            } else {
              rawMatches = dbData;
            }
          }
        }

        if (rawMatches.length > 0) {
          const mapped = rawMatches
            .filter((d: any) => d.status !== "cancelled" && d.status !== "expired")
            .map((d) => mapDbMatchToFeedItem(d as MatchItem));
          setMatches((prev) => {
            const map = new Map<string, MatchFeedItem>();
            mapped.forEach((m) => {
              if (!m.id?.startsWith("seed-") && !m.id?.startsWith("mock-")) {
                map.set(m.id, m);
              }
            });
            prev.forEach((m) => {
              // Bỏ qua kèo ảo / kèo mẫu seed
              if (m.id?.startsWith("seed-") || m.id?.startsWith("mock-")) return;
              if (m.status === "CANCELLED" || m.status === "EXPIRED") return;

              // 🛡️ CHỐNG TỰ SINH 2 KÈO: Bỏ qua kèo tạm nếu CSDL đã tải về kèo thật cùng sân & giờ
              const isDuplicateOfDb = mapped.some(
                (dbM) =>
                  dbM.id === m.id ||
                  (dbM.pitchName.trim().toLowerCase() === m.pitchName.trim().toLowerCase() &&
                   dbM.startTime.trim() === m.startTime.trim() &&
                   (dbM.matchDateIso === m.matchDateIso || dbM.matchDate === m.matchDate))
              );
              if (!map.has(m.id) && !isDuplicateOfDb) {
                map.set(m.id, m);
              }
            });
            const merged = Array.from(map.values());
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(merged));
              } catch {}
            }
            return merged;
          });
        } else {
          // Nếu CSDL rỗng hoặc chưa có trận nào, dọn dẹp sạch toàn bộ kèo seed/mock khỏi state
          setMatches((prev) => {
            const cleanPrev = prev.filter(
              (m) =>
                !m.id?.startsWith("seed-") &&
                !m.id?.startsWith("mock-") &&
                m.status !== "CANCELLED" &&
                m.status !== "EXPIRED"
            );
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(cleanPrev));
              } catch {}
            }
            return cleanPrev;
          });
        }
      } catch (err) {
        console.error("fetchExistingMatches error:", err);
      } finally {
        setIsLoadingMatches(false);
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
            let newRow: any = payload.new;
            if (payload.new?.host_team_id) {
              const { data: teamData } = await supabase
                .from("teams")
                .select("id, team_name, trust_score, skill_tier, has_warning_badge, captain_name, captain_phone, captain_zalo")
                .eq("id", payload.new.host_team_id)
                .maybeSingle();
              if (teamData) {
                newRow = { ...payload.new, teams: teamData };
              }
            }

            const mapped = mapDbMatchToFeedItem(newRow as MatchItem);
            if (mapped.status === "CANCELLED" || mapped.status === "EXPIRED") return;
            setMatches((prev) => {
              if (prev.some((item) => item.id === mapped.id)) return prev;

              // 🛡️ CHỐNG TỰ SINH 2 KÈO (Deduplicate Optimistic vs DB UUID):
              // Thay thế kèo tạm thời do client tạo bằng bản ghi chuẩn từ CSDL với UUID chính xác
              const tempMatchIdx = prev.findIndex(
                (item) =>
                  item.id === mapped.id ||
                  ((item.id.startsWith("match-new-") || item.id.startsWith("m-") || item.isCreatedByCurrentUser) &&
                   item.pitchName.trim().toLowerCase() === mapped.pitchName.trim().toLowerCase() &&
                   item.startTime.trim() === mapped.startTime.trim() &&
                   (item.matchDateIso === mapped.matchDateIso || item.matchDate === mapped.matchDate))
              );

              if (tempMatchIdx !== -1) {
                const updated = [...prev];
                updated[tempMatchIdx] = {
                  ...mapped,
                  isCreatedByCurrentUser: prev[tempMatchIdx].isCreatedByCurrentUser,
                  pitchAddress: prev[tempMatchIdx].pitchAddress || mapped.pitchAddress,
                  gmapsUrl: prev[tempMatchIdx].gmapsUrl || mapped.gmapsUrl,
                  isGmapsIntegrated: prev[tempMatchIdx].isGmapsIntegrated ?? mapped.isGmapsIntegrated,
                };
                return updated;
              }

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
            if (updated.status === "cancelled" || updated.status === "expired") {
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
          const tempMatchIdx = prev.findIndex(
            (item) =>
              (item.id.startsWith("match-new-") || item.id.startsWith("m-") || item.isCreatedByCurrentUser) &&
              item.pitchName.trim().toLowerCase() === incoming.pitchName.trim().toLowerCase() &&
              item.startTime.trim() === incoming.startTime.trim() &&
              (item.matchDateIso === incoming.matchDateIso || item.matchDate === incoming.matchDate)
          );
          if (tempMatchIdx !== -1) {
            const updated = [...prev];
            updated[tempMatchIdx] = {
              ...incoming,
              isCreatedByCurrentUser: prev[tempMatchIdx].isCreatedByCurrentUser,
            };
            return updated;
          }
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
      .on("broadcast", { event: "guest_withdrawn" }, ({ payload }) => {
        const { matchId, wasConvertedToSos, previousGuestName } = payload as {
          matchId: string;
          wasConvertedToSos: boolean;
          previousGuestName: string;
        };
        if (!matchId) return;
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  status: wasConvertedToSos ? "SOS" : "OPEN",
                  isSOS: wasConvertedToSos,
                  guestTeam: null,
                  isChallengedByCurrentUser: false,
                }
              : m
          )
        );
        playNotificationChime();
        onNewRealtimeEvent?.(
          wasConvertedToSos
            ? "🚨 [Realtime] Kèo Vừa Mở Lại Thành SOS Khẩn Cấp!"
            : "⚽ [Realtime] Slot Trận Đấu Vừa Được Mở Lại!",
          `Đội ${previousGuestName || "khách"} vừa xin rút lui do sự cố. Kèo đấu đã mở lại để nhận đối mới!`,
          wasConvertedToSos ? "SOS < 2h" : "Slot Mới",
          undefined,
          undefined
        );
      })
      .on("broadcast", { event: "cancellation_requested" }, ({ payload }) => {
        const { matchId, requestedByName, reasonDetail, penaltyPoints, compensationAmountVnd } =
          payload as {
            matchId: string;
            requestedByName: string;
            reasonDetail: string;
            penaltyPoints: number;
            compensationAmountVnd: number;
          };
        if (!matchId) return;
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  status: "CANCEL_REQUESTED",
                  cancelRequest: {
                    requestedBy: "HOST",
                    requestedByName,
                    requestedByPhone: m.hostTeam.captainPhone || "",
                    requestedAt: new Date().toLocaleTimeString("vi-VN"),
                    reasonCategory: "HOST_CANCEL",
                    reasonDetail,
                    penaltyPoints,
                    compensationAmountVnd,
                  },
                }
              : m
          )
        );
        playNotificationChime();
        onNewRealtimeEvent?.(
          "⚠️ [Realtime] Chủ Kèo Xin Hủy Trận Đấu!",
          `Đội ${requestedByName} xin hủy trận do: "${reasonDetail}". Vui lòng phản hồi xác nhận!`,
          "Yêu Cầu Hủy",
          undefined,
          requestedByName
        );
      })
      .on("broadcast", { event: "cancellation_responded" }, ({ payload }) => {
        const { matchId, decision, guestTeamName } = payload as {
          matchId: string;
          decision: "ACCEPTED" | "REJECTED";
          guestTeamName: string;
        };
        if (!matchId) return;
        if (decision === "ACCEPTED") {
          setMatches((prev) => prev.filter((m) => m.id !== matchId));
          playNotificationChime();
          onNewRealtimeEvent?.(
            "✅ [Realtime] Đã Đồng Thuận Hủy Trận Đấu",
            `Đội ${guestTeamName} đã đồng ý hủy kèo. Trận đấu chính thức đóng.`,
            "Đã Hủy"
          );
        } else {
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
          playNotificationChime();
          onNewRealtimeEvent?.(
            "🚨 [Realtime] Đội Khách Từ Chối Cho Hủy Kèo!",
            `Đội ${guestTeamName} không chấp thuận hủy trận. Vụ việc đã chuyển lên Ban Quản Trị xử phạt!`,
            "Tranh Chấp"
          );
        }
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

  const broadcastGuestWithdrawal = useCallback(
    async (
      matchId: string,
      wasConvertedToSos: boolean,
      previousGuestName: string
    ) => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "guest_withdrawn",
          payload: { matchId, wasConvertedToSos, previousGuestName },
        });
      }
    },
    []
  );

  const broadcastCancelRequest = useCallback(
    async (
      matchId: string,
      requestedByName: string,
      reasonDetail: string,
      penaltyPoints: number,
      compensationAmountVnd: number
    ) => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "cancellation_requested",
          payload: {
            matchId,
            requestedByName,
            reasonDetail,
            penaltyPoints,
            compensationAmountVnd,
          },
        });
      }
    },
    []
  );

  const broadcastCancelResponse = useCallback(
    async (
      matchId: string,
      decision: "ACCEPTED" | "REJECTED",
      guestTeamName: string
    ) => {
      if (channelRef.current) {
        await channelRef.current.send({
          type: "broadcast",
          event: "cancellation_responded",
          payload: { matchId, decision, guestTeamName },
        });
      }
    },
    []
  );

  return {
    matches,
    setMatches,
    isLoadingMatches,
    isRealtimeConnected,
    broadcastNewMatch,
    broadcastMatchLock,
    broadcastMatchDelete,
    broadcastGuestWithdrawal,
    broadcastCancelRequest,
    broadcastCancelResponse,
  };
}
