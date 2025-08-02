import React, { useState, useEffect } from 'react'
import { Star, ShoppingCart, Plus, Minus, Heart, Share2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface ProductQuickViewProps {
  product: Product
  children: React.ReactNode
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
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
    
    // Add images from different fields
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images)
    }
    if (product.gallery && Array.isArray(product.gallery)) {
      images.push(...product.gallery)
    }
    if (product.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...product.gallery_images)
    }
    if (product.image) {
      images.push(product.image)
    }
    if (product.image_url) {
      images.push(product.image_url)
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

  // Get regular price (without sale) based on selected currency  
  const getRegularPrice = (product: Product) => {
    let basePrice: number
    
    switch (currency) {
      case 'OMR':
        basePrice = product.price_omr || 0
        break
      case 'SAR':
        basePrice = product.price_sar || (product.price_omr || 0) * 3.75
        break
      case 'USD':
      default:
        basePrice = product.price_usd || (product.price_omr || 0) * 2.6
        break
    }

    // Apply property-based price modifications (regular prices only)
    if (product.properties && Object.keys(selectedProperties).length > 0) {
      for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
        const property = product.properties.find(p => p.name === propertyName)
        if (property && property.affects_price) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option) {
            let regularModifier = 0
            
            if (currency === 'OMR') {
              regularModifier = option.price_modifier_omr || option.price_modifier || 0
            } else if (currency === 'SAR') {
              regularModifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 3.75
            } else {
              regularModifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
            }
            
            basePrice += regularModifier
          }
        }
      }
    }

    return basePrice
  }

  // Get product price based on selected currency - returns sale price if available and lower, otherwise regular
  const getProductPrice = (product: Product): number => {
    // Get regular price first
    const regularPrice = getRegularPrice(product)
    
    // Calculate sale price
    let currentPrice = regularPrice
    
    // Check base product sale price
    let baseSalePrice: number | null = null
    switch (currency) {
      case 'OMR':
        baseSalePrice = product.sale_price_omr || null
        break
      case 'SAR':
        baseSalePrice = product.sale_price_sar || (product.sale_price_omr ? product.sale_price_omr * 3.75 : null)
        break
      case 'USD':
      default:
        baseSalePrice = product.sale_price_usd || (product.sale_price_omr ? product.sale_price_omr * 2.6 : null)
        break
    }

    // If we have a base sale price, start with that
    if (baseSalePrice !== null) {
      currentPrice = baseSalePrice
    }

    // Apply property-based price modifications
    if (product.properties && Object.keys(selectedProperties).length > 0) {
      for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
        const property = product.properties.find(p => p.name === propertyName)
        if (property && property.affects_price) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option) {
            let priceModifier = 0
            
            // Check if option has sale price and we have a sale context
            if (option.on_sale && option.sale_price_modifier_omr !== undefined) {
              // Use sale price modifier
              if (currency === 'OMR') {
                priceModifier = option.sale_price_modifier_omr
              } else if (currency === 'SAR') {
                priceModifier = option.sale_price_modifier_sar || option.sale_price_modifier_omr * 3.75
              } else {
                priceModifier = option.sale_price_modifier_usd || option.sale_price_modifier_omr * 2.6
              }
            } else {
              // Use regular price modifier
              if (currency === 'OMR') {
                priceModifier = option.price_modifier_omr || option.price_modifier || 0
              } else if (currency === 'SAR') {
                priceModifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 3.75
              } else {
                priceModifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
              }
            }
            
            currentPrice += priceModifier
          }
        }
      }
    }
    
    // Return sale price only if it's lower than regular price
    return currentPrice < regularPrice ? currentPrice : regularPrice
  }

  const productImages = getProductImages(product)
  const productName = isArabic ? (product.name_ar || product.name) : product.name
  const productDescription = isArabic ? (product.description_ar || product.description) : product.description

  // Calculate prices
  const regularPrice = getRegularPrice(product)
  const productPrice = getProductPrice(product)
  const hasDiscount = productPrice < regularPrice

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
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full">
                  <Heart className="h-4 w-4" />
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
              <DialogDescription className="text-base text-left">
                {productDescription}
              </DialogDescription>
            </DialogHeader>

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
                                    (option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 3.75) :
                                    (option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6)
                                  
                                  const saleModifier = option.on_sale && option.sale_price_modifier_omr !== undefined ?
                                    (currency === 'OMR' ? 
                                      option.sale_price_modifier_omr :
                                      currency === 'SAR' ? 
                                      (option.sale_price_modifier_sar || option.sale_price_modifier_omr * 3.75) :
                                      (option.sale_price_modifier_usd || option.sale_price_modifier_omr * 2.6)) :
                                    null
                                  
                                  const displayModifier = saleModifier !== null ? saleModifier : regularModifier
                                  
                                  if (displayModifier !== 0) {
                                    return (
                                      <span className="ml-2 text-sm">
                                        {saleModifier !== null && saleModifier < regularModifier ? (
                                          <>
                                            <span className="line-through text-muted-foreground">
                                              ({regularModifier > 0 ? '+' : ''}{formatPrice(regularModifier)})
                                            </span>
                                            <span className="text-red-600 ml-1">
                                              ({displayModifier > 0 ? '+' : ''}{formatPrice(displayModifier)})
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-muted-foreground">
                                            ({displayModifier > 0 ? '+' : ''}{formatPrice(displayModifier)})
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

            {/* Static Properties */}
            {product.properties && product.properties.some(p => !p.options || p.options.length === 0) && (
              <div className="space-y-3">
                <h4 className="font-medium">{isArabic ? 'المواصفات' : 'Specifications'}</h4>
                <div className="space-y-2">
                  {product.properties
                    .filter(property => !property.options || property.options.length === 0)
                    .map((property: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {isArabic ? property.name_ar : property.name}:
                        </span>
                        <span>{isArabic ? property.value_ar : property.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(productPrice)}
                  </span>
                  <span className="text-lg line-through text-muted-foreground">
                    {formatPrice(regularPrice)}
                  </span>
                  {(() => {
                    const discountPercent = Math.round(((regularPrice - productPrice) / regularPrice) * 100)
                    return discountPercent > 0 ? (
                      <Badge variant="destructive">
                        {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                      </Badge>
                    ) : null
                  })()}
                </>
              ) : (
                <span className="text-3xl font-bold text-amber-600">
                  {formatPrice(productPrice)}
                </span>
              )}
            </div>

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
