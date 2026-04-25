"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone } from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions/customer"
import { Loader2 } from "lucide-react"

interface CustomerT {
  id: string
  name: string
  email: string
  phone: string
  address: string
  memberSince: string
}

export function CustomersClient({ data }: { data: CustomerT[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<CustomerT | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Memakai izin canManageProducts sebagai ekuivalen akses manajerial/admin
  const { canManageProducts, isLoading } = usePermissions()

  const handleAddClick = () => {
    if (!canManageProducts) return toast.error("Akses Ditolak", { description: "Hanya Admin & Manajer." })
    setIsAddOpen(true)
  }

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createCustomer(formData)
    
    if (res.success) {
      toast.success("Pelanggan Ditambahkan")
      setIsAddOpen(false)
    } else {
      toast.error("Gagal Menambah", { description: res.error })
    }
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateCustomer(formData)

    if (res.success) {
      toast.success("Data Berhasil Diubah")
      setEditingCustomer(null)
    } else {
      toast.error("Gagal Mengubah", { description: res.error })
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!canManageProducts) return toast.error("Akses Ditolak")
    
    if (confirm(`Hapus data pelanggan "${name}" secara permanen?`)) {
      const formData = new FormData()
      formData.append("id", id)
      
      const res = await deleteCustomer(formData)
      if (res.success) {
        toast.success("Pelanggan Dihapus")
      } else {
        toast.error("Gagal Menghapus", { description: res.error })
      }
    }
  }

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity rounded-full"></div>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Cari pelanggan berdasarkan nama, email, atau HP..."
            className="pl-11 h-12 bg-card/50 border-border/50 backdrop-blur-xl rounded-2xl transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="w-full md:w-auto h-12 px-8 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          onClick={handleAddClick}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Pelanggan
        </Button>
      </div>

      <div className="relative group/container">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 rounded-2xl blur-2xl opacity-50"></div>
        <Card className="relative border-border/50 shadow-2xl shadow-black/5 bg-card/60 backdrop-blur-2xl rounded-2xl overflow-hidden border">
          <CardContent className="p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profil Pelanggan</TableHead>
                    <TableHead className="py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kontak & Info</TableHead>
                    <TableHead className="py-5 hidden md:table-cell text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domisili</TableHead>
                    <TableHead className="py-5 w-[200px] text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Status Member</TableHead>
                    <TableHead className="py-5 px-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-2">
                           <Search className="h-10 w-10 opacity-20" />
                           <p className="font-bold">Tidak ada pelanggan ditemukan.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((cust) => (
                      <TableRow key={cust.id} className="border-b border-border/30 hover:bg-primary/5 transition-all group/row">
                        <TableCell className="py-4 px-8">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 blur-md rounded-2xl opacity-0 group-hover/row:opacity-100 transition-opacity"></div>
                              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-lg shadow-lg border border-white/20">
                                {cust.name.substring(0, 1)}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-foreground text-base tracking-tight">{cust.name}</span>
                              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter opacity-70">Customer-{cust.id.substring(cust.id.length - 4)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 group/info">
                              <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center group-hover/info:bg-primary/10 transition-colors">
                                <Phone className="h-3 w-3 text-muted-foreground group-hover/info:text-primary" />
                              </div>
                              <span className="text-xs font-bold text-foreground/80">{cust.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 group/info">
                              <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center group-hover/info:bg-primary/10 transition-colors">
                                <Mail className="h-3 w-3 text-muted-foreground group-hover/info:text-primary" />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground truncate max-w-[180px]">{cust.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-xs text-muted-foreground max-w-[200px] hidden md:table-cell">
                          <p className="line-clamp-2 italic">{cust.address}</p>
                        </TableCell>
                        <TableCell className="py-4">
                           <div className="flex flex-col items-center gap-1">
                              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                Aktif
                              </div>
                              <span className="text-[9px] text-muted-foreground font-bold italic">
                                Sejak {format(new Date(cust.memberSince), "MMM yyyy", { locale: localeId })}
                              </span>
                           </div>
                        </TableCell>
                        <TableCell className="py-4 px-8 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-10 w-10 p-0 inline-flex items-center justify-center rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary outline-none transition-all group/btn">
                              <MoreHorizontal className="h-5 w-5 group-hover/btn:scale-110 transition-transform" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 font-sans p-2 rounded-2xl shadow-2xl border-border/50">
                              <DropdownMenuItem 
                                className="cursor-pointer rounded-xl h-10 font-bold"
                                onClick={() => {
                                  if (!canManageProducts) return toast.error("Akses Ditolak")
                                  setEditingCustomer(cust)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4 text-primary" />
                                <span>Edit Profil</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 rounded-xl h-10 font-bold"
                                onClick={() => handleDelete(cust.id, cust.name)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Hapus Member</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/30">
              {filteredData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-bold italic">
                  Tidak ada pelanggan ditemukan.
                </div>
              ) : (
                filteredData.map((cust) => (
                  <div key={cust.id} className="p-5 space-y-5 bg-gradient-to-b from-transparent to-primary/5 active:bg-primary/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20">
                          {cust.name.substring(0, 1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-lg tracking-tight leading-tight">{cust.name}</span>
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5 px-2 py-0.5 bg-primary/10 rounded-full w-fit">
                            Premium Member
                          </span>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-card border border-border/50 shadow-sm text-muted-foreground">
                          <MoreHorizontal className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                          <DropdownMenuItem onClick={() => {
                            if (!canManageProducts) return toast.error("Akses Ditolak")
                            setEditingCustomer(cust)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(cust.id, cust.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-card/80 rounded-2xl border border-border/50 shadow-sm">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{cust.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-card/80 rounded-2xl border border-border/50 shadow-sm">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground truncate">{cust.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                       <div className="flex flex-col">
                         <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Bergabung</span>
                         <span className="text-xs font-bold text-foreground/70">{format(new Date(cust.memberSince), "dd MMM yyyy", { locale: localeId })}</span>
                       </div>
                       <div className="text-right">
                         <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest block">Domisili</span>
                         <span className="text-xs font-medium italic line-clamp-1 max-w-[120px]">{cust.address}</span>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
          <DialogHeader className="pt-4">
            <DialogTitle className="text-2xl font-black tracking-tight">Pelanggan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest ml-1">Nama Lengkap</Label>
              <Input id="name" name="name" placeholder="Misal: Budi Santoso" required className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest ml-1">Nomor HP</Label>
                <Input id="phone" name="phone" placeholder="0812..." className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest ml-1">Email</Label>
                <Input id="email" name="email" type="email" placeholder="budi@email.com" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest ml-1">Alamat Domisili</Label>
              <Input id="address" name="address" placeholder="Jalan Raya..." className="h-11 rounded-xl" />
            </div>
            <DialogFooter className="mt-8 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="rounded-xl h-11 px-6">
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Daftarkan Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
          <DialogHeader className="pt-4">
            <DialogTitle className="text-2xl font-black tracking-tight">Edit Profil Member</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleEditSubmit} className="space-y-5 pt-4">
              <input type="hidden" name="id" value={editingCustomer.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-xs font-black uppercase tracking-widest ml-1">Nama Lengkap</Label>
                <Input id="edit-name" name="name" defaultValue={editingCustomer.name} required className="h-11 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone" className="text-xs font-black uppercase tracking-widest ml-1">Nomor HP</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingCustomer.phone} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-xs font-black uppercase tracking-widest ml-1">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingCustomer.email} className="h-11 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address" className="text-xs font-black uppercase tracking-widest ml-1">Alamat Domisili</Label>
                <Input id="edit-address" name="address" defaultValue={editingCustomer.address} className="h-11 rounded-xl" />
              </div>
              <DialogFooter className="mt-8 gap-3">
                <Button type="button" variant="ghost" onClick={() => setEditingCustomer(null)} className="rounded-xl h-11 px-6">
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
