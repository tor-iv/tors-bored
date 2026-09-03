import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolveUploadPath, contentTypeFor } from "@/lib/storage";

export const runtime = "nodejs";

// GET /api/media/<bucket>/<file> — streams an uploaded image from the volume.
// Path is resolved safely under UPLOAD_DIR to block traversal.
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const full = resolveUploadPath(parts.join("/"));
  if (!full) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const buf = await readFile(full);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": contentTypeFor(full),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
