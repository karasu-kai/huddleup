import type { MemberIdentity } from "./types";

export type AuthResult = {
  member: MemberIdentity;
  isNew?: boolean;
};

export async function fetchSession(): Promise<MemberIdentity | null> {
  const res = await fetch("/api/auth/session", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.member ?? null;
}

export async function registerAccount(
  email: string,
  password: string,
  displayName: string,
): Promise<AuthResult> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "register", email, password, displayName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Could not create account" }));
    throw new Error(err.error || "Could not create account");
  }
  return res.json() as Promise<AuthResult>;
}

export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Invalid email or password" }));
    throw new Error(err.error || "Invalid email or password");
  }
  return res.json() as Promise<AuthResult>;
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
