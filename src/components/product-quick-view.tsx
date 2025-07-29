import { useState, useEffect } from 'react'
import { Star, ShoppingCart, Plus, Minus, Coffee } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import { useCart } from '@/hooks/useCart'
import { firestoreService, type Product, type Category } from '@/lib/firebase'

interface ProductQuickViewProps {
  product: Product
  children: React.ReactNode
}

export function ProductQuickView({ product, children }: ProductQuickViewProps) {
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

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

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category) return i18n.language === 'ar' ? 'عام' : 'General'
    return i18n.language === 'ar' ? (category.name_ar || category.name) : category.name
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setIsOpen(false)
    setQuantity(1)
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            {i18n.language === 'ar' ? product.name_ar : product.name}
          </DialogTitle>
          <DialogDescription>
            {i18n.language === 'ar' ? product.description_ar : product.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Product Image */}
          <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center h-30 min-h-30 max-h-30">
            <Coffee className="h-10 w-10 text-amber-600" />
          </div>
          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {getCategoryName(product.category_id)}
                </Badge>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(4.5)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    (4.5)
                  </span>
                </div>
              </div>
              <span className="text-2xl font-bold text-amber-600 currency">
                {formatPrice(product.price_omr)}
              </span>
            </div>
            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t('shop.quantity')}
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
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {/* Total Price */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">{t('shop.total')}</span>
              <span className="text-xl font-bold text-amber-600 currency">
                {formatPrice(product.price_omr * quantity)}
              </span>
            </div>
            {/* Add to Cart Button */}
            <Button onClick={handleAddToCart} className="w-full h-12">
              <ShoppingCart className="h-4 w-4 mr-2" />
              {t('shop.addToCart')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
