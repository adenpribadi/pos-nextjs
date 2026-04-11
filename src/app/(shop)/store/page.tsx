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
  }))

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-background/50 backdrop-blur-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Produk</h1>
          <p className="text-sm text-muted-foreground">Pilih produk favorit Anda dan pesan secara mandiri.</p>
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
