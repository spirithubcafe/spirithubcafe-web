import { useState, useEffect } from 'react'
import { Package, Eye, Edit, Truck, CheckCircle, X, Clock, User, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { firestoreService, type Order, type OrderItem } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function OrderManagement() {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isArabic = i18n.language === 'ar'

  const [orders, setOrders] = useState<Order[]>([])
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)

  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    tracking_number: '',
    admin_notes: ''
  })

  useEffect(() => {
    const loadOrdersAsync = async () => {
      try {
        setLoading(true)
        const result = await firestoreService.orders.list()
        setOrders(result.items)

        // Load order items for each order
        const itemsData: Record<string, OrderItem[]> = {}
        for (const order of result.items) {
          try {
            const itemsResult = await firestoreService.orderItems.getByOrder(order.id)
            itemsData[order.id] = itemsResult.items
          } catch (error) {
            console.error(`Error loading items for order ${order.id}:`, error)
            itemsData[order.id] = []
          }
        }
        setOrderItems(itemsData)
      } catch (error) {
        console.error('Error loading orders:', error)
        toast.error(isArabic ? 'خطأ في تحميل الطلبات' : 'Error loading orders')
      } finally {
        setLoading(false)
      }
    }
    
    loadOrdersAsync()
  }, [isArabic])

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    setStatusUpdate({
      status: order.status,
      tracking_number: order.tracking_number || '',
      admin_notes: order.admin_notes || ''
    })
    setEditDialogOpen(true)
  }

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return

    try {
      setUpdateLoading(true)
      
      const updateData: Partial<Order> = {
        status: statusUpdate.status as any,
        admin_notes: statusUpdate.admin_notes,
        updated_at: new Date().toISOString()
      }

      if (statusUpdate.tracking_number) {
        updateData.tracking_number = statusUpdate.tracking_number
      }

      if (statusUpdate.status === 'shipped' && !selectedOrder.shipped_at) {
        updateData.shipped_at = new Date().toISOString()
      }

      if (statusUpdate.status === 'delivered' && !selectedOrder.delivered_at) {
        updateData.delivered_at = new Date().toISOString()
      }

      await firestoreService.orders.update(selectedOrder.id, updateData)
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, ...updateData }
          : order
      ))

      setEditDialogOpen(false)
      setSelectedOrder(null)
      toast.success(isArabic ? 'تم تحديث الطلب' : 'Order updated successfully')
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(isArabic ? 'خطأ في تحديث الطلب' : 'Error updating order')
    } finally {
      setUpdateLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        variant: 'secondary' as const, 
        icon: Clock, 
        label: isArabic ? 'في الانتظار' : 'Pending' 
      },
      confirmed: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: isArabic ? 'مؤكد' : 'Confirmed' 
      },
      preparing: { 
        variant: 'outline' as const, 
        icon: Package, 
        label: isArabic ? 'قيد التحضير' : 'Preparing' 
      },
      shipped: { 
        variant: 'default' as const, 
        icon: Truck, 
        label: isArabic ? 'تم الشحن' : 'Shipped' 
      },
      delivered: { 
        variant: 'default' as const, 
        icon: CheckCircle, 
        label: isArabic ? 'تم التسليم' : 'Delivered' 
      },
      cancelled: { 
        variant: 'destructive' as const, 
        icon: X, 
        label: isArabic ? 'ملغي' : 'Cancelled' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { 
        variant: 'destructive' as const, 
        label: isArabic ? 'غير مدفوع' : 'Unpaid' 
      },
      paid: { 
        variant: 'default' as const, 
        label: isArabic ? 'مدفوع' : 'Paid' 
      },
      partially_paid: { 
        variant: 'secondary' as const, 
        label: isArabic ? 'مدفوع جزئياً' : 'Partially Paid' 
      },
      refunded: { 
        variant: 'outline' as const, 
        label: isArabic ? 'مسترد' : 'Refunded' 
      },
      failed: { 
        variant: 'destructive' as const, 
        label: isArabic ? 'فشل' : 'Failed' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isArabic ? 'إدارة الطلبات' : 'Order Management'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isArabic ? 'إدارة الطلبات' : 'Order Management'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'رقم الطلب' : 'Order Number'}</TableHead>
                    <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead>{isArabic ? 'الدفع' : 'Payment'}</TableHead>
                    <TableHead>{isArabic ? 'الإجمالي' : 'Total'}</TableHead>
                    <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
                    <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>
                        {order.total_price_omr ? formatPrice(order.total_price_omr) : 
                         order.total_price_usd ? formatPrice(order.total_price_usd) :
                         order.total_price_sar ? formatPrice(order.total_price_sar) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOrder(order)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
              {selectedOrder && ` - ${selectedOrder.order_number}`}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {isArabic ? 'معلومات العميل' : 'Customer Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.customer_phone}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {isArabic ? 'معلومات الطلب' : 'Order Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الحالة:' : 'Status:'}</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الدفع:' : 'Payment:'}</span>
                      {getPaymentStatusBadge(selectedOrder.payment_status)}
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                      <Badge variant="outline">
                        <CreditCard className="h-3 w-3 mr-1" />
                        {selectedOrder.payment_method === 'card' ? (isArabic ? 'بطاقة' : 'Card') :
                         selectedOrder.payment_method === 'cash' ? (isArabic ? 'نقد' : 'Cash') :
                         selectedOrder.payment_method || 'N/A'}
                      </Badge>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span>{isArabic ? 'رقم التتبع:' : 'Tracking:'}</span>
                        <span className="font-mono">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {isArabic ? 'عنوان التوصيل' : 'Shipping Address'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div><strong>{selectedOrder.shipping_address.recipient_name}</strong></div>
                      <div>{selectedOrder.shipping_address.full_address}</div>
                      <div>{selectedOrder.shipping_address.city}{selectedOrder.shipping_address.state && `, ${selectedOrder.shipping_address.state}`}</div>
                      <div>{selectedOrder.shipping_address.country} {selectedOrder.shipping_address.postal_code}</div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedOrder.shipping_address.phone}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'عناصر الطلب' : 'Order Items'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {orderItems[selectedOrder.id] && orderItems[selectedOrder.id].length > 0 ? (
                    <div className="space-y-4">
                      {orderItems[selectedOrder.id].map((item) => (
                        <div key={item.id} className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-md flex items-center justify-center">
                              <Package className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">
                                {isArabic ? (item.product_name_ar || item.product_name) : item.product_name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? 'الكمية' : 'Qty'}: {item.quantity}
                              </p>
                              {item.selected_properties && Object.keys(item.selected_properties).length > 0 && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {Object.entries(item.selected_properties).map(([key, value]) => (
                                    <span key={key} className="mr-2">{key}: {value}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {item.total_price_omr ? formatPrice(item.total_price_omr) :
                               item.total_price_usd ? formatPrice(item.total_price_usd) :
                               item.total_price_sar ? formatPrice(item.total_price_sar) : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.unit_price_omr ? formatPrice(item.unit_price_omr) :
                               item.unit_price_usd ? formatPrice(item.unit_price_usd) :
                               item.unit_price_sar ? formatPrice(item.unit_price_sar) : 'N/A'} {isArabic ? 'لكل قطعة' : 'each'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      {isArabic ? 'لا توجد عناصر' : 'No items found'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>
                        {selectedOrder.subtotal_omr ? formatPrice(selectedOrder.subtotal_omr) :
                         selectedOrder.subtotal_usd ? formatPrice(selectedOrder.subtotal_usd) :
                         selectedOrder.subtotal_sar ? formatPrice(selectedOrder.subtotal_sar) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الشحن:' : 'Shipping:'}</span>
                      <span>
                        {selectedOrder.shipping_cost_omr ? formatPrice(selectedOrder.shipping_cost_omr) :
                         selectedOrder.shipping_cost_usd ? formatPrice(selectedOrder.shipping_cost_usd) :
                         selectedOrder.shipping_cost_sar ? formatPrice(selectedOrder.shipping_cost_sar) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الضرائب:' : 'Tax:'}</span>
                      <span>
                        {selectedOrder.tax_amount_omr ? formatPrice(selectedOrder.tax_amount_omr) :
                         selectedOrder.tax_amount_usd ? formatPrice(selectedOrder.tax_amount_usd) :
                         selectedOrder.tax_amount_sar ? formatPrice(selectedOrder.tax_amount_sar) : 'N/A'}
                      </span>
                    </div>
                    {(selectedOrder.discount_amount_omr || selectedOrder.discount_amount_usd || selectedOrder.discount_amount_sar) && (
                      <div className="flex justify-between">
                        <span>{isArabic ? 'الخصم:' : 'Discount:'}</span>
                        <span className="text-green-600">
                          -{selectedOrder.discount_amount_omr ? formatPrice(selectedOrder.discount_amount_omr) :
                            selectedOrder.discount_amount_usd ? formatPrice(selectedOrder.discount_amount_usd) :
                            selectedOrder.discount_amount_sar ? formatPrice(selectedOrder.discount_amount_sar) : '0'}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                      <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <span className="text-amber-600">
                        {selectedOrder.total_price_omr ? formatPrice(selectedOrder.total_price_omr) :
                         selectedOrder.total_price_usd ? formatPrice(selectedOrder.total_price_usd) :
                         selectedOrder.total_price_sar ? formatPrice(selectedOrder.total_price_sar) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(selectedOrder.notes || selectedOrder.admin_notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{isArabic ? 'الملاحظات' : 'Notes'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedOrder.notes && (
                      <div>
                        <Label className="font-medium">{isArabic ? 'ملاحظات العميل:' : 'Customer Notes:'}</Label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedOrder.notes}</p>
                      </div>
                    )}
                    {selectedOrder.admin_notes && (
                      <div>
                        <Label className="font-medium">{isArabic ? 'ملاحظات الإدارة:' : 'Admin Notes:'}</Label>
                        <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedOrder.admin_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تحديث الطلب' : 'Update Order'}
              {selectedOrder && ` - ${selectedOrder.order_number}`}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'تحديث حالة الطلب ومعلومات الشحن' : 'Update order status and shipping information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">{isArabic ? 'حالة الطلب' : 'Order Status'}</Label>
              <Select value={statusUpdate.status} onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{isArabic ? 'في الانتظار' : 'Pending'}</SelectItem>
                  <SelectItem value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</SelectItem>
                  <SelectItem value="preparing">{isArabic ? 'قيد التحضير' : 'Preparing'}</SelectItem>
                  <SelectItem value="shipped">{isArabic ? 'تم الشحن' : 'Shipped'}</SelectItem>
                  <SelectItem value="delivered">{isArabic ? 'تم التسليم' : 'Delivered'}</SelectItem>
                  <SelectItem value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking">{isArabic ? 'رقم التتبع' : 'Tracking Number'}</Label>
              <Input
                id="tracking"
                value={statusUpdate.tracking_number}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, tracking_number: e.target.value }))}
                placeholder={isArabic ? 'أدخل رقم التتبع' : 'Enter tracking number'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-notes">{isArabic ? 'ملاحظات الإدارة' : 'Admin Notes'}</Label>
              <Textarea
                id="admin-notes"
                value={statusUpdate.admin_notes}
                onChange={(e) => setStatusUpdate(prev => ({ ...prev, admin_notes: e.target.value }))}
                placeholder={isArabic ? 'أضف ملاحظات للطلب' : 'Add notes for this order'}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdateOrder} disabled={updateLoading}>
              {updateLoading 
                ? (isArabic ? 'جاري التحديث...' : 'Updating...')
                : (isArabic ? 'تحديث' : 'Update')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
