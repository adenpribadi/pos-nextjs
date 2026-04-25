"use client"

import { useState, useTransition } from "react"
import { Star, MessageSquare, CheckCircle2, Loader2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { submitReview } from "@/app/actions/review"
import { toast } from "sonner"

type ReviewData = {
  rating: number
  comment: string | null
  createdAt: Date
} | null

interface OrderReviewProps {
  saleId: string
  orderId: string      // receiptNumber untuk display
  existingReview: ReviewData
}

export function OrderReview({ saleId, orderId, existingReview }: OrderReviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(!existingReview)
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment ?? "")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Pilih Rating", { description: "Silakan pilih bintang terlebih dahulu." })
      return
    }
    startTransition(async () => {
      const res = await submitReview(saleId, rating, comment)
      if (res.success) {
        toast.success("Review Terkirim!", { description: "Terima kasih atas ulasan Anda." })
        setIsEditing(false)
        setIsOpen(false)
      } else {
        toast.error("Gagal Mengirim", { description: res.error })
      }
    })
  }

  const displayRating = hoverRating || rating

  // Tampilan ringkas (sudah ada review, belum di-expand)
  if (existingReview && !isOpen) {
    return (
      <div className="border-t border-border/30 pt-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={cn("h-3.5 w-3.5", s <= existingReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-xs text-muted-foreground truncate max-w-[140px]">&ldquo;{existingReview.comment}&rdquo;</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => { setIsOpen(true); setIsEditing(true) }}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border/30 pt-3 mt-1">
      {!isOpen && !existingReview ? (
        // Tombol buka form review
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 transition-all"
        >
          <Star className="h-3.5 w-3.5" />
          Beri Rating &amp; Ulasan
        </button>
      ) : (
        // Form review
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            {existingReview ? "Edit Ulasan Anda" : "Beri Ulasan"}
          </p>

          {/* Star Rating */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    star <= displayRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30 hover:text-amber-300"
                  )}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-black text-amber-500">
                {["", "Sangat Buruk", "Kurang Baik", "Cukup", "Bagus", "Luar Biasa!"][rating]}
              </span>
            )}
          </div>

          {/* Textarea komentar */}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tulis pengalaman Anda (opsional)..."
            rows={3}
            className="w-full text-sm bg-muted/30 border border-border/50 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
          />

          {/* Aksi */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setIsOpen(false); setIsEditing(false); if (!existingReview) { setRating(0); setComment("") } }}
              className="flex-1 py-2 rounded-xl border border-border/50 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-all"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || rating === 0}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all",
                rating > 0
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <><CheckCircle2 className="h-3.5 w-3.5" /> Kirim Ulasan</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
