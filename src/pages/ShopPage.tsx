import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Heart, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StockIndicator } from '@/components/ui/stock-indicator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { HTMLContent } from '@/components/ui/html-content'

export function ShopPage() {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [products, setProducts] = useState<Product[]>([])

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = i18n.language === 'ar'

  // Load products and categories
  useEffect(() => {
    loadData()
  }, [])

  // Check for category parameter in URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsResult, categoriesResult] = await Promise.all([
        firestoreService.products.list(),
        firestoreService.categories.list()
      ])
      
      setProducts(productsResult.items)
      setCategories(categoriesResult.items)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return isArabic ? 'عام' : 'General'
    return isArabic ? (category.name_ar || category.name) : category.name
  }

  // Get product price based on selected currency
  const getProductPrice = (product: Product) => {
    switch (currency) {
      case 'OMR':
        return product.price_omr || 0
      case 'SAR':
        return product.price_sar || (product.price_omr || 0) * 3.75 // OMR to SAR conversion
      case 'USD':
      default:
        return product.price_usd || (product.price_omr || 0) * 2.6 // OMR to USD conversion
    }
  }

  // Get sale price if on sale
  const getSalePrice = (product: Product) => {
    if (!product.is_on_sale) return null
    
    switch (currency) {
      case 'OMR':
        return product.sale_price_omr || null
      case 'SAR':
        return product.sale_price_sar || (product.sale_price_omr ? product.sale_price_omr * 3.75 : null)
      case 'USD':
      default:
        return product.sale_price_usd || (product.sale_price_omr ? product.sale_price_omr * 2.6 : null)
    }
  }

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    if (!product.is_active) return false
    
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.name_ar && product.name_ar.includes(searchQuery))
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === selectedCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (getProductPrice(a) ?? 0) - (getProductPrice(b) ?? 0)
      case 'price-high':
        return (getProductPrice(b) ?? 0) - (getProductPrice(a) ?? 0)
      case 'featured':
        return Number(b.is_featured) - Number(a.is_featured)
      case 'bestseller':
        return Number(b.is_bestseller) - Number(a.is_bestseller)
      case 'new':
        return Number(b.is_new_arrival) - Number(a.is_new_arrival)
      case 'name':
      default: {
        const nameA = isArabic ? (a.name_ar || a.name) : a.name
        const nameB = isArabic ? (b.name_ar || b.name) : b.name
        return nameA.localeCompare(nameB)
      }
    }
  })

  const categoryOptions = [
    { value: 'all', label: isArabic ? 'جميع الفئات' : 'All Categories' },
    ...categories.map(category => ({
      value: category.id,
      label: isArabic ? (category.name_ar || category.name) : category.name
    }))
  ]

  const getProductBadges = (product: Product) => {
    const badges = []
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    
    // Only show sale badge if product is on sale AND has a valid sale price that's less than regular price
    const salePrice = getSalePrice(product)
    const regularPrice = getProductPrice(product)
    if (product.is_on_sale && salePrice && salePrice < regularPrice) {
      badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })
    }
    
    return badges
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
            <div className="w-full lg:w-48 h-10 bg-muted rounded animate-pulse"></div>
            <div className="w-full lg:w-48 h-10 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden py-0">
              <div className="aspect-square bg-muted animate-pulse"></div>
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                <div className="h-6 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {isArabic ? 'متجر القهوة' : 'Coffee Shop'}
            </h1>
            <p className="text-muted-foreground">
              {isArabic 
                ? `اكتشف مجموعتنا المميزة من ${products.length} منتج` 
                : `Discover our premium collection of ${products.length} products`
              }
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {isArabic ? `${filteredProducts.length} منتج` : `${filteredProducts.length} Products`}
            </Badge>
          </div>
        </div>
        
        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'البحث عن المنتجات...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{isArabic ? 'الاسم' : 'Name'}</SelectItem>
                <SelectItem value="price-low">{isArabic ? 'السعر: الأقل إلى الأعلى' : 'Price: Low to High'}</SelectItem>
                <SelectItem value="price-high">{isArabic ? 'السعر: الأعلى إلى الأقل' : 'Price: High to Low'}</SelectItem>
                <SelectItem value="featured">{isArabic ? 'المميزة' : 'Featured'}</SelectItem>
                <SelectItem value="bestseller">{isArabic ? 'الأكثر مبيعاً' : 'Bestseller'}</SelectItem>
                <SelectItem value="new">{isArabic ? 'وصل حديثاً' : 'New Arrivals'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                {isArabic ? 'الفلاتر النشطة:' : 'Active filters:'}
              </span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  {isArabic ? 'البحث:' : 'Search:'} "{searchQuery}"
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categoryOptions.find(c => c.value === selectedCategory)?.label}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="text-xs h-6"
              >
                {isArabic ? 'مسح الكل' : 'Clear all'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <img 
                src="/images/logo-s.png" 
                alt="SpiritHub Cafe Logo" 
                className="h-16 w-16 object-contain opacity-50"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                {isArabic ? 'لا توجد منتجات' : 'No Products Found'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? 'لم يتم العثور على منتجات تطابق البحث الخاص بك. جرب مصطلحات بحث مختلفة.'
                  : 'No products match your search criteria. Try different search terms or filters.'
                }
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
            >
              {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const productPrice = getProductPrice(product)
            const salePrice = getSalePrice(product)
            const badges = getProductBadges(product)
            const productName = isArabic ? (product.name_ar || product.name) : product.name
            const categoryName = getCategoryName(product.category_id)

            return (
              <div key={product.id} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 py-0 h-full flex flex-col">
                  <Link to={`/product/${product.slug || product.id}`} className="block flex-1 flex flex-col">
                    <div className="relative overflow-hidden">
                      {/* Product Image */}
                      <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 relative overflow-hidden">
                        {(product.image_url || product.image || product.images?.[0] || product.gallery?.[0] || product.gallery_images?.[0]) ? (
                          <img
                            src={
                              product.image_url || 
                              product.image || 
                              product.images?.[0] || 
                              product.gallery?.[0] || 
                              product.gallery_images?.[0] || 
                              '/images/logo.png'
                            }
                            alt={productName}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/images/logo.png'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                            <img 
                              src="/images/logo-s.png" 
                              alt="SpiritHub Cafe Logo" 
                              className="h-20 w-20 object-contain opacity-50"
                            />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {badges.map((badge, index) => (
                          <Badge key={index} className={`text-xs text-white shadow-sm ${badge.color}`}>
                            {badge.text}
                          </Badge>
                        ))}
                      </div>

                      {/* Out of Stock Overlay */}
                      {product.stock_quantity <= 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Badge variant="destructive" className="text-sm py-2 px-4">
                            {isArabic ? 'نفذت الكمية' : 'Out of Stock'}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                      {/* Category */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {categoryName}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({(product.average_rating || 0).toFixed(1)})
                          </span>
                        </div>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2 min-h-[3.5rem] flex items-start">
                        {productName}
                      </h3>

                      {/* Uses */}
                      {(isArabic ? product.uses_ar : product.uses) && (
                        <div className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] flex-1">
                          <HTMLContent 
                            content={isArabic ? (product.uses_ar || product.uses || '') : (product.uses || '')} 
                            className="!max-w-none !text-sm !leading-relaxed [&>*]:mb-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            maxLength={150}
                          />
                        </div>
                      )}

                      {/* Price & Stock */}
                      <div className="mt-auto space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {salePrice && salePrice < (productPrice ?? 0) ? (
                              <>
                                <span className="text-xl font-bold text-red-600">
                                  {formatPrice(salePrice)}
                                </span>
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatPrice(productPrice ?? 0)}
                                </span>
                                {(() => {
                                  const discountPercent = Math.round(((productPrice ?? 0) - salePrice) / (productPrice ?? 1) * 100)
                                  return discountPercent > 0 ? (
                                    <Badge variant="destructive" className="text-xs">
                                      {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                                    </Badge>
                                ) : null
                              })()}
                            </>
                          ) : (
                            <span className="text-xl font-bold text-amber-600">
                              {formatPrice(productPrice ?? 0)}
                            </span>
                          )}
                        </div>
                        <StockIndicator 
                          stock={product.stock_quantity || product.stock || 0} 
                          variant="compact"
                          lowStockThreshold={5}
                        />
                      </div>
                      </div>
                    </CardContent>
                  </Link>
                  
                  <div className="p-4 pt-0">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          if (product.stock_quantity > 0) {
                            addToCart(product, 1)
                          }
                        }}
                        disabled={product.stock_quantity <= 0}
                        className="flex-1 btn-coffee"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWishlist(product.id)}
                        className={`${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
