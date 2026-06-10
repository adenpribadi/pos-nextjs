import prisma from "@/lib/db"
import { ProductGrid } from "./_components/product-grid"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Store } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  const session = await getServerSession(authOptions)
  
  let settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
  })

  // Jika belum ada setting di db, anggap online (default)
  const isOnline = settings ? settings.isOnline : true

  if (!isOnline) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative h-32 w-32 bg-muted/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-border/50">
            <Store className="h-12 w-12 text-muted-foreground opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-1 bg-red-500/80 w-16 -rotate-45" />
            </div>
          </div>
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="text-3xl font-black tracking-tighter">TOKO SEDANG <span className="text-red-500">OFFLINE</span></h1>
          <p className="text-muted-foreground text-sm font-medium">
            Maaf, kami sedang tidak menerima pesanan saat ini. Silakan kembali lagi nanti atau hubungi kasir.
          </p>
        </div>
      </div>
    )
  }

  const products = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0,
      },
      trackStock: true, // Only show trackable items in online store
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Fetch categories with product counts (only products in stock)
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: {
              stock: { gt: 0 },
              trackStock: true
            }
          }
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  // Serialize Decimals
  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : 0,
  }))

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur-md flex items-center justify-between relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tighter text-foreground leading-none">
            KATALOG <span className="text-primary font-light italic">Produk</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2 border-l border-border/50 pl-6">
            <div className="h-[1px] w-4 bg-primary/40" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-black">Pilih produk favorit Anda dan pesan secara mandiri.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-muted/20">
        <ProductGrid
          initialProducts={serializedProducts as any}
          categories={categories as any}
        />
      </div>
    </div>
  )
}
