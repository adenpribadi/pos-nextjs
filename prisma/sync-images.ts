/**
 * sync-images.ts
 *
 * Script untuk sinkronisasi kolom `image` di tabel Product
 * dengan file yang benar-benar ada di folder public/uploads/products/.
 *
 * Aturan:
 *   1. image terisi & file ADA       → normalisasi path ke /uploads/products/{filename}
 *   2. image terisi & file TIDAK ADA → kosongkan kolom image (set null)
 *   3. image null/kosong             → lewati (tidak disentuh)
 *   4. file di folder, tidak dipakai → hapus file (orphan)
 *
 * ⚠  PENTING: Jalankan script ini HANYA di server tempat file disimpan (VPS).
 *    Jika dijalankan lokal sementara DB mengarah ke production, file di server
 *    bisa terhapus karena dianggap "orphan".
 *
 * Cara jalankan:
 *   npm run sync:images           → dry-run (preview saja, tidak ada perubahan)
 *   npm run sync:images -- --apply → eksekusi nyata
 */

import { PrismaClient } from "@prisma/client"
import { readdirSync, existsSync, unlinkSync, statSync } from "node:fs"
import { join, basename } from "node:path"

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "products")
const URL_PREFIX = "/uploads/products"
const PROTECTED_FILES = new Set([".gitkeep", ".gitignore"])

// Mode: dry-run (default) atau apply (--apply flag)
const IS_DRY_RUN = !process.argv.includes("--apply")

function log(msg: string) { console.log(msg) }
function dryTag() { return IS_DRY_RUN ? " [DRY-RUN]" : "" }

async function main() {
  log("====================================================")
  log("  Sync Gambar Produk: DB <-> public/uploads/products")
  log("====================================================")
  if (IS_DRY_RUN) {
    log("  ⚠  MODE DRY-RUN — tidak ada perubahan yang dilakukan")
    log("     Tambahkan flag --apply untuk eksekusi nyata:")
    log("     npm run sync:images -- --apply")
  } else {
    log("  🚨 MODE APPLY — perubahan akan disimpan ke DB & filesystem")
  }
  log("")

  // 1. Baca semua file di folder uploads
  let filesInFolder: Set<string> = new Set()

  if (!existsSync(UPLOADS_DIR)) {
    log(`⚠  Folder tidak ditemukan: ${UPLOADS_DIR}`)
    log("   Semua kolom image yang terisi akan dikosongkan.\n")
  } else {
    const allFiles = readdirSync(UPLOADS_DIR).filter((f) => {
      const fullPath = join(UPLOADS_DIR, f)
      return statSync(fullPath).isFile() // hanya file, bukan subfolder
    })
    filesInFolder = new Set(allFiles)
    log(`📁 File ditemukan di folder : ${filesInFolder.size} file`)
    if (filesInFolder.size > 0) {
      log(`   Contoh: ${[...filesInFolder].slice(0, 3).join(", ")}`)
    }
    log("")
  }

  // 2. Ambil semua produk dengan image terisi
  const products = await prisma.product.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, image: true },
  })

  log(`🗄  Produk dengan kolom image terisi: ${products.length} produk\n`)

  const usedFilenames = new Set<string>()
  let countOk = 0
  let countFixed = 0
  let countCleared = 0

  // ── BAGIAN 1: Sinkronisasi DB ↔ Folder ──────────────────────────────────
  log("── [1/2] Sinkronisasi DB ↔ Folder ─────────────────\n")

  for (const product of products) {
    const rawImage = product.image as string
    const filename = basename(rawImage)

    if (!filename) {
      log(`  🗑 ${dryTag()} [KOSONGKAN] "${product.name}" — path tidak valid: "${rawImage}"`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
      continue
    }

    const fileExists = filesInFolder.has(filename)
    const normalizedPath = `${URL_PREFIX}/${filename}`

    if (fileExists) {
      usedFilenames.add(filename)

      if (rawImage === normalizedPath) {
        countOk++
      } else {
        log(`  ✏️ ${dryTag()} [NORMALISASI] "${product.name}"`)
        log(`       Dari : ${rawImage}`)
        log(`       Ke   : ${normalizedPath}`)
        if (!IS_DRY_RUN) {
          await prisma.product.update({ where: { id: product.id }, data: { image: normalizedPath } })
        }
        countFixed++
      }
    } else {
      log(`  🗑 ${dryTag()} [KOSONGKAN] "${product.name}" — file tidak ditemukan: "${filename}"`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
    }
  }

  // ── SAFETY CHECK ─────────────────────────────────────────────────────────
  const activeFiles = filesInFolder.size - PROTECTED_FILES.size
  if (products.length > 0 && usedFilenames.size === 0 && activeFiles > 0) {
    log("\n⛔ PERINGATAN KRITIS: Nol file cocok antara DB dan folder!")
    log("   Kemungkinan script dijalankan di lingkungan yang salah")
    log("   (misalnya: lokal, sementara DB mengarah ke production).")
    log("   Penghapusan orphan DIBATALKAN untuk mencegah data hilang.\n")

    log("====================================================")
    log("  HASIL (DIBATALKAN)")
    log("====================================================")
    log(`  ⛔ Orphan deletion dibatalkan — kemungkinan environment salah`)
    log("====================================================\n")
    return
  }

  // ── BAGIAN 2: Hapus File Orphan ──────────────────────────────────────────
  log("\n── [2/2] Deteksi & Hapus File Orphan ──────────────\n")

  let countOrphanDeleted = 0
  let countOrphanSkipped = 0

  for (const filename of filesInFolder) {
    if (PROTECTED_FILES.has(filename)) continue

    if (!usedFilenames.has(filename)) {
      log(`  🗑 ${dryTag()} [HAPUS ORPHAN] ${filename}`)
      if (!IS_DRY_RUN) {
        try {
          unlinkSync(join(UPLOADS_DIR, filename))
          countOrphanDeleted++
        } catch (err) {
          log(`  ❌ [GAGAL HAPUS] ${filename}: ${err}`)
          countOrphanSkipped++
        }
      } else {
        countOrphanDeleted++ // hitung sebagai "akan dihapus"
      }
    }
  }

  if (countOrphanDeleted === 0 && countOrphanSkipped === 0) {
    log("  ✅ Tidak ada file orphan ditemukan.")
  }

  // ── RINGKASAN ─────────────────────────────────────────────────────────────
  log("\n====================================================")
  log(`  HASIL SINKRONISASI${IS_DRY_RUN ? " (DRY-RUN)" : ""}`)
  log("====================================================")
  log(`  ✅ DB: Sudah benar (tidak diubah)  : ${countOk} produk`)
  log(`  ✏️  DB: Dinormalisasi                : ${countFixed} produk${IS_DRY_RUN ? " (belum disimpan)" : ""}`)
  log(`  🗑  DB: Dikosongkan (file hilang)    : ${countCleared} produk${IS_DRY_RUN ? " (belum disimpan)" : ""}`)
  log(`  🗑  Folder: Orphan ${IS_DRY_RUN ? "akan dihapus" : "dihapus"}        : ${countOrphanDeleted} file`)
  if (countOrphanSkipped > 0) {
    log(`  ❌  Folder: Gagal dihapus            : ${countOrphanSkipped} file`)
  }
  if (IS_DRY_RUN && (countFixed > 0 || countCleared > 0 || countOrphanDeleted > 0)) {
    log("")
    log("  ➡  Jalankan dengan --apply untuk eksekusi:")
    log("     npm run sync:images -- --apply")
  }
  log("====================================================\n")
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
