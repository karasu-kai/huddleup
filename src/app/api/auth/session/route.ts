import { NextResponse } from "next/server";
import {
  createUserSession,
  destroySession,
  getSessionUser,
  sessionCookieOptions,
} from "@/lib/session";
import { sanitizeDisplayName } from "@/lib/security";

export async function GET() {
  const member = await getSessionUser();
  if (!member) {
    return NextResponse.json({ member: null });
  }
  return NextResponse.json({ member });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const safeName = sanitizeDisplayName(
    typeof body.displayName === "string" ? body.displayName : "",
  );

  if (!safeName) {
    return NextResponse.json({ error: "Invalid display name" }, { status: 400 });
  }

  try {
    const { session, member } = await createUserSession(safeName);
    const response = NextResponse.json({ member });
    response.cookies.set(sessionCookieOptions(session.id));
    return response;
  } catch {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }
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
