"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Plus, Minus, Truck, Clock, CheckCircle2, XCircle, Search, X, UserPlus, Package, ChevronDown, Trash2 } from "lucide-react"
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
  approveSupplyShipment, rejectSupplyShipment,
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
}

interface Supplier {
  id: string
  name: string | null
  phone?: string | null
}

interface SupplyShipment {
  id: string
  productId: string
  product: { name: string; sku: string }
  supplier: { name: string | null }
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
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = value ? options.find(o => o.id === value) : null

  const filtered = query.trim()
    ? options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.sub && o.sub.toLowerCase().includes(query.toLowerCase()))
      )
    : options

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpen = () => {
    if (disabled) return
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

  return (
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
        <span className={selected ? "text-foreground font-medium" : "text-muted-foreground"}>
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

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-card border border-border/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-border/40">
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
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors font-semibold border-b border-border/30"
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
      )}
    </div>
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
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
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
      })
      onClose()
    } else {
      toast.error(res.error || "Gagal menambahkan produk")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
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

  // ── Reset form ──────────────────────────────────────────────────────────────

  const resetForm = () => {
    setSelectedSupplierId("")
    setNotes("")
    setRows([makeRow()])
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
            onClick={() => { resetForm(); setIsRequestOpen(true) }}
            className={cn("shadow-lg", isAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" : "shadow-primary/20")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdmin ? "Input Struk Pembelian" : "Buat Pengiriman Baru"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Shipment Table ───────────────────────────────────────────────────── */}
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className={cn("h-5 w-5", isAdmin ? "text-amber-500" : "text-primary")} />
            {isAdmin ? "Antrean Validasi Supply Shipment" : "Daftar Pengiriman Anda"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Pengirim (Supplier)</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead className="text-right">HPP/Satuan</TableHead>
                  <TableHead>Status &amp; Verifikator</TableHead>
                  <TableHead className="text-right">Riwayat Waktu</TableHead>
                  {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-32 text-center text-muted-foreground">
                      Belum ada data pengiriman pasokan.
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map(shipment => (
                    <TableRow key={shipment.id} className="group/row">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium group-hover/row:text-primary transition-colors">{shipment.product.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">{shipment.product.sku}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Pengirim</span>
                          <span className="text-sm font-semibold">{shipment.supplier.name || "Unknown"}</span>
                          {shipment.notes && (
                            <span className="text-[11px] text-muted-foreground/80 mt-1 line-clamp-2" title={shipment.notes}>
                              📝 {shipment.notes}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-lg text-foreground/80">{shipment.quantity}</TableCell>
                      <TableCell className="text-right">
                        {shipment.costPrice != null ? (
                          <span className="font-mono text-sm font-semibold text-amber-600">
                            Rp {Number(shipment.costPrice).toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
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
                          {shipment.status !== "PENDING" && shipment.admin && (
                            <div className="flex flex-col">
                              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Verifikator</span>
                              <span className="text-[10px] font-medium text-foreground">{shipment.admin.name}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Diajukan</span>
                            <span className="text-xs font-semibold">
                              {new Date(shipment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          {shipment.status !== "PENDING" && (
                            <div className="flex flex-col">
                              <span className={cn("text-[9px] uppercase font-bold tracking-wider", shipment.status === "APPROVED" ? "text-emerald-600" : "text-destructive")}>
                                {shipment.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                              </span>
                              <span className="text-xs font-semibold text-foreground/70">
                                {new Date(shipment.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && shipment.status === "PENDING" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-500" onClick={() => handleApprove(shipment.id)}>
                              Terima
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 border-destructive/50 text-destructive hover:bg-destructive/5 hover:border-destructive" onClick={() => handleReject(shipment.id)}>
                              Tolak
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/50">
            {shipments.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">Belum ada data.</div>
            ) : (
              shipments.map(shipment => (
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
          </div>
        </CardContent>
      </Card>

      {/* ── Main Form Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={isRequestOpen} onOpenChange={v => { if (!v) { setIsRequestOpen(false); resetForm() } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-3">
                {rows.map((row, idx) => (
                  <div key={row.uid} className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-3">
                    {/* Row Header */}
                    <div className="flex items-center justify-between">
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

                    {/* Product Combobox */}
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
                        className="shrink-0 border-primary/30 text-primary hover:bg-primary/5"
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

                    {/* Qty + HPP */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Jumlah (pcs)</Label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => updateRow(row.uid, { quantity: Math.max(1, row.quantity - 1) })}
                            className="h-9 w-9 rounded-md border border-border/50 bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <Input
                            type="number"
                            min="1"
                            value={row.quantity}
                            onChange={e => updateRow(row.uid, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                            className="text-center font-black"
                          />
                          <button
                            type="button"
                            onClick={() => updateRow(row.uid, { quantity: row.quantity + 1 })}
                            className="h-9 w-9 rounded-md border border-border/50 bg-background flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">HPP/Satuan (Rp)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={row.costPrice}
                          onChange={e => updateRow(row.uid, { costPrice: e.target.value })}
                          placeholder="Opsional, misal 5000"
                        />
                      </div>
                    </div>

                    {/* Total preview */}
                    {row.productId && row.costPrice && (
                      <div className="text-[11px] text-muted-foreground bg-background/60 rounded-lg px-3 py-1.5 border border-border/30">
                        Total HPP: <span className="font-bold text-amber-600">
                          Rp {(parseFloat(row.costPrice) * row.quantity).toLocaleString("id-ID")}
                        </span>
                        <span className="mx-1.5">·</span>
                        {row.quantity} pcs × Rp {parseFloat(row.costPrice).toLocaleString("id-ID")}
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
