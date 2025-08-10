import React, { useState, useEffect } from 'react'
import { Star, ShoppingCart, Plus, Minus, Heart, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
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
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({})

  const isArabic = i18n.language === 'ar'

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

  // Get all product images from different fields
  const getProductImages = (product: Product): string[] => {
    const images: string[] = []
    
    // Add main image first (highest priority)
    if (product.image_url) {
      images.push(product.image_url)
    }
    if (product.image) {
      images.push(product.image)
    }
    
    // Then add gallery images
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images)
    }
    if (product.gallery && Array.isArray(product.gallery)) {
      images.push(...product.gallery)
    }
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...product.gallery_images)
    }
    
    // Remove duplicates and empty strings
    return [...new Set(images.filter(img => img && img.trim() !== ''))]
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return isArabic ? 'عام' : 'General'
    return isArabic ? (category.name_ar || category.name) : category.name
  }

  // Get product price based on selected currency - returns sale price if available and lower, otherwise regular
  const getProductPrice = (product: Product): number => {
    let finalPrice = 0
    
    // Check if product has advanced properties that affect price
    const hasAdvancedProperties = product.properties && 
      product.properties.some(p => p.affects_price)
    
    if (hasAdvancedProperties && product.properties) {
      // Use property-based pricing if properties are selected
      if (Object.keys(selectedProperties).length > 0) {
        // Find the first property that affects price and use its absolute price
        for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
          const property = product.properties.find(p => p.name === propertyName)
          if (property && property.affects_price) {
            const option = property.options.find(opt => opt.value === selectedValue)
            if (option) {
              // Check if option has absolute prices (new system) or modifiers (old system)
              switch (currency) {
                case 'OMR':
                  if (option.price_omr) {
                    // New system: absolute price only
                    finalPrice = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
                  } else if (option.price_modifier_omr || option.price_modifier) {
                    // Legacy: modifier is treated as standalone price
                    const modifier = option.price_modifier_omr || option.price_modifier || 0
                    finalPrice = modifier
                  }
                  break
                case 'SAR':
                  if (option.price_sar) {
                    // New system: absolute price only
                    finalPrice = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
                  } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                    // Legacy: modifier is treated as standalone price
                    const modifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                    finalPrice = modifier
                  }
                  break
                case 'USD':
                default:
                  if (option.price_usd) {
                    // New system: absolute price only
                    finalPrice = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
                  } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                    // Legacy: modifier is treated as standalone price
                    const modifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                    finalPrice = modifier
                  }
                  break
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
          switch (currency) {
            case 'OMR':
              if (firstOption.price_omr) {
                // New system: absolute price only
                finalPrice = firstOption.on_sale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
              } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
                // Legacy: modifier is treated as standalone price
                const modifier = firstOption.price_modifier_omr || firstOption.price_modifier || 0
                finalPrice = modifier
              }
              break
            case 'SAR':
              if (firstOption.price_sar) {
                // New system: absolute price only
                finalPrice = firstOption.on_sale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
              } else if (firstOption.price_modifier_sar || firstOption.price_modifier_omr || firstOption.price_modifier) {
                // Legacy: modifier is treated as standalone price
                const modifier = firstOption.price_modifier_sar || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 9.75
                finalPrice = modifier
              }
              break
            case 'USD':
            default:
              if (firstOption.price_usd) {
                // New system: absolute price only
                finalPrice = firstOption.on_sale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
              } else if (firstOption.price_modifier_usd || firstOption.price_modifier_omr || firstOption.price_modifier) {
                // Legacy: modifier is treated as standalone price
                const modifier = firstOption.price_modifier_usd || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 2.6
                finalPrice = modifier
              }
              break
          }
        }
      }
    } else {
      // Use product base price if no advanced properties
      switch (currency) {
        case 'OMR':
          finalPrice = product.sale_price_omr && product.sale_price_omr < (product.price_omr || 0) 
            ? product.sale_price_omr 
            : (product.price_omr || 0)
          break
        case 'SAR':
          finalPrice = product.sale_price_sar && product.sale_price_sar < (product.price_sar || (product.price_omr || 0) * 9.75) 
            ? product.sale_price_sar 
            : (product.price_sar || (product.price_omr || 0) * 9.75)
          break
        case 'USD':
        default:
          finalPrice = product.sale_price_usd && product.sale_price_usd < (product.price_usd || (product.price_omr || 0) * 2.6) 
            ? product.sale_price_usd 
            : (product.price_usd || (product.price_omr || 0) * 2.6)
          break
      }
    }

    return finalPrice
  }

  const productImages = getProductImages(product)
  const productName = isArabic ? (product.name_ar || product.name) : product.name

  // Calculate prices
  const productPrice = getProductPrice(product)

  // Recalculate prices when selectedProperties change

  const handleAddToCart = async () => {
    setIsLoading(true)
    try {
      await addToCart(product, quantity, Object.keys(selectedProperties).length > 0 ? selectedProperties : undefined)
      setIsOpen(false)
      setQuantity(1)
      setSelectedProperties({})
      toast.success(isArabic ? `تمت إضافة ${productName} إلى السلة` : `${productName} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء الإضافة إلى السلة' : 'Error adding to cart')
    } finally {
      setIsLoading(false)
    }
  }

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1)
    }
  }
  
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  const getProductBadges = (product: Product) => {
    const badges = []
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    if (product.is_on_sale) badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })
    return badges
  }

  const badges = getProductBadges(product)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 overflow-hidden">
              {productImages.length > 0 ? (
                <img
                  src={productImages[selectedImage] || productImages[0]}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-24 w-24 object-contain opacity-50"
                  />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {badges.map((badge, index) => (
                  <Badge key={index} className={`text-xs text-white ${badge.color}`}>
                    {badge.text}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className={`h-8 w-8 p-0 rounded-full ${isInWishlist(product.id) ? 'text-red-500 bg-red-50 hover:bg-red-100' : ''}`}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    await toggleWishlist(product.id)
                  }}
                  disabled={wishlistLoading}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-amber-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {getCategoryName(product.category_id)}
                </Badge>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    ({product.average_rating?.toFixed(1) || '0.0'})
                  </span>
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-left">
                {productName}
              </DialogTitle>
            </DialogHeader>

            {/* Coffee Information */}
            <CoffeeInfoDisplay
              roastLevel={product.roast_level}
              process={product.processing_method}
              variety={product.variety}
              altitude={product.altitude}
              notes={product.notes}
              farm={product.farm}
              className="mb-4 py-0"
            />

            {/* Dynamic Properties */}
            {product.properties && product.properties.some(p => p.options && p.options.length > 0) && (
              <div className="space-y-3">
                <h4 className="font-medium">{isArabic ? 'الخيارات' : 'Options'}</h4>
                {product.properties
                  .filter(property => property.options && property.options.length > 0)
                  .map((property) => (
                    <div key={property.name} className="space-y-2">
                      <label className="text-sm font-medium">
                        {isArabic ? (property.name_ar || property.name) : property.name}
                        {property.affects_price && (
                          <span className="text-muted-foreground text-xs ml-1">
                            ({isArabic ? 'يؤثر على السعر' : 'affects price'})
                          </span>
                        )}
                      </label>
                      <Select
                        value={selectedProperties[property.name] || ''}
                        onValueChange={(value) => setSelectedProperties(prev => ({ ...prev, [property.name]: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={isArabic ? 'اختر...' : 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {property.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <span>
                                {isArabic ? (option.label_ar || option.label) : option.label}
                                {(() => {
                                  const regularModifier = currency === 'OMR' ? 
                                    (option.price_modifier_omr || option.price_modifier || 0) :
                                    currency === 'SAR' ? 
                                    (option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75) :
                                    (option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6)
                                  
                                  const saleModifier = option.on_sale && option.sale_price_modifier_omr !== undefined ?
                                    (currency === 'OMR' ? 
                                      option.sale_price_modifier_omr :
                                      currency === 'SAR' ? 
                                      (option.sale_price_modifier_sar || option.sale_price_modifier_omr * 9.75) :
                                      (option.sale_price_modifier_usd || option.sale_price_modifier_omr * 2.6)) :
                                    null
                                  
                                  const displayModifier = saleModifier !== null ? saleModifier : regularModifier
                                  
                                  if (displayModifier !== 0) {
                                    return (
                                      <span className="ml-2 text-sm">
                                        {saleModifier !== null && saleModifier < regularModifier ? (
                                          <>
                                            <span className="line-through text-muted-foreground">
                                              ({formatPrice(regularModifier)})
                                            </span>
                                            <span className="text-red-600 ml-1">
                                              ({formatPrice(displayModifier)})
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            ({formatPrice(displayModifier)})
                                          </span>
                                        )}
                                      </span>
                                    )
                                  }
                                  return null
                                })()}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
              </div>
            )}

 

            {/* Stock Info */}
            <div className="space-y-2">
              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {isArabic ? 'متوفر' : 'In Stock'}
                  </Badge>
                  {product.stock_quantity <= 10 && (
                    <span className="text-sm text-orange-600 font-medium">
                      {isArabic ? `متبقي ${product.stock_quantity} قطع فقط` : `Only ${product.stock_quantity} left!`}
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="destructive">
                  {isArabic ? 'نفذت الكمية' : 'Out of Stock'}
                </Badge>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock_quantity > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  {isArabic ? 'الكمية' : 'Quantity'}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Total Price */}
            {product.stock_quantity > 0 && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-medium text-lg">{isArabic ? 'المجموع' : 'Total'}</span>
                <span className="text-2xl font-bold text-amber-600">
                  {formatPrice(productPrice * quantity)}
                </span>
              </div>
            )}

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart} 
              className="w-full h-12 text-lg"
              disabled={product.stock_quantity <= 0 || isLoading}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {isLoading 
                ? (isArabic ? 'جارٍ الإضافة...' : 'Adding...')
                : (isArabic ? 'أضف إلى السلة' : 'Add to Cart')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

