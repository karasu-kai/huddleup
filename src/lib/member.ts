import { AVATAR_COLORS, type MemberIdentity } from "./types";

const STORAGE_KEY = "huddleup-member";

export function getMember(): MemberIdentity | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberIdentity;
  } catch {
    return null;
  }
}

export function saveMember(member: MemberIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
}

export function createMember(displayName: string): MemberIdentity {
  const member: MemberIdentity = {
    id: crypto.randomUUID(),
    displayName: displayName.trim(),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  };
  saveMember(member);
  return member;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
