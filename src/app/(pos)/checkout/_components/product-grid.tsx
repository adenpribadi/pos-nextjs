"use client"

import { useState, useEffect, useRef } from "react"
import { Product, Category } from "@prisma/client"
import { useCart } from "@/hooks/useCart"
import { Input } from "@/components/ui/input"
import { Search, LayoutGrid, Filter, X, Scan, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Html5Qrcode } from "html5-qrcode"
import { toast } from "sonner"
import { getCheckoutProducts } from "@/app/actions/product"

type ProductVariant = {
  id: string
  name: string
  price: number
  sortOrder: number
}

type ProductWithCategory = Omit<Product, "price" | "costPrice"> & {
  price: number
  costPrice: number | null
  category: Category | null
  variants: ProductVariant[]
}

interface ProductGridProps {
  initialProducts: ProductWithCategory[]
  initialHasMore: boolean
  categories: (Category & { productCount: number })[]
  totalCount: number
}

export function ProductGrid({
  initialProducts,
  initialHasMore,
  categories,
  totalCount,
}: ProductGridProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const { addItem, items, updateQuantity } = useCart()

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isScanOpen, setIsScanOpen] = useState(false)

  // Variant picker state
  const [variantPickerProduct, setVariantPickerProduct] = useState<ProductWithCategory | null>(null)

  // Scanner debounce refs to prevent frame double scans
  const lastScannedBarcodeRef = useRef<string>("")
  const lastScannedTimeRef = useRef<number>(0)
  
  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Refs for scanner callback to prevent camera restarts on state updates
  const productsRef = useRef(products)
  productsRef.current = products
  const itemsRef = useRef(items)
  itemsRef.current = items
  const addItemRef = useRef(addItem)
  addItemRef.current = addItem
  const updateQuantityRef = useRef(updateQuantity)
  updateQuantityRef.current = updateQuantity

  // Native Web Audio API Beep Synthesizer
  const playBeep = (type: "success" | "error" = "success") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      if (type === "success") {
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime) // High pitch
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.12)
      } else {
        oscillator.type = "sawtooth"
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime) // Error buzz
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.25)
      }
    } catch (err) {
      console.error("Gagal memutar bunyi beep:", err)
    }
  }

  // Debounce search input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(handler)
  }, [search])

  // Fetch filtered/searched products from database
  useEffect(() => {
    // Skip initial fetch on mount
    if (debouncedSearch === "" && activeCategory === null && products === initialProducts) {
      return
    }

    let isMounted = true

    const fetchFiltered = async () => {
      setIsLoading(true)
      try {
        const res = await getCheckoutProducts({
          page: 1,
          search: debouncedSearch,
          categoryId: activeCategory,
        })
        if (isMounted && res.success) {
          setProducts(res.products)
          setHasMore(res.hasMore)
          setPage(1)
        }
      } catch (err) {
        console.error("Gagal memuat produk terfilter:", err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchFiltered()

    return () => {
      isMounted = false
    }
  }, [debouncedSearch, activeCategory])

  // Infinite Scroll Page Loader Ref Pattern
  const loadMoreRef = useRef<() => void>(undefined)
  loadMoreRef.current = () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    const nextPage = page + 1
    getCheckoutProducts({
      page: nextPage,
      search: debouncedSearch,
      categoryId: activeCategory,
    })
      .then((res) => {
        if (res.success) {
          setProducts((prev) => {
            const ids = new Set(prev.map((p) => p.id))
            const filtered = res.products.filter((p) => !ids.has(p.id))
            return [...prev, ...filtered]
          })
          setHasMore(res.hasMore)
          setPage(nextPage)
        }
      })
      .catch((err) => console.error("Gagal memuat data lanjutan:", err))
      .finally(() => setIsLoading(false))
  }

  // IntersectionObserver trigger for sentinel
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreRef.current?.()
        }
      },
      { threshold: 0.1 }
    )
    const current = sentinelRef.current
    if (current) {
      observer.observe(current)
    }
    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  // Scanner lifecycle controller for POS
  useEffect(() => {
    let html5QrCode: any = null;
    
    if (isScanOpen) {
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode("checkout-scanner-viewport");
          
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 15,
            },
            (decodedText: string) => {
              // Debounce double scans of the same code within 2 seconds
              const now = Date.now()
              if (decodedText === lastScannedBarcodeRef.current && now - lastScannedTimeRef.current < 2000) {
                return
              }
              lastScannedBarcodeRef.current = decodedText
              lastScannedTimeRef.current = now

              // Find product matching barcode or sku locally first
              let matchedProduct = productsRef.current.find(p => p.barcode === decodedText || p.sku === decodedText)
              
              if (matchedProduct) {
                // Check current cart items
                const cartItemId = `${matchedProduct!.id}::default`
                const cartItem = itemsRef.current.find(item => item.id === cartItemId)
                if (cartItem) {
                  if (cartItem.quantity < matchedProduct!.stock) {
                    updateQuantityRef.current(cartItemId, cartItem.quantity + 1)
                    playBeep("success")
                    toast.success(`Ditambah: ${matchedProduct!.name} (Qty: ${cartItem.quantity + 1})`)
                  } else {
                    playBeep("error")
                    toast.error(`Gagal: Stok tidak mencukupi untuk ${matchedProduct!.name}`)
                  }
                } else {
                  addItemRef.current({
                    productId: matchedProduct!.id,
                    name: matchedProduct!.name,
                    price: Number(matchedProduct!.price),
                    stock: matchedProduct!.stock,
                    image: matchedProduct!.image
                  })
                  playBeep("success")
                  toast.success(`Ditambah ke keranjang: ${matchedProduct!.name}`)
                }
              } else {
                // If not found locally, fetch it from database via Server Action
                toast.loading("Mencari barcode di database...", { id: "barcode-lookup" })
                getCheckoutProducts({ search: decodedText, limit: 1 }).then(res => {
                  if (res.success && res.products.length > 0) {
                    toast.dismiss("barcode-lookup")
                    const dbProduct = res.products[0]
                    const cartItemId = `${dbProduct.id}::default`
                    const cartItem = itemsRef.current.find(item => item.id === cartItemId)
                    if (cartItem) {
                      if (cartItem.quantity < dbProduct.stock) {
                        updateQuantityRef.current(cartItemId, cartItem.quantity + 1)
                        playBeep("success")
                        toast.success(`Ditambah: ${dbProduct.name} (Qty: ${cartItem.quantity + 1})`)
                      } else {
                        playBeep("error")
                        toast.error(`Gagal: Stok tidak mencukupi untuk ${dbProduct.name}`)
                      }
                    } else {
                      addItemRef.current({
                        productId: dbProduct.id,
                        name: dbProduct.name,
                        price: Number(dbProduct.price),
                        stock: dbProduct.stock,
                        image: dbProduct.image
                      })
                      playBeep("success")
                      toast.success(`Ditambah ke keranjang: ${dbProduct.name}`)
                    }
                  } else {
                    // Fallback to search input
                    setSearch(decodedText)
                    playBeep("error")
                    toast.error(`Produk tidak terdaftar: ${decodedText}`, { id: "barcode-lookup" })
                  }
                }).catch(() => {
                  toast.error("Gagal menghubungi server", { id: "barcode-lookup" })
                  playBeep("error")
                })
              }
            },
            () => {}
          ).catch((err: any) => {
            console.error("Camera start failed:", err);
          });
        } catch (e) {
          console.error("Scanner init error:", e);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          if (html5QrCode.isScanning) {
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
            }).catch((err: any) => {
              console.error("Stop scanner error:", err);
            });
          }
        }
      };
    }
  }, [isScanOpen])

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search & Filter Row */}
      <div className="flex items-center gap-2 max-w-md shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10 h-12 bg-card border-border/50 shadow-sm rounded-xl focus-visible:ring-1 transition-all"
            placeholder="Cari produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsScanOpen(true)}
          className="h-12 px-4 rounded-xl border border-border/50 bg-card font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 hover:bg-muted/40 text-muted-foreground"
        >
          <Scan className="h-4 w-4" />
          <span className="hidden sm:inline">Scan</span>
        </button>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger render={
            <button
              type="button"
              className={cn(
                "h-12 px-4 rounded-xl border border-border/50 bg-card font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 hover:bg-muted/40",
                activeCategory !== null ? "border-primary text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {activeCategory !== null && (
                <span className="bg-primary text-white text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-bold">
                  1
                </span>
              )}
            </button>
          } />
          <SheetContent side="bottom" className="rounded-t-3xl border-t border-border/50 bg-card max-h-[80vh] sm:max-w-md sm:mx-auto flex flex-col p-0 gap-0 overflow-hidden">
            <SheetHeader className="p-4 border-b border-border/50 shrink-0">
              <SheetTitle className="text-left text-sm font-black uppercase tracking-wider text-foreground">
                Pilih Kategori
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
              {/* Tombol Semua Kategori */}
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null)
                  setIsFilterOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                  activeCategory === null
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-background border-border/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Semua Kategori
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black",
                  activeCategory === null ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {totalCount}
                </span>
              </button>

              {/* Daftar Kategori */}
              {categories.map(cat => {
                const count = cat.productCount
                const isActive = activeCategory === cat.id
                const catColor = cat.color || '#6366f1'

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(isActive ? null : cat.id)
                      setIsFilterOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                      isActive
                        ? "border-transparent text-white"
                        : "bg-background border-border/50 text-muted-foreground hover:bg-muted"
                    )}
                    style={isActive ? { backgroundColor: catColor } : undefined}
                  >
                    <span className="flex items-center gap-2">
                      <span 
                        className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/10" 
                        style={{ backgroundColor: isActive ? '#ffffff' : catColor }} 
                      />
                      {cat.name}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-black",
                      isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filter Pill Display */}
      {activeCategory !== null && (
        <div className="flex items-center gap-2 shrink-0 animate-in fade-in duration-200">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Kategori:</span>
          <Badge 
            variant="default" 
            className="text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 border-none shadow-sm text-white"
            style={{
              backgroundColor: categories.find(c => c.id === activeCategory)?.color || '#6366f1'
            }}
          >
            {categories.find(c => c.id === activeCategory)?.name}
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Hasil filter info */}
      {(search || activeCategory) && (
        <p className="text-xs text-muted-foreground font-medium">
          Menampilkan <span className="font-black text-foreground">{products.length}</span> produk
          {activeCategory && <span> dalam <span className="font-black text-primary">{categories.find(c => c.id === activeCategory)?.name}</span></span>}
          {search && <span> dengan kata kunci &quot;<span className="font-black text-foreground">{search}</span>&quot;</span>}
        </p>
      )}

      {/* Grid */}
      {products.length === 0 ? (
        isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-xs mt-2 font-bold">Memuat produk...</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-16">
            <Search className="h-10 w-10 opacity-20 mb-3" />
            <p className="font-bold">Tidak ada produk ditemukan.</p>
            <p className="text-xs mt-1 opacity-60">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                if (product.variants && product.variants.length > 0) {
                  // Produk dengan varian → tampilkan picker dialog
                  setVariantPickerProduct(product)
                } else {
                  // Produk tanpa varian → langsung masuk keranjang
                  addItem({
                    productId: product.id,
                    name: product.name,
                    price: Number(product.price),
                    stock: product.stock,
                    image: product.image,
                  })
                }
              }}
              className="group relative flex flex-col bg-card rounded-2xl border border-border/50 p-4 text-left shadow-sm hover:shadow-xl hover:border-primary/50 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary overflow-hidden"
            >
              {/* Decorative Background Blob */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>

              <div className="w-full h-32 bg-muted/30 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {product.image && !failedImages[product.id] ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={() => setFailedImages(prev => ({ ...prev, [product.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 p-4 text-center">
                    <span className="text-2xl font-black text-muted-foreground/45 uppercase tracking-tighter leading-none">
                      {product.name.slice(0, 2)}
                    </span>
                    <span className="text-[9px] font-bold tracking-tight text-muted-foreground/40 uppercase mt-1">
                      {product.category?.name || "Produk"}
                    </span>
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

      {/* Scroll Sentinel for Lazy Loading / Infinite Scroll */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center shrink-0">
        {isLoading && hasMore && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Memuat produk lainnya...
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <Dialog open={isScanOpen} onOpenChange={setIsScanOpen}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Scan Barcode / SKU</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full aspect-square max-h-[300px] overflow-hidden rounded-xl bg-black flex items-center justify-center border border-border">
            {/* Viewport for html5-qrcode */}
            <div id="checkout-scanner-viewport" className="w-full h-full object-cover [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full" />
            
            {/* Overlay decoration for barcode scanner */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-black/40 flex flex-col items-center justify-center">
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-sm"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-sm"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-sm"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-sm"></div>

              {/* Pulsing red line */}
              <div className="w-[80%] h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
            </div>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            Arahkan kamera ke barcode atau SKU produk. Barcode yang terbaca akan otomatis masuk ke keranjang.
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsScanOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/95 transition-all active:scale-95 cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Variant Picker Dialog ── */}
      <Dialog
        open={!!variantPickerProduct}
        onOpenChange={(open) => !open && setVariantPickerProduct(null)}
      >
        <DialogContent className="sm:max-w-sm p-0 rounded-2xl overflow-hidden">
          {variantPickerProduct && (
            <>
              {/* Header with product info */}
              <div className="flex items-center gap-3 p-5 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-muted/40 overflow-hidden shrink-0 flex items-center justify-center">
                  {variantPickerProduct.image ? (
                    <img
                      src={variantPickerProduct.image}
                      alt={variantPickerProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-black text-muted-foreground/40 uppercase">
                      {variantPickerProduct.name.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="font-black text-base leading-tight truncate">
                    {variantPickerProduct.name}
                  </DialogTitle>
                  {variantPickerProduct.category && (
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase"
                      style={{ color: variantPickerProduct.category.color || undefined }}
                    >
                      {variantPickerProduct.category.name}
                    </span>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">Stok: {variantPickerProduct.stock}</p>
                </div>
              </div>

              {/* Variant options */}
              <div className="p-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                  Pilih cara penjualan:
                </p>

                {/* Variant rows */}
                {variantPickerProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => {
                      addItem({
                        productId: variantPickerProduct.id,
                        variantId: variant.id,
                        variantName: variant.name,
                        name: variantPickerProduct.name,
                        price: variant.price,
                        stock: variantPickerProduct.stock,
                        image: variantPickerProduct.image,
                      })
                      setVariantPickerProduct(null)
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border/50 bg-background hover:border-primary/60 hover:bg-primary/5 transition-all active:scale-[0.98] group"
                  >
                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {variant.name}
                    </span>
                    <span className="font-black text-base font-mono text-primary">
                      Rp {variant.price.toLocaleString('id-ID')}
                    </span>
                  </button>
                ))}

                {/* Separator */}
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 border-t border-border/40" />
                  <span className="text-[10px] text-muted-foreground font-medium">atau</span>
                  <div className="flex-1 border-t border-border/40" />
                </div>

                {/* Harga normal (tanpa varian) */}
                <button
                  type="button"
                  onClick={() => {
                    addItem({
                      productId: variantPickerProduct.id,
                      name: variantPickerProduct.name,
                      price: variantPickerProduct.price,
                      stock: variantPickerProduct.stock,
                      image: variantPickerProduct.image,
                    })
                    setVariantPickerProduct(null)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-border/60 bg-muted/20 hover:border-muted-foreground/40 hover:bg-muted/40 transition-all active:scale-[0.98] group"
                >
                  <span className="font-medium text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Harga Normal
                  </span>
                  <span className="font-black text-base font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    Rp {variantPickerProduct.price.toLocaleString('id-ID')}
                  </span>
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
