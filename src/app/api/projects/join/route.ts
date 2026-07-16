import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import type { ProjectMember } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { inviteCode, memberId, displayName, color } = body;

  if (!inviteCode?.trim() || !memberId || !displayName?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await readDb();
  const project = db.projects.find(
    (p) => p.inviteCode === inviteCode.trim().toUpperCase(),
  );

  if (!project) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const existing = db.projectMembers.find(
    (m) => m.projectId === project.id && m.memberId === memberId,
  );

  if (!existing) {
    const member: ProjectMember = {
      id: crypto.randomUUID(),
      projectId: project.id,
      memberId,
      displayName: displayName.trim(),
      color: color || "#C8FF00",
      joinedAt: new Date().toISOString(),
    };
    db.projectMembers.push(member);
    await writeDb(db);
  }

  return NextResponse.json({ project });
}
