import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, ShoppingCart, ArrowLeft, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { firestoreService, type Product, type ProductReview } from '@/lib/firebase'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { ProductReviews } from '@/components/product-reviews'
import CoffeeInfoDisplay from '@/components/product/CoffeeInfoDisplay'
import { HTMLContent } from '@/components/ui/html-content'
import toast from 'react-hot-toast'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const { i18n } = useTranslation()
  const { currency, formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [selectedProperties, setSelectedProperties] = useState<Record<string, string>>({})

  useScrollToTopOnRouteChange()

  const isArabic = i18n.language === 'ar'

  const loadReviews = useCallback(async (productId: string) => {
    try {
      // Load approved reviews for this product
      const approvedReviews = await firestoreService.reviews.getApprovedByProduct(productId)
      setReviews(approvedReviews)
      
      // Update product rating
      if (approvedReviews.length > 0) {
        const { average, count } = await firestoreService.reviews.getAverageRating(productId)
        // Update the product in Firebase with new rating
        await firestoreService.products.update(productId, {
          average_rating: average,
          total_reviews: count
        })
        
        // Update local product state
        setProduct(prev => prev ? {
          ...prev,
          average_rating: average,
          total_reviews: count
        } : null)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
      // Fallback to empty array
      setReviews([])
    }
  }, [])

  const loadProduct = useCallback(async () => {
    if (!slug) return
    
    setLoading(true)
    try {
      const result = await firestoreService.products.list()
      // First try to find by slug, then by id
      const foundProduct = result.items.find((p: Product) => p.slug === slug || p.id === slug)
      
      if (!foundProduct) {
        toast.error(isArabic ? 'المنتج غير موجود' : 'Product not found')
        return
      }
      
      setProduct(foundProduct)
      await loadReviews(foundProduct.id)
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error(isArabic ? 'حدث خطأ في تحميل المنتج' : 'Error loading product')
    } finally {
      setLoading(false)
    }
  }, [slug, isArabic, loadReviews])

  const handleReviewAdded = (productId: string) => {
    loadReviews(productId)
  }

  useEffect(() => {
    loadProduct()
  }, [loadProduct])

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
    
    try {
      await addToCart(product, quantity, Object.keys(selectedProperties).length > 0 ? selectedProperties : undefined)
      toast.success(isArabic ? 'تم إضافة المنتج إلى السلة' : 'Product added to cart')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(isArabic ? 'حدث خطأ أثناء إضافة المنتج' : 'Error adding product to cart')
    }
  }

  const getProductPrice = (): number => {
    if (!product) return 0
    
    // If product has properties with pricing, try property-based pricing first
    if (product.properties && product.properties.some(p => p.affects_price && p.options && p.options.length > 0)) {
      const price = getPropertyBasedPrice()
      
      // If property-based pricing returned a valid price, use it
      if (price > 0) {
        return price
      }
    }
    
    // Fallback to base pricing for products without property-based pricing or when property pricing fails
    let baseSalePrice: number
    
    switch (currency) {
      case 'OMR':
        baseSalePrice = product.sale_price_omr || product.price_omr || 0
        break
      case 'SAR':
        baseSalePrice = product.sale_price_sar || (product.sale_price_omr ? product.sale_price_omr * 9.75 : (product.price_omr || 0) * 9.75)
        break
      case 'USD':
      default:
        baseSalePrice = product.sale_price_usd || (product.sale_price_omr ? product.sale_price_omr * 2.6 : (product.price_omr || 0) * 2.6)
        break
    }

    return baseSalePrice
  }

  const getPropertyBasedPrice = (): number => {
    if (!product || !product.properties) return 0

    // Find properties that affect price
    const pricingProperties = product.properties.filter(p => p.affects_price && p.options && p.options.length > 0)
    
    if (pricingProperties.length === 0) return 0

    // If user has selected properties, use the first property that affects price
    if (Object.keys(selectedProperties).length > 0) {
      for (const property of pricingProperties) {
        const selectedValue = selectedProperties[property.name]
        
        if (selectedValue) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option) {
            // Check if option has absolute prices (new system) or modifiers (old system)
            let price = 0
            if (currency === 'OMR') {
              if (option.price_omr) {
                // New system: absolute price only
                price = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
              } else if (option.price_modifier_omr || option.price_modifier) {
                // Legacy: treat modifier as standalone price (do not add base)
                const modifier = option.price_modifier_omr || option.price_modifier || 0
                price = modifier
              }
            } else if (currency === 'SAR') {
              if (option.price_sar) {
                // New system: absolute price only
                price = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
              } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                // Legacy: treat modifier as standalone price (do not add base)
                const modifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                price = modifier
              }
            } else {
              if (option.price_usd) {
                // New system: absolute price only
                price = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
              } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                const modifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                price =  modifier
              }
            }
            
            // If property option has no price, fallback to base price
            if (price > 0) {
              return price
            } else {
              break
            }
          }
        }
      }
    }

    // If no properties selected or no valid price found, use first option of first property
    const firstProperty = pricingProperties[0]
    if (firstProperty && firstProperty.options.length > 0) {
      const firstOption = firstProperty.options[0]
      // Check if first option has absolute prices (new system) or modifiers (old system)
      let price = 0
      if (currency === 'OMR') {
        if (firstOption.price_omr) {
          // New system: absolute price only
          price = firstOption.on_sale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
        } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: treat modifier as standalone price (do not add base)
          const modifier = firstOption.price_modifier_omr || firstOption.price_modifier || 0
          price = modifier
        }
      } else if (currency === 'SAR') {
        if (firstOption.price_sar) {
          // New system: absolute price only
          price = firstOption.on_sale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
        } else if (firstOption.price_modifier_sar || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: treat modifier as standalone price (do not add base)
          const modifier = firstOption.price_modifier_sar || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 9.75
          price = modifier
        }
      } else {
        if (firstOption.price_usd) {
          // New system: absolute price only
          price = firstOption.on_sale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
        } else if (firstOption.price_modifier_usd || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: treat modifier as standalone price (do not add base)
          const modifier = firstOption.price_modifier_usd || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 2.6
          price = modifier
        }
      }
      
      // If first option has no price, return 0 (will fallback to base price in main function)
      return price
    }

    return 0
  }

  const getProductBadges = () => {
    if (!product) return []
    
    const badges: Array<{ text: string; color: string }> = []
    
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    
    return badges
  }

  // Calculate average rating from product or reviews
  const averageRating = product?.average_rating 
    ? product.average_rating 
    : reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0
  
  const totalReviews = product?.total_reviews || reviews.length

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-6 w-32"></div>
            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {isArabic ? 'المنتج غير موجود' : 'Product Not Found'}
          </h1>
          <Link to="/shop">
            <Button>
              {isArabic ? 'العودة إلى المتجر' : 'Back to Shop'}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const finalPrice = getProductPrice()
  const badges = getProductBadges()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          to="/shop" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isArabic ? 'العودة إلى المتجر' : 'Back to Shop'}
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Product Images */}
          <div className="space-y-4">
            {(() => {
              // Get all available images, starting with main image
              const availableImages = []
              
              // Add main image first (highest priority)
              if (product.image_url) availableImages.push(product.image_url)
              if (product.image) availableImages.push(product.image)
              
              // Then add gallery images
              if (product.images) availableImages.push(...product.images)
              if (product.gallery) availableImages.push(...product.gallery)
              if (product.gallery_images) availableImages.push(...product.gallery_images)
              
              // Remove duplicates and empty strings
              const uniqueImages = [...new Set(availableImages.filter(img => img && img.trim() !== ''))]
              
              return (
                <>
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={uniqueImages[selectedImageIndex] || '/images/placeholder-product.png'}
                      alt={isArabic ? product.name_ar : product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {uniqueImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {uniqueImages.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded border-2 overflow-hidden transition-all ${
                            selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${isArabic ? product.name_ar : product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )
            })()}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-3xl font-bold mb-4">
                {isArabic ? product.name_ar : product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({averageRating.toFixed(1)}) • {totalReviews} {isArabic ? 'تقييم' : 'reviews'}
                  </span>
                </div>
              </div>

              {/* Badges */}
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
              process={product.processing_method}
              variety={product.variety}
              altitude={product.altitude}
              notes={product.notes}
              farm={product.farm}
            />

            {/* Dynamic Properties for Selection */}
            {product.properties && product.properties.some(p => p.options && p.options.length > 0) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">
                    {isArabic ? 'الخيارات' : 'Options'}
                  </h3>
                  <div className="space-y-4">
                    {product.properties
                      .filter(property => property.options && property.options.length > 0)
                      .map((property) => (
                        <div key={property.name} className="space-y-2">
                          <label className="text-sm font-medium block mb-2">
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
                </CardContent>
              </Card>
            )}

            {/* Static Properties */}
            {product.properties && product.properties.some(p => !p.options || p.options.length === 0) && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">
                    {isArabic ? 'المواصفات' : 'Specifications'}
                  </h3>
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
                </CardContent>
              </Card>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  {isArabic ? 'الكمية:' : 'Quantity:'}
                </label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg w-full">
                  <span className="font-medium text-lg">{isArabic ? 'المجموع' : 'Total'}</span>
                  <span className="text-2xl font-bold text-amber-600">
                    {formatPrice(finalPrice * quantity)}
                  </span>
                </div>
              </div>
              {product.properties && Object.keys(selectedProperties).length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {Object.entries(selectedProperties).map(([propName, val]) => {
                    const prop = product.properties!.find(p => p.name === propName)
                    const opt = prop?.options?.find(o => o.value === val)
                    if (!prop || !opt) return null
                    const propLabel = isArabic ? (prop.name_ar || prop.name) : prop.name
                    const optLabel = isArabic ? (opt.label_ar || opt.label) : opt.label
                    return (
                      <div key={propName}>{propLabel}: {optLabel}</div>
                    )
                  })}
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                size="lg"
                className="w-full"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isArabic ? 'أضف إلى السلة' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">
                {isArabic ? 'الوصف' : 'Description'}
              </TabsTrigger>
              <TabsTrigger value="specifications">
                {isArabic ? 'المواصفات' : 'Specifications'}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {isArabic ? 'التقييمات' : 'Reviews'} ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <HTMLContent 
                    content={isArabic ? (product.description_ar || product.description || '') : (product.description || '')}
                    className={isArabic ? "text-right" : "text-left"}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div className="space-y-6">
                {/* Coffee Information */}
                <CoffeeInfoDisplay
                  roastLevel={product.roast_level}
                  process={product.processing_method}
                  variety={product.variety}
                  altitude={product.altitude}
                  notes={product.notes}
                  farm={product.farm}
                />

                {/* Product Properties */}
                <Card>
                  <CardContent className="p-6">
                    {product.properties && product.properties.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-3">
                          {isArabic ? 'المواصفات الإضافية' : 'Additional Specifications'}
                        </h3>
                        {product.properties.map((property: any, index: number) => (
                          <div key={index} className="py-2 border-b last:border-b-0">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">
                                {isArabic ? property.name_ar : property.name}
                              </span>
                              <div className="text-muted-foreground text-right max-w-[60%]">
                                {property.options && property.options.length > 0 ? (
                                  <div className="space-y-1">
                                    {property.options.map((option: any, optIndex: number) => (
                                      <div key={optIndex} className="text-sm">
                                        {isArabic ? (option.label_ar || option.label) : option.label}
                                        {option.price_omr && (
                                          <span className="text-amber-600 ml-2">
                                            ({option.price_omr} {isArabic ? 'ريال عماني' : 'OMR'})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Only show "no specifications" if there's also no coffee info */
                      !product.roast_level && !product.processing_method && !product.variety && 
                      !product.altitude && !product.notes && !product.farm && (
                        <p className="text-muted-foreground text-center py-8">
                          {isArabic ? 'لا توجد مواصفات متاحة' : 'No specifications available'}
                        </p>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <ProductReviews
                productId={product.id}
                reviews={reviews}
                averageRating={averageRating}
                onReviewAdded={handleReviewAdded}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
