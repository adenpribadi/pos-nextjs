"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Store, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { usePermissions } from "@/hooks/usePermissions"

export function TopBar() {
  const { data: session } = useSession()
  const { canAccessManagerDashboard } = usePermissions()

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
          <Store className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold tracking-tight text-lg">BintangPOS Launchpad</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground mr-4 hidden sm:block">
          Kasir: <span className="font-medium text-foreground">{session?.user?.name || 'Kasir'}</span>
        </div>
        
        {canAccessManagerDashboard && (
          <Link href="/dashboard" passHref title="Ke Dashboard Admin">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard Admin</span>
            </Button>
          </Link>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut({ callbackUrl: '/login' })} 
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
