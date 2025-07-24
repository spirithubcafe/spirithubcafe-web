import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
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
  Truck,
  Crown,
  Briefcase
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'
import { useCurrency } from '@/components/currency-provider'
import type { Order, Product } from '@/types'
import { firestoreService, type UserProfile } from '@/lib/firebase'
import { productsService } from '@/services/products'

export default function DashboardPage() {
  const { logout, currentUser } = useAuth()
  const user = currentUser
  const { t, i18n } = useTranslation()
  const { formatPrice } = useCurrency()
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'
  
  // State for data
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  // State for user editing
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch user orders
        if (user?.id) {
          const userOrders = await firestoreService.orders.list(user.id)
          setOrders(userOrders.items as unknown as Order[])
        }

        // Fetch featured products
        const featuredProducts = await productsService.getFeaturedProducts(10)
        // Ensure products match the local Product type
        setProducts(featuredProducts.map((p: any) => ({
          ...p,
          stock: p.stock ?? 0,
          low_stock_threshold: p.low_stock_threshold ?? 0,
          featured: p.featured ?? false,
          bestseller: p.bestseller ?? false,
          price_omr: p.price_omr ?? 0,
          price_usd: p.price_usd ?? 0,
          price_sar: p.price_sar ?? 0,
          name_ar: p.name_ar ?? '',
        })))

        // Fetch users (admin only)
        if (user?.role === 'admin') {
          const allUsers = await firestoreService.users.list()
          setUsers(allUsers.items)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user])

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

  // Helper functions for user management
  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
      case 'shop_owner':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
      case 'employee':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3" />
      case 'shop_owner':
        return <Coffee className="h-3 w-3" />
      case 'employee':
        return <Briefcase className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const formatUserDate = (date: Date) => {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  // User management handlers
  const handleUserEdit = (userToEdit: UserProfile) => {
    setSelectedUser(userToEdit)
    setEditDialogOpen(true)
  }

  const handleUserView = (userToView: UserProfile) => {
    setSelectedUser(userToView)
    setViewDialogOpen(true)
  }

  const handleUpdateUser = async (formData: Partial<UserProfile>) => {
    if (!selectedUser) return

    try {
      setEditLoading(true)
      
      const success = await firestoreService.users.update(selectedUser.id, formData)
      
      if (success) {
        // Refresh users list
        if (user?.role === 'admin') {
          const allUsers = await firestoreService.users.list()
          setUsers(allUsers.items)
        }
        
        setEditDialogOpen(false)
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setEditLoading(false)
    }
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
                <AvatarImage src={user.avatar} alt={user.full_name} />
                <AvatarFallback>
                  {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">
                  {isArabic ? `مرحباً ${user.full_name}` : `Welcome ${user.full_name}`}
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8 gap-2 h-auto p-2 mb-4">
            <TabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm text-center">
                {isArabic ? 'نظرة عامة' : 'Overview'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm text-center">
                {isArabic ? 'الطلبات' : 'Orders'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
              <User className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm text-center">
                {isArabic ? 'الملف الشخصي' : 'Profile'}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
              <Settings className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm text-center">
                {isArabic ? 'الإعدادات' : 'Settings'}
              </span>
            </TabsTrigger>
            {user && user.role === 'admin' && (
              <>
                <TabsTrigger value="users" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm text-center">
                    {isArabic ? 'المستخدمين' : 'Users'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
                  <Package className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm text-center">
                    {isArabic ? 'المنتجات' : 'Products'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="admin-orders" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm text-center">
                    {isArabic ? 'كل الطلبات' : 'All Orders'}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 py-3 h-auto">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-xs sm:text-sm text-center">
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
                  {loading ? (
                    <div className="text-center py-8">
                      <p>{t('common.loading')}</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.slice(0, 3).map((order) => (
                      <div key={order.id} className={`flex items-center justify-between p-4 border rounded-lg ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center">
                            <Coffee className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString(isArabic ? 'ar' : 'en')}
                            </p>
                          </div>
                        </div>
                        <div className={`flex flex-col items-end ${isArabic ? 'items-start text-left' : 'text-right'}`}> 
                          <Badge className={getStatusColor(order.status) + ' mb-3 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm'} style={{alignSelf: isArabic ? 'flex-start' : 'flex-end'}}>
                            {getStatusText(order.status)}
                          </Badge>
                          <p className="text-sm font-medium currency">
                            {formatPrice(order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{isArabic ? 'لا توجد طلبات' : 'No orders yet'}</p>
                    </div>
                  )}
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
                  {loading ? (
                    <div className="text-center py-8">
                      <p>{t('common.loading')}</p>
                    </div>
                  ) : orders.length > 0 ? (
                    orders.map((order) => (
                      <div key={order.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
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
                            <p className="font-medium">#{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString(isArabic ? 'ar' : 'en')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.items?.length || 0} {isArabic ? 'عنصر' : 'items'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                        <Badge className={getStatusColor(order.status) + ' mb-3 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm'} style={{alignSelf: isArabic ? 'flex-start' : 'flex-end'}}>
                          {getStatusText(order.status)}
                        </Badge>
                          <p className="text-lg font-medium mt-1 currency">
                            {formatPrice(order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Order Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm">
                          {isArabic ? 'تتبع الطلب' : 'Track Order'}
                        </Button>
                        <Button variant="outline" size="sm">
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                        <Button variant="outline" size="sm">
                          {isArabic ? 'فتح تذكرة دعم' : 'Open Support Ticket'}
                        </Button>
                        {order.status === 'delivered' && (
                          <Button variant="outline" size="sm">
                            {isArabic ? 'تقييم الطلب' : 'Rate Order'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Order Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{isArabic ? 'حالة الطلب' : 'Order Status'}</span>
                          <span className="font-medium">
                            {order.status === 'delivered' ? (isArabic ? 'مكتمل' : 'Completed') :
                             order.status === 'shipped' ? (isArabic ? 'في الطريق' : 'In Transit') :
                             (isArabic ? 'قيد التجهيز' : 'Processing')}
                          </span>
                        </div>
                        <Progress 
                          value={order.status === 'delivered' ? 100 : order.status === 'shipped' ? 70 : 30} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{isArabic ? 'لا توجد طلبات' : 'No orders yet'}</p>
                    </div>
                  )}
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
                        {user.full_name}
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
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-6 border border-border rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-2 ring-primary/20 shadow-sm">
                        <AvatarImage src={user?.avatar} alt={user?.full_name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {user?.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{user?.full_name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{user?.email}</p>
                      {user?.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {user.phone}
                        </p>
                      )}
                      <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyles(user?.role || 'user')}`}>
                        {getRoleIcon(user?.role || 'user')}
                        <span>
                          {user?.role === 'admin' 
                            ? (isArabic ? 'مدير النظام' : 'Admin')
                            : user?.role === 'shop_owner'
                            ? (isArabic ? 'مالك متجر' : 'Shop Owner')
                            : user?.role === 'employee'
                            ? (isArabic ? 'موظف المتجر' : 'Shop Employee')
                            : (isArabic ? 'مستخدم' : 'User')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => user && handleUserEdit(user)}
                    className="hover:bg-primary hover:text-primary-foreground"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                  </Button>
                </div>
              </CardContent>
            </Card>

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

          {/* Admin Analytics Tab */}
          {user && user.role === 'admin' && (
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

              {/* Sales Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'مخطط المبيعات' : 'Sales Chart'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'أداء المبيعات على مدار الشهر' : 'Sales performance over the month'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        {isArabic ? 'سيتم إضافة المخطط قريباً' : 'Chart will be added soon'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isArabic ? 'أفضل المنتجات مبيعاً' : 'Top Selling Products'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <p>{t('common.loading')}</p>
                      </div>
                    ) : products.length > 0 ? (
                      products.slice(0, 5).map((product, index) => (
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
                                {isArabic ? (product.name_ar || product.name) : product.name}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{isArabic ? 'منتج متميز' : 'Featured product'}</span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  4.5
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium currency">{formatPrice(product.price_omr || product.price_usd || product.price_sar || 0)}</p>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? 'السعر' : 'Price'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{isArabic ? 'لا توجد منتجات' : 'No products yet'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin Products Tab */}
          {user && user.role === 'admin' && (
            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {isArabic ? 'إدارة المنتجات' : 'Product Management'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'إدارة المنتجات والمخزون' : 'Manage products and inventory'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {isArabic ? 'قائمة المنتجات' : 'Product List'}
                      </h3>
                      <Button>
                        {isArabic ? 'إضافة منتج جديد' : 'Add New Product'}
                      </Button>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <p>{t('common.loading')}</p>
                      </div>
                    ) : products.length > 0 ? (
                      products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center">
                              <Coffee className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {isArabic ? (product.name_ar || product.name) : product.name}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{isArabic ? 'منتج متميز' : 'Featured product'}</span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  4.5
                                </span>
                                <span>{isArabic ? 'منتج نشط' : 'Active'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium currency">{formatPrice(product.price_omr || product.price_usd || product.price_sar || 0)}</p>
                            <p className="text-sm text-muted-foreground">
                              {isArabic ? 'السعر' : 'Price'}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm">
                                {isArabic ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button variant="ghost" size="sm">
                                {isArabic ? 'حذف' : 'Delete'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{isArabic ? 'لا توجد منتجات' : 'No products yet'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin Users Tab */}
          {user && user.role === 'admin' && (
            <TabsContent value="users" className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {isArabic ? 'إجمالي المستخدمين' : 'Total Users'}
                        </p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                        <Crown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {isArabic ? 'المديرين' : 'Admins'}
                        </p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => u.role === 'admin').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                        <Coffee className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {isArabic ? 'أصحاب المتاجر' : 'Shop Owners'}
                        </p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => u.role === 'shop_owner').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-950 rounded-lg">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {isArabic ? 'موظفو المتجر' : 'Shop Employees'}
                        </p>
                        <p className="text-2xl font-bold">
                          {users.filter(u => u.role === 'employee').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {isArabic ? 'إدارة المستخدمين' : 'User Management'}
                        {!loading && (
                          <Badge variant="secondary" className="ml-2">
                            {users.length}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {isArabic ? 'إدارة حسابات المستخدمين والأدوار' : 'Manage user accounts and roles'}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (user?.role === 'admin') {
                          setLoading(true)
                          firestoreService.users.list().then(result => {
                            setUsers(result.items)
                            setLoading(false)
                          })
                        }
                      }}
                      disabled={loading}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {isArabic ? 'تحديث' : 'Refresh'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
                        </div>
                      </div>
                    ) : users.length > 0 ? (
                      <div className="space-y-3">
                        {users.map((dbUser) => (
                          <div 
                            key={dbUser.id} 
                            className="group relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/30 hover:bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                {/* Avatar */}
                                <div className="relative">
                                  <Avatar className="h-14 w-14 ring-2 ring-background shadow-sm">
                                    <AvatarImage src={dbUser.avatar} alt={dbUser.full_name} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                      {dbUser.full_name.split(' ').map((n: string) => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  </div>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-lg text-foreground mb-1 truncate">
                                        {dbUser.full_name}
                                      </h3>
                                      <p className="text-sm text-muted-foreground mb-2 truncate">
                                        {dbUser.email}
                                      </p>
                                    </div>
                                    
                                    {/* Role Badge */}
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getRoleBadgeStyles(dbUser.role)}`}>
                                      {getRoleIcon(dbUser.role)}
                                      <span>
                                        {dbUser.role === 'admin' 
                                          ? (isArabic ? 'مدير النظام' : 'Admin')
                                          : dbUser.role === 'shop_owner'
                                          ? (isArabic ? 'مالك متجر' : 'Shop Owner')
                                          : dbUser.role === 'employee'
                                          ? (isArabic ? 'موظف المتجر' : 'Shop Employee')
                                          : (isArabic ? 'مستخدم' : 'User')
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  {/* Additional Info */}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    {dbUser.phone && (
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {dbUser.phone}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {isArabic ? 'انضم في' : 'Joined'} {formatUserDate(dbUser.created)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 ml-4">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleUserView(dbUser)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <User className="h-4 w-4 mr-1" />
                                  {isArabic ? 'عرض' : 'View'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleUserEdit(dbUser)}
                                  className="hover:bg-primary hover:text-primary-foreground"
                                >
                                  <Settings className="h-4 w-4 mr-1" />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">
                          {isArabic ? 'لا يوجد مستخدمون' : 'No users found'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {isArabic ? 'لم يتم العثور على أي مستخدمين في النظام' : 'No users have been found in the system'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Admin All Orders Tab */}
          {user && user.role === 'admin' && (
            <TabsContent value="admin-orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    {isArabic ? 'جميع الطلبات' : 'All Orders'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'إدارة جميع طلبات المستخدمين' : 'Manage all user orders'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <p>{t('common.loading')}</p>
                      </div>
                    ) : orders.length > 0 ? (
                      orders.map((order) => (
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
                              <p className="font-medium">#{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {isArabic ? 'عميل: ' : 'Customer: '}{order.customer_name || order.customer_email || 'N/A'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString(isArabic ? 'ar' : 'en')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(order.status) + ' mb-3 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm'} style={{alignSelf: isArabic ? 'flex-start' : 'flex-end'}}>
                              {getStatusText(order.status)}
                            </Badge>
                            <p className="text-lg font-medium mt-1 currency">
                              {formatPrice(order.total_price_omr || order.total_price_usd || order.total_price_sar || 0)}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button variant="outline" size="sm">
                                {isArabic ? 'تحديث' : 'Update'}
                              </Button>
                              <Button variant="ghost" size="sm">
                                {isArabic ? 'عرض' : 'View'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">{isArabic ? 'لا توجد طلبات' : 'No orders yet'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* User Edit Dialog */}
        <UserEditDialog
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleUpdateUser}
          loading={editLoading}
          isArabic={isArabic}
          currentUserRole={user?.role}
          currentUserId={user?.id}
        />

        {/* User View Dialog */}
        <UserViewDialog
          user={selectedUser}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          isArabic={isArabic}
        />
      </div>
    </div>
  )
}

// User Edit Dialog Component
interface UserEditDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<UserProfile>) => Promise<void>
  loading: boolean
  isArabic: boolean
  currentUserRole?: string
  currentUserId?: string
}

function UserEditDialog({ user, open, onOpenChange, onSave, loading, isArabic, currentUserRole, currentUserId }: UserEditDialogProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'user' as 'admin' | 'shop_owner' | 'employee' | 'user'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user'
      })
    }
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const isAdmin = currentUserRole === 'admin'
  const isEditingSelf = user?.id === currentUserId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'تعديل المستخدم' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'تحديث معلومات المستخدم' : 'Update user information'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              {isArabic ? 'الاسم الكامل' : 'Full Name'}
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              {isArabic ? 'البريد الإلكتروني' : 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={!isAdmin || isEditingSelf} // Only admin can change email, but not their own
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {isArabic ? 'رقم الهاتف' : 'Phone Number'}
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          {/* Role selection - only admin can edit roles and not their own */}
          {isAdmin && !isEditingSelf && (
            <div className="space-y-2">
              <Label htmlFor="role">
                {isArabic ? 'الدور' : 'Role'}
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'shop_owner' | 'employee' | 'user') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    {isArabic ? 'مستخدم' : 'User'}
                  </SelectItem>
                  <SelectItem value="employee">
                    {isArabic ? 'موظف المتجر' : 'Shop Employee'}
                  </SelectItem>
                  <SelectItem value="shop_owner">
                    {isArabic ? 'مالك متجر' : 'Shop Owner'}
                  </SelectItem>
                  <SelectItem value="admin">
                    {isArabic ? 'مدير' : 'Admin'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...') 
                : (isArabic ? 'حفظ' : 'Save')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// User View Dialog Component
interface UserViewDialogProps {
  user: UserProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isArabic: boolean
}

function UserViewDialog({ user, open, onOpenChange, isArabic }: UserViewDialogProps) {
  if (!user) return null

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return isArabic ? 'مدير' : 'Admin'
      case 'shop_owner':
        return isArabic ? 'مالك متجر' : 'Shop Owner'
      case 'employee':
        return isArabic ? 'موظف المتجر' : 'Shop Employee'
      default:
        return isArabic ? 'مستخدم' : 'User'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isArabic ? 'عرض المستخدم' : 'View User'}
          </DialogTitle>
          <DialogDescription>
            {isArabic ? 'معلومات المستخدم' : 'User information'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.full_name} />
              <AvatarFallback className="text-lg">
                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.full_name}</h3>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {getRoleText(user.role)}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <p className="text-sm">{user.email}</p>
            </div>

            {user.phone && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  {isArabic ? 'رقم الهاتف' : 'Phone'}
                </Label>
                <p className="text-sm">{user.phone}</p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'تاريخ الانضمام' : 'Joined Date'}
              </Label>
              <p className="text-sm">{formatDate(user.created)}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                {isArabic ? 'آخر تحديث' : 'Last Updated'}
              </Label>
              <p className="text-sm">{formatDate(user.updated)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            {isArabic ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
