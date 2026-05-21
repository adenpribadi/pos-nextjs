/**
 * sync-images.ts
 *
 * Script untuk sinkronisasi & rename file gambar produk.
 *
 * Yang dilakukan:
 *   1. File ada & nama sudah sesuai nama produk  → OK, tidak diubah
 *   2. File ada & nama TIDAK sesuai (misal UUID) → rename file + update kolom DB
 *   3. Kolom terisi tapi file tidak ada          → kosongkan kolom (set null)
 *   4. File di folder tidak dipakai DB           → dilaporkan saja (gunakan --clean-orphans untuk hapus)
 *
 * ⚠  Jalankan HANYA di server tempat file disimpan (VPS).
 *
 * Cara jalankan:
 *   npm run sync:images                              → dry-run (preview saja)
 *   npm run sync:images -- --apply                  → rename file + update DB
 *   npm run sync:images -- --apply --clean-orphans  → + hapus file orphan
 */

import { PrismaClient } from "@prisma/client"
import { readdirSync, existsSync, renameSync, unlinkSync, statSync } from "node:fs"
import { join, extname, basename } from "node:path"

const prisma = new PrismaClient()

const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "products")
const URL_PREFIX  = "/uploads/products"
const PROTECTED_FILES = new Set([".gitkeep", ".gitignore"])

const IS_DRY_RUN    = !process.argv.includes("--apply")
const CLEAN_ORPHANS = process.argv.includes("--clean-orphans")

/** Konversi nama produk menjadi slug untuk nama file */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function log(msg: string) { console.log(msg) }

