import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { requireSession, isSessionError } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const body = await request.json();
  const db = await readDb();
  const tab = db.tabs.find((t) => t.id === id);

  if (!tab) {
    return NextResponse.json({ error: "Tab not found" }, { status: 404 });
  }

  const isMember = db.projectMembers.some(
    (m) => m.projectId === tab.projectId && m.memberId === auth.id,
  );
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const index = db.tabs.findIndex((t) => t.id === id);
  if (body.name !== undefined) db.tabs[index].name = body.name.trim();
  if (body.sortOrder !== undefined) db.tabs[index].sortOrder = body.sortOrder;

  await writeDb(db);
  return NextResponse.json(db.tabs[index]);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const db = await readDb();
  const tab = db.tabs.find((t) => t.id === id);

  if (!tab) {
    return NextResponse.json({ error: "Tab not found" }, { status: 404 });
  }

  const isMember = db.projectMembers.some(
    (m) => m.projectId === tab.projectId && m.memberId === auth.id,
  );
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projectTabs = db.tabs.filter((t) => t.projectId === tab.projectId);
  if (projectTabs.length <= 1) {
    return NextResponse.json(
      { error: "Cannot delete the last section" },
      { status: 400 },
    );
  }

  const fallbackTab = projectTabs.find((t) => t.id !== id)!;
  db.items.forEach((item) => {
    if (item.tabId === id) item.tabId = fallbackTab.id;
  });

  db.tabs = db.tabs.filter((t) => t.id !== id);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
