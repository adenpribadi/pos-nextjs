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
import { CommandMenu } from "./command-menu"

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const userRole = session?.user?.role || ""

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  return (
    <header className="h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 w-full shrink-0 shadow-sm shadow-black/5">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground h-10 w-10 outline-none transition-all active:scale-95">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-card border-r border-border/40">
            <div className="h-16 flex items-center px-6 border-b border-border/40 bg-muted/20">
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <div className="flex items-center gap-2.5">
                  <div className="bg-zinc-900 p-2 rounded-xl shadow-lg shadow-black/20">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tighter text-foreground uppercase">Warung<span className="text-primary font-light italic">Bintang</span></span>
                </div>
              </Link>
            </div>
            <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5">
              <div className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] mb-6 px-3">Sistem Navigasi</div>
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
                      "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 group",
                      isActive 
                        ? "bg-zinc-900 text-white shadow-xl shadow-black/20" 
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>

        <CommandMenu />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl h-10 w-10 transition-all active:scale-95">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background shadow-lg shadow-primary/40"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-11 rounded-2xl pl-3 pr-2 flex items-center gap-3 border border-border/40 bg-muted/20 hover:bg-muted/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[11px] font-black uppercase tracking-tight text-foreground leading-none">{session?.user?.name || 'Administrator'}</span>
              <span className="text-[9px] text-primary font-black uppercase tracking-widest mt-0.5 leading-none opacity-80">{session?.user?.role || 'Guest'}</span>
            </div>
            <div className="h-8 w-8 rounded-xl bg-zinc-900 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-black/20">
              {session?.user?.name ? session.user.name.substring(0, 1) : "A"}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-border/40 shadow-2xl shadow-black/10">
            <DropdownMenuGroup className="p-2">
              <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/40 rounded-xl">
                <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-black">
                  {session?.user?.name ? session.user.name.substring(0, 1) : "A"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black tracking-tight text-foreground">{session?.user?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">{session?.user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-border/40 mx-2" />
              <DropdownMenuItem className="rounded-lg py-2.5 text-xs font-bold tracking-tight cursor-pointer">
                Profil Akun
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg py-2.5 text-xs font-bold tracking-tight cursor-pointer">
                Pengaturan Keamanan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-border/40 mx-2" />
            <DropdownMenuItem 
              className="m-1 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors"
              onClick={() => {
                import("@/hooks/useCart").then((mod) => mod.useCart.getState().clearCart());
                signOut({ callbackUrl: '/login' });
              }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Keluar Sistem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
