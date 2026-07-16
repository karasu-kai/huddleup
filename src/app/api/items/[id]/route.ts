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

    const item = await supabaseDb.updateItem(id, {
      name: body.name,
      done: body.done,
      cost: body.cost,
      budget: body.budget,
      url: body.url,
      imageUrl: body.imageUrl,
      notes: body.notes,
      tabId: body.tabId,
    });
    return NextResponse.json(item);
  }

  const db = await readDb();
  const index = db.items.findIndex((i) => i.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const item = db.items[index];
  if (body.name !== undefined) item.name = body.name.trim();
  if (body.done !== undefined) item.done = body.done;
  if (body.cost !== undefined) item.cost = body.cost;
  if (body.budget !== undefined) item.budget = body.budget;
  if (body.url !== undefined) item.url = body.url?.trim() || null;
  if (body.imageUrl !== undefined) item.imageUrl = body.imageUrl || null;
  if (body.notes !== undefined) item.notes = body.notes?.trim() || null;
  if (body.tabId !== undefined) item.tabId = body.tabId;

  await writeDb(db);
  return NextResponse.json(item);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    await supabaseDb.deleteItem(id);
    return NextResponse.json({ ok: true });
  }

  const db = await readDb();

  db.items = db.items.filter((i) => i.id !== id);
  db.votes = db.votes.filter((v) => v.itemId !== id);
  db.comments = db.comments.filter((c) => c.itemId !== id);

  await writeDb(db);
  return NextResponse.json({ ok: true });
}
