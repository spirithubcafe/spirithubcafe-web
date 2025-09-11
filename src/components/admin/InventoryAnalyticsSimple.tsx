import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  RefreshCw,
  Download
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { jsonDataService } from '@/services/jsonDataService'

interface InventoryItem {
  id: string
  name: string
  stock: number
  sold: number
  revenue: number
  category: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  lowStockItems: InventoryItem[]
  topSellingProducts: InventoryItem[]
  recentActivity: Array<{
    id: string
    type: 'order' | 'product' | 'user'
    message: string
    timestamp: string
  }>
}

export default function InventoryAnalytics() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [data, setData] = useState<AnalyticsData>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockItems: [],
    topSellingProducts: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Load products
      const products = await jsonDataService.fetchJSON('/data/products.json')
      const productsArray = Array.isArray(products) ? products : []
      
      // Load orders (simulated data since orders are complex)
      const orders = await jsonDataService.fetchJSON('/data/orders.json').catch(() => [])
      const ordersArray = Array.isArray(orders) ? orders : []
      
      // Load users
      const users = await jsonDataService.fetchJSON('/data/users.json').catch(() => [])
      const usersArray = Array.isArray(users) ? users : []

      // Calculate analytics
      const totalProducts = productsArray.length
      const totalOrders = ordersArray.length
      const totalUsers = usersArray.length
      
      // Calculate revenue from orders
      const totalRevenue = ordersArray.reduce((sum: number, order: any) => {
        return sum + (order.total || 0)
      }, 0)

      // Create inventory items from products
      const inventoryItems: InventoryItem[] = productsArray.map((product: any) => {
        const stock = product.stock || Math.floor(Math.random() * 100) + 1
        const sold = Math.floor(Math.random() * 50)
        const price = product.price || Math.floor(Math.random() * 100) + 10
        
        return {
          id: product.id,
          name: isArabic ? product.name_ar || product.name : product.name,
          stock,
          sold,
          revenue: sold * price,
          category: isArabic ? product.category_ar || product.category : product.category,
          status: stock === 0 ? 'out_of_stock' : 
                   stock < 10 ? 'low_stock' : 'in_stock'
        }
      })

      // Get low stock items
      const lowStockItems = inventoryItems
        .filter(item => item.status === 'low_stock' || item.status === 'out_of_stock')
        .slice(0, 5)

      // Get top selling products
      const topSellingProducts = inventoryItems
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5)

      // Generate recent activity (simulated)
      const recentActivity = [
        {
          id: '1',
          type: 'order' as const,
          message: isArabic ? 'طلب جديد تم إنشاؤه' : 'New order created',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
        },
        {
          id: '2',
          type: 'product' as const,
          message: isArabic ? 'منتج جديد تمت إضافته' : 'New product added',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
        },
        {
          id: '3',
          type: 'user' as const,
          message: isArabic ? 'مستخدم جديد سجل' : 'New user registered',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        },
        {
          id: '4',
          type: 'order' as const,
          message: isArabic ? 'طلب تم شحنه' : 'Order shipped',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
        },
        {
          id: '5',
          type: 'product' as const,
          message: isArabic ? 'مخزون منتج منخفض' : 'Product stock low',
          timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString()
        }
      ]

      setData({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        lowStockItems,
        topSellingProducts,
        recentActivity
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStockBadge = (status: string) => {
    const statusConfig = {
      in_stock: { 
        variant: 'default' as const, 
        text: isArabic ? 'متوفر' : 'In Stock' 
      },
      low_stock: { 
        variant: 'destructive' as const, 
        text: isArabic ? 'مخزون منخفض' : 'Low Stock' 
      },
      out_of_stock: { 
        variant: 'secondary' as const, 
        text: isArabic ? 'نفد المخزون' : 'Out of Stock' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? (
      <Badge variant={config.variant}>{config.text}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    )
  }

  const exportReport = () => {
    const reportData = {
      generated_at: new Date().toISOString(),
      summary: {
        total_products: data.totalProducts,
        total_orders: data.totalOrders,
        total_users: data.totalUsers,
        total_revenue: data.totalRevenue
      },
      low_stock_items: data.lowStockItems,
      top_selling_products: data.topSellingProducts
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `inventory-analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">{isArabic ? 'جارٍ التحميل...' : 'Loading analytics...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'تحليلات المخزون' : 'Inventory Analytics'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'نظرة شاملة على المخزون والمبيعات' : 'Comprehensive overview of inventory and sales'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المنتجات' : 'Total Products'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'منتج في المتجر' : 'products in store'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'طلب تم تسجيله' : 'orders placed'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي العملاء' : 'Total Customers'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'عميل مسجل' : 'registered customers'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'إجمالي المبيعات' : 'total sales'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-red-500" />
              {isArabic ? 'منتجات بمخزون منخفض' : 'Low Stock Items'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.lowStockItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {isArabic ? 'جميع المنتجات متوفرة بكمية كافية' : 'All products are well stocked'}
                </p>
              ) : (
                data.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.stock} {isArabic ? 'قطعة' : 'units'}</p>
                      {getStockBadge(item.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              {isArabic ? 'أكثر المنتجات مبيعاً' : 'Top Selling Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSellingProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  {isArabic ? 'لا توجد بيانات مبيعات' : 'No sales data available'}
                </p>
              ) : (
                data.topSellingProducts.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.sold} {isArabic ? 'مبيع' : 'sold'}</p>
                      <p className="text-sm text-muted-foreground">${item.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">
                  {activity.type === 'order' ? (isArabic ? 'طلب' : 'Order') :
                   activity.type === 'product' ? (isArabic ? 'منتج' : 'Product') :
                   (isArabic ? 'مستخدم' : 'User')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
