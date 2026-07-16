import { NextResponse } from "next/server";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { requireApiUser, isAuthError } from "@/lib/auth";
import * as supabaseDb from "@/lib/db/supabase";
import { readDb, writeDb } from "@/lib/db/local";
import type { Tab } from "@/lib/types";

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

    const tab = await supabaseDb.createTab(id, body.name || "New section");
    return NextResponse.json(tab);
  }

  const db = await readDb();

  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const maxOrder = db.tabs
    .filter((t) => t.projectId === id)
    .reduce((max, t) => Math.max(max, t.sortOrder), -1);

  const tab: Tab = {
    id: crypto.randomUUID(),
    projectId: id,
    name: body.name?.trim() || "New section",
    sortOrder: maxOrder + 1,
  };

  db.tabs.push(tab);
  await writeDb(db);
  return NextResponse.json(tab);
}
