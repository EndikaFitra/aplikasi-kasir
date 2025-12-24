import { create } from 'zustand'

export type Product = {
  id: number
  nama: string
  barcode: string | null
  harga_jual: number
  stok: number
}

export type CartItem = Product & { quantity: number }

type CartState = {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  decreaseQuantity: (productId: number) => void
  clearCart: () => void
  totalAmount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id)
    if (existing) {
      // Jika produk sudah ada, tambah quantity
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      }
    }
    // Jika belum ada, masukkan ke cart
    return { cart: [...state.cart, { ...product, quantity: 1 }] }
  }),

  decreaseQuantity: (productId) => set((state) => {
    const existing = state.cart.find((item) => item.id === productId)
    if (existing && existing.quantity > 1) {
      return {
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        ),
      }
    }
    // Jika sisa 1 dan dikurangi, hapus item
    return { cart: state.cart.filter((item) => item.id !== productId) }
  }),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId)
  })),

  clearCart: () => set({ cart: [] }),

  totalAmount: () => {
    return get().cart.reduce((total, item) => total + (item.harga_jual * item.quantity), 0)
  }
}))