async function main() {
  log("====================================================")
  log("  Sync & Rename Gambar Produk")
  log("====================================================")

  if (IS_DRY_RUN) {
    log("  ⚠  MODE DRY-RUN — tidak ada perubahan yang dilakukan")
    log("     npm run sync:images -- --apply               → eksekusi")
    log("     npm run sync:images -- --apply --clean-orphans → + hapus orphan")
  } else if (CLEAN_ORPHANS) {
    log("  🚨 MODE APPLY + CLEAN ORPHANS")
  } else {
    log("  🔧 MODE APPLY — rename file & update DB")
  }
  log("")

  // 1. Baca semua file di folder
  let filesInFolder: Map<string, string> = new Map() // filename → fullpath

  if (!existsSync(UPLOADS_DIR)) {
    log(`⚠  Folder tidak ditemukan: ${UPLOADS_DIR}\n`)
  } else {
    for (const f of readdirSync(UPLOADS_DIR)) {
      const fullPath = join(UPLOADS_DIR, f)
      if (statSync(fullPath).isFile() && !PROTECTED_FILES.has(f)) {
        filesInFolder.set(f, fullPath)
      }
    }
    log(`📁 File ditemukan di folder : ${filesInFolder.size} file`)
    const sample = [...filesInFolder.keys()].slice(0, 3).join(", ")
    if (sample) log(`   Contoh: ${sample}`)
    log("")
  }

  // 2. Ambil semua produk
  const products = await prisma.product.findMany({
    select: { id: true, name: true, image: true },
    orderBy: { name: "asc" },
  })

  const productsWithImage = products.filter((p) => p.image !== null)
  log(`🗄  Produk dengan kolom image terisi: ${productsWithImage.length} produk\n`)

  // Track nama file yang sudah dipakai (untuk hindari konflik rename)
  const usedFilenames = new Set<string>()
  let countOk = 0
  let countRenamed = 0
  let countCleared = 0

  // ── BAGIAN 1: Proses setiap produk ──────────────────────────────────────
  log("── [1/2] Sinkronisasi DB ↔ Folder ─────────────────\n")

  for (const product of productsWithImage) {
    const rawImage = product.image as string
    const currentFilename = basename(rawImage)

    if (!currentFilename) {
      log(`  🗑  [KOSONGKAN] "${product.name}" — path tidak valid`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
      continue
    }

    // Cek apakah file fisik ada di folder
    if (!filesInFolder.has(currentFilename)) {
      log(`  🗑  [KOSONGKAN] "${product.name}" — file tidak ditemukan: "${currentFilename}"`)
      if (!IS_DRY_RUN) {
        await prisma.product.update({ where: { id: product.id }, data: { image: null } })
      }
      countCleared++
      continue
    }

    // File ada — tentukan nama baru berdasarkan nama produk
    const ext = extname(currentFilename) // .webp, .png, dll
    const slug = toSlug(product.name)
    let targetFilename = `${slug}${ext}`

    // Hindari konflik: jika nama target sudah dipakai produk lain, tambahkan suffix pendek
    if (usedFilenames.has(targetFilename) && targetFilename !== currentFilename) {
      targetFilename = `${slug}_${product.id.slice(-6)}${ext}`
    }

    usedFilenames.add(targetFilename)
    const targetPath = `${URL_PREFIX}/${targetFilename}`

    if (currentFilename === targetFilename) {
      // ✅ Nama sudah sesuai nama produk
      countOk++
    } else {
      // ✏️ Perlu rename file & update kolom
      const oldPath = filesInFolder.get(currentFilename)!
      const newPath = join(UPLOADS_DIR, targetFilename)

      log(`  ✏️  [RENAME] "${product.name}"`)
      log(`       File : ${currentFilename} → ${targetFilename}`)
      log(`       Kolom: ${rawImage} → ${targetPath}`)

      if (!IS_DRY_RUN) {
        renameSync(oldPath, newPath)
        await prisma.product.update({ where: { id: product.id }, data: { image: targetPath } })
        // Update map agar file baru terdeteksi sebagai "dipakai"
        filesInFolder.delete(currentFilename)
        filesInFolder.set(targetFilename, newPath)
      }
      countRenamed++
    }
  }

  // ── SAFETY CHECK ─────────────────────────────────────────────────────────
  if (productsWithImage.length > 0 && usedFilenames.size === 0 && filesInFolder.size > 0) {
    log("\n⛔ PERINGATAN: Nol file cocok antara DB dan folder!")
    log("   Kemungkinan script dijalankan di lingkungan yang salah.")
    log("   Operasi dihentikan.\n")
    return
  }

  // ── BAGIAN 2: Laporan / Hapus File Orphan ────────────────────────────────
  // (File yang ada di folder tapi tidak dipakai produk manapun setelah proses rename)
  const orphans = [...filesInFolder.keys()].filter((f) => !usedFilenames.has(f))

  log(`\n── [2/2] File Orphan (ada di folder, tidak dipakai DB) ─\n`)

  let countOrphanDeleted = 0
  let countOrphanFailed  = 0

  if (orphans.length === 0) {
    log("  ✅ Tidak ada file orphan.")
  } else {
    for (const filename of orphans) {
      if (CLEAN_ORPHANS && !IS_DRY_RUN) {
        try {
          unlinkSync(filesInFolder.get(filename)!)
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
  log(`  HASIL${IS_DRY_RUN ? " (DRY-RUN — tidak ada perubahan)" : ""}`)
  log("====================================================")
  log(`  ✅ OK — nama sudah sesuai produk    : ${countOk} file`)
  log(`  ✏️  Direname (file + kolom DB)       : ${countRenamed}${IS_DRY_RUN ? " (belum dieksekusi)" : ""}`)
  log(`  🗑  Kolom dikosongkan (file hilang)  : ${countCleared}${IS_DRY_RUN ? " (belum dieksekusi)" : ""}`)
  log(`  📄  File orphan ditemukan            : ${orphans.length} file`)
  if (CLEAN_ORPHANS && !IS_DRY_RUN) {
    log(`  🗑  File orphan dihapus              : ${countOrphanDeleted}`)
  }
  if (IS_DRY_RUN && (countRenamed > 0 || countCleared > 0 || orphans.length > 0)) {
    log("")
    log("  ➡  npm run sync:images -- --apply   untuk eksekusi")
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
