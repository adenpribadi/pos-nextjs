"use client"

import { useState } from "react"
import { Product, Category } from "@prisma/client"
import { ProductGrid } from "./product-grid"
import { CartSidebar } from "./cart-sidebar"
import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/useCart"

type ProductWithCategory = Product & {
  category: Category | null
}

export function POSClientLayout({ initialProducts }: { initialProducts: ProductWithCategory[] }) {
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  const { getTotalItems } = useCart()
  const itemsCount = getTotalItems()

  return (
    <div className="flex h-full w-full bg-muted/20 relative overflow-hidden">
      {/* Kiri: Katalog Produk (Grid) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide pb-24 lg:pb-6">
        <ProductGrid products={initialProducts} />
      </div>

      {/* Mobile Cart Overlay Backdrop */}
      {isMobileCartOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileCartOpen(false)}
        />
      )}

      {/* Kanan: Sidebar Keranjang Belanja */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full md:w-[380px] lg:w-[420px] 
        bg-card border-l border-border/50 shadow-2xl flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${isMobileCartOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        {/* Mobile Close Button Header */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-border/50 bg-muted/20">
          <span className="font-bold">Proses Pesanan</span>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Actual Cart */}
        <div className="flex-1 overflow-hidden">
          <CartSidebar />
        </div>
      </div>

      {/* Mobile Floating Cart Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Button 
          onClick={() => setIsMobileCartOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 rounded-full px-8 py-6 h-auto text-lg font-bold flex items-center gap-3 animate-in slide-in-from-bottom"
        >
          <ShoppingCart className="h-6 w-6" />
          Lihat Keranjang
          {itemsCount > 0 && (
            <span className="bg-background text-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center -ml-1">
              {itemsCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
