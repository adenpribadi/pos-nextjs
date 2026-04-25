"use client"

import { useState, useEffect, useRef } from "react"
import { useCart } from "@/hooks/useCart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingCart, Loader2, ArrowRight, User, Search, X, ChevronDown, Banknote, CreditCard, QrCode, Receipt, UserPlus, Check, Ticket } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { getStoreSettings } from "@/app/actions/settings"
import { validatePromoCode } from "@/app/actions/promo"
import { cn } from "@/lib/utils"

type Customer = { id: string; name: string; phone: string | null; email: string | null }

const PAYMENT_METHODS = [
  { id: "CASH", label: "Tunai", icon: Banknote },
  { id: "TRANSFER", label: "Transfer", icon: QrCode },
  { id: "CARD", label: "Kartu", icon: CreditCard },
]

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000]

export function CartSidebar() {
  const {
    items, removeItem, updateQuantity, clearCart,
    getSubtotal, getTaxAmount, getTotalAmount, setTaxRate,
    discountGlobal, setGlobalDiscount, appliedPromo, setAppliedPromo
  } = useCart()

  // State kasir
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [taxEnabled, setTaxEnabled] = useState(true)
  const [taxLabel, setTaxLabel] = useState("PPN (11%)")

  // Customer state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState("")
  const [isCustomerOpen, setIsCustomerOpen] = useState(false)
  const customerRef = useRef<HTMLDivElement>(null)

  // Pembayaran state
  const [paymentMethod, setPaymentMethod] = useState("CASH")
  const [cashInput, setCashInput] = useState("")

  // Tahap checkout
  const [step, setStep] = useState<"cart" | "payment">("cart")

  // Promo state
  const [promoInput, setPromoInput] = useState("")
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)

  const total = hasMounted ? getTotalAmount() : 0
  const cashPaid = parseFloat(cashInput.replace(/\./g, "")) || 0
  const change = cashPaid - total
  const isChangeValid = paymentMethod !== "CASH" || cashPaid >= total

  useEffect(() => {
    setHasMounted(true)
    getStoreSettings().then(s => {
      setTaxEnabled(s.taxEnabled)
      setTaxLabel(`PPN (${Math.round(s.taxRate * 100)}%)`)
      setTaxRate(s.taxEnabled ? s.taxRate : 0)
    })
    fetch("/api/customers").then(r => r.json()).then(setCustomers).catch(() => {})
  }, [setTaxRate])

  // Tutup dropdown customer saat klik luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (customerRef.current && !customerRef.current.contains(e.target as Node)) {
        setIsCustomerOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch))
  )

  const formatCashInput = (val: string) => {
    const num = val.replace(/\D/g, "")
    return num ? parseInt(num).toLocaleString("id-ID") : ""
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    if (paymentMethod === "CASH" && cashPaid < total) {
      toast.error("Uang Tidak Cukup", { description: "Jumlah uang yang diterima kurang dari total tagihan." })
      return
    }

    setIsProcessing(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, discount: i.discount })),
          taxAmount: getTaxAmount(),
          totalAmount: getTotalAmount(),
          discount: discountGlobal,
          paymentMethod,
          customerId: selectedCustomer?.id || null,
          promoId: appliedPromo?.id || null,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Gagal memproses transaksi")
      }

      toast.success("Transaksi Berhasil!", {
        description: `Kembalian: Rp ${paymentMethod === "CASH" ? change.toLocaleString("id-ID") : "0"}`
      })
      clearCart()
      setSelectedCustomer(null)
      setCashInput("")
      setStep("cart")
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast.error("Gagal Memproses", { description: (err as Error).message })
    } finally {
      setIsProcessing(false)
    }
  }

  const hasItems = items.length > 0

  return (
    <div className="flex flex-col h-full bg-card">

      {/* ── HEADER ── */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight">Keranjang</h2>
            <p className="text-[10px] text-muted-foreground font-medium">
              {hasMounted ? `${items.length} item` : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasItems && hasMounted && step === "cart" && (
            <button onClick={clearCart} className="text-[10px] font-black text-destructive/70 hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5">
              Kosongkan
            </button>
          )}
          {step === "payment" && (
            <button onClick={() => setStep("cart")} className="text-[10px] font-black text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted flex items-center gap-1">
              ← Kembali
            </button>
          )}
        </div>
      </div>

      {/* ── PROMO CODE (Cart Step Only) ── */}
      {step === "cart" && hasItems && (
        <div className="px-4 py-3 border-b border-border/30 bg-muted/5 shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input 
                placeholder="MASUKKAN KODE PROMO" 
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                className={cn(
                  "h-10 pl-8 text-[11px] font-black font-mono tracking-widest bg-background border-border/50",
                  appliedPromo && "text-emerald-600 border-emerald-500/50 bg-emerald-50/30"
                )}
                disabled={!!appliedPromo || isValidatingPromo}
              />
              {appliedPromo && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase">
                  <Check className="h-2.5 w-2.5" />
                  Aktif
                </div>
              )}
            </div>
            
            {appliedPromo ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 px-3 border-destructive/20 text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setAppliedPromo(null)
                  setGlobalDiscount(0)
                  setPromoInput("")
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-10 px-4 font-black text-[11px] uppercase tracking-wider shadow-sm"
                onClick={async () => {
                  setIsValidatingPromo(true)
                  const res = await validatePromoCode(promoInput, getSubtotal(), selectedCustomer?.id)
                  if (res.success && res.data) {
                    setAppliedPromo({ id: res.data.id, code: res.data.code })
                    setGlobalDiscount(res.data.discountAmount)
                    toast.success("Promo Berhasil!", { description: `Diskon Rp ${res.data.discountAmount.toLocaleString("id-ID")} diterapkan.` })
                  } else {
                    toast.error("Promo Gagal", { description: res.error })
                  }
                  setIsValidatingPromo(false)
                }}
                disabled={!promoInput || isValidatingPromo}
              >
                {isValidatingPromo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Gunakan"}
              </Button>
            )}
          </div>
        </div>
      )}

      {step === "cart" && (
        <>
          {/* ── CUSTOMER SELECTOR ── */}
          <div className="px-4 py-3 border-b border-border/30 shrink-0">
            <div ref={customerRef} className="relative">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsCustomerOpen(v => !v)}
                onKeyDown={e => e.key === "Enter" && setIsCustomerOpen(v => !v)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left cursor-pointer select-none",
                  selectedCustomer
                    ? "bg-primary/5 border-primary/30 text-foreground"
                    : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                  selectedCustomer ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  {selectedCustomer ? (
                    <>
                      <p className="text-xs font-black truncate">{selectedCustomer.name}</p>
                      <p className="text-[10px] text-muted-foreground">{selectedCustomer.phone || selectedCustomer.email || "Pelanggan"}</p>
                    </>
                  ) : (
                    <p className="text-xs font-medium">Pilih Pelanggan (Opsional)</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedCustomer ? (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setSelectedCustomer(null); setCustomerSearch("") }}
                      className="h-5 w-5 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  ) : (
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isCustomerOpen && "rotate-180")} />
                  )}
                </div>
              </div>

              {/* Dropdown */}
              {isCustomerOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-2 border-b border-border/30">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        autoFocus
                        placeholder="Cari nama atau no. HP..."
                        className="w-full pl-8 pr-3 py-2 text-xs bg-muted/30 rounded-lg border border-border/30 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={customerSearch}
                        onChange={e => setCustomerSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {/* Opsi "Tanpa Pelanggan" */}
                    <button
                      onClick={() => { setSelectedCustomer(null); setIsCustomerOpen(false); setCustomerSearch("") }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left"
                    >
                      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                        <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Pelanggan Umum</p>
                        <p className="text-[10px] text-muted-foreground">Tanpa data pelanggan</p>
                      </div>
                    </button>
                    {filteredCustomers.length === 0 && customerSearch ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground">Tidak ada pelanggan ditemukan</div>
                    ) : (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedCustomer(c); setIsCustomerOpen(false); setCustomerSearch("") }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-primary/5 transition-colors text-left"
                        >
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                            {c.name.slice(0, 1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.phone || c.email || "—"}</p>
                          </div>
                          {selectedCustomer?.id === c.id && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── ITEM LIST ── */}
          {hasItems && hasMounted ? (
            <ScrollArea className="flex-1 px-3 py-3">
              <div className="space-y-2 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 p-2.5 bg-muted/20 border border-border/40 rounded-xl group">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs leading-tight truncate">{item.name}</p>
                      <p className="text-[10px] text-primary font-black font-mono mt-0.5">
                        Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quantity Control */}
                      <div className="flex items-center bg-background rounded-lg border border-border/50 h-7 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 h-full hover:bg-muted text-foreground transition-colors disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-black font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 h-full hover:bg-muted text-foreground transition-colors disabled:opacity-30"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      {/* Subtotal per item */}
                      <span className="text-xs font-black w-20 text-right font-mono">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-6 text-center space-y-3">
              <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-xs font-medium">
                {!hasMounted ? "Memuat keranjang..." : "Pilih produk untuk memulai transaksi"}
              </p>
            </div>
          )}

          {/* ── SUMMARY & NEXT ── */}
          <div className="shrink-0 border-t border-border/50 bg-card">
            <div className="px-5 py-4 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">Rp {hasMounted ? getSubtotal().toLocaleString("id-ID") : "0"}</span>
              </div>
              
              {hasMounted && discountGlobal > 0 && (
                <div className="flex justify-between text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1"><Ticket className="h-3 w-3" /> Diskon Promo</span>
                  <span className="font-mono">- Rp {discountGlobal.toLocaleString("id-ID")}</span>
                </div>
              )}
              {taxEnabled && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{taxLabel}</span>
                  <span className="font-mono">Rp {hasMounted ? getTaxAmount().toLocaleString("id-ID") : "0"}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                <span className="font-black text-sm">Total</span>
                <span className="text-2xl font-black text-primary font-mono tracking-tight">
                  Rp {hasMounted ? getTotalAmount().toLocaleString("id-ID") : "0"}
                </span>
              </div>
            </div>

            <div className="px-4 pb-4">
              <Button
                className="w-full h-12 font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all"
                disabled={!hasItems || !hasMounted}
                onClick={() => setStep("payment")}
              >
                Lanjut Pembayaran
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════
          STEP 2: PAYMENT PANEL
      ══════════════════════════════ */}
      {step === "payment" && (
        <>
          <ScrollArea className="flex-1">
            <div className="px-5 py-4 space-y-5">

              {/* Ringkasan belanja */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/40 space-y-1.5 text-xs">
                {items.slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate pr-2">{item.name} x{item.quantity}</span>
                    <span className="font-mono shrink-0">Rp {(item.price * item.quantity).toLocaleString("id-ID")}</span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-[10px] text-muted-foreground italic">+{items.length - 3} item lainnya...</p>
                )}
                <div className="pt-2 border-t border-border/40 flex justify-between font-black">
                  <span>Total Tagihan</span>
                  <span className="text-primary font-mono">Rp {getTotalAmount().toLocaleString("id-ID")}</span>
                </div>
                {selectedCustomer && (
                  <div className="flex items-center gap-1.5 pt-1 text-[10px] text-primary">
                    <User className="h-3 w-3" />
                    <span>{selectedCustomer.name}</span>
                  </div>
                )}
              </div>

              {/* Metode Pembayaran */}
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Metode Pembayaran</p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(m => {
                    const Icon = m.icon
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setPaymentMethod(m.id); setCashInput("") }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all",
                          paymentMethod === m.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                            : "bg-muted/30 border-border/40 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {m.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Input Tunai */}
              {paymentMethod === "CASH" && (
                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Uang Diterima</p>

                  {/* Quick cash preset buttons */}
                  {(() => {
                    // Generate preset: uang pas + pembulatan ke atas + nominal umum
                    const exactVal = Math.ceil(total)
                    const round1k = Math.ceil(total / 1000) * 1000
                    const round5k = Math.ceil(total / 5000) * 5000
                    const round10k = Math.ceil(total / 10000) * 10000
                    const round50k = Math.ceil(total / 50000) * 50000
                    const round100k = Math.ceil(total / 100000) * 100000

                    // Ambil nilai unik dan urutkan
                    const presets = [...new Set([exactVal, round1k, round5k, round10k, round50k, round100k])]
                      .filter(v => v >= total)
                      .sort((a, b) => a - b)
                      .slice(0, 5)

                    const currentCash = parseFloat(cashInput.replace(/\./g, "")) || 0

                    return (
                      <div className="grid grid-cols-3 gap-1.5">
                        {presets.map(preset => {
                          const isActive = currentCash === preset
                          return (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCashInput(preset.toLocaleString("id-ID"))}
                              className={cn(
                                "py-2 px-1 rounded-xl border text-[11px] font-black transition-all text-center",
                                isActive
                                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[0.97]"
                                  : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary"
                              )}
                            >
                              {preset === exactVal && preset === round1k ? "💵 Uang Pas" : `Rp ${(preset / 1000).toFixed(0)}rb`}
                            </button>
                          )
                        })}
                        {/* Tombol Reset */}
                        {cashInput !== "" && (
                          <button
                            type="button"
                            onClick={() => setCashInput("")}
                            className="py-2 px-1 rounded-xl border text-[11px] font-black transition-all text-center bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive/20"
                          >
                            ✕ Reset
                          </button>
                        )}
                      </div>
                    )
                  })()}

                  {/* Input uang */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={cashInput}
                      onChange={e => setCashInput(formatCashInput(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 text-xl font-black text-right bg-muted/30 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-mono tracking-tight"
                    />
                  </div>

                  {/* Kembalian */}
                  {cashPaid > 0 && (
                    <div className={cn(
                      "flex justify-between items-center p-3 rounded-xl border font-black",
                      change >= 0
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    )}>
                      <span className="text-xs uppercase tracking-widest">
                        {change >= 0 ? "💰 Kembalian" : "⚠️ Kurang"}
                      </span>
                      <span className="text-xl font-mono">
                        Rp {Math.abs(change).toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Non-cash info */}
              {paymentMethod !== "CASH" && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/40">
                  <Receipt className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    {paymentMethod === "TRANSFER"
                      ? "Pastikan bukti transfer telah diterima sebelum memproses."
                      : "Pastikan mesin EDC telah mencetak slip pembayaran."}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Tombol Proses */}
          <div className="shrink-0 px-4 pb-5 pt-3 border-t border-border/50 bg-card space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>Total</span>
              <span className="font-black text-foreground font-mono">Rp {getTotalAmount().toLocaleString("id-ID")}</span>
            </div>
            <Button
              className={cn(
                "w-full h-14 font-black text-base transition-all",
                isChangeValid
                  ? "shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95"
                  : "opacity-50 cursor-not-allowed"
              )}
              disabled={!isChangeValid || isProcessing}
              onClick={handleCheckout}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Proses Pembayaran
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
