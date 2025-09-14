import { useState, useEffect, memo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, User, LogOut, ShoppingCart, Heart, Crown, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { UpdateToggle } from '@/components/update-toggle'
import { CartSidebar } from '@/components/cart-sidebar'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { usePendingOrders } from '@/hooks/usePendingOrders'
import { firestoreService, type Category } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme-provider'
import { useUpdateAvailable } from '@/hooks/useUpdateAvailable'

const NavigationComponent = memo(() => {
  const { t, i18n } = useTranslation()
  const { resolvedTheme } = useTheme()
  const auth = useAuth()
  const { logout } = auth
  const { getTotalItems, getTotalPrice } = useCart()
  const { wishlistCount } = useWishlist()
  const { pendingCount } = usePendingOrders()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const isArabic = i18n.language === 'ar'
  const updateAvailable = useUpdateAvailable()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  // Check if current page is HomePage
  const isHomePage = location.pathname === '/'

  // Handle scroll detection for HomePage
  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setIsScrolled(scrollTop > 0) // Consider scrolled if any scroll from top
    }

    // Set initial state - transparent by default on HomePage
    setIsScrolled(false)
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHomePage])

  // Load categories from Firestore
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const result = await firestoreService.categories.list()
        setCategories(result.items)
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const navigationItems = [
    { href: '/', label: t('navigation.home') },
    { href: '/about', label: t('navigation.about') },
    { href: '/contact', label: t('navigation.contact') },
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={cn(
          "sticky top-0 w-full nav-smooth-transition",
          "z-20", // higher than hero z-10
          mobileMenuOpen && "z-[60] shadow-2xl", // when mobile menu is open, ensure solid bg and higher z-index
          // Apply transparent background on HomePage when at top, but keep pointer events for controls
          isHomePage && !isScrolled
            ? "bg-transparent backdrop-blur-0 border-transparent shadow-none"
            : "nav-coffee border-b"
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
            
            {/* Logo - Always right for Arabic, left for English */}
            <div className={cn(
              "flex items-center gap-2 flex-shrink-0",
              isArabic ? "order-3" : "order-1"
            )}>
              <Link to="/" className={cn(
                "flex items-center gap-2 transition-all duration-500 ease-out logo-hover pointer-events-auto backdrop-blur-sm rounded-lg px-2 py-1",
                isHomePage && !isScrolled 
                  ? "hover:opacity-90 bg-white/20 hover:bg-white/30 border border-white/30"
                  : resolvedTheme === 'dark'
                    ? "hover:opacity-80 bg-black/40 hover:bg-black/60 border border-gray-700/30"
                    : "hover:opacity-80 bg-white/80 hover:bg-white/95 border border-gray-300/40"
              )}>
                <img 
                  src={resolvedTheme === 'dark' ? "/images/logo/logo-light.png" : "/images/logo/logo-dark.png"}
                  alt="SPIRITHUB ROASTERY Logo" 
                  className="h-12 w-auto object-contain no-flip transition-all duration-500 ease-out"
                />
              </Link>
            </div>

            {/* Desktop Navigation Links - Centered */}
            <div className={cn(
              "hidden md:flex items-center gap-1",
              isArabic ? "order-2" : "order-2"
            )}>
              {/* Home Link */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "nav-link h-9 px-4 py-2 font-medium pointer-events-auto transition-all duration-200",
                  "bg-[#1a0e0d] text-white border border-[#1a0e0d]",
                  "hover:bg-[#0f0705] hover:text-white",
                  isActive('/') && "bg-[#0f0705]"
                )}
              >
                <Link to="/">
                  {t('navigation.home')}
                </Link>
              </Button>
              
              {/* Shop Dropdown */}
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "nav-link h-9 px-4 py-2 font-medium pointer-events-auto transition-all duration-200 flex items-center gap-1",
                    "bg-[#1a0e0d] text-white border border-[#1a0e0d]",
                    "hover:bg-[#0f0705] hover:text-white",
                    location.pathname.startsWith('/shop') && "bg-[#0f0705]"
                  )}
                >
                  <Link to="/shop" className="flex items-center gap-1">
                    {t('navigation.shop')}
                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                  </Link>
                </Button>
                
                {/* Dropdown Menu */}
                <div 
                  className={cn(
                    "absolute top-full mt-1 w-64 bg-background border rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-auto",
                    isArabic ? "right-0" : "left-0"
                  )}
                >
                  <div className="p-2 space-y-1">
                    {/* All Products Link */}
                    <Link
                      to="/shop"
                      className={cn(
                        "dropdown-item block px-3 py-2 text-sm rounded-md hover:bg-[#1a0e0d] hover:text-white transition-colors text-gray-800 dark:text-gray-200 dark:hover:bg-[#1a0e0d] dark:hover:text-white",
                        isArabic ? "text-right" : "text-left"
                      )}
                    >
                      <div className="font-medium">
                        {isArabic ? 'جميع المنتجات' : 'All Products'}
                      </div>
                    </Link>
                    
                    {/* Categories Divider */}
                    {categories.length > 0 && (
                      <div className="border-t my-2" />
                    )}
                    
                    {/* Category Links */}
                    {loadingCategories ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {isArabic ? 'جارٍ التحميل...' : 'Loading...'}
                      </div>
                    ) : (
                      categories.slice(0, 6).map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop?category=${category.id}`}
                          className={cn(
                            "dropdown-item block px-3 py-2 text-sm rounded-md hover:bg-[#1a0e0d] hover:text-white transition-colors text-gray-800 dark:text-gray-200 dark:hover:bg-[#1a0e0d] dark:hover:text-white",
                            isArabic ? "text-right" : "text-left"
                          )}
                        >
                          <div className="font-medium">
                            {isArabic ? (category.name_ar || category.name) : category.name}
                          </div>
                        </Link>
                      ))
                    )}
                    
                    {/* Show more link if there are more than 6 categories */}
                    {categories.length > 6 && (
                      <>
                        <div className="border-t my-2" />
                        <Link
                          to="/shop"
                          className={cn(
                            "block px-3 py-2 text-sm rounded-md hover:bg-[#2a1812] hover:text-white transition-colors text-[#8B4513] dark:text-[#D2691E] font-medium dark:hover:bg-[#2a1812] dark:hover:text-white",
                            isArabic ? "text-right" : "text-left"
                          )}
                        >
                          {isArabic ? `عرض جميع الفئات (${categories.length})` : `View all categories (${categories.length})`}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Navigation Items */}
              {navigationItems.slice(1).map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "nav-link h-9 px-4 py-2 font-medium pointer-events-auto transition-all duration-200",
                    "bg-[#1a0e0d] text-white border border-[#1a0e0d]",
                    "hover:bg-[#0f0705] hover:text-white",
                    isActive(item.href) && "bg-[#0f0705]"
                  )}
                >
                  <Link to={item.href}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>

            {/* Right Side Controls - Left aligned for Arabic, Right for English */}
            <div className={cn(
              "flex items-center gap-2",
              isArabic ? "order-1 md:order-1" : "order-3"
            )}>
              {/* Settings Controls */}
              <div className="hidden sm:flex items-center gap-2">
                <ThemeToggle 
                  className="h-9 px-3 text-white border border-[#1a0e0d] hover:text-white transition-all duration-200 pointer-events-auto bg-[#1a0e0d] hover:bg-[#0f0705]"
                />
                <LanguageToggle 
                  className="h-9 px-3 text-white border border-[#1a0e0d] hover:text-white transition-all duration-200 pointer-events-auto bg-[#1a0e0d] hover:bg-[#0f0705]"
                />
                <CurrencyToggle 
                  className="h-9 px-3 text-white border border-[#1a0e0d] hover:text-white transition-all duration-200 pointer-events-auto bg-[#1a0e0d] hover:bg-[#0f0705]"
                />
                <UpdateToggle 
                  className="h-9 px-3 text-white border border-[#1a0e0d] hover:text-white transition-all duration-200 pointer-events-auto bg-[#1a0e0d] hover:bg-[#0f0705]"
                />
              </div>

              {/* Wishlist Button */}
              {auth.currentUser && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  asChild 
                  className="h-9 w-9 relative transition-all duration-200 pointer-events-auto bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white"
                >
                  <Link to="/wishlist">
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <Badge
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600"
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}

              {/* Cart */}
              <div className="pointer-events-auto">
                <CartSidebar />
              </div>

              {/* Auth Buttons */}
              {auth.currentUser ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                    className="h-9 px-4 py-2 font-medium pointer-events-auto transition-all duration-200 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white"
                  >
                    <Link to="/dashboard" className="flex items-center gap-2 relative">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:block">
                        {t('navigation.dashboard')}
                      </span>
                      {/* Show pending orders count for admin/staff */}
                      {(auth.currentUser?.role === 'admin' || auth.currentUser?.role === 'shop_owner' || auth.currentUser?.role === 'employee') && pendingCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {pendingCount > 99 ? '99+' : pendingCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="h-9 px-4 py-2 font-medium pointer-events-auto transition-all duration-200 bg-red-800 text-white border border-red-700 hover:bg-red-700 hover:border-red-600 hover:text-white dark:bg-red-800 dark:text-white dark:border-red-700 dark:hover:bg-red-700 dark:hover:border-red-600 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:block">
                      {t('navigation.logout')}
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="h-9 px-4 py-2 font-medium transition-all duration-200 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white"
                  >
                    <Link to="/login">{t('navigation.login')}</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    asChild 
                    className="h-9 px-4 py-2 font-medium transition-all duration-200 bg-[#2a1812] text-white border border-[#1a0e0d] hover:bg-[#1a0e0d] hover:text-white"
                  >
                    <Link to="/register">{t('navigation.register')}</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Language Toggle */}
              <div className="md:hidden pointer-events-auto">
                <LanguageToggle 
                  className="h-9 px-3 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white transition-all duration-200 pointer-events-auto"
                />
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="icon"
                className="md:hidden transition-all duration-200 pointer-events-auto h-9 w-9 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop without blur */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Content - Full edge positioning */}
          <div className={cn(
            "fixed top-16 bottom-0 mobile-menu-coffee border-t shadow-2xl",
            "animate-in duration-300 w-80 max-w-[calc(100vw-1rem)]",
            isArabic 
              ? "right-0 slide-in-from-right-2" 
              : "left-0 slide-in-from-left-2"
          )}>
            <div 
              className={cn(
                "flex flex-col h-full",
                isArabic ? "text-right" : "text-left"
              )}
              dir={isArabic ? "rtl" : "ltr"}
            >
              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {/* Main Navigation */}
                  <div className="space-y-2">
                    <h3 className={cn(
                      "text-sm font-semibold text-muted-foreground uppercase tracking-wider",
                      isArabic ? "text-right" : "text-left"
                    )}>
                      {t('navigation.menu', 'Menu')}
                    </h3>
                    <div className="space-y-2">
                      {/* Home Link */}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className={cn(
                          "w-full h-9 text-base font-medium mobile-nav-link",
                          "bg-[#1a0e0d] text-white border border-[#1a0e0d]",
                          "hover:bg-[#0f0705] hover:text-white",
                          isArabic ? "justify-end text-right" : "justify-start text-left",
                          isActive('/') && "bg-[#0f0705]"
                        )}
                        style={{ animationDelay: `0ms` }}
                      >
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className={cn(
                          "w-full flex",
                          isArabic ? "text-right justify-end" : "text-left justify-start"
                        )}>
                          {t('navigation.home')}
                        </Link>
                      </Button>
                      
                      {/* Shop with Categories in Mobile */}
                      <div className="space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className={cn(
                            "w-full h-9 text-base font-medium mobile-nav-link",
                            "bg-[#1a0e0d] text-white border border-[#1a0e0d]",
                            "hover:bg-[#0f0705] hover:text-white",
                            isArabic ? "justify-end text-right" : "justify-start text-left",
                            location.pathname.startsWith('/shop') && "bg-[#0f0705]"
                          )}
                          style={{ animationDelay: `50ms` }}
                        >
                          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className={cn(
                            "w-full flex",
                            isArabic ? "text-right justify-end" : "text-left justify-start"
                          )}>
                            {t('navigation.shop')}
                          </Link>
                        </Button>
                        
                        {/* Categories in Mobile */}
                        {categories.length > 0 && (
                          <div className={cn(
                            "ml-4 space-y-1",
                            isArabic ? "mr-4 ml-0" : "ml-4"
                          )}>
                            {categories.slice(0, 8).map((category, index) => (
                              <Button
                                key={category.id}
                                variant="ghost"
                                size="sm"
                                asChild
                                className={cn(
                                  "w-full h-8 text-sm font-normal mobile-nav-link",
                                  "bg-amber-800 text-amber-100 border border-amber-700",
                                  "hover:bg-amber-700 hover:border-amber-600 hover:text-white",
                                  "dark:bg-amber-800 dark:text-amber-100 dark:border-amber-700",
                                  "dark:hover:bg-amber-700 dark:hover:border-amber-600",
                                  isArabic ? "justify-end text-right" : "justify-start text-left"
                                )}
                                style={{ animationDelay: `${(index + 2) * 50}ms` }}
                              >
                                <Link 
                                  to={`/shop?category=${category.id}`} 
                                  onClick={() => setMobileMenuOpen(false)} 
                                  className={cn(
                                    "w-full flex",
                                    isArabic ? "text-right justify-end" : "text-left justify-start"
                                  )}
                                >
                                  <span className="truncate">
                                    {isArabic ? (category.name_ar || category.name) : category.name}
                                  </span>
                                </Link>
                              </Button>
                            ))}
                            
                            {categories.length > 8 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                                className={cn(
                                  "w-full h-8 text-sm font-normal mobile-nav-link",
                                  "bg-amber-600 text-white border border-amber-500",
                                  "hover:bg-amber-700 hover:border-amber-600 hover:text-white",
                                  "dark:bg-amber-600 dark:text-white dark:border-amber-500",
                                  "dark:hover:bg-amber-700 dark:hover:border-amber-600",
                                  isArabic ? "justify-end text-right" : "justify-start text-left"
                                )}
                              >
                                <Link 
                                  to="/shop" 
                                  onClick={() => setMobileMenuOpen(false)} 
                                  className={cn(
                                    "w-full flex",
                                    isArabic ? "text-right justify-end" : "text-left justify-start"
                                  )}
                                >
                                  {isArabic ? `عرض جميع الفئات (${categories.length})` : `View all categories (${categories.length})`}
                                </Link>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Other Navigation Items */}
                      {navigationItems.slice(1).map((item, index) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          size="sm"
                          asChild
                          className={cn(
                            "w-full h-9 text-base font-medium mobile-nav-link",
                            "bg-amber-900 text-white border border-amber-800",
                            "hover:bg-amber-800 hover:border-amber-700 hover:text-white",
                            "dark:bg-amber-900 dark:text-white dark:border-amber-800",
                            "dark:hover:bg-amber-800 dark:hover:border-amber-700",
                            isArabic ? "justify-end text-right" : "justify-start text-left",
                            isActive(item.href) && "bg-amber-800 border-amber-700"
                          )}
                          style={{ animationDelay: `${(index + 10) * 50}ms` }}
                        >
                          <Link to={item.href} onClick={() => setMobileMenuOpen(false)} className={cn(
                            "w-full flex",
                            isArabic ? "text-right justify-end" : "text-left justify-start"
                          )}>
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className={cn(
                      "text-sm font-semibold text-muted-foreground uppercase tracking-wider",
                      isArabic ? "text-right" : "text-left"
                    )}>
                      {t('navigation.settings')}
                    </h3>
                    <div className={cn(
                      updateAvailable ? "grid grid-cols-2 gap-2" : "grid grid-cols-3 gap-2",
                      isArabic ? "grid-flow-row-dense" : "grid-flow-row"
                    )}>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/50">
                        <ThemeToggle />
                        <span className="text-xs text-muted-foreground text-center">
                          {isArabic ? 'المظهر' : 'Theme'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/50">
                        <LanguageToggle />
                        <span className="text-xs text-muted-foreground text-center">
                          {isArabic ? 'اللغة' : 'Language'}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/50">
                        <CurrencyToggle />
                        <span className="text-xs text-muted-foreground text-center">
                          {isArabic ? 'العملة' : 'Currency'}
                        </span>
                      </div>
                      {updateAvailable && (
                        <div className="flex flex-col items-center gap-2 p-3 rounded-lg border bg-muted/50">
                          <UpdateToggle />
                          <span className="text-xs text-muted-foreground text-center">
                            {isArabic ? 'التحديث' : 'Update'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cart Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <h3 className={cn(
                      "text-sm font-semibold text-muted-foreground uppercase tracking-wider",
                      isArabic ? "text-right" : "text-left"
                    )}>
                      {t('cart.title')}
                    </h3>
                    <div className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border bg-muted/50 flex-row-reverse"
                     )}>
                      <ShoppingCart className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className={cn(
                        "flex-1 min-w-0",
                        isArabic ? "text-right" : "text-left"
                      )}>
                        <p className="text-sm font-medium truncate">
                          {totalItems} {totalItems === 1 ? t('cart.item') : t('cart.items')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('cart.total')}: {totalPrice.toFixed(2)}
                        </p>
                      </div>
                      {totalItems > 0 && (
                        <Badge variant="secondary" className="flex-shrink-0">{totalItems}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auth Section */}
              <div className="border-t p-6 bg-muted/20">
                {auth.currentUser ? (
                  <div className="space-y-3">
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg bg-background border",
                      isArabic ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className={cn(
                        "flex-1",
                        isArabic ? "text-right" : "text-left"
                      )}>
                        <p className="font-medium text-sm">{auth.currentUser?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{auth.currentUser?.email}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "grid grid-cols-2 gap-2",
                      isArabic ? "grid-flow-row-dense" : "grid-flow-row"
                    )}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-9 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white dark:bg-[#1a0e0d] dark:text-white dark:border-[#1a0e0d] dark:hover:bg-[#0f0705] dark:hover:text-white"
                      >
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={cn(
                          "flex items-center gap-2 justify-center relative",
                          isArabic ? "flex-row-reverse" : "flex-row"
                        )}>
                          <User className="h-4 w-4" />
                          {t('navigation.dashboard')}
                          {/* Show pending orders count for admin/staff */}
                          {(auth.currentUser?.role === 'admin' || auth.currentUser?.role === 'shop_owner' || auth.currentUser?.role === 'employee') && pendingCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            >
                              {pendingCount > 99 ? '99+' : pendingCount}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                      {auth.currentUser?.role === 'admin' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          className="h-9 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white dark:bg-[#1a0e0d] dark:text-white dark:border-[#1a0e0d] dark:hover:bg-[#0f0705] dark:hover:text-white"
                        >
                          <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={cn(
                            "flex items-center gap-2 justify-center",
                            isArabic ? "flex-row-reverse" : "flex-row"
                          )}>
                            <Crown className="h-4 w-4" />
                            {isArabic ? 'الإدارة' : 'Admin Panel'}
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-9 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white dark:bg-[#1a0e0d] dark:text-white dark:border-[#1a0e0d] dark:hover:bg-[#0f0705] dark:hover:text-white"
                      >
                        <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className={cn(
                          "flex items-center gap-2 justify-center relative",
                          isArabic ? "flex-row-reverse" : "flex-row"
                        )}>
                          <Heart className="h-4 w-4" />
                          {isArabic ? 'المفضلة' : 'Wishlist'}
                          {wishlistCount > 0 && (
                            <Badge className="ml-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-red-500">
                              {wishlistCount > 99 ? '99+' : wishlistCount}
                            </Badge>
                          )}
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleLogout}
                        className={cn(
                          "col-span-2 h-9 bg-red-800 text-white border border-red-700 hover:bg-red-700 hover:border-red-600 hover:text-white dark:bg-red-800 dark:text-white dark:border-red-700 dark:hover:bg-red-700 dark:hover:border-red-600 flex items-center gap-2 justify-center",
                          isArabic ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('navigation.logout')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={cn(
                    "grid grid-cols-2 gap-2",
                    isArabic ? "grid-flow-row-dense" : "grid-flow-row"
                  )}>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="h-9 bg-[#1a0e0d] text-white border border-[#1a0e0d] hover:bg-[#0f0705] hover:text-white dark:bg-[#1a0e0d] dark:text-white dark:border-[#1a0e0d] dark:hover:bg-[#0f0705] dark:hover:text-white"
                    >
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center">
                        {t('navigation.login')}
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      className="h-9 bg-[#2a1812] text-white border border-[#1a0e0d] hover:bg-[#1a0e0d] hover:text-white dark:bg-[#2a1812] dark:text-white dark:border-[#1a0e0d] dark:hover:bg-[#1a0e0d] dark:hover:text-white"
                    >
                      <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center">
                        {t('navigation.register')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

NavigationComponent.displayName = 'Navigation'
export const Navigation = NavigationComponent
