import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import type { Comment } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const db = await readDb();

  const item = db.items.find((i) => i.id === id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    itemId: id,
    memberId: body.memberId,
    memberName: body.memberName,
    text: body.text?.trim(),
    createdAt: new Date().toISOString(),
  };

  db.comments.push(comment);
  await writeDb(db);
  return NextResponse.json(comment);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const db = await readDb();
  db.comments = db.comments.filter((c) => c.id !== id);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
