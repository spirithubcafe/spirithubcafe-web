import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Coffee, User, Menu, X, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { CartSidebar } from '@/components/cart-sidebar'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// New Language Selector Component
function LanguageSelector() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    
    if (lng === 'ar') {
      document.body.classList.add('font-arabic')
    } else {
      document.body.classList.remove('font-arabic')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant={i18n.language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('en')}
        className="h-8 px-2 text-xs"
      >
        EN
      </Button>
      <Button
        variant={i18n.language === 'ar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => changeLanguage('ar')}
        className="h-8 px-2 text-xs"
      >
        ع
      </Button>
    </div>
  )
}

export function MainNavigation() {
  const location = useLocation()
  const { t } = useTranslation()
  const { auth } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationItems = [
    { path: '/', label: t('navigation.home'), icon: null },
    { path: '/shop', label: t('navigation.shop'), icon: ShoppingBag },
    { path: '/about', label: t('navigation.about'), icon: null },
    { path: '/contact', label: t('navigation.contact'), icon: null }
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Brand Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors"
            onClick={closeMobileMenu}
          >
            <Coffee className="h-6 w-6 text-amber-600" />
            <span className="hidden sm:inline">{t('navigation.brandName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                  isActive(item.path) 
                    ? "text-primary" 
                    : "text-muted-foreground"
                )}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <CartSidebar />
            
            {auth.isAuthenticated ? (
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">
                  <User className="h-4 w-4 mr-2" />
                  {t('navigation.dashboard')}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
                  {t('navigation.login')}
                </Link>
              </Button>
            )}

            <div className="flex items-center">
              <CurrencyToggle />
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <CartSidebar />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-4 space-y-2">
              {/* Navigation Links */}
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </div>
                </Link>
              ))}

              {/* Auth Section */}
              <div className="pt-4 border-t">
                {auth.isAuthenticated ? (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/dashboard" onClick={closeMobileMenu}>
                      <User className="h-4 w-4 mr-2" />
                      {t('navigation.dashboard')}
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/login" onClick={closeMobileMenu}>
                      <User className="h-4 w-4 mr-2" />
                      {t('navigation.login')}
                    </Link>
                  </Button>
                )}
              </div>

              {/* Settings */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('navigation.settings')}
                  </span>
                  <div className="flex items-center gap-1">
                    <CurrencyToggle />
                    <LanguageSelector />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
