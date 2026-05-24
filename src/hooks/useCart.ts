import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export interface CartItem {
  id: string            // Unique cart row ID (productId + variantId or 'default')
  productId: string
  variantId?: string    // ID varian yang dipilih (opsional)
  variantName?: string  // Nama varian untuk ditampilkan (opsional)
  name: string          // Nama produk saja (tanpa varian)
  price: number
  quantity: number
  stock: number
  image: string | null
  discount: number // Nominal discount per unit, default 0
}

// Helper untuk membuat composite key unik per baris keranjang
function makeCartItemId(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? 'default'}`
}

interface CartStore {
  items: CartItem[]
  taxRate: number // Default tax rate in decimal, e.g., 0.11 for 11%
  discountGlobal: number // Global order discount
  appliedPromo: { id: string, code: string } | null // Active promo info
  
  // Actions
  addItem: (product: Omit<CartItem, 'id' | 'quantity' | 'discount'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateItemDiscount: (cartItemId: string, discount: number) => void
  setGlobalDiscount: (discount: number) => void
  setAppliedPromo: (promo: { id: string, code: string } | null) => void
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
      appliedPromo: null,

      addItem: (product) => {
        const cartItemId = makeCartItemId(product.productId, product.variantId)
        const state = get()
        const existingItem = state.items.find((item) => item.id === cartItemId)

        // Cek total stok semua baris dari produk yang sama (semua varian)
        const totalInCartForProduct = state.items
          .filter(i => i.productId === product.productId)
          .reduce((sum, i) => sum + i.quantity, 0)

        if (totalInCartForProduct >= product.stock) {
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

        const displayName = product.variantName
          ? `${product.name} — ${product.variantName}`
          : product.name

        toast.success("Berhasil ditambahkan", { 
          description: `1x ${displayName} telah masuk ke keranjang.`,
          duration: 1500
        })

        set((state) => {
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === cartItemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }

          return {
            items: [
              ...state.items,
              { ...product, id: cartItemId, quantity: 1, discount: 0 },
            ],
          }
        })
      },

      removeItem: (cartItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }))
      },

      updateQuantity: (cartItemId, quantity) => {
        const state = get()
        const item = state.items.find((i) => i.id === cartItemId)
        if (!item) return

        // Cek total stok semua varian produk yang sama
        const totalOtherRows = state.items
          .filter(i => i.productId === item.productId && i.id !== cartItemId)
          .reduce((sum, i) => sum + i.quantity, 0)
        const maxForThisRow = item.stock - totalOtherRows
        
        let safeQuantity = quantity;
        if (quantity > maxForThisRow) {
          toast.error("Melebihi Batas Stok", { 
            description: `Stok hanya tersisa ${maxForThisRow} lagi untuk produk ini.` 
          })
          safeQuantity = maxForThisRow;
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === cartItemId) {
              const newQty = Math.max(1, safeQuantity)
              return { ...item, quantity: newQty }
            }
            return item
          }),
        }))
      },

      updateItemDiscount: (cartItemId, discount) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, discount: Math.max(0, discount) } : item
          ),
        }))
      },

      setGlobalDiscount: (discount) => set({ discountGlobal: Math.max(0, discount) }),
      setAppliedPromo: (promo) => set({ appliedPromo: promo }),
      setTaxRate: (rate) => set({ taxRate: Math.max(0, rate) }),
      clearCart: () => set({ items: [], discountGlobal: 0, appliedPromo: null }),

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
