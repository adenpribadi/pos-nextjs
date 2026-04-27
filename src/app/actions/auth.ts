"use server"

import prisma from "@/lib/db"
import bcrypt from "bcrypt"

export async function registerCustomer(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string | null
    const phone = formData.get("phone") as string
    const password = formData.get("password") as string

    if (!name || !phone || !password) {
      return { success: false, error: "Nama, Nomor HP, dan Password wajib diisi." }
    }

    if (password.length < 6) {
      return { success: false, error: "Password minimal 6 karakter." }
    }

    // Cek apakah nomor HP sudah terdaftar
    const existingUserByPhone = await prisma.user.findUnique({
      where: { phone }
    })

    if (existingUserByPhone) {
      return { success: false, error: "Nomor HP ini sudah terdaftar." }
    }

    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUserByEmail) {
        return { success: false, error: "Email ini sudah terdaftar." }
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Gunakan transaction untuk memastikan integritas
    await prisma.$transaction(async (tx) => {
      // Buat entitas User untuk login
      const user = await tx.user.create({
        data: {
          name,
          email: email || undefined,
          phone,
          password: hashedPassword,
          role: "CUSTOMER", // Berikan role pelanggan
        }
      })

      // Buat entitas Customer di Master Data dan ikat email yang sama
      // Ini berguna agar transaksi API Sales bisa lookup berdasarkan User ID atau Customer Email
      await tx.customer.create({
        data: {
          name,
          email: email || undefined,
          phone,
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error("Gagal registrasi pelanggan:", error)
    return { success: false, error: "Terjadi kesalahan internal saat mendaftar." }
  }
}
