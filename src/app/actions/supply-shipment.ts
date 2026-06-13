"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"

export async function createSupplyShipment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return { success: false, error: "Akses Ditolak" }

    const productId = formData.get("productId") as string
    const quantity = parseInt(formData.get("quantity") as string)
    const costPriceRaw = formData.get("costPrice") as string
    const costPrice = costPriceRaw ? parseFloat(costPriceRaw) : null
    const notes = formData.get("notes") as string
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER"

    let supplierId = session.user.id
    if (isAdmin) {
      const selectedSupplierId = formData.get("supplierId") as string
      if (selectedSupplierId) supplierId = selectedSupplierId
    }

    if (!productId || isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "Data pengiriman tidak valid." }
    }

    await prisma.supplyShipment.create({
      data: { productId, supplierId, quantity, costPrice, notes, status: "PENDING" }
    })

    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true }
  } catch (error) {
    console.error("Gagal buat SupplyShipment:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

// ─── Bulk create: multiple items in one purchase receipt ──────────────────────

export interface BulkShipmentItem {
  productId: string
  quantity: number
  costPrice: number | null
}

export async function createBulkSupplyShipment(payload: {
  supplierId: string
  notes: string
  items: BulkShipmentItem[]
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return { success: false, error: "Akses Ditolak" }

    const { supplierId, notes, items } = payload

    if (!supplierId) return { success: false, error: "Supplier wajib dipilih." }
    if (!items || items.length === 0) return { success: false, error: "Tambahkan minimal 1 produk." }

    for (const item of items) {
      if (!item.productId || isNaN(item.quantity) || item.quantity <= 0) {
        return { success: false, error: "Semua produk harus memiliki jumlah yang valid." }
      }
    }

    await prisma.supplyShipment.createMany({
      data: items.map(item => ({
        productId: item.productId,
        supplierId,
        quantity: item.quantity,
        costPrice: item.costPrice,
        notes: notes || null,
        status: "PENDING",
      }))
    })

    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true, count: items.length }
  } catch (error) {
    console.error("Gagal buat Bulk SupplyShipment:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

// ─── Quick create supplier ────────────────────────────────────────────────────

export async function createQuickSupplier(name: string, phone?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    if (!name || name.trim() === "") {
      return { success: false, error: "Nama supplier tidak boleh kosong." }
    }

    if (phone && phone.trim()) {
      const byPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } })
      if (byPhone) return { success: false, error: "Nomor HP sudah terdaftar." }
    }

    const supplier = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone?.trim() || null,
        role: "SUPPLIER",
      },
      select: { id: true, name: true, phone: true }
    })

    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true, supplier }
  } catch (error) {
    console.error("Gagal buat supplier cepat:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

// ─── Quick create product ─────────────────────────────────────────────────────

export async function createQuickProduct(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const name = formData.get("name") as string
    const sku = formData.get("sku") as string
    const price = parseFloat(formData.get("price") as string)
    const costPriceRaw = formData.get("costPrice") as string
    const costPrice = costPriceRaw ? parseFloat(costPriceRaw) : null

    if (!name || !sku || isNaN(price)) {
      return { success: false, error: "Nama, SKU, dan harga jual wajib diisi." }
    }

    // Proses File Upload
    const imageFile = formData.get("image") as File | null
    let imagePath = null

    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      try {
        const bytes = await imageFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

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
      } catch (err) {
        console.error("Gagal optimasi & upload file:", err)
      }
    }

    const existing = await prisma.product.findUnique({ where: { sku } })
    if (existing) return { success: false, error: `SKU "${sku}" sudah terdaftar.` }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        price,
        costPrice: costPrice ?? null,
        stock: 0,
        image: imagePath,
        updatedById: session.user.id,
      },
      select: { id: true, name: true, sku: true, price: true, costPrice: true, stock: true, image: true }
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/checkout")
    
    // Serialisasi Decimal ke Number
    const serializedProduct = {
      ...product,
      price: Number(product.price),
      costPrice: product.costPrice != null ? Number(product.costPrice) : null,
    }

    return { success: true, product: serializedProduct }
  } catch (error) {
    console.error("Gagal buat produk cepat:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

// ─── Approve / Reject ─────────────────────────────────────────────────────────

export async function approveSupplyShipment(shipmentId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Hanya Admin/Manajer yang bisa memvalidasi." }
    }

    await prisma.$transaction(async (tx) => {
      const shipment = await tx.supplyShipment.findUnique({
        where: { id: shipmentId },
        include: { product: true }
      })

      if (!shipment || shipment.status !== "PENDING") {
        throw new Error(`Pengiriman tidak ditemukan atau sudah diproses.`)
      }

      await tx.supplyShipment.update({
        where: { id: shipmentId },
        data: { status: "APPROVED", adminId: session.user.id }
      })

      await tx.product.update({
        where: { id: shipment.productId },
        data: {
          stock: { increment: shipment.quantity },
          ...(shipment.costPrice != null && { costPrice: shipment.costPrice }),
        }
      })

      await tx.inventoryTransaction.create({
        data: {
          productId: shipment.productId,
          type: "IN",
          quantity: shipment.quantity,
          notes: `Validasi Supply Shipment: ${shipment.notes || '-'} (ID: ${shipment.id})`,
          userId: session.user.id
        }
      })
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true }
  } catch (error: any) {
    console.error("Gagal approve SupplyShipment:", error)
    return { success: false, error: error.message || "Terjadi kesalahan saat validasi." }
  }
}

export async function approveBulkSupplyShipments(shipmentIds: string[]) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Hanya Admin/Manajer yang bisa memvalidasi." }
    }

    if (!shipmentIds || shipmentIds.length === 0) return { success: false, error: "Tidak ada data untuk divalidasi." }

    await prisma.$transaction(async (tx) => {
      for (const shipmentId of shipmentIds) {
        const shipment = await tx.supplyShipment.findUnique({
          where: { id: shipmentId },
          include: { product: true }
        })

        if (!shipment || shipment.status !== "PENDING") continue;

        await tx.supplyShipment.update({
          where: { id: shipmentId },
          data: { status: "APPROVED", adminId: session.user.id }
        })

        await tx.product.update({
          where: { id: shipment.productId },
          data: {
            stock: { increment: shipment.quantity },
            ...(shipment.costPrice != null && { costPrice: shipment.costPrice }),
          }
        })

        await tx.inventoryTransaction.create({
          data: {
            productId: shipment.productId,
            type: "IN",
            quantity: shipment.quantity,
            notes: `Validasi Supply Shipment: ${shipment.notes || '-'} (ID: ${shipment.id})`,
            userId: session.user.id
          }
        })
      }
    }, {
      timeout: 20000 // allow up to 20 seconds for bulk operations
    })

    revalidatePath("/dashboard/products")
    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true, count: shipmentIds.length }
  } catch (error: any) {
    console.error("Gagal approve bulk SupplyShipment:", error)
    return { success: false, error: error.message || "Terjadi kesalahan saat validasi." }
  }
}

export async function rejectSupplyShipment(shipmentId: string, reason: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    await prisma.supplyShipment.update({
      where: { id: shipmentId },
      data: {
        status: "REJECTED",
        adminId: session.user.id,
        notes: reason ? `Ditolak: ${reason}` : undefined
      }
    })

    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true }
  } catch (error) {
    console.error("Gagal reject SupplyShipment:", error)
    return { success: false, error: "Gagal memproses penolakan." }
  }
}
