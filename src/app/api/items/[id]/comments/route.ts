import { NextResponse } from "next/server";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { requireApiUser, isAuthError } from "@/lib/auth";
import * as supabaseDb from "@/lib/db/supabase";
import { readDb, writeDb } from "@/lib/db/local";
import type { Comment } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    const comment = await supabaseDb.addComment(
      id,
      auth.user.id,
      auth.member.displayName,
      body.text,
    );
    return NextResponse.json(comment);
  }

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

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    const supabase = (await import("@/lib/supabase/admin")).createAdminClient();
    await supabase.from("comments").delete().eq("id", id).eq("user_id", auth.user.id);
    return NextResponse.json({ ok: true });
  }

  const db = await readDb();
  db.comments = db.comments.filter((c) => c.id !== id);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
