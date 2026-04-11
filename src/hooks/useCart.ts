import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  stock: number
  image: string | null
  discount: number // Nominal discount per unit, default 0
}

interface CartStore {
  items: CartItem[]
  taxRate: number // Default tax rate in decimal, e.g., 0.11 for 11%
  discountGlobal: number // Global order discount
  
  // Actions
  addItem: (product: Omit<CartItem, 'id' | 'quantity' | 'discount'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateItemDiscount: (productId: string, discount: number) => void
  setGlobalDiscount: (discount: number) => void
  setTaxRate: (rate: number) => void
  clearCart: () => void

  // Computed Values
  getSubtotal: () => number
  getTaxAmount: () => number
  getTotalAmount: () => number
  getTotalItems: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      taxRate: 0.11, // 11% default PPN
      discountGlobal: 0,

      addItem: (product) => {
        const state = get()
        const existingItem = state.items.find((item) => item.productId === product.productId)

        if (existingItem && existingItem.quantity >= product.stock) {
          toast.error("Operasi Ditolak", { 
            description: `Hanya tersedia maksimal ${product.stock} unit untuk ${product.name}.` 
          })
          return
        }

        if (!existingItem && product.stock <= 0) {
          toast.error("Stok Kosong", { 
            description: `Tidak dapat menambahkan ${product.name} karena stok fisik habis.` 
          })
          return
        }

        toast.success("Berhasil ditambahkan", { 
          description: `1x ${product.name} telah masuk ke keranjang.`,
          duration: 1500
        })

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [
              ...state.items,
              { ...product, id: crypto.randomUUID(), quantity: 1, discount: 0 },
            ],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        const state = get()
        const item = state.items.find((i) => i.productId === productId)
        if (!item) return
        
        let safeQuantity = quantity;
        if (quantity > item.stock) {
          toast.error("Melebihi Batas Stok", { 
            description: `Stok hanya tersisa ${item.stock} untuk baris barang ini.` 
          })
          safeQuantity = item.stock;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId) {
              const newQty = Math.max(1, safeQuantity)
              return { ...item, quantity: newQty }
            }
            return item
          }),
        }))
      },

      updateItemDiscount: (productId, discount) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, discount: Math.max(0, discount) } : item
          ),
        }))
      },

      setGlobalDiscount: (discount) => set({ discountGlobal: Math.max(0, discount) }),
      setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
      clearCart: () => set({ items: [], discountGlobal: 0 }),

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const itemTotal = (item.price - item.discount) * item.quantity
          return total + Math.max(0, itemTotal)
        }, 0)
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal() - get().discountGlobal
        const taxable = Math.max(0, subtotal)
        return taxable * get().taxRate
      },

      getTotalAmount: () => {
        const subtotal = get().getSubtotal() - get().discountGlobal
        const taxable = Math.max(0, subtotal)
        const tax = taxable * get().taxRate
        return taxable + tax
      },

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: 'pos-cart-storage',
    }
  )
)
