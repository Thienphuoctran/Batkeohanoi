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
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchSession();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSession]);

  return {
    user,
    profile,
    team,
    loading,
    refreshAuth: fetchSession,
    isAuthenticated: !!user,
    hasTeam: !!team,
  };
}
