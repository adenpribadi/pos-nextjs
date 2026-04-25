import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPromos } from "@/app/actions/promo"
import { PromosClient } from "./_components/promos-client"

export const dynamic = "force-dynamic"

export default async function PromosPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
    redirect("/dashboard")
  }

  const promos = await getPromos()

  // Serialize Decimal and Date for Client Component
  const serializedPromos = promos.map(p => ({
    ...p,
    value: Number(p.value),
    minPurchase: Number(p.minPurchase),
    maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : null,
    startDate: p.startDate ? p.startDate.toISOString() : null,
    endDate: p.endDate ? p.endDate.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Promo</h2>
          <p className="text-muted-foreground mt-1">
            Kelola kode promo, diskon, dan batasan penggunaan untuk meningkatkan penjualan.
          </p>
        </div>
      </div>
      
      <PromosClient initialData={serializedPromos as any} />
    </div>
  )
}
