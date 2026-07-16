import fs from "fs/promises";
import path from "path";
import type { Database, Project } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const EMPTY_DB: Database = { projects: {} };

async function ensureDb(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureDb();
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw) as Database;
}

export async function writeDb(db: Database): Promise<void> {
  await ensureDb();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function getProjectByCode(code: string): Promise<Project | null> {
  const db = await readDb();
  const normalized = code.toUpperCase();
  return db.projects[normalized] ?? null;
}

export async function saveProject(project: Project): Promise<Project> {
  const db = await readDb();
  db.projects[project.inviteCode] = project;
  await writeDb(db);
  return project;
}

export async function deleteProject(code: string): Promise<boolean> {
  const db = await readDb();
  const normalized = code.toUpperCase();
  if (!db.projects[normalized]) return false;
  delete db.projects[normalized];
  await writeDb(db);
  return true;
}
