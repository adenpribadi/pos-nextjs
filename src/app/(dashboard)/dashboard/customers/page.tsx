import prisma from "@/lib/db"
import { CustomersClient } from "./customers-client"
import { Users, UserPlus, UserCheck, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const totalCustomers = customers.length
  const recentMembers = customers.filter(c => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return new Date(c.createdAt) > thirtyDaysAgo
  }).length

  return (
    <div className="flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Database Pelanggan
          </h2>
          <p className="text-muted-foreground mt-1 text-base">
            Kelola dan pantau loyalitas pelanggan setia <span className="text-primary font-bold">WarungBintang</span>.
          </p>
        </div>
      </div>

      {/* Modern Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-lg shadow-primary/5">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Users className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pelanggan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{totalCustomers}</div>
            <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wider">Database Terverifikasi</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Member Baru (30 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">+{recentMembers}</div>
            <p className="text-[10px] text-emerald-600/70 font-bold mt-1 uppercase tracking-wider">Pertumbuhan Positif</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Loyalty Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 flex items-center gap-2">
              4.8 <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
            </div>
            <p className="text-[10px] text-amber-600/70 font-bold mt-1 uppercase tracking-wider">Rating Kepuasan</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Segmentasi Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">Premium</div>
            <p className="text-[10px] text-blue-600/70 font-bold mt-1 uppercase tracking-wider">Tingkat Retensi Tinggi</p>
          </CardContent>
        </Card>
      </div>
      
      <CustomersClient data={formattedCustomers} />
    </div>
  )
}
