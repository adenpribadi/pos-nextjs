"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Plus, Minus, Truck, Clock, CheckCircle2, XCircle, Search, X, UserPlus, Package, ChevronDown, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, TrendingUp, WalletCards, Coins } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  createBulkSupplyShipment, createQuickSupplier, createQuickProduct,
  approveSupplyShipment, rejectSupplyShipment, approveBulkSupplyShipments,
  type BulkShipmentItem,
} from "@/app/actions/supply-shipment"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  sku: string
  name: string
  stock: number
  image: string | null
  costPrice?: number | null
  price: number
}

interface Supplier {
  id: string
  name: string | null
  phone?: string | null
}

interface SupplyShipment {
  id: string
  productId: string
  product: { name: string; sku: string; price: number }
  supplier: { id: string; name: string | null }
  admin: { name: string | null } | null
  quantity: number
  costPrice: number | null
  notes: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}

// ─── Combobox Component ───────────────────────────────────────────────────────

interface ComboboxOption { id: string; label: string; sub?: string }

interface ComboboxProps {
  options: ComboboxOption[]
  value: string | null
  onChange: (id: string, label: string) => void
  placeholder?: string
  onAddNew?: () => void
  addNewLabel?: string
  disabled?: boolean
}

function Combobox({ options, value, onChange, placeholder = "Pilih...", onAddNew, addNewLabel = "Tambah Baru", disabled }: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [coords, setCoords] = useState({ top: 0, bottom: 0, left: 0, width: 0, windowHeight: 0 })

  const selected = value ? options.find(o => o.id === value) : null

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
      )
    : options

  const updateCoords = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        windowHeight: window.innerHeight
      })
    }
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    if (open) {
      updateCoords()
      window.addEventListener("scroll", updateCoords, true)
      window.addEventListener("resize", updateCoords)
      return () => {
        window.removeEventListener("scroll", updateCoords, true)
        window.removeEventListener("resize", updateCoords)
      }
    }
  }, [open, updateCoords])

  const handleOpen = () => {
    if (disabled) return
    updateCoords()
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSelect = (opt: ComboboxOption) => {
    onChange(opt.id, opt.label)
    setOpen(false)
    setQuery("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
  }

  const dropUp = (coords.windowHeight - coords.bottom) < 250 && coords.top > 250
  
  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    left: coords.left,
    width: coords.width,
    zIndex: 99999,
  }
  
  if (dropUp) {
    dropdownStyle.bottom = coords.windowHeight - coords.top + 4
  } else {
    dropdownStyle.top = coords.bottom + 4
  }

  const dropdownContent = open ? (
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Search Input */}
      <div className="p-2 border-b border-border/40 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ketik untuk mencari..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted/30 rounded-lg border border-border/30 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="max-h-52 overflow-y-auto">
        {/* Add New Button */}
        {onAddNew && (
          <button
            type="button"
            onClick={() => { setOpen(false); setQuery(""); onAddNew() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors font-semibold border-b border-border/30 shrink-0"
          >
            <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
              <Plus className="h-3.5 w-3.5" />
            </div>
            {addNewLabel}
            {query && <span className="text-xs text-muted-foreground font-normal ml-1">"{query}"</span>}
          </button>
        )}

        {/* Options */}
        {filtered.length === 0 ? (
          <div className="px-3 py-5 text-center text-sm text-muted-foreground">
            {options.length === 0 ? "Belum ada data." : "Tidak ditemukan."}
          </div>
        ) : (
          filtered.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors",
                value === opt.id && "bg-primary/5 text-primary font-semibold"
              )}
            >
              <div>
                <p className="font-medium leading-tight">{opt.label}</p>
                {opt.sub && <p className="text-[11px] text-muted-foreground">{opt.sub}</p>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <div ref={ref} className="relative w-full">
        {/* Trigger */}
        <div
          role="combobox"
          aria-expanded={open}
          onClick={handleOpen}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer select-none transition-all",
            "hover:border-primary/50 focus-visible:outline-none",
            open && "border-primary ring-1 ring-primary/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className={selected ? "text-foreground font-medium truncate pr-2" : "text-muted-foreground truncate pr-2"}>
            {selected ? selected.label : placeholder}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {selected && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </div>
        </div>
      </div>
      {open && typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </>
  )
}

// ─── Product Row ──────────────────────────────────────────────────────────────

interface ProductRow {
  uid: string
  productId: string
  productName: string
  quantity: number
  costPrice: string
}

function makeRow(): ProductRow {
  return { uid: Math.random().toString(36).slice(2), productId: "", productName: "", quantity: 1, costPrice: "" }
}

// ─── Add Supplier Dialog ──────────────────────────────────────────────────────

function AddSupplierDialog({
  open, onClose, onCreated, initialName
}: {
  open: boolean
  onClose: () => void
  onCreated: (s: Supplier) => void
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (open) setName(initialName) }, [open, initialName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createQuickSupplier(name, phone)
    if (res.success && res.supplier) {
      toast.success("Supplier berhasil ditambahkan!")
      onCreated(res.supplier)
      onClose()
    } else {
      toast.error(res.error || "Gagal menambahkan supplier")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()} disablePointerDismissal>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Tambah Supplier Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="sup-name">Nama Supplier <span className="text-destructive">*</span></Label>
            <Input id="sup-name" value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Toko Grosir Maju" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sup-phone">No. HP / WhatsApp (Opsional)</Label>
            <Input id="sup-phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Misal: 08123456789" />
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Menyimpan..." : "Simpan Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Product Dialog ───────────────────────────────────────────────────────

function AddProductDialog({
  open, onClose, onCreated, initialName
}: {
  open: boolean
  onClose: () => void
  onCreated: (p: Product) => void
  initialName: string
}) {
  const [name, setName] = useState(initialName)
  const [sku, setSku] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (open) { setName(initialName); setSku(""); setPrice(""); setCostPrice(""); setImageFile(null) } }, [open, initialName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append("name", name)
    formData.append("sku", sku)
    formData.append("price", price)
    if (costPrice) formData.append("costPrice", costPrice)
    if (imageFile) formData.append("image", imageFile)

    const res = await createQuickProduct(formData)
    if (res.success && res.product) {
      toast.success("Produk berhasil ditambahkan!")
      onCreated({
        id: res.product.id,
        name: res.product.name,
        sku: res.product.sku,
        stock: res.product.stock,
        image: res.product.image,
        costPrice: res.product.costPrice != null ? Number(res.product.costPrice) : null,
        price: Number(res.product.price),
      })
      onClose()
    } else {
      toast.error(res.error || "Gagal menambahkan produk")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()} disablePointerDismissal>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Tambah Produk Baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          <div className="space-y-2">
            <Label>Nama Produk <span className="text-destructive">*</span></Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Misal: Indomie Goreng" required />
          </div>
          <div className="space-y-2">
            <Label>SKU / Kode Barang <span className="text-destructive">*</span></Label>
            <Input value={sku} onChange={e => setSku(e.target.value.toUpperCase())} placeholder="Misal: IMG-001" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>HPP/Satuan</Label>
              <Input type="number" min="0" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="2500" />
            </div>
            <div className="space-y-2">
              <Label>Harga Jual <span className="text-destructive">*</span></Label>
              <Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="3000" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Foto Produk (Opsional)</Label>
            <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
          </div>
          <p className="text-[11px] text-muted-foreground">Stok awal = 0. Akan bertambah setelah pengiriman divalidasi.</p>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={loading || !name.trim() || !sku.trim() || !price}>
              {loading ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SupplyShipmentClient({
  products: initialProducts,
  shipments,
  suppliers: initialSuppliers = [],
  isAdmin = false,
}: {
  products: Product[]
  shipments: SupplyShipment[]
  suppliers?: Supplier[]
  isAdmin?: boolean
}) {
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Supplier & Product lists (can grow via quick create)
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Form state
  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [notes, setNotes] = useState("")
  const [rows, setRows] = useState<ProductRow[]>([makeRow()])

  // Add Supplier dialog
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const [addSupplierInitialName, setAddSupplierInitialName] = useState("")

  // Add Product dialog (per-row)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [addProductInitialName, setAddProductInitialName] = useState("")
  const [addProductTargetRowUid, setAddProductTargetRowUid] = useState<string | null>(null)

  // ── Filter state ────────────────────────────────────────────────────────
  const [filterStartDate, setFilterStartDate] = useState<string>("")
  const [filterEndDate, setFilterEndDate] = useState<string>("")
  const [filterSupplierId, setFilterSupplierId] = useState<string>("all")
  const [filterNote, setFilterNote] = useState<string>("")

  const setDefaultFilters = useCallback(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    const fmt = (d: Date) => {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }
    
    setFilterStartDate(fmt(firstDay))
    setFilterEndDate(fmt(lastDay))
    setFilterSupplierId("all")
    setFilterNote("")
  }, [])

  useEffect(() => {
    setDefaultFilters()
  }, [setDefaultFilters])

  const filteredShipments = shipments.filter(shipment => {
    if (filterStartDate || filterEndDate) {
      const d = new Date(shipment.createdAt)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const shipmentDate = `${yyyy}-${mm}-${dd}`
      
      if (filterStartDate && shipmentDate < filterStartDate) return false
      if (filterEndDate && shipmentDate > filterEndDate) return false
    }
    if (filterSupplierId !== "all") {
      if (shipment.supplier.id !== filterSupplierId) return false
    }
    if (filterNote && filterNote.trim() !== "") {
      if (!shipment.notes || !shipment.notes.toLowerCase().includes(filterNote.toLowerCase())) return false
    }
    return true
  })

  // ── Summary ────────────────────────────────────────────────────────────────
  const profitSummary = filteredShipments
    .filter(s => s.status === "APPROVED")
    .reduce(
      (acc, s) => {
        const qty = s.quantity
        const cost = (s.costPrice || 0) * qty
        const revenue = (s.product.price || 0) * qty
        return {
          totalCost: acc.totalCost + cost,
          totalRevenue: acc.totalRevenue + revenue,
          totalProfit: acc.totalProfit + (revenue - cost),
          itemCount: acc.itemCount + qty,
        }
      },
      { totalCost: 0, totalRevenue: 0, totalProfit: 0, itemCount: 0 }
    )

  // ── Pagination & Infinite Scroll ───────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileVisibleCount, setMobileVisibleCount] = useState(5)
  const [desktopItemsPerPage, setDesktopItemsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
    setMobileVisibleCount(5)
  }, [filterStartDate, filterEndDate, filterSupplierId, filterNote])

  const desktopTotalPages = Math.ceil(filteredShipments.length / desktopItemsPerPage)
  const desktopData = filteredShipments.slice((currentPage - 1) * desktopItemsPerPage, currentPage * desktopItemsPerPage)
  const mobileData = filteredShipments.slice(0, mobileVisibleCount)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect()
    if (node) {
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setMobileVisibleCount(prev => prev + 5)
        }
      })
      observer.current.observe(node)
    }
  }, [])

  // ── Row helpers ────────────────────────────────────────────────────────────

  const addRow = () => setRows(prev => [...prev, makeRow()])

  const removeRow = (uid: string) =>
    setRows(prev => prev.length > 1 ? prev.filter(r => r.uid !== uid) : prev)

  const updateRow = (uid: string, patch: Partial<ProductRow>) =>
    setRows(prev => prev.map(r => r.uid === uid ? { ...r, ...patch } : r))

  // ── Combobox option builders ────────────────────────────────────────────────

  const supplierOptions: ComboboxOption[] = suppliers.map(s => ({
    id: s.id,
    label: s.name || "Unnamed Supplier",
    sub: s.phone || undefined,
  }))

  const productOptions: ComboboxOption[] = products.map(p => ({
    id: p.id,
    label: p.name,
    sub: `SKU: ${p.sku} · Stok: ${p.stock}`,
  }))

  // ── Draft Persistence ───────────────────────────────────────────────────────
  const DRAFT_KEY = "supply-shipment-draft"
  const [isDraftLoaded, setIsDraftLoaded] = useState(false)

  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        const parsed = JSON.parse(draft)
        if (parsed.selectedSupplierId) setSelectedSupplierId(parsed.selectedSupplierId)
        if (parsed.notes) setNotes(parsed.notes)
        if (parsed.rows && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
          setRows(parsed.rows)
        }
      }
    } catch (e) {}
    setIsDraftLoaded(true)
  }, [])

  useEffect(() => {
    if (!isDraftLoaded) return
    const hasData = selectedSupplierId || notes || rows.some(r => r.productId || r.costPrice || r.quantity > 1)
    if (hasData) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedSupplierId, notes, rows }))
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
  }, [selectedSupplierId, notes, rows, isDraftLoaded])

  useEffect(() => {
    const hasData = selectedSupplierId || notes || rows.some(r => r.productId)
    if (!hasData) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [selectedSupplierId, notes, rows])

  // ── Reset form ──────────────────────────────────────────────────────────────

  const resetForm = () => {
    setSelectedSupplierId("")
    setNotes("")
    setRows([makeRow()])
    localStorage.removeItem(DRAFT_KEY)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupplierId) { toast.error("Pilih supplier terlebih dahulu."); return }

    const items: BulkShipmentItem[] = rows
      .filter(r => r.productId)
      .map(r => ({
        productId: r.productId,
        quantity: r.quantity,
        costPrice: r.costPrice ? parseFloat(r.costPrice) : null,
      }))

    if (items.length === 0) { toast.error("Tambahkan minimal 1 produk."); return }

    // Auto-fill HPP from product.costPrice if user didn't fill
    const enrichedItems = items.map(item => {
      if (item.costPrice === null) {
        const prod = products.find(p => p.id === item.productId)
        if (prod?.costPrice != null) return { ...item, costPrice: Number(prod.costPrice) }
      }
      return item
    })

    setIsSubmitting(true)
    const res = await createBulkSupplyShipment({
      supplierId: selectedSupplierId,
      notes,
      items: enrichedItems,
    })

    if (res.success) {
      toast.success("Pengiriman Berhasil Diajukan!", {
        description: `${res.count} produk dalam struk pembelian ini telah dicatat.`
      })
      setIsRequestOpen(false)
      resetForm()
    } else {
      toast.error("Gagal", { description: res.error })
    }
    setIsSubmitting(false)
  }

  // ── Approve / Reject ────────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    if (!confirm("Validasi dan terima pengiriman stok ini?")) return
    const res = await approveSupplyShipment(id)
    if (res.success) toast.success("Pengiriman Divalidasi & Stok Bertambah")
    else toast.error("Gagal Validasi", { description: res.error })
  }

  const handleReject = async (id: string) => {
    const reason = prompt("Alasan penolakan pengiriman:")
    if (reason === null) return
    const res = await rejectSupplyShipment(id, reason)
    if (res.success) toast.success("Pengiriman Ditolak")
    else toast.error("Gagal", { description: res.error })
  }

  const handleBulkApprove = async () => {
    const pendingIds = filteredShipments
      .filter(s => s.status === "PENDING")
      .map(s => s.id)

    if (pendingIds.length === 0) {
      toast.error("Tidak ada pengajuan menunggu di layar ini.")
      return
    }

    if (!confirm(`Validasi dan terima ${pendingIds.length} pengiriman sekaligus?`)) return
    
    setIsSubmitting(true)
    const res = await approveBulkSupplyShipments(pendingIds)
    if (res.success) toast.success(`${res.count} Pengiriman Divalidasi!`)
    else toast.error("Gagal Validasi", { description: res.error })
    setIsSubmitting(false)
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <Card className={cn(
        "border-primary/20 bg-primary/5 shadow-none group overflow-hidden relative",
        isAdmin && "border-amber-500/20 bg-amber-500/5"
      )}>
        <div className={cn(
          "absolute right-0 top-0 h-full w-32 bg-primary/10 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-500",
          isAdmin && "bg-amber-500/10"
        )} />
        <CardContent className="p-6 flex items-center justify-between relative">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Truck className={cn("h-5 w-5", isAdmin ? "text-amber-500" : "text-primary")} />
              {isAdmin ? "Input Manual Pasokan?" : "Siap Kirim Pasokan?"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isAdmin
                ? "Catat struk pembelian — bisa beberapa produk sekaligus."
                : "Informasikan pengiriman barang Anda untuk divalidasi Admin."}
            </p>
          </div>
          <Button
            onClick={() => setIsRequestOpen(true)}
            className={cn("shadow-lg", isAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" : "shadow-primary/20")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdmin ? "Input Struk Pembelian" : "Buat Pengiriman Baru"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Summary Stats ──────────────────────────────────────────────────── */}
      {isAdmin && profitSummary.itemCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Nilai HPP</CardTitle>
              <WalletCards className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">Rp {profitSummary.totalCost.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total modal dari {profitSummary.itemCount} unit produk.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estimasi Omset</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-primary">Rp {profitSummary.totalRevenue.toLocaleString("id-ID")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Jika terjual habis dengan harga jual saat ini.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-600 uppercase tracking-wider">Estimasi Keuntungan</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-emerald-600">Rp {profitSummary.totalProfit.toLocaleString("id-ID")}</div>
              <p className="text-xs text-emerald-600/70 mt-1">
                Omset dikurangi HPP pasokan disetujui.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-end bg-card/50 backdrop-blur-md p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="space-y-1.5 w-full sm:w-[320px]">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rentang Tanggal</Label>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              value={filterStartDate} 
              onChange={e => setFilterStartDate(e.target.value)}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground font-medium">s/d</span>
            <Input 
              type="date" 
              value={filterEndDate} 
              onChange={e => setFilterEndDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        {isAdmin && (
          <>
            <div className="space-y-1.5 w-full sm:w-[250px]">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier</Label>
              <Combobox
                options={[{ id: "all", label: "Semua Supplier" }, ...supplierOptions]}
                value={filterSupplierId}
                onChange={(id) => setFilterSupplierId(id || "all")}
                placeholder="Pilih Supplier..."
              />
            </div>
            <div className="space-y-1.5 w-full sm:w-[250px]">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catatan / Struk</Label>
              <Input 
                value={filterNote} 
                onChange={e => setFilterNote(e.target.value)}
                placeholder="Cari no. struk/catatan..."
              />
            </div>
          </>
        )}
        {(filterStartDate || filterEndDate || filterSupplierId !== "all" || filterNote) && (
          <Button 
            variant="ghost" 
            onClick={setDefaultFilters}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 mb-0.5"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>

      {/* ── Shipment Table ───────────────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className={cn("h-5 w-5", isAdmin ? "text-amber-500" : "text-primary")} />
            {isAdmin ? "Antrean Validasi Supply Shipment" : "Daftar Pengiriman Anda"}
          </CardTitle>
          {isAdmin && filteredShipments.some(s => s.status === "PENDING") && (
            <Button 
              size="sm" 
              onClick={handleBulkApprove} 
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Terima Semua ({filteredShipments.filter(s => s.status === "PENDING").length})
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="whitespace-nowrap">Tgl. Pengajuan</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">HPP/Satuan</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Tgl. Selesai</TableHead>
                  <TableHead>Verifikator</TableHead>
                  {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {desktopData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 10 : 9} className="h-32 text-center text-muted-foreground">
                      Belum ada data pengiriman pasokan.
                    </TableCell>
                  </TableRow>
                ) : (
                  desktopData.map(shipment => (
                    <TableRow key={shipment.id} className="group/row">
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(shipment.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {shipment.product.sku}
                      </TableCell>
                      <TableCell className="font-medium text-sm group-hover/row:text-primary transition-colors">
                        {shipment.product.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.supplier.name || "Unknown"}
                        {shipment.notes && (
                          <span className="text-muted-foreground ml-1" title={shipment.notes}>📝</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold text-sm">
                        {shipment.quantity}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {shipment.costPrice != null ? (
                          <span className="text-amber-600 font-medium">Rp {Number(shipment.costPrice).toLocaleString("id-ID")}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant={shipment.status === "APPROVED" ? "default" : shipment.status === "REJECTED" ? "destructive" : "secondary"}
                            className={cn(
                              "flex items-center gap-1.5 w-fit px-2 py-0.5 shadow-none",
                              shipment.status === "APPROVED" && "bg-emerald-500/10 text-emerald-500 border-none",
                              shipment.status === "PENDING" && "bg-amber-500/10 text-amber-500 border-none"
                            )}
                          >
                            {shipment.status === "PENDING" && <Clock className="h-3 w-3" />}
                            {shipment.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                            {shipment.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                            {shipment.status === "PENDING" ? "MENUNGGU" : shipment.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {shipment.status !== "PENDING" 
                          ? new Date(shipment.updatedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) 
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {shipment.status !== "PENDING" && shipment.admin ? shipment.admin.name : "—"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {shipment.status === "PENDING" && (
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-500" onClick={() => handleApprove(shipment.id)}>
                                Terima
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 border-destructive/50 text-destructive hover:bg-destructive/5 hover:border-destructive" onClick={() => handleReject(shipment.id)}>
                                Tolak
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {desktopTotalPages > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-border/50 text-sm">
                <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                  <div>
                    Menampilkan <span className="font-semibold text-foreground">{(currentPage - 1) * desktopItemsPerPage + (desktopData.length > 0 ? 1 : 0)} - {(currentPage - 1) * desktopItemsPerPage + desktopData.length}</span> dari <span className="font-semibold text-foreground">{filteredShipments.length}</span> produk
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Tampilkan:</span>
                    <select
                      value={desktopItemsPerPage}
                      onChange={(e) => {
                        setDesktopItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="h-8 rounded-md border border-border/50 bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border-border/50 bg-background hover:bg-muted"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border-border/50 bg-background hover:bg-muted"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {Array.from({ length: desktopTotalPages }, (_, i) => i + 1)
                    .filter(p => {
                      if (desktopTotalPages <= 7) return true;
                      if (p === 1 || p === desktopTotalPages) return true;
                      if (p >= currentPage - 1 && p <= currentPage + 1) return true;
                      return false;
                    })
                    .map((p, i, arr) => (
                      <div key={p} className="flex items-center gap-1">
                        {i > 0 && p - arr[i - 1] > 1 && <span className="text-muted-foreground px-1">...</span>}
                        <Button
                          variant={currentPage === p ? "default" : "outline"}
                          size="sm"
                          className={cn(
                            "h-8 min-w-8 p-0 px-2 border-border/50",
                            currentPage === p ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" : "bg-background hover:bg-muted text-foreground"
                          )}
                          onClick={() => setCurrentPage(p)}
                        >
                          {p}
                        </Button>
                      </div>
                    ))
                  }

                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border-border/50 bg-background hover:bg-muted"
                    onClick={() => setCurrentPage(prev => Math.min(desktopTotalPages, prev + 1))}
                    disabled={currentPage === desktopTotalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-md border-border/50 bg-background hover:bg-muted"
                    onClick={() => setCurrentPage(desktopTotalPages)}
                    disabled={currentPage === desktopTotalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/50">
            {mobileData.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Belum ada data.</div>
            ) : (
              mobileData.map(shipment => (
                <div key={shipment.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-base leading-tight">{shipment.product.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">{shipment.product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-primary">{shipment.quantity}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold">Jumlah</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant={shipment.status === "APPROVED" ? "default" : shipment.status === "REJECTED" ? "destructive" : "secondary"}
                      className={cn("flex items-center gap-1.5 w-fit px-2 py-0.5 shadow-none", shipment.status === "APPROVED" && "bg-emerald-500/10 text-emerald-500 border-none", shipment.status === "PENDING" && "bg-amber-500/10 text-amber-500 border-none")}>
                      {shipment.status === "PENDING" && <Clock className="h-3 w-3" />}
                      {shipment.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                      {shipment.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                      {shipment.status === "PENDING" ? "MENUNGGU" : shipment.status}
                    </Badge>
                    {shipment.costPrice != null && (
                      <span className="font-mono text-sm font-semibold text-amber-600">HPP: Rp {Number(shipment.costPrice).toLocaleString("id-ID")}</span>
                    )}
                  </div>
                  {shipment.notes && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md border border-border/50">
                      <span className="font-semibold">Catatan:</span> {shipment.notes}
                    </div>
                  )}
                  {isAdmin && shipment.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white" onClick={() => handleApprove(shipment.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Terima
                      </Button>
                      <Button variant="outline" className="border-destructive/50 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white" onClick={() => handleReject(shipment.id)}>
                        <XCircle className="mr-2 h-4 w-4" /> Tolak
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
            {mobileData.length > 0 && mobileData.length < filteredShipments.length && (
              <div ref={lastElementRef} className="py-6 flex justify-center">
                <div className="text-xs text-muted-foreground animate-pulse font-medium">Memuat data selanjutnya...</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Main Form Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isRequestOpen} onOpenChange={v => { if (!v) { setIsRequestOpen(false) } }} disablePointerDismissal>
        <DialogContent className="sm:max-w-lg md:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              {isAdmin ? "Input Struk Pembelian" : "Buat Pengiriman Baru"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">Satu struk bisa berisi beberapa produk sekaligus.</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">

            {/* ── Supplier Row ─────────────────────────────────────────────── */}
            {isAdmin && (
              <div className="space-y-2">
                <Label className="font-semibold">Supplier / Pemasok <span className="text-destructive">*</span></Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      options={supplierOptions}
                      value={selectedSupplierId}
                      onChange={(id) => setSelectedSupplierId(id)}
                      placeholder="Ketik atau pilih supplier..."
                      onAddNew={() => { setAddSupplierInitialName(""); setShowAddSupplier(true) }}
                      addNewLabel="Tambah Supplier Baru"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => { setAddSupplierInitialName(""); setShowAddSupplier(true) }}
                    title="Tambah supplier baru"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Notes ────────────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label className="font-semibold">Keterangan / No. Struk (Opsional)</Label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Misal: Surat Jalan #SJ-992 atau nota tgl 27 Mei"
              />
            </div>

            {/* ── Product Rows ──────────────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">Daftar Produk <span className="text-destructive">*</span></Label>
                <span className="text-[11px] text-muted-foreground">{rows.filter(r => r.productId).length} produk dipilih</span>
              </div>

              {/* Desktop Table Header */}
              <div className="hidden md:flex gap-4 px-2 pb-2 border-b border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <div className="flex-1">Produk / Item</div>
                <div className="w-[160px]">Jumlah (pcs)</div>
                <div className="w-[160px]">HPP/Satuan (Rp)</div>
                <div className="w-10"></div>
              </div>

              <div className="space-y-3 md:space-y-1">
                {rows.map((row, idx) => (
                  <div key={row.uid} className="rounded-xl border border-border/50 bg-muted/10 p-3 md:p-2 md:bg-transparent md:border-none relative group transition-all md:hover:bg-muted/10 md:rounded-lg">
                    
                    {/* Mobile Header (hidden on desktop) */}
                    <div className="flex md:hidden items-center justify-between mb-3 pb-2 border-b border-border/50">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Produk #{idx + 1}
                      </span>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(row.uid)}
                          className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      {/* Product Combobox */}
                      <div className="flex-1 w-full space-y-1.5 md:space-y-0">
                        <Label className="text-xs font-semibold text-muted-foreground md:hidden">Produk / Item</Label>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Combobox
                              options={productOptions}
                              value={row.productId}
                              onChange={(id, label) => {
                                const prod = products.find(p => p.id === id)
                                updateRow(row.uid, {
                                  productId: id,
                                  productName: label,
                                  costPrice: prod?.costPrice != null ? String(prod.costPrice) : row.costPrice,
                                })
                              }}
                              placeholder="Ketik atau pilih produk..."
                              onAddNew={() => {
                                setAddProductInitialName("")
                                setAddProductTargetRowUid(row.uid)
                                setShowAddProduct(true)
                              }}
                              addNewLabel="Tambah Produk Baru"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0 border-primary/30 text-primary hover:bg-primary/5 h-10 w-10"
                            onClick={() => {
                              setAddProductInitialName("")
                              setAddProductTargetRowUid(row.uid)
                              setShowAddProduct(true)
                            }}
                            title="Tambah produk baru"
                          >
                            <Package className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Qty + HPP */}
                      <div className="w-full md:w-auto grid grid-cols-2 md:flex gap-4">
                        <div className="space-y-1.5 md:space-y-0 md:w-[160px]">
                          <Label className="text-xs font-semibold text-muted-foreground md:hidden">Jumlah (pcs)</Label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateRow(row.uid, { quantity: Math.max(1, row.quantity - 1) })}
                              className="h-10 w-10 rounded-md border border-border/50 bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <Input
                              type="number"
                              min="1"
                              value={row.quantity || ""}
                              onChange={e => {
                                const val = e.target.value;
                                updateRow(row.uid, { quantity: val === "" ? 0 : parseInt(val) || 0 });
                              }}
                              onBlur={() => {
                                if (!row.quantity || row.quantity < 1) updateRow(row.uid, { quantity: 1 });
                              }}
                              onFocus={e => e.target.select()}
                              className="h-10 text-center font-black px-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateRow(row.uid, { quantity: (row.quantity || 0) + 1 })}
                              className="h-10 w-10 rounded-md border border-border/50 bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 md:space-y-0 md:w-[160px]">
                          <Label className="text-xs font-semibold text-muted-foreground md:hidden">HPP/Satuan (Rp)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={row.costPrice}
                            onChange={e => updateRow(row.uid, { costPrice: e.target.value })}
                            placeholder="Opsional, 5000"
                            className="h-10"
                          />
                        </div>
                      </div>

                      {/* Desktop Delete Column */}
                      <div className="hidden md:flex w-10 items-center justify-center">
                        {rows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(row.uid)}
                            className="h-10 w-10 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Hapus baris ini"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Total preview */}
                    {row.productId && row.costPrice && (
                      <div className="mt-3 md:mt-1 flex md:justify-end md:pr-[56px]">
                        <div className="text-[11px] text-muted-foreground bg-background/80 rounded-lg px-3 py-1.5 border border-border/30 w-full md:w-auto md:text-right md:bg-transparent md:border-none md:p-0">
                          Total HPP: <span className="font-bold text-amber-600">
                            Rp {(parseFloat(row.costPrice) * row.quantity).toLocaleString("id-ID")}
                          </span>
                          <span className="mx-1.5 hidden md:inline">·</span>
                          <span className="hidden md:inline">{row.quantity} pcs × Rp {parseFloat(row.costPrice).toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Row Button */}
              <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-primary/30 rounded-xl text-primary text-sm font-semibold hover:bg-primary/5 hover:border-primary/50 transition-all"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk Lain
              </button>
            </div>

            {/* ── Summary ───────────────────────────────────────────────────── */}
            {rows.some(r => r.productId && r.costPrice) && (
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Ringkasan Pembelian</p>
                {rows.filter(r => r.productId && r.costPrice).map(r => (
                  <div key={r.uid} className="flex justify-between text-xs text-amber-900/80">
                    <span>{r.productName || "Produk"} ×{r.quantity}</span>
                    <span className="font-mono font-semibold">Rp {(parseFloat(r.costPrice) * r.quantity).toLocaleString("id-ID")}</span>
                  </div>
                ))}
                <div className="border-t border-amber-500/20 pt-1 flex justify-between text-sm font-black text-amber-700">
                  <span>Total Modal</span>
                  <span className="font-mono">
                    Rp {rows.filter(r => r.productId && r.costPrice)
                      .reduce((sum, r) => sum + parseFloat(r.costPrice) * r.quantity, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => { setIsRequestOpen(false); resetForm() }}>
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !rows.some(r => r.productId) || (isAdmin && !selectedSupplierId)}
              >
                {isSubmitting ? "Menyimpan..." : `Kirim ${rows.filter(r => r.productId).length} Produk`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Add Supplier Dialog ──────────────────────────────────────────────── */}
      <AddSupplierDialog
        open={showAddSupplier}
        onClose={() => setShowAddSupplier(false)}
        initialName={addSupplierInitialName}
        onCreated={(s) => {
          setSuppliers(prev => [...prev, s])
          setSelectedSupplierId(s.id)
        }}
      />

      {/* ── Add Product Dialog ───────────────────────────────────────────────── */}
      <AddProductDialog
        open={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        initialName={addProductInitialName}
        onCreated={(p) => {
          setProducts(prev => [...prev, p])
          if (addProductTargetRowUid) {
            updateRow(addProductTargetRowUid, {
              productId: p.id,
              productName: p.name,
              costPrice: p.costPrice != null ? String(p.costPrice) : "",
            })
          }
          setAddProductTargetRowUid(null)
        }}
      />
    </div>
  )
}
