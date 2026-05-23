import prisma from "@/lib/db"
import { POSClientLayout } from "./_components/pos-client-layout"

export const dynamic = "force-dynamic" // Ensure fresh inventory list is loaded

export default async function CheckoutPage() {
  // Fetch initial page of active products (limit 20) with stock > 0
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
    take: 20,
  })

  // Count total active products to determine if more items exist
  const totalCount = await prisma.product.count({
    where: {
      stock: {
        gt: 0,
      },
    },
  })

  // Fetch all categories for the filter drawer
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  })

  // Count active products in each category
  const categoryCounts = await prisma.product.groupBy({
    by: ["categoryId"],
    where: {
      stock: {
        gt: 0,
      },
    },
    _count: {
      id: true,
    },
  })

  // Combine categories with their active product counts
  const categoriesWithCounts = categories.map((c) => {
    const countObj = categoryCounts.find((item) => item.categoryId === c.id)
    return {
      ...c,
      productCount: countObj ? countObj._count.id : 0,
    }
  })

  // Serialize Decimal to Number for React Server Components
  const serializedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : null,
  }))

  const initialHasMore = totalCount > 20

  // Provide initial server data to our interactive client components
  return (
    <POSClientLayout
      initialProducts={serializedProducts as any}
      initialHasMore={initialHasMore}
      categories={categoriesWithCounts}
      totalCount={totalCount}
    />
  )
}
