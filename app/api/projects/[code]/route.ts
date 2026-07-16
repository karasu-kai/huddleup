import { NextResponse } from "next/server";
import { deleteProject, getProjectByCode, saveProject } from "@/lib/db";
import type { ProjectUpdate } from "@/lib/types";

type RouteContext = { params: Promise<{ code: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const project = await getProjectByCode(code);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { code } = await context.params;
  const project = await getProjectByCode(code);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as ProjectUpdate;

  if (typeof body.name === "string" && body.name.trim()) {
    project.name = body.name.trim();
  }
  if (Array.isArray(body.sections)) {
    project.sections = body.sections;
  }
  if (Array.isArray(body.items)) {
    project.items = body.items;
  }

  project.updatedAt = new Date().toISOString();
  await saveProject(project);
  return NextResponse.json({ project });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { code } = await context.params;
  const deleted = await deleteProject(code);
  if (!deleted) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
