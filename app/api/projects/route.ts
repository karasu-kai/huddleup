import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generateInviteCode, readDb, saveProject } from "@/lib/db";
import type { Project } from "@/lib/types";

export async function GET() {
  const db = await readDb();
  const projects = Object.values(db.projects)
    .map((p) => ({
      inviteCode: p.inviteCode,
      name: p.name,
      itemCount: p.items.length,
      updatedAt: p.updatedAt,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Untitled List";

  let inviteCode = generateInviteCode();
  const db = await readDb();
  while (db.projects[inviteCode]) {
    inviteCode = generateInviteCode();
  }

  const now = new Date().toISOString();
  const defaultSectionId = uuidv4();

  const project: Project = {
    id: uuidv4(),
    inviteCode,
    name,
    sections: [{ id: defaultSectionId, name: "Main", order: 0 }],
    items: [],
    createdAt: now,
    updatedAt: now,
  };

  await saveProject(project);
  return NextResponse.json({ project }, { status: 201 });
}
