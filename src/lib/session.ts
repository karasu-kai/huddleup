import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readDb, writeDb, uniqueUserCode } from "@/lib/db/local";
import { AVATAR_COLORS, type MemberIdentity, type Session, type User } from "@/lib/types";
import { isValidSessionId, sanitizeDisplayName } from "@/lib/security";

export const SESSION_COOKIE = "huddleup_session";
const SESSION_DAYS = 365;

function toMember(user: User): MemberIdentity {
  return {
    id: user.id,
    displayName: user.displayName,
    color: user.color,
    userCode: user.userCode ?? "",
  };
}

async function ensureUserCode(user: User, db: Awaited<ReturnType<typeof readDb>>): Promise<User> {
  if (user.userCode) return user;
  user.userCode = uniqueUserCode(db.users.map((u) => u.userCode).filter(Boolean) as string[]);
  const index = db.users.findIndex((u) => u.id === user.id);
  if (index !== -1) {
    db.users[index] = user;
    await writeDb(db);
  }
  return user;
}

export async function getSessionUser(): Promise<MemberIdentity | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId || !isValidSessionId(sessionId)) return null;

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

  const withCode = await ensureUserCode(user, db);
  return toMember(withCode);
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

async function createSessionForUser(user: User): Promise<Session> {
  const db = await readDb();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const session: Session = {
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  db.sessions.push(session);
  await writeDb(db);
  return session;
}

export async function createUserSession(displayName: string): Promise<{
  user: User;
  session: Session;
  member: MemberIdentity;
  isNew: boolean;
}> {
  const safeName = sanitizeDisplayName(displayName);
  if (!safeName) {
    throw new Error("Invalid display name");
  }

  const db = await readDb();
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const user: User = {
    id: crypto.randomUUID(),
    displayName: safeName,
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    userCode: uniqueUserCode(db.users.map((u) => u.userCode).filter(Boolean) as string[]),
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
    member: toMember(user),
    isNew: true,
  };
}

export async function loginWithUserCode(userCode: string): Promise<{
  user: User;
  session: Session;
  member: MemberIdentity;
} | null> {
  const normalized = userCode.trim().toUpperCase();
  if (normalized.length !== 8) return null;

  const db = await readDb();
  const user = db.users.find((u) => u.userCode?.toUpperCase() === normalized);
  if (!user) return null;

  const withCode = await ensureUserCode(user, db);
  const session = await createSessionForUser(withCode);

  return {
    user: withCode,
    session,
    member: toMember(withCode),
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

export function isSecureRequest(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
}

export function sessionCookieOptions(sessionId: string, request?: Request) {
  const secure = request ? isSecureRequest(request) : process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    secure,
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
