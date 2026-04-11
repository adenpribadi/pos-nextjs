import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { ShoppingBag, Clock, CheckCircle2, XCircle, ChevronRight, ReceiptText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  // 1. Temukan ID Customer berdasarkan email sesi
  const customer = await prisma.customer.findFirst({
    where: { email: session.user.email || "" }
  })

  // 2. Ambil semua sales milik customer tersebut
  // Jika customer tidak ditemukan (misal baru register tapi belum ada data customer), tampilkan kosong
  const orders = customer ? await prisma.sale.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { items: true }
      }
    }
  }) : []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1"><Clock className="h-3 w-3" /> Tertunda</Badge>
      case "PAID":
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 gap-1"><CheckCircle2 className="h-3 w-3" /> Lunas</Badge>
      case "CANCELLED":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight">Pesanan Saya</h1>
          <p className="text-muted-foreground text-lg">Pantau status dan riwayat belanja Anda.</p>
        </div>

        {orders.length === 0 ? (
          <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center text-center bg-transparent">
            <div className="bg-muted h-20 w-20 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl">Belum Ada Pesanan</CardTitle>
            <CardDescription className="max-w-xs mt-2">
              Anda belum melakukan transaksi apapun. Mulailah belanja untuk melihat riwayat pesanan Anda di sini.
            </CardDescription>
          </Card>
        ) : (
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>Menampilkan {orders.length} transaksi terakhir.</CardDescription>
              </div>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-bold">No. Struk</TableHead>
                    <TableHead className="font-bold">Tanggal</TableHead>
                    <TableHead className="font-bold">Item</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="text-right font-bold">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-border/50 group">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {order.receiptNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.createdAt), "dd MMM yyyy", { locale: id })}
                      </TableCell>
                      <TableCell className="text-sm">
                        {order._count.items} Produk
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>
                      <TableCell className="text-right font-black">
                        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="bg-card border border-border/50 p-6 rounded-2xl flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ReceiptText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Butuh bantuan dengan pesanan?</h4>
            <p className="text-xs text-muted-foreground">Hubungi layanan pelanggan kami melalui menu Pengaturan jika ada kendala pembayaran.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
