"use server" // This is a server action file, but we use "use server" at top level usually. Wait, I should use "use server".

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

/**
 * Fetch all pending sales for order queue
 */
export async function getPendingSales() {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        customer: true,
        user: true,
        promo: true, // Sertakan info promo
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })
    return sales
  } catch (error) {
    console.error("Error fetching pending sales:", error)
    return []
  }
}

/**
 * Get count of pending sales for sidebar badge
 */
export async function getPendingSalesCount() {
  try {
    const count = await prisma.sale.count({
      where: {
        status: "PENDING"
      }
    })
    return count
  } catch (error) {
    return 0
  }
}

/**
 * Confirm payment for a pending sale
 */
export async function confirmSalePayment(saleId: string) {
  try {
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: "PAID",
        updatedAt: new Date()
      }
    })
    
    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard/reports")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return { success: false, error: "Gagal mengonfirmasi pembayaran." }
  }
}

/**
 * Cancel/Delete a pending sale
 */
export async function cancelSale(saleId: string) {
  try {
    // Before deleting, we should ideally RESTORE stock because it was deducted at checkout
    // But in our current api/sales/route.ts, stock is deducted immediately.
    // So cancellation must RESTORE stock.
    
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true }
    })
    
    if (!sale) throw new Error("Pesanan tidak ditemukan.")
    
    await prisma.$transaction(async (tx) => {
      // Restore stock for each item
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
        
        // Log the restoration
        await tx.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: "IN", // Restoration of stock after cancellation
            quantity: item.quantity,
            notes: `Restock dari pembatalan order: ${sale.receiptNumber}`,
            userId: sale.userId,
          }
        })
      }
      
      // Finally delete or set to CANCELLED
      await tx.sale.update({
        where: { id: saleId },
        data: { status: "CANCELLED" }
      })
    })
    
    revalidatePath("/dashboard/orders")
    return { success: true }
  } catch (error) {
    console.error("Error cancelling sale:", error)
    return { success: false, error: "Gagal membatalkan pesanan." }
  }
}
