"use client"

import { useState } from "react"
import { Star, MessageSquare, ShoppingBag, X } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  sale: {
    receiptNumber: string
    totalAmount: number
    customer: { name: string; email: string } | null
    items: { product: { name: string } }[]
    _count: { items: number }
  }
}

type RatingDist = { star: number; count: number; pct: number }

interface ReviewsClientProps {
  reviews: Review[]
  avgRating: string
  ratingDist: RatingDist[]
  totalReviews: number
  positiveCount: number
  withCommentCount: number
}

const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star
        key={s}
        className={cn(
          size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5",
          s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
        )}
      />
    ))}
  </div>
)

export function ReviewsClient({
  reviews,
  avgRating,
  ratingDist,
  totalReviews,
  positiveCount,
  withCommentCount,
}: ReviewsClientProps) {
  const [activeFilter, setActiveFilter] = useState<number | null>(null)

  const filtered = activeFilter === null
    ? reviews
    : reviews.filter(r => r.rating === activeFilter)

  const handleFilterClick = (star: number) => {
    setActiveFilter(prev => prev === star ? null : star)
  }

  return (
    <>
      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Rata-rata */}
        <div className="md:col-span-1 bg-card border border-border/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="text-5xl font-black text-amber-400 tracking-tight">{avgRating}</div>
          <StarDisplay rating={Math.round(parseFloat(avgRating))} size="lg" />
          <p className="text-xs text-muted-foreground mt-2 font-medium">{totalReviews} ulasan total</p>
        </div>

        {/* Distribusi Bintang — bisa diklik untuk filter */}
        <div className="md:col-span-2 bg-card border border-border/50 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Distribusi Rating</p>
            {activeFilter !== null && (
              <button
                type="button"
                onClick={() => setActiveFilter(null)}
                className="flex items-center gap-1 text-[10px] font-bold text-destructive hover:underline"
              >
                <X className="h-3 w-3" /> Reset Filter
              </button>
            )}
          </div>
          {ratingDist.map(({ star, count, pct }) => {
            const isActive = activeFilter === star
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleFilterClick(star)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-2 py-1.5 transition-all group",
                  isActive
                    ? "bg-amber-400/10 ring-1 ring-amber-400/40"
                    : "hover:bg-muted/40"
                )}
              >
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className={cn("text-xs font-bold", isActive ? "text-amber-500" : "text-muted-foreground")}>
                    {star}
                  </span>
                  <Star className={cn("h-3 w-3", isActive ? "fill-amber-400 text-amber-400" : "fill-amber-400 text-amber-400")} />
                </div>
                <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", isActive ? "bg-amber-400" : "bg-amber-300 group-hover:bg-amber-400")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={cn("text-xs font-mono w-8 text-right shrink-0 font-bold", isActive ? "text-amber-500" : "text-muted-foreground")}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Kartu ringkasan */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Star className="h-4 w-4 text-primary fill-primary" />
            </div>
            <div>
              <p className="text-lg font-black">{positiveCount}</p>
              <p className="text-[11px] text-muted-foreground">Rating Positif (≥4★)</p>
            </div>
          </div>
          <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-lg font-black">{withCommentCount}</p>
              <p className="text-[11px] text-muted-foreground">Ada Komentar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter aktif label */}
      {activeFilter !== null && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/30 rounded-full">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-black text-amber-600">
              Menampilkan {filtered.length} ulasan dengan rating {activeFilter} bintang
            </span>
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="ml-1 text-amber-500 hover:text-amber-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Daftar Ulasan */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border/50 text-center">
          <div className="h-14 w-14 bg-muted/50 rounded-2xl flex items-center justify-center mb-3">
            <Star className="h-7 w-7 text-muted-foreground/30" />
          </div>
          <h3 className="font-black">Tidak Ada Ulasan</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {activeFilter !== null
              ? `Belum ada ulasan dengan rating ${activeFilter} bintang.`
              : "Belum ada pelanggan yang memberikan ulasan."}
          </p>
          {activeFilter !== null && (
            <button
              type="button"
              onClick={() => setActiveFilter(null)}
              className="mt-3 text-xs text-primary font-bold hover:underline"
            >
              Tampilkan semua ulasan
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => {
            const customer = review.sale.customer
            const firstItem = review.sale.items[0]?.product.name
            const itemCount = review.sale._count.items
            return (
              <div
                key={review.id}
                className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-400/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm uppercase shrink-0">
                    {customer?.name?.slice(0, 1) || "?"}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Nama + Bintang */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-black text-sm">{customer?.name || "Pelanggan Anonim"}</p>
                        <p className="text-[11px] text-muted-foreground">{customer?.email || "—"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StarDisplay rating={review.rating} />
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(review.createdAt), "dd MMM yyyy · HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>

                    {/* Komentar */}
                    {review.comment && (
                      <div className="bg-muted/30 rounded-xl px-3 py-2.5 border border-border/30">
                        <p className="text-sm text-foreground/80 italic">&ldquo;{review.comment}&rdquo;</p>
                      </div>
                    )}

                    {/* Info Pesanan */}
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/30 flex-wrap">
                      <span className="flex items-center gap-1">
                        <ShoppingBag className="h-3 w-3" />
                        <span className="font-mono text-primary font-bold">{review.sale.receiptNumber}</span>
                      </span>
                      <span>·</span>
                      <span>{firstItem}{itemCount > 1 ? ` +${itemCount - 1} lainnya` : ""}</span>
                      <span>·</span>
                      <span className="font-bold text-foreground">Rp {Number(review.sale.totalAmount).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
