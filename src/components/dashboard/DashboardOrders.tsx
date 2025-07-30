import { ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import type { Order } from '@/types'

interface DashboardOrdersProps {
  orders: Order[]
}

export default function DashboardOrders({ orders }: DashboardOrdersProps) {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isArabic = i18n.language === 'ar'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'طلباتي' : 'My Orders'}</CardTitle>
          <CardDescription>
            {isArabic ? 'تتبع جميع طلباتك هنا' : 'Track all your orders here'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
              </p>
              <Button asChild className="mt-4">
                <Link to="/shop">
                  {isArabic ? 'ابدأ التسوق' : 'Start Shopping'}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">#{order.id}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
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
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'المجموع:' : 'Total:'} {formatPrice(order.total || 0)}
                      </p>
                      <Button variant="outline" size="sm">
                        {isArabic ? 'عرض التفاصيل' : 'View Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
