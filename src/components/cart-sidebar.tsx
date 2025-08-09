import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCart } from '@/hooks/useCart'
import { useCurrency } from '@/hooks/useCurrency'
import { useTranslation } from 'react-i18next'
import { firestoreService, type Category, type CartItem, type Product } from '@/lib/firebase'
import { conversionRates } from '@/lib/currency'

// Define local interface for cart items with products
interface CartItemWithProduct extends CartItem {
  product: Product | null
}

export function CartSidebar() {
  const { t, i18n } = useTranslation()
  const { cart, updateQuantity, removeFromCart, getTotalItems, getTotalPrice } = useCart()
  const { formatPrice, currency } = useCurrency()
  const isRTL = i18n.language === 'ar'

  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const navigate = useNavigate()

  // Helper function to get product price with selected properties
  const getProductPriceWithProperties = (product: Product, selectedProperties?: Record<string, string>): number => {
    let finalPrice = 0
    
    // Check if product has advanced properties that affect price
    const hasAdvancedProperties = product.properties && 
      product.properties.some(p => p.affects_price)
    
    if (hasAdvancedProperties && product.properties) {
      // Use property-based pricing if properties are selected
      if (selectedProperties && Object.keys(selectedProperties).length > 0) {
        // Find the first property that affects price and use its absolute price
        for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
          const property = product.properties.find(p => p.name === propertyName)
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
        const priceProperty = product.properties.find(p => p.affects_price)
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
      if (product.sale_price_omr && product.sale_price_omr < (product.price_omr || 0)) {
        finalPrice = product.sale_price_omr
      } else {
        finalPrice = product.price_omr || 0
      }
    }
    
    return finalPrice * conversionRates[currency]
  }

  // Load categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await firestoreService.categories.list()
        setCategories(categoriesData.items)
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }
    loadCategories()
  }, [])

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return i18n.language === 'ar' ? 'عام' : 'General'
    return i18n.language === 'ar' ? (category.name_ar || category.name) : category.name
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent 
        side={isRTL ? "right" : "left"} 
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        <div className="flex flex-col h-full max-h-screen">
          <SheetHeader className="p-6 pb-4 flex-shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              {t('cart.title')}
              {totalItems > 0 && (
                <Badge variant="secondary">
                  {totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 flex flex-col px-6 min-h-0">
            {!cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-20 w-20 object-contain mx-auto opacity-50"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">
                      {t('cart.empty')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('cart.emptyDescription')}
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setOpen(false)
                      setTimeout(() => navigate('/shop'), 200)
                    }}
                  >
                    {t('cart.shopNow')}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Scrollable Cart Items */}
                <div className="flex-1 overflow-y-auto py-2 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {cart.items?.map((item: CartItemWithProduct) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg bg-card">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-md flex items-center justify-center flex-shrink-0">
                        <img 
                          src="/images/logo-s.png" 
                          alt="SpiritHub Cafe Logo" 
                          className="h-10 w-10 object-contain"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm leading-tight">
                            {i18n.language === 'ar' ? item.product?.name_ar : item.product?.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {item.product?.category_id ? getCategoryName(item.product.category_id) : (i18n.language === 'ar' ? 'عام' : 'General')}
                        </p>
                        
                        {/* Selected Properties */}
                        {item.selectedProperties && Object.keys(item.selectedProperties).length > 0 && (
                          <div className="text-xs text-muted-foreground space-y-1">
                            {Object.entries(item.selectedProperties).map(([propertyName, selectedValue]) => {
                              const property = item.product?.properties?.find(p => p.name === propertyName)
                              const option = property?.options?.find(opt => opt.value === selectedValue)
                              const label = i18n.language === 'ar' ? (option?.label_ar || option?.label) : option?.label
                              return (
                                <div key={propertyName} className="flex justify-between">
                                  <span>{i18n.language === 'ar' ? (property?.name_ar || property?.name) : property?.name}:</span>
                                  <span>{label}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="font-semibold text-amber-600">
                            {item.product && (() => {
                              const finalPrice = getProductPriceWithProperties(item.product, item.selectedProperties)
                              return formatPrice(finalPrice * item.quantity)
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fixed Cart Summary */}
                <div className="border-t pt-4 pb-6 space-y-4 flex-shrink-0 bg-background">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>{t('cart.total')}</span>
                    <span className="text-amber-600 currency">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setOpen(false)
                        setTimeout(() => navigate('/checkout'), 200)
                      }}
                    >
                      {t('cart.checkout')}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOpen(false)
                        setTimeout(() => navigate('/shop'), 200)
                      }}
                    >
                      {t('cart.continueShopping')}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
