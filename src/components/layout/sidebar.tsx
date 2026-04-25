"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  Store,
  CreditCard,
  LineChart,
  ClipboardList,
  CheckCircle2,
  Bell,
  Star
} from "lucide-react"
import { useSession } from "next-auth/react"
import { getPendingSalesCount } from "@/app/actions/sale"
import { useState, useEffect } from "react"

export const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { name: "Antrean Pesanan", href: "/dashboard/orders", icon: Bell, roles: ["ADMIN", "MANAGER", "CASHIER"], showBadge: true },
  { name: "Transaksi / Kasir", href: "/checkout", icon: Store, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { name: "Manajemen Produk", href: "/dashboard/products", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { name: "Inventori & Stok", href: "/dashboard/inventory", icon: ClipboardList, roles: ["ADMIN", "MANAGER"] },
  { name: "Supply Shipment", href: "/dashboard/inventory/supply-shipments", icon: CheckCircle2, roles: ["ADMIN", "MANAGER", "SUPPLIER"] },
  { name: "Data Pelanggan", href: "/dashboard/customers", icon: Users, roles: ["ADMIN", "MANAGER", "CASHIER"] },
  { name: "Rating & Ulasan", href: "/dashboard/reviews", icon: Star, roles: ["ADMIN", "MANAGER"] },
  { name: "Laporan Keuangan", href: "/dashboard/reports", icon: LineChart, roles: ["ADMIN", "MANAGER"] },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings, roles: ["ADMIN", "MANAGER", "CASHIER", "SUPPLIER"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user?.role || ""
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (userRole === "ADMIN" || userRole === "MANAGER" || userRole === "CASHIER") {
      getPendingSalesCount().then(setPendingCount)
      
      // Auto-refresh every 30 seconds for new orders
      const interval = setInterval(() => {
        getPendingSalesCount().then(setPendingCount)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [userRole])

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className="w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col hidden md:flex shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">Warung<span className="text-primary font-black">Bintang</span></span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu Utama</div>
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href || (
            pathname?.startsWith(`${item.href}/`) && 
            item.href !== "/dashboard" &&
            !menuItems.some(m => m.href !== item.href && pathname.startsWith(m.href))
          )
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              <div className="flex-1 flex items-center justify-between">
                <span>{item.name}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full animate-in zoom-in duration-300">
                    {pendingCount}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info Area */}
      <div className="p-4 border-t border-border/50 bg-muted/20">
        <div className="bg-card border border-border/50 p-4 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
          <h4 className="font-bold text-sm text-foreground">Premium Plan</h4>
          <p className="text-xs text-muted-foreground mt-1">Full System Analytics Active</p>
        </div>
      </div>
    </aside>
  )
}
