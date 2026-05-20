"use client"

import { useState } from "react"
import { Search, ShoppingCart, Plus, Minus, Tag, LayoutGrid, Filter, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useCart } from "@/hooks/useCart"
import { Badge } from "@/components/ui/badge"
import { CustomerCart } from "./customer-cart"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Category {
  id: string
  name: string
  color?: string | null
  _count: {
    products: number
  }
}

interface Product {
  id: string
  sku: string
  name: string
  price: number
  image: string | null
  stock: number
  categoryId: string | null
  category: { name: string } | null
}

interface ProductGridProps {
  initialProducts: Product[]
  categories: Category[]
}

const CATEGORY_COLORS: Record<string, { bg: string, text: string, border: string, dot: string }> = {
  "Minyak Sachet": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200/50", dot: "bg-red-500" },
  "Minyak Kemasan": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200/50", dot: "bg-orange-500" },
  "Mie Instan": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200/50", dot: "bg-amber-500" },
  "Bumbu & Penyedap": { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200/50", dot: "bg-yellow-500" },
  "Bahan Pokok": { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200/50", dot: "bg-lime-500" },
  "Kopi & Teh (Sachet)": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200/50", dot: "bg-green-500" },
  "Susu (Sachet & Bubuk)": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200/50", dot: "bg-emerald-500" },
  "Minuman Kemasan": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200/50", dot: "bg-teal-500" },
  "Minuman Seduh / Cup": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200/50", dot: "bg-cyan-500" },
  "Jajanan": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200/50", dot: "bg-sky-500" },
  "Rokok": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200/50", dot: "bg-blue-500" },
  "Obat & Kesehatan": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200/50", dot: "bg-indigo-500" },
  "Sabun & Pembersih": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200/50", dot: "bg-violet-500" },
  "Perawatan Tubuh": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200/50", dot: "bg-purple-500" },
  "Popok": { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-200/50", dot: "bg-fuchsia-500" },
  "Mainan": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200/50", dot: "bg-pink-500" },
  "default": { bg: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-200/50", dot: "bg-zinc-500" }
}

const getCategoryStyle = (name: string) => {
  return CATEGORY_COLORS[name] || CATEGORY_COLORS["default"]
}

export function ProductGrid({ initialProducts, categories }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const { addItem, items, updateQuantity, removeItem } = useCart()

  const filteredProducts = initialProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId
    return matchesSearch && matchesCategory
  })

  const getItemCount = (productId: string) => {
    return items.find(i => i.productId === productId)?.quantity || 0
  }

  const CategoryList = ({ isMobile = false }) => (
    <div className="space-y-1.5">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start font-semibold transition-all h-10 px-3 relative",
          selectedCategoryId === null
            ? "bg-primary/5 text-primary hover:bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        onClick={() => setSelectedCategoryId(null)}
      >
        {selectedCategoryId === null && (
          <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />
        )}
        <LayoutGrid className={cn("mr-2.5 h-4 w-4", selectedCategoryId === null ? "text-primary" : "text-muted-foreground/60")} />
        Semua Produk
      </Button>
      {categories.map((category) => {
        const isSelected = selectedCategoryId === category.id
        const catColor = category.color || '#6366f1'
        
        return (
          <Button
            key={category.id}
            variant="ghost"
            className={cn(
              "w-full justify-between font-bold group transition-all duration-300 h-11 px-3 relative rounded-xl",
              isSelected
                ? "bg-background shadow-sm border border-border/50 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {isSelected && (
              <div
                className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                style={{ backgroundColor: catColor }}
              />
            )}
            <span className="flex items-center truncate">
              <div
                className="mr-3 h-2 w-2 rounded-full transition-transform duration-300 group-hover:scale-125"
                style={{ backgroundColor: catColor, opacity: isSelected ? 1 : 0.4 }}
              />
              {category.name}
            </span>
            <span
              className={cn(
                "ml-2 text-[10px] px-2.5 py-0.5 rounded-full font-black min-w-[28px] text-center transition-all duration-300",
                isSelected
                  ? "shadow-sm scale-110"
                  : "bg-muted/50 text-muted-foreground/60 group-hover:bg-muted group-hover:text-muted-foreground"
              )}
              style={isSelected ? {
                backgroundColor: `${catColor}18`,
                color: catColor,
              } : undefined}
            >
              {category._count.products}
            </span>
          </Button>
        )
      })}
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border/40 bg-background/40 backdrop-blur-xl p-4 overflow-hidden flex flex-col">
        <div className="mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 ml-1">Kategori</h2>
          <ScrollArea className="h-[calc(100vh-200px)] pr-2">
            <CategoryList />
          </ScrollArea>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/5">
        <div className="p-2 sm:p-3 pb-1 sm:pb-1.5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search items..."
                className="pl-10 h-11 text-xs bg-background border-border/40 shadow-sm rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Mobile Category Trigger */}
            <Sheet>
              <SheetTrigger render={
                <Button variant="outline" size="icon" className="lg:hidden h-9 w-9 sm:h-11 sm:w-11 shrink-0 border-border/50">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              } />
              <SheetContent side="left" className="w-[300px] border-r border-border/50 bg-card/95 backdrop-blur-xl">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left flex items-center gap-2">
                    <LayoutGrid className="h-5 w-5 text-primary" />
                    Pilih Kategori
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                  <CategoryList isMobile />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
            <Badge
              variant={selectedCategoryId === null ? "default" : "outline"}
              className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategoryId(null)}
            >
              Semua
            </Badge>
            {categories.map(cat => (
              <Badge
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card/30 rounded-3xl border-2 border-dashed border-border/50 mt-4">
              <div className="bg-muted p-6 rounded-full mb-4">
                <ShoppingCart className="h-12 w-12 opacity-20" />
              </div>
              <p className="text-xl font-medium">Produk tidak ditemukan</p>
              <p className="text-sm opacity-60">Coba gunakan kata kunci lain atau pilih kategori lain.</p>
              <Button
                variant="ghost"
                className="mt-4 text-primary"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategoryId(null)
                }}
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.map((p) => {
                const count = getItemCount(p.id)
                return (
                  <Card key={p.id} className="p-0 gap-0 overflow-hidden border-border/40 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-card hover:border-primary/30 rounded-xl flex flex-col h-full border">
                    <div className="aspect-[4/3] bg-muted/30 relative overflow-hidden shrink-0">
                      {p.image && !failedImages[p.id] ? (
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                          onError={() => setFailedImages(prev => ({ ...prev, [p.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 p-4 text-center">
                          <Tag className="h-8 w-8 rotate-12 mb-1.5 opacity-60 text-primary" />
                          <span className="text-[10px] font-bold tracking-tight text-muted-foreground uppercase">{p.category?.name || "Produk"}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                      {p.category && (
                        <div className="absolute top-3 left-3">
                          <span className={cn(
                            "backdrop-blur-xl px-3 py-1 rounded-full text-[10px] font-black shadow-lg border uppercase tracking-widest transition-transform duration-500 group-hover:-translate-y-0.5",
                            getCategoryStyle(p.category.name).bg,
                            getCategoryStyle(p.category.name).text,
                            getCategoryStyle(p.category.name).border
                          )}>
                            {p.category.name}
                          </span>
                        </div>
                      )}

                      {p.stock <= 5 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-[9px] font-black shadow-sm animate-pulse uppercase tracking-tighter">
                            Sisa {p.stock}
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-2 sm:p-3 pt-1.5 flex flex-col gap-1">
                      <div className="space-y-0.5">
                        <h3 className="font-bold text-[11px] sm:text-xs line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors leading-tight">
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-lg font-black text-foreground tracking-tighter">
                            <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground mr-0.5">Rp</span>
                            {p.price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] mt-auto pt-1.5 border-t border-border/40">
                        <div className="flex items-center gap-1 font-semibold">
                          <div className={cn(
                            "h-1 w-1 rounded-full",
                            p.stock > 10 ? "bg-emerald-500" : "bg-amber-500"
                          )} />
                          <span className="text-muted-foreground">Stok {p.stock}</span>
                        </div>
                        <span className="text-[8px] text-muted-foreground/50 font-mono">
                          #{p.sku.split('-').pop() || p.sku}
                        </span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-2 sm:p-3 pt-0">
                      {count > 0 ? (
                        <div className="flex items-center justify-between w-full bg-muted/50 rounded-lg p-0.5 border border-border/50">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-foreground hover:bg-background hover:text-primary transition-all"
                            onClick={() => count === 1 ? removeItem(p.id) : updateQuantity(p.id, count - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-black text-foreground text-xs px-1">{count}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-foreground hover:bg-background hover:text-primary transition-all"
                            onClick={() => updateQuantity(p.id, count + 1)}
                            disabled={count >= p.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full h-8 bg-zinc-900 text-white hover:bg-primary font-bold rounded-lg transition-all text-[10px] group"
                          onClick={() => addItem({
                            productId: p.id,
                            name: p.name,
                            price: p.price,
                            stock: p.stock,
                            image: p.image
                          })}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          Keranjang
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <CustomerCart />
    </div>
  )
}
