import prisma from "@/lib/db"
import { ProductGrid } from "./_components/product-grid"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  const session = await getServerSession(authOptions)

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
