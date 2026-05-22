import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Store, UserCircle, ShoppingCart, Star } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserNav } from "./_components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">
              Warung<span className="text-primary font-black">Bintang</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/store"
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
                "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
              )}
            >
              Katalog Produk
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "font-semibold" })}>
                Masuk
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "default", size: "sm", className: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20" })}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-64px)] overflow-hidden">
        {children}
      </main>
    </div>
  )
}

