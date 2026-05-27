import prisma from "@/lib/db"
import { ProductsClient } from "./products-client"

export const dynamic = "force-dynamic"

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: true,
      updatedBy: true,
      variants: {
        orderBy: { sortOrder: "asc" }
      },
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc"
    }
  })

  // Format products for the client table
  const formattedProducts = products.map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category?.name || "Tidak ada kategori",
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : 0,
    stock: product.stock,
    status: product.stock > 0 ? "Tersedia" : "Habis",
    image: product.image,
    categoryId: product.categoryId || "",
    updatedAt: product.updatedAt.toISOString(),
    updatedBy: product.updatedBy ? {
      id: product.updatedBy.id,
      name: product.updatedBy.name,
      email: product.updatedBy.email,
      role: product.updatedBy.role,
    } : null,
    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sortOrder: v.sortOrder,
    })),
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2 print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Produk</h2>
          <p className="text-muted-foreground mt-1">
            Kelola katalog produk, harga, dan ketersediaan stok Anda di sini.
          </p>
        </div>
      </div>
      
      <ProductsClient data={formattedProducts} categories={categories} />
    </div>
  )
}
