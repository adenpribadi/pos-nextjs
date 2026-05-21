import { NextRequest, NextResponse } from "next/server"
import { readFile } from "node:fs/promises"
import { join, extname, normalize } from "node:path"

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params

  // Cegah path traversal attack (misal: ../../etc/passwd)
  const safePath = path
    .map((segment) => segment.replace(/\.\./g, "").replace(/[/\\]/g, ""))
    .filter(Boolean)

  if (safePath.length === 0) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const filePath = normalize(
    join(process.cwd(), "public", "uploads", ...safePath)
  )

  // Pastikan path masih di dalam folder uploads (double-check)
  const uploadsBase = normalize(join(process.cwd(), "public", "uploads"))
  if (!filePath.startsWith(uploadsBase)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const file = await readFile(filePath)
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream"

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": file.byteLength.toString(),
      },
    })
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }
}
