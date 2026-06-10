"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

export async function getExpenses() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Unauthorized" }

  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
        user: { select: { id: true, name: true, role: true } },
        admin: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    })
    return { data: expenses }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function getExpenseCategories() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Unauthorized" }

  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    })
    return { data: categories }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function createExpenseCategory(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Unauthorized" }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  try {
    const category = await prisma.expenseCategory.create({
      data: { name, description },
    })
    revalidatePath("/dashboard/expenses")
    return { success: true, data: category }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function createExpense(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Unauthorized" }

  const amountStr = formData.get("amount") as string
  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount <= 0) return { error: "Jumlah tidak valid" }

  const description = formData.get("description") as string
  const categoryId = formData.get("categoryId") as string
  const dateStr = formData.get("date") as string
  const date = dateStr ? new Date(dateStr) : new Date()

  // Handle receipt image upload
  let receiptImage = null
  const file = formData.get("receiptImage") as File | null
  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const uploadDir = join(process.cwd(), "public", "uploads", "expenses")
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (e) {
        // Directory might exist
      }
      
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const path = join(uploadDir, filename)
      await writeFile(path, buffer)
      receiptImage = `/uploads/expenses/${filename}`
    } catch (e) {
      console.error("Failed to upload image:", e)
      return { error: "Gagal mengupload gambar struk" }
    }
  }

  // Jika yang membuat adalah ADMIN/MANAGER, status bisa langsung APPROVED
  const isAdmin = ["ADMIN", "MANAGER"].includes(session.user.role as string)
  const status = isAdmin ? "APPROVED" : "PENDING"
  const adminId = isAdmin ? session.user.id : null

  try {
    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        date,
        categoryId: categoryId || null,
        receiptImage,
        status,
        userId: session.user.id,
        adminId,
      },
    })
    
    revalidatePath("/dashboard/expenses")
    revalidatePath("/dashboard")
    return { success: true, data: expense }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function updateExpenseStatus(id: string, status: "APPROVED" | "REJECTED") {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        status,
        adminId: session.user.id,
      },
    })
    revalidatePath("/dashboard/expenses")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: (error as Error).message }
  }
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.expense.delete({
      where: { id },
    })
    revalidatePath("/dashboard/expenses")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    return { error: (error as Error).message }
  }
}
