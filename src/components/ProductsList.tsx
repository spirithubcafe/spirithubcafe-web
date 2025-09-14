import { useState, useEffect } from 'react'
import { firestoreService, type Product } from '@/lib/firebase'
import { useCurrency } from '@/hooks/useCurrency'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'

export default function ProductsList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { formatPrice, currency } = useCurrency()
  const { i18n } = useTranslation()

  const isArabic = i18n.language === 'ar'

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)

        // Fetch all products from Firestore
        const result = await firestoreService.products.list()
        setProducts(result.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader size="md" />
          <p className="mt-4 text-muted-foreground">
            {isArabic ? 'جارٍ تحميل المنتجات...' : 'Loading products...'}
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {isArabic ? 'خطأ في تحميل المنتجات:' : 'Error loading products:'} {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{isArabic ? 'المنتجات' : 'Products'}</h1>
      {products.length === 0 ? (
        <p>{isArabic ? 'لا توجد منتجات.' : 'No products found.'}</p>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => {
            const productPrice = getProductPrice(product)
            const salePrice = getSalePrice(product)
            const productName = isArabic ? (product.name_ar || product.name) : product.name
            const productUses = isArabic ? (product.uses_ar || product.uses) : product.uses

            return (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{productName}</h3>
                  {product.is_on_sale && salePrice && salePrice < productPrice && (
                    <Badge variant="destructive" className="text-xs">
                      {isArabic ? 'تخفيض' : 'Sale'}
                    </Badge>
                  )}
                </div>
                
                {productUses && (
                  <p className="text-gray-600 mb-2">{productUses}</p>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                  {salePrice && salePrice < productPrice ? (
                    <>
                      <span className="text-lg font-bold text-red-600">
                        {formatPrice(salePrice)}
                      </span>
                      <span className="text-sm line-through text-gray-500">
                        {formatPrice(productPrice)}
                      </span>
                      {(() => {
                        const discountPercent = Math.round(((productPrice - salePrice) / productPrice) * 100)
                        return discountPercent > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            {discountPercent}% {isArabic ? 'خصم' : 'OFF'}
                          </Badge>
                        ) : null
                      })()}
                    </>
                  ) : (
                    <span className="text-lg font-bold text-green-600">
                      {formatPrice(productPrice)}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {isArabic ? 'تم الإضافة:' : 'Added:'} {product.created.toLocaleDateString()}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
