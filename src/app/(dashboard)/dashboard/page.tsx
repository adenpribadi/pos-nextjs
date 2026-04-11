import prisma from "@/lib/db"
import { ClientDashboard } from "./client-dashboard"
import { subDays, format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // Aggregate High Level Data
  const totalProducts = await prisma.product.count()
  const totalCustomers = await prisma.customer.count()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaySalesAgg = await prisma.sale.aggregate({
    _sum: {
      totalAmount: true
    },
    where: {
      createdAt: {
        gte: today
      },
      status: "PAID"
    }
  })
  
  const todayRevenue = Number(todaySalesAgg._sum.totalAmount || 0)

  // Chart Data: Last 7 Days Revenue
  const chartData = []
  for (let i = 6; i >= 0; i--) {
    const targetDate = subDays(new Date(), i)
    targetDate.setHours(0, 0, 0, 0)
    
    const nextDate = new Date(targetDate)
    nextDate.setDate(nextDate.getDate() + 1)
    
    const agg = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: {
          gte: targetDate,
          lt: nextDate,
        },
        status: "PAID"
      }
    })
    
    chartData.push({
      name: format(targetDate, "dd MMM"),
      Pendapatan: Number(agg._sum.totalAmount || 0)
    })
  }

  // Find recent transactions
  const recentTransactions = await prisma.sale.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  })

  // Normalize recent transactions
  const recentTx = recentTransactions.map(tx => ({
    id: tx.id,
    receiptNumber: tx.receiptNumber,
    cashierName: tx.user?.name || 'Unknown',
    amount: Number(tx.totalAmount),
    time: format(tx.createdAt, "HH:mm")
  }))

  return (
    <ClientDashboard 
      todayRevenue={todayRevenue} 
      totalProducts={totalProducts} 
      totalCustomers={totalCustomers}
      chartData={chartData}
      recentTx={recentTx}
    />
  )
}
