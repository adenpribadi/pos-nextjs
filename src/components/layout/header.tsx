"use client"

import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Bell, Search, UserCircle, LogOut, Menu, Store } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { menuItems } from "./sidebar"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const userRole = session?.user?.role || ""

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 w-full shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col bg-card">
            <div className="h-16 flex items-center px-6 border-b border-border/50">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-lg tracking-tight text-foreground">ERP<span className="text-primary font-black">POS</span></span>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Menu Utama</div>
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== "/dashboard")
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

        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-background/50 border-border/50 h-9 text-sm rounded-lg w-full focus-visible:ring-1 transition-all"
            placeholder="Pencarian cepat (Ctrl+K)..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 rounded-full pl-3 pr-2 flex items-center gap-2 border border-border/50 bg-background/50 hover:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-semibold leading-none">{session?.user?.name || 'Administrator'}</span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{session?.user?.role || 'Guest'}</span>
            </div>
            <UserCircle className="h-6 w-6 text-primary" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 font-sans">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profil</DropdownMenuItem>
              <DropdownMenuItem>Pengaturan Keamanan</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
