"use client"

import { useState, useMemo } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { submitStockOpname } from "@/app/actions/product"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"

interface OpnameProduct {
  id: string
  sku: string
  name: string
  category: string
  systemStock: number
  updatedAt: string
}

export function StockOpnameClient({ data }: { data: OpnameProduct[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [actualStocks, setActualStocks] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const handleStockChange = (id: string, value: string) => {
    if (value === '' || /^-?\d+$/.test(value)) {
      setActualStocks(prev => ({
        ...prev,
        [id]: value
      }))
    }
  }

  const getVariance = (id: string, systemStock: number) => {
    const actual = actualStocks[id]
    if (actual === undefined || actual === '') return null
    return parseInt(actual) - systemStock
  }

  const handleSaveItem = async (item: OpnameProduct) => {
    const actualStr = actualStocks[item.id]
    if (actualStr === undefined || actualStr === '') return
    
    const actualStock = parseInt(actualStr)
    if (actualStock === item.systemStock) return

    setSavingId(item.id)
    
    const res = await submitStockOpname([{
      productId: item.id,
      actualStock,
      systemStock: item.systemStock
    }], "Hasil Stock Opname")
    
    if (res.success) {
      toast.success(`Stok ${item.name} disesuaikan`)
      // Clear input so it resets and shows updated system stock
      setActualStocks(prev => {
        const next = { ...prev }
        delete next[item.id]
        return next
      })
      router.refresh()
    } else {
      toast.error("Gagal Menyimpan", {
        description: res.error
      })
    }
    
    setSavingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, item: OpnameProduct) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // this will trigger onBlur
    }
  }

  return (
    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md mt-4">
      <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={() => router.back()} title="Kembali">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau SKU..."
              className="pl-9 bg-background/50 border-border/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-center w-[120px]">Stok Sistem</TableHead>
                <TableHead className="text-center w-[150px]">Cek Fisik</TableHead>
                <TableHead className="text-center w-[120px]">Selisih</TableHead>
                <TableHead className="text-right w-[180px]">Terakhir Disesuaikan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Tidak ada produk ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => {
                  const variance = getVariance(item.id, item.systemStock)
                  
                  return (
                    <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{item.category}</TableCell>
                      <TableCell className="text-center font-bold text-muted-foreground">
                        {item.systemStock}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input 
                          type="number"
                          placeholder="Fisik"
                          className="h-8 text-center bg-background/50 focus-visible:ring-primary/20 w-24 mx-auto font-bold"
                          value={actualStocks[item.id] !== undefined ? actualStocks[item.id] : ""}
                          onChange={(e) => handleStockChange(item.id, e.target.value)}
                          onBlur={() => handleSaveItem(item)}
                          onKeyDown={(e) => handleKeyDown(e, item)}
                          disabled={savingId === item.id}
                        />
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {savingId === item.id ? (
                          <span className="text-xs text-muted-foreground animate-pulse">Menyimpan...</span>
                        ) : variance === null ? (
                          <span className="text-muted-foreground/30">-</span>
                        ) : variance === 0 ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-transparent">Cocok</Badge>
                        ) : variance > 0 ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-transparent">+{variance}</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-transparent">{variance}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {format(new Date(item.updatedAt), "dd MMM yyyy HH:mm", { locale: idLocale })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
