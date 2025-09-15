import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  Edit3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Loader2,
  Send,
  CreditCard,
  ShoppingBag,
  User
} from 'lucide-react'
import { firestoreService, type Order, type OrderItem } from '@/lib/firebase'
import { usePendingOrders } from '@/hooks/usePendingOrders'
import toast from 'react-hot-toast'

interface OrderWithDetails extends Order {
  items: OrderItem[]
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
type PaymentStatus = 'unpaid' | 'paid' | 'partially_paid' | 'refunded' | 'failed'

export function OrderManagementProfessional() {
  const { i18n } = useTranslation()
  const { refreshCount } = usePendingOrders()
  const isArabic = i18n.language === 'ar'

  // State management
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  
  // Filters and search
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  
  // Update states
  const [newStatus, setNewStatus] = useState<OrderStatus>('confirmed')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingNotes, setShippingNotes] = useState('')
  const [updating, setUpdating] = useState(false)

  // Load orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const ordersResponse = await firestoreService.orders.list()
      
        // Get order items for each order
        const ordersWithItems = await Promise.all(
          ordersResponse.items.map(async (order) => {
            const itemsResponse = await firestoreService.orderItems.getByOrder(order.id)
            return {
              ...order,
              items: itemsResponse.items || []
            }
          })
        )
        
        setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error(isArabic ? 'فشل في تحميل الطلبات' : 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on current filters
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false
    
    // Payment filter  
    if (paymentFilter !== 'all' && order.payment_status !== paymentFilter) return false
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchLower) ||
        order.customer_name?.toLowerCase().includes(searchLower) ||
        order.customer_email?.toLowerCase().includes(searchLower) ||
        order.customer_phone?.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateFilter) {
        case 'today':
          if (orderDate < startOfToday) return false
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (orderDate < weekAgo) return false
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (orderDate < monthAgo) return false
          break
      }
    }
    
    return true
  })

  // Get status badge variant
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          {isArabic ? 'في الانتظار' : 'Pending'}
        </Badge>
      case 'confirmed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {isArabic ? 'مؤكد' : 'Confirmed'}
        </Badge>
      case 'preparing':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
          <Package className="w-3 h-3 mr-1" />
          {isArabic ? 'قيد التحضير' : 'Preparing'}
        </Badge>
      case 'shipped':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          <Truck className="w-3 h-3 mr-1" />
          {isArabic ? 'تم الشحن' : 'Shipped'}
        </Badge>
      case 'delivered':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          {isArabic ? 'تم التوصيل' : 'Delivered'}
        </Badge>
      case 'cancelled':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          {isArabic ? 'ملغي' : 'Cancelled'}
        </Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Get payment status badge
  const getPaymentBadge = (paymentStatus: PaymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CreditCard className="w-3 h-3 mr-1" />
          {isArabic ? 'مدفوع' : 'Paid'}
        </Badge>
      case 'unpaid':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          {isArabic ? 'غير مدفوع' : 'Unpaid'}
        </Badge>
      case 'partially_paid':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <DollarSign className="w-3 h-3 mr-1" />
          {isArabic ? 'مدفوع جزئياً' : 'Partially Paid'}
        </Badge>
      case 'refunded':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <RefreshCw className="w-3 h-3 mr-1" />
          {isArabic ? 'مسترد' : 'Refunded'}
        </Badge>
      case 'failed':
        return <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          {isArabic ? 'فشل' : 'Failed'}
        </Badge>
      default:
        return <Badge variant="secondary">{paymentStatus}</Badge>
    }
  }

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder) return

    try {
      setUpdating(true)

      const updateData: Partial<Order> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Add tracking info if shipping
      if (newStatus === 'shipped' && trackingNumber) {
        updateData.tracking_number = trackingNumber
        // updateData.shipping_notes = shippingNotes // Notes not in Order interface
        updateData.shipped_at = new Date().toISOString()
      }

      const success = await firestoreService.orders.update(selectedOrder.id, updateData)
      
      if (success) {
        toast.success(isArabic ? 'تم تحديث حالة الطلب بنجاح' : 'Order status updated successfully')
        setDialogOpen(false)
        setSelectedOrder(null)
        setTrackingNumber('')
        setShippingNotes('')
        await fetchOrders()
        await refreshCount() // Refresh pending count
      } else {
        toast.error(isArabic ? 'فشل في تحديث الطلب' : 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(isArabic ? 'خطأ في تحديث الطلب' : 'Error updating order')
    } finally {
      setUpdating(false)
    }
  }

  // Cancel order
  const cancelOrder = async () => {
    if (!selectedOrder) return

    try {
      setUpdating(true)

      const success = await firestoreService.orders.update(selectedOrder.id, {
        status: 'cancelled',
        // cancelled_at: new Date().toISOString(), // Not in Order interface
        updated_at: new Date().toISOString()
      })
      
      if (success) {
        toast.success(isArabic ? 'تم إلغاء الطلب بنجاح' : 'Order cancelled successfully')
        setAlertOpen(false)
        setSelectedOrder(null)
        await fetchOrders()
        await refreshCount()
      } else {
        toast.error(isArabic ? 'فشل في إلغاء الطلب' : 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error(isArabic ? 'خطأ في إلغاء الطلب' : 'Error cancelling order')
    } finally {
      setUpdating(false)
    }
  }

  // Format price with currency
  const formatPrice = (order: Order) => {
    const currency = order.currency
    switch (currency) {
      case 'OMR':
        return `${order.total_omr?.toFixed(3)} OMR`
      case 'SAR':
        return `${order.total_sar?.toFixed(2)} SAR`
      case 'USD':
        return `$${order.total_usd?.toFixed(2)}`
      default:
        return 'N/A'
    }
  }

  // Get shipping method display
  const getShippingMethodDisplay = (order: Order) => {
    // Since shipping_method is not in Order interface, we'll use a placeholder
    const method = (order as any).shipping_method || 'standard'
    switch (method) {
      case 'nool_oman':
        return isArabic ? 'نول عمان - توصيل محلي' : 'Nool Oman - Local Delivery'
      case 'aramex':
        return isArabic ? 'أراميكس - شحن دولي' : 'Aramex - International Shipping'
      case 'dhl':
        return isArabic ? 'DHL - شحن سريع' : 'DHL - Express Shipping'
      default:
        return method || (isArabic ? 'غير محدد' : 'Not specified')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">{isArabic ? 'جاري تحميل الطلبات...' : 'Loading orders...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة الطلبات' : 'Order Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة وتتبع جميع طلبات العملاء' : 'Manage and track all customer orders'}
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {isArabic ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? 'في الانتظار' : 'Pending'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.payment_status === 'paid' && (o.status === 'confirmed' || o.status === 'preparing')).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? 'تم الشحن' : 'Shipped'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'shipped').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isArabic ? 'مكتمل' : 'Completed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isArabic ? 'البحث والتصفية' : 'Search & Filters'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>{isArabic ? 'البحث' : 'Search'}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'رقم الطلب، الاسم، البريد الإلكتروني...' : 'Order number, name, email...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>{isArabic ? 'حالة الطلب' : 'Order Status'}</Label>
              <Select value={statusFilter} onValueChange={(value: OrderStatus | 'all') => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
                  <SelectItem value="pending">{isArabic ? 'في الانتظار' : 'Pending'}</SelectItem>
                  <SelectItem value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</SelectItem>
                  <SelectItem value="preparing">{isArabic ? 'قيد التحضير' : 'Preparing'}</SelectItem>
                  <SelectItem value="shipped">{isArabic ? 'تم الشحن' : 'Shipped'}</SelectItem>
                  <SelectItem value="delivered">{isArabic ? 'تم التوصيل' : 'Delivered'}</SelectItem>
                  <SelectItem value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Filter */}
            <div className="space-y-2">
              <Label>{isArabic ? 'حالة الدفع' : 'Payment Status'}</Label>
              <Select value={paymentFilter} onValueChange={(value: PaymentStatus | 'all') => setPaymentFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع حالات الدفع' : 'All Payment Status'}</SelectItem>
                  <SelectItem value="paid">{isArabic ? 'مدفوع' : 'Paid'}</SelectItem>
                  <SelectItem value="unpaid">{isArabic ? 'غير مدفوع' : 'Unpaid'}</SelectItem>
                  <SelectItem value="partially_paid">{isArabic ? 'مدفوع جزئياً' : 'Partially Paid'}</SelectItem>
                  <SelectItem value="refunded">{isArabic ? 'مسترد' : 'Refunded'}</SelectItem>
                  <SelectItem value="failed">{isArabic ? 'فشل' : 'Failed'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label>{isArabic ? 'التاريخ' : 'Date'}</Label>
              <Select value={dateFilter} onValueChange={(value: 'today' | 'week' | 'month' | 'all') => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? 'جميع التواريخ' : 'All Dates'}</SelectItem>
                  <SelectItem value="today">{isArabic ? 'اليوم' : 'Today'}</SelectItem>
                  <SelectItem value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                  <SelectItem value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusFilter('all')
                  setPaymentFilter('all')
                  setSearchTerm('')
                  setDateFilter('all')
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isArabic ? 'لا توجد طلبات' : 'No orders found'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic ? 'لم يتم العثور على طلبات تطابق المعايير المحددة' : 'No orders match the selected criteria'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Order Info */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">#{order.order_number}</h3>
                      <div className="flex gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentBadge(order.payment_status)}
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(order.created_at).toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium">{isArabic ? 'معلومات الشحن' : 'Shipping Info'}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs">{getShippingMethodDisplay(order)}</span>
                      </div>
                      {order.shipping_address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="text-xs">
                            <p>{order.shipping_address.recipient_name}</p>
                            <p>{order.shipping_address.full_address}</p>
                            <p>{order.shipping_address.city}, {order.shipping_address.country}</p>
                          </div>
                        </div>
                      )}
                      {order.tracking_number && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-mono">{order.tracking_number}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPrice(order)}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items.length} {isArabic ? 'عنصر' : 'items'}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setDialogOpen(true)
                          setNewStatus(order.status)
                        }}
                        className="w-full"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        {isArabic ? 'تحديث الحالة' : 'Update Status'}
                      </Button>
                      
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setAlertOpen(true)
                          }}
                          className="w-full"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Summary */}
                {order.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-2">{isArabic ? 'المنتجات' : 'Products'}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="text-sm bg-muted p-2 rounded">
                          <div className="font-medium truncate">{item.product_name}</div>
                          <div className="text-muted-foreground">
                            {isArabic ? 'الكمية:' : 'Qty:'} {item.quantity} × {item.unit_price_omr ? `${item.unit_price_omr} OMR` : `$${item.unit_price_usd}`}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-muted-foreground p-2">
                          +{order.items.length - 3} {isArabic ? 'منتجات أخرى' : 'more items'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تحديث حالة الطلب' : 'Update Order Status'}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && `#${selectedOrder.order_number}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'الحالة الجديدة' : 'New Status'}</Label>
              <Select value={newStatus} onValueChange={(value: OrderStatus) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</SelectItem>
                  <SelectItem value="preparing">{isArabic ? 'قيد التحضير' : 'Preparing'}</SelectItem>
                  <SelectItem value="shipped">{isArabic ? 'تم الشحن' : 'Shipped'}</SelectItem>
                  <SelectItem value="delivered">{isArabic ? 'تم التوصيل' : 'Delivered'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'shipped' && (
              <>
                <div className="space-y-2">
                  <Label>{isArabic ? 'رقم التتبع' : 'Tracking Number'}</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder={isArabic ? 'أدخل رقم التتبع' : 'Enter tracking number'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>{isArabic ? 'ملاحظات الشحن' : 'Shipping Notes'}</Label>
                  <Textarea
                    value={shippingNotes}
                    onChange={(e) => setShippingNotes(e.target.value)}
                    placeholder={isArabic ? 'ملاحظات إضافية...' : 'Additional notes...'}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={updateOrderStatus} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isArabic ? 'جاري التحديث...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {isArabic ? 'تحديث' : 'Update'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Alert */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? `هل أنت متأكد من إلغاء الطلب #${selectedOrder?.order_number}؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to cancel order #${selectedOrder?.order_number}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'لا، الاحتفاظ بالطلب' : 'No, keep order'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={cancelOrder} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isArabic ? 'جاري الإلغاء...' : 'Cancelling...'}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  {isArabic ? 'نعم، إلغاء الطلب' : 'Yes, cancel order'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
