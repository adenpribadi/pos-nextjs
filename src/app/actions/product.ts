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
    const costPrice = formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string || null
    const variantsRaw = formData.get("variants") as string | null
    
    // Parse varian jika ada
    let variants: { name: string; price: number; sortOrder: number }[] = []
    if (variantsRaw) {
      try {
        variants = JSON.parse(variantsRaw)
      } catch {
        // Abaikan jika JSON tidak valid
      }
    }
    
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
          costPrice,
          stock,
          image: imagePath,
          categoryId: categoryId === "" ? null : categoryId,
          updatedById: session.user.id,
        }
      })

      // Buat varian jika ada
      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v, i) => ({
            productId: product.id,
            name: v.name,
            price: v.price,
            sortOrder: v.sortOrder ?? i,
          }))
        })
      }

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
    const costPrice = formData.get("costPrice") ? parseFloat(formData.get("costPrice") as string) : null
    const categoryId = formData.get("categoryId") as string || null
    const variantsRaw = formData.get("variants") as string | null

    // Parse varian yang dikirim dari form
    let incomingVariants: { id?: string; name: string; price: number; sortOrder: number }[] = []
    if (variantsRaw) {
      try {
        incomingVariants = JSON.parse(variantsRaw)
      } catch {
        // Abaikan jika JSON tidak valid
      }
    }

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

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name,
          sku,
          price,
          costPrice,
          ...(imagePath !== undefined && { image: imagePath }),
          categoryId: categoryId === "" ? null : categoryId,
          updatedById: session.user.id,
        }
      })

      // Sinkronisasi varian:
      // 1. Ambil varian yang ada saat ini
      const existingVariants = await tx.productVariant.findMany({ where: { productId: id } })
      const existingIds = new Set(existingVariants.map(v => v.id))
      const incomingIds = new Set(incomingVariants.filter(v => v.id).map(v => v.id!))

      // 2. Hapus varian yang tidak ada di incoming
      const toDelete = [...existingIds].filter(vid => !incomingIds.has(vid))
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } })
      }

      // 3. Update atau buat varian
      for (const [i, v] of incomingVariants.entries()) {
        if (v.id && existingIds.has(v.id)) {
          // Update existing
          await tx.productVariant.update({
            where: { id: v.id },
            data: { name: v.name, price: v.price, sortOrder: v.sortOrder ?? i }
          })
        } else {
          // Create new
          await tx.productVariant.create({
            data: { productId: id, name: v.name, price: v.price, sortOrder: v.sortOrder ?? i }
          })
        }
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

export async function searchProducts(query: string) {
  if (!query || query.length < 2) return []

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } }
        ]
      },
      take: 5,
      include: {
        category: true
      }
    })
    return products.map(p => ({
      ...p,
      price: Number(p.price),
      costPrice: p.costPrice ? Number(p.costPrice) : null,
    }))
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}

export async function getCheckoutProducts(options: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string | null
}) {
  try {
    const page = options.page || 1
    const limit = options.limit || 20
    const search = options.search || ""
    const categoryId = options.categoryId || null

    const skip = (page - 1) * limit

    const whereClause: any = {
      stock: {
        gt: 0
      }
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    if (search.trim() !== "") {
      const q = search.trim()
      whereClause.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { barcode: { contains: q } }
      ]
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        variants: {
          orderBy: { sortOrder: "asc" }
        },
      },
      orderBy: {
        name: "asc"
      },
      skip,
      take: limit + 1
    })

    const hasMore = products.length > limit
    const pageProducts = products.slice(0, limit).map(p => ({
      ...p,
      price: Number(p.price),
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      variants: p.variants.map(v => ({ ...v, price: Number(v.price) }))
    }))

    return {
      success: true,
      products: pageProducts,
      hasMore
    }
  } catch (error) {
    console.error("Gagal mengambil produk checkout:", error)
    return {
      success: false,
      products: [],
      hasMore: false,
      error: "Gagal memuat produk"
    }
  }
}

export async function createCategory(name: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    if (!name || name.trim() === "") {
      return { success: false, error: "Nama kategori tidak boleh kosong" }
    }

    const trimmedName = name.trim()

    // Check existing
    const existing = await prisma.category.findUnique({
      where: { name: trimmedName }
    })

    if (existing) {
      return { success: true, category: existing }
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
      }
    })

    revalidatePath("/dashboard/products")
    return { success: true, category }
  } catch (error) {
    console.error("Gagal menambah kategori:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function adjustProductStock(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const productId = formData.get("productId") as string
    const type = formData.get("type") as string // "in" | "out" | "set"
    const value = parseInt(formData.get("value") as string)
    const notes = formData.get("notes") as string || "Penyesuaian stok manual"

    if (!productId || !type || isNaN(value)) {
      return { success: false, error: "Data penyesuaian stok tidak valid." }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." }
    }

    let delta = 0
    if (type === "in") {
      delta = value
    } else if (type === "out") {
      delta = -value
    } else if (type === "set") {
      delta = value - product.stock
    } else {
      return { success: false, error: "Tipe penyesuaian tidak dikenal." }
    }

    const newStock = product.stock + delta
    if (newStock < 0) {
      return { success: false, error: "Transaksi dibatalkan. Stok akhir tidak boleh kurang dari 0." }
    }

    if (delta !== 0) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: {
            stock: newStock,
            updatedById: session.user.id,
          }
        })

        await tx.inventoryTransaction.create({
          data: {
            productId,
            type: "ADJUSTMENT",
            quantity: delta,
            notes,
            userId: session.user.id
          }
        })
      })
    }

    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/inventory")
    return { success: true, newStock }
  } catch (error) {
    console.error("Gagal menyesuaikan stok:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function submitStockOpname(data: { productId: string, actualStock: number, systemStock: number }[], notes: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Data stock opname kosong." }
    }

    let adjustmentCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const item of data) {
        const delta = item.actualStock - item.systemStock;

        if (delta !== 0) {
          // Update product stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: item.actualStock,
              updatedById: session.user.id,
            }
          });

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              type: "ADJUSTMENT",
              quantity: delta,
              notes: notes || "Hasil Stock Opname",
              userId: session.user.id
            }
          });
          
          adjustmentCount++;
        }
      }
    });

    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/inventory")
    return { success: true, adjustmentCount }
  } catch (error) {
    console.error("Gagal menyimpan hasil stock opname:", error)
    return { success: false, error: "Terjadi kesalahan saat menyimpan hasil stock opname." }
  }
}

