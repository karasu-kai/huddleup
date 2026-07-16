import { NextResponse } from "next/server";
import {
  createUserSession,
  destroySession,
  getSessionUser,
  sessionCookieOptions,
} from "@/lib/session";

export async function GET() {
  const member = await getSessionUser();
  if (!member) {
    return NextResponse.json({ member: null });
  }
  return NextResponse.json({ member });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!displayName) {
    return NextResponse.json({ error: "Display name required" }, { status: 400 });
  }

  const { session, member } = await createUserSession(displayName);
  const response = NextResponse.json({ member });
  response.cookies.set(sessionCookieOptions(session.id));
  return response;
}

export async function DELETE() {
  await destroySession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: "huddleup_session",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
