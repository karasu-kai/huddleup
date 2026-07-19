import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const MAX_DISPLAY_NAME = 40;
const MIN_PASSWORD_LENGTH = 8;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

const IMAGE_SIGNATURES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function sanitizeDisplayName(name: string): string | null {
  const trimmed = name.trim().replace(/[\x00-\x1f\x7f]/g, "");
  if (!trimmed || trimmed.length > MAX_DISPLAY_NAME) return null;
  return trimmed;
}

export function sanitizeEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || trimmed.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

export function validatePassword(password: string): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (password.length > 128) return "Password is too long";
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const derived = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashBuf = Buffer.from(hash, "hex");
    if (derived.length !== hashBuf.length) return false;
    return timingSafeEqual(derived, hashBuf);
  } catch {
    return false;
  }
}

export function isValidSessionId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function detectImageMime(buffer: Buffer): string | null {
  for (const sig of IMAGE_SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      if (sig.mime === "image/webp") {
        const webp = buffer.subarray(8, 12).toString("ascii");
        if (webp !== "WEBP") return null;
      }
      return sig.mime;
    }
  }
  return null;
}

export function validateImageUpload(file: File, buffer: Buffer): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return "File too large (max 5 MB)";
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Only JPEG, PNG, WebP, and GIF images are allowed";
  }

  const detected = detectImageMime(buffer);
  if (!detected || !ALLOWED_IMAGE_TYPES.has(detected)) {
    return "Invalid image file";
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return "Invalid file extension";
  }

  return null;
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}
