import { useState } from 'react'
import { ShoppingBag, Package, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { firestoreService, type OrderItem } from '@/lib/firebase'
import type { Order } from '@/types'

interface DashboardOrdersProps {
  orders: Order[]
}

export default function DashboardOrders({ orders }: DashboardOrdersProps) {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isArabic = i18n.language === 'ar'
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  const loadOrderItems = async (orderId: string) => {
    try {
      setLoadingItems(true)
      const result = await firestoreService.orderItems.getByOrder(orderId)
      setOrderItems(result.items || [])
    } catch (error) {
      console.error('Error loading order items:', error)
      setOrderItems([])
    } finally {
      setLoadingItems(false)
    }
  }

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order)
    await loadOrderItems(order.id?.toString() || '')
  }

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
                        {isArabic ? 'المجموع:' : 'Total:'} {formatPrice(
                          order.total_price_omr || 
                          order.total_omr || 
                          order.total_usd || 
                          order.total_sar || 0
                        )}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                        <Eye className="h-4 w-4 mr-2" />
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

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder?.order_number || selectedOrder?.id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="py-0">
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{isArabic ? 'معلومات الطلب' : 'Order Information'}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>{isArabic ? 'رقم الطلب:' : 'Order Number:'}</span>
                        <span>#{selectedOrder.order_number || selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isArabic ? 'التاريخ:' : 'Date:'}</span>
                        <span>{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{isArabic ? 'الحالة:' : 'Status:'}</span>
                        <Badge variant={
                          selectedOrder.status === 'delivered' ? 'default' :
                          selectedOrder.status === 'pending' ? 'secondary' :
                          selectedOrder.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {selectedOrder.status === 'delivered' ? (isArabic ? 'تم التسليم' : 'Delivered') :
                           selectedOrder.status === 'shipped' ? (isArabic ? 'تم الشحن' : 'Shipped') :
                           selectedOrder.status === 'processing' ? (isArabic ? 'قيد التحضير' : 'Processing') :
                           selectedOrder.status === 'confirmed' ? (isArabic ? 'مؤكد' : 'Confirmed') :
                           selectedOrder.status === 'pending' ? (isArabic ? 'معلق' : 'Pending') :
                           selectedOrder.status === 'cancelled' ? (isArabic ? 'ملغي' : 'Cancelled') :
                           selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>{isArabic ? 'حالة الدفع:' : 'Payment Status:'}</span>
                        <Badge variant={selectedOrder.payment_status === 'paid' ? 'default' : 'secondary'}>
                          {selectedOrder.payment_status === 'paid' ? (isArabic ? 'مدفوع' : 'Paid') :
                           selectedOrder.payment_status === 'unpaid' ? (isArabic ? 'غير مدفوع' : 'Unpaid') :
                           selectedOrder.payment_status === 'failed' ? (isArabic ? 'فشل' : 'Failed') :
                           selectedOrder.payment_status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <Card className="py-0">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{isArabic ? 'عنوان الشحن' : 'Shipping Address'}</h3>
                      <div className="text-sm space-y-1">
                        <div>{selectedOrder.shipping_address.recipient_name}</div>
                        <div>{selectedOrder.shipping_address.phone}</div>
                        <div>{selectedOrder.shipping_address.full_address}</div>
                        <div>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}</div>
                        {selectedOrder.shipping_address.postal_code && (
                          <div>{selectedOrder.shipping_address.postal_code}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Items */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">{isArabic ? 'العناصر المطلوبة' : 'Order Items'}</h3>
                  {loadingItems ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {orderItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                          {item.product_image && (
                            <img 
                              src={item.product_image} 
                              alt={item.product_name}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {isArabic ? (item.product_name_ar || item.product_name) : item.product_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? 'الكمية:' : 'Quantity:'} {item.quantity}
                            </p>
                            {item.selected_properties && Object.keys(item.selected_properties).length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {Object.entries(item.selected_properties).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatPrice(
                                item.total_price_omr || 
                                item.total_price_usd || 
                                item.total_price_sar || 
                                (item.unit_price_omr || item.unit_price_usd || item.unit_price_sar || 0) * item.quantity
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatPrice(
                                item.unit_price_omr || 
                                item.unit_price_usd || 
                                item.unit_price_sar || 0
                              )} × {item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p>{isArabic ? 'لا توجد عناصر' : 'No items found'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-4">{isArabic ? 'ملخص الطلب' : 'Order Summary'}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>{formatPrice(
                        selectedOrder.subtotal_omr || 
                        selectedOrder.subtotal_usd || 
                        selectedOrder.subtotal_sar || 0
                      )}</span>
                    </div>
                    {(selectedOrder.shipping_cost_omr || selectedOrder.shipping_cost_usd || selectedOrder.shipping_cost_sar) && (
                      <div className="flex justify-between">
                        <span>{isArabic ? 'الشحن:' : 'Shipping:'}</span>
                        <span>{formatPrice(
                          selectedOrder.shipping_cost_omr || 
                          selectedOrder.shipping_cost_usd || 
                          selectedOrder.shipping_cost_sar || 0
                        )}</span>
                      </div>
                    )}
                    {(selectedOrder.tax_amount_omr || selectedOrder.tax_amount_usd || selectedOrder.tax_amount_sar) && (
                      <div className="flex justify-between">
                        <span>{isArabic ? 'الضريبة:' : 'Tax:'}</span>
                        <span>{formatPrice(
                          selectedOrder.tax_amount_omr || 
                          selectedOrder.tax_amount_usd || 
                          selectedOrder.tax_amount_sar || 0
                        )}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <span>{formatPrice(
                        selectedOrder.total_price_omr || 
                        selectedOrder.total_price_omr ||
                        selectedOrder.total_price_usd ||
                        selectedOrder.total_price_sar || 0
                      )}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
