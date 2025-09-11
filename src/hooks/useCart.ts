import { createContext, useContext } from 'react'
import type { Product } from '@/types'

interface Cart {
  id: string
  user_id: string
  items: CartItemWithProduct[]
}

interface CartItemWithProduct {
  id: string
  product_id: string
  quantity: number
  selectedProperties?: Record<string, string>
  product: Product | null
}

interface CartContextType {
  cart: Cart | null
  cartItems: CartItemWithProduct[]
  loading: boolean
  addToCart: (product: Product, quantity?: number, selectedProperties?: Record<string, string>) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  refreshCart: () => Promise<void>
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export type { Cart, CartItemWithProduct, CartContextType }
