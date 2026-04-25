import prisma from "@/lib/db"
import { ReportsClient } from "./reports-client"

export const dynamic = "force-dynamic"

export default async function ReportsPage() {
  // Fetch detailed sales history
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true
        }
      }
    }
  })

  // Format data for the client
  const formattedSales = sales.map(s => {
    const totalHpp = s.items.reduce((sum, item) => sum + (Number(item.product.costPrice || 0) * item.quantity), 0)
    const profit = Number(s.totalAmount) - totalHpp

    return {
      id: s.id,
      receiptNumber: s.receiptNumber,
      date: s.createdAt.toISOString(),
      amount: Number(s.totalAmount),
      tax: Number(s.taxAmount),
      discount: Number(s.discount),
      paymentMethod: s.paymentMethod !== null ? s.paymentMethod : "-",
      cashierName: s.user?.name || "-",
      itemsCount: s.items.length,
      totalHpp,
      profit,
      itemsDetail: s.items.map(i => ({
        name: i.product.name,
        qty: i.quantity,
        price: Number(i.price),
        costPrice: Number(i.product.costPrice || 0),
        total: Number(i.total)
      }))
    }
  })

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Penjualan</h2>
          <p className="text-muted-foreground mt-1">
            Data rekam jejak transaksi finansial yang diproses melalui sistem WarungBintang.
          </p>
        </div>
      </div>
      
      <ReportsClient data={formattedSales} />
    </div>
  )
}
