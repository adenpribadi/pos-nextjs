"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function submitReview(saleId: string, rating: number, comment: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, error: "Tidak terautentikasi" }

  // Verifikasi order milik customer ini
  const customer = await prisma.customer.findFirst({
    where: { email: session.user.email || "" }
  })
  if (!customer) return { success: false, error: "Data pelanggan tidak ditemukan" }

  const sale = await prisma.sale.findFirst({
    where: { id: saleId, customerId: customer.id }
  })
  if (!sale) return { success: false, error: "Pesanan tidak ditemukan" }

  if (rating < 1 || rating > 5) return { success: false, error: "Rating tidak valid" }

  try {
    await prisma.review.upsert({
      where: { saleId },
      update: { rating, comment: comment.trim() || null },
      create: { saleId, customerId: customer.id, rating, comment: comment.trim() || null },
    })

    revalidatePath("/store/orders")
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
