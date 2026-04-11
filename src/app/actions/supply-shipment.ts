"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createSupplyShipment(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) return { success: false, error: "Akses Ditolak" }

    const productId = formData.get("productId") as string
    const quantity = parseInt(formData.get("quantity") as string)
    const notes = formData.get("notes") as string

    if (!productId || isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "Data pengiriman tidak valid." }
    }

    await prisma.supplyShipment.create({
      data: {
        productId,
        supplierId: session.user.id,
        quantity,
        notes,
        status: "PENDING",
      }
    })

    revalidatePath("/dashboard/inventory/supply-shipments")
    return { success: true }
  } catch (error) {
    console.error("Gagal buat SupplyShipment:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

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
        throw new Error("Pengiriman tidak ditemukan atau sudah diproses.")
      }

      // 1. Update status shipment
      await tx.supplyShipment.update({
        where: { id: shipmentId },
        data: {
          status: "APPROVED",
          adminId: session.user.id
        }
      })

      // 2. Tambah stok produk
      await tx.product.update({
        where: { id: shipment.productId },
        data: {
          stock: { increment: shipment.quantity }
        }
      })

      // 3. Catat transaksi inventori
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
