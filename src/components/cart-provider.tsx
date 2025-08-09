import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { firestoreService, subscriptions, type Product } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { CartContext, type Cart, type CartItemWithProduct } from '@/hooks/useCart'
import { conversionRates } from '@/lib/currency'

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

  const addToCart = async (product: Product, quantity = 1, selectedProperties?: Record<string, string>) => {
    if (!currentUser) {
      toast.error(i18n.language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first')
      return
    }

    try {
      // Auto-select lowest-priced option when product has pricing properties and none were provided
      let effectiveSelectedProps = selectedProperties
      if ((!effectiveSelectedProps || Object.keys(effectiveSelectedProps).length === 0) && product.properties && product.properties.length > 0) {
        const pricingProperty = product.properties.find(p => p.affects_price && p.options && p.options.length > 0)
        if (pricingProperty) {
          const getOptionPriceOMR = (opt: any): number => {
            const now = new Date()
            const onSale = opt.on_sale && (!opt.sale_start_date || new Date(opt.sale_start_date) <= now) && (!opt.sale_end_date || new Date(opt.sale_end_date) >= now)
            if (typeof opt.price_omr === 'number' && opt.price_omr > 0) {
              return onSale && typeof opt.sale_price_omr === 'number' && opt.sale_price_omr > 0 ? opt.sale_price_omr : opt.price_omr
            }
            const modifier = onSale ? (opt.sale_price_modifier_omr ?? opt.price_modifier_omr ?? opt.price_modifier) : (opt.price_modifier_omr ?? opt.price_modifier)
            return typeof modifier === 'number' && modifier > 0 ? modifier : Number.MAX_SAFE_INTEGER
          }
          let best = pricingProperty.options[0]
          let bestPrice = getOptionPriceOMR(best)
          for (const opt of pricingProperty.options) {
            const p = getOptionPriceOMR(opt)
            if (p < bestPrice) { best = opt; bestPrice = p }
          }
          effectiveSelectedProps = { [pricingProperty.name]: best.value }
        }
      }

      // Ensure product ID is a string
      const productId = String(product.id);
      await firestoreService.cart.addItem(currentUser.id, productId, quantity, effectiveSelectedProps)
      // Reload cart to reflect changes
      await loadCart()

      const productName = i18n.language === 'ar' ? product.name_ar || product.name : product.name
      // Build selected property summary for toast (e.g., Weight: 250g)
      let propSummary = ''
      if (effectiveSelectedProps && product.properties && Object.keys(effectiveSelectedProps).length > 0) {
        const parts: string[] = []
        for (const [propName, selectedValue] of Object.entries(effectiveSelectedProps)) {
          const prop = product.properties.find(p => p.name === propName)
          const option = prop?.options?.find(opt => opt.value === selectedValue)
          if (prop && option) {
            const propLabel = i18n.language === 'ar' ? (prop.name_ar || prop.name) : prop.name
            const optionLabel = i18n.language === 'ar' ? (option.label_ar || option.label) : option.label
            parts.push(`${propLabel}: ${optionLabel}`)
          }
        }
        if (parts.length > 0) {
          propSummary = ` (${parts.join(', ')})`
        }
      }
      toast.success(
        i18n.language === 'ar' 
          ? `تمت إضافة ${productName}${propSummary} إلى السلة`
          : `${productName}${propSummary} added to cart`
      )
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
      
      let finalPrice = 0
      
      // Check if product has advanced properties that affect price
      const hasAdvancedProperties = item.product.properties && 
        item.product.properties.some(p => p.affects_price)
      
      if (hasAdvancedProperties && item.product.properties) {
        // Use property-based pricing if properties are selected
        if (item.selectedProperties && Object.keys(item.selectedProperties).length > 0) {
          // Find the first property that affects price and use its absolute price
          for (const [propertyName, selectedValue] of Object.entries(item.selectedProperties)) {
            const property = item.product.properties.find(p => p.name === propertyName)
            if (property && property.affects_price) {
              const option = property.options.find(opt => opt.value === selectedValue)
              if (option) {
                // Check if option has absolute prices (new system) or modifiers (old system)
                if (option.price_omr) {
                  // New system: absolute price only
                  if (option.on_sale && option.sale_price_omr) {
                    finalPrice = option.sale_price_omr
                  } else {
                    finalPrice = option.price_omr
                  }
                } else if (option.price_modifier_omr || option.price_modifier) {
                  // Legacy: modifier is treated as standalone price
                  const modifier = option.price_modifier_omr || option.price_modifier || 0
                  finalPrice = modifier
                }
                break // Use first property that affects price
              }
            }
          }
        }
        // If no properties selected but product has advanced properties, use the first property's first option price
        if (finalPrice === 0) {
          const priceProperty = item.product.properties.find(p => p.affects_price)
          if (priceProperty && priceProperty.options.length > 0) {
            const firstOption = priceProperty.options[0]
            // Check if first option has absolute prices (new system) or modifiers (old system)
            if (firstOption.price_omr) {
              // New system: absolute price only
              if (firstOption.on_sale && firstOption.sale_price_omr) {
                finalPrice = firstOption.sale_price_omr
              } else {
                finalPrice = firstOption.price_omr
              }
            } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
              // Legacy: modifier is treated as standalone price
              const modifier = firstOption.price_modifier_omr || firstOption.price_modifier || 0
              finalPrice = modifier
            }
          }
        }
      } else {
        // Use product base price if no advanced properties
        if (item.product.sale_price_omr && item.product.sale_price_omr < (item.product.price_omr || 0)) {
          finalPrice = item.product.sale_price_omr
        } else {
          finalPrice = item.product.price_omr || 0
        }
      }
      
      const price = finalPrice * conversionRates[currency]
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

