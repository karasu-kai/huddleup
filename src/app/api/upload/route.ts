import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { useSupabaseDb } from "@/lib/supabase/admin";
import { requireApiUser, isAuthError } from "@/lib/auth";
import * as supabaseDb from "@/lib/db/supabase";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (useSupabaseDb()) {
    const auth = await requireApiUser();
    if (isAuthError(auth)) return auth;

    const url = await supabaseDb.uploadPhoto(auth.user.id, file);
    return NextResponse.json({ url });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
