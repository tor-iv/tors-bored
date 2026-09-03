import "server-only";
import { mkdir } from "node:fs/promises";
import path from "node:path";

// Local-volume image storage (replaces Supabase Storage). Files live on the
// `uploads` Docker volume mounted at /app/data/uploads; served back through the
// /api/media route. UPLOAD_DIR is set in docker-compose; falls back to a local
// folder for dev.
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), ".uploads");

export const BUCKETS = ["pottery-images", "commission-images"] as const;
export type Bucket = (typeof BUCKETS)[number];

export async function ensureUploadDir(sub = ""): Promise<string> {
  const dir = path.join(UPLOAD_DIR, sub);
  await mkdir(dir, { recursive: true });
  return dir;
}

// Resolve a relative request path safely under UPLOAD_DIR (blocks ../ traversal).
export function resolveUploadPath(rel: string): string | null {
  const full = path.resolve(UPLOAD_DIR, rel);
  if (full !== UPLOAD_DIR && !full.startsWith(UPLOAD_DIR + path.sep)) return null;
  return full;
}

export function contentTypeFor(file: string): string {
  const ext = file.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}
