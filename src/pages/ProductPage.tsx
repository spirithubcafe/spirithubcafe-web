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
  const { t, i18n } = useTranslation()
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
        toast.error(t('product.notFound'))
        return
      }
      
      setProduct(foundProduct)
      await loadReviews(foundProduct.id)
    } catch (error) {
      console.error('Error loading product:', error)
      toast.error(t('product.errorLoading'))
    } finally {
      setLoading(false)
    }
  }, [slug, t, loadReviews])

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
      toast.success(t('product.addedToCart'))
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(t('product.errorAddingToCart'))
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
            // Check for absolute prices first (new system)
            let price = 0
            if (currency === 'OMR') {
              if (option.price_omr) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_omr ? option.sale_price_omr : option.price_omr
              } else if (option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_omr || option.price_modifier || 0
                price = modifier
              }
            } else if (currency === 'SAR') {
              if (option.price_sar) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_sar ? option.sale_price_sar : option.price_sar
              } else if (option.price_modifier_sar || option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75
                price = modifier
              }
            } else {
              if (option.price_usd) {
                // New system: absolute price
                price = option.on_sale && option.sale_price_usd ? option.sale_price_usd : option.price_usd
              } else if (option.price_modifier_usd || option.price_modifier_omr || option.price_modifier) {
                // Legacy: modifier as absolute price
                const modifier = option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6
                price = modifier
              }
            }
            
            // If property option has valid price, return it
            if (price > 0) {
              return price
            }
          }
        }
      }
    }

    // If no properties selected or no valid price found, use first option of first property
    const firstProperty = pricingProperties[0]
    if (firstProperty && firstProperty.options.length > 0) {
      const firstOption = firstProperty.options[0]
      // Check for absolute prices first (new system)
      let price = 0
      if (currency === 'OMR') {
        if (firstOption.price_omr) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_omr ? firstOption.sale_price_omr : firstOption.price_omr
        } else if (firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_omr || firstOption.price_modifier || 0
          price = modifier
        }
      } else if (currency === 'SAR') {
        if (firstOption.price_sar) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_sar ? firstOption.sale_price_sar : firstOption.price_sar
        } else if (firstOption.price_modifier_sar || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_sar || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 9.75
          price = modifier
        }
      } else {
        if (firstOption.price_usd) {
          // New system: absolute price
          price = firstOption.on_sale && firstOption.sale_price_usd ? firstOption.sale_price_usd : firstOption.price_usd
        } else if (firstOption.price_modifier_usd || firstOption.price_modifier_omr || firstOption.price_modifier) {
          // Legacy: modifier as absolute price
          const modifier = firstOption.price_modifier_usd || (firstOption.price_modifier_omr || firstOption.price_modifier || 0) * 2.6
          price = modifier
        }
      }
      
      // Return the price if valid
      return price > 0 ? price : 0
    }

    return 0
  }

  const getProductBadges = () => {
    if (!product) return []
    
    const badges: Array<{ text: string; color: string }> = []
    
    if (product.is_featured) badges.push({ text: t('product.featured'), color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: t('product.bestseller'), color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: t('product.newArrival'), color: 'bg-purple-500' })
    
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
            {t('product.productNotFound')}
          </h1>
          <Link to="/shop">
            <Button>
              {t('product.backToShop')}
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
          {t('product.backToShop')}
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
                    ({averageRating.toFixed(1)}) • {totalReviews} {t('shop.reviews')}
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
              className="py-0"
            />

            {/* Dynamic Properties for Selection */}
            {product.properties && product.properties.some(p => p.options && p.options.length > 0) && (
              <Card className="py-0">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {product.properties
                      .filter(property => property.options && property.options.length > 0)
                      .map((property) => {
                        const renderPropertyInput = () => {
                          const propertyType = property.type || 'select'
                          const displayType = property.display_type || 'dropdown'
                          
                          // Get property price for option
                          const getOptionPrice = (option: any) => {
                            let regularPrice = 0
                            let salePrice = 0
                            
                            if (currency === 'OMR') {
                              regularPrice = option.price_omr || (option.price_modifier_omr || option.price_modifier || 0)
                              salePrice = option.sale_price_omr || 0
                            } else if (currency === 'SAR') {
                              regularPrice = option.price_sar || (option.price_modifier_sar || (option.price_modifier_omr || option.price_modifier || 0) * 9.75)
                              salePrice = option.sale_price_sar || 0
                            } else {
                              regularPrice = option.price_usd || (option.price_modifier_usd || (option.price_modifier_omr || option.price_modifier || 0) * 2.6)
                              salePrice = option.sale_price_usd || 0
                            }
                            
                            const displayPrice = (option.on_sale && salePrice > 0) ? salePrice : regularPrice
                            const hasDiscount = option.on_sale && salePrice > 0 && salePrice < regularPrice
                            
                            if (regularPrice > 0) {
                              return (
                                <span className="ml-2 text-sm">
                                  {hasDiscount ? (
                                    <>
                                      <span className="line-through text-muted-foreground">
                                        ({formatPrice(regularPrice)})
                                      </span>
                                      <span className="text-red-600 ml-1">
                                        ({formatPrice(displayPrice)})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">
                                      ({formatPrice(displayPrice)})
                                    </span>
                                  )}
                                </span>
                              )
                            }
                            return null
                          }

                          // Render based on type and display_type
                          if (propertyType === 'radio' || displayType === 'buttons') {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {property.options?.map((option) => {
                                  const isSelected = selectedProperties[property.name] === option.value
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => setSelectedProperties(prev => ({ ...prev, [property.name]: option.value }))}
                                      className={`px-4 py-2 rounded-md border text-sm font-medium transition-all ${
                                        isSelected 
                                          ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
                                          : 'bg-background border-border hover:bg-muted hover:border-muted-foreground/20'
                                      }`}
                                    >
                                      <div className="text-center">
                                        <div>{isArabic ? (option.label_ar || option.label) : option.label}</div>
                                        {getOptionPrice(option) && (
                                          <div className="text-xs mt-1 font-medium text-foreground/90">
                                            {getOptionPrice(option)}
                                          </div>
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            )
                          }

                          // Color swatches
                          if (propertyType === 'color' || displayType === 'color_swatches') {
                            return (
                              <div className="flex flex-wrap gap-2">
                                {property.options?.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedProperties(prev => ({ ...prev, [property.name]: option.value }))}
                                    className={`
                                      w-8 h-8 rounded-full border-2 relative
                                      ${selectedProperties[property.name] === option.value 
                                        ? 'border-primary scale-110' 
                                        : 'border-gray-300 hover:border-gray-400'
                                      }
                                      transition-all duration-200
                                    `}
                                    style={{ backgroundColor: option.value }}
                                    data-color={option.value}
                                    title={`${isArabic ? (option.label_ar || option.label) : option.label}${(() => {
                                      const priceEl = getOptionPrice(option)
                                      return priceEl ? ` ${priceEl.props.children}` : ''
                                    })()}`}
                                  >
                                    {selectedProperties[property.name] === option.value && (
                                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full shadow"></div>
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )
                          }

                          // Size grid
                          if (propertyType === 'size' || displayType === 'size_grid') {
                            return (
                              <div className="grid grid-cols-3 gap-2">
                                {property.options?.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedProperties(prev => ({ ...prev, [property.name]: option.value }))}
                                    className={`
                                      px-3 py-2 text-sm font-medium rounded-md border transition-colors
                                      ${selectedProperties[property.name] === option.value
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background hover:bg-muted border-input'
                                      }
                                    `}
                                  >
                                    <div className="text-center">
                                      <div>{isArabic ? (option.label_ar || option.label) : option.label}</div>
                                      {getOptionPrice(option) && (
                                        <div className="text-xs mt-1">
                                          {getOptionPrice(option)}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )
                          }

                          // Default to Select (dropdown)
                          return (
                            <Select
                              value={selectedProperties[property.name] || ''}
                              onValueChange={(value) => setSelectedProperties(prev => ({ ...prev, [property.name]: value }))}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={t('product.selectOption')} />
                              </SelectTrigger>
                              <SelectContent>
                                {property.options?.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <span>
                                      {isArabic ? (option.label_ar || option.label) : option.label}
                                      {getOptionPrice(option)}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )
                        }

                        return (
                          <div key={property.name} className="space-y-1.5">
                            <label className="text-sm font-medium block mb-1">
                              {property.name.toLowerCase().includes('size') ? 
                                t('product.chooseSize') : 
                                (isArabic ? (property.name_ar || property.name) : property.name)
                              }
                            </label>
                            {renderPropertyInput()}
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Static Properties */}
            {product.properties && product.properties.some(p => !p.options || p.options.length === 0) && (
              <Card>
                <CardContent className="p-3">
                  <h3 className="font-semibold mb-2 text-sm">
                    {t('product.specifications')}
                  </h3>
                  <div className="space-y-1.5">
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
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">
                  {t('shop.quantity')}:
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
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg w-full">
                  <span className="font-medium text-lg">{t('shop.total')}</span>
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
                {t('shop.addToCart')}
              </Button>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">
                {t('product.description')}
              </TabsTrigger>
              <TabsTrigger value="specifications">
                {t('product.specifications')}
              </TabsTrigger>
              <TabsTrigger value="reviews">
                {t('product.reviews')} ({reviews.length})
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
                  className="py-0"
                />

                {/* Product Properties */}
                <Card>
                  <CardContent className="p-6">
                    {product.properties && product.properties.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-medium text-sm text-muted-foreground mb-3">
                          {t('product.additionalSpecifications')}
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
                          {t('product.noSpecifications')}
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
