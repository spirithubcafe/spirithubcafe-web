import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
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
import type { Product } from '@/lib/firebase'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'
import { HTMLContent } from '@/components/ui/html-content'
import { useProducts, useCategories } from '@/contexts/enhanced-data-provider'
import { ProductQuickView } from '@/components/product-quick-view'
export function ShopPage() {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const { toggleWishlist, isInWishlist } = useWishlist()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  
  const { products, loading } = useProducts()
  const { categories } = useCategories()

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()
  
  const isArabic = i18n.language === 'ar'


  // Check for category parameter in URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Check for reset parameter to clear all filters
  useEffect(() => {
    const resetParam = searchParams.get('reset')
    if (resetParam === 'true') {
      setSearchQuery('')
      setSelectedCategory('all')
      setSortBy('name')
      // Remove the reset parameter from URL without page refresh
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('reset')
      window.history.replaceState({}, '', newUrl.pathname + newUrl.search)
    }
  }, [searchParams])

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

  // Header title: special-case for the "SpiritHub Apparel" category only.
  const headerTitle = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const cat = categories.find(c => c.id === selectedCategory)
      if (cat) {
        // Prefer admin-provided page title when available
        if (isArabic && (cat as any).page_title_ar) return (cat as any).page_title_ar
        if (!isArabic && (cat as any).page_title) return (cat as any).page_title

        const catName = isArabic ? (cat.name_ar || cat.name) : cat.name
        // Match case-insensitively to the known category label
        if (String(catName).toLowerCase().includes('spirithub apparel')) {
          return catName
        }
      }
    }
    return isArabic ? 'رحلتنا مع القهوة' : 'OUR COFFEE JOURNEY'
  }, [selectedCategory, categories, isArabic])

  // Selected category object (if any)
  const selectedCategoryObj = selectedCategory !== 'all' ? categories.find(c => c.id === selectedCategory) : null

  // Compute subtitle text (prefer category-specific fields)
  const subtitleText = (() => {
    if (isArabic) {
      if (selectedCategoryObj && selectedCategoryObj.page_subtitle_ar) return selectedCategoryObj.page_subtitle_ar
      return `محمصة سبيريت هب، فريق عُماني بالكامل، تلتزم بعمق بتكريم الجهود العظيمة التي يبذلها مزارعو القهوة والحفاظ على أصالة كل منشأ. يجمع نهجنا بين التحميص الدقيق، والانتقاء الموسمي، والفهم العلمي للقهوة لتقديم فنجان يعكس هوية أرضه ويحكي قصته الفريدة .في سبيريت هب، كل فنجان ليس مجرد مشروب، بل هو صلة تجمع بين التراث والحرفية وروح القهوة.`
    } else {
      if (selectedCategoryObj && selectedCategoryObj.page_subtitle) return selectedCategoryObj.page_subtitle
      const catName = selectedCategoryObj ? (selectedCategoryObj.name || '') : ''
      if (catName.toLowerCase().includes('spirithub apparel')) {
        return `SPIRITHUB COLLECTIBLE TEES – WEAR THE JOURNEY\n\nAt Spirithub Roastery, every cup tells a story and so do you. Our community has grown with us, celebrating every milestone, from discovering the vibrant notes of Yemeni Odaini to introducing the world to rare Omani origins. Now, with the launch of our new Collection, we invite you to commemorate the adventure.\n\nSpirithub Collectible Tees are more than just apparel. Each tee marks a landmark chapter in our journey, turning achievements into wearable memories. Collect them, share in our story, and show the world you’re part of the Spirithub experience.\n\nAvailable now at Spirithub Roastery and online at spirithubcafe.com.`
      }
      return `SpiritHub Roastery, operated by an all-OMANI TEAM, is deeply committed to honoring the hard work of coffee farmers and preserving the authenticity of each origin. Our approach blends precision roasting, seasonal sourcing, and scientific understanding of coffee to deliver a cup that reflects its terroir and story. At SpiritHub, every cup is more than a drink, it’s a connection to heritage, craftsmanship, and the spirit of coffee.`
    }
  })()

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
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              {/* Image Skeleton */}
              <div className="relative aspect-square bg-muted animate-pulse">
                <div className="absolute top-2 left-2 space-y-1">
                  <div className="h-5 w-12 bg-background/80 rounded animate-pulse"></div>
                  <div className="h-5 w-10 bg-background/80 rounded animate-pulse"></div>
                </div>
                <div className="absolute top-2 right-2 space-y-2">
                  <div className="h-8 w-8 bg-background/80 rounded-full animate-pulse"></div>
                  <div className="h-8 w-8 bg-background/80 rounded-full animate-pulse"></div>
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3 flex flex-col h-40">
                {/* Category Badge */}
                <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                
                {/* Product Name */}
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
                
                {/* Notes */}
                <div className="space-y-1">
                  <div className="h-3 bg-muted rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse"></div>
                </div>
                
                {/* Price & Stock */}
                <div className="mt-auto space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <div className="h-9 bg-muted rounded animate-pulse"></div>
                </div>
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {isArabic ? headerTitle : String(headerTitle).toUpperCase()}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base whitespace-pre-line">
              {subtitleText}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm font-medium border-amber-200 text-amber-700 bg-amber-50">
              {isArabic ? `${filteredProducts.length} منتج متاح` : `${filteredProducts.length} Available`}
            </Badge>
            {searchQuery && (
              <Badge variant="secondary" className="text-sm">
                {isArabic ? 'نتائج البحث' : 'Search Results'}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Enhanced Filters */}
        <div className="p-2 lg:p-3">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'ابحث عن اسم المنتج، النوع، أو الوصف...' : 'Search by name, type, or description...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[48px] h-12 border-2 focus:border-amber-400 rounded-lg flex items-center px-3"
              />
            </div>
            
            {/* Category Filter */}
            <div className="lg:w-56">
              <Select 
                value={selectedCategory} 
                onValueChange={(value) => {
                  setSelectedCategory(value)
                  // Clear all filters when "All Categories" is selected to show all products
                  if (value === 'all') {
                    setSearchQuery('')
                    setSortBy('name')
                  }
                }}
              >
                <SelectTrigger className="w-full min-h-[48px] h-12 border-2 focus:border-amber-400 rounded-lg flex items-center">
                  <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select Category'} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="lg:w-56">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full min-h-[48px] h-12 border-2 focus:border-amber-400 rounded-lg flex items-center">
                  <SelectValue placeholder={isArabic ? 'اختر الترتيب' : 'Select Sort'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{isArabic ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</SelectItem>
                  <SelectItem value="price-low">{isArabic ? 'السعر: الأقل إلى الأعلى' : 'Price: Low to High'}</SelectItem>
                  <SelectItem value="price-high">{isArabic ? 'السعر: الأعلى إلى الأقل' : 'Price: High to Low'}</SelectItem>
                  <SelectItem value="featured">{isArabic ? 'المنتجات المميزة' : 'Featured Products'}</SelectItem>
                  <SelectItem value="bestseller">{isArabic ? 'الأكثر مبيعاً' : 'Best Sellers'}</SelectItem>
                  <SelectItem value="new">{isArabic ? 'وصل حديثاً' : 'New Arrivals'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                className="h-12 w-12 object-contain opacity-50"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {filteredProducts.map((product) => {
            const productPrice = getProductPrice(product)
            const salePrice = getSalePrice(product)
            const badges = getProductBadges(product)
            const productName = isArabic ? (product.name_ar || product.name) : product.name
            const categoryName = getCategoryName(product.category_id)

            return (
              <div key={product.id} className="group">
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col py-0">
                  <Link 
                    to={selectedCategory !== 'all' 
                      ? `/product/${product.slug || product.id}?category=${selectedCategory}` 
                      : `/product/${product.slug || product.id}`
                    } 
                    className="flex-1 flex flex-col"
                  >
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
                              className="h-16 w-16 object-contain opacity-50"
                            />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-1 left-1 lg:top-2 lg:left-2 flex flex-col gap-1">
                        {badges.map((badge, index) => (
                          <Badge key={index} className={`text-xs text-white shadow-sm px-1 lg:px-2 ${badge.color}`}>
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

                    <CardContent className="p-2 lg:p-3 pb-1 lg:pb-2 space-y-1 flex-1 flex flex-col">
                      {/* Category */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {categoryName}
                        </Badge>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-semibold text-sm lg:text-base leading-tight line-clamp-2 min-h-[2rem] lg:min-h-[2.5rem]">
                        {productName}
                      </h3>

                      {/* Notes - Show on all screen sizes */}
                      {(isArabic ? product.notes_ar : product.notes) && (
                        <div className="text-xs text-muted-foreground line-clamp-2 flex-1 -mt-1">
                          <HTMLContent 
                            content={isArabic ? (product.notes_ar || product.notes || '') : (product.notes || '')} 
                            className="!max-w-none !text-xs !leading-relaxed [&>*]:mb-0 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                            maxLength={100}
                          />
                        </div>
                      )}

                      {/* Price & Stock */}
                      <div className="mt-auto space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-2">
                            {salePrice && salePrice < (productPrice ?? 0) ? (
                              <>
                                <span className="text-sm lg:text-base font-bold text-red-600">
                                  {formatPrice(salePrice)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs line-through text-muted-foreground">
                                    {formatPrice(productPrice ?? 0)}
                                  </span>
                                  {(() => {
                                    const discountPercent = Math.round(((productPrice ?? 0) - salePrice) / (productPrice ?? 1) * 100)
                                    return discountPercent > 0 ? (
                                      <Badge variant="destructive" className="text-xs px-1">
                                        -{discountPercent}%
                                      </Badge>
                                  ) : null
                                })()}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm lg:text-base font-bold text-amber-600">
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
                  
                  <div className="px-2 lg:px-3 pb-2 lg:pb-3">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          if (product.stock_quantity > 0) {
                            addToCart(product, 1)
                          }
                        }}
                        disabled={product.stock_quantity <= 0}
                        className="flex-1 btn-coffee text-xs h-7 lg:h-8"
                        size="sm"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">{isArabic ? 'أضف للسلة' : 'Add to Cart'}</span>
                        <span className="sm:hidden">{isArabic ? 'أضف' : 'Add'}</span>
                      </Button>
                      <ProductQuickView product={product}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="px-2 h-7 lg:h-8"
                          title={isArabic ? 'نظرة سريعة' : 'Quick View'}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </ProductQuickView>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleWishlist(product.id)}
                        className={`px-2 h-7 lg:h-8 ${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                        title={isArabic ? 'إضافة إلى المفضلة' : 'Add to Wishlist'}
                      >
                        <Heart className={`h-3 w-3 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
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
