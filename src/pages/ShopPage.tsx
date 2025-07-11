import { Coffee } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'

export function ShopPage() {
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isRTL = i18n.language === 'ar'

  // Sample products to demonstrate currency formatting
  const sampleProducts = [
    { id: 1, name: 'Premium Coffee Beans', price: 24.99 },
    { id: 2, name: 'Espresso Blend', price: 19.99 },
    { id: 3, name: 'Arabic Coffee', price: 29.99 },
  ]

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          {t('shop.title')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('shop.subtitle')}
        </p>
        
        {/* Sample Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {sampleProducts.map((product) => (
            <Card key={product.id} className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                  <Coffee className="h-8 w-8 text-amber-600 no-flip" />
                </div>
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className={`text-2xl font-bold text-amber-600 ${isRTL ? 'currency' : ''}`}>
                  {formatPrice(product.price)}
                </p>
                <Button className="w-full">Add to Cart</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card className="max-w-md mx-auto mt-12">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
              <Coffee className="h-8 w-8 text-amber-600 no-flip" />
            </div>
            <CardTitle className="text-2xl">{t('shop.comingSoon')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <CardDescription className="text-base">
              {t('shop.description')}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
