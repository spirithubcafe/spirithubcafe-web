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
  MessageSquare,
  Globe,
  Presentation,
  FileText,
  Phone,
  CreditCard
} from 'lucide-react'
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
import CategoryManagement from '@/components/admin/CategoryManagement'
import ProductManagement from '@/components/admin/ProductManagement'
import ReviewManagement from '@/components/admin/ReviewManagement'
import OrderManagement from '@/components/admin/OrderManagement'
import InventoryAnalytics from '@/components/admin/InventoryAnalytics'
import { FooterManagement } from '@/components/admin/FooterManagement'
import { HeroSlideManagement } from '@/components/admin/HeroSlideManagement'
import PagesManagement from '@/components/admin/PagesManagement'
import HomepageManagement from '@/components/admin/HomepageManagement'
import { ContactManagement } from '@/components/admin/ContactManagement'
import { AboutManagement } from '@/components/admin/AboutManagement'
import CheckoutSettingsPage from '@/pages/CheckoutSettingsPage'

export default function DashboardPage() {
  const { logout, currentUser } = useAuth()
  const user = currentUser
  const { t, i18n } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isArabic = i18n.language === 'ar'

  // Ref for main content container
  const mainContentRef = useRef<HTMLElement>(null)

  // Update activeTab when URL params change
  // Removed URL sync for simpler tab management

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
    const timer = setTimeout(scrollToTop, 100)

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
    window.location.href = '/'
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
        id: 'hero-slider',
        label: isArabic ? 'شريط العرض الرئيسي' : 'Hero Slider',
        icon: Presentation,
        show: true
      },
      {
        id: 'categories',
        label: isArabic ? 'الفئات' : 'Categories',
        icon: Tags,
        show: true
      },
      {
        id: 'products',
        label: isArabic ? 'المنتجات' : 'Products',
        icon: Package,
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
        id: 'inventory',
        label: isArabic ? 'المخزون والتقارير' : 'Inventory & Reports',
        icon: BarChart3,
        show: true
      },
      {
        id: 'reviews',
        label: isArabic ? 'المراجعات' : 'Reviews',
        icon: MessageSquare,
        show: true,
        badge: pendingReviewsCount > 0 ? pendingReviewsCount : undefined
      },
      {
        id: 'homepage-settings',
        label: isArabic ? 'إعدادات الصفحة الرئيسية' : 'Homepage Settings',
        icon: Settings,
        show: true
      },
      {
        id: 'footer',
        label: t('dashboard.admin.footerSettings'),
        icon: Globe,
        show: true
      },
      {
        id: 'pages',
        label: isArabic ? 'إدارة الصفحات' : 'Pages Management',
        icon: FileText,
        show: true
      },
      {
        id: 'checkout-settings',
        label: isArabic ? 'إعدادات الدفع والشحن' : 'Checkout Settings',
        icon: CreditCard,
        show: true
      },
      {
        id: 'contact',
        label: t('dashboard.tabs.contact'),
        icon: Phone,
        show: true
      },
      {
        id: 'about',
        label: t('dashboard.tabs.about'),
        icon: FileText,
        show: true
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
      case 'hero-slider':
        return user?.role === 'admin' && <HeroSlideManagement />
      case 'categories':
        return user?.role === 'admin' && <CategoryManagement />
      case 'homepage-settings':
        return user?.role === 'admin' && <HomepageManagement />
      case 'products':
        return user?.role === 'admin' && <ProductManagement />
      case 'admin-orders':
        return user?.role === 'admin' && <OrderManagement />
      case 'analytics':
        return user?.role === 'admin' && (
          <DashboardAnalytics users={users} products={products} />
        )
      case 'inventory':
        return user?.role === 'admin' && (
          <InventoryAnalytics />
        )
      case 'reviews':
        return user?.role === 'admin' && <ReviewManagement />
      case 'footer':
        return user?.role === 'admin' && <FooterManagement />
      case 'pages':
        return user?.role === 'admin' && <PagesManagement />
      case 'checkout-settings':
        return user?.role === 'admin' && <CheckoutSettingsPage />
      case 'contact':
        return user?.role === 'admin' && <ContactManagement />
      case 'about':
        return user?.role === 'admin' && <AboutManagement />
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
              <Button onClick={() => window.location.href = '/login'}>
                {isArabic ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden xl:flex xl:flex-col h-screen overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-6">
              {isArabic ? 'لوحة التحكم' : 'Dashboard'}
            </h2>
            <nav className="space-y-2 pb-6">
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

        {/* Mobile Sidebar Overlay */}
        <div className={cn(
          "fixed inset-0 z-[100] xl:hidden",
          sidebarOpen ? "block" : "hidden"
        )}>
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 h-screen w-64 bg-card border-r border-border overflow-hidden z-[110]">
            <div className="h-full flex flex-col">
              <div className="p-6 border-b border-border flex-shrink-0">
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
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="space-y-2 pb-6">
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
            </div>
          </aside>
        </div>

        {/* Main Content */}
        <main ref={mainContentRef} className="flex-1 min-w-0 h-screen overflow-y-auto bg-background">
          <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-none">
            {/* Header */}
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
                  {/* Mobile Menu Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="xl:hidden flex-shrink-0"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>

                  <Avatar className="h-12 w-12 lg:h-16 lg:w-16 flex-shrink-0">
                    <AvatarImage src={user.avatar} alt={user.full_name} />
                    <AvatarFallback>
                      {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl lg:text-3xl font-bold truncate">
                      {isArabic ? `مرحباً ${user.full_name}` : `Welcome ${user.full_name}`}
                    </h1>
                    <p className="text-sm lg:text-base text-muted-foreground">
                      {user.role === 'admin'
                        ? (isArabic ? 'مدير النظام' : 'System Administrator')
                        : user.role === 'employee'
                          ? (isArabic ? 'موظف' : 'Employee')
                          : (isArabic ? 'عضو' : 'Member')
                      }
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="flex-shrink-0">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{isArabic ? 'تسجيل الخروج' : 'Logout'}</span>
                  <span className="sm:hidden">{isArabic ? 'خروج' : 'Exit'}</span>
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
