import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Package, ShoppingBag, Users, AlertTriangle, BarChart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/hooks/useCurrency'
import { firestoreService, type Order, type Product } from '@/lib/firebase'
import toast from 'react-hot-toast'

interface AnalyticsData {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  lowStockProducts: Product[]
  topSellingProducts: { product: Product; salesCount: number }[]
  recentOrders: Order[]
  monthlyRevenue: number[]
  ordersByStatus: Record<string, number>
}

export default function InventoryAnalytics() {
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const isArabic = i18n.language === 'ar'

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockProducts: [],
    topSellingProducts: [],
    recentOrders: [],
    monthlyRevenue: [],
    ordersByStatus: {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalyticsDataAsync = async () => {
      try {
        setLoading(true)
        
        // Load all orders
        const ordersResult = await firestoreService.orders.list()
        const orders = ordersResult.items

        // Load all products
        const productsResult = await firestoreService.products.list()
        const allProducts = productsResult.items

        // Load all users
        const usersResult = await firestoreService.users.list()
        const allUsers = usersResult.items

        // Calculate analytics
        const totalRevenue = orders.reduce((sum, order) => {
          return sum + (order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)
        }, 0)

        const totalOrders = orders.length
        const totalProducts = allProducts.length
        const totalUsers = allUsers.length

        // Low stock products (stock < 10)
        const lowStockProducts = allProducts.filter((product: Product) => 
          (product.stock_quantity || product.stock || 0) < 10
        )

        // Orders by status
        const ordersByStatus = orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        // Recent orders (last 10)
        const recentOrders = orders
          .sort((a, b) => new Date(b.created_at || b.created || '').getTime() - new Date(a.created_at || a.created || '').getTime())
          .slice(0, 10)

        // Mock monthly revenue (in real app, this would be calculated from actual order dates)
        const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
          const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at || order.created || '')
            return orderDate.getMonth() === i
          })
          return monthOrders.reduce((sum, order) => {
            return sum + (order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)
          }, 0)
        })

        // Top selling products (mock calculation - would need order items data)
        const topSellingProducts = allProducts
          .slice(0, 5)
          .map((product: Product) => ({
            product,
            salesCount: Math.floor(Math.random() * 100) + 1 // Mock data
          }))
          .sort((a: any, b: any) => b.salesCount - a.salesCount)

        setAnalyticsData({
          totalRevenue,
          totalOrders,
          totalProducts,
          totalUsers,
          lowStockProducts,
          topSellingProducts,
          recentOrders,
          monthlyRevenue,
          ordersByStatus
        })

      } catch (error) {
        console.error('Error loading analytics data:', error)
        toast.error(isArabic ? 'خطأ في تحميل البيانات التحليلية' : 'Error loading analytics data')
      } finally {
        setLoading(false)
      }
    }

    loadAnalyticsDataAsync()
  }, [isArabic])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(analyticsData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              {isArabic ? 'نمو هذا الشهر' : 'Growth this month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'طلبات جديدة' : 'New orders'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المنتجات' : 'Products'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.lowStockProducts.length > 0 && (
                <>
                  <AlertTriangle className="h-3 w-3 inline mr-1 text-orange-500" />
                  {analyticsData.lowStockProducts.length} {isArabic ? 'مخزون منخفض' : 'low stock'}
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المستخدمون' : 'Users'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'مستخدمون نشطون' : 'Active users'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              {isArabic ? 'توزيع حالة الطلبات' : 'Order Status Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.ordersByStatus).map(([status, count]) => (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{status}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress 
                    value={(count / analyticsData.totalOrders) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {isArabic ? 'تنبيه المخزون المنخفض' : 'Low Stock Alert'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsData.lowStockProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                {isArabic ? 'جميع المنتجات في المخزون' : 'All products are in stock'}
              </p>
            ) : (
              <div className="space-y-4">
                {analyticsData.lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {isArabic ? (product.name_ar || product.name) : product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'المتبقي:' : 'Remaining:'} {product.stock_quantity || product.stock || 0}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {isArabic ? 'مخزون منخفض' : 'Low Stock'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'المنتجات الأكثر مبيعاً' : 'Top Selling Products'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'المنتج' : 'Product'}</TableHead>
                <TableHead>{isArabic ? 'المبيعات' : 'Sales'}</TableHead>
                <TableHead>{isArabic ? 'المخزون' : 'Stock'}</TableHead>
                <TableHead>{isArabic ? 'السعر' : 'Price'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.topSellingProducts.map(({ product, salesCount }) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {isArabic ? (product.name_ar || product.name) : product.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        SKU: {product.sku || product.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{salesCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`${(product.stock_quantity || product.stock || 0) < 10 ? 'text-orange-500' : ''}`}>
                      {product.stock_quantity || product.stock || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    {formatPrice(product.price_omr || product.price_usd || product.price_sar || 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'الطلبات الأخيرة' : 'Recent Orders'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
                <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                <TableHead>{isArabic ? 'الإجمالي' : 'Total'}</TableHead>
                <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analyticsData.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'delivered' ? 'default' :
                        order.status === 'shipped' ? 'secondary' :
                        order.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatPrice(order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at || order.created || '').toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
