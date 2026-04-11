"use server"

import prisma from "@/lib/db"
import bcrypt from "bcrypt"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"

export async function getUsers() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Akses Ditolak")
    }

    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("Gagal ambil user:", error)
    return []
  }
}

export async function createUser(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Hanya Admin yang bisa membuat user." }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as Role

    if (!name || !email || !password || !role) {
      return { success: false, error: "Semua kolom wajib diisi." }
    }

    // Cek duplikasi email
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { success: false, error: "Email sudah digunakan." }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Gagal buat user:", error)
    return { success: false, error: "Terjadi kesalahan internal." }
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses Ditolak" }
    }

    if (session.user.id === id) {
      return { success: false, error: "Anda tidak bisa menghapus akun Anda sendiri." }
    }

    await prisma.user.delete({ where: { id } })
    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Gagal hapus user:", error)
    return { success: false, error: "Gagal menghapus user." }
  }
}

export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Akses Ditolak" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error("Gagal reset password:", error)
    return { success: false, error: "Gagal mereset password." }
  }
}
