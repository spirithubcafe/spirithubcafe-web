import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { firestoreService, type Product } from '@/lib/firebase'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function WishlistPage() {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = i18n.language === 'ar'

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  // Load product details for wishlist items
  useEffect(() => {
    const loadWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const productPromises = wishlist.map(item => 
          firestoreService.products.get(item.product_id)
        )
        
        const productResults = await Promise.all(productPromises)
        const validProducts = productResults.filter(product => product !== null) as Product[]
        setProducts(validProducts)
      } catch (error) {
        console.error('Error loading wishlist products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWishlistProducts()
  }, [wishlist])

  const handleAddToCart = async (product: Product) => {
    await addToCart(product, 1)
  }

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId)
  }

  if (loading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                  <div className="h-6 bg-muted rounded w-20 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-9 bg-muted rounded flex-1"></div>
                    <div className="h-9 bg-muted rounded w-9"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'قائمة المفضلة' : 'My Wishlist'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic 
              ? `${products.length} منتج في قائمة المفضلة`
              : `${products.length} item${products.length !== 1 ? 's' : ''} in your wishlist`
            }
          </p>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isArabic ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {isArabic 
                ? 'ابدأ بإضافة المنتجات التي تحبها'
                : 'Start adding products you love to your wishlist'
              }
            </p>
            <Link to="/shop">
              <Button>
                {isArabic ? 'تسوق الآن' : 'Shop Now'}
              </Button>
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const displayPrice = product.is_on_sale && product.sale_price_omr 
                ? product.sale_price_omr 
                : product.price_omr

              const badges = []
              if (product.is_featured) badges.push({ text: isArabic ? 'مميز' : 'Featured', color: 'bg-blue-500' })
              if (product.is_bestseller) badges.push({ text: isArabic ? 'الأكثر مبيعاً' : 'Bestseller', color: 'bg-green-500' })
              if (product.is_new_arrival) badges.push({ text: isArabic ? 'وصل حديثاً' : 'New', color: 'bg-purple-500' })
              if (product.is_on_sale) badges.push({ text: isArabic ? 'تخفيض' : 'Sale', color: 'bg-red-500' })

              return (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/product/${product.slug || product.id}`}>
                      {/* Product Image */}
                      <div className="relative mb-4">
                        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                          <img
                            src={product.image || product.image_url || '/api/placeholder/300/300'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        
                        {/* Remove from wishlist button */}
                        <Button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleRemoveFromWishlist(product.id)
                          }}
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        {/* Product badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {badges.map((badge, index) => (
                            <Badge key={index} className={`text-xs text-white ${badge.color}`}>
                              {badge.text}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-2">
                          {isArabic ? (product.name_ar || product.name) : product.name}
                        </h3>
                        
                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-amber-600">
                            {formatPrice(displayPrice)}
                          </span>
                          {product.is_on_sale && product.sale_price_omr && product.sale_price_omr < product.price_omr && (
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price_omr)}
                            </span>
                          )}
                        </div>

                        {/* Stock status */}
                        <div className="text-sm text-muted-foreground">
                          {product.stock_quantity > 0 
                            ? (isArabic ? `متوفر (${product.stock_quantity})` : `In stock (${product.stock_quantity})`)
                            : (isArabic ? 'نفدت الكمية' : 'Out of stock')
                          }
                        </div>
                      </div>
                    </Link>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleAddToCart(product)}
                        className="flex-1"
                        disabled={product.stock_quantity <= 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
