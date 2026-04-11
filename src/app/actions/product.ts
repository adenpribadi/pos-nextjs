"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
