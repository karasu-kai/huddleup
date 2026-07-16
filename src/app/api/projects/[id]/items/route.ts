import { NextResponse } from "next/server";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { requireApiUser, isAuthError } from "@/lib/auth";
import * as supabaseDb from "@/lib/db/supabase";
import { readDb, writeDb } from "@/lib/db/local";
import type { Item } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    const isMember = await supabaseDb.isProjectMember(id, auth.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const item = await supabaseDb.createItem(id, {
      name: body.name,
      tabId: body.tabId,
      cost: body.cost ?? null,
      budget: body.budget ?? null,
      url: body.url?.trim() || null,
      imageUrl: body.imageUrl || null,
      notes: body.notes?.trim() || null,
      createdBy: auth.user.id,
    });

    return NextResponse.json(item);
  }

  const db = await readDb();

  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let tabId = body.tabId;
  if (!tabId) {
    const firstTab = db.tabs
      .filter((t) => t.projectId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder)[0];
    tabId = firstTab?.id;
  }

  if (!tabId) {
    return NextResponse.json({ error: "No section found" }, { status: 400 });
  }

  const maxOrder = db.items
    .filter((i) => i.projectId === id)
    .reduce((max, i) => Math.max(max, i.sortOrder), -1);

  const item: Item = {
    id: crypto.randomUUID(),
    projectId: id,
    tabId,
    name: body.name?.trim() || "Untitled",
    done: false,
    cost: body.cost ?? null,
    budget: body.budget ?? null,
    url: body.url?.trim() || null,
    imageUrl: body.imageUrl || null,
    notes: body.notes?.trim() || null,
    createdBy: body.createdBy || null,
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  db.items.push(item);
  await writeDb(db);
  return NextResponse.json(item);
}
