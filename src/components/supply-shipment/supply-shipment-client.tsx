"use client"

import { useState } from "react"
import { Search, ShoppingCart, Plus, Minus, Tag, LayoutGrid, Filter, Check, MoreHorizontal, Edit, CheckCircle2, XCircle, Clock, Truck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/hooks/useCart"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createSupplyShipment, approveSupplyShipment, rejectSupplyShipment } from "@/app/actions/supply-shipment"

interface Product {
  id: string
  sku: string
  name: string
  stock: number
  image: string | null
}

interface SupplyShipment {
  id: string
  productId: string
  product: { name: string, sku: string }
  supplier: { name: string | null }
  admin: { name: string | null } | null
  quantity: number
  notes: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
  updatedAt: Date
}

interface Supplier {
  id: string
  name: string | null
}

export function SupplyShipmentClient({ 
  products, 
  shipments,
  suppliers = [],
  isAdmin = false 
}: { 
  products: Product[], 
  shipments: SupplyShipment[],
  suppliers?: Supplier[],
  isAdmin?: boolean 
}) {
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedProduct) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createSupplyShipment(formData)

    if (res.success) {
      toast.success(isAdmin ? "Pengiriman Berhasil Dicatat" : "Pengiriman Berhasil Diajukan", {
        description: isAdmin ? "Stok belum bertambah, Anda harus memvalidasi data ini di tabel bawah." : "Menunggu validasi Admin."
      })
      setIsRequestOpen(false)
      setSelectedProduct(null)
    } else {
      toast.error("Gagal", { description: res.error })
    }
    setIsSubmitting(false)
  }

  const handleApprove = async (id: string) => {
    if (!confirm("Validasi dan terima pengiriman stok ini?")) return
    const res = await approveSupplyShipment(id)
    if (res.success) {
      toast.success("Pengiriman Divalidasi & Stok Bertambah")
    } else {
      toast.error("Gagal Validasi", { description: res.error })
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt("Alasan penolakan pengiriman:")
    if (reason === null) return 
    
    const res = await rejectSupplyShipment(id, reason)
    if (res.success) {
      toast.success("Pengiriman Ditolak")
    } else {
      toast.error("Gagal", { description: res.error })
    }
  }

  return (
    <div className="space-y-6">
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
                ? "Catat pengiriman barang yang masuk dari supplier secara langsung." 
                : "Informasikan pengiriman barang Anda untuk divalidasi Admin."}
            </p>
          </div>
          <Button 
            onClick={() => setIsRequestOpen(true)} 
            className={cn("shadow-lg", isAdmin ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20" : "shadow-primary/20")}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdmin ? "Input Pasokan Supplier" : "Buat Pengiriman Baru"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className={cn("h-5 w-5", isAdmin ? "text-amber-500" : "text-primary")} />
            {isAdmin ? "Antrean Validasi Supply Shipment" : "Daftar Pengiriman Anda"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Pengirim (Supplier)</TableHead>
                  <TableHead className="text-center">Jumlah</TableHead>
                  <TableHead>Status & Verifikator</TableHead>
                  <TableHead className="text-right">Riwayat Waktu</TableHead>
                  {isAdmin && <TableHead className="text-right">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-32 text-center text-muted-foreground">
                      Belum ada data pengiriman pasokan.
                    </TableCell>
                  </TableRow>
                ) : (
                  shipments.map((shipment) => (
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
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-black text-lg text-foreground/80">{shipment.quantity}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <Badge 
                            variant={
                              shipment.status === "APPROVED" ? "default" : 
                              shipment.status === "REJECTED" ? "destructive" : "secondary"
                            }
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
                              <span className="text-[10px] font-medium text-foreground">
                                {shipment.admin.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Diajukan</span>
                            <span className="text-xs font-semibold">
                              {new Date(shipment.createdAt).toLocaleDateString("id-ID", {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          {shipment.status !== "PENDING" && (
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-[9px] uppercase font-bold tracking-wider",
                                shipment.status === "APPROVED" ? "text-emerald-600" : "text-destructive"
                              )}>
                                {shipment.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                              </span>
                              <span className="text-xs font-semibold text-foreground/70">
                                {new Date(shipment.updatedAt).toLocaleDateString("id-ID", {
                                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {isAdmin && shipment.status === "PENDING" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-500"
                              onClick={() => handleApprove(shipment.id)}
                            >
                              Terima
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 border-destructive/50 text-destructive hover:bg-destructive/5 hover:border-destructive"
                              onClick={() => handleReject(shipment.id)}
                            >
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
              <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
                Belum ada data pengiriman pasokan.
              </div>
            ) : (
              shipments.map((shipment) => (
                <div key={shipment.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-bold text-base leading-tight">{shipment.product.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono tracking-tighter">{shipment.product.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-primary">{shipment.quantity}</div>
                      <div className="text-[9px] text-muted-foreground uppercase font-bold">Jumlah</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-3 px-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Pengirim</span>
                      <span className="text-xs font-semibold truncate block">{shipment.supplier.name || "Unknown"}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Diajukan</span>
                      <span className="text-xs font-semibold block">
                         {new Date(shipment.createdAt).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                         })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                       <Badge 
                          variant={
                            shipment.status === "APPROVED" ? "default" : 
                            shipment.status === "REJECTED" ? "destructive" : "secondary"
                          }
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
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="font-bold uppercase text-[8px]">Verifikator:</span>
                            <span>{shipment.admin.name}</span>
                          </div>
                        )}
                    </div>
                    
                    {shipment.status !== "PENDING" && (
                      <div className="text-right">
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-wider block",
                          shipment.status === "APPROVED" ? "text-emerald-600" : "text-destructive"
                        )}>
                          {shipment.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                        </span>
                        <span className="text-[11px] font-semibold">
                           {new Date(shipment.updatedAt).toLocaleDateString("id-ID", {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                           })}
                        </span>
                      </div>
                    )}
                  </div>

                  {isAdmin && shipment.status === "PENDING" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        className="border-emerald-500/50 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white"
                        onClick={() => handleApprove(shipment.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Terima
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-destructive/50 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white"
                        onClick={() => handleReject(shipment.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buat Supply Shipment Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4">
            {isAdmin && (
              <div className="space-y-2">
                <Label>Pilih Supplier</Label>
                <select 
                  name="supplierId" 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- Pilih Supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name || "Unnamed Supplier"}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Produk yang Dikirim</Label>
              <select 
                name="productId" 
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(e) => {
                  const p = products.find(x => x.id === e.target.value)
                  setSelectedProduct(p || null)
                }}
              >
                <option value="">-- Pilih Produk --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Jumlah Pasokan</Label>
              <Input id="quantity" name="quantity" type="number" min="1" placeholder="Misal: 100" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Keterangan Pengiriman</Label>
              <Input id="notes" name="notes" placeholder="Misal: Surat jalan #SJ-992" />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsRequestOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedProduct}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Kirim Sekarang"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Loader2(props: any) {
  return <Clock {...props} className={cn(props.className, "animate-spin")} />
}
