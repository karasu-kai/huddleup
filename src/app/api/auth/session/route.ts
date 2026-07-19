import { NextResponse } from "next/server";
import {
  clearSessionCookieOptions,
  destroySession,
  getSessionUser,
  loginWithEmail,
  registerUser,
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
  const action = body.action === "register" ? "register" : "login";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = typeof body.displayName === "string" ? body.displayName : "";

  try {
    if (action === "register") {
      const result = await registerUser(email, password, displayName);
      const response = NextResponse.json({ member: result.member, isNew: true });
      response.cookies.set(sessionCookieOptions(result.session.id, request));
      return response;
    }

    const result = await loginWithEmail(email, password);
    if (!result) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const response = NextResponse.json({ member: result.member, isNew: false });
    response.cookies.set(sessionCookieOptions(result.session.id, request));
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not sign in";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  await destroySession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(clearSessionCookieOptions(request));
  return response;
}
