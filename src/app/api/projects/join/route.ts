import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { normalizeCurrency } from "@/lib/currency";
import { requireSession, isSessionError } from "@/lib/session";
import type { ProjectMember } from "@/lib/types";

export async function POST(request: Request) {
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const body = await request.json();
  const { inviteCode } = body;

  if (!inviteCode?.trim()) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  const db = await readDb();
  const project = db.projects.find(
    (p) => p.inviteCode === inviteCode.trim().toUpperCase(),
  );

  if (!project) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const existing = db.projectMembers.find(
    (m) => m.projectId === project.id && m.memberId === auth.id,
  );

  if (!existing) {
    const member: ProjectMember = {
      id: crypto.randomUUID(),
      projectId: project.id,
      memberId: auth.id,
      displayName: auth.displayName,
      color: auth.color,
      joinedAt: new Date().toISOString(),
    };
    db.projectMembers.push(member);
    await writeDb(db);
  }

  return NextResponse.json({
    project: { ...project, currency: normalizeCurrency(project.currency) },
  });
}
