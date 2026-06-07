import prisma from "@/lib/db"
import { StockOpnameClient } from "./stock-opname-client"

export const dynamic = "force-dynamic"

export default async function StockOpnamePage() {
  // Fetch all active products that are tracked
  const products = await prisma.product.findMany({
    where: {
      trackStock: true
    },
    include: {
      category: true,
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' }
    ]
  })

  const formattedProducts = products.map(product => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category?.name || "Tanpa Kategori",
    systemStock: product.stock,
    updatedAt: product.updatedAt.toISOString(),
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Input Hasil Opname</h2>
          <p className="text-muted-foreground mt-1">
            Masukkan hasil perhitungan fisik stok barang. Sistem akan otomatis menghitung selisih dan membuat log penyesuaian.
          </p>
        </div>
      </div>
      
      <StockOpnameClient data={formattedProducts} />
    </div>
  )
}
