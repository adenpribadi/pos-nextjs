"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { PromoType } from "@prisma/client"

export async function getPromos() {
  return await prisma.promo.findMany({
    orderBy: { createdAt: "desc" },
  })
}

export async function createPromo(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { success: false, error: "Tidak diizinkan" }
  }

  const code = (formData.get("code") as string).toUpperCase()
  const description = formData.get("description") as string
  const type = formData.get("type") as PromoType
  const value = parseFloat(formData.get("value") as string)
  const minPurchase = parseFloat(formData.get("minPurchase") as string) || 0
  const maxDiscount = formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount") as string) : null
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null
  const limitPerCustomer = formData.get("limitPerCustomer") ? parseInt(formData.get("limitPerCustomer") as string) : null
  const isActive = formData.get("isActive") === "true"
  
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const startDate = startDateStr ? new Date(startDateStr) : null
  const endDate = endDateStr ? new Date(endDateStr) : null

  try {
    const promo = await prisma.promo.create({
      data: {
        code,
        description,
        type,
        value,
        minPurchase,
        maxDiscount,
        usageLimit,
        limitPerCustomer,
        isActive,
        startDate,
        endDate
      }
    })
    revalidatePath("/dashboard/promos")
    return { success: true, data: promo }
  } catch (err) {
    return { success: false, error: "Kode promo sudah digunakan atau terjadi kesalahan." }
  }
}

export async function updatePromo(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { success: false, error: "Tidak diizinkan" }
  }

  const code = (formData.get("code") as string).toUpperCase()
  const description = formData.get("description") as string
  const type = formData.get("type") as PromoType
  const value = parseFloat(formData.get("value") as string)
  const minPurchase = parseFloat(formData.get("minPurchase") as string) || 0
  const maxDiscount = formData.get("maxDiscount") ? parseFloat(formData.get("maxDiscount") as string) : null
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null
  const limitPerCustomer = formData.get("limitPerCustomer") ? parseInt(formData.get("limitPerCustomer") as string) : null
  const isActive = formData.get("isActive") === "true"
  
  const startDateStr = formData.get("startDate") as string
  const endDateStr = formData.get("endDate") as string
  const startDate = startDateStr ? new Date(startDateStr) : null
  const endDate = endDateStr ? new Date(endDateStr) : null

  try {
    await prisma.promo.update({
      where: { id },
      data: {
        code,
        description,
        type,
        value,
        minPurchase,
        maxDiscount,
        usageLimit,
        limitPerCustomer,
        isActive,
        startDate,
        endDate
      }
    })
    revalidatePath("/dashboard/promos")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Terjadi kesalahan saat memperbarui promo." }
  }
}

export async function deletePromo(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { success: false, error: "Tidak diizinkan" }
  }

  try {
    await prisma.promo.delete({ where: { id } })
    revalidatePath("/dashboard/promos")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Gagal menghapus promo." }
  }
}

export async function validatePromoCode(code: string, currentTotal: number, customerId?: string | null) {
  const promo = await prisma.promo.findUnique({
    where: { code: code.toUpperCase(), isActive: true }
  })

  if (!promo) return { success: false, error: "Kode promo tidak valid atau sudah tidak aktif." }

  const now = new Date()
  if (promo.startDate && now < promo.startDate) return { success: false, error: "Promo belum dimulai." }
  if (promo.endDate && now > promo.endDate) return { success: false, error: "Promo sudah berakhir." }
  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) return { success: false, error: "Limit pemakaian promo sudah habis secara keseluruhan." }
  
  // Deteksi customerId dari session jika tidak diberikan (untuk sisi shop/customer)
  let finalCustomerId = customerId
  if (!finalCustomerId) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role === "CUSTOMER") {
      const customer = await prisma.customer.findFirst({
        where: { email: session.user.email || "" }
      })
      finalCustomerId = customer?.id
    }
  }

  // Check limit per customer
  if (promo.limitPerCustomer !== null && finalCustomerId) {
    const customerUsageCount = await prisma.sale.count({
      where: {
        promoId: promo.id,
        customerId: finalCustomerId,
        status: { in: ["PAID", "PENDING"] }
      }
    })
    
    if (customerUsageCount >= promo.limitPerCustomer) {
      return { 
        success: false, 
        error: promo.limitPerCustomer === 1 
          ? "Anda sudah pernah menggunakan kode promo ini." 
          : `Anda sudah mencapai batas penggunaan (${promo.limitPerCustomer}x) untuk promo ini.` 
      }
    }
  }
  
  if (currentTotal < Number(promo.minPurchase)) {
    return { 
      success: false, 
      error: `Minimal belanja Rp ${Number(promo.minPurchase).toLocaleString("id-ID")} untuk menggunakan promo ini.` 
    }
  }

  let discountAmount = 0
  if (promo.type === "PERCENTAGE") {
    discountAmount = (currentTotal * Number(promo.value)) / 100
    if (promo.maxDiscount && discountAmount > Number(promo.maxDiscount)) {
      discountAmount = Number(promo.maxDiscount)
    }
  } else {
    discountAmount = Number(promo.value)
  }

  return {
    success: true,
    data: {
      id: promo.id,
      code: promo.code,
      type: promo.type,
      value: Number(promo.value),
      discountAmount
    }
  }
}

export async function getPromoUsage(promoId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { success: false, error: "Tidak diizinkan" }
  }

  try {
    const sales = await prisma.sale.findMany({
      where: { promoId },
      include: {
        customer: { select: { name: true, email: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    })

    return { 
      success: true, 
      data: sales.map(s => ({
        id: s.id,
        receiptNumber: s.receiptNumber,
        customerName: s.customer?.name || "Pelanggan Umum",
        cashierName: s.user.name,
        totalAmount: Number(s.totalAmount),
        discount: Number(s.discount),
        createdAt: s.createdAt.toISOString()
      }))
    }
  } catch (err) {
    return { success: false, error: "Gagal mengambil data penggunaan." }
  }
}
