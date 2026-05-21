/**
 * sync-images.ts
 *
 * Script untuk sinkronisasi kolom `image` di tabel Product
 * dengan file yang benar-benar ada di folder public/uploads/products/.
 *
 * Aturan:
 *   1. image terisi & file ADA       → normalisasi path ke /uploads/products/{filename} (update kolom)
 *   2. image terisi & file TIDAK ADA → kosongkan kolom image (set null)
 *   3. image null/kosong             → lewati (tidak disentuh)
 *   4. file di folder, tidak dipakai → dilaporkan saja (tidak dihapus kecuali pakai --clean-orphans)
 *
 * ⚠  PENTING: Jalankan script ini HANYA di server tempat file disimpan (VPS).
 *    Jika dijalankan lokal sementara DB mengarah ke production, file di server
 *    bisa terhapus karena dianggap "orphan".
 *
 * Cara jalankan:
 *   npm run sync:images                              → dry-run (preview saja)
 *   npm run sync:images -- --apply                  → update DB (normalisasi + kosongkan kolom yg filenya hilang)
 *   npm run sync:images -- --apply --clean-orphans  → update DB + hapus file orphan
 */

import { PrismaClient } from "@prisma/client"
import { readdirSync, existsSync, unlinkSync, statSync } from "node:fs"
import { join, basename } from "node:path"

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "products")
const URL_PREFIX = "/uploads/products"
const PROTECTED_FILES = new Set([".gitkeep", ".gitignore"])

const IS_DRY_RUN    = !process.argv.includes("--apply")
const CLEAN_ORPHANS = process.argv.includes("--clean-orphans")

function log(msg: string) { console.log(msg) }

async function main() {
  log("====================================================")
  log("  Sync Gambar Produk: DB <-> public/uploads/products")
  log("====================================================")

  if (IS_DRY_RUN) {
    log("  ⚠  MODE DRY-RUN — tidak ada perubahan yang dilakukan")
    log("     npm run sync:images -- --apply               → update DB saja")
    log("     npm run sync:images -- --apply --clean-orphans → update DB + hapus orphan")
  } else if (CLEAN_ORPHANS) {
    log("  🚨 MODE APPLY + CLEAN ORPHANS — DB diupdate & file orphan dihapus")
  } else {
    log("  🔧 MODE APPLY — hanya update DB (normalisasi & kosongkan kolom yg filenya hilang)")
    log("     File orphan di folder hanya dilaporkan, tidak dihapus.")
    log("     Tambahkan --clean-orphans untuk hapus file orphan.")
  }
  log("")

  // 1. Baca semua file di folder uploads
  let filesInFolder: Set<string> = new Set()

  if (!existsSync(UPLOADS_DIR)) {
    log(`⚠  Folder tidak ditemukan: ${UPLOADS_DIR}`)
    log("   Semua kolom image yang terisi akan dikosongkan.\n")
  } else {
    const allFiles = readdirSync(UPLOADS_DIR).filter((f) => {
      return statSync(join(UPLOADS_DIR, f)).isFile()
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
      log(`  🗑  [KOSONGKAN${IS_DRY_RUN ? " - DRY" : ""}] "${product.name}" — path tidak valid: "${rawImage}"`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
      continue
    }

    const fileExists = filesInFolder.has(filename)
    const normalizedPath = `${URL_PREFIX}/${filename}`

    if (fileExists) {
      usedFilenames.add(filename) // file ini dipakai, jangan dihapus

      if (rawImage === normalizedPath) {
        // ✅ File ada & path sudah benar — tidak perlu diubah apapun
        countOk++
      } else {
        // ✏️ File ada tapi path di kolom perlu dinormalisasi
        log(`  ✏️  [NORMALISASI${IS_DRY_RUN ? " - DRY" : ""}] "${product.name}"`)
        log(`       Dari : ${rawImage}`)
        log(`       Ke   : ${normalizedPath}`)
        if (!IS_DRY_RUN) {
          await prisma.product.update({ where: { id: product.id }, data: { image: normalizedPath } })
        }
        countFixed++
      }
    } else {
      // 🗑 File tidak ada di folder → kosongkan kolom
      log(`  🗑  [KOSONGKAN${IS_DRY_RUN ? " - DRY" : ""}] "${product.name}" — file tidak ditemukan: "${filename}"`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
    }
  }

  // ── SAFETY CHECK ─────────────────────────────────────────────────────────
  const hasRealFiles = [...filesInFolder].some((f) => !PROTECTED_FILES.has(f))
  if (products.length > 0 && usedFilenames.size === 0 && hasRealFiles) {
    log("\n⛔ PERINGATAN KRITIS: Nol file cocok antara DB dan folder!")
    log("   Kemungkinan script dijalankan di lingkungan yang salah")
    log("   (misalnya: lokal, sementara DB mengarah ke production).")
    log("   Laporan orphan DIBATALKAN untuk mencegah data hilang.\n")
    return
  }

  // ── BAGIAN 2: Laporan / Hapus File Orphan ────────────────────────────────
  const orphans: string[] = []
  for (const filename of filesInFolder) {
    if (!PROTECTED_FILES.has(filename) && !usedFilenames.has(filename)) {
      orphans.push(filename)
    }
  }

  log(`\n── [2/2] File Orphan (ada di folder, tidak dipakai DB) ─\n`)

  let countOrphanDeleted = 0
  let countOrphanFailed  = 0

  if (orphans.length === 0) {
    log("  ✅ Tidak ada file orphan ditemukan.")
  } else {
    for (const filename of orphans) {
      if (CLEAN_ORPHANS && !IS_DRY_RUN) {
        try {
          unlinkSync(join(UPLOADS_DIR, filename))
          log(`  🗑  [HAPUS ORPHAN] ${filename}`)
          countOrphanDeleted++
        } catch (err) {
          log(`  ❌  [GAGAL HAPUS] ${filename}: ${err}`)
          countOrphanFailed++
        }
      } else {
        log(`  📄  [ORPHAN] ${filename}`)
      }
    }

    if (!CLEAN_ORPHANS || IS_DRY_RUN) {
      log(`\n  ℹ  ${orphans.length} file orphan ditemukan tapi TIDAK dihapus.`)
      log("     Tambahkan --clean-orphans untuk menghapusnya.")
    }
  }

  // ── RINGKASAN ─────────────────────────────────────────────────────────────
  log("\n====================================================")
  log(`  HASIL SINKRONISASI${IS_DRY_RUN ? " (DRY-RUN)" : ""}`)
  log("====================================================")
  log(`  ✅ DB: OK — file ada & path benar : ${countOk} produk`)
  log(`  ✏️  DB: Normalisasi path            : ${countFixed} produk${IS_DRY_RUN ? " (belum disimpan)" : ""}`)
  log(`  🗑  DB: Dikosongkan (file hilang)   : ${countCleared} produk${IS_DRY_RUN ? " (belum disimpan)" : ""}`)
  log(`  📄  Folder: Orphan ditemukan        : ${orphans.length} file`)
  if (CLEAN_ORPHANS && !IS_DRY_RUN) {
    log(`  🗑  Folder: Orphan dihapus          : ${countOrphanDeleted} file`)
    if (countOrphanFailed > 0) {
      log(`  ❌  Folder: Gagal dihapus           : ${countOrphanFailed} file`)
    }
  }
  if (IS_DRY_RUN && (countFixed > 0 || countCleared > 0 || orphans.length > 0)) {
    log("")
    log("  ➡  Jalankan dengan --apply untuk eksekusi DB updates.")
    log("     Tambahkan --clean-orphans untuk hapus file orphan juga.")
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
