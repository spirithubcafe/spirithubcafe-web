import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Coffee, User, LogOut, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { CartSidebar } from '@/components/cart-sidebar'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/components/auth-provider'
import { useCart } from '@/components/cart-provider'
import { cn } from '@/lib/utils'

export function Navigation() {
  const { t, i18n } = useTranslation()
  const { auth, logout } = useAuth()
  const { getTotalItems, getTotalPrice } = useCart()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isArabic = i18n.language === 'ar'

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

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
    { href: '/shop', label: t('navigation.shop') },
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
          "sticky top-0 w-full border-b nav-coffee",
          "z-50", // default
          mobileMenuOpen && "z-[60] shadow-2xl" // when mobile menu is open, ensure solid bg and higher z-index
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between max-w-7xl mx-auto">
            
            {/* Logo - Always right for Arabic, left for English */}
            <div className={cn(
              "flex items-center gap-2 flex-shrink-0",
              isArabic ? "order-3" : "order-1"
            )}>
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-all duration-300 logo-hover">
                <Coffee className="h-7 w-7 text-primary no-flip coffee-glow-animate" />
                <span className={cn(
                  "font-bold text-foreground"
                )}>
                  {t('navigation.brandName')}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links - Centered */}
            <div className={cn(
              "hidden md:flex items-center gap-1",
              isArabic ? "order-2" : "order-2"
            )}>
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "nav-link transition-all duration-200 rounded-md px-4 py-2 font-medium",
                    isActive(item.href)
                      ? "text-primary bg-accent/30 shadow-sm border border-primary/30"
                      : "text-foreground hover:text-primary hover:bg-accent/10",
                    "hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-primary/40"
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
                <ThemeToggle />
                <LanguageToggle />
                <CurrencyToggle />
              </div>

              {/* Cart */}
              <CartSidebar />

              {/* Auth Buttons */}
              {auth.isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden lg:block">
                        {t('navigation.dashboard')}
                      </span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:block">
                      {t('navigation.logout')}
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild className="hover:bg-accent/20">
                    <Link to="/login">{t('navigation.login')}</Link>
                  </Button>
                  <Button size="sm" asChild className="btn-coffee">
                    <Link to="/register">{t('navigation.register')}</Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
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
                      {navigationItems.map((item, index) => (
                        <Button
                          key={item.href}
                          variant={isActive(item.href) ? "secondary" : "ghost"}
                          size="sm"
                          asChild
                          className={cn(
                            "w-full h-12 text-base font-medium mobile-nav-link",
                            isArabic ? "justify-end text-right" : "justify-start text-left",
                            isActive(item.href) && "tab-active-light dark:super-bright-tab font-semibold"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
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
                      "grid grid-cols-3 gap-2",
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
                {auth.isAuthenticated ? (
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
                        <p className="font-medium text-sm">{auth.user?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{auth.user?.email}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "grid grid-cols-2 gap-2",
                      isArabic ? "grid-flow-row-dense" : "grid-flow-row"
                    )}>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={cn(
                          "flex items-center gap-2 justify-center",
                          isArabic ? "flex-row-reverse" : "flex-row"
                        )}>
                          <User className="h-4 w-4" />
                          {t('navigation.dashboard')}
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleLogout}
                        className={cn(
                          "text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20 flex items-center gap-2 justify-center",
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
                    <Button variant="outline" asChild>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center">
                        {t('navigation.login')}
                      </Link>
                    </Button>
                    <Button asChild>
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
}
