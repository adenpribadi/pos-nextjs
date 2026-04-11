import prisma from "@/lib/db"
import { POSClientLayout } from "./_components/pos-client-layout"

export const dynamic = "force-dynamic" // Ensure fresh inventory list is loaded

export default async function CheckoutPage() {
  // Fetch active products with stock > 0 for the POS grid
  // We include Category to display category colors/names
  const products = await prisma.product.findMany({
    where: {
      stock: {
        gt: 0,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Serialize Decimal to Number for React Server Components
  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : null,
  }))

  // Provide initial server data to our interactive client components
  return <POSClientLayout initialProducts={serializedProducts as any} />
}
