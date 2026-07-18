import { promises as fs } from "fs";
import path from "path";
import type { Database } from "@/lib/types";
import { getDataDir } from "@/lib/paths";

const DB_FILE = "db.json";
const BACKUP_FILE = "db.json.bak";

const EMPTY_DB: Database = {
  users: [],
  sessions: [],
  projects: [],
  tabs: [],
  items: [],
  votes: [],
  comments: [],
  projectMembers: [],
};

function dbPath(): string {
  return path.join(getDataDir(), DB_FILE);
}

function backupPath(): string {
  return path.join(getDataDir(), BACKUP_FILE);
}

function hasUserData(db: Partial<Database>): boolean {
  return (db.users?.length ?? 0) > 0 || (db.projects?.length ?? 0) > 0;
}

async function restoreFromBackup(): Promise<boolean> {
  try {
    const raw = await fs.readFile(backupPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    if (!hasUserData(parsed)) return false;
    await fs.writeFile(dbPath(), raw);
    console.warn("[huddleup] restored database from backup");
    return true;
  } catch {
    return false;
  }
}

async function ensureDb(): Promise<void> {
  const dir = getDataDir();
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(dbPath());
    return;
  } catch {
    /* missing db.json */
  }

  if (await restoreFromBackup()) return;

  await fs.writeFile(dbPath(), JSON.stringify(EMPTY_DB, null, 2));
}

export async function readDb(): Promise<Database> {
  await ensureDb();

  let raw: string;
  try {
    raw = await fs.readFile(dbPath(), "utf-8");
  } catch {
    if (await restoreFromBackup()) {
      raw = await fs.readFile(dbPath(), "utf-8");
    } else {
      throw new Error("Database unavailable");
    }
  }

  let db: Partial<Database>;
  try {
    db = JSON.parse(raw) as Partial<Database>;
  } catch {
    if (await restoreFromBackup()) {
      raw = await fs.readFile(dbPath(), "utf-8");
      db = JSON.parse(raw) as Partial<Database>;
    } else {
      throw new Error("Database corrupt");
    }
  }

  return {
    users: db.users ?? [],
    sessions: db.sessions ?? [],
    projects: db.projects ?? [],
    tabs: db.tabs ?? [],
    items: db.items ?? [],
    votes: db.votes ?? [],
    comments: db.comments ?? [],
    projectMembers: db.projectMembers ?? [],
  };
}

export async function writeDb(db: Database): Promise<void> {
  await ensureDb();
  const content = JSON.stringify(db, null, 2);

  try {
    await fs.access(dbPath());
    await fs.copyFile(dbPath(), backupPath());
  } catch {
    /* first write — no backup yet */
  }

  const tmp = `${dbPath()}.tmp`;
  await fs.writeFile(tmp, content);
  await fs.rename(tmp, dbPath());
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateUserCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function uniqueUserCode(existing: string[]): string {
  let code = generateUserCode();
  let attempts = 0;
  const taken = new Set(existing.map((c) => c.toUpperCase()));
  while (taken.has(code) && attempts < 20) {
    code = generateUserCode();
    attempts++;
  }
  return code;
}

export async function getDbStats(): Promise<{ dataDir: string; users: number; projects: number }> {
  const db = await readDb();
  return {
    dataDir: getDataDir(),
    users: db.users.length,
    projects: db.projects.length,
  };
}
