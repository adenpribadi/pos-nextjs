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
  itemsDetail: SaleItemDetail[]
}

export function ReportsClient({ data }: { data: SaleReport[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter((item) =>
    item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.cashierName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0)
  const totalTransactions = data.length

  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      return toast.error("Gagal Ekspor", { description: "Tidak ada data untuk diekspor." })
    }

    try {
      const headers = ["No. Struk", "Waktu Transaksi", "Total Item", "Nominal Bersih (Rp)", "Pajak (Rp)", "Tipe Pembayaran", "Nama Kasir"]
      const rows = filteredData.map(d => [
        d.receiptNumber,
        format(new Date(d.date), "yyyy-MM-dd HH:mm:ss"),
        d.itemsCount.toString(),
        d.amount.toString(),
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
      link.setAttribute("download", `Laporan_POS_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Berhasil Diekspor", { description: "File CSV telah diunduh ke perangkat Anda." })
    } catch (err) {
      toast.error("Gagal Ekspor", { description: "Terdapat kesalahan saat memproses file." })
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Pendapatan Terkumpul</p>
            <p className="text-3xl font-bold tracking-tight text-primary mt-2">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</p>
            <p className="text-3xl font-bold tracking-tight mt-2">{totalTransactions}</p>
          </CardContent>
        </Card>
        <div className="flex items-end justify-end pb-2">
          <Button 
            variant="outline" 
            className="h-12 w-full md:w-auto shadow-sm"
            onClick={handleExportCSV}
          >
            <Download className="mr-2 h-4 w-4" />
            Ekspor CSV
          </Button>
        </div>
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
        </div>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>No. Struk</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead className="text-center">Tipe Bayar</TableHead>
                <TableHead className="text-right">Total Nominal</TableHead>
                <TableHead className="w-[100px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada laporan transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((sale) => (
                  <TableRow key={sale.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary opacity-50" />
                      {sale.receiptNumber}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(sale.date), "dd MMM yyyy, HH:mm", { locale: localeId })}
                    </TableCell>
                    <TableCell>{sale.cashierName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-transparent font-mono">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {sale.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      Rp {sale.amount.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8">
                        Rincian
                        <ChevronDown className="ml-2 h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
