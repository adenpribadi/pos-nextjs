"use client"

import { useState } from "react"
import { ShoppingCart, Trash2, ArrowRight, Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CustomerCart() {
  const { items, getTotalAmount, getSubtotal, getTaxAmount, clearCart, getTotalItems, removeItem, updateQuantity } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const totalItems = getTotalItems()

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalAmount: getTotalAmount(),
          taxAmount: getTaxAmount(),
          discount: 0,
          paymentMethod: "TRANSFER", // Default for B2C self-checkout
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Pesanan Berhasil!", {
          description: "Terima kasih telah berbelanja. Pesanan Anda sedang diproses.",
        })
        clearCart()
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error("Checkout Gagal", { description: data.error || "Gagal memproses pesanan." })
      }
    } catch (error) {
      toast.error("Kesalahan Sistem", { description: "Gagal menghubungkan ke server." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger className="h-16 w-16 rounded-full shadow-2xl shadow-primary/40 relative group bg-primary text-primary-foreground flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all hover:bg-primary/90">
          <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center border-2 border-background animate-in zoom-in">
              {totalItems}
            </span>
          )}
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Keranjang Belanja
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1 p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p>Keranjang Anda masih kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeItem(item.productId)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-center">
                      <p className="text-sm font-bold">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="p-6 bg-muted/30 border-t space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>Rp {getSubtotal().toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PPN (11%)</span>
                  <span>Rp {getTaxAmount().toLocaleString("id-ID")}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-black">
                  <span>Total Bayar</span>
                  <span className="text-primary">Rp {getTotalAmount().toLocaleString("id-ID")}</span>
                </div>
              </div>

              <SheetFooter className="sm:flex-col gap-2">
                <Button 
                  className="w-full h-12 text-lg font-bold shadow-lg" 
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Bayar Sekarang
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Transaksi aman & terverifikasi otomatis
                </p>
              </SheetFooter>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
