import { useState, useEffect } from 'react'
import { Coffee, Star, ShoppingCart, Filter, Search, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProductQuickView } from '@/components/product-quick-view'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import { useCart } from '@/components/cart-provider'
import { productsService, categoriesService } from '@/services/products'
import type { Product, Category } from '@/types'

export function ShopPage() {
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Load products and categories
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        productsService.getProducts({ page: 1, limit: 100 }),
        categoriesService.getCategories()
      ])
      
      setProducts(productsData.data)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.name_ar && product.name_ar.includes(searchQuery)) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description_ar && product.description_ar.includes(searchQuery))
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id?.toString() === selectedCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price_usd - b.price_usd
      case 'price-high':
        return b.price_usd - a.price_usd
      case 'name':
      default:
        const nameA = i18n.language === 'ar' ? (a.name_ar || a.name) : a.name
        const nameB = i18n.language === 'ar' ? (b.name_ar || b.name) : b.name
        return nameA.localeCompare(nameB)
    }
  })

  const categoryOptions = [
    { value: 'all', label: t('shop.categories.all') },
    ...categories.map(category => ({
      value: category.id.toString(),
      label: i18n.language === 'ar' ? (category.name_ar || category.name) : category.name
    }))
  ]

  const handleAddToCart = async (product: Product) => {
    setIsLoading(true)
    try {
      await addToCart(product, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/10">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <Coffee className="h-8 w-8 animate-spin text-amber-600" />
              <span className="ml-2 text-lg">{t('common.loading')}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background to-muted/10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('shop.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('shop.subtitle')}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('shop.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder={t('shop.sortBy.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t('shop.sortBy.name')}</SelectItem>
              <SelectItem value="price-low">{t('shop.sortBy.priceLow')}</SelectItem>
              <SelectItem value="price-high">{t('shop.sortBy.priceHigh')}</SelectItem>
              <SelectItem value="rating">{t('shop.sortBy.rating')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-48 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <Coffee className="h-16 w-16 text-amber-600 no-flip" />
                  </div>
                  {product.stock <= 0 && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {t('shop.outOfStock')}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {product.category ? 
                        (i18n.language === 'ar' ? (product.category.name_ar || product.category.name) : product.category.name) : 
                        'General'
                      }
                    </Badge>
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm">
                          {(product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1)}
                        </span>
                        <span className="text-sm text-muted-foreground">({product.reviews.length})</span>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-lg">
                    {i18n.language === 'ar' ? (product.name_ar || product.name) : product.name}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="mb-4">
                  {i18n.language === 'ar' ? (product.description_ar || product.description) : product.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-amber-600 currency">
                    {formatPrice(product.price_usd)}
                  </p>
                  
                  <div className="flex gap-2">
                    <ProductQuickView product={product}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </ProductQuickView>
                    
                    <Button 
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0 || isLoading}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>{isLoading ? t('common.loading') : t('shop.addToCart')}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('shop.noProductsFound')}
            </h3>
            <p className="text-muted-foreground">
              {t('shop.adjustFilters')}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
