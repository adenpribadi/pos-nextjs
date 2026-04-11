"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir, unlink } from "node:fs/promises"
import { join } from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"

export async function createProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string || null
    
    // Proses File Upload
    const imageFile = formData.get("image") as File | null
    let imagePath = null

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Optimasi Gambar dengan Sharp
        // 1. Ubah format ke WebP
        // 2. Resize ke max 1000px (lebar atau tinggi)
        // 3. Kompres kualitas ke 80%
        const optimizedBuffer = await sharp(buffer)
          .resize(1000, 1000, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer()

        // Generate nama file acak (UUID) dengan ekstensi .webp
        const fileName = `${crypto.randomUUID()}.webp`
        
        // Pastikan direktori ada
        const uploadDir = join(process.cwd(), "public", "uploads", "products")
        await mkdir(uploadDir, { recursive: true })
        
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, optimizedBuffer)
        
        imagePath = `/uploads/products/${fileName}`
      } catch (err) {
        console.error("Gagal optimasi & upload file:", err)
      }
    }

    if (!name || !sku || isNaN(price) || isNaN(stock)) {
      return { success: false, error: "Semua kolom wajib diisi dengan format yang benar." }
    }

    // Periksa apakah SKU sudah digunakan
    const existing = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (existing) {
      return { success: false, error: "SKU / Kode Barang ini sudah terdaftar." }
    }

    // Buat produk baru dalam mode transaction agar aman
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name,
          sku,
          price,
          stock,
          image: imagePath,
          categoryId: categoryId === "" ? null : categoryId,
        }
      })

      // Jika ada stok awal > 0, catat sebagai transaksi inventori
      if (stock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: "IN",
            quantity: stock,
            notes: "Stok Awal Inventaris",
            userId: session.user.id
          }
        })
      }
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/inventory")
    revalidatePath("/checkout")

    return { success: true }
  } catch (error) {
    console.error("Gagal menambah produk:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function updateProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const categoryId = formData.get("categoryId") as string || null

    // Proses File Upload (Sama dengan create)
    const imageFile = formData.get("image") as File | null
    let imagePath = undefined // Jika tidak ada upload baru, biarkan tetap yang lama

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Optimasi Gambar dengan Sharp
        const optimizedBuffer = await sharp(buffer)
          .resize(1000, 1000, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 80 })
          .toBuffer()

        const fileName = `${crypto.randomUUID()}.webp`
        
        const uploadDir = join(process.cwd(), "public", "uploads", "products")
        await mkdir(uploadDir, { recursive: true })
        
        const filePath = join(uploadDir, fileName)
        await writeFile(filePath, optimizedBuffer)
        
        imagePath = `/uploads/products/${fileName}`

        // Opsional: Hapus foto lama jika ada
        const oldProduct = await prisma.product.findUnique({ where: { id }, select: { image: true } })
        if (oldProduct?.image) {
          const oldPath = join(process.cwd(), "public", oldProduct.image)
          await unlink(oldPath).catch(() => {}) // Abaikan jika gagal hapus (misal file tidak ada)
        }
      } catch (err) {
        console.error("Gagal optimasi & upload file:", err)
      }
    }

    if (!id || !name || !sku || isNaN(price)) {
      return { success: false, error: "Semua kolom wajib diisi dengan format yang benar." }
    }

    // Periksa apakah SKU sudah digunakan oleh produk lain
    const existing = await prisma.product.findUnique({
      where: { sku }
    })
    
    if (existing && existing.id !== id) {
      return { success: false, error: "SKU / Kode Barang ini sudah terpakai." }
    }

    await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        price,
        ...(imagePath !== undefined && { image: imagePath }),
        categoryId: categoryId === "" ? null : categoryId,
      }
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/checkout")

    return { success: true }
  } catch (error) {
    console.error("Gagal mengubah produk:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function deleteProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const id = formData.get("id") as string
    if (!id) return { success: false, error: "ID Produk tidak ditemukan." }

    await prisma.product.delete({
      where: { id }
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/checkout")

    return { success: true }
  } catch (error) {
    console.error("Gagal menghapus produk:", error)
    return { success: false, error: "Gagal menghapus. Pastikan produk tidak terikat data penjualan." }
  }
}
