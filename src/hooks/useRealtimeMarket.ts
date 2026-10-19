"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { FreeAgentScoutCard, SubPlayerPost } from "@/types/matchmaking";
import { MOCK_FREE_AGENTS, MOCK_SUB_PLAYERS } from "@/constants/mockMatchmaking";
import { getMarketPostsFromDatabaseAction } from "@/actions/market";
import { mapDbToFreeAgent, mapDbToSubPost } from "@/lib/marketUtils";
import { playNotificationChime } from "@/lib/zalo";

const FREE_AGENTS_STORAGE_KEY = "batkeo7_market_free_agents_v2";
const SUB_POSTS_STORAGE_KEY = "batkeo7_market_sub_posts_v2";

export function useRealtimeMarket() {
  const [freeAgents, setFreeAgents] = useState<FreeAgentScoutCard[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(FREE_AGENTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return MOCK_FREE_AGENTS;
  });

  const [subPosts, setSubPosts] = useState<SubPlayerPost[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SUB_POSTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return MOCK_SUB_PLAYERS;
  });

  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  const channelRef = useRef<any>(null);

  // Lưu biến động vào localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && freeAgents.length > 0) {
      try {
        localStorage.setItem(FREE_AGENTS_STORAGE_KEY, JSON.stringify(freeAgents));
      } catch (e) {}
    }
  }, [freeAgents]);

  useEffect(() => {
    if (typeof window !== "undefined" && subPosts.length > 0) {
      try {
        localStorage.setItem(SUB_POSTS_STORAGE_KEY, JSON.stringify(subPosts));
      } catch (e) {}
    }
  }, [subPosts]);

  // Kéo dữ liệu tươi mới từ CSDL Supabase
  const fetchMarketData = useCallback(async () => {
    try {
      const res = await getMarketPostsFromDatabaseAction();
      if (res.success) {
        if (Array.isArray(res.freeAgents) && res.freeAgents.length > 0) {
          setFreeAgents(res.freeAgents);
        }
        if (Array.isArray(res.subPosts) && res.subPosts.length > 0) {
          setSubPosts(res.subPosts);
        }
      }
    } catch (err) {
      console.warn("[useRealtimeMarket fetch error]", err);
    } finally {
      setIsLoadingMarket(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();

    // Auto-resync khi người dùng quay lại tab web
    const onFocus = () => fetchMarketData();
    window.addEventListener("focus", onFocus);

    // Kết nối WebSocket Realtime Channel
    const channel = supabase
      .channel("realtime-submarket-channel", {
        config: { broadcast: { self: false } },
      })
      // 1. Lắng nghe broadcast: Cầu thủ tự do tạo mới
      .on("broadcast", { event: "free_agent_created" }, ({ payload }) => {
        const incoming = payload as FreeAgentScoutCard;
        if (!incoming?.id) return;

        setFreeAgents((prev) => {
          // 🛡️ LỚP 2: Khử trùng lặp (Deduplication)
          const isDuplicate = prev.some(
            (a) =>
              a.id === incoming.id ||
              (a.phone === incoming.phone &&
               a.position === incoming.position &&
               a.availableDateIso === incoming.availableDateIso)
          );
          if (isDuplicate) return prev;

          // Thay thế nếu có bản ghi tạm cùng nội dung
          const tempIdx = prev.findIndex(
            (a) =>
              (a.id.startsWith("scout-") || a.isCreatedByCurrentUser) &&
              a.phone === incoming.phone &&
              a.position === incoming.position
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = incoming;
            return updated;
          }

          return [incoming, ...prev];
        });
        playNotificationChime();
      })
      // 2. Lắng nghe broadcast: Cầu thủ tự do bị xóa
      .on("broadcast", { event: "free_agent_deleted" }, ({ payload }) => {
        const { agentId } = payload as { agentId: string };
        if (!agentId) return;
        setFreeAgents((prev) => prev.filter((a) => a.id !== agentId));
      })
      // 3. Lắng nghe broadcast: Đội tuyển thêm người tạo mới
      .on("broadcast", { event: "sub_post_created" }, ({ payload }) => {
        const incoming = payload as SubPlayerPost;
        if (!incoming?.id) return;

        setSubPosts((prev) => {
          // 🛡️ LỚP 2: Khử trùng lặp (Deduplication)
          const isDuplicate = prev.some(
            (p) =>
              p.id === incoming.id ||
              (p.contactPhone === incoming.contactPhone &&
               p.pitchName.toLowerCase().trim() === incoming.pitchName.toLowerCase().trim() &&
               p.positionCode === incoming.positionCode &&
               p.matchDateIso === incoming.matchDateIso)
          );
          if (isDuplicate) return prev;

          const tempIdx = prev.findIndex(
            (p) =>
              (p.id.startsWith("sub-") || p.isCreatedByCurrentUser) &&
              p.contactPhone === incoming.contactPhone &&
              p.pitchName.toLowerCase().trim() === incoming.pitchName.toLowerCase().trim()
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = incoming;
            return updated;
          }

          return [incoming, ...prev];
        });
        playNotificationChime();
      })
      // 4. Lắng nghe broadcast: Đội tuyển thêm người bị xóa
      .on("broadcast", { event: "sub_post_deleted" }, ({ payload }) => {
        const { postId } = payload as { postId: string };
        if (!postId) return;
        setSubPosts((prev) => prev.filter((p) => p.id !== postId));
      })
      // 5. Lắng nghe postgres_changes trực tiếp từ DB nếu có
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "free_agent_posts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const incoming = mapDbToFreeAgent(payload.new);
            setFreeAgents((prev) => {
              if (prev.some((a) => a.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
            playNotificationChime();
          } else if (payload.eventType === "DELETE") {
            setFreeAgents((prev) => prev.filter((a) => a.id !== String(payload.old.id)));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sub_player_posts" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const incoming = mapDbToSubPost(payload.new);
            setSubPosts((prev) => {
              if (prev.some((p) => p.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
            playNotificationChime();
          } else if (payload.eventType === "DELETE") {
            setSubPosts((prev) => prev.filter((p) => p.id !== String(payload.old.id)));
          }
        }
      );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        fetchMarketData();
      }
    });

    channelRef.current = channel;

    return () => {
      window.removeEventListener("focus", onFocus);
      supabase.removeChannel(channel);
    };
  }, [fetchMarketData]);

  // Các hàm phát sóng Realtime
  const broadcastFreeAgentCreated = async (agent: FreeAgentScoutCard) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "free_agent_created",
        payload: agent,
      });
    }
  };

  const broadcastFreeAgentDeleted = async (agentId: string) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "free_agent_deleted",
        payload: { agentId },
      });
    }
  };

  const broadcastSubPostCreated = async (post: SubPlayerPost) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "sub_post_created",
        payload: post,
      });
    }
  };

  const broadcastSubPostDeleted = async (postId: string) => {
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "sub_post_deleted",
        payload: { postId },
      });
    }
  };

  return {
    freeAgents,
    setFreeAgents,
    subPosts,
    setSubPosts,
    isLoadingMarket,
    fetchMarketData,
    broadcastFreeAgentCreated,
    broadcastFreeAgentDeleted,
    broadcastSubPostCreated,
    broadcastSubPostDeleted,
  };
}
