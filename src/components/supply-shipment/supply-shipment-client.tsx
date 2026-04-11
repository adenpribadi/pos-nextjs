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
  quantity: number
  notes: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: Date
}

export function SupplyShipmentClient({ 
  products, 
  shipments,
  isAdmin = false 
}: { 
  products: Product[], 
  shipments: SupplyShipment[],
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
      toast.success("Pengiriman Berhasil Diajukan", {
        description: "Menunggu validasi Admin."
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
      {!isAdmin && (
        <Card className="border-primary/20 bg-primary/5 shadow-none group overflow-hidden relative">
          <div className="absolute right-0 top-0 h-full w-32 bg-primary/10 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-500" />
          <CardContent className="p-6 flex items-center justify-between relative">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Siap Kirim Pasokan?
              </h3>
              <p className="text-muted-foreground text-sm">Informasikan pengiriman barang Anda untuk divalidasi Admin.</p>
            </div>
            <Button onClick={() => setIsRequestOpen(true)} className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengiriman Baru
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {isAdmin ? "Validasi Supply Shipment" : "Daftar Pengiriman Anda"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Produk</TableHead>
                {isAdmin && <TableHead>Supplier</TableHead>}
                <TableHead className="text-center">Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Waktu Pengajuan</TableHead>
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
                  <TableRow key={shipment.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{shipment.product.name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{shipment.product.sku}</span>
                      </div>
                    </TableCell>
                    {isAdmin && <TableCell>{shipment.supplier.name || "Unknown"}</TableCell>}
                    <TableCell className="text-center font-bold text-lg">{shipment.quantity}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          shipment.status === "APPROVED" ? "default" : 
                          shipment.status === "REJECTED" ? "destructive" : "secondary"
                        }
                        className={cn(
                          "flex items-center gap-1.5 w-fit px-2 py-0.5",
                          shipment.status === "APPROVED" && "bg-emerald-500/10 text-emerald-500 border-none",
                          shipment.status === "PENDING" && "bg-amber-500/10 text-amber-500 border-none"
                        )}
                      >
                        {shipment.status === "PENDING" && <Clock className="h-3 w-3" />}
                        {shipment.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                        {shipment.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                        {shipment.status === "PENDING" ? "MENUNGGU" : shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {new Date(shipment.createdAt).toLocaleDateString("id-ID", {
                         day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </TableCell>
                    {isAdmin && shipment.status === "PENDING" && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-emerald-500/50 text-emerald-500 hover:bg-emerald-50"
                            onClick={() => handleApprove(shipment.id)}
                          >
                            Terima
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-destructive/50 text-destructive hover:bg-destructive/5"
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
        </CardContent>
      </Card>

      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Buat Supply Shipment Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4 pt-4">
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
