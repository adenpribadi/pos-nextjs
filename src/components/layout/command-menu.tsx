"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { 
  Search, 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  Store,
  CreditCard,
  LineChart,
  ClipboardList,
  Ticket,
  LogOut,
  ArrowRight,
  Loader2
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { menuItems } from "./sidebar"
import { useSession, signOut } from "next-auth/react"
import { searchProducts } from "@/app/actions/product"
import { cn } from "@/lib/utils"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { data: session } = useSession()
  const userRole = session?.user?.role || ""

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  )

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (search.length >= 2) {
        setIsLoading(true)
        try {
          const results = await searchProducts(search)
          setProducts(results)
        } catch (error) {
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      } else {
        setProducts([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-64 md:w-80 hidden lg:block group"
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        <div className="pl-11 pr-3 bg-muted/30 border border-border/40 h-10 text-xs rounded-xl w-full flex items-center text-muted-foreground/40 font-medium group-hover:bg-muted/50 group-hover:border-primary/20 transition-all">
          Pencarian cepat...
          <div className="ml-auto flex items-center gap-1">
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden border-none shadow-2xl rounded-3xl max-w-2xl bg-transparent">
          <DialogTitle className="sr-only">Command Menu</DialogTitle>
          <Command shouldFilter={false} className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-card/80 backdrop-blur-xl border border-border/40">
            <div className="flex items-center border-b border-border/40 px-4 py-4" cmdk-input-wrapper="">
              <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground/60" />
              <Command.Input
                placeholder="Cari produk, menu, atau jalankan perintah..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 font-medium"
                value={search}
                onValueChange={setSearch}
              />
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-muted-foreground/40" />}
            </div>
            <Command.List className="max-h-[450px] overflow-y-auto overflow-x-hidden p-2 no-scrollbar">
              {(products.length === 0 && search.length >= 2 && !isLoading && filteredMenuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).length === 0) && (
                <div className="py-12 text-center text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <Search className="h-6 w-6 text-muted-foreground/20" />
                    </div>
                    <p className="text-muted-foreground font-medium">Data tidak ditemukan.</p>
                  </div>
                </div>
              )}
              
              {products.length > 0 && (
                <Command.Group heading={<span className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Produk Tersedia</span>}>
                  {products.map((product) => (
                    <Command.Item
                      key={product.id}
                      value={product.name}
                      onSelect={() => runCommand(() => router.push(`/dashboard/products?search=${product.sku}`))}
                      className="group relative flex cursor-pointer select-none items-center rounded-2xl px-3 py-3 outline-none data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary transition-all mx-1 mb-1"
                    >
                      <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden mr-3 shrink-0 border border-border/40">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-white text-[10px] font-black uppercase">{product.name.substring(0,2)}</div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-bold tracking-tight truncate">{product.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase opacity-60">SKU: {product.sku}</span>
                      </div>
                      <div className="text-xs font-black tracking-tight text-foreground ml-4 shrink-0">
                        Rp {product.price.toLocaleString("id-ID")}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              <Command.Group heading={<span className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Navigasi Dashboard</span>}>
                {filteredMenuItems
                  .filter(item => search.length < 2 || item.name.toLowerCase().includes(search.toLowerCase()))
                  .map((item) => (
                    <Command.Item
                      key={item.href}
                      value={item.name}
                      onSelect={() => runCommand(() => router.push(item.href))}
                      className="flex cursor-pointer select-none items-center rounded-2xl px-4 py-3 outline-none data-[selected=true]:bg-zinc-900 data-[selected=true]:text-white transition-all mx-1 mb-1"
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span className="text-xs font-black uppercase tracking-widest flex-1">{item.name}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-data-[selected=true]:opacity-100 transition-opacity" />
                    </Command.Item>
                  ))}
              </Command.Group>

              <Command.Group heading={<span className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Aksi Cepat</span>}>
                { (search.length < 2 || "keluar logout exit".includes(search.toLowerCase())) && (
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      signOut({ callbackUrl: '/login' });
                    })}
                    className="flex cursor-pointer select-none items-center rounded-2xl px-4 py-3 outline-none data-[selected=true]:bg-destructive data-[selected=true]:text-destructive-foreground transition-all mx-1"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Keluar Sistem</span>
                  </Command.Item>
                )}
              </Command.Group>
            </Command.List>
            <div className="border-t border-border/40 bg-muted/20 px-4 py-3 flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">WarungBintang POS System</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border/40 bg-muted px-1 font-mono text-[10px]">↑↓</kbd>
                  <span className="text-[9px] text-muted-foreground font-bold">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border/40 bg-muted px-1 font-mono text-[10px]">↵</kbd>
                  <span className="text-[9px] text-muted-foreground font-bold">Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="rounded border border-border/40 bg-muted px-1 font-mono text-[10px]">ESC</kbd>
                  <span className="text-[9px] text-muted-foreground font-bold">Close</span>
                </div>
              </div>
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
