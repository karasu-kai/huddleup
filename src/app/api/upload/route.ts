import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireSession, isSessionError } from "@/lib/session";
import { extensionForMime, validateImageUpload, detectImageMime } from "@/lib/security";

export async function POST(request: Request) {
  const auth = await requireSession();
  if (isSessionError(auth)) return auth;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validationError = validateImageUpload(file, buffer);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const mime = detectImageMime(buffer)!;
  const ext = extensionForMime(mime);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
