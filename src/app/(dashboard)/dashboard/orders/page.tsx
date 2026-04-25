import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPendingSales } from "@/app/actions/sale"
import { OrdersClient } from "./orders-client"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER" && session.user.role !== "CASHIER")) {
    redirect("/dashboard")
  }

  const pendingSales = await getPendingSales()

  // Format data for client component
  const formattedSales = pendingSales.map(sale => ({
    id: sale.id,
    receiptNumber: sale.receiptNumber,
    customerName: sale.customer?.name || "Pelanggan Umum",
    date: sale.createdAt.toISOString(),
    total: Number(sale.totalAmount),
    discount: Number(sale.discount),
    promoCode: sale.promo?.code || null,
    promoDescription: sale.promo?.description || null,
    itemsCount: sale.items.length,
    paymentMethod: sale.paymentMethod,
    items: sale.items.map(item => ({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.price),
      total: Number(item.total)
    }))
  }))

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Antrean Pesanan</h2>
          <p className="text-muted-foreground mt-1">
            Kelola dan konfirmasi pembayaran pesanan yang masuk dari pelanggan.
          </p>
        </div>
      </div>
      
      <OrdersClient initialData={formattedSales as any} />
    </div>
  )
}
