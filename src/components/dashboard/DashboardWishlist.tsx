import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye, Trash2, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { ProductQuickView } from '@/components/product-quick-view'
import { firestoreService, type Product } from '@/lib/firebase'

export default function DashboardWishlist() {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()
  const { wishlist, removeFromWishlist, loading: wishlistLoading } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const isArabic = i18n.language === 'ar'

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            {isArabic ? 'قائمة المفضلة' : 'My Wishlist'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-muted rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          {isArabic ? 'قائمة المفضلة' : 'My Wishlist'}
          <Badge variant="secondary" className="ml-auto">
            {products.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              {isArabic ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </p>
            <Link to="/shop">
              <Button size="sm">
                {isArabic ? 'تسوق الآن' : 'Shop Now'}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {products.slice(0, 6).map((product) => {
              const displayPrice = product.is_on_sale && product.sale_price_omr 
                ? product.sale_price_omr 
                : product.price_omr

              return (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <Link to={`/product/${product.slug || product.id}`} className="flex-shrink-0">
                    <div className="w-16 h-16 aspect-square overflow-hidden rounded">
                      <img
                        src={product.image || product.image_url || '/api/placeholder/64/64'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${product.slug || product.id}`}>
                      <h4 className="font-medium line-clamp-1 hover:text-primary">
                        {isArabic ? (product.name_ar || product.name) : product.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-primary">
                        {formatPrice(displayPrice)}
                      </span>
                      {product.is_on_sale && product.sale_price_omr && product.sale_price_omr < product.price_omr && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.price_omr)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {product.stock_quantity > 0 
                        ? (isArabic ? `متوفر (${product.stock_quantity})` : `In stock (${product.stock_quantity})`)
                        : (isArabic ? 'نفدت الكمية' : 'Out of stock')
                      }
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleAddToCart(product)}
                      size="sm"
                      variant="outline"
                      disabled={product.stock_quantity <= 0}
                    >
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                    
                    <ProductQuickView product={product}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </ProductQuickView>
                    
                    <Button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {products.length > 6 && (
              <div className="text-center pt-4">
                <Link to="/dashboard/wishlist">
                  <Button variant="outline" size="sm">
                    {isArabic ? `عرض جميع المنتجات (${products.length})` : `View all items (${products.length})`}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
