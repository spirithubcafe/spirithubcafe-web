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

    // Apply property-based price modifications
    if (product.properties && Object.keys(selectedProperties).length > 0) {
      for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
        const property = product.properties.find(p => p.name === propertyName)
        if (property && property.affects_price) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option?.price_modifier) {
            if (currency === 'OMR') {
              basePrice += option.price_modifier
            } else if (currency === 'SAR') {
              basePrice += option.price_modifier * 3.75
            } else {
              basePrice += option.price_modifier * 2.6
            }
          }
        }
      }
    }

    return basePrice
  }

  const getSalePrice = (): number | null => {
    if (!product) return null
    
    let baseSalePrice: number | null
    switch (currency) {
      case 'OMR':
        if (!product.sale_price_omr) return null
        baseSalePrice = product.sale_price_omr
        break
      case 'SAR':
        if (!product.sale_price_sar && !product.sale_price_omr) return null
        baseSalePrice = product.sale_price_sar || (product.sale_price_omr || 0) * 3.75
        break
      case 'USD':
      default:
        if (!product.sale_price_usd && !product.sale_price_omr) return null
        baseSalePrice = product.sale_price_usd || (product.sale_price_omr || 0) * 2.6
        break
    }

    if (!baseSalePrice) return null

    // Apply property-based price modifications to sale price too
    if (product.properties && Object.keys(selectedProperties).length > 0) {
      for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
        const property = product.properties.find(p => p.name === propertyName)
        if (property && property.affects_price) {
          const option = property.options.find(opt => opt.value === selectedValue)
          if (option?.price_modifier) {
            if (currency === 'OMR') {
              baseSalePrice += option.price_modifier
            } else if (currency === 'SAR') {
              baseSalePrice += option.price_modifier * 3.75
            } else {
              baseSalePrice += option.price_modifier * 2.6
            }
          }
        }
      }
    }

    return baseSalePrice
  }

  const getProductBadges = () => {
    if (!product) return []
    
    const badges: Array<{ text: string; color: string }> = []
    
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    if (getSalePrice()) badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })
    
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

  const productPrice = getProductPrice()
  const salePrice = getSalePrice()
  const finalPrice = salePrice || productPrice
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
              // Get all available images
              const availableImages = [
                ...(product.images || []),
                ...(product.gallery || []),
                ...(product.gallery_images || [])
              ].filter(img => img && img.trim() !== '')
              
              // Add main image if it exists and not already in the list
              if (product.image && !availableImages.includes(product.image)) {
                availableImages.unshift(product.image)
              }
              if (product.image_url && !availableImages.includes(product.image_url)) {
                availableImages.unshift(product.image_url)
              }
              
              // Remove duplicates
              const uniqueImages = [...new Set(availableImages)]
              
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

            {/* Price */}
            <div className="space-y-2">
              {salePrice && salePrice < productPrice ? (
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(salePrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(productPrice)}
                    </span>
                    {(() => {
                      const discountPercent = Math.round(((productPrice - salePrice) / productPrice) * 100)
                      return discountPercent > 0 ? (
                        <Badge variant="destructive">
                          {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                        </Badge>
                      ) : null
                    })()}
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-bold">
                  {formatPrice(productPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic ? product.description_ar : product.description}
              </p>
            </div>

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
                                    {option.price_modifier && option.price_modifier !== 0 && (
                                      <span className="ml-2 text-sm text-muted-foreground">
                                        ({option.price_modifier > 0 ? '+' : ''}{formatPrice(
                                          currency === 'OMR' ? option.price_modifier :
                                          currency === 'SAR' ? option.price_modifier * 3.75 :
                                          option.price_modifier * 2.6
                                        )})
                                      </span>
                                    )}
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
                <div className="text-lg font-semibold">
                  {isArabic ? 'المجموع:' : 'Total:'} {formatPrice(finalPrice * quantity)}
                </div>
              </div>

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
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {isArabic ? product.description_ar : product.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.properties && product.properties.length > 0 ? (
                    <div className="space-y-4">
                      {product.properties.map((property: any, index: number) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                          <span className="font-medium">
                            {isArabic ? property.name_ar : property.name}
                          </span>
                          <span className="text-muted-foreground">
                            {isArabic ? property.value_ar : property.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      {isArabic ? 'لا توجد مواصفات متاحة' : 'No specifications available'}
                    </p>
                  )}
                </CardContent>
              </Card>
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