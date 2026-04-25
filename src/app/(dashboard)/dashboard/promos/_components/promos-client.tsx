"use client"

import { useState, useTransition } from "react"
import { 
  Plus, Search, Ticket, Calendar, Settings2, Trash2, 
  CheckCircle2, XCircle, MoreVertical, Edit2, Loader2,
  Percent, Banknote, History, Eye, Users, Receipt
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createPromo, updatePromo, deletePromo, getPromoUsage } from "@/app/actions/promo"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"

type Promo = {
  id: string
  code: string
  description: string | null
  type: string
  value: number
  minPurchase: number
  maxDiscount: number | null
  startDate: string | Date | null
  endDate: string | Date | null
  usageLimit: number | null
  usageCount: number
  limitPerCustomer: number | null
  isActive: boolean
}

export function PromosClient({ initialData }: { initialData: Promo[] }) {
  const [promos, setPromos] = useState(initialData)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [isPending, startTransition] = useTransition()

  // Usage dialog state
  const [isUsageOpen, setIsUsageOpen] = useState(false)
  const [usageData, setUsageData] = useState<any[]>([])
  const [isLoadingUsage, setIsLoadingUsage] = useState(false)
  const [selectedPromoCode, setSelectedPromoCode] = useState("")

  const filteredPromos = promos.filter(p => 
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenAdd = () => {
    setEditingPromo(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (promo: Promo) => {
    setEditingPromo(promo)
    setIsDialogOpen(true)
  }

  const handleViewUsage = async (promo: Promo) => {
    setSelectedPromoCode(promo.code)
    setIsUsageOpen(true)
    setIsLoadingUsage(true)
    const res = await getPromoUsage(promo.id)
    if (res.success) {
      setUsageData(res.data as any[])
    } else {
      toast.error("Gagal", { description: res.error })
      setIsUsageOpen(false)
    }
    setIsLoadingUsage(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const res = editingPromo 
        ? await updatePromo(editingPromo.id, formData)
        : await createPromo(formData)

      if (res.success) {
        toast.success(editingPromo ? "Promo diperbarui" : "Promo berhasil dibuat")
        setIsDialogOpen(false)
        // Refresh local data (simplification for demo, in real app might re-fetch or use router.refresh)
        window.location.reload()
      } else {
        toast.error("Gagal", { description: res.error })
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus promo ini?")) return
    setIsDeleting(id)
    const res = await deletePromo(id)
    if (res.success) {
      toast.success("Promo dihapus")
      window.location.reload()
    } else {
      toast.error("Gagal", { description: res.error })
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari kode promo..." 
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 font-bold shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Tambah Promo
        </Button>
      </div>

      {/* Grid Promo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPromos.map(promo => (
          <Card key={promo.id} className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all group">
            <div className={cn("h-1.5 w-full", promo.isActive ? "bg-emerald-500" : "bg-muted")} />
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-xl font-black tracking-widest uppercase">{promo.code}</CardTitle>
                  </div>
                  <CardDescription className="text-xs line-clamp-1">{promo.description || "Tidak ada deskripsi"}</CardDescription>
                </div>
                <Badge variant={promo.isActive ? "default" : "secondary"} className="text-[10px] uppercase font-bold">
                  {promo.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Promo Value */}
              <div className="flex items-end justify-between bg-muted/30 p-3 rounded-xl border border-border/30">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Diskon</p>
                  <p className="text-2xl font-black text-primary">
                    {promo.type === "PERCENTAGE" ? `${Number(promo.value)}%` : `Rp ${Number(promo.value).toLocaleString("id-ID")}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Min. Belanja</p>
                  <p className="text-sm font-bold">Rp {Number(promo.minPurchase).toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                    <History className="h-3 w-3" /> Pemakaian
                  </p>
                  <p className="text-sm font-bold">
                    {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : "kali"}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1 justify-end">
                    <Calendar className="h-3 w-3" /> Berakhir
                  </p>
                  <p className="text-xs font-bold text-muted-foreground">
                    {promo.endDate ? format(new Date(promo.endDate), "dd MMM yyyy") : "Selamanya"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs font-bold h-9" onClick={() => handleOpenEdit(promo)}>
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button 
                  variant="outline" size="sm" 
                  className="flex-1 gap-1 text-xs font-bold h-9 hover:bg-primary/5 hover:text-primary border-primary/20" 
                  onClick={() => handleViewUsage(promo)}
                >
                  <Eye className="h-3.5 w-3.5" /> Riwayat
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive p-0" 
                  onClick={() => handleDelete(promo.id)}
                  disabled={isDeleting === promo.id}
                >
                  {isDeleting === promo.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                {editingPromo ? "Edit Promo" : "Buat Promo Baru"}
              </DialogTitle>
              <DialogDescription>
                Tentukan kode promo, besaran diskon, dan batasan penggunaannya.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Promo</Label>
                  <Input id="code" name="code" defaultValue={editingPromo?.code} placeholder="MISAL: PROMO10" required className="uppercase font-mono font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Diskon</Label>
                  <select 
                    id="type" name="type" 
                    defaultValue={editingPromo?.type || "PERCENTAGE"}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED_AMOUNT">Nominal Tetap (Rp)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input id="description" name="description" defaultValue={editingPromo?.description || ""} placeholder="Contoh: Promo Spesial Hari Raya" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Nilai Diskon</Label>
                  <div className="relative">
                    <Input id="value" name="value" type="number" step="0.01" defaultValue={editingPromo ? Number(editingPromo.value) : ""} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Minimal Belanja</Label>
                  <Input id="minPurchase" name="minPurchase" type="number" defaultValue={editingPromo ? Number(editingPromo.minPurchase) : 0} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input id="startDate" name="startDate" type="date" defaultValue={editingPromo?.startDate ? format(new Date(editingPromo.startDate), "yyyy-MM-dd") : ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Berakhir</Label>
                  <Input id="endDate" name="endDate" type="date" defaultValue={editingPromo?.endDate ? format(new Date(editingPromo.endDate), "yyyy-MM-dd") : ""} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Limit Total (Global)</Label>
                  <Input id="usageLimit" name="usageLimit" type="number" defaultValue={editingPromo?.usageLimit || ""} placeholder="Unlimit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limitPerCustomer">Limit per Pelanggan</Label>
                  <Input id="limitPerCustomer" name="limitPerCustomer" type="number" defaultValue={editingPromo?.limitPerCustomer ?? 1} placeholder="Contoh: 1" />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                <Label htmlFor="isActive" className="cursor-pointer">Status Aktif</Label>
                <input 
                  type="checkbox" id="isActive" name="isActive" value="true" 
                  defaultChecked={editingPromo ? editingPromo.isActive : true}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending} className="font-bold">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingPromo ? "Simpan Perubahan" : "Buat Promo"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Usage History Dialog */}
      <Dialog open={isUsageOpen} onOpenChange={setIsUsageOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <History className="h-6 w-6 text-primary" />
              Riwayat Penggunaan: {selectedPromoCode}
            </DialogTitle>
            <DialogDescription>
              Daftar transaksi yang menggunakan kode promo ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-2">
            {isLoadingUsage ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Mengambil data...</p>
              </div>
            ) : usageData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3 bg-muted/20 rounded-2xl border border-dashed">
                <Users className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-bold text-muted-foreground">Belum ada penggunaan tercatat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usageData.map((usage) => (
                  <div key={usage.id} className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                            {usage.customerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black">{usage.customerName}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Kasir: {usage.cashierName}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="font-mono text-[10px] font-black border-primary/20 text-primary">
                          {usage.receiptNumber}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(usage.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <Ticket className="h-3.5 w-3.5" />
                        -Rp {usage.discount.toLocaleString("id-ID")}
                      </div>
                      <div className="text-sm font-black">
                        Total: Rp {usage.totalAmount.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-muted/20 flex justify-end">
            <Button variant="secondary" onClick={() => setIsUsageOpen(false)} className="font-bold">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
