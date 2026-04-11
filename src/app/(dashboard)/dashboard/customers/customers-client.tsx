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
    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md mt-4">
      <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pelanggan (Nama, Email, HP)..."
            className="pl-9 bg-background/50 border-border/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          className="w-full md:w-auto shadow-md"
          onClick={handleAddClick}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pelanggan
        </Button>
      </div>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama Pelanggan</TableHead>
              <TableHead>Kontak</TableHead>
              <TableHead className="hidden md:table-cell">Alamat</TableHead>
              <TableHead className="w-[180px]">Member Sejak</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Tidak ada pelanggan ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((cust) => (
                <TableRow key={cust.id} className="transition-colors hover:bg-muted/40">
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-sm border border-primary/20">
                        {cust.name.substring(0, 2)}
                      </div>
                      <span className="font-semibold">{cust.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {cust.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {cust.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate hidden md:table-cell" title={cust.address}>
                    {cust.address}
                  </TableCell>
                  <TableCell className="font-medium text-xs text-muted-foreground">
                    {format(new Date(cust.memberSince), "dd MMM yyyy", { locale: localeId })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => {
                            if (!canManageProducts) return toast.error("Akses Ditolak")
                            setEditingCustomer(cust)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(cust.id, cust.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="Misal: Budi Santoso" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input id="phone" name="phone" placeholder="0812..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="budi@email.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat (Opsional)</Label>
              <Input id="address" name="address" placeholder="Jalan Raya..." />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Data"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Data Pelanggan</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <input type="hidden" name="id" value={editingCustomer.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Lengkap <span className="text-destructive">*</span></Label>
                <Input id="edit-name" name="name" defaultValue={editingCustomer.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Nomor HP</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingCustomer.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input id="edit-email" name="email" type="email" defaultValue={editingCustomer.email} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Alamat (Opsional)</Label>
                <Input id="edit-address" name="address" defaultValue={editingCustomer.address} />
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setEditingCustomer(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
