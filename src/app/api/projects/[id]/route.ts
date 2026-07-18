import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { normalizeCurrency } from "@/lib/currency";
import { requireProjectMember, isSessionError } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireProjectMember(id);
  if (isSessionError(auth)) return auth;

  const db = await readDb();
  const project = db.projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const tabs = db.tabs
    .filter((t) => t.projectId === id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const items = db.items
    .filter((i) => i.projectId === id)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const votes = db.votes.filter((v) =>
    items.some((i) => i.id === v.itemId),
  );
  const comments = db.comments
    .filter((c) => items.some((i) => i.id === c.itemId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const members = db.projectMembers.filter((m) => m.projectId === id);

  const totalSpent = items
    .filter((i) => i.done && i.cost != null)
    .reduce((sum, i) => sum + (i.cost ?? 0), 0);

  const totalBudgeted = items.reduce(
    (sum, i) => sum + (i.budget ?? 0),
    0,
  );

  return NextResponse.json({
    project: {
      ...project,
      currency: normalizeCurrency(project.currency),
    },
    tabs,
    items,
    votes,
    comments,
    members,
    totalSpent,
    totalBudgeted,
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireProjectMember(id);
  if (isSessionError(auth)) return auth;

  const body = await request.json();
  const db = await readDb();
  const index = db.projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (body.name !== undefined) db.projects[index].name = body.name.trim();
  if (body.overallBudget !== undefined) {
    db.projects[index].overallBudget = body.overallBudget;
  }
  if (body.currency !== undefined) {
    db.projects[index].currency = normalizeCurrency(body.currency);
  }

  await writeDb(db);
  return NextResponse.json({
    ...db.projects[index],
    currency: normalizeCurrency(db.projects[index].currency),
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireProjectMember(id);
  if (isSessionError(auth)) return auth;

  const db = await readDb();

  db.projects = db.projects.filter((p) => p.id !== id);
  const itemIds = db.items.filter((i) => i.projectId === id).map((i) => i.id);
  db.tabs = db.tabs.filter((t) => t.projectId === id);
  db.items = db.items.filter((i) => i.projectId === id);
  db.votes = db.votes.filter((v) => !itemIds.includes(v.itemId));
  db.comments = db.comments.filter((c) => !itemIds.includes(c.itemId));
  db.projectMembers = db.projectMembers.filter((m) => m.projectId !== id);

  await writeDb(db);
  return NextResponse.json({ ok: true });
}
