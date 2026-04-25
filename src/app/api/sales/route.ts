import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = session.user.role

    const body = await request.json()
    const { items, taxAmount, totalAmount, discount, paymentMethod, customerId: bodyCustomerId, notes, promoId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 })
    }

    // Jika user adalah CUSTOMER, auto-detect; jika kasir, gunakan customerId dari body
    let customerId: string | null = bodyCustomerId || null
    if (userRole === "CUSTOMER" && !customerId) {
      const customer = await prisma.customer.findFirst({
        where: { email: session.user.email || "" }
      })
      customerId = customer?.id || null
    }

    // Gunakan Prisma Interactive Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Receipt Number MMDDYY-RANDOM
      const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "")
      const randomPart = Math.floor(1000 + Math.random() * 9000)
      const receiptNumber = `POS-${datePart}-${randomPart}`

      // 2. Prepare inventory check & updates
      let calculatedTotal = 0

      for (const item of items) {
        // Cek stok terbaru secara real-time sebelum memotong
        const product = await tx.product.findUnique({
          where: { id: item.productId }
        })

        if (!product) {
          throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`)
        }

        if (product.trackStock && product.stock < item.quantity) {
          throw new Error(`Stok tidak mencukupi untuk ${product.name}. Tersisa: ${product.stock}`)
        }

        // Potong stok
        if (product.trackStock) {
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity }
          })
        }

        // Catat di InventoryTransaction
        await tx.inventoryTransaction.create({
          data: {
            productId: product.id,
            type: "SALE",
            quantity: -item.quantity,
            notes: `Penjualan dari No Struk: ${receiptNumber}`,
            userId: userId,
          }
        })

        const itemTotal = (item.price - item.discount) * item.quantity
        calculatedTotal += itemTotal
      }

      // 3. Buat entity Sale
      const sale = await tx.sale.create({
        data: {
          receiptNumber,
          totalAmount: totalAmount,
          taxAmount: taxAmount,
          discount: discount,
          status: userRole === "CUSTOMER" ? "PENDING" : "PAID", // Customer self-checkout stays PENDING until payment confirmation
          paymentMethod: paymentMethod,
          userId: userId,
          customerId: customerId,
          promoId: promoId || null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              discount: item.discount,
              total: (item.price - item.discount) * item.quantity,
            }))
          }
        }
      })

      // 4. Update Promo usage count if any
      if (promoId) {
        await tx.promo.update({
          where: { id: promoId },
          data: { usageCount: { increment: 1 } }
        })
      }

      return sale
    })

    return NextResponse.json({ success: true, sale: result }, { status: 201 })
  } catch (error: any) {
    console.error("Kesalahan saat checkout:", error)
    return NextResponse.json({ error: error.message || "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
