import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { firestoreService, subscriptions, type Product } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/components/currency-provider'
import { CartContext, type Cart, type CartItemWithProduct } from '@/hooks/useCart'

export function CartProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const { currentUser } = useAuth()
  const { currency } = useCurrency()
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(false)

  // Create cart object for compatibility
  const cart: Cart | null = currentUser ? {
    id: `cart_${currentUser.id}`,
    user_id: currentUser.id,
    items: cartItems
  } : null

  const loadCart = useCallback(async () => {
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
  }, [currentUser])

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
  }, [currentUser, loadCart])

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
      // Reload cart to reflect changes
      await loadCart()

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
      // Reload cart to reflect changes
      await loadCart()
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
      // First check if the item exists
      const existingItem = cartItems.find(item => item.id === itemId)
      if (!existingItem) {
        console.warn('Cart item not found:', itemId)
        // Reload cart to sync with Firebase
        await loadCart()
        return
      }

      await firestoreService.cart.updateQuantity(itemId, quantity)
      // Reload cart to reflect changes
      await loadCart()
    } catch (error) {
      console.error('Error updating cart:', error)
      // Reload cart to sync with Firebase on error
      await loadCart()
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating cart')
    }
  }

  const clearCart = async () => {
    if (!currentUser) return

    try {
      await firestoreService.cart.clearCart(currentUser.id)
      // Reload cart to reflect changes
      await loadCart()
      toast.success(i18n.language === 'ar' ? 'تم مسح السلة' : 'Cart cleared')
    } catch (error) {
      console.error('Error clearing cart:', error)
      toast.error(i18n.language === 'ar' ? 'حدث خطأ أثناء مسح السلة' : 'Error clearing cart')
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (!item.product) return total
      
      // Get price based on current currency
      let price: number
      switch (currency) {
        case 'OMR':
          price = item.product.price_omr || 0
          if (item.product.is_on_sale && item.product.sale_price_omr) {
            price = item.product.sale_price_omr
          }
          break
        case 'SAR':
          price = item.product.price_sar || (item.product.price_omr * 3.75) || 0
          if (item.product.is_on_sale && item.product.sale_price_sar) {
            price = item.product.sale_price_sar
          } else if (item.product.is_on_sale && item.product.sale_price_omr) {
            price = item.product.sale_price_omr * 3.75
          }
          break
        case 'USD':
        default:
          price = item.product.price_omr || 0
          if (item.product.is_on_sale && item.product.sale_price_omr) {
            price = item.product.sale_price_omr
          }
          break
      }
      
      return total + (price * item.quantity)
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

