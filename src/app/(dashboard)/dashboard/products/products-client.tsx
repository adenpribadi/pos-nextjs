"use client"

import { useState } from "react"
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/usePermissions"
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
import { createProduct, updateProduct, deleteProduct } from "@/app/actions/product"
import { Loader2 } from "lucide-react"

interface ProductColumn {
  id: string
  sku: string
  name: string
  category: string
  price: number
  stock: number
  status: string
  image?: string | null
  categoryId?: string
}

interface Category {
  id: string
  name: string
}

export function ProductsClient({ data, categories }: { data: ProductColumn[], categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductColumn | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const { canManageProducts, isLoading } = usePermissions()

  const handleAddClick = () => {
    if (!canManageProducts) {
      toast.error("Akses Ditolak", {
        description: "Hanya Admin atau Manajer yang diizinkan untuk menambah produk master baru."
      })
      return
    }
    setPreviewUrl(null)
    setCompressedFile(null)
    setIsAddOpen(true)
  }

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          const MAX_SIZE = 1000
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width
              width = MAX_SIZE
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height
              height = MAX_SIZE
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                  type: "image/webp",
                  lastModified: Date.now(),
                })
                resolve(compressed)
              } else {
                reject(new Error("Gagal mengompres gambar"))
              }
            },
            "image/webp",
            0.8
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsCompressing(true)
      try {
        const compressed = await compressImage(file)
        setCompressedFile(compressed)
        const url = URL.createObjectURL(compressed)
        setPreviewUrl(url)
      } catch (error) {
        console.error(error)
        toast.error("Gagal memproses gambar")
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (compressedFile) {
      formData.set("image", compressedFile)
    }
    const res = await createProduct(formData)

    if (res.success) {
      toast.success("Produk Berhasil Ditambahkan", {
        description: "Produk telah masuk ke katalog dan log inventori awal tersimpan."
      })
      setIsAddOpen(false)
      setPreviewUrl(null)
      setCompressedFile(null)
    } else {
      toast.error("Gagal Menambah Produk", {
        description: res.error
      })
    }
    
    setIsSubmitting(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (compressedFile) {
      formData.set("image", compressedFile)
    }
    const res = await updateProduct(formData)

    if (res.success) {
      toast.success("Produk Berhasil Diubah")
      setEditingProduct(null)
      setCompressedFile(null)
    } else {
      toast.error("Gagal Mengubah", { description: res.error })
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!canManageProducts) return toast.error("Akses Ditolak")
    
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
      const formData = new FormData()
      formData.append("id", id)
      
      const res = await deleteProduct(formData)
      if (res.success) {
        toast.success("Produk Berhasil Dihapus")
      } else {
        toast.error("Gagal Menghapus", { description: res.error })
      }
    }
  }

  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-md">
      <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-border/50">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk atau SKU..."
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
          Tambah Produk
        </Button>
      </div>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead>Nama Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga</TableHead>
              <TableHead className="text-center">Stok</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Tidak ada produk yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                  <TableCell>
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    Rp {item.price.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    <span className={item.stock <= 5 ? "text-destructive" : "text-foreground"}>
                      {item.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Tersedia" ? "default" : "destructive"} className="bg-primary/20 text-primary hover:bg-primary/30 border-transparent">
                      {item.status}
                    </Badge>
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
                            setPreviewUrl(null)
                            setCompressedFile(null)
                            setEditingProduct(item)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => handleDelete(item.id, item.name)}
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

      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open)
        if (!open) {
          setPreviewUrl(null)
          setCompressedFile(null)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU / Kode Barang <span className="text-destructive">*</span></Label>
              <Input id="sku" name="sku" placeholder="Misal: ITM-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori Produk</Label>
              <select 
                id="categoryId" 
                name="categoryId" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
              >
                <option value="">Pilih Kategori...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
              <Input id="name" name="name" placeholder="Misal: Kopi Hitam Premium" required />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="cursor-pointer">
                  URL Foto Produk / Upload Foto
                  <div className="mt-2 h-48 w-full border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all overflow-hidden relative group">
                    {previewUrl ? (
                      <img src={previewUrl} className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <Plus className="h-6 w-6 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-muted-foreground font-medium">Klik untuk Pilih Gambar</span>
                      </>
                    )}
                    {isCompressing && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                        <span className="text-xs font-bold text-primary animate-pulse uppercase tracking-wider">Converting...</span>
                      </div>
                    )}
                  </div>
                </Label>
                <Input 
                  id="image" 
                  name="image" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga Jual (Rp) <span className="text-destructive">*</span></Label>
                <Input id="price" name="price" type="number" placeholder="25000" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Awal Fisik <span className="text-destructive">*</span></Label>
                <Input id="stock" name="stock" type="number" placeholder="50" min="0" required />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting || isCompressing}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCompressing ? "Converting..." : "Simpan Produk")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setEditingProduct(null)
          setPreviewUrl(null)
          setCompressedFile(null)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
              <input type="hidden" name="id" value={editingProduct.id} />
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU / Kode Barang <span className="text-destructive">*</span></Label>
                <Input id="edit-sku" name="sku" defaultValue={editingProduct.sku} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">Kategori Produk</Label>
                <select 
                  id="edit-categoryId" 
                  name="categoryId" 
                  defaultValue={editingProduct.categoryId}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
                >
                  <option value="">Pilih Kategori...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Produk <span className="text-destructive">*</span></Label>
                <Input id="edit-name" name="name" defaultValue={editingProduct.name} required />
              </div>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-image" className="cursor-pointer">
                    Ganti Foto Produk
                    <div className="mt-2 h-48 w-full border-2 border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-all overflow-hidden relative">
                      {previewUrl || editingProduct.image ? (
                        <img src={previewUrl || editingProduct.image || ""} className="h-full w-full object-cover" />
                      ) : (
                        <Plus className="h-6 w-6 text-muted-foreground" />
                      )}
                      {isCompressing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
                          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                          <span className="text-xs font-bold text-primary animate-pulse uppercase tracking-wider">Converting...</span>
                        </div>
                      )}
                    </div>
                  </Label>
                  <Input 
                    id="edit-image" 
                    name="image" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Harga Jual (Rp) <span className="text-destructive">*</span></Label>
                  <Input id="edit-price" name="price" type="number" defaultValue={editingProduct.price} min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stok (Ubah via Inventori)</Label>
                  <Input id="edit-stock" type="number" value={editingProduct.stock} disabled />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>
                  Batal
                </Button>
              <Button type="submit" disabled={isSubmitting || isCompressing}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isCompressing ? "Converting..." : "Simpan Perubahan")}
              </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
