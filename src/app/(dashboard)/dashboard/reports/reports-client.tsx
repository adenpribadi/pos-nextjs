"use client"

import { useState } from "react"
import { Search, Download, FileText, ChevronDown, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface SaleItemDetail {
  name: string
  qty: number
  price: number
  costPrice: number
  total: number
}

interface SaleReport {
  id: string
  receiptNumber: string
  date: string
  amount: number
  tax: number
  discount: number
  paymentMethod: string
  cashierName: string
  itemsCount: number
  totalHpp: number
  profit: number
  itemsDetail: SaleItemDetail[]
}

export function ReportsClient({ data }: { data: SaleReport[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter((item) =>
    item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0)
  const totalHpp = data.reduce((sum, item) => sum + item.totalHpp, 0)
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0)
  const totalTransactions = data.length

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      return toast.error("Gagal Ekspor", { description: "Tidak ada data untuk diekspor." })
    }

    try {
      const headers = ["No. Struk", "Waktu Transaksi", "Total Item", "Nominal Bersih (Rp)", "HPP/Modal (Rp)", "Laba Kotor (Rp)", "Pajak (Rp)", "Tipe Pembayaran", "Nama Kasir"]
      const rows = filteredData.map(d => [
        d.receiptNumber,
        format(new Date(d.date), "yyyy-MM-dd HH:mm:ss"),
        d.itemsCount.toString(),
        d.amount.toString(),
        d.totalHpp.toString(),
        d.profit.toString(),
        d.tax.toString(),
        d.paymentMethod,
        d.cashierName
      ])
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n")
        
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Laporan_Keuangan_POS_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Berhasil Diekspor", { description: "File CSV finansial telah diunduh." })
    } catch (err) {
      toast.error("Gagal Ekspor", { description: "Terdapat kesalahan saat memproses file." })
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Pendapatan</p>
            <p className="text-2xl font-black tracking-tight text-primary">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border/50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Modal (HPP)</p>
            <p className="text-2xl font-black tracking-tight text-muted-foreground/80">
              Rp {totalHpp.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-5 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Laba Kotor</p>
            <p className="text-2xl font-black tracking-tight text-emerald-600">
              Rp {totalProfit.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background border-border/50 shadow-sm flex items-center justify-between p-5">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transaksi</p>
            <p className="text-2xl font-black tracking-tight underline decoration-primary/30 underline-offset-4">{totalTransactions}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="shadow-sm border-primary/20 hover:bg-primary/10 hover:text-primary transition-all text-xs font-bold"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            EKSPOR
          </Button>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari No. Struk atau Kasir..."
              className="pl-9 bg-background/50 border-border/50 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-8 px-3">
                <FileText className="h-3 w-3 mr-2" />
                {filteredData.length} Laporan
             </Badge>
          </div>
        </div>
        
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="whitespace-nowrap">No. Struk</TableHead>
                <TableHead className="whitespace-nowrap">Waktu Transaksi</TableHead>
                <TableHead className="whitespace-nowrap">Kasir</TableHead>
                <TableHead className="text-center whitespace-nowrap">Pembayaran</TableHead>
                <TableHead className="text-right whitespace-nowrap">Total</TableHead>
                <TableHead className="text-right whitespace-nowrap">Untung (Laba)</TableHead>
                <TableHead className="w-[80px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center opacity-40">
                       <FileText className="h-10 w-10 mb-2" />
                       <p>Tidak ada laporan transaksi yang ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((sale) => {
                  const marginPercent = ((sale.profit / sale.amount) * 100).toFixed(0)
                  return (
                    <TableRow key={sale.id} className="transition-colors hover:bg-muted/40 group">
                      <TableCell className="font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors"></span>
                        {sale.receiptNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(sale.date), "dd MMM yyyy, HH:mm", { locale: localeId })}
                      </TableCell>
                      <TableCell className="text-sm">{sale.cashierName}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-transparent font-mono text-[10px] h-5">
                          {sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        Rp {sale.amount.toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                           <span className="font-bold text-emerald-600 text-sm">
                             Rp {sale.profit.toLocaleString("id-ID")}
                           </span>
                           <span className="text-[10px] text-emerald-500/70 font-medium">
                             Margin {marginPercent}%
                           </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
