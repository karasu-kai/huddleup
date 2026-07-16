import type { MemberIdentity } from "./types";

export async function fetchSession(): Promise<MemberIdentity | null> {
  const res = await fetch("/api/auth/session", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.member ?? null;
}

export async function createSession(displayName: string): Promise<MemberIdentity> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to sign in" }));
    throw new Error(err.error || "Failed to sign in");
  }
  const data = await res.json();
  return data.member;
}

export async function logoutSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE", credentials: "include" });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
