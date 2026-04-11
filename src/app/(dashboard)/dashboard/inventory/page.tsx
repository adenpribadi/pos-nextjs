import prisma from "@/lib/db"
import { InventoryClient } from "./inventory-client"

export const dynamic = "force-dynamic"

export default async function InventoryPage() {
  // Fetch latest inventory transactions
  const transactions = await prisma.inventoryTransaction.findMany({
    take: 50, // Limit for recent transactions
    orderBy: {
      createdAt: "desc"
    },
    include: {
      product: true,
      user: true,
    }
  })

  const formattedTransactions = transactions.map(tx => ({
    id: tx.id,
    date: tx.createdAt.toISOString(),
    productName: tx.product?.name || "Produk dihapus",
    sku: tx.product?.sku || "-",
    type: tx.type,
    quantity: tx.quantity,
    operator: tx.user?.name || "System",
    notes: tx.notes || "-",
  }))

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventori & Stok</h2>
          <p className="text-muted-foreground mt-1">
            Riwayat log transaksi stok barang, barang masuk, dan barang keluar.
          </p>
        </div>
      </div>
      
      <InventoryClient data={formattedTransactions} />
    </div>
  )
}
