"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getMember } from "@/lib/member";
import type { MemberIdentity } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

type AuthContextValue = {
  user: User | null;
  member: MemberIdentity | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  member: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [member, setMember] = useState<MemberIdentity | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!isSupabaseConfigured()) {
      setMember(getMember());
      setUser(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    setUser(authUser);

    if (authUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_color")
        .eq("id", authUser.id)
        .maybeSingle();

      setMember({
        id: authUser.id,
        displayName:
          profile?.display_name ||
          authUser.user_metadata?.display_name ||
          authUser.email?.split("@")[0] ||
          "Guest",
        color: profile?.avatar_color || "#C8FF00",
      });
    } else {
      setMember(null);
    }

    setLoading(false);
  }

  useEffect(() => {
    refresh();

    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setMember(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, member, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
