import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { ShoppingBag, Clock, CheckCircle2, XCircle, ReceiptText, Package, CalendarDays, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { OrderReview } from "./_components/order-review"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect("/login")

  const customer = await prisma.customer.findFirst({
    where: { email: session.user.email || "" }
  })

  const orders = customer ? await prisma.sale.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { product: { select: { name: true } } },
        take: 2,
      },
      _count: { select: { items: true } },
      review: true,   // sertakan review yang sudah ada
    }
  }) : []

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 font-bold"><Clock className="h-3 w-3" /> Tertunda</Badge>,
          dot: "bg-amber-400",
        }
      case "PAID":
        return {
          badge: <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1 font-bold"><CheckCircle2 className="h-3 w-3" /> Lunas</Badge>,
          dot: "bg-emerald-500",
        }
      case "CANCELLED":
        return {
          badge: <Badge variant="destructive" className="gap-1 font-bold"><XCircle className="h-3 w-3" /> Dibatalkan</Badge>,
          dot: "bg-red-500",
        }
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          dot: "bg-gray-400",
        }
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-muted/30 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-24">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight">Pesanan Saya</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Pantau status dan riwayat belanja Anda.</p>
        </div>

        {/* Statistik ringkas */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: orders.length, color: "text-primary", bg: "bg-primary/10" },
              { label: "Lunas", value: orders.filter(o => o.status === "PAID").length, color: "text-emerald-600", bg: "bg-emerald-100" },
              { label: "Tertunda", value: orders.filter(o => o.status === "PENDING").length, color: "text-amber-600", bg: "bg-amber-100" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 text-center`}>
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Daftar Pesanan */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 bg-card rounded-3xl border border-dashed border-border/50">
            <div className="bg-muted h-16 w-16 rounded-2xl flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-black text-lg">Belum Ada Pesanan</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-2">
              Anda belum melakukan transaksi apapun. Mulailah belanja untuk melihat riwayat pesanan di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const { badge, dot } = getStatusConfig(order.status)
              const orderDate = new Date(order.createdAt)
              return (
                <div
                  key={order.id}
                  className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  {/* Color bar status */}
                  <div className={`h-1 w-full ${dot}`} />

                  <div className="p-4 space-y-3">
                    {/* Baris 1: Nomor struk & badge status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-black text-primary tracking-tight">{order.receiptNumber}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          <span>{format(orderDate, "EEEE, dd MMMM yyyy · HH:mm", { locale: id })}</span>
                        </div>
                      </div>
                      <div className="shrink-0">{badge}</div>
                    </div>

                    {/* Baris 2: Preview item */}
                    <div className="bg-muted/30 rounded-xl p-3 space-y-1">
                      {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-2 text-xs">
                          <Package className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{item.product.name}</span>
                          <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                      {order._count.items > 2 && (
                        <p className="text-[10px] text-muted-foreground pl-5 italic">
                          +{order._count.items - 2} produk lainnya
                        </p>
                      )}
                    </div>

                    {/* Baris 3: Total & metode */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="font-medium">{order.paymentMethod || "—"}</span>
                        <span>·</span>
                        <span>{order._count.items} item</span>
                      </div>
                      <p className="text-base font-black text-foreground">
                        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Review section — hanya untuk pesanan PAID */}
                    {order.status === "PAID" && (
                      <OrderReview
                        saleId={order.id}
                        orderId={order.receiptNumber}
                        existingReview={order.review ? {
                          rating: order.review.rating,
                          comment: order.review.comment,
                          createdAt: order.review.createdAt,
                        } : null}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bantuan */}
        <div className="bg-card border border-border/50 p-4 rounded-2xl flex items-center gap-3 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ReceiptText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Butuh bantuan dengan pesanan?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hubungi layanan pelanggan kami melalui menu Pengaturan jika ada kendala pembayaran.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
