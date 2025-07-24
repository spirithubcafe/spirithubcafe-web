import { useState, useEffect } from 'react'
import { Coffee, ShoppingCart, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import { useCart } from '@/components/cart-provider'
import { firestoreService, type Product, type Category } from '@/lib/firebase'

export function ShopPage() {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = i18n.language === 'ar'

  // Load products and categories
  useEffect(() => {
    loadData()
  }, [])

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
        return product.price_omr || (product.price_usd * 0.385) // USD to OMR conversion
      case 'SAR':
        return product.price_sar || (product.price_usd * 3.75) // USD to SAR conversion
      case 'USD':
      default:
        return product.price_usd
    }
  }

  // Get sale price if on sale
  const getSalePrice = (product: Product) => {
    if (!product.is_on_sale) return null
    
    switch (currency) {
      case 'OMR':
        return product.sale_price_omr || (product.sale_price_usd ? product.sale_price_usd * 0.385 : null)
      case 'SAR':
        return product.sale_price_sar || (product.sale_price_usd ? product.sale_price_usd * 3.75 : null)
      case 'USD':
      default:
        return product.sale_price_usd || null
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
        return getProductPrice(a) - getProductPrice(b)
      case 'price-high':
        return getProductPrice(b) - getProductPrice(a)
      case 'featured':
        return Number(b.is_featured) - Number(a.is_featured)
      case 'bestseller':
        return Number(b.is_bestseller) - Number(a.is_bestseller)
      case 'new':
        return Number(b.is_new_arrival) - Number(a.is_new_arrival)
      case 'name':
      default:
        const nameA = isArabic ? (a.name_ar || a.name) : a.name
        const nameB = isArabic ? (b.name_ar || b.name) : b.name
        return nameA.localeCompare(nameB)
    }
  })

  const categoryOptions = [
    { value: 'all', label: isArabic ? 'جميع الفئات' : 'All Categories' },
    ...categories.map(category => ({
      value: category.id,
      label: isArabic ? (category.name_ar || category.name) : category.name
    }))
  ]

  const handleAddToCart = async (product: Product) => {
    setIsLoading(true)
    try {
      // Convert product to match cart expectations
      const cartProduct = {
        ...product,
        id: parseInt(product.id), // Convert string ID to number for cart
        stock: product.stock_quantity,
        price_omr: product.price_omr,
        price_sar: product.price_sar
      }
      await addToCart(cartProduct as any, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProductBadges = (product: Product) => {
    const badges = []
    if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
    if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
    if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
    if (product.is_on_sale) badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })
    return badges
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64 mb-4"></div>
              <div className="bg-muted rounded h-4 mb-2"></div>
              <div className="bg-muted rounded h-4 w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {isArabic ? 'متجر القهوة' : 'Coffee Shop'}
        </h1>
        
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {isArabic ? 'لا توجد منتجات متاحة' : 'No products found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productPrice = getProductPrice(product)
            const salePrice = getSalePrice(product)
            const badges = getProductBadges(product)
            const productName = isArabic ? (product.name_ar || product.name) : product.name
            const productDescription = isArabic ? (product.description_ar || product.description) : product.description
            const categoryName = getCategoryName(product.category_id)

            return (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-square bg-muted">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Coffee className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {badges.map((badge, index) => (
                      <Badge key={index} className={`text-xs text-white ${badge.color}`}>
                        {badge.text}
                      </Badge>
                    ))}
                  </div>

                  {/* Out of Stock Overlay */}
                  {product.stock_quantity <= 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge variant="destructive">
                        {isArabic ? 'نفذت الكمية' : 'Out of Stock'}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Category */}
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {categoryName}
                    </Badge>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {productName}
                  </h3>

                  {/* Description */}
                  {productDescription && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {productDescription}
                    </p>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    {salePrice ? (
                      <>
                        <span className="text-lg font-bold text-red-600">
                          {formatPrice(salePrice)}
                        </span>
                        <span className="text-sm line-through text-muted-foreground">
                          {formatPrice(productPrice)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold">
                        {formatPrice(productPrice)}
                      </span>
                    )}
                  </div>

                  {/* Stock Info */}
                  {product.stock_quantity > 0 && product.stock_quantity <= 10 && (
                    <p className="text-sm text-orange-600 mb-2">
                      {isArabic ? `متبقي ${product.stock_quantity} قطع فقط` : `Only ${product.stock_quantity} left in stock`}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1"
                      disabled={product.stock_quantity <= 0 || isLoading}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                    </Button>
                    
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
