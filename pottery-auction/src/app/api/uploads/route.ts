import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { ensureUploadDir, BUCKETS, type Bucket } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB per file

// POST /api/uploads — multipart form with `file` + `bucket`. Resizes/optimizes
// with sharp, writes to the uploads volume, returns the served URL.
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const bucketRaw = String(form?.get("bucket") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!BUCKETS.includes(bucketRaw as Bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }
  const bucket = bucketRaw as Bucket;

  // Pottery (catalog) images are admin-only; commission images are open to any
  // authenticated user submitting a request.
  if (bucket === "pottery-images" && !user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 415 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  const name = `${randomBytes(8).toString("hex")}.webp`;

  let output: Buffer;
  try {
    output = await sharp(input)
      .rotate() // honor EXIF orientation
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Could not process image" }, { status: 422 });
  }

  const dir = await ensureUploadDir(bucket);
  await writeFile(path.join(dir, name), output);

  return NextResponse.json({ url: `/api/media/${bucket}/${name}` });
}
