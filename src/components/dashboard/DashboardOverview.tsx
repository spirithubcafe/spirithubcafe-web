import { ShoppingBag, Clock, Heart, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import DashboardWishlist from './DashboardWishlist'
import type { Order } from '@/types'
import type { Product } from '@/types/dashboard'

interface DashboardOverviewProps {
  orders: Order[]
  products: Product[]
}

export default function DashboardOverview({ orders, products }: DashboardOverviewProps) {
  const { i18n } = useTranslation()
  const { formatPrice, currency } = useCurrency()
  const isArabic = i18n.language === 'ar'

  // Helper function to get order total based on current currency
  const getOrderTotal = (order: any) => {
    switch (currency) {
      case 'OMR':
        return order.total_price_omr || 0
      case 'SAR':
        return order.total_price_sar || 0
      case 'USD':
      default:
        return order.total_price_usd || 0
    }
  }

  // Helper function to get product price - dashboard products use simple price field
  const getProductPrice = (product: Product) => {
    // Dashboard products have a simple price field, convert to current currency
    const basePrice = product.price || 0
    switch (currency) {
      case 'OMR':
        return basePrice // Assume base price is in OMR
      case 'SAR':
        return basePrice * 3.75 // Convert OMR to SAR
      case 'USD':
      default:
        return basePrice * 2.6 // Convert OMR to USD
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'الطلبات الإجمالية' : 'Total orders placed'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الطلبات المعلقة' : 'Pending Orders'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(order => order.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'في انتظار التأكيد' : 'Awaiting confirmation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المنتجات المفضلة' : 'Favorite Products'}
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'العناصر المحفوظة' : 'Saved items'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'النقاط المكتسبة' : 'Points Earned'}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'نقاط المكافآت' : 'Reward points'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الطلبات الأخيرة' : 'Recent Orders'}</CardTitle>
            <CardDescription>
              {isArabic ? 'آخر 5 طلبات تم تقديمها' : 'Your last 5 orders'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
              </p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        order.status === 'completed' ? 'default' :
                        order.status === 'pending' ? 'secondary' :
                        order.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {order.status === 'completed' ? (isArabic ? 'مكتمل' : 'Completed') :
                         order.status === 'pending' ? (isArabic ? 'معلق' : 'Pending') :
                         order.status === 'cancelled' ? (isArabic ? 'ملغي' : 'Cancelled') :
                         order.status}
                      </Badge>
                      <p className="text-sm font-medium">
                        {formatPrice(getOrderTotal(order))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <DashboardWishlist />

        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'المنتجات المميزة' : 'Featured Products'}</CardTitle>
            <CardDescription>
              {isArabic ? 'المنتجات الأكثر شعبية' : 'Most popular products'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {isArabic ? 'لا توجد منتجات' : 'No products available'}
              </p>
            ) : (
              <div className="space-y-4">
                {products.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <img
                      src={product.image || '/images/logo-s.png'}
                      alt={isArabic ? (product.name_ar || product.name) : product.name}
                      className="h-10 w-10 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/logo-s.png'
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">
                        {isArabic ? product.name_ar : product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(getProductPrice(product))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
