import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, phone: true, email: true },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(customers)
}
