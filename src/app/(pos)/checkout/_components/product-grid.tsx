"use client"

import { useState, useMemo } from "react"
import { Product, Category } from "@prisma/client"
import { useCart } from "@/hooks/useCart"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

type ProductWithCategory = Product & {
  category: Category | null
}

export function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { addItem } = useCart()

  // Ekstrak daftar kategori unik dari produk yang ada
  const categories = useMemo(() => {
    const map = new Map<string, Category>()
    products.forEach(p => {
      if (p.category) map.set(p.category.id, p.category)
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    const matchCategory = activeCategory === null || p.category?.id === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 h-12 bg-card border-border/50 shadow-sm rounded-xl focus-visible:ring-1 transition-all"
          placeholder="Cari produk atau SKU (Gunakan Barcode Scanner)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Tombol "Semua" */}
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0",
            activeCategory === null
              ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
              : "bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
          )}
        >
          <LayoutGrid className="h-3 w-3" />
          Semua
          <span className={cn(
            "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
            activeCategory === null ? "bg-white/20" : "bg-muted"
          )}>
            {products.length}
          </span>
        </button>

        {categories.map(cat => {
          const count = products.filter(p => p.category?.id === cat.id).length
          const isActive = activeCategory === cat.id
          // Gunakan warna kategori jika ada
          const catColor = cat.color || null

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(isActive ? null : cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all shrink-0",
                isActive
                  ? "text-white border-transparent shadow-md"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5"
              )}
              style={isActive && catColor ? {
                backgroundColor: catColor,
                boxShadow: `0 4px 14px 0 ${catColor}50`,
              } : isActive ? {} : {}}
            >
              {catColor && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: catColor }}
                />
              )}
              {cat.name}
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black",
                isActive ? "bg-white/20" : "bg-muted"
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Hasil filter info */}
      {(search || activeCategory) && (
        <p className="text-xs text-muted-foreground font-medium">
          Menampilkan <span className="font-black text-foreground">{filteredProducts.length}</span> produk
          {activeCategory && <span> dalam <span className="font-black text-primary">{categories.find(c => c.id === activeCategory)?.name}</span></span>}
          {search && <span> dengan kata kunci &quot;<span className="font-black text-foreground">{search}</span>&quot;</span>}
        </p>
      )}

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
          <Search className="h-10 w-10 opacity-20 mb-3" />
          <p className="font-bold">Tidak ada produk ditemukan.</p>
          <p className="text-xs mt-1 opacity-60">Coba ubah filter atau kata kunci pencarian.</p>
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
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase"
                    style={{ color: product.category.color || undefined }}
                  >
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
