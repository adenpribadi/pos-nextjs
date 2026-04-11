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

export function ProductGrid({ initialProducts, categories }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
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
    <div className="space-y-1">
      <Button
        variant={selectedCategoryId === null ? "default" : "ghost"}
        className={cn(
          "w-full justify-start font-medium transition-all",
          selectedCategoryId === null 
            ? "shadow-md shadow-primary/20" 
            : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setSelectedCategoryId(null)}
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        Semua Produk
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategoryId === category.id ? "default" : "ghost"}
          className={cn(
            "w-full justify-between font-medium group transition-all",
            selectedCategoryId === category.id 
              ? "shadow-md shadow-primary/20" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => setSelectedCategoryId(category.id)}
        >
          <span className="flex items-center truncate">
             {selectedCategoryId === category.id && <Check className="mr-2 h-4 w-4" />}
             {category.name}
          </span>
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 text-[10px] px-1.5 h-4 min-w-[20px] justify-center",
              selectedCategoryId === category.id ? "bg-primary-foreground/20 text-white" : "bg-muted text-muted-foreground"
            )}
          >
            {category._count.products}
          </Badge>
        </Button>
      ))}
    </div>
  )

  return (
    <div className="flex h-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 border-r border-border/50 bg-background/40 backdrop-blur-xl p-6 overflow-hidden flex flex-col">
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Kategori</h2>
          <ScrollArea className="h-[calc(100vh-250px)] pr-4">
             <CategoryList />
          </ScrollArea>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/5">
        <div className="p-6 pb-0 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Cari produk di etalase..." 
                className="pl-10 h-11 bg-card/50 backdrop-blur-sm shadow-sm border-border/50 focus-visible:ring-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Mobile Category Trigger */}
            <Sheet>
              <SheetTrigger render={
                <Button variant="outline" size="icon" className="lg:hidden h-11 w-11 shrink-0 border-border/50">
                  <Filter className="h-5 w-5" />
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

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar lg:hidden">
             <Badge 
              variant={selectedCategoryId === null ? "default" : "outline"}
              className="px-4 py-1.5 cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedCategoryId(null)}
             >
               Semua
             </Badge>
             {categories.map(cat => (
               <Badge
                key={cat.id}
                variant={selectedCategoryId === cat.id ? "default" : "outline"}
                className="px-4 py-1.5 cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedCategoryId(cat.id)}
               >
                 {cat.name}
               </Badge>
             ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-muted-foreground bg-card/30 rounded-3xl border-2 border-dashed border-border/50">
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
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredProducts.map((p) => {
                const count = getItemCount(p.id)
                return (
                  <Card key={p.id} className="overflow-hidden border-border/50 group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 bg-card/60 backdrop-blur-sm rounded-2xl flex flex-col h-full border hover:border-primary/50">
                    <div className="aspect-square bg-muted relative overflow-hidden shrink-0">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-muted to-muted/50">
                          <Tag className="h-16 w-16 rotate-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {p.category && (
                        <Badge className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md border-none text-[10px] font-bold shadow-lg">
                          {p.category.name}
                        </Badge>
                      )}
                      
                      {p.stock <= 5 && (
                        <Badge variant="destructive" className="absolute top-3 right-3 text-[10px] font-black border-none shadow-lg animate-pulse">
                          STOK TERBATAS
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 flex-1">
                      <h3 className="font-bold text-sm md:text-base line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors leading-tight">
                        {p.name}
                      </h3>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Rp</span>
                        <span className="text-lg md:text-xl font-black text-foreground antialiased tracking-tight">
                          {p.price.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] md:text-xs">
                         <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                           <div className={cn(
                             "h-1.5 w-1.5 rounded-full",
                             p.stock > 10 ? "bg-emerald-500" : "bg-orange-500"
                           )} />
                           Stok: {p.stock}
                         </div>
                         <span className="bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold">
                           # {p.sku}
                         </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      {count > 0 ? (
                        <div className="flex items-center justify-between w-full bg-primary/10 rounded-xl p-1.5 border border-primary/20">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-primary hover:bg-primary/20 transition-colors"
                            onClick={() => count === 1 ? removeItem(p.id) : updateQuantity(p.id, count - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-bold text-primary text-base">{count}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-primary hover:bg-primary/20 transition-colors"
                            onClick={() => updateQuantity(p.id, count + 1)}
                            disabled={count >= p.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          className="w-full h-11 shadow-lg shadow-primary/20 font-bold rounded-xl active:scale-95 transition-all text-sm group"
                          onClick={() => addItem({
                            productId: p.id,
                            name: p.name,
                            price: p.price,
                            stock: p.stock,
                            image: p.image
                          })}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                          Tambah ke Keranjang
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
