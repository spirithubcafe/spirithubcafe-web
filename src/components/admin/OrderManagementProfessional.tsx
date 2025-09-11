import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Mail,
  Calendar,
  DollarSign,
  ShoppingBag,
  User
} from 'lucide-react'
import { jsonDataService } from '@/services/jsonDataService'

interface Order {
  id: string
  user_id: string
  user_email: string
  status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  subtotal: number
  tax: number
  shipping: number
  items: Array<{
    product_id: string
    name: string
    quantity: number
    price: number
    total: number
  }>
  shipping_address: {
    name: string
    street: string
    city: string
    country: string
    postal_code: string
  }
  payment_method: string
  created_at: string
  updated_at: string
  tracking_number?: string
  notes?: string
}

export default function OrderManagementProfessional() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, statusFilter, searchTerm])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.fetchJSON('/data/orders.json')
      if (data && Array.isArray(data)) {
        setOrders(data)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredOrders(filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ))
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const updatedOrders = orders.map(order =>
        order.id === orderId 
          ? { ...order, status: newStatus as any, updated_at: new Date().toISOString() }
          : order
      )
      await jsonDataService.saveJSON('/data/orders.json', updatedOrders)
      setOrders(updatedOrders)
      console.log(isArabic ? 'تم تحديث حالة الطلب' : 'Order status updated')
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        variant: 'secondary' as const, 
        text: isArabic ? 'في الانتظار' : 'Pending',
        icon: Clock
      },
      confirmed: { 
        variant: 'default' as const, 
        text: isArabic ? 'مؤكد' : 'Confirmed',
        icon: CheckCircle
      },
      preparing: { 
        variant: 'default' as const, 
        text: isArabic ? 'قيد التحضير' : 'Preparing',
        icon: Package
      },
      shipped: { 
        variant: 'default' as const, 
        text: isArabic ? 'تم الشحن' : 'Shipped',
        icon: Truck
      },
      delivered: { 
        variant: 'default' as const, 
        text: isArabic ? 'تم التسليم' : 'Delivered',
        icon: CheckCircle
      },
      cancelled: { 
        variant: 'destructive' as const, 
        text: isArabic ? 'ملغي' : 'Cancelled',
        icon: XCircle
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return <Badge variant="secondary">{status}</Badge>

    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
  }

  const getTotalStats = () => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const confirmed = orders.filter(o => o.status === 'confirmed').length
    const shipped = orders.filter(o => o.status === 'shipped').length
    const delivered = orders.filter(o => o.status === 'delivered').length
    const revenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0)

    return { total, pending, confirmed, shipped, delivered, revenue }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">{isArabic ? 'جارٍ التحميل...' : 'Loading orders...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة الطلبات' : 'Order Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة ومتابعة طلبات العملاء' : 'Manage and track customer orders'}
          </p>
        </div>
        <Button onClick={loadOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {isArabic ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'في الانتظار' : 'Pending'}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مؤكد' : 'Confirmed'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مشحون' : 'Shipped'}
            </CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مسلم' : 'Delivered'}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الإيرادات' : 'Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            {isArabic ? 'قائمة الطلبات' : 'Orders List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'البحث في الطلبات...' : 'Search orders...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              title={isArabic ? 'تصفية حسب الحالة' : 'Filter by status'}
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
              <option value="pending">{isArabic ? 'في الانتظار' : 'Pending'}</option>
              <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
              <option value="preparing">{isArabic ? 'قيد التحضير' : 'Preparing'}</option>
              <option value="shipped">{isArabic ? 'مشحون' : 'Shipped'}</option>
              <option value="delivered">{isArabic ? 'مسلم' : 'Delivered'}</option>
              <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد طلبات' : 'No orders found'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-medium">#{order.id}</h3>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {order.shipping_address.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {order.user_email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            ${order.total.toFixed(2)}
                          </div>
                        </div>

                        <div className="mt-2 text-sm">
                          <strong>{isArabic ? 'المنتجات:' : 'Items:'}</strong> {order.items.length} {isArabic ? 'منتج' : 'items'}
                          {order.items.length > 0 && (
                            <span className="ml-2">
                              ({order.items.map(item => `${item.name} (${item.quantity})`).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setDialogOpen(true)
                          }}
                        >
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                        
                        <select
                          className="px-2 py-1 text-sm border rounded"
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          title={isArabic ? 'تغيير حالة الطلب' : 'Change order status'}
                        >
                          <option value="pending">{isArabic ? 'في الانتظار' : 'Pending'}</option>
                          <option value="confirmed">{isArabic ? 'مؤكد' : 'Confirmed'}</option>
                          <option value="preparing">{isArabic ? 'قيد التحضير' : 'Preparing'}</option>
                          <option value="shipped">{isArabic ? 'مشحون' : 'Shipped'}</option>
                          <option value="delivered">{isArabic ? 'مسلم' : 'Delivered'}</option>
                          <option value="cancelled">{isArabic ? 'ملغي' : 'Cancelled'}</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل الطلب' : 'Order Details'} #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'معلومات مفصلة عن الطلب' : 'Detailed information about the order'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{isArabic ? 'معلومات الطلب' : 'Order Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>{isArabic ? 'رقم الطلب:' : 'Order ID:'}</strong> {selectedOrder.id}</div>
                    <div><strong>{isArabic ? 'الحالة:' : 'Status:'}</strong> {getStatusBadge(selectedOrder.status)}</div>
                    <div><strong>{isArabic ? 'تاريخ الطلب:' : 'Order Date:'}</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                    <div><strong>{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</strong> {selectedOrder.payment_method}</div>
                    {selectedOrder.tracking_number && (
                      <div><strong>{isArabic ? 'رقم التتبع:' : 'Tracking Number:'}</strong> {selectedOrder.tracking_number}</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{isArabic ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>{isArabic ? 'الاسم:' : 'Name:'}</strong> {selectedOrder.shipping_address.name}</div>
                    <div><strong>{isArabic ? 'البريد الإلكتروني:' : 'Email:'}</strong> {selectedOrder.user_email}</div>
                    <div><strong>{isArabic ? 'العنوان:' : 'Address:'}</strong></div>
                    <div className="ml-4 text-sm text-muted-foreground">
                      {selectedOrder.shipping_address.street}<br/>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.postal_code}<br/>
                      {selectedOrder.shipping_address.country}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{isArabic ? 'منتجات الطلب' : 'Order Items'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="font-medium">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الضريبة:' : 'Tax:'}</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isArabic ? 'الشحن:' : 'Shipping:'}</span>
                      <span>${selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
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
