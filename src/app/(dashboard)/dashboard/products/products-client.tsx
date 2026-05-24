"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Scan, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUp, ArrowDown, ArrowUpDown, Tag } from "lucide-react"
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
import { createProduct, updateProduct, deleteProduct, createCategory, adjustProductStock } from "@/app/actions/product"
import { Loader2 } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

interface ProductColumn {
  id: string
  sku: string
  name: string
  category: string
  price: number
  costPrice: number
  stock: number
  status: string
  image?: string | null
  categoryId?: string
  updatedAt?: string
  updatedBy?: {
    id: string
    name: string | null
    email: string | null
    role: string
  } | null
  variants?: { id: string; name: string; price: number; sortOrder: number }[]
}

interface Category {
  id: string
  name: string
}

export function ProductsClient({ data, categories }: { data: ProductColumn[], categories: Category[] }) {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductColumn | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductColumn | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const { canManageProducts, isLoading, role } = usePermissions()

  // Pricing states for margin calculation
  const [addCostPrice, setAddCostPrice] = useState<string>("")
  const [addPrice, setAddPrice] = useState<string>("")
  const [editCostPrice, setEditCostPrice] = useState<string>("")
  const [editPrice, setEditPrice] = useState<string>("")

  // SKU validation states
  const [addSku, setAddSku] = useState<string>("")
  const [editSku, setEditSku] = useState<string>("")

  // Barcode scanner target
  const [scanTarget, setScanTarget] = useState<'add' | 'edit' | null>(null)

  // Local categories state to allow immediate inline updates
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  
  // Category creation states
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("")
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  
  const [editSelectedCategoryId, setEditSelectedCategoryId] = useState<string>("")
  const [showEditCategoryInput, setShowEditCategoryInput] = useState(false)
  const [editNewCategoryName, setNewEditCategoryName] = useState("")
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)

  // Stock adjustment states
  const [showAdjustStockForm, setShowAdjustStockForm] = useState(false)
  const [adjType, setAdjType] = useState<'in' | 'out' | 'set'>('in')
  const [adjQty, setAdjQty] = useState("")
  const [adjNotes, setAdjNotes] = useState("")
  const [isAdjustingStock, setIsAdjustingStock] = useState(false)

  // Variant states (for add & edit forms)
  type VariantRow = { id?: string; name: string; price: string }
  const [addVariants, setAddVariants] = useState<VariantRow[]>([])
  const [editVariants, setEditVariants] = useState<VariantRow[]>([])

  // Sorting states
  const [sortField, setSortField] = useState<'sku' | 'name' | 'category' | 'costPrice' | 'price' | 'stock' | 'status' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Pagination & Infinite Scroll states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [visibleMobileCount, setVisibleMobileCount] = useState(10)
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null)

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1)
    setVisibleMobileCount(10)
  }, [searchTerm])

  // Sync prop changes
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  useEffect(() => {
    const query = searchParams.get("search")
    if (query !== null) {
      setSearchTerm(query)
    }
  }, [searchParams])

  // Sync pricing values for edit form
  useEffect(() => {
    if (editingProduct) {
      setEditCostPrice(editingProduct.costPrice?.toString() || "")
      setEditPrice(editingProduct.price?.toString() || "")
      setEditSelectedCategoryId(editingProduct.categoryId || "")
      setEditSku(editingProduct.sku)
      setShowEditCategoryInput(false)
      setNewEditCategoryName("")
      // Reset stock adjustment form
      setShowAdjustStockForm(false)
      setAdjType('in')
      setAdjQty("")
      setAdjNotes("")
      // Load existing variants into edit state
      setEditVariants(
        (editingProduct.variants || []).map(v => ({
          id: v.id,
          name: v.name,
          price: v.price.toString(),
        }))
      )
    } else {
      setEditCostPrice("")
      setEditPrice("")
      setEditSku("")
      setEditSelectedCategoryId("")
      setShowEditCategoryInput(false)
      setNewEditCategoryName("")
      setShowAdjustStockForm(false)
      setAdjType('in')
      setAdjQty("")
      setAdjNotes("")
      setEditVariants([])
    }
  }, [editingProduct])

  // Reset pricing values on add close
  useEffect(() => {
    if (!isAddOpen) {
      setAddCostPrice("")
      setAddPrice("")
      setAddSku("")
      setSelectedCategoryId("")
      setShowAddCategoryInput(false)
      setNewCategoryName("")
      setAddVariants([])
    }
  }, [isAddOpen])

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return
    setIsCreatingCategory(true)
    const res = await createCategory(newCategoryName)
    if (res.success && res.category) {
      toast.success("Kategori baru berhasil ditambahkan")
      setLocalCategories((prev) => {
        if (prev.some((c) => c.id === res.category.id)) return prev
        return [...prev, res.category]
      })
      setSelectedCategoryId(res.category.id)
      setShowAddCategoryInput(false)
      setNewCategoryName("")
    } else {
      toast.error(res.error || "Gagal menambahkan kategori")
    }
    setIsCreatingCategory(false)
  }

  const handleSaveEditCategory = async () => {
    if (!editNewCategoryName.trim()) return
    setIsCreatingCategory(true)
    const res = await createCategory(editNewCategoryName)
    if (res.success && res.category) {
      toast.success("Kategori baru berhasil ditambahkan")
      setLocalCategories((prev) => {
        if (prev.some((c) => c.id === res.category.id)) return prev
        return [...prev, res.category]
      })
      setEditSelectedCategoryId(res.category.id)
      setShowEditCategoryInput(false)
      setNewEditCategoryName("")
    } else {
      toast.error(res.error || "Gagal menambahkan kategori")
    }
    setIsCreatingCategory(false)
  }

  const handleSaveStockAdjustment = async () => {
    if (!editingProduct || !adjQty.trim()) return
    
    const qtyVal = parseInt(adjQty)
    if (isNaN(qtyVal) || (adjType !== 'set' && qtyVal <= 0) || (adjType === 'set' && qtyVal < 0)) {
      toast.error(adjType === 'set' ? "Stok akhir wajib berupa angka non-negatif" : "Jumlah wajib berupa angka positif")
      return
    }
    
    setIsAdjustingStock(true)
    
    const formData = new FormData()
    formData.append("productId", editingProduct.id)
    formData.append("type", adjType)
    formData.append("value", qtyVal.toString())
    formData.append("notes", adjNotes.trim() || "Penyesuaian stok manual")
    
    const res = await adjustProductStock(formData)
    if (res.success && res.newStock !== undefined) {
      toast.success("Stok berhasil diperbarui")
      setEditingProduct(prev => {
        if (!prev) return null
        return {
          ...prev,
          stock: res.newStock
        }
      })
      setShowAdjustStockForm(false)
      setAdjQty("")
      setAdjNotes("")
    } else {
      toast.error(res.error || "Gagal menyesuaikan stok")
    }
    setIsAdjustingStock(false)
  }

  // Scanner lifecycle controller
  useEffect(() => {
    let html5QrCode: any = null;
    
    if (scanTarget) {
      const timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode("barcode-scanner-viewport");
          
          html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 15,
            },
            (decodedText: string) => {
              toast.success(`Scan Berhasil: ${decodedText}`);
              
              if (scanTarget === 'add') {
                setAddSku(decodedText);
              } else if (scanTarget === 'edit') {
                setEditSku(decodedText);
              }
              
              setScanTarget(null);
            },
            () => {
              // Ignored - noise frames during camera start
            }
          ).catch((err: any) => {
            console.error("Camera start error:", err);
            toast.error("Gagal Mengakses Kamera", {
              description: "Pastikan izin akses kamera perangkat Anda diaktifkan."
            });
            setScanTarget(null);
          });
        } catch (e) {
          console.error("Scanner initialization failed:", e);
          setScanTarget(null);
        }
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (html5QrCode) {
          html5QrCode.stop().catch((e: any) => {
            console.error("Scanner stop error:", e);
          });
        }
      };
    }
  }, [scanTarget])

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
    // Inject variants as JSON
    const validVariants = addVariants.filter(v => v.name.trim() && parseFloat(v.price) >= 0)
    if (validVariants.length > 0) {
      formData.set("variants", JSON.stringify(validVariants.map((v, i) => ({
        name: v.name.trim(),
        price: parseFloat(v.price),
        sortOrder: i,
      }))))
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
    // Inject variants as JSON (include id for existing variants so server can update/delete)
    formData.set("variants", JSON.stringify(editVariants
      .filter(v => v.name.trim() && parseFloat(v.price) >= 0)
      .map((v, i) => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name.trim(),
        price: parseFloat(v.price),
        sortOrder: i,
      }))
    ))
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

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0
    let aVal = a[sortField]
    let bVal = b[sortField]

    if (aVal === undefined || aVal === null) return 1
    if (bVal === undefined || bVal === null) return -1

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc'
        ? aVal.localeCompare(bVal, 'id')
        : bVal.localeCompare(aVal, 'id')
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  const totalPages = Math.ceil(sortedData.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedDesktopData = sortedData.slice(startIndex, startIndex + pageSize)
  const paginatedMobileData = sortedData.slice(0, visibleMobileCount)

  const handleSort = (field: 'sku' | 'name' | 'category' | 'costPrice' | 'price' | 'stock' | 'status') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const renderSortableHeader = (
    field: 'sku' | 'name' | 'category' | 'costPrice' | 'price' | 'stock' | 'status',
    label: string,
    widthClass?: string,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    const isSorted = sortField === field
    const alignmentClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
    const justifyClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'

    return (
      <TableHead className={`${widthClass || ''} p-0 ${alignmentClass}`}>
        <button
          type="button"
          onClick={() => handleSort(field)}
          className={`w-full px-4 py-3 inline-flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors font-bold uppercase text-[10px] tracking-wider ${
            isSorted ? 'text-foreground font-extrabold' : 'text-muted-foreground/80'
          } ${justifyClass}`}
        >
          <span>{label}</span>
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-primary shrink-0 ml-0.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-primary shrink-0 ml-0.5" />
            )
          ) : (
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/30 hover:text-muted-foreground/60 shrink-0 ml-0.5" />
          )}
        </button>
      </TableHead>
    )
  }

  // Adjust page if current page becomes invalid (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  // Infinite Scroll Observer for Mobile
  useEffect(() => {
    const sentinel = mobileSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleMobileCount((prev) => {
            if (prev < filteredData.length) {
              return prev + 5
            }
            return prev
          })
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    observer.observe(sentinel)
    return () => {
      if (sentinel) observer.unobserve(sentinel)
    }
  }, [filteredData.length])

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }

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
        {/* View Desktop: Table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[80px] px-4 font-bold uppercase text-[10px] tracking-wider text-muted-foreground align-middle">Foto</TableHead>
                {renderSortableHeader('sku', 'SKU', 'w-[100px]')}
                {renderSortableHeader('name', 'Nama Produk')}
                {renderSortableHeader('category', 'Kategori')}
                {renderSortableHeader('costPrice', 'HPP', undefined, 'right')}
                {renderSortableHeader('price', 'Harga Jual', undefined, 'right')}
                {renderSortableHeader('stock', 'Stok', undefined, 'center')}
                {renderSortableHeader('status', 'Status')}
                <TableHead className="text-right px-4 font-bold uppercase text-[10px] tracking-wider text-muted-foreground align-middle">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    Tidak ada produk yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDesktopData.map((item) => (
                  <TableRow key={item.id} className="transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div 
                        onClick={() => setSelectedProduct(item)}
                        className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/50 cursor-pointer hover:scale-105 hover:border-primary/50 transition-all"
                        title="Lihat Detail Produk"
                      >
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
                    <TableCell className="text-right font-mono text-muted-foreground/60 text-xs">
                      Rp {item.costPrice.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right font-mono text-foreground font-semibold">
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
                            onClick={() => setSelectedProduct(item)}
                          >
                            <Search className="mr-2 h-4 w-4" />
                            <span>Detail</span>
                          </DropdownMenuItem>
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

          {/* Pagination Desktop */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/5 text-xs">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>
                  Menampilkan <strong>{Math.min(startIndex + 1, filteredData.length)}</strong> - <strong>{Math.min(startIndex + pageSize, filteredData.length)}</strong> dari <strong>{filteredData.length}</strong> produk
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Tampilkan:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="h-7 rounded border border-border bg-background px-1.5 py-0.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="h-7 w-7 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="h-7 w-7 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={page === '...'}
                      onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      className={`h-7 min-w-7 px-1.5 rounded text-xs font-semibold flex items-center justify-center transition-colors ${
                        page === currentPage
                          ? "bg-primary text-primary-foreground"
                          : page === '...'
                          ? "text-muted-foreground/60 cursor-default"
                          : "border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="h-7 w-7 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-7 w-7 rounded border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronsRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Mobile: Cards */}
        <div className="md:hidden grid grid-cols-1 gap-4 p-4">
          {filteredData.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/50">
              Tidak ada produk ditemukan.
            </div>
          ) : (
            paginatedMobileData.map((item) => (
              <div key={item.id} className="bg-background/50 border border-border/50 rounded-2xl p-4 space-y-4 shadow-sm relative">
                <div className="flex items-start gap-4">
                  <div 
                    onClick={() => setSelectedProduct(item)}
                    className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border/50 shrink-0 cursor-pointer hover:scale-105 transition-all"
                    title="Lihat Detail Produk"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Plus className="h-6 w-6 text-muted-foreground/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="truncate">
                        <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{item.sku}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-muted/50 hover:bg-muted outline-none">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={() => setSelectedProduct(item)}
                          >
                            <Search className="mr-2 h-4 w-4" /> Detail Produk
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              if (!canManageProducts) return toast.error("Akses Ditolak")
                              setPreviewUrl(null)
                              setCompressedFile(null)
                              setEditingProduct(item)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Produk
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={() => handleDelete(item.id, item.name)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[10px] h-5 py-0 bg-primary/5 text-primary border-primary/20">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                   <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Stok Fisik</p>
                      <p className={`text-lg font-black ${item.stock <= 5 ? "text-destructive animate-pulse" : "text-foreground"}`}>
                        {item.stock} <span className="text-[10px] font-normal text-muted-foreground">Unit</span>
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</p>
                      <Badge variant={item.status === "Tersedia" ? "default" : "destructive"} className="h-6">
                        {item.status}
                      </Badge>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl">
                   <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Harga Beli</p>
                      <p className="text-xs font-mono text-muted-foreground/80">Rp {item.costPrice.toLocaleString('id-ID')}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-primary uppercase font-bold">Harga Jual</p>
                      <p className="text-sm font-bold text-foreground">Rp {item.price.toLocaleString('id-ID')}</p>
                   </div>
                </div>
              </div>
            ))
          )}

          {/* Infinite Scroll Sentinel for Mobile */}
          {filteredData.length > 0 && (
            <div className="space-y-2.5 mt-2">
              <div className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/30 py-2 rounded-xl border border-border/30">
                Menampilkan {Math.min(visibleMobileCount, filteredData.length)} dari {filteredData.length} produk
              </div>
              {visibleMobileCount < filteredData.length && (
                <div 
                  ref={mobileSentinelRef} 
                  className="h-12 flex items-center justify-center text-muted-foreground text-xs font-semibold bg-primary/5 rounded-xl border border-primary/10"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-2" />
                  Memuat data lainnya...
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open)
        if (!open) {
          setPreviewUrl(null)
          setCompressedFile(null)
        }
      }}>
        <DialogContent className="max-w-[440px] w-[calc(100%-1.5rem)] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl border-none shadow-xl bg-card">
          <DialogHeader className="p-4 pb-3 border-b border-border/50 shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">Tambah Produk Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable form body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[calc(90vh-130px)] scrollbar-thin">
              
              {/* Row 1: Side-by-side Photo & SKU/Category info */}
              <div className="flex gap-3 items-start">
                {/* Photo Upload Card */}
                <div className="space-y-1 shrink-0">
                  <Label className="text-xs font-semibold text-muted-foreground/90">Foto</Label>
                  <Label htmlFor="image" className="relative h-20 w-20 rounded-xl border border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                    {previewUrl ? (
                      <img src={previewUrl} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-1 text-center">
                        <Plus className="h-4 w-4 text-muted-foreground mb-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] text-muted-foreground font-medium leading-none">Upload</span>
                      </div>
                    )}
                    {isCompressing && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                      </div>
                    )}
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

                {/* SKU & Category Fields */}
                <div className="flex-1 grid grid-cols-1 gap-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                    <Label htmlFor="sku" className="text-xs font-semibold text-muted-foreground/90">
                      SKU / Kode Barang <span className="text-destructive">*</span>
                    </Label>
                    <button 
                      type="button"
                      onClick={() => setScanTarget('add')}
                      className="h-6 px-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-primary/20 shrink-0"
                    >
                      <Scan className="h-3 w-3" /> Scan Barcode
                    </button>
                  </div>
                    {(() => {
                      const isDuplicate = addSku.trim() !== "" && data.some(p => p.sku.toLowerCase() === addSku.trim().toLowerCase())
                      return (
                        <>
                          <Input 
                            id="sku" 
                            name="sku" 
                            placeholder="Misal: ITM-001" 
                            required 
                            value={addSku}
                            onChange={(e) => setAddSku(e.target.value)}
                            className={`h-10 text-xs px-3 rounded-xl border bg-background/50 focus-visible:ring-2 ${
                              isDuplicate
                                ? "border-destructive focus-visible:ring-destructive/20 text-destructive"
                                : "border-input focus-visible:ring-primary/20"
                            }`}
                          />
                          {isDuplicate && (
                            <p className="text-[10px] text-destructive font-semibold mt-0.5 flex items-center gap-1">
                              <span>⚠</span> SKU ini sudah digunakan produk lain.
                            </p>
                          )}
                        </>
                      )
                    })()}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="categoryId" className="text-xs font-semibold text-muted-foreground/90">
                      Kategori Produk
                    </Label>
                    <select 
                      id="categoryId" 
                      name="categoryId" 
                      value={selectedCategoryId}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === "__new__") {
                          setShowAddCategoryInput(true)
                        } else {
                          setSelectedCategoryId(val)
                          setShowAddCategoryInput(false)
                        }
                      }}
                      className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <option value="">Pilih Kategori...</option>
                      {localCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="__new__" className="text-primary font-semibold text-xs">+ Tambah Kategori Baru...</option>
                    </select>
                    
                    {showAddCategoryInput && (
                      <div className="flex gap-2 items-center bg-primary/5 dark:bg-muted/30 p-2 rounded-xl border border-primary/10 dark:border-border/30 mt-1 animate-in slide-in-from-top-2 duration-200">
                        <Input 
                          placeholder="Nama kategori baru..."
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="h-8 text-xs px-2.5 bg-background flex-1"
                        />
                        <button
                          type="button"
                          disabled={isCreatingCategory}
                          onClick={handleSaveCategory}
                          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                        >
                          {isCreatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tambah"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddCategoryInput(false)
                            setSelectedCategoryId("")
                            setNewCategoryName("")
                          }}
                          className="h-8 px-3 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold shrink-0 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Product Name */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground/90">
                  Nama Produk <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Misal: Kopi Hitam Premium" 
                  required 
                  className="h-10 text-sm px-3 rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {/* Row 3: Visual Pricing Box with Dynamic Calculations */}
              <div className="p-3 bg-primary/5 dark:bg-muted/30 border border-primary/10 dark:border-border/30 rounded-xl space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-primary dark:text-muted-foreground uppercase tracking-wider">Harga & Margin Keuntungan</span>
                  {(() => {
                    const priceNum = parseFloat(addPrice || "0")
                    const costNum = parseFloat(addCostPrice || "0")
                    if (priceNum > 0) {
                      const profit = priceNum - costNum
                      const marginPercent = Math.round((profit / priceNum) * 100)
                      return (
                        <span className={`text-[10px] px-2 py-0.5 font-bold rounded-md ${profit >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                          {profit >= 0 
                            ? `Margin: ${marginPercent}% (+Rp ${profit.toLocaleString("id-ID")})` 
                            : `Rugi: Rp ${Math.abs(profit).toLocaleString("id-ID")}`
                          }
                        </span>
                      )
                    }
                    return <span className="text-[10px] text-muted-foreground/60 italic font-medium">Masukkan harga jual</span>
                  })()}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="costPrice" className="text-xs font-semibold text-muted-foreground/80">
                      Harga Beli / HPP
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 select-none">Rp</span>
                      <Input 
                        id="costPrice" 
                        name="costPrice" 
                        type="number" 
                        placeholder="15000" 
                        min="0" 
                        value={addCostPrice}
                        onChange={(e) => setAddCostPrice(e.target.value)}
                        style={{ paddingLeft: "2.2rem" }}
                        className="h-10 text-xs rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="price" className="text-xs font-semibold text-muted-foreground/80">
                      Harga Jual <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 select-none">Rp</span>
                      <Input 
                        id="price" 
                        name="price" 
                        type="number" 
                        placeholder="25000" 
                        min="0" 
                        required 
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        style={{ paddingLeft: "2.2rem" }}
                        className="h-10 text-xs rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Stock Input */}
              <div className="space-y-1">
                <Label htmlFor="stock" className="text-xs font-semibold text-muted-foreground/90">
                  Stok Awal Fisik <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="stock" 
                  name="stock" 
                  type="number" 
                  placeholder="50" 
                  min="0" 
                  required 
                  className="h-10 text-sm px-3 rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>

              {/* Row 5: Variant Pricing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground/90 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Varian Harga
                    <span className="text-[10px] font-normal text-muted-foreground/60">(opsional)</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setAddVariants(prev => [...prev, { name: "", price: "" }])}
                    className="h-6 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-primary/20"
                  >
                    <Plus className="h-3 w-3" /> Tambah Varian
                  </button>
                </div>
                {addVariants.length > 0 && (
                  <div className="space-y-2">
                    {addVariants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          placeholder="Nama varian (mis: Dimasak)"
                          value={v.name}
                          onChange={e => setAddVariants(prev => prev.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))}
                          className="h-9 text-xs flex-1 rounded-xl border border-input bg-background/50"
                        />
                        <div className="relative w-32 shrink-0">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground/60">Rp</span>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={v.price}
                            onChange={e => setAddVariants(prev => prev.map((r, idx) => idx === i ? { ...r, price: e.target.value } : r))}
                            style={{ paddingLeft: "2.2rem" }}
                            className="h-9 text-xs rounded-xl border border-input bg-background/50"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setAddVariants(prev => prev.filter((_, idx) => idx !== i))}
                          className="h-9 w-9 shrink-0 rounded-xl border border-border/50 bg-muted/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground flex items-center justify-center transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <p className="text-[10px] text-muted-foreground/60 italic">
                      Saat diklik di kasir, akan muncul pilihan varian. Kasir juga tetap bisa pilih harga normal.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sticky dialog footer */}
            <div className="p-3 bg-muted/30 border-t border-border/50 flex flex-col gap-2 shrink-0 sm:flex-row-reverse sm:gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting || isCompressing || (addSku.trim() !== "" && data.some(p => p.sku.toLowerCase() === addSku.trim().toLowerCase()))}
                className="w-full sm:w-auto h-11 text-sm font-semibold rounded-xl px-5 bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  isCompressing ? "Converting..." : "Simpan Produk"
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddOpen(false)}
                className="w-full sm:w-auto h-11 text-sm font-medium rounded-xl hover:bg-muted"
              >
                Batal
              </Button>
            </div>
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
        <DialogContent className="max-w-[440px] w-[calc(100%-1.5rem)] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl border-none shadow-xl bg-card">
          <DialogHeader className="p-4 pb-3 border-b border-border/50 shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">Edit Produk</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              <input type="hidden" name="id" value={editingProduct.id} />
              
              {/* Scrollable form body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[calc(90vh-130px)] scrollbar-thin">
                
                {/* Row 1: Side-by-side Photo & SKU/Category info */}
                <div className="flex gap-3 items-start">
                  {/* Photo Upload Card */}
                  <div className="space-y-1 shrink-0">
                    <Label className="text-xs font-semibold text-muted-foreground/90">Foto</Label>
                    <Label htmlFor="edit-image" className="relative h-20 w-20 rounded-xl border border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
                      {previewUrl || editingProduct.image ? (
                        <img src={previewUrl || editingProduct.image || ""} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-1 text-center">
                          <Plus className="h-4 w-4 text-muted-foreground mb-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] text-muted-foreground font-medium leading-none">Upload</span>
                        </div>
                      )}
                      {isCompressing && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center">
                          <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        </div>
                      )}
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

                  {/* SKU & Category Fields */}
                  <div className="flex-1 grid grid-cols-1 gap-2.5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                      <Label htmlFor="edit-sku" className="text-xs font-semibold text-muted-foreground/90">
                        SKU / Kode Barang <span className="text-destructive">*</span>
                      </Label>
                      <button 
                        type="button"
                        onClick={() => setScanTarget('edit')}
                        className="h-6 px-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-primary/20 shrink-0"
                      >
                        <Scan className="h-3 w-3" /> Scan Barcode
                      </button>
                    </div>
                      {(() => {
                        const isDuplicate = editSku.trim() !== "" &&
                          editSku.trim().toLowerCase() !== editingProduct.sku.toLowerCase() &&
                          data.some(p => p.sku.toLowerCase() === editSku.trim().toLowerCase())
                        return (
                          <>
                            <Input 
                              id="edit-sku" 
                              name="sku" 
                              value={editSku}
                              onChange={(e) => setEditSku(e.target.value)}
                              required 
                              className={`h-10 text-xs px-3 rounded-xl border bg-background/50 focus-visible:ring-2 ${
                                isDuplicate
                                  ? "border-destructive focus-visible:ring-destructive/20 text-destructive"
                                  : "border-input focus-visible:ring-primary/20"
                              }`}
                            />
                            {isDuplicate && (
                              <p className="text-[10px] text-destructive font-semibold mt-0.5 flex items-center gap-1">
                                <span>⚠</span> SKU ini sudah digunakan produk lain.
                              </p>
                            )}
                          </>
                        )
                      })()}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-categoryId" className="text-xs font-semibold text-muted-foreground/90">
                        Kategori Produk
                      </Label>
                      <select 
                        id="edit-categoryId" 
                        name="categoryId" 
                        value={editSelectedCategoryId}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === "__new__") {
                            setShowEditCategoryInput(true)
                          } else {
                            setEditSelectedCategoryId(val)
                            setShowEditCategoryInput(false)
                          }
                        }}
                        className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <option value="">Pilih Kategori...</option>
                        {localCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="__new__" className="text-primary font-semibold text-xs">+ Tambah Kategori Baru...</option>
                      </select>
                      
                      {showEditCategoryInput && (
                        <div className="flex gap-2 items-center bg-primary/5 dark:bg-muted/30 p-2 rounded-xl border border-primary/10 dark:border-border/30 mt-1 animate-in slide-in-from-top-2 duration-200">
                          <Input 
                            placeholder="Nama kategori baru..."
                            value={editNewCategoryName}
                            onChange={(e) => setNewEditCategoryName(e.target.value)}
                            className="h-8 text-xs px-2.5 bg-background flex-1"
                          />
                          <button
                            type="button"
                            disabled={isCreatingCategory}
                            onClick={handleSaveEditCategory}
                            className="h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                          >
                            {isCreatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : "Tambah"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowEditCategoryInput(false)
                              setEditSelectedCategoryId(editingProduct.categoryId || "")
                              setNewEditCategoryName("")
                            }}
                            className="h-8 px-3 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-semibold shrink-0 cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Product Name */}
                <div className="space-y-1">
                  <Label htmlFor="edit-name" className="text-xs font-semibold text-muted-foreground/90">
                    Nama Produk <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="edit-name" 
                    name="name" 
                    defaultValue={editingProduct.name} 
                    required 
                    className="h-10 text-sm px-3 rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                  />
                </div>

                {/* Row 3: Visual Pricing Box with Dynamic Calculations */}
                <div className="p-3 bg-primary/5 dark:bg-muted/30 border border-primary/10 dark:border-border/30 rounded-xl space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-primary dark:text-muted-foreground uppercase tracking-wider">Harga & Margin Keuntungan</span>
                    {(() => {
                      const priceNum = parseFloat(editPrice || "0")
                      const costNum = parseFloat(editCostPrice || "0")
                      if (priceNum > 0) {
                        const profit = priceNum - costNum
                        const marginPercent = Math.round((profit / priceNum) * 100)
                        return (
                          <span className={`text-[10px] px-2 py-0.5 font-bold rounded-md ${profit >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                            {profit >= 0 
                              ? `Margin: ${marginPercent}% (+Rp ${profit.toLocaleString("id-ID")})` 
                              : `Rugi: Rp ${Math.abs(profit).toLocaleString("id-ID")}`
                            }
                          </span>
                        )
                      }
                      return <span className="text-[10px] text-muted-foreground/60 italic font-medium">Masukkan harga jual</span>
                    })()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="edit-costPrice" className="text-xs font-semibold text-muted-foreground/80">
                        Harga Beli / HPP
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 select-none">Rp</span>
                        <Input 
                          id="edit-costPrice" 
                          name="costPrice" 
                          type="number" 
                          value={editCostPrice}
                          onChange={(e) => setEditCostPrice(e.target.value)}
                          style={{ paddingLeft: "2.2rem" }}
                          className="h-10 text-xs rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edit-price" className="text-xs font-semibold text-muted-foreground/80">
                        Harga Jual <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 select-none">Rp</span>
                        <Input 
                          id="edit-price" 
                          name="price" 
                          type="number" 
                          required 
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{ paddingLeft: "2.2rem" }}
                          className="h-10 text-xs rounded-xl border border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Row 4: Stock (Read-only by default, editable via helper action) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="edit-stock" className="text-xs font-semibold text-muted-foreground/90">
                      Stok Saat Ini
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowAdjustStockForm(!showAdjustStockForm)}
                      className="h-6 px-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-primary/20 shrink-0"
                    >
                      Ubah Stok
                    </button>
                  </div>
                  <Input 
                    id="edit-stock" 
                    type="number" 
                    value={editingProduct.stock} 
                    disabled 
                    className="h-10 text-sm px-3 rounded-xl border border-input bg-background/50 opacity-60 cursor-not-allowed"
                  />
                  
                  {showAdjustStockForm && (
                    <div className="bg-primary/5 dark:bg-muted/30 p-2.5 rounded-xl border border-primary/10 dark:border-border/30 mt-1.5 animate-in slide-in-from-top-2 duration-200 space-y-2.5">
                      <span className="text-[10px] font-bold text-primary dark:text-muted-foreground uppercase tracking-wider block">Form Penyesuaian Stok</span>
                      
                      <div className="flex gap-2">
                        <select
                          value={adjType}
                          onChange={(e) => {
                            setAdjType(e.target.value as 'in' | 'out' | 'set')
                            setAdjQty("")
                          }}
                          className="h-8 rounded-lg border border-input bg-background px-2 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="in">Tambah (+)</option>
                          <option value="out">Kurang (-)</option>
                          <option value="set">Ubah Jadi (=)</option>
                        </select>
                        <Input
                          type="number"
                          placeholder={adjType === 'set' ? "Stok akhir..." : "Jumlah..."}
                          value={adjQty}
                          onChange={(e) => setAdjQty(e.target.value)}
                          className="h-8 text-xs px-2.5 bg-background flex-1"
                        />
                      </div>
                      
                      <Input
                        placeholder="Catatan (opsional)..."
                        value={adjNotes}
                        onChange={(e) => setAdjNotes(e.target.value)}
                        className="h-8 text-xs px-2.5 bg-background w-full"
                      />
                      
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={isAdjustingStock}
                          onClick={handleSaveStockAdjustment}
                          className="h-7 px-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 text-[10px] font-bold shrink-0 cursor-pointer disabled:opacity-50 flex items-center justify-center min-w-[50px]"
                        >
                          {isAdjustingStock ? <Loader2 className="h-3 w-3 animate-spin" /> : "Simpan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdjustStockForm(false)
                            setAdjQty("")
                            setAdjNotes("")
                          }}
                          className="h-7 px-3 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold shrink-0 cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Row 5: Variant Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-muted-foreground/90 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Varian Harga
                      <span className="text-[10px] font-normal text-muted-foreground/60">(opsional)</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => setEditVariants(prev => [...prev, { name: "", price: "" }])}
                      className="h-6 px-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-primary/20"
                    >
                      <Plus className="h-3 w-3" /> Tambah Varian
                    </button>
                  </div>
                  {editVariants.length > 0 && (
                    <div className="space-y-2">
                      {editVariants.map((v, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder="Nama varian (mis: Dimasak)"
                            value={v.name}
                            onChange={e => setEditVariants(prev => prev.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))}
                            className="h-9 text-xs flex-1 rounded-xl border border-input bg-background/50"
                          />
                          <div className="relative w-32 shrink-0">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted-foreground/60">Rp</span>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              value={v.price}
                              onChange={e => setEditVariants(prev => prev.map((r, idx) => idx === i ? { ...r, price: e.target.value } : r))}
                              style={{ paddingLeft: "2.2rem" }}
                              className="h-9 text-xs rounded-xl border border-input bg-background/50"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditVariants(prev => prev.filter((_, idx) => idx !== i))}
                            className="h-9 w-9 shrink-0 rounded-xl border border-border/50 bg-muted/20 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground flex items-center justify-center transition-all cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      <p className="text-[10px] text-muted-foreground/60 italic">
                        Saat diklik di kasir, akan muncul pilihan varian. Kasir juga tetap bisa pilih harga normal.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sticky dialog footer */}
              <div className="p-3 bg-muted/30 border-t border-border/50 flex flex-col gap-2 shrink-0 sm:flex-row-reverse sm:gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isCompressing || (editingProduct ? (
                    editSku.trim() !== "" &&
                    editSku.trim().toLowerCase() !== editingProduct.sku.toLowerCase() &&
                    data.some(p => p.sku.toLowerCase() === editSku.trim().toLowerCase())
                  ) : false)}
                  className="w-full sm:w-auto h-11 text-sm font-semibold rounded-xl px-5 bg-primary text-primary-foreground hover:bg-primary/95 transition-colors shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    isCompressing ? "Converting..." : "Simpan Perubahan"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setEditingProduct(null)}
                  className="w-full sm:w-auto h-11 text-sm font-medium rounded-xl hover:bg-muted"
                >
                  Batal
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Scanner Dialog */}
      <Dialog open={!!scanTarget} onOpenChange={(open) => { if (!open) setScanTarget(null); }}>
        <DialogContent showCloseButton={false} className="max-w-[360px] w-[calc(100%-2rem)] p-0 overflow-hidden rounded-2xl bg-zinc-950 border border-white/10 text-white shadow-2xl">
          <DialogHeader className="p-4 pb-3 shrink-0 border-b border-white/10 flex flex-row items-center justify-between">
            <DialogTitle className="text-sm font-semibold text-white">Scan Barcode / QR Code</DialogTitle>
            <button 
              type="button" 
              onClick={() => setScanTarget(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
            {/* Viewport for html5-qrcode video */}
            <div id="barcode-scanner-viewport" className="absolute inset-0 w-full h-full object-cover [&_video]:object-cover [&_video]:w-full [&_video]:h-full" />
            
            {/* High-visibility viewport overlays (pure css scanner outline) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
              <div className="w-full flex-1 border border-dashed border-white/30 rounded-xl relative flex items-center justify-center bg-black/10">
                {/* Scanner target glowing laser line */}
                <div className="absolute left-4 right-4 h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.9)] animate-pulse" />
                
                {/* Thick neon-primary corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md" />
              </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-xs px-4 py-1.5 rounded-full border border-white/10 text-white shadow-md select-none">
              <p className="text-[11px] font-semibold tracking-wide whitespace-nowrap">Posisikan barcode di tengah kotak</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-950 flex justify-center border-t border-white/10 shrink-0">
            <button 
              type="button" 
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-colors border border-white/10 active:scale-98 cursor-pointer"
              onClick={() => setScanTarget(null)}
            >
              Batal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Product Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => { if (!open) setSelectedProduct(null); }}>
        <DialogContent className="max-w-[480px] w-[calc(100%-1.5rem)] p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh] rounded-2xl border-none shadow-xl bg-card">
          <DialogHeader className="p-4 pb-3 border-b border-border/50 shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">Detail Produk</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(90vh-120px)] scrollbar-thin">
              {/* Product Photo section */}
              <div className="flex justify-center">
                <div className="relative w-full max-w-[240px] aspect-square rounded-2xl bg-muted overflow-hidden border border-border/50 shadow-inner flex items-center justify-center group">
                  {selectedProduct.image ? (
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="text-center p-4">
                      <Plus className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground/60 font-medium">Tidak ada foto</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Info */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] tracking-wide bg-muted/40 uppercase">
                    {selectedProduct.sku}
                  </Badge>
                  <Badge variant={selectedProduct.status === "Tersedia" ? "default" : "destructive"} className="h-5 text-[10px] bg-primary/20 text-primary hover:bg-primary/30 border-transparent">
                    {selectedProduct.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{selectedProduct.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedProduct.category}</p>
                </div>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3.5 rounded-xl border border-border/30">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Stok Fisik</span>
                  <p className={`text-base font-black mt-0.5 ${selectedProduct.stock <= 5 ? "text-destructive" : "text-foreground"}`}>
                    {selectedProduct.stock} <span className="text-[10px] font-normal text-muted-foreground">Unit</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Harga Jual</span>
                  <p className="text-base font-black text-foreground mt-0.5">
                    Rp {selectedProduct.price.toLocaleString('id-ID')}
                  </p>
                </div>
                {(role === "ADMIN" || role === "MANAGER") && (
                  <div className="pt-2 border-t border-border/30 col-span-2 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-semibold">Harga Beli / HPP</span>
                    <span className="text-sm font-mono font-semibold text-muted-foreground/80">
                      Rp {selectedProduct.costPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                )}
              </div>

              {/* Update Log / Metadata */}
              <div className="bg-primary/5 dark:bg-muted/10 p-3.5 rounded-xl border border-primary/10 dark:border-border/30 text-xs space-y-2">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-semibold text-[10px] uppercase tracking-wider">Terakhir Diupdate</span>
                  <span className="font-semibold text-foreground font-mono">
                    {selectedProduct.updatedAt 
                      ? new Date(selectedProduct.updatedAt).toLocaleString('id-ID', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        }) 
                      : 'Belum ada data'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground pt-1.5 border-t border-border/20">
                  <span className="font-semibold text-[10px] uppercase tracking-wider">Oleh</span>
                  <span className="font-semibold text-foreground">
                    {selectedProduct.updatedBy ? (
                      <>
                        {selectedProduct.updatedBy.name || 'User'} 
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md ml-1 font-semibold uppercase">
                          {selectedProduct.updatedBy.role}
                        </span>
                      </>
                    ) : (
                      'Sistem / Default'
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div className="p-3 bg-muted/30 border-t border-border/50 flex justify-end shrink-0">
            <Button 
              type="button" 
              onClick={() => setSelectedProduct(null)}
              className="w-full sm:w-auto h-10 text-xs font-semibold rounded-xl"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
