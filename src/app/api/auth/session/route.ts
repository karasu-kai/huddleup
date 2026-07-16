import { NextResponse } from "next/server";
import {
  createUserSession,
  destroySession,
  getSessionUser,
  loginWithUserCode,
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

  const userCode =
    typeof body.userCode === "string" ? body.userCode.trim().toUpperCase() : "";

  if (userCode) {
    const result = await loginWithUserCode(userCode);
    if (!result) {
      return NextResponse.json({ error: "Invalid personal code" }, { status: 404 });
    }
    const response = NextResponse.json({ member: result.member, isNew: false });
    response.cookies.set(sessionCookieOptions(result.session.id, request));
    return response;
  }

  const safeName = sanitizeDisplayName(
    typeof body.displayName === "string" ? body.displayName : "",
  );

  if (!safeName) {
    return NextResponse.json({ error: "Invalid display name" }, { status: 400 });
  }

  try {
    const { session, member, isNew } = await createUserSession(safeName);
    const response = NextResponse.json({ member, isNew });
    response.cookies.set(sessionCookieOptions(session.id, request));
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
    secure: false,
    path: "/",
    maxAge: 0,
  });
  return response;
}
