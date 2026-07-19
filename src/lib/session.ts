import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { AVATAR_COLORS, type MemberIdentity, type Session, type User } from "@/lib/types";
import {
  hashPassword,
  isValidSessionId,
  sanitizeDisplayName,
  sanitizeEmail,
  validatePassword,
  verifyPassword,
} from "@/lib/security";

export const SESSION_COOKIE = "huddleup_session";
const SESSION_DAYS = 365;

function toMember(user: User): MemberIdentity {
  return {
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    color: user.color,
  };
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
  if (!user || !user.email) return null;

  return toMember(user);
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

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: User; session: Session; member: MemberIdentity }> {
  const safeEmail = sanitizeEmail(email);
  if (!safeEmail) throw new Error("Invalid email address");

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const safeName = sanitizeDisplayName(displayName);
  if (!safeName) throw new Error("Invalid display name");

  const db = await readDb();
  if (db.users.some((u) => u.email?.toLowerCase() === safeEmail)) {
    throw new Error("An account with this email already exists");
  }

  const now = new Date();
  const passwordHash = await hashPassword(password);

  const user: User = {
    id: crypto.randomUUID(),
    email: safeEmail,
    passwordHash,
    displayName: safeName,
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    createdAt: now.toISOString(),
  };

  const session: Session = {
    id: crypto.randomUUID(),
    userId: user.id,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString(),
  };

  db.users.push(user);
  db.sessions.push(session);
  await writeDb(db);

  return { user, session, member: toMember(user) };
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ user: User; session: Session; member: MemberIdentity } | null> {
  const safeEmail = sanitizeEmail(email);
  if (!safeEmail || !password) return null;

  const db = await readDb();
  const user = db.users.find((u) => u.email?.toLowerCase() === safeEmail);
  if (!user?.passwordHash) return null;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;

  const session = await createSessionForUser(user);
  return { user, session, member: toMember(user) };
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

export function clearSessionCookieOptions(request?: Request) {
  const secure = request ? isSecureRequest(request) : process.env.NODE_ENV === "production";
  return {
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
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
