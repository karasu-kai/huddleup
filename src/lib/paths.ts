import path from "path";

/** Persistent database directory. Set HUDDLEUP_DATA_DIR on Hostinger (outside deploy folder). */
export function getDataDir(): string {
  const configured = process.env.HUDDLEUP_DATA_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), ".data");
}

/** Persistent uploads directory. Set HUDDLEUP_UPLOADS_DIR on Hostinger (outside deploy folder). */
export function getUploadsDir(): string {
  const configured = process.env.HUDDLEUP_UPLOADS_DIR?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "public", "uploads");
}

export function isUsingDefaultDataDir(): boolean {
  return !process.env.HUDDLEUP_DATA_DIR?.trim();
}
