import prisma from "@/lib/db"
import { ClientDashboard } from "./client-dashboard"
import { subDays, format } from "date-fns"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  const role = session?.user?.role

  // Aggregate High Level Data (Common)
  const totalProducts = await prisma.product.count()
  
  // Variables for conditional data
  let todayRevenue = 0
  let totalCustomers = 0
  let chartData: any[] = []
  let recentTx: any[] = []
  let pendingShipments = 0
  let approvedShipments = 0

  if (role === "SUPPLIER") {
    // Supplier specific data
    pendingShipments = await prisma.supplyShipment.count({
      where: {
        supplierId: session?.user?.id,
        status: "PENDING"
      }
    })

    approvedShipments = await prisma.supplyShipment.count({
      where: {
        supplierId: session?.user?.id,
        status: "APPROVED"
      }
    })
  } else {
    // Admin, Manager, Cashier data
    totalCustomers = await prisma.customer.count()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaySalesAgg = await prisma.sale.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: today },
        status: "PAID"
      }
    })
    
    todayRevenue = Number(todaySalesAgg._sum.totalAmount || 0)

    // Chart Data: Last 7 Days Revenue
    for (let i = 6; i >= 0; i--) {
      const targetDate = subDays(new Date(), i)
      targetDate.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(targetDate)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const agg = await prisma.sale.aggregate({
        _sum: { totalAmount: true },
        where: {
          createdAt: { gte: targetDate, lt: nextDate },
          status: "PAID"
        }
      })
      
      chartData.push({
        name: format(targetDate, "dd MMM"),
        Pendapatan: Number(agg._sum.totalAmount || 0)
      })
    }

    // Recent transactions
    const transactions = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true }
    })

    recentTx = transactions.map(tx => ({
      id: tx.id,
      receiptNumber: tx.receiptNumber,
      cashierName: tx.user?.name || 'Unknown',
      amount: Number(tx.totalAmount),
      time: format(tx.createdAt, "HH:mm")
    }))
  }

  return (
    <ClientDashboard 
      role={role}
      todayRevenue={todayRevenue} 
      totalProducts={totalProducts} 
      totalCustomers={totalCustomers}
      chartData={chartData}
      recentTx={recentTx}
      pendingShipments={pendingShipments}
      approvedShipments={approvedShipments}
    />
  )
}
