/**
 * sync-images.ts
 *
 * Script untuk sinkronisasi kolom `image` di tabel Product
 * dengan file yang benar-benar ada di folder public/uploads/products/.
 *
 * Aturan:
 *   1. image terisi & file ADA      → normalisasi path ke /uploads/products/{filename}
 *   2. image terisi & file TIDAK ADA → kosongkan kolom image (set null)
 *   3. image null/kosong             → lewati (tidak disentuh)
 *   4. file ada di folder tapi TIDAK dipakai produk manapun → hapus file (orphan)
 *
 * Cara jalankan:
 *   npm run sync:images
 */

import { PrismaClient } from "@prisma/client"
import { readdirSync, existsSync, unlinkSync, statSync } from "node:fs"
import { join, basename } from "node:path"

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "products")
const URL_PREFIX = "/uploads/products"

// File yang tidak boleh dihapus meskipun tidak ada di DB
const PROTECTED_FILES = new Set([".gitkeep", ".gitignore"])

async function main() {
  console.log("====================================================")
  console.log("  Sync Gambar Produk: DB <-> public/uploads/products")
  console.log("====================================================\n")

  // 1. Baca semua nama file yang ada di folder uploads
  let filesInFolder: Set<string> = new Set()

  if (!existsSync(UPLOADS_DIR)) {
    console.warn(`⚠ Folder tidak ditemukan: ${UPLOADS_DIR}`)
    console.warn("  Semua kolom image yang terisi akan dikosongkan.\n")
  } else {
    const allFiles = readdirSync(UPLOADS_DIR)
    filesInFolder = new Set(allFiles)
    console.log(`📁 File ditemukan di folder : ${filesInFolder.size} file`)
    if (filesInFolder.size > 0) {
      console.log(`   Contoh: ${[...filesInFolder].slice(0, 3).join(", ")}`)
    }
    console.log()
  }

  // 2. Ambil semua produk yang punya nilai image
  const products = await prisma.product.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, image: true },
  })

  console.log(`🗄  Produk dengan kolom image terisi: ${products.length} produk\n`)

  // Kumpulkan nama file yang aktif dipakai DB (untuk cek orphan nanti)
  const usedFilenames = new Set<string>()

  let countOk = 0
  let countFixed = 0
  let countCleared = 0

  // ── BAGIAN 1: Sinkronisasi DB ↔ Folder ──────────────────────────────────
  console.log("── [1/2] Sinkronisasi DB ↔ Folder ─────────────────\n")

  for (const product of products) {
    const rawImage = product.image as string
    const filename = basename(rawImage)

    if (!filename || filename === "") {
      await prisma.product.update({
        where: { id: product.id },
        data: { image: null },
      })
      console.log(`  🗑  [KOSONGKAN] "${product.name}" — path tidak valid: "${rawImage}"`)
      countCleared++
      continue
    }

    const fileExists = filesInFolder.has(filename)
    const normalizedPath = `${URL_PREFIX}/${filename}`

    if (fileExists) {
      usedFilenames.add(filename) // tandai file ini sebagai "dipakai"

      if (rawImage === normalizedPath) {
        countOk++
      } else {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: normalizedPath },
        })
        console.log(`  ✏️  [NORMALISASI] "${product.name}"`)
        console.log(`       Dari : ${rawImage}`)
        console.log(`       Ke   : ${normalizedPath}`)
        countFixed++
      }
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: { image: null },
      })
      console.log(`  🗑  [KOSONGKAN] "${product.name}" — file tidak ditemukan: "${filename}"`)
      countCleared++
    }
  }

  // ── BAGIAN 2: Hapus File Orphan (ada di folder, tidak dipakai DB) ───────
  console.log("\n── [2/2] Deteksi & Hapus File Orphan ──────────────\n")

  let countOrphanDeleted = 0
  let countOrphanSkipped = 0

  for (const filename of filesInFolder) {
    // Lewati file yang dilindungi
    if (PROTECTED_FILES.has(filename)) continue

    if (!usedFilenames.has(filename)) {
      const filePath = join(UPLOADS_DIR, filename)

      // Lewati jika ini adalah direktori (subfolder)
      if (statSync(filePath).isDirectory()) continue

      try {
        unlinkSync(filePath)
        console.log(`  🗑  [HAPUS ORPHAN] ${filename}`)
        countOrphanDeleted++
      } catch (err) {
        console.error(`  ❌  [GAGAL HAPUS]  ${filename}:`, err)
        countOrphanSkipped++
      }
    }
  }

  if (countOrphanDeleted === 0 && countOrphanSkipped === 0) {
    console.log("  ✅ Tidak ada file orphan ditemukan.")
  }

  // ── RINGKASAN ────────────────────────────────────────────────────────────
  console.log("\n====================================================")
  console.log("  HASIL SINKRONISASI")
  console.log("====================================================")
  console.log(`  ✅ DB: Sudah benar (tidak diubah)  : ${countOk} produk`)
  console.log(`  ✏️  DB: Dinormalisasi                : ${countFixed} produk`)
  console.log(`  🗑  DB: Dikosongkan (file hilang)    : ${countCleared} produk`)
  console.log(`  🗑  Folder: Orphan dihapus           : ${countOrphanDeleted} file`)
  if (countOrphanSkipped > 0) {
    console.log(`  ❌  Folder: Gagal dihapus            : ${countOrphanSkipped} file`)
  }
  console.log("====================================================\n")
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
