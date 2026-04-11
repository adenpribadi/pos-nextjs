"use client"

import { useState } from "react"
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Receipt, 
  ChevronRight, 
  ShoppingBag,
  MoreVertical,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { confirmSalePayment, cancelSale } from "@/app/actions/sale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  total: number
}

interface PendingOrder {
  id: string
  receiptNumber: string
  customerName: string
  date: string
  total: number
  itemsCount: number
  paymentMethod: string
  items: OrderItem[]
}

export function OrdersClient({ initialData }: { initialData: PendingOrder[] }) {
  const [orders, setOrders] = useState<PendingOrder[]>(initialData)
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async (id: string) => {
    setIsProcessing(true)
    const res = await confirmSalePayment(id)
    if (res.success) {
      toast.success("Pembayaran Dikonfirmasi!", {
        description: "Pesanan telah resmi tercatat sebagai penjualan berhasil."
      })
      setOrders(orders.filter(o => o.id !== id))
      setSelectedOrder(null)
    } else {
      toast.error("Gagal Konfirmasi", { description: res.error })
    }
    setIsProcessing(false)
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini? Stok akan dikembalikan otomatis.")) return
    
    setIsProcessing(true)
    const res = await cancelSale(id)
    if (res.success) {
      toast.info("Pesanan Dibatalkan", {
        description: "Stok produk telah dikembalikan ke gudang."
      })
      setOrders(orders.filter(o => o.id !== id))
      setSelectedOrder(null)
    } else {
      toast.error("Gagal Membatalkan", { description: res.error })
    }
    setIsProcessing(false)
  }

  return (
    <>
      {orders.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center bg-card/30 rounded-3xl border border-dashed border-border/50">
           <div className="p-4 bg-muted/20 rounded-full mb-4">
              <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
           </div>
           <h3 className="text-lg font-bold text-muted-foreground">Antrean Kosong</h3>
           <p className="text-sm text-muted-foreground/60">Saat ini tidak ada pesanan masuk yang perlu diproses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-md overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono tracking-tighter">
                          {order.receiptNumber}
                       </Badge>
                       <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-transparent animate-pulse text-[10px] uppercase font-bold">
                          Pending
                       </Badge>
                    </div>
                    <CardTitle className="text-lg font-black">{order.customerName}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Waktu</p>
                    <p className="text-xs font-medium">{format(new Date(order.date), "HH:mm")}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 space-y-4">
                <div className="flex justify-between text-sm">
                   <div className="flex items-center gap-2 text-muted-foreground">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{order.itemsCount} Produk</span>
                   </div>
                   <div className="font-bold text-foreground">
                      Rp {order.total.toLocaleString("id-ID")}
                   </div>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                   {order.items.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-xs p-2 bg-muted/30 rounded-lg">
                        <span className="truncate max-w-[150px]">{item.name}</span>
                        <div className="flex gap-2 font-mono">
                           <span className="text-muted-foreground">x{item.quantity}</span>
                           <span className="font-bold">Rp {item.total.toLocaleString("id-ID")}</span>
                        </div>
                     </div>
                   ))}
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-2 pb-4">
                <Button 
                  className="flex-1 font-bold shadow-lg shadow-primary/20" 
                  onClick={() => handleConfirm(order.id)}
                  disabled={isProcessing}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Konfirmasi
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="group hover:bg-destructive/10 hover:text-destructive border-border/50"
                  onClick={() => handleCancel(order.id)}
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
