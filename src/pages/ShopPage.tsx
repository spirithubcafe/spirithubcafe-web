import { useState } from 'react'
import { Coffee, Star, ShoppingCart, Filter, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import { useCart } from '@/components/cart-provider'
import { DEMO_PRODUCTS } from '@/types'
import type { Product } from '@/types'

export function ShopPage() {
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')

  const isArabic = i18n.language === 'ar'

  // Filter and sort products
  const filteredProducts = DEMO_PRODUCTS.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameAr.includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descriptionAr.includes(searchQuery)
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory ||
      product.categoryAr === selectedCategory

    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      case 'name':
      default:
        return isArabic ? 
          a.nameAr.localeCompare(b.nameAr) : 
          a.name.localeCompare(b.name)
    }
  })

  const categories = [
    { value: 'all', label: isArabic ? 'جميع الفئات' : 'All Categories' },
    { value: 'Coffee Beans', label: isArabic ? 'حبوب القهوة' : 'Coffee Beans' },
    { value: 'Equipment', label: isArabic ? 'المعدات' : 'Equipment' },
    { value: 'Accessories', label: isArabic ? 'الإكسسوارات' : 'Accessories' }
  ]

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
  }

  return (
    <div className="container py-12">
      <div className="space-y-8">
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
              placeholder={isArabic ? 'البحث في المنتجات...' : 'Search products...'}
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
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{isArabic ? 'الاسم' : 'Name'}</SelectItem>
              <SelectItem value="price-low">{isArabic ? 'السعر: من الأقل للأعلى' : 'Price: Low to High'}</SelectItem>
              <SelectItem value="price-high">{isArabic ? 'السعر: من الأعلى للأقل' : 'Price: High to Low'}</SelectItem>
              <SelectItem value="rating">{isArabic ? 'التقييم' : 'Rating'}</SelectItem>
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
                  {!product.inStock && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {isArabic ? 'غير متوفر' : 'Out of Stock'}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {isArabic ? product.categoryAr : product.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-lg">
                    {isArabic ? product.nameAr : product.name}
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <CardDescription className="mb-4">
                  {isArabic ? product.descriptionAr : product.description}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-amber-600 currency">
                    {formatPrice(product.price)}
                  </p>
                  
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className="flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>{isArabic ? 'أضف للسلة' : 'Add to Cart'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isArabic ? 'لم يتم العثور على منتجات' : 'No products found'}
            </h3>
            <p className="text-muted-foreground">
              {isArabic ? 'جرب تغيير فلاتر البحث' : 'Try adjusting your search filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
