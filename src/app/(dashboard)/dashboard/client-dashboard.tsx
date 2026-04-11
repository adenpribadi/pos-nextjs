"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, Users, Banknote, ArrowUpRight } from "lucide-react"

interface DashboardProps {
  role?: string
  todayRevenue: number
  totalProducts: number
  totalCustomers: number
  chartData: Array<{name: string, Pendapatan: number}>
  recentTx: Array<{id: string, receiptNumber: string, cashierName: string, amount: number, time: string}>
  pendingShipments: number
  approvedShipments: number
}

export function ClientDashboard({ 
  role, 
  todayRevenue, 
  totalProducts, 
  totalCustomers, 
  chartData, 
  recentTx,
  pendingShipments,
  approvedShipments
}: DashboardProps) {
  const isSupplier = role === "SUPPLIER"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isSupplier ? "Supplier Overview" : "Overview"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isSupplier 
            ? "Kelola pengiriman pasokan barang dan status persediaan Anda."
            : "Ringkasan performa bisnis dan operasional kasir."}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {!isSupplier ? (
          <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg shadow-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
              <Banknote className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">Rp {todayRevenue.toLocaleString('id-ID')}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                Diperbarui secara real-time
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20 shadow-lg shadow-orange-500/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Persetujuan</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{pendingShipments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pengiriman yang perlu diverifikasi admin
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Master Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Produk terdaftar di katalog
            </p>
          </CardContent>
        </Card>

        {!isSupplier ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pelanggan terdaftar
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Suplai Disetujui</CardTitle>
              <Package className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedShipments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Riwayat pasokan berhasil masuk
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {!isSupplier && (
        <div className="grid gap-6 md:grid-cols-7">
          {/* Chart */}
          <Card className="md:col-span-4 relative overflow-hidden bg-card/60 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
            <CardHeader>
              <CardTitle>Tren Pendapatan (7 Hari Terakhir)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis dataKey="name" className="text-xs" tick={{fill: 'currentColor', opacity: 0.5}} tickLine={false} axisLine={false} />
                    <YAxis 
                      tickFormatter={(value) => `Rp${value / 1000}k`} 
                      className="text-xs" 
                      tick={{fill: 'currentColor', opacity: 0.5}} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                      formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, 'Pendapatan']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Pendapatan" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Transaksi Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentTx.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi.</div>
                ) : (
                  recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold leading-none text-foreground">{tx.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">Kasir: {tx.cashierName}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-bold text-foreground">Rp {tx.amount.toLocaleString('id-ID')}</p>
                        <p className="text-xs text-muted-foreground">{tx.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isSupplier && (
        <Card className="bg-muted/30 border-dashed border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-bold">Menu Suplai Barang</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2">
              Silakan gunakan menu di bilah sisi (Sidebar) untuk membuat permintaan suplai barang atau memantau stok inventori.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
