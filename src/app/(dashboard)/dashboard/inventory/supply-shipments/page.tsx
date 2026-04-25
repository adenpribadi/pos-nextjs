import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SupplyShipmentClient } from "@/components/supply-shipment/supply-shipment-client"

export const dynamic = "force-dynamic"

export default async function SupplyShipmentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect("/auth/signin")

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MANAGER"
  const isSupplier = session.user.role === "SUPPLIER"

  if (!isAdmin && !isSupplier) {
    return (
      <div className="flex h-[450px] items-center justify-center text-muted-foreground border-2 border-dashed rounded-3xl">
        <p>Akses Terbatas: Hanya Supplier atau Admin yang dapat mengakses halaman ini.</p>
      </div>
    )
  }

  // Fetch products for the dropdown
  const products = await prisma.product.findMany({
    select: {
      id: true,
      sku: true,
      name: true,
      stock: true,
      image: true,
    },
    orderBy: { name: "asc" }
  })

  // Fetch shipments
  const shipments = await prisma.supplyShipment.findMany({
    where: isAdmin ? {} : { supplierId: session.user.id },
    include: {
      product: {
        select: { name: true, sku: true }
      },
      supplier: {
        select: { name: true }
      },
      admin: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Fetch all suppliers for Admin/Manager selection
  const suppliers = isAdmin ? await prisma.user.findMany({
    where: { role: "SUPPLIER" },
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  }) : []

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "Validasi Pasokan" : "Pengiriman Pasokan"}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAdmin 
              ? "Validasi barang yang dikirim oleh supplier untuk dimasukkan ke stok sistem." 
              : "Ajukan surat jalan pengiriman barang untuk menambah stok di gudang utama."}
          </p>
        </div>
      </div>
      
      <SupplyShipmentClient 
        products={products as any} 
        shipments={shipments as any}
        suppliers={suppliers as any}
        isAdmin={isAdmin}
      />
    </div>
  )
}
