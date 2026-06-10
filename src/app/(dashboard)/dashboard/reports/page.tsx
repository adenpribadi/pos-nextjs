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
  // Fetch approved expenses
  const expenses = await prisma.expense.findMany({
    where: { status: "APPROVED" },
    include: { category: true }
  })

  // Format data for the client
  const formattedSales = sales.map(s => {
    // Gunakan costPrice dari SaleItem (snapshot saat transaksi) untuk akurasi.
    // Jika null (data lama sebelum migrasi), fallback ke costPrice produk saat ini.
    const totalHpp = s.items.reduce((sum, item) => {
      const hpp = item.costPrice != null
        ? Number(item.costPrice)
        : Number(item.product.costPrice || 0)
      return sum + (hpp * item.quantity)
    }, 0)
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
      itemsDetail: s.items.map(i => {
        const hpp = i.costPrice != null
          ? Number(i.costPrice)
          : Number(i.product.costPrice || 0)
        return {
          name: i.product.name,
          qty: i.quantity,
          price: Number(i.price),
          costPrice: hpp,
          total: Number(i.total)
        }
      })
    }
  })

  const formattedExpenses = expenses.map(e => ({
    id: e.id,
    date: e.date.toISOString(),
    amount: Number(e.amount),
    description: e.description,
    categoryName: e.category?.name || "Lainnya"
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Laporan Keuangan</h2>
          <p className="text-muted-foreground mt-1">
            Data rekam jejak transaksi finansial dan operasional yang diproses melalui sistem WarungBintang.
          </p>
        </div>
      </div>
      
      <ReportsClient data={formattedSales} expenses={formattedExpenses} />
    </div>
  )
}
