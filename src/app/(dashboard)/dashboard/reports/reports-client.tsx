"use client"

import { useState, useRef, useCallback } from "react"
import * as XLSX from "xlsx"
import {
  Search, Download, FileText, ChevronDown, ChevronUp,
  Printer, Package, Receipt, X, CheckCircle2, Store, CalendarDays
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function formatRp(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

// ─── Receipt Preview Modal ────────────────────────────────────────────────────

function ReceiptModal({ sale, open, onClose }: { sale: SaleReport; open: boolean; onClose: () => void }) {
  const receiptRef = useRef<HTMLDivElement>(null)
  const [paperSize, setPaperSize] = useState<"58mm" | "80mm" | "A5" | "A4">("80mm")
  const dateStr = format(new Date(sale.date), "dd MMM yyyy", { locale: localeId })
  const timeStr = format(new Date(sale.date), "HH:mm:ss")
  const subtotal = sale.itemsDetail.reduce((s, i) => s + i.total, 0)

  const paperSizeOptions: { label: string; value: "58mm" | "80mm" | "A5" | "A4"; desc: string }[] = [
    { label: "58mm", value: "58mm", desc: "Thermal kecil" },
    { label: "80mm", value: "80mm", desc: "Thermal standar" },
    { label: "A5", value: "A5",   desc: "148 × 210mm" },
    { label: "A4", value: "A4",   desc: "210 × 297mm" },
  ]

  // Map paper size to px width for preview and print iframe
  const paperConfig: Record<"58mm" | "80mm" | "A5" | "A4", { pageSize: string; previewPx: number }> = {
    "58mm": { pageSize: "58mm auto",   previewPx: 180 },
    "80mm": { pageSize: "80mm auto",   previewPx: 260 },
    "A5":   { pageSize: "A5 portrait",  previewPx: 370 },
    "A4":   { pageSize: "A4 portrait",  previewPx: 420 },
  }
  const { pageSize, previewPx } = paperConfig[paperSize]

  const handlePrint = useCallback(() => {
    if (!receiptRef.current) return

    const receiptHtml = receiptRef.current.outerHTML

    const iframe = document.createElement("iframe")
    iframe.style.cssText = "position:fixed;right:-9999px;bottom:-9999px;width:0;height:0;border:0;"
    document.body.appendChild(iframe)

    iframe.onload = () => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => document.body.removeChild(iframe), 1500)
    }

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }

    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Struk - ${sale.receiptNumber}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #fff; display: flex; justify-content: center; padding: 8px; }
      @page { size: ${pageSize}; margin: 4mm; }
    </style>
  </head>
  <body>${receiptHtml}</body>
</html>`)
    doc.close()
  }, [sale.receiptNumber, pageSize])

  return (
    <>
      <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden border-border/60 shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-6 pt-5 pb-4 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold leading-none">Preview Struk</DialogTitle>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{sale.receiptNumber}</p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Receipt Preview */}
          <div className="px-6 py-5 bg-gradient-to-b from-muted/10 to-transparent flex justify-center overflow-x-auto">
            {/* Paper shadow effect */}
            <div className="relative transition-all duration-300" style={{ width: `${previewPx}px` }}>
              <div className="absolute inset-0 translate-y-2 bg-black/10 rounded-sm blur-md" />
              <div
                ref={receiptRef}
                className="relative bg-white rounded-sm shadow-md w-full transition-all duration-300"
                style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "12px",
                  color: "#1a1a1a",
                  lineHeight: 1.55,
                }}
              >
                {/* Top zigzag */}
                <div style={{
                  background: "repeating-linear-gradient(135deg, transparent, transparent 5px, #fff 5px, #fff 10px), repeating-linear-gradient(45deg, transparent, transparent 5px, #f0f0f0 5px, #f0f0f0 10px)",
                  height: "10px",
                  borderBottom: "1px solid #e5e5e5",
                }} />

                <div style={{ padding: "16px 18px" }}>
                  {/* Store Header */}
                  <div style={{ textAlign: "center", marginBottom: "12px" }}>
                    <div style={{ fontWeight: "900", fontSize: "16px", letterSpacing: "2px", color: "#111" }}>
                      ★ WARUNG BINTANG ★
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", marginTop: "2px" }}>
                      Struk Pembelian Resmi
                    </div>
                  </div>

                  {/* Dashed divider */}
                  <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />

                  {/* Transaction Info */}
                  <div style={{ fontSize: "11px", marginBottom: "10px" }}>
                    {[
                      ["No. Struk", sale.receiptNumber],
                      ["Tanggal", dateStr],
                      ["Jam", timeStr],
                      ["Kasir", sale.cashierName],
                      ["Pembayaran", sale.paymentMethod],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ color: "#555" }}>{label}</span>
                        <span style={{ fontWeight: "600", color: "#111", maxWidth: "160px", textAlign: "right", wordBreak: "break-all" }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dashed divider */}
                  <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />

                  {/* Items */}
                  <div style={{ marginBottom: "10px" }}>
                    <div style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "1px", color: "#888", marginBottom: "6px", textTransform: "uppercase" }}>
                      Detail Item
                    </div>
                    {sale.itemsDetail.map((item, i) => (
                      <div key={i} style={{ marginBottom: "6px" }}>
                        <div style={{ fontWeight: "600", fontSize: "11.5px", color: "#111" }}>{item.name}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#444" }}>
                          <span>{item.qty} pcs × {formatRp(item.price)}</span>
                          <span style={{ fontWeight: "700" }}>{formatRp(item.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dashed divider */}
                  <div style={{ borderTop: "1px dashed #ccc", margin: "10px 0" }} />

                  {/* Subtotals */}
                  <div style={{ fontSize: "11px", marginBottom: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <span style={{ color: "#555" }}>Subtotal</span>
                      <span>{formatRp(subtotal)}</span>
                    </div>
                    {sale.discount > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ color: "#555" }}>Diskon</span>
                        <span style={{ color: "#e53e3e" }}>- {formatRp(sale.discount)}</span>
                      </div>
                    )}
                    {sale.tax > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span style={{ color: "#555" }}>Pajak</span>
                        <span>{formatRp(sale.tax)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    fontWeight: "900", fontSize: "15px",
                    borderTop: "2px solid #111", borderBottom: "2px solid #111",
                    padding: "6px 0", margin: "6px 0",
                    color: "#111",
                  }}>
                    <span>TOTAL BAYAR</span>
                    <span>{formatRp(sale.amount)}</span>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: "center", marginTop: "12px", fontSize: "10px", color: "#888" }}>
                    <div>━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                    <div style={{ marginTop: "6px", fontStyle: "italic" }}>
                      Terima kasih telah berbelanja
                    </div>
                    <div>di Warung Bintang! 🌟</div>
                    <div style={{ marginTop: "4px" }}>Barang yang dibeli tidak dapat</div>
                    <div>dikembalikan tanpa struk ini.</div>
                    <div style={{ marginTop: "6px" }}>━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                  </div>
                </div>

                {/* Bottom zigzag */}
                <div style={{
                  background: "repeating-linear-gradient(135deg, transparent, transparent 5px, #fff 5px, #fff 10px), repeating-linear-gradient(45deg, transparent, transparent 5px, #f0f0f0 5px, #f0f0f0 10px)",
                  height: "10px",
                  borderTop: "1px solid #e5e5e5",
                }} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-border/40 bg-muted/10 space-y-3">
            {/* Paper Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-medium shrink-0">Ukuran Kertas:</span>
              <div className="flex gap-1.5 flex-wrap">
                {paperSizeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPaperSize(opt.value)}
                    title={opt.desc}
                    className={[
                      "px-2.5 py-1 rounded text-[11px] font-semibold border transition-all",
                      paperSize === opt.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                    ].join(" ")}
                  >
                    {opt.label}
                    <span className={["ml-1 font-normal", paperSize === opt.value ? "opacity-80" : "opacity-50"].join(" ")}>
                      · {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Contextual Info Note */}
            {(paperSize === "58mm" || paperSize === "80mm") && (
              <div className="flex items-start gap-2 rounded-md bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                <span className="text-amber-500 text-sm mt-0.5 shrink-0">⚠</span>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                  Browser Chrome tidak mendukung ukuran kertas custom (58/80mm).
                  Di dialog cetak, ganti <strong>Destination</strong> ke printer thermal Anda —
                  driver-nya akan mengatur ukuran kertas secara otomatis.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {sale.itemsDetail.length} item · {paperSize === "58mm" || paperSize === "80mm" ? "Thermal" : "Kertas biasa"}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                  Tutup
                </Button>
                <Button
                  size="sm"
                  className="text-xs gap-1.5 bg-primary hover:bg-primary/90"
                  onClick={handlePrint}
                >
                  <Printer className="h-3.5 w-3.5" />
                  Cetak Struk
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Sale Row ─────────────────────────────────────────────────────────────────

function SaleRow({ sale }: { sale: SaleReport }) {
  const [expanded, setExpanded] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)

  const marginPercent = sale.amount > 0 ? ((sale.profit / sale.amount) * 100).toFixed(0) : "0"

  return (
    <>
      <ReceiptModal sale={sale} open={showReceipt} onClose={() => setShowReceipt(false)} />

      <TableRow className="transition-colors hover:bg-muted/40 group">
        <TableCell className="font-semibold text-foreground whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors flex-shrink-0" />
            {sale.receiptNumber}
          </div>
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
          {formatRp(sale.amount)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="font-bold text-emerald-600 text-sm">
              {formatRp(sale.profit)}
            </span>
            <span className="text-[10px] text-emerald-500/70 font-medium">
              Margin {marginPercent}%
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              title="Lihat & Cetak Struk"
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
              onClick={() => setShowReceipt(true)}
            >
              <Printer className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              title={expanded ? "Sembunyikan Detail" : "Lihat Detail Item"}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell colSpan={7} className="p-0">
            <div className="p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  Detail Item — {sale.receiptNumber}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-600 gap-1.5"
                  onClick={() => setShowReceipt(true)}
                >
                  <Printer className="h-3 w-3" />
                  Preview &amp; Cetak Struk
                </Button>
              </div>
              <Separator className="bg-border/50" />
              <div className="rounded-md border border-border/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/40 text-muted-foreground text-[11px] uppercase tracking-wide">
                      <th className="text-left px-3 py-2 font-semibold">Produk</th>
                      <th className="text-center px-3 py-2 font-semibold">Qty</th>
                      <th className="text-right px-3 py-2 font-semibold">Harga Satuan</th>
                      <th className="text-right px-3 py-2 font-semibold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.itemsDetail.map((item, idx) => (
                      <tr key={idx} className="border-t border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2 font-medium">{item.name}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{item.qty}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatRp(item.price)}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold">{formatRp(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border/60 bg-muted/30">
                      <td colSpan={3} className="px-3 py-2 text-right text-xs text-muted-foreground font-semibold uppercase">
                        {sale.tax > 0 && <span className="mr-4">Pajak: {formatRp(sale.tax)}</span>}
                        {sale.discount > 0 && <span className="mr-4">Diskon: -{formatRp(sale.discount)}</span>}
                        Total Bayar
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-base text-primary">
                        {formatRp(sale.amount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

// ─── Sortable Header Helper ───────────────────────────────────────────────────

type SortKey = "receiptNumber" | "date" | "cashierName" | "paymentMethod" | "amount" | "profit"
type SortDir = "asc" | "desc"

function SortableHead({
  label, sortKey, current, dir, align = "left", onClick,
}: {
  label: string
  sortKey: SortKey
  current: SortKey
  dir: SortDir
  align?: "left" | "center" | "right"
  onClick: (key: SortKey) => void
}) {
  const active = current === sortKey
  const alignClass = align === "right" ? "text-right justify-end" : align === "center" ? "text-center justify-center" : "text-left justify-start"
  return (
    <TableHead
      className={`whitespace-nowrap cursor-pointer select-none group/th ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}
      onClick={() => onClick(sortKey)}
    >
      <div className={`inline-flex items-center gap-1 ${alignClass}`}>
        <span className={active ? "text-primary" : ""}>{label}</span>
        <span className={`transition-all ${active ? "text-primary" : "text-muted-foreground/30 group-hover/th:text-muted-foreground/60"}`}>
          {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </div>
    </TableHead>
  )
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function ReportsClient({ data, expenses = [] }: { data: SaleReport[], expenses?: any[] }) {
  const PAGE_SIZE = 10
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey]       = useState<SortKey>("date")
  const [sortDir, setSortDir]       = useState<SortDir>("desc")
  const [page, setPage]             = useState(1)

  // ── Date filter state ──────────────────────────────────────────
  // quickPeriod: null | 3 | 6  (last N months)
  // filterYear: null | "YYYY"
  // filterMonth: null | "MM"   (only relevant when filterYear is set)
  const [quickPeriod, setQuickPeriod]   = useState<3 | 6 | null>(null)
  const [filterYear, setFilterYear]     = useState<string | null>(null)
  const [filterMonth, setFilterMonth]   = useState<string | null>(null)

  const hasFilter = quickPeriod !== null || filterYear !== null

  // Derive available years from data
  const availableYears = Array.from(
    new Set(data.map((item) => item.date.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a))

  // Months list for the month selector
  const MONTHS = [
    ["01","Jan"],["02","Feb"],["03","Mar"],["04","Apr"],
    ["05","Mei"],["06","Jun"],["07","Jul"],["08","Agu"],
    ["09","Sep"],["10","Okt"],["11","Nov"],["12","Des"],
  ] as const

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(1)
  }

  const resetFilter = () => {
    setQuickPeriod(null)
    setFilterYear(null)
    setFilterMonth(null)
    setPage(1)
  }

  const applyQuickPeriod = (months: 3 | 6) => {
    setQuickPeriod(months)
    setFilterYear(null)
    setFilterMonth(null)
    setPage(1)
  }

  const applyYear = (year: string) => {
    setFilterYear(year)
    setFilterMonth(null)
    setQuickPeriod(null)
    setPage(1)
  }

  const applyMonth = (month: string) => {
    setFilterMonth(month)
    setPage(1)
  }

  // Active filter label for display
  const filterLabel = (() => {
    if (quickPeriod) return `${quickPeriod} Bulan Terakhir`
    if (filterYear && filterMonth) {
      const mLabel = MONTHS.find(([m]) => m === filterMonth)?.[1] ?? filterMonth
      return `${mLabel} ${filterYear}`
    }
    if (filterYear) return `Tahun ${filterYear}`
    return null
  })()

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cashierName.toLowerCase().includes(searchTerm.toLowerCase())

    let matchDate = true
    if (quickPeriod) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - quickPeriod)
      matchDate = new Date(item.date) >= cutoff
    } else if (filterYear && filterMonth) {
      matchDate = item.date.startsWith(`${filterYear}-${filterMonth}`)
    } else if (filterYear) {
      matchDate = item.date.startsWith(filterYear)
    }

    return matchSearch && matchDate
  })

  const filteredExpenses = expenses.filter((item) => {
    let matchDate = true
    if (quickPeriod) {
      const cutoff = new Date()
      cutoff.setMonth(cutoff.getMonth() - quickPeriod)
      matchDate = new Date(item.date) >= cutoff
    } else if (filterYear && filterMonth) {
      matchDate = item.date.startsWith(`${filterYear}-${filterMonth}`)
    } else if (filterYear) {
      matchDate = item.date.startsWith(filterYear)
    }
    return matchDate
  })

  const sortedData = [...filteredData].sort((a, b) => {
    let valA: string | number = a[sortKey as keyof SaleReport] as string | number
    let valB: string | number = b[sortKey as keyof SaleReport] as string | number
    if (typeof valA === "string") valA = valA.toLowerCase()
    if (typeof valB === "string") valB = valB.toLowerCase()
    if (valA < valB) return sortDir === "asc" ? -1 : 1
    if (valA > valB) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const totalPages   = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE))
  const safePage     = Math.min(page, totalPages)
  const paginatedData = sortedData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to page 1 when search changes
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  // Summary cards: reflect currently filtered data
  const totalRevenue      = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const totalHpp          = filteredData.reduce((sum, item) => sum + item.totalHpp, 0)
  const totalProfit       = filteredData.reduce((sum, item) => sum + item.profit, 0)
  const totalTransactions = filteredData.length
  
  const totalExpenseAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0)
  const netProfit          = totalProfit - totalExpenseAmount

  const handleExportXLSX = () => {
    if (filteredData.length === 0) {
      return toast.error("Gagal Ekspor", { description: "Tidak ada data untuk diekspor." })
    }

    try {
      const wb = XLSX.utils.book_new()
      const now = new Date()
      const exportedAt = format(now, "dd/MM/yyyy HH:mm:ss")
      const periodDesc = filterLabel ?? "Semua Data"

      // ── Sheet 1: Ringkasan ──────────────────────────────────────────
      const avgPerTx = filteredData.length > 0 ? totalRevenue / filteredData.length : 0
      const avgProfit = filteredData.length > 0 ? totalProfit / filteredData.length : 0
      const marginPct = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : "0.00"

      const summaryRows = [
        ["LAPORAN KEUANGAN", "WARUNG BINTANG"],
        ["Diekspor pada", exportedAt],
        ["Periode", periodDesc],
        ["Filter Pencarian", searchTerm || "-"],
        [""],
        ["── RINGKASAN KEUANGAN ──"],
        ["Metrik", "Nilai (Rp)", "Keterangan"],
        ["Total Pendapatan",   totalRevenue,  "Omzet bersih setelah diskon"],
        ["Total Modal (HPP)", totalHpp,      "Harga Pokok Penjualan"],
        ["Total Laba Kotor",  totalProfit,   "Pendapatan dikurangi HPP"],
        ["Total Pengeluaran", totalExpenseAmount, "Biaya Operasional"],
        ["Total Laba Bersih", netProfit, "Laba Kotor dikurangi Pengeluaran"],
        ["Total Pajak",       filteredData.reduce((s,i) => s + i.tax, 0), ""],
        ["Total Diskon",      filteredData.reduce((s,i) => s + i.discount, 0), ""],
        [""],
        ["── STATISTIK TRANSAKSI ──"],
        ["Metrik", "Nilai", "Keterangan"],
        ["Jumlah Transaksi",  filteredData.length, ""],
        ["Rata-rata per Transaksi", Math.round(avgPerTx), "(Rp)"],
        ["Rata-rata Laba/Transaksi",Math.round(avgProfit),"(Rp)"],
        ["Margin Laba Kotor", `${marginPct}%`, "Laba / Pendapatan"],
        [""],
        ["── BREAKDOWN METODE PEMBAYARAN ──"],
        ["Metode", "Jumlah Transaksi", "Total (Rp)"],
        ...Array.from(
          filteredData.reduce((map, item) => {
            const m = item.paymentMethod
            if (!map.has(m)) map.set(m, { count: 0, total: 0 })
            map.get(m)!.count++
            map.get(m)!.total += item.amount
            return map
          }, new Map<string, { count: number; total: number }>())
        ).map(([method, { count, total }]) => [method, count, total]),
      ]

      const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
      ws1["!cols"] = [{ wch: 30 }, { wch: 22 }, { wch: 35 }]
      XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan")

      // ── Sheet 2: Transaksi ──────────────────────────────────────────
      const txHeaders = [
        "No.", "No. Struk", "Waktu Transaksi", "Kasir",
        "Metode Bayar", "Jml Item", "Subtotal (Rp)",
        "Diskon (Rp)", "Pajak (Rp)", "Total Bayar (Rp)",
        "HPP/Modal (Rp)", "Laba Kotor (Rp)", "Margin (%)",
      ]
      const txRows = filteredData.map((d, i) => [
        i + 1,
        d.receiptNumber,
        format(new Date(d.date), "dd/MM/yyyy HH:mm:ss"),
        d.cashierName,
        d.paymentMethod,
        d.itemsCount,
        d.amount + d.discount - d.tax,  // subtotal before disc/tax
        d.discount,
        d.tax,
        d.amount,
        d.totalHpp,
        d.profit,
        d.amount > 0 ? Number(((d.profit / d.amount) * 100).toFixed(2)) : 0,
      ])

      const ws2 = XLSX.utils.aoa_to_sheet([txHeaders, ...txRows])
      ws2["!cols"] = [
        { wch: 5 }, { wch: 22 }, { wch: 22 }, { wch: 18 },
        { wch: 14 }, { wch: 9 }, { wch: 17 }, { wch: 13 },
        { wch: 12 }, { wch: 17 }, { wch: 17 }, { wch: 17 }, { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(wb, ws2, "Transaksi")

      // ── Sheet 3: Detail Item ────────────────────────────────────────
      const itemHeaders = [
        "No. Struk", "Waktu", "Kasir",
        "Nama Produk", "Qty", "Harga Satuan (Rp)",
        "HPP Satuan (Rp)", "Subtotal (Rp)", "HPP Total (Rp)", "Laba Item (Rp)",
      ]
      const itemRows: (string | number)[][] = []
      filteredData.forEach((d) => {
        d.itemsDetail.forEach((item) => {
          const hppTotal = item.costPrice * item.qty
          const labaItem = item.total - hppTotal
          itemRows.push([
            d.receiptNumber,
            format(new Date(d.date), "dd/MM/yyyy HH:mm"),
            d.cashierName,
            item.name,
            item.qty,
            item.price,
            item.costPrice,
            item.total,
            hppTotal,
            labaItem,
          ])
        })
      })

      const ws3 = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows])
      ws3["!cols"] = [
        { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 28 },
        { wch: 6 }, { wch: 18 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      ]
      XLSX.utils.book_append_sheet(wb, ws3, "Detail Item")

      // ── Download ────────────────────────────────────────────────────
      const safePeriod = (filterLabel ?? "semua").replace(/[/\\:*?"<>|]/g, "-")
      const filename = `Laporan_WarungBintang_${safePeriod}_${format(now, "yyyyMMdd_HHmm")}.xlsx`
      XLSX.writeFile(wb, filename)

      toast.success("Berhasil Diekspor", {
        description: `${filename} — ${filteredData.length} transaksi, ${itemRows.length} item`,
      })
    } catch (err) {
      console.error(err)
      toast.error("Gagal Ekspor", { description: "Terdapat kesalahan saat memproses file XLSX." })
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Pendapatan</p>
            <p className="text-2xl font-black tracking-tight text-primary">
              {formatRp(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-muted/10 border-border/50 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Total Modal (HPP)</p>
            <p className="text-2xl font-black tracking-tight text-muted-foreground/80">
              {formatRp(totalHpp)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-5 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-1">Total Pengeluaran</p>
            <p className="text-2xl font-black tracking-tight text-orange-600">
              {formatRp(totalExpenseAmount)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/5 border-emerald-500/20 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <CardContent className="p-5 relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Laba Bersih</p>
            <p className="text-2xl font-black tracking-tight text-emerald-600">
              {formatRp(netProfit)}
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
            className="shadow-sm border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/50 transition-all text-xs font-bold gap-1.5"
            onClick={handleExportXLSX}
          >
            <Download className="h-3.5 w-3.5" />
            EKSPOR .XLSX
          </Button>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
        <div className="p-6 space-y-4 border-b border-border/50">
          {/* Row 1: Search + count */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari No. Struk atau Kasir..."
                className="pl-9 bg-background/50 border-border/50 transition-all"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasFilter && (
                <button
                  onClick={resetFilter}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  <X className="h-3 w-3" />
                  Reset Filter
                </button>
              )}
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 h-8 px-3 shrink-0">
                <Receipt className="h-3 w-3 mr-2" />
                {filteredData.length} Laporan
                {filterLabel && <span className="ml-1 opacity-60">· {filterLabel}</span>}
              </Badge>
            </div>
          </div>

          {/* Row 2: Date filter */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 items-start">

            {/* Quick periods */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-medium shrink-0 flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" /> Periode:
              </span>
              {([
                { label: "Semua",    value: null },
                { label: "3 Bulan", value: 3 },
                { label: "6 Bulan", value: 6 },
              ] as const).map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => opt.value === null ? resetFilter() : applyQuickPeriod(opt.value)}
                  className={[
                    "h-7 px-3 rounded-full text-[11px] font-semibold border transition-all",
                    (opt.value === null && !hasFilter) || quickPeriod === opt.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-7 bg-border/50 self-center" />

            {/* Year selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-medium shrink-0">Tahun:</span>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => filterYear === year ? (() => { setFilterYear(null); setFilterMonth(null); setPage(1) })() : applyYear(year)}
                  className={[
                    "h-7 px-3 rounded-full text-[11px] font-semibold border transition-all",
                    filterYear === year
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                  ].join(" ")}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Month selector — only shown when year is selected */}
            {filterYear && (
              <>
                <div className="hidden md:block w-px h-7 bg-border/50 self-center" />
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-muted-foreground font-medium shrink-0">Bulan:</span>
                  {MONTHS.map(([num, label]) => {
                    // Only show months that have data for the selected year
                    const hasData = data.some((item) => item.date.startsWith(`${filterYear}-${num}`))
                    if (!hasData) return null
                    return (
                      <button
                        key={num}
                        onClick={() => filterMonth === num ? (() => { setFilterMonth(null); setPage(1) })() : applyMonth(num)}
                        className={[
                          "h-7 px-3 rounded-full text-[11px] font-semibold border transition-all",
                          filterMonth === num
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground",
                        ].join(" ")}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <SortableHead label="No. Struk"       sortKey="receiptNumber" current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortableHead label="Waktu Transaksi" sortKey="date"          current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortableHead label="Kasir"           sortKey="cashierName"   current={sortKey} dir={sortDir} onClick={handleSort} />
                <SortableHead label="Pembayaran"      sortKey="paymentMethod" current={sortKey} dir={sortDir} align="center" onClick={handleSort} />
                <SortableHead label="Total"           sortKey="amount"        current={sortKey} dir={sortDir} align="right" onClick={handleSort} />
                <SortableHead label="Untung (Laba)"   sortKey="profit"        current={sortKey} dir={sortDir} align="right" onClick={handleSort} />
                <TableHead className="w-[100px] text-right whitespace-nowrap">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <FileText className="h-10 w-10 mb-2" />
                      <p>Tidak ada laporan transaksi yang ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border/40 flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Menampilkan <span className="font-semibold text-foreground">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedData.length)}</span> dari <span className="font-semibold text-foreground">{sortedData.length}</span> transaksi
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
              >
                «
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                ‹
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...")
                  acc.push(p)
                  return acc
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={safePage === p ? "default" : "outline"}
                      size="sm"
                      className="h-8 w-8 p-0 text-xs"
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-xs"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
              >
                »
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
