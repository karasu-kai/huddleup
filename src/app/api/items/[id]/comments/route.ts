import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db/local";
import { requireSession, isSessionError } from "@/lib/session";
import type { Comment } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const body = await request.json();
  const db = await readDb();

  const item = db.items.find((i) => i.id === id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const isMember = db.projectMembers.some(
    (m) => m.projectId === item.projectId && m.memberId === auth.id,
  );
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    itemId: id,
    memberId: auth.id,
    memberName: auth.displayName,
    text: body.text?.trim(),
    createdAt: new Date().toISOString(),
  };

  db.comments.push(comment);
  await writeDb(db);
  return NextResponse.json(comment);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const db = await readDb();
  const comment = db.comments.find((c) => c.id === id);
  if (!comment || comment.memberId !== auth.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  db.comments = db.comments.filter((c) => c.id !== id);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
