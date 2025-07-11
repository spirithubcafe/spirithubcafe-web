import { useState } from 'react'
import { 
  User, 
  ShoppingBag, 
  Heart, 
  Settings, 
  CreditCard, 
  MapPin, 
  Bell, 
  LogOut,
  Users,
  Package,
  BarChart3,
  Coffee,
  DollarSign,
  TrendingUp,
  Star,
  MessageSquare,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'

const DEMO_ORDERS = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 45.99,
    items: 3
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'shipped',
    total: 28.50,
    items: 2
  },
  {
    id: 'ORD-003',
    date: '2024-01-05',
    status: 'processing',
    total: 67.25,
    items: 4
  }
]

const DEMO_PRODUCTS = [
  {
    id: 1,
    name: 'Premium Coffee Blend',
    nameAr: 'خليط القهوة المتميز',
    sales: 150,
    revenue: 2250,
    rating: 4.8,
    reviews: 24
  },
  {
    id: 2,
    name: 'Espresso Roast',
    nameAr: 'تحميص إسبريسو',
    sales: 89,
    revenue: 1335,
    rating: 4.6,
    reviews: 18
  },
  {
    id: 3,
    name: 'Cold Brew Special',
    nameAr: 'خاص القهوة الباردة',
    sales: 73,
    revenue: 1095,
    rating: 4.7,
    reviews: 15
  }
]

export default function DashboardPage() {
  const { auth, logout } = useAuth()
  const user = auth.user
  const { i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      delivered: isArabic ? 'تم التوصيل' : 'Delivered',
      shipped: isArabic ? 'تم الشحن' : 'Shipped',
      processing: isArabic ? 'قيد المعالجة' : 'Processing'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <User className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-bold">
                {isArabic ? 'يرجى تسجيل الدخول' : 'Please login'}
              </h1>
              <Button asChild>
                <Link to="/login">
                  {isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {isArabic ? `مرحباً ${user.name}` : `Welcome ${user.name}`}
                </h1>
                <p className="text-muted-foreground">
                  {user.role === 'admin' 
                    ? (isArabic ? 'مدير النظام' : 'System Administrator')
                    : (isArabic ? 'عضو' : 'Member')
                  }
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              {isArabic ? 'تسجيل الخروج' : 'Logout'}
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'نظرة عامة' : 'Overview'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'الطلبات' : 'Orders'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'الملف الشخصي' : 'Profile'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isArabic ? 'الإعدادات' : 'Settings'}
              </span>
            </TabsTrigger>
            {user.role === 'admin' && (
              <>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isArabic ? 'المنتجات' : 'Products'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {isArabic ? 'التحليلات' : 'Analytics'}
                  </span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? '+2 من الشهر الماضي' : '+2 from last month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? 'إجمالي المبلغ' : 'Total Spent'}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold currency">{formatPrice(342.75)}</div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? '+12% من الشهر الماضي' : '+12% from last month'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? 'المفضلة' : 'Wishlist'}
                  </CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? '3 منتجات جديدة' : '3 new products'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {isArabic ? 'نقاط الولاء' : 'Loyalty Points'}
                  </CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">850</div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? 'مستوى الذهب' : 'Gold Level'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'الطلبات الأخيرة' : 'Recent Orders'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_ORDERS.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center">
                          <Coffee className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString(isArabic ? 'ar' : 'en')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-sm font-medium mt-1 currency">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'جميع الطلبات' : 'All Orders'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'تاريخ جميع طلباتك' : 'History of all your orders'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_ORDERS.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center">
                          {order.status === 'delivered' ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : order.status === 'shipped' ? (
                            <Truck className="h-6 w-6 text-blue-600" />
                          ) : (
                            <Clock className="h-6 w-6 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString(isArabic ? 'ar' : 'en')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.items} {isArabic ? 'عنصر' : 'items'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <p className="text-lg font-medium mt-1 currency">
                          {formatPrice(order.total)}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-2">
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{isArabic ? 'الاسم' : 'Name'}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{isArabic ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{isArabic ? 'الموقع' : 'Location'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'بغداد، العراق' : 'Baghdad, Iraq'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'الإحصائيات' : 'Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{isArabic ? 'مستوى الولاء' : 'Loyalty Level'}</span>
                      <span className="text-sm font-medium">
                        {isArabic ? 'ذهبي' : 'Gold'}
                      </span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? '150 نقطة للمستوى التالي' : '150 points to next level'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{isArabic ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                      <span className="text-sm font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{isArabic ? 'إجمالي المبلغ' : 'Total Spent'}</span>
                      <span className="text-sm font-medium currency">{formatPrice(342.75)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{isArabic ? 'تاريخ الانضمام' : 'Member Since'}</span>
                      <span className="text-sm font-medium">
                        {isArabic ? 'يناير 2024' : 'January 2024'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? 'الإعدادات' : 'Settings'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'إدارة تفضيلاتك وإعدادات الحساب' : 'Manage your preferences and account settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'تلقي إشعارات حول الطلبات والعروض' : 'Receive notifications about orders and offers'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تمكين' : 'Enable'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? 'إشعارات الرسائل القصيرة' : 'SMS Notifications'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'تلقي رسائل نصية عن حالة الطلبات' : 'Receive SMS about order status'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تعطيل' : 'Disable'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? 'عنوان الشحن الافتراضي' : 'Default Shipping Address'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'إدارة عناوين الشحن' : 'Manage shipping addresses'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تحرير' : 'Edit'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Products Tab */}
          {user.role === 'admin' && (
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'إدارة المنتجات' : 'Product Management'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'إدارة المنتجات والمخزون' : 'Manage products and inventory'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_PRODUCTS.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                            <Coffee className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {isArabic ? product.nameAr : product.name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{product.sales} {isArabic ? 'مبيعات' : 'sales'}</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {product.rating}
                              </span>
                              <span>{product.reviews} {isArabic ? 'تقييم' : 'reviews'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium currency">{formatPrice(product.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin Analytics Tab */}
          {user.role === 'admin' && (
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isArabic ? 'إجمالي المبيعات' : 'Total Sales'}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold currency">{formatPrice(12450)}</div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? '+25% من الشهر الماضي' : '+25% from last month'}
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
                    <div className="text-2xl font-bold">147</div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? '+12% من الشهر الماضي' : '+12% from last month'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isArabic ? 'عدد العملاء' : 'Customers'}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89</div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? '+8 عملاء جدد' : '+8 new customers'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {isArabic ? 'المنتجات النشطة' : 'Active Products'}
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? '4 منتجات جديدة' : '4 new products'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'أفضل المنتجات مبيعاً' : 'Top Selling Products'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {DEMO_PRODUCTS.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                            <Coffee className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {isArabic ? product.nameAr : product.name}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{product.sales} {isArabic ? 'مبيعات' : 'sales'}</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {product.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium currency">{formatPrice(product.revenue)}</p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'إيرادات' : 'Revenue'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
