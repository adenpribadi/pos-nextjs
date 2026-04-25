"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Package, Users, Banknote, ArrowUpRight, Bell, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DashboardProps {
  role?: string
  todayRevenue: number
  totalProducts: number
  totalCustomers: number
  chartData: Array<{name: string, Pendapatan: number}>
  recentTx: Array<{id: string, receiptNumber: string, cashierName: string, amount: number, time: string}>
  pendingShipments: number
  approvedShipments: number
  pendingOrdersCount?: number
  recentPendingOrders?: Array<{id: string, receiptNumber: string, customerName: string, amount: number, time: string}>
}

export function ClientDashboard({ 
  role, 
  todayRevenue, 
  totalProducts, 
  totalCustomers, 
  chartData, 
  recentTx,
  pendingShipments,
  approvedShipments,
  pendingOrdersCount = 0,
  recentPendingOrders = []
}: DashboardProps) {
  const isSupplier = role === "SUPPLIER"
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return (
    <div className="space-y-10 relative">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/10 blur-[100px] rounded-full -z-10"></div>
      <div className="absolute top-1/2 -left-24 h-64 w-64 bg-amber-500/10 blur-[100px] rounded-full -z-10"></div>

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
          {isSupplier ? "Supplier Center" : "Business Overview"}
        </h1>
        <p className="text-muted-foreground text-lg">
          {isSupplier 
            ? "Pantau arus pasokan dan inventori Anda secara real-time."
            : "Selamat datang kembali. Berikut performa toko Anda hari ini."}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {!isSupplier ? (
          <>
            <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/20 rounded-2xl group transition-all hover:scale-[1.01]">
              <div className="absolute -right-2 -bottom-2 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Banknote className="h-16 w-16" />
              </div>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Pendapatan Hari Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight">Rp {todayRevenue.toLocaleString('id-ID')}</div>
                <div className="mt-3 flex items-center gap-2 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg w-fit border border-white/10">
                  <ArrowUpRight className="h-3 w-3 text-white" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Live Updates</span>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "relative overflow-hidden border-none bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-xl shadow-secondary/20 rounded-2xl group transition-all hover:scale-[1.01]",
              pendingOrdersCount > 0 && "ring-2 ring-secondary/30 ring-offset-2 ring-offset-background"
            )}>
              <Link href="/dashboard/orders" className="absolute inset-0 z-10" />
              <div className="absolute -right-2 -bottom-2 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Bell className="h-16 w-16" />
              </div>
              <CardHeader className="pb-1">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Antrean Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tight flex items-baseline gap-2">
                  {pendingOrdersCount}
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">Antrean</span>
                </div>
                <div className={cn(
                  "mt-3 px-2.5 py-1 rounded-lg w-fit border text-[9px] font-black uppercase tracking-wider backdrop-blur-md",
                  pendingOrdersCount > 0 ? "bg-white/20 border-white/20" : "bg-black/5 border-transparent opacity-50"
                )}>
                  {pendingOrdersCount > 0 ? "Perlu Pembayaran" : "Semua Selesai"}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-xl shadow-secondary/20 rounded-2xl col-span-1 md:col-span-2 group">
            <div className="absolute -right-2 -bottom-2 p-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <ArrowUpRight className="h-16 w-16" />
            </div>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] opacity-80">Menunggu Persetujuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tight">{pendingShipments}</div>
              <p className="text-[9px] font-black mt-3 uppercase tracking-[0.1em] bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg w-fit border border-white/10">
                Verifikasi Admin Diperlukan
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card className="relative overflow-hidden border-none bg-white shadow-xl shadow-blue-500/5 rounded-2xl group transition-all hover:scale-[1.01]">
          <div className="absolute -right-2 -bottom-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Package className="h-16 w-16 text-blue-600" />
          </div>
          <CardHeader className="pb-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Master Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tight text-blue-600">{totalProducts}</div>
            <p className="text-[9px] font-black text-blue-600/50 mt-3 uppercase tracking-widest">Item Terdaftar</p>
          </CardContent>
        </Card>

        {!isSupplier ? (
          <Card className="relative overflow-hidden border-none bg-white shadow-xl shadow-indigo-500/5 rounded-2xl group transition-all hover:scale-[1.01]">
            <div className="absolute -right-2 -bottom-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Users className="h-16 w-16 text-indigo-600" />
            </div>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Total Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-indigo-600">{totalCustomers}</div>
              <p className="text-[9px] font-black text-indigo-600/50 mt-3 uppercase tracking-widest">Member Loyal</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="relative overflow-hidden border-none bg-white shadow-xl shadow-emerald-500/5 rounded-2xl group">
            <div className="absolute -right-2 -bottom-2 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Package className="h-16 w-16 text-emerald-600" />
            </div>
            <CardHeader className="pb-1">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Suplai Berhasil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight text-emerald-600">{approvedShipments}</div>
              <p className="text-[9px] font-black text-emerald-600/50 mt-3 uppercase tracking-widest">Pasokan Masuk</p>
            </CardContent>
          </Card>
        )}
      </div>

      {!isSupplier && (
        <div className="grid gap-6 md:grid-cols-7">
          {/* Chart */}
          <Card className="md:col-span-4 relative border-border/50 shadow-xl bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <CardHeader className="p-6 pb-0">
              <CardTitle className="text-lg font-black tracking-tight">Tren Pendapatan</CardTitle>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Analisis 7 Hari Terakhir</p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-[280px] w-full mt-4">
                {hasMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                      <XAxis dataKey="name" className="text-[10px] font-bold" tick={{fill: 'currentColor', opacity: 0.5}} tickLine={false} axisLine={false} />
                      <YAxis 
                        tickFormatter={(value) => `Rp${value / 1000}k`} 
                        className="text-[10px] font-bold" 
                        tick={{fill: 'currentColor', opacity: 0.5}} 
                        tickLine={false} 
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(8px)',
                          borderRadius: '12px', 
                          border: '1px solid rgba(0,0,0,0.05)',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: '900', fontSize: '13px' }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}
                        formatter={(value: any) => [`Rp ${Number(value || 0).toLocaleString('id-ID')}`, 'Revenue']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Pendapatan" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: 'white', stroke: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6, strokeWidth: 3, fill: 'white', stroke: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest animate-pulse">
                    Menganalisis Data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-3 space-y-6">
            {/* Recent Pending Orders */}
            <Card className="relative overflow-hidden border-secondary/20 bg-card/60 backdrop-blur-xl rounded-2xl border shadow-lg">
              <div className="absolute top-0 left-0 w-1 h-full bg-secondary"></div>
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-1">
                <CardTitle className="text-base font-black flex items-center gap-2">
                   <div className="h-7 w-7 rounded-lg bg-secondary/10 flex items-center justify-center">
                     <Bell className="h-3.5 w-3.5 text-secondary" />
                   </div>
                   Antrean Pesanan
                </CardTitle>
                <Link href="/dashboard/orders" className="text-[9px] font-black text-secondary hover:underline uppercase tracking-widest bg-secondary/10 px-2.5 py-0.5 rounded-md">
                   Semua
                </Link>
              </CardHeader>
              <CardContent className="p-5 pt-1">
                <div className="space-y-2">
                  {recentPendingOrders.length === 0 ? (
                    <div className="text-[10px] font-bold text-muted-foreground/40 py-4 text-center uppercase">Tidak ada antrean.</div>
                  ) : (
                    recentPendingOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-secondary/5 transition-colors group">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-foreground truncate max-w-[140px]">{order.customerName}</p>
                          <p className="text-[9px] font-black text-muted-foreground tracking-wider uppercase">INV: {order.receiptNumber.split('-')[1]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-secondary">Rp {order.amount.toLocaleString('id-ID')}</p>
                          <p className="text-[8px] font-bold text-muted-foreground/60">{order.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions (PAID) */}
            <Card className="relative overflow-hidden border-emerald-500/20 bg-card/60 backdrop-blur-xl rounded-2xl border shadow-lg">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <CardHeader className="p-5 pb-1">
                <CardTitle className="text-base font-black flex items-center gap-2">
                   <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                     <Clock className="h-3.5 w-3.5 text-emerald-600" />
                   </div>
                   Transaksi Berhasil
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-1">
                <div className="space-y-3">
                  {recentTx.length === 0 ? (
                    <div className="text-[10px] font-bold text-muted-foreground/40 py-4 text-center uppercase tracking-widest">Belum ada transaksi.</div>
                  ) : (
                    recentTx.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-1">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-foreground">{tx.receiptNumber}</p>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Oleh {tx.cashierName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-emerald-600">Rp {tx.amount.toLocaleString('id-ID')}</p>
                          <p className="text-[8px] font-bold text-muted-foreground/60">{tx.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isSupplier && (
        <Card className="bg-muted/30 border-dashed border-border/50 rounded-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center relative">
            <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4 shadow-xl shadow-primary/10">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Pusat Suplai Barang</h3>
            <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium">
              Gunakan menu navigasi di sisi kiri untuk memproses pesanan masuk, mengelola katalog produk, atau memantau status pengiriman Anda.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
