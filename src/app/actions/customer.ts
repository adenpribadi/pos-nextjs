"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createCustomer(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    if (!name) {
      return { success: false, error: "Nama pelanggan wajib diisi." }
    }

    await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      }
    })

    revalidatePath("/dashboard/customers")

    return { success: true }
  } catch (error) {
    console.error("Gagal menambah pelanggan:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function updateCustomer(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    if (!id || !name) {
      return { success: false, error: "ID dan Nama pelanggan wajib diisi." }
    }

    await prisma.customer.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
      }
    })

    revalidatePath("/dashboard/customers")

    return { success: true }
  } catch (error) {
    console.error("Gagal mengubah pelanggan:", error)
    return { success: false, error: "Terjadi kesalahan internal server." }
  }
}

export async function deleteCustomer(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { success: false, error: "Akses Ditolak" }
    }

    const id = formData.get("id") as string
    if (!id) return { success: false, error: "ID Pelanggan tidak ditemukan." }

    await prisma.customer.delete({
      where: { id }
    })

    revalidatePath("/dashboard/customers")

    return { success: true }
  } catch (error) {
    console.error("Gagal menghapus pelanggan:", error)
    return { success: false, error: "Gagal menghapus. Pastikan pelanggan ini tidak terikat data penjualan." }
  }
}
