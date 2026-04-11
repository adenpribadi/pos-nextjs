import prisma from "@/lib/db"
import { CustomersClient } from "./customers-client"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc"
    }
  })

  // Format customers for the client table
  const formattedCustomers = customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email || "-",
    phone: c.phone || "-",
    address: c.address || "-",
    memberSince: c.createdAt.toISOString(),
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Data Pelanggan</h2>
          <p className="text-muted-foreground mt-1">
            Kelola basis data pelanggan yang terdaftar di sistem Member Anda.
          </p>
        </div>
      </div>
      
      <CustomersClient data={formattedCustomers} />
    </div>
  )
}
