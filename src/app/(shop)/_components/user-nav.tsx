"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { 
  UserCircle, 
  LogOut, 
  ShoppingBag, 
  User, 
  Settings 
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UserNavProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

export function UserNav({ user }: UserNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative h-9 rounded-full pl-3 pr-2 flex items-center gap-2 border border-border/50 bg-background/50 hover:bg-muted/50 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all">
        <div className="flex flex-col items-end hidden sm:flex text-right">
          <span className="text-sm font-semibold leading-none">{user.name || 'Pelanggan'}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{user.role || 'Customer'}</span>
        </div>
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <UserCircle className="h-5 w-5 text-primary" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1 font-sans shadow-xl border-border/50 bg-card/95 backdrop-blur-xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer p-0">
            <Link href="/store" className="flex w-full items-center px-1.5 py-1 text-primary font-bold">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Belanja Sekarang
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer p-0">
            <Link href="/store/profile" className="flex w-full items-center px-1.5 py-1">
              <User className="mr-2 h-4 w-4" />
              Profil Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer p-0">
            <Link href="/store/orders" className="flex w-full items-center px-1.5 py-1">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Pesanan Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer p-0">
            <Link href="/store/settings" className="flex w-full items-center px-1.5 py-1">
              <Settings className="mr-2 h-4 w-4" />
              Pengaturan
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer font-bold"
          onClick={() => {
            import("@/hooks/useCart").then((mod) => mod.useCart.getState().clearCart());
            signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
