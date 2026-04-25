import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { ReviewsClient } from "./_components/reviews-client"

export const dynamic = "force-dynamic"

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !["ADMIN", "MANAGER"].includes(session.user.role as string)) {
    redirect("/dashboard")
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sale: {
        select: {
          receiptNumber: true,
          totalAmount: true,
          customer: { select: { name: true, email: true } },
          items: {
            take: 1,
            include: { product: { select: { name: true } } }
          },
          _count: { select: { items: true } }
        }
      }
    }
  })

  // Hitung statistik di server
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0"

  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalReviews > 0
      ? Math.round(reviews.filter(r => r.rating === star).length / totalReviews * 100)
      : 0,
  }))

  // Serialize untuk client component (Decimal & Date)
  const serialized = reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    sale: {
      receiptNumber: r.sale.receiptNumber,
      totalAmount: Number(r.sale.totalAmount),
      customer: r.sale.customer,
      items: r.sale.items.map(i => ({ product: { name: i.product.name } })),
      _count: r.sale._count,
    }
  }))

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Rating & Ulasan</h2>
        <p className="text-muted-foreground mt-1">
          Pantau kepuasan pelanggan dari seluruh transaksi. Klik baris distribusi untuk memfilter ulasan.
        </p>
      </div>

      <ReviewsClient
        reviews={serialized}
        avgRating={avgRating}
        ratingDist={ratingDist}
        totalReviews={totalReviews}
        positiveCount={reviews.filter(r => r.rating >= 4).length}
        withCommentCount={reviews.filter(r => r.comment).length}
      />
    </div>
  )
}
