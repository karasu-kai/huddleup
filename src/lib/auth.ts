import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { getProfile } from "@/lib/db/supabase";
import type { MemberIdentity } from "@/lib/types";

export async function requireApiUser(): Promise<
  { user: { id: string; email?: string }; member: MemberIdentity } | NextResponse
> {
  if (!useSupabaseDb()) {
    return NextResponse.json(
      { error: "Supabase not configured. Set SUPABASE env vars." },
      { status: 503 },
    );
  }

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  const member: MemberIdentity = {
    id: user.id,
    displayName: profile?.displayName || user.email?.split("@")[0] || "Guest",
    color: profile?.color || "#C8FF00",
  };

  return { user: { id: user.id, email: user.email }, member };
}

export function isAuthError(
  result: { user: { id: string; email?: string }; member: MemberIdentity } | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
