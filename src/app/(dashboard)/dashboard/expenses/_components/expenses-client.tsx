"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { Plus, Receipt, CheckCircle2, XCircle, Clock, Trash2, FileImage, Image as ImageIcon, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createExpense, updateExpenseStatus, deleteExpense } from "@/app/actions/expense"
import Image from "next/image"

export function ExpensesClient({ 
  initialExpenses, 
  categories,
  userRole 
}: { 
  initialExpenses: any[], 
  categories: any[],
  userRole: string 
}) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  
  const isAdminOrManager = ["ADMIN", "MANAGER"].includes(userRole)

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const res = await createExpense(formData)
      if (res.success) {
        toast.success("Pengeluaran Dicatat", {
          description: isAdminOrManager ? "Pengeluaran otomatis disetujui." : "Menunggu persetujuan Admin/Manager."
        })
        setIsOpen(false)
      } else {
        toast.error("Gagal Mencatat", { description: res.error })
      }
    })
  }

  const handleUpdateStatus = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const res = await updateExpenseStatus(id, status)
      if (res.success) {
        toast.success(`Pengeluaran ${status === "APPROVED" ? "Disetujui" : "Ditolak"}`)
      } else {
        toast.error("Gagal Update", { description: res.error })
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Hapus catatan pengeluaran ini?")) return
    startTransition(async () => {
      const res = await deleteExpense(id)
      if (res.success) {
        toast.success("Catatan dihapus")
      } else {
        toast.error("Gagal Menghapus", { description: res.error })
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Riwayat Pengeluaran</h2>
          <p className="text-muted-foreground text-sm">Daftar biaya operasional yang telah dicatat.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 font-bold rounded-xl h-11 px-6" />}>
            <Plus className="w-4 h-4 mr-2" />
            Catat Pengeluaran
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border/40 bg-background/95 backdrop-blur-xl">
            <form onSubmit={onSubmit}>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Catat Pengeluaran</DialogTitle>
                <DialogDescription>
                  Masukkan detail biaya operasional. Bukti foto struk bersifat opsional.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Keterangan Biaya</Label>
                  <Input id="description" name="description" placeholder="Contoh: Beli Token Listrik / Gas Elpiji" required className="bg-background/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                    <Input id="amount" name="amount" type="number" min="1" placeholder="50000" required className="bg-background/50 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Kategori</Label>
                    <Select name="categoryId">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Pilih Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input id="date" name="date" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required className="bg-background/50" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptImage">Bukti Struk (Opsional)</Label>
                  <Input id="receiptImage" name="receiptImage" type="file" accept="image/*" className="bg-background/50 cursor-pointer file:cursor-pointer file:text-red-500 file:font-bold file:bg-red-500/10 file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-1" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl font-bold">Batal</Button>
                <Button type="submit" disabled={isPending} className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold">
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Receipt className="w-4 h-4 mr-2" />}
                  Simpan Catatan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-black/5 overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-muted-foreground uppercase bg-muted/30 border-b border-border/40 font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Tanggal & Waktu</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Jumlah</th>
                  <th className="px-6 py-4">Status & Kasir</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {initialExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <Receipt className="w-8 h-8 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Belum ada catatan pengeluaran.</p>
                    </td>
                  </tr>
                ) : (
                  initialExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold">{format(new Date(expense.date), "dd MMM yyyy", { locale: idLocale })}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(expense.date), "HH:mm")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold flex items-center gap-2">
                          {expense.description}
                          {expense.receiptImage && (
                            <button onClick={() => setSelectedImage(expense.receiptImage)} className="text-blue-500 hover:text-blue-600 bg-blue-500/10 p-1 rounded">
                              <ImageIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {expense.category && <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mt-1">{expense.category.name}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-black text-red-500">
                          {formatRupiah(expense.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          {expense.status === "APPROVED" && <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase tracking-widest font-black"><CheckCircle2 className="w-3 h-3 mr-1" /> Disetujui</Badge>}
                          {expense.status === "PENDING" && <Badge className="bg-amber-500/10 text-amber-500 border-none text-[9px] uppercase tracking-widest font-black"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>}
                          {expense.status === "REJECTED" && <Badge className="bg-red-500/10 text-red-500 border-none text-[9px] uppercase tracking-widest font-black"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Oleh: <span className="font-bold text-foreground">{expense.user.name}</span></div>
                      </td>
                      <td className="px-6 py-4">
                        {isAdminOrManager ? (
                          <div className="flex items-center gap-2">
                            {expense.status === "PENDING" && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20" onClick={() => handleUpdateStatus(expense.id, "APPROVED")} disabled={isPending}>
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 border-amber-500/20" onClick={() => handleUpdateStatus(expense.id, "REJECTED")} disabled={isPending}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={() => handleDelete(expense.id)} disabled={isPending}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[600px] border-none bg-transparent shadow-none p-0">
          <div className="relative rounded-2xl overflow-hidden bg-black/80 flex items-center justify-center p-4">
            {selectedImage && (
              <img src={selectedImage} alt="Bukti Struk" className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            )}
            <Button 
              variant="outline" 
              size="icon"
              className="absolute top-2 right-2 bg-black/50 text-white border-none hover:bg-black"
              onClick={() => setSelectedImage(null)}
            >
              <XCircle className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
