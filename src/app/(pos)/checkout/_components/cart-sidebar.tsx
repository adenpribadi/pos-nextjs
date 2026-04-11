"use client"

import { useState } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ArrowRight } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

export function CartSidebar() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotalAmount,
  } = useCart()

  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setIsProcessing(true)

    try {
      // Calling API to process transaction (inventory deduction & sales log)
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, discount: i.discount })),
          taxAmount: getTaxAmount(),
          totalAmount: getTotalAmount(),
          discount: 0, // Global discount if any
          paymentMethod: "CASH", 
        }),
      })

      if (!res.ok) {
        throw new Error("Gagal memproses transaksi")
      }

      await res.json()
      toast.success("Transaksi Sukses!", {
        description: "Pesanan berhasil diproses dan inventaris telah diperbarui."
      })
      clearCart()
      // Refresh the page or invalidate cache in a real app to update stock
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast.error("Gagal Memproses Tranaksi", {
        description: (err as Error).message
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const hasItems = items.length > 0

  return (
    <div className="flex flex-col h-full bg-card relative">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Keranjang</h2>
        </div>
        {hasItems && (
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive h-8 px-2 text-xs hover:bg-destructive/10">
            Kosongkan
          </Button>
        )}
      </div>

      {/* Cart Items Area */}
      {hasItems ? (
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-4 pr-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-muted/20 border border-border/50 rounded-xl">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-sm leading-tight pr-4">{item.name}</span>
                  <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-semibold text-primary">
                    Rp {item.price.toLocaleString('id-ID')}
                  </span>
                  
                  {/* Quantity Control */}
                  <div className="flex items-center bg-background rounded-lg border border-border/50 shadow-sm overflow-hidden h-8">
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 h-full hover:bg-muted text-foreground transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium font-mono">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 h-full hover:bg-muted text-foreground transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
          </div>
          <p className="text-sm">Keranjang kosong. Klik produk di sebelah kiri untuk menambahkan ke keranjang.</p>
        </div>
      )}

      {/* Summary Footer */}
      <div className="bg-card border-t border-border/50 p-6 space-y-4 shrink-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">Rp {getSubtotal().toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Pajak (11%)</span>
            <span className="font-mono">Rp {getTaxAmount().toLocaleString('id-ID')}</span>
          </div>
          <div className="pt-3 border-t border-border/50 flex justify-between items-end">
            <span className="font-medium text-foreground">Total Keseluruhan</span>
            <span className="text-2xl font-black text-primary font-mono tracking-tight">
              Rp {getTotalAmount().toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <Button 
          className="w-full h-14 text-base font-bold transition-all hover:scale-[1.02] shadow-primary/25 shadow-xl"
          disabled={!hasItems || isProcessing}
          onClick={handleCheckout}
        >
          {isProcessing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <>
              Bayar Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
