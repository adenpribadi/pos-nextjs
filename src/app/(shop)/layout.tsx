import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Store, UserCircle, ShoppingCart } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserNav } from "./_components/user-nav"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Pastikan yang mengakses rute Shop adalah Publik atau CUSTOMER,
  // Namun, sistem internal juga boleh sekadar melihat-lihat.
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 w-full">
        <div className="flex items-center gap-8">
          <Link href="/store" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">ERP<span className="text-primary font-black">STORE</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link 
              href="/store" 
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-primary/10 hover:text-primary text-muted-foreground"
              )}
            >
              Katalog Produk
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <UserNav user={session.user} />
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Masuk
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "default", size: "sm" })}>
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
