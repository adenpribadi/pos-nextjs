"use server"

import prisma from "@/lib/db"
import bcrypt from "bcrypt"

export async function registerCustomer(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
      return { success: false, error: "Semua kolom wajib diisi." }
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." }
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: "Email ini sudah terdaftar." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Gunakan transaction untuk memastikan integritas
    await prisma.$transaction(async (tx) => {
      // Buat entitas User untuk login
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "CUSTOMER", // Berikan role pelanggan
        }
      })

      // Buat entitas Customer di Master Data dan ikat email yang sama
      // Ini berguna agar transaksi API Sales bisa lookup berdasarkan User ID atau Customer Email
      await tx.customer.create({
        data: {
          name,
          email,
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error("Gagal registrasi pelanggan:", error)
    return { success: false, error: "Terjadi kesalahan internal saat mendaftar." }
  }
}
