"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Store, LogOut, LayoutDashboard, Menu } from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/usePermissions"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { menuItems } from "@/components/layout/sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function TopBar() {
  const { data: session } = useSession()
  const { canAccessDashboard } = usePermissions()
  const pathname = usePathname()
  const userRole = session?.user?.role || ""

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9 outline-none focus-visible:ring-2 focus-visible:ring-ring mr-1">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
            <div className="h-16 flex items-center px-6 border-b border-border/50">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">Warung<span className="text-primary font-black">Bintang</span></span>
                </div>
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
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
            <Store className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-lg hidden xs:block">WarungBintang <span className="text-primary sm:inline hidden">Launchpad</span></span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground mr-4 hidden sm:block">
          Kasir: <span className="font-medium text-foreground">{session?.user?.name || 'Kasir'}</span>
        </div>
        
        {canAccessDashboard && (
          <Link href="/dashboard" passHref title="Ke Dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            import("@/hooks/useCart").then((mod) => mod.useCart.getState().clearCart());
            signOut({ callbackUrl: '/login' });
          }} 
          className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
          title="Keluar"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  )
}
