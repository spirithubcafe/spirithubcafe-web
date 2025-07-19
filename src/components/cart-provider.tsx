import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { Cart, CartItem, Product } from '@/types'

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [cart, setCart] = useState<Cart>({
    items: [],
    total: 0,
    totalItems: 0
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cart.items.find(item => item.product.id === product.id)
    const productName = i18n.language === 'ar' ? product.nameAr : product.name
    
    setCart(prevCart => {
      let newItems: CartItem[]
      
      if (existingItem) {
        newItems = prevCart.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [...prevCart.items, { product, quantity }]
      }
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items: newItems,
        total,
        totalItems
      }
    })

    // Show toast after state update
    if (existingItem) {
      toast.success(i18n.language === 'ar' ? `تم تحديث كمية ${productName}` : `${productName} quantity updated`)
    } else {
      toast.success(i18n.language === 'ar' ? `تمت إضافة ${productName} إلى السلة` : `${productName} added to cart`)
    }
  }

  const removeFromCart = (productId: string) => {
    const removedItem = cart.items.find(item => item.product.id === productId)
    
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.product.id !== productId)
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items: newItems,
        total,
        totalItems
      }
    })

    // Show toast after state update
    if (removedItem) {
      const productName = i18n.language === 'ar' ? removedItem.product.nameAr : removedItem.product.name
      toast.success(i18n.language === 'ar' ? `تم حذف ${productName} من السلة` : `${productName} removed from cart`)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
      
      const total = newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0)
      
      return {
        items: newItems,
        total,
        totalItems
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      total: 0,
      totalItems: 0
    })
    toast.success(i18n.language === 'ar' ? 'تم مسح السلة' : 'Cart cleared')
  }

  const getTotalPrice = () => cart.total

  const getTotalItems = () => cart.totalItems

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
