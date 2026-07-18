import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getUploadsDir } from "@/lib/paths";
import { detectImageMime } from "@/lib/security";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

type Params = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { filename } = await params;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 });
  }

  const filePath = path.join(getUploadsDir(), filename);

  try {
    const buffer = await fs.readFile(filePath);
    const detected = detectImageMime(buffer);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const contentType = detected ?? MIME[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
