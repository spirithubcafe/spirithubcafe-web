import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { firestoreService, subscriptions, type Product, type CartItem } from '@/lib/firebase'
import { useAuth } from './auth-provider'

interface Cart {
  id: string
  user_id: string
  items: CartItemWithProduct[]
}

interface CartItemWithProduct extends CartItem {
  product: Product | null
}

interface CartContextType {
  cart: Cart | null
  cartItems: CartItemWithProduct[]
  loading: boolean
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  // Create cart object for compatibility
  const cart: Cart | null = currentUser ? {
    id: `cart_${currentUser.id}`,
    user_id: currentUser.id,
    items: cartItems
  } : null

  // Load cart when user changes
  useEffect(() => {
    if (currentUser) {
      loadCart()
      
      // Set up real-time subscription
      const unsubscribe = subscriptions.onCartChange(currentUser.id, (items) => {
        loadCartWithProducts(items)
      })
      
      return unsubscribe
    } else {
      setCartItems([])
    }
  }, [currentUser])

  const loadCartWithProducts = async (items: any[]) => {
    try {
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          // Ensure product_id is a string
          const productId = String(item.product_id);
          const product = await firestoreService.products.get(productId)
          return {
            ...item,
            product
          }
        })
      )
      setCartItems(itemsWithProducts)
    } catch (error) {
      console.error('Error loading cart with products:', error)
    }
  }

  const loadCart = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const result = await firestoreService.cart.getUserCart(currentUser.id)
      setCartItems(result.items)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    await loadCart()
  }

  const addToCart = async (product: Product, quantity = 1) => {
    if (!currentUser) {
      toast.error(i18n.language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first')
      return
    }

    try {
      // Ensure product ID is a string
      const productId = String(product.id);
      await firestoreService.cart.addItem(currentUser.id, productId, quantity)

      const productName = i18n.language === 'ar' ? product.name_ar || product.name : product.name
      toast.success(i18n.language === 'ar' ? `تمت إضافة ${productName} إلى السلة` : `${productName} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
    }
  }

  const removeFromCart = async (itemId: string) => {
    if (!currentUser) return

    try {
      await firestoreService.cart.removeItem(itemId)
      toast.success(i18n.language === 'ar' ? 'تم حذف المنتج من السلة' : 'Product removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الحذف من السلة' : 'Error removing from cart')
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!currentUser) return

    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      await firestoreService.cart.updateQuantity(itemId, quantity)
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating cart')
    }
  }

  const clearCart = async () => {
    if (!currentUser) return

    try {
      await firestoreService.cart.clearCart(currentUser.id)
      toast.success(i18n.language === 'ar' ? 'تم مسح السلة' : 'Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء مسح السلة' : 'Error clearing cart')
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total
      
      let price = item.product.price_usd
      if (item.product.is_on_sale && item.product.sale_price_usd) {
        price = item.product.sale_price_usd
      }
      // Ensure price is a number and not undefined
      const safePrice = typeof price === 'number' ? price : 0;
      return total + (safePrice * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
      cartItems,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      refreshCart
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
