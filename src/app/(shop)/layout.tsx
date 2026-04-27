import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import { Store, UserCircle, ShoppingCart, Star } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { UserNav } from "./_components/user-nav"

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 w-full">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Star className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Warung<span className="text-blue-600">Bintang</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/store"
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-colors",
                "hover:bg-blue-50 hover:text-blue-600 text-slate-600"
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
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm", className: "font-semibold" })}>
                Masuk
              </Link>
              <Link href="/register" className={buttonVariants({ variant: "default", size: "sm", className: "bg-blue-600 hover:bg-blue-700 font-bold" })}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full h-[calc(100vh-16px)] overflow-hidden">
        {children}
      </main>
    </div>
  )
}

