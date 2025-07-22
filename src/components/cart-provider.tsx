import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import type { Cart, Product, ProductVariant } from '@/types'
import { db } from '@/lib/supabase'
import { useAuth } from './auth-provider'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>
  removeFromCart: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotalPrice: () => number
  getTotalItems: () => number
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(false)

  // Load cart when user changes
  useEffect(() => {
    if (currentUser) {
      loadCart()
    } else {
      setCart(null)
    }
  }, [currentUser])

  const loadCart = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const { data: cartData, error } = await db.cart.get(currentUser.id)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cart:', error)
        return
      }

      if (cartData) {
        setCart(cartData as Cart)
      } else {
        // Create a new cart if none exists
        const { data: newCart, error: createError } = await db.cart.create({
          user_id: currentUser.id
        })
        
        if (createError) {
          console.error('Error creating cart:', createError)
        } else if (newCart) {
          setCart(newCart as Cart)
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshCart = async () => {
    await loadCart()
  }

  const addToCart = async (product: Product, quantity = 1, variant?: ProductVariant) => {
    if (!currentUser || !cart) {
      toast.error(i18n.language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first')
      return
    }

    try {
      const { error } = await db.cart.addItem(cart.id, product.id, quantity, variant?.id)
      
      if (error) {
        console.error('Error adding to cart:', error)
        toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
        return
      }

      await loadCart() // Refresh cart data

      const productName = i18n.language === 'ar' ? product.name_ar || product.name : product.name
      toast.success(i18n.language === 'ar' ? `تمت إضافة ${productName} إلى السلة` : `${productName} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
    }
  }

  const removeFromCart = async (itemId: number) => {
    if (!currentUser || !cart) return

    try {
      const { error } = await db.cart.removeItem(itemId)
      
      if (error) {
        console.error('Error removing from cart:', error)
        toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الحذف من السلة' : 'Error removing from cart')
        return
      }

      await loadCart() // Refresh cart data
      toast.success(i18n.language === 'ar' ? 'تم حذف المنتج من السلة' : 'Product removed from cart')
    } catch (error) {
      console.error('Error removing from cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء الحذف من السلة' : 'Error removing from cart')
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (!currentUser || !cart) return

    if (quantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    try {
      const { error } = await db.cart.updateItem(itemId, quantity)
      
      if (error) {
        console.error('Error updating cart:', error)
        toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating cart')
        return
      }

      await loadCart() // Refresh cart data
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating cart')
    }
  }

  const clearCart = async () => {
    if (!currentUser || !cart) return

    try {
      const { error } = await db.cart.clear(cart.id)
      
      if (error) {
        console.error('Error clearing cart:', error)
        toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء مسح السلة' : 'Error clearing cart')
        return
      }

      await loadCart() // Refresh cart data
      toast.success(i18n.language === 'ar' ? 'تم مسح السلة' : 'Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء مسح السلة' : 'Error clearing cart')
    }
  }

  const getTotalPrice = () => {
    if (!cart?.items) return 0
    
    return cart.items.reduce((total, item) => {
      const product = item.product
      const variant = item.variant
      
      if (!product) return total
      
      let price = product.price_usd
      if (variant) {
        price += variant.price_adjustment_usd
      }
      
      return total + (price * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider value={{
      cart,
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
