"use client"

import { useState } from "react"
import { Plus, Trash2, Shield, User, Mail, ShieldAlert, Key, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createUser, deleteUser, resetUserPassword } from "@/app/actions/user"
import { cn } from "@/lib/utils"

interface UserEntry {
  id: string
  name: string | null
  email: string | null
  role: string
  createdAt: Date
}

export function UserManagementClient({ initialUsers }: { initialUsers: UserEntry[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState(initialUsers)

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const res = await createUser(formData)

    if (res.success) {
      toast.success("User Created", { description: "Akun baru berhasil didaftarkan." })
      setIsAddOpen(false)
      // Note: revalidatePath will handle the server data, but locally we can just refresh
      window.location.reload() 
    } else {
      toast.error("Gagal", { description: res.error })
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus akses untuk ${name}? Tindakan ini tidak dapat dibatalkan.`)) return
    
    const res = await deleteUser(id)
    if (res.success) {
      toast.success("User Deleted")
      setUsers(users.filter(u => u.id !== id))
    } else {
      toast.error("Gagal", { description: res.error })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">Daftar Pengguna</h3>
          <p className="text-sm text-muted-foreground">Kelola siapa saja yang bisa mengakses dashboard sistem BintangPOS ini.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Tambah User Baru
        </Button>
      </div>

      <Card className="border-border/50 bg-card/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                      {user.name?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "uppercase text-[10px] tracking-widest px-2 py-0.5",
                      user.role === "ADMIN" && "bg-primary/10 text-primary border-primary/30",
                      user.role === "SUPPLIER" && "bg-amber-500/10 text-amber-500 border-amber-500/30",
                      user.role === "CASHIER" && "bg-blue-500/10 text-blue-500 border-blue-500/30"
                    )}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(user.id, user.name || user.email || "User")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk staf atau supplier Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nama Lengkap</Label>
              <Input id="new-name" name="name" placeholder="Misal: Budi Supplier" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input id="new-email" name="email" type="email" placeholder="email@contoh.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Password</Label>
              <Input id="new-password" name="password" type="password" placeholder="Minimal 6 karakter" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Peran (Role)</Label>
              <select 
                name="role" 
                id="new-role"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="SUPPLIER">SUPPLIER</option>
                <option value="CASHIER">CASHIER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                * Supplier hanya memiliki akses ke menu Supply Shipment.
              </p>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Daftarkan User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
