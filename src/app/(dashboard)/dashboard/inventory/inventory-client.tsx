"use client"

import { useState } from "react"
import { Search, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { id } from "date-fns/locale"

interface InventoryTx {
  id: string
  date: string
  productName: string
  sku: string
  type: string
  quantity: number
  operator: string
  notes: string
}

export function InventoryClient({ data }: { data: InventoryTx[] }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredData = data.filter((item) =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeStyle = (type: string) => {
    switch(type) {
      case "IN":
        return { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <ArrowDownToLine className="w-3 h-3 mr-1" />, label: "Barang Masuk" }
      case "OUT":
        return { color: "text-destructive", bg: "bg-destructive/10", icon: <ArrowUpFromLine className="w-3 h-3 mr-1" />, label: "Barang Keluar" }
      case "SALE":
        return { color: "text-blue-500", bg: "bg-blue-500/10", icon: <ShoppingCart className="w-3 h-3 mr-1" />, label: "Penjualan" }
      case "ADJUSTMENT":
        return { color: "text-orange-500", bg: "bg-orange-500/10", icon: <RefreshCcw className="w-3 h-3 mr-1" />, label: "Penyesuaian" }
      default:
        return { color: "text-muted-foreground", bg: "bg-muted", icon: null, label: type }
    }
  }

  return (
    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md mt-4">
      <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari log produk atau SKU..."
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
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead>Produk</TableHead>
              <TableHead>Tipe Transaksi</TableHead>
              <TableHead className="text-center">Kuantitas</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Catatan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Tidak ada riwayat transaksi ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((tx) => {
                const style = getTypeStyle(tx.type)
                return (
                  <TableRow key={tx.id} className="transition-colors hover:bg-muted/40">
                    <TableCell className="font-medium text-xs text-muted-foreground">
                      {format(new Date(tx.date), "dd MMM yyyy, HH:mm", { locale: id })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{tx.productName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{tx.sku}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${style.bg} ${style.color} border-transparent flex w-max items-center`}>
                        {style.icon}
                        {style.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      <span className={tx.quantity > 0 ? "text-emerald-500" : tx.quantity < 0 ? "text-destructive" : ""}>
                        {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{tx.operator}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate" title={tx.notes}>
                      {tx.notes}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
