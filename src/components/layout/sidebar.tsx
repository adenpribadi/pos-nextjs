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
  ClipboardList
} from "lucide-react"

export const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaksi / Kasir", href: "/checkout", icon: Store },
  { name: "Manajemen Produk", href: "/dashboard/products", icon: Package },
  { name: "Inventori & Stok", href: "/dashboard/inventory", icon: ClipboardList },
  { name: "Data Pelanggan", href: "/dashboard/customers", icon: Users },
  { name: "Laporan Keuangan", href: "/dashboard/reports", icon: LineChart },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col hidden md:flex shrink-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">ERP<span className="text-primary font-black">POS</span></span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu Utama</div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`) && item.href !== "/dashboard"
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
              {item.name}
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
