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
      <div className="flex items-center gap-2 text-primary">
        <Store className="h-6 w-6" />
        <span className="font-bold tracking-tight text-lg">POS Launchpad</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground mr-4 hidden sm:block">
          Kasir: <span className="font-medium text-foreground">{session?.user?.name || 'Kasir'}</span>
        </div>
        
        {canAccessManagerDashboard && (
          <Link href="/dashboard" passHref>
            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard Admin
            </Button>
          </Link>
        )}

        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  )
}
