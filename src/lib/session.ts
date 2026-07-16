import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { AVATAR_COLORS, type MemberIdentity, type Session, type User } from "@/lib/types";

export const SESSION_COOKIE = "huddleup_session";
const SESSION_DAYS = 365;

export async function getSessionUser(): Promise<MemberIdentity | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const db = await readDb();
  const session = db.sessions.find((s) => s.id === sessionId);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    db.sessions = db.sessions.filter((s) => s.id !== sessionId);
    await writeDb(db);
    return null;
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return null;

  return {
    id: user.id,
    displayName: user.displayName,
    color: user.color,
  };
}

export async function requireSession(): Promise<MemberIdentity | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return user;
}

export function isSessionError(
  result: MemberIdentity | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}

export async function createUserSession(displayName: string): Promise<{
  user: User;
  session: Session;
  member: MemberIdentity;
}> {
  const db = await readDb();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const user: User = {
    id: crypto.randomUUID(),
    displayName: displayName.trim(),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: now.toISOString(),
  };

  const session: Session = {
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  db.users.push(user);
  db.sessions.push(session);
  await writeDb(db);

  return {
    user,
    session,
    member: { id: user.id, displayName: user.displayName, color: user.color },
  };
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return;

  const db = await readDb();
  db.sessions = db.sessions.filter((s) => s.id !== sessionId);
  await writeDb(db);
}

export function sessionCookieOptions(sessionId: string) {
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function requireProjectMember(
  projectId: string,
): Promise<MemberIdentity | NextResponse> {
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const db = await readDb();
  const isMember = db.projectMembers.some(
    (m) => m.projectId === projectId && m.memberId === auth.id,
  );

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return auth;
}
