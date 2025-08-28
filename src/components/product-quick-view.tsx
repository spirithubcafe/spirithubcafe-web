import React, { useState, useEffect } from 'react'
import { Plus, Minus, Heart } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockIndicator } from '@/components/ui/stock-indicator'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { getProductPriceDetails, type Product } from '@/lib/firebase'
import CoffeeInfoDisplay from '@/components/product/CoffeeInfoDisplay'
import toast from 'react-hot-toast'

interface ProductQuickViewProps {
  product: Product
  children: React.ReactNode
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist, loading: wishlistLoading } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({})

  const isArabic = i18n.language === 'ar'

  // Initialize default selections for property-based pricing
  useEffect(() => {
    if (product && product.properties) {
      const pricingProperties = product.properties.filter(p => p.affects_price && p.options && p.options.length > 0)
      
      // Only auto-select if product has advanced properties and no selections made yet
      if (pricingProperties.length > 0 && Object.keys(selectedProperties).length === 0) {
        // Find the combination that gives the minimum price
        let minPrice = Infinity
        let bestCombination: Record<string, string> = {}
        
        const findBestCombination = (propertyIndex: number, currentSelections: Record<string, string>): void => {
          if (propertyIndex >= pricingProperties.length) {
            // Calculate price for this combination
            let totalPrice = 0
            for (const property of pricingProperties) {
              const selectedValue = currentSelections[property.name]
              const option = property.options.find(opt => opt.value === selectedValue)
              if (option) {
                let optionPrice = 0
                // Check if option has absolute prices (new system) or modifiers (old system)
                if (currency === 'OMR') {
                  if (option.price_omr) {
                    // New system: absolute price only
                    optionPrice = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
                  } else if (option.price_modifier_omr || option.price_modifier) {
                    // Legacy: treat modifier as standalone price (do not add base)
                    const modifier = option.price_modifier_omr || option.price_modifier || 0
                    optionPrice = modifier
                  }
                } else if (currency === 'SAR') {
                  if (option.price_sar) {
                    // New system: absolute price only
                    optionPrice = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
                  } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                    // Legacy: treat modifier as standalone price (do not add base)
                    const modifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                    optionPrice = modifier
                  }
                } else {
                  if (option.price_usd) {
                    // New system: absolute price only
                    optionPrice = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
                  } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                    // Legacy: treat modifier as standalone price (do not add base)
                    const modifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                    optionPrice = modifier
                  }
                }
                totalPrice = optionPrice // Use absolute price, not cumulative
                break // Only use first property that affects price
              }
            }
            
            if (totalPrice < minPrice) {
              minPrice = totalPrice
              bestCombination = { ...currentSelections }
            }
            return
          }

          const property = pricingProperties[propertyIndex]
          for (const option of property.options) {
            findBestCombination(
              propertyIndex + 1,
              { ...currentSelections, [property.name]: option.value }
            )
          }
        }

        findBestCombination(0, {})
        setSelectedProperties(bestCombination)
      }
    }
  }, [product, currency, selectedProperties])

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsLoading(true)
    try {
      await addToCart(product, quantity, Object.keys(selectedProperties).length > 0 ? selectedProperties : undefined)
      setQuantity(1)
      setIsOpen(false)
      toast.success(isArabic ? 'تمت إضافة المنتج إلى السلة' : 'Product added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
    } finally {
      setIsLoading(false)
    }
  }

  // Get detailed pricing information including sale status
  const priceDetails = getProductPriceDetails(product, selectedProperties, currency.toLowerCase() as 'omr' | 'usd' | 'sar')
  
  // Get product badges
  const getProductBadges = () => {
    const badges = []
    
    if (priceDetails.isOnSale) {
      badges.push({
        text: isArabic ? `خصم ${priceDetails.discountPercentage}%` : `${priceDetails.discountPercentage}% OFF`,
        color: 'bg-red-500'
      })
    }
    
    if (product.stock_quantity <= 5 && product.stock_quantity > 0) {
      badges.push({
        text: isArabic ? 'كمية محدودة' : 'Limited Stock',
        color: 'bg-orange-500'
      })
    }
    
    return badges
  }

  const badges = getProductBadges()
  const productName = isArabic ? (product.name_ar || product.name) : product.name

  // Get all available images
  const getProductImages = () => {
    const availableImages = []
    
    // Add main image first (highest priority)
    if (product.image_url) availableImages.push(product.image_url)
    if (product.image) availableImages.push(product.image)
    
    // Then add gallery images
    if (product.images) availableImages.push(...product.images)
    if (product.gallery) availableImages.push(...product.gallery)
    if (product.gallery_images) availableImages.push(...product.gallery_images)
    
    // Remove duplicates and empty strings
    return [...new Set(availableImages.filter(img => img && img.trim() !== ''))]
  }

  const productImages = getProductImages()

  const incrementQuantity = () => {
    if (quantity < (product.stock_quantity || 0)) {
      setQuantity(prev => prev + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist(product.id)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء إضافة/إزالة المفضلة' : 'Error updating wishlist')
    }
  }

  // Get total price based on selected properties and quantity
  const getTotalPrice = () => {
    return priceDetails.finalPrice * quantity
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <div className="grid lg:grid-cols-2 gap-6 p-4">
          {/* Product Images - Left Side */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              {productImages.length > 0 ? (
                <img
                  src={productImages[selectedImageIndex] || '/images/logo.png'}
                  alt={productName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/logo.png'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-20 w-20 object-contain opacity-50"
                  />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {productImages.slice(0, 3).map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index ? 'border-primary' : 'border-muted hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/logo.png'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Right Side */}
          <div className="space-y-4">
            {/* Title and Rating */}
            <div>
              <h1 className="text-xl font-bold mb-2">
                {productName}
              </h1>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {badges.map((badge, index) => (
                    <Badge key={index} className={`text-white ${badge.color}`}>
                      {badge.text}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Coffee Information */}
            <CoffeeInfoDisplay
              roastLevel={product.roast_level}
              roastLevel_ar={product.roast_level_ar}
              process={product.processing_method}
              process_ar={product.processing_method_ar}
              variety={product.variety}
              variety_ar={product.variety_ar}
              altitude={product.altitude}
              altitude_ar={product.altitude_ar}
              notes={product.notes}
              notes_ar={product.notes_ar}
              uses={product.uses}
              uses_ar={product.uses_ar}
              farm={product.farm}
              farm_ar={product.farm_ar}
              aromatic_profile={product.aromatic_profile}
              aromatic_profile_ar={product.aromatic_profile_ar}
              intensity={product.intensity}
              intensity_ar={product.intensity_ar}
              compatibility={product.compatibility}
              compatibility_ar={product.compatibility_ar}
              className=""
            />

            {/* Price Section */}
            <Card className="py-0">
              <CardContent className="p-3">
                <h3 className="text-base font-semibold mb-2">{isArabic ? 'السعر' : 'Price'}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {priceDetails.isOnSale && priceDetails.discountAmount > 0 ? (
                      <>
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(priceDetails.finalPrice)}
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(priceDetails.originalPrice)}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          -{priceDetails.discountPercentage}%
                        </Badge>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {formatPrice(priceDetails.finalPrice)}
                      </span>
                    )}
                  </div>
                  <StockIndicator 
                    stock={product.stock_quantity || product.stock || 0} 
                    variant="compact"
                    lowStockThreshold={10}
                    className="text-green-400"
                  />
                </div>
                {priceDetails.isOnSale && priceDetails.discountAmount > 0 && (
                  <p className="text-xs text-green-400 font-medium">
                    {isArabic ? 'توفر' : 'You Save'} {formatPrice(priceDetails.discountAmount)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Dynamic Properties for Selection */}
            {product.properties && product.properties.some(p => p.options && p.options.length > 0) && (
              <Card className="py-0">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {product.properties
                      .filter(property => property.options && property.options.length > 0)
                      .map((property) => {
                        const selectedValue = selectedProperties[property.name] || ''
                        const propertyLabel = isArabic ? property.name : property.name
                        
                        return (
                          <div key={property.name} className="space-y-2">
                            <label className="text-xs font-medium">{propertyLabel}</label>
                            
                            <div className="grid grid-cols-3 gap-1.5">
                              {property.options.map((option: any) => {
                                const optionLabel = isArabic ? option.value : option.value
                                const isSelected = selectedValue === option.value
                                
                                // Get option price for display
                                const getOptionPrice = () => {
                                  let regularPrice = 0
                                  let salePrice = 0
                                  
                                  if (currency === 'OMR') {
                                    regularPrice = option.price_omr || (option.price_modifier_omr || option.price_modifier || 0)
                                    salePrice = option.sale_price_omr || option.sale_price_modifier_omr || 0
                                  } else if (currency === 'SAR') {
                                    regularPrice = option.price_sar || (option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75)
                                    salePrice = option.sale_price_sar || (option.sale_price_modifier_sar || (option.sale_price_modifier_omr || 0) * 9.75)
                                  } else {
                                    regularPrice = option.price_usd || (option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6)
                                    salePrice = option.sale_price_usd || (option.sale_price_modifier_usd || (option.sale_price_modifier_omr || 0) * 2.6)
                                  }
                                  
                                  const isOnSale = option.on_sale && salePrice > 0
                                  const finalPrice = isOnSale ? salePrice : regularPrice
                                  const hasDiscount = isOnSale && salePrice < regularPrice
                                  
                                  return { finalPrice, regularPrice, hasDiscount, isOnSale }
                                }
                                
                                const priceInfo = getOptionPrice()
                                
                                return (
                                  <Button
                                    key={option.value}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedProperties(prev => ({
                                      ...prev,
                                      [property.name]: option.value
                                    }))}
                                    className={`h-auto p-2 flex flex-col items-center text-center ${
                                      isSelected 
                                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80 border-border'
                                    }`}
                                  >
                                    <span className="text-xs font-medium">{optionLabel}</span>
                                    {property.affects_price && priceInfo.finalPrice > 0 && (
                                      <span className="text-xs mt-0.5 opacity-90">
                                        {priceInfo.hasDiscount ? (
                                          <>
                                            <span className="line-through opacity-70">
                                              ({formatPrice(priceInfo.regularPrice)})
                                            </span>
                                            <br />
                                            <span className="font-medium">
                                              {formatPrice(priceInfo.finalPrice)}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="font-medium">
                                            {formatPrice(priceInfo.finalPrice)}
                                          </span>
                                        )}
                                      </span>
                                    )}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-medium">
                  {isArabic ? 'الكمية:' : 'Quantity:'}
                </label>
                <div className="flex items-center w-fit">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-r-none"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <div className="flex h-8 w-12 items-center justify-center border-t border-b bg-muted border-border text-xs font-medium">
                    {quantity}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-l-none"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Total Price */}
            <div className="bg-muted rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {isArabic ? 'المجموع' : 'Total'}
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              {Object.keys(selectedProperties).length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {Object.entries(selectedProperties).map(([key, value]) => (
                    <div key={key}>
                      {isArabic ? 'الحجم المختار:' : 'Choose Size:'} {value}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {/* Add to Cart Button */}
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 text-sm" 
                onClick={handleAddToCart} 
                disabled={product.stock_quantity <= 0 || isLoading}
              >
                🛒 {isLoading 
                  ? (isArabic ? 'جاري الإضافة...' : 'Adding...') 
                  : (isArabic ? 'أضف إلى السلة' : 'Add to Cart')
                }
              </Button>

              {/* Wishlist Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="h-10 w-10"
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current text-red-500' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}