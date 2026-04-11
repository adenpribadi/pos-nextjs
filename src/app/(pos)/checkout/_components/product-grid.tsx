"use client"

import { useState } from "react"
import { Product, Category } from "@prisma/client"
import { useCart } from "@/hooks/useCart"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

type ProductWithCategory = Product & {
  category: Category | null
}

export function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  const [search, setSearch] = useState("")
  const { addItem } = useCart()

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || 
           (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Search Header */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-10 h-12 bg-card border-border/50 shadow-sm rounded-xl focus-visible:ring-1 transition-all"
          placeholder="Cari produk atau SKU (Gunakan Barcode Scanner)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <p>Tidak ada produk ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                addItem({
                  productId: product.id,
                  name: product.name,
                  price: Number(product.price),
                  stock: product.stock,
                  image: product.image,
                })
              }}
              className="group relative flex flex-col bg-card rounded-2xl border border-border/50 p-4 text-left shadow-sm hover:shadow-xl hover:border-primary/50 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden"
            >
              {/* Decorative Background Blob */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              
              <div className="w-full h-32 bg-muted/30 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-4xl font-black text-muted-foreground/20 uppercase tracking-tighter">
                    {product.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <div className="space-y-1 z-10 w-full flex-1 flex flex-col justify-end">
                {product.category && (
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                    {product.category.name}
                  </span>
                )}
                <h3 className="font-semibold text-foreground leading-tight truncate w-full">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-muted-foreground text-xs font-mono">Stok: {product.stock}</span>
                  <span className="font-bold text-foreground">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
