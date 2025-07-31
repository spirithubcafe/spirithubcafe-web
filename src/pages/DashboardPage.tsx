import { useState, useEffect, useRef } from 'react'
import { 
  User, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Users,
  Package,
  BarChart3,
  TrendingUp,
  Tags,
  Menu,
  X,
  MessageSquare
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from 'react-i18next'
import type { Order } from '@/types'
import { firestoreService, type UserProfile, type Product } from '@/lib/firebase'
import { productsService } from '@/services/products'

// Dashboard Components
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import DashboardOrders from '@/components/dashboard/DashboardOrders'
import DashboardProfile from '@/components/dashboard/DashboardProfile'
import DashboardSettings from '@/components/dashboard/DashboardSettings'
import DashboardUsers from '@/components/dashboard/DashboardUsers'
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics'
import DashboardAdminOrders from '@/components/dashboard/DashboardAdminOrders'
import CategoryManagement from '@/components/admin/CategoryManagement'
import ProductManagement from '@/components/admin/ProductManagement'
import ReviewManagement from '@/components/admin/ReviewManagement'

export default function DashboardPage() {
  const { logout, currentUser } = useAuth()
  const user = currentUser
  const { i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const isArabic = i18n.language === 'ar'
  
  // Ref for main content container
  const mainContentRef = useRef<HTMLElement>(null)
  
  // Smooth scroll to top when tab changes
  useEffect(() => {
    const scrollToTop = () => {
      const container = mainContentRef.current
      if (container) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }
    }
    
    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToTop, 1000)
    
    return () => clearTimeout(timer)
  }, [activeTab])
  
  // State for data
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)
  const [loading, setLoading] = useState(true)

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
          
          // Fetch pending reviews count
          await loadPendingReviewsCount()
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

  // Load pending reviews count
  const loadPendingReviewsCount = async () => {
    try {
      const result = await firestoreService.reviews.list()
      const pendingCount = result.items.filter(review => !review.is_approved).length
      setPendingReviewsCount(pendingCount)
    } catch (error) {
      console.error('Error loading pending reviews count:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleUsersUpdate = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers)
  }

  // Define navigation items
  const navigationItems = [
    {
      id: 'overview',
      label: isArabic ? 'نظرة عامة' : 'Overview',
      icon: BarChart3,
      show: true
    },
    {
      id: 'orders',
      label: isArabic ? 'الطلبات' : 'Orders',
      icon: ShoppingBag,
      show: true
    },
    {
      id: 'profile',
      label: isArabic ? 'الملف الشخصي' : 'Profile',
      icon: User,
      show: true
    },
    {
      id: 'settings',
      label: isArabic ? 'الإعدادات' : 'Settings',
      icon: Settings,
      show: true
    },
    ...(user && user.role === 'admin' ? [
      {
        id: 'users',
        label: isArabic ? 'المستخدمين' : 'Users',
        icon: Users,
        show: true
      },
      {
        id: 'products',
        label: isArabic ? 'المنتجات' : 'Products',
        icon: Package,
        show: true
      },
      {
        id: 'categories',
        label: isArabic ? 'الفئات' : 'Categories',
        icon: Tags,
        show: true
      },
      {
        id: 'admin-orders',
        label: isArabic ? 'كل الطلبات' : 'All Orders',
        icon: ShoppingBag,
        show: true
      },
      {
        id: 'analytics',
        label: isArabic ? 'التحليلات' : 'Analytics',
        icon: TrendingUp,
        show: true
      },
      {
        id: 'reviews',
        label: isArabic ? 'المراجعات' : 'Reviews',
        icon: MessageSquare,
        show: true,
        badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined
      }
    ] : [])
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview orders={orders} products={products} />
      case 'orders':
        return <DashboardOrders orders={orders} />
      case 'profile':
        return user && <DashboardProfile user={user} />
      case 'settings':
        return <DashboardSettings />
      case 'users':
        return user?.role === 'admin' && (
          <DashboardUsers 
            users={users} 
            onUsersUpdate={handleUsersUpdate} 
            loading={loading} 
          />
        )
      case 'products':
        return user?.role === 'admin' && <ProductManagement />
      case 'categories':
        return user?.role === 'admin' && <CategoryManagement />
      case 'admin-orders':
        return user?.role === 'admin' && <DashboardAdminOrders />
      case 'analytics':
        return user?.role === 'admin' && (
          <DashboardAnalytics users={users} products={products} />
        )
      case 'reviews':
        return user?.role === 'admin' && <ReviewManagement />
      default:
        return <DashboardOverview orders={orders} products={products} />
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
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden lg:flex lg:flex-col h-full">
          <div className="p-6 flex-1">
            <h2 className="text-lg font-semibold mb-6">
              {isArabic ? 'لوحة التحكم' : 'Dashboard'}
            </h2>
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="destructive" className="h-5 min-w-[20px] text-xs flex items-center justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 bg-card border-r border-border">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        activeTab === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="h-5 min-w-[20px] text-xs flex items-center justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 min-w-0 h-screen overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Menu Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
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
                        : user.role === 'employee'
                        ? (isArabic ? 'موظف' : 'Employee')
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

            {/* Tab Content */}
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
