"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const SETTINGS_ID = "singleton"

export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    return {
      id: SETTINGS_ID,
      storeName: "WarungBintang",
      address: "",
      phone: "",
      taxEnabled: true,
      taxRate: 0.11,
      currency: "IDR",
      bankName: "",
      bankAccountNumber: "",
      bankAccountName: "",
    }
  }

  return settings
}

export async function saveStoreSettings(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    return { success: false, error: "Tidak diizinkan" }
  }

  const storeName = formData.get("storeName") as string
  const address = formData.get("address") as string
  const phone = formData.get("phone") as string
  const taxEnabled = formData.get("taxEnabled") === "true"
  const taxRateRaw = parseFloat(formData.get("taxRate") as string)
  const taxRate = isNaN(taxRateRaw) ? 0.11 : taxRateRaw / 100
  const bankName = (formData.get("bankName") as string) || null
  const bankAccountNumber = (formData.get("bankAccountNumber") as string) || null
  const bankAccountName = (formData.get("bankAccountName") as string) || null

  try {
    await prisma.storeSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { storeName, address, phone, taxEnabled, taxRate, bankName, bankAccountNumber, bankAccountName },
      create: { id: SETTINGS_ID, storeName, address, phone, taxEnabled, taxRate, bankName, bankAccountNumber, bankAccountName },
    })

    revalidatePath("/dashboard/settings")
    revalidatePath("/store")
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
