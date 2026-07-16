import { NextResponse } from "next/server";
import { readDb, writeDb, generateInviteCode } from "@/lib/db/local";
import type { Project, ProjectMember, Tab } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const memberId = searchParams.get("memberId");
  const db = await readDb();

  let projects = db.projects;
  if (memberId) {
    const projectIds = new Set(
      db.projectMembers
        .filter((m) => m.memberId === memberId)
        .map((m) => m.projectId),
    );
    projects = projects.filter((p) => projectIds.has(p.id));
  }

  const enriched = projects.map((project) => {
    const items = db.items.filter((i) => i.projectId === project.id);
    const totalSpent = items
      .filter((i) => i.done && i.cost != null)
      .reduce((sum, i) => sum + (i.cost ?? 0), 0);
    return {
      ...project,
      itemCount: items.length,
      doneCount: items.filter((i) => i.done).length,
      totalSpent,
    };
  });

  return NextResponse.json(enriched.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, overallBudget, memberId, displayName, color } = body;

  if (!name?.trim() || !memberId || !displayName?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const db = await readDb();
  const now = new Date().toISOString();

  const project: Project = {
    id: crypto.randomUUID(),
    name: name.trim(),
    overallBudget: overallBudget ?? null,
    inviteCode: generateInviteCode(),
    createdAt: now,
  };

  const generalTab: Tab = {
    id: crypto.randomUUID(),
    projectId: project.id,
    name: "General",
    sortOrder: 0,
  };

  const member: ProjectMember = {
    id: crypto.randomUUID(),
    projectId: project.id,
    memberId,
    displayName: displayName.trim(),
    color: color || "#C8FF00",
    joinedAt: now,
  };

  db.projects.push(project);
  db.tabs.push(generalTab);
  db.projectMembers.push(member);
  await writeDb(db);

  return NextResponse.json({ project, tab: generalTab });
}
