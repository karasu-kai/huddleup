import { NextResponse } from "next/server";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { requireApiUser, isAuthError } from "@/lib/auth";
import * as supabaseDb from "@/lib/db/supabase";
import { readDb, writeDb } from "@/lib/db/local";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    const tab = await supabaseDb.updateTab(id, {
      name: body.name,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json(tab);
  }

  const db = await readDb();
  const index = db.tabs.findIndex((t) => t.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Tab not found" }, { status: 404 });
  }

  if (body.name !== undefined) db.tabs[index].name = body.name.trim();
  if (body.sortOrder !== undefined) db.tabs[index].sortOrder = body.sortOrder;

  await writeDb(db);
  return NextResponse.json(db.tabs[index]);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    try {
      await supabaseDb.deleteTab(id);
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Delete failed" },
        { status: 400 },
      );
    }
  }

  const db = await readDb();
  const tab = db.tabs.find((t) => t.id === id);

  if (!tab) {
    return NextResponse.json({ error: "Tab not found" }, { status: 404 });
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
