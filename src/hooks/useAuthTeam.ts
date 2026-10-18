"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserAndTeamAction } from "@/actions/auth";

export interface AuthenticatedTeamProfile {
  id: string;
  captain_id: string;
  team_name: string;
  captain_name?: string;
  captain_phone?: string;
  captain_zalo?: string;
  jersey_color?: string;
  avg_age: number;
  skill_tier: number;
  trust_score: number;
  late_cancels_count: number;
  clean_streak_count?: number;
  has_warning_badge: boolean;
  home_district: string;
  bank_account_no?: string;
  bank_account_name?: string;
  bank_code?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
}

export function useAuthTeam() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<AuthenticatedTeamProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await getCurrentUserAndTeamAction();
      setUser(res.user);
      setProfile(res.profile);
      setTeam(res.team);
    } catch (err) {
      console.error("[Auth Hook Error]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Kiểm tra tức thì nếu URL chứa hash fragment (#access_token=...) từ chuyển hướng OAuth
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const hashToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || "";

        if (hashToken) {
          let userId = "";
          try {
            const base64Url = hashToken.split(".")[1];
            if (base64Url) {
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                atob(base64)
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const payload = JSON.parse(jsonPayload);
              userId = payload.sub || payload.id || "";
            }
          } catch (e) {
            console.error("[useAuthTeam JWT Parse Error]", e);
          }

          // Kích hoạt đồng thời cả Supabase Client session lẫn Server Cookie
          supabase.auth
            .setSession({ access_token: hashToken, refresh_token: refreshToken })
            .catch(() => null);

          import("@/actions/auth").then(({ syncClientSessionAction }) => {
            syncClientSessionAction(hashToken, userId).then(() => {
              fetchSession();
              // Dọn sạch "?error=auth_failed" và "#access_token=..." trên URL
              window.history.replaceState(null, "", "/");
            });
          });
        }
      } catch (err) {
        console.error("[useAuthTeam Hash Parser Error]", err);
      }
    }

    // 2. Tải phiên hiện tại
    fetchSession();

    // 3. Kiểm tra Session đã lưu trong Supabase Client (nếu có mà cookie chưa đồng bộ)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.access_token && session?.user?.id) {
        try {
          const { syncClientSessionAction } = await import("@/actions/auth");
          await syncClientSessionAction(session.access_token, session.user.id);
          fetchSession();
        } catch (e) {
          console.error("Session sync error", e);
        }
      }
    });

    // 4. Lắng nghe sự kiện thay đổi trạng thái đăng nhập
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.access_token && session?.user?.id) {
          try {
            const { syncClientSessionAction } = await import("@/actions/auth");
            await syncClientSessionAction(
              session.access_token,
              session.user.id
            );
          } catch (e) {
            console.error("Session cookie sync error", e);
          }
        }
        fetchSession();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    try {
      const { signOutAction } = await import("@/actions/auth");
      await signOutAction();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Sign Out Error]", err);
    } finally {
      setUser(null);
      setProfile(null);
      setTeam(null);
    }
  }, []);

  return {
    user,
    profile,
    team,
    loading,
    refreshAuth: fetchSession,
    signOut,
    isAuthenticated: !!user,
    hasTeam: !!team,
  };
}
