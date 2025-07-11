import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Coffee, User, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { CartSidebar } from '@/components/cart-sidebar'
import { useAuth } from '@/components/auth-provider'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function Navigation() {
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

  const navLinks = [
    { to: '/', label: t('navigation.home') },
    { to: '/shop', label: t('navigation.shop') },
    { to: '/about', label: t('navigation.about') },
    { to: '/contact', label: t('navigation.contact') }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
          
          {/* Logo - Always visible */}
          <div className="flex items-center gap-3">
            <Coffee className="h-6 w-6 text-amber-600 no-flip shrink-0" />
            <Link 
              to="/" 
              className="text-lg md:text-xl font-bold text-foreground hover:text-amber-600 transition-colors duration-200"
              onClick={closeMobileMenu}
            >
              {t('navigation.brandName')}
            </Link>
          </div>
          
          {/* Desktop Navigation Links - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                className={cn(
                  "relative py-2 px-1 transition-all duration-300 hover:text-amber-600 group",
                  isActive(link.to) 
                    ? 'text-amber-600' 
                    : 'text-foreground/70 hover:text-foreground'
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-amber-600 transition-all duration-300",
                  isActive(link.to) 
                    ? 'w-full' 
                    : 'w-0 group-hover:w-full'
                )} />
              </Link>
            ))}
          </nav>

          {/* Desktop Action Icons */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <CartSidebar />
            
            {auth.isAuthenticated ? (
              <Button variant="outline" size="sm" asChild className="hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20">
                <Link to="/dashboard" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t('navigation.dashboard')}
                  </span>
                </Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-950/20">
                <Link to="/login" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t('navigation.login')}
                  </span>
                </Link>
              </Button>
            )}
            
            <div className="flex items-center gap-1">
              <CurrencyToggle />
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Actions - Cart + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <CartSidebar />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <Menu 
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-300 transform",
                    isMobileMenuOpen ? "rotate-90 opacity-0 scale-75" : "rotate-0 opacity-100 scale-100"
                  )} 
                />
                <X 
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-300 transform",
                    isMobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-75"
                  )} 
                />
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "md:hidden fixed inset-0 top-16 bg-background backdrop-blur-xl transition-all duration-300 ease-in-out border-t border-border/20 shadow-2xl",
        isMobileMenuOpen 
          ? "opacity-100 visible" 
          : "opacity-0 invisible"
      )}>
        
        {/* Mobile Navigation */}
        <div className={cn(
          "w-full h-full px-4 py-6 transform transition-all duration-300 ease-in-out bg-background/98",
          isMobileMenuOpen 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-4 opacity-0"
        )}>
          
          {/* Navigation Links */}
          <nav className="space-y-1 mb-8">
            {navLinks.map((link, index) => (
              <Link 
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={cn(
                  "block py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 hover:bg-amber-50 dark:hover:bg-amber-950/20",
                  isActive(link.to) 
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' 
                    : 'text-foreground/80 hover:text-amber-600'
                )}
                style={{
                  animationDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
                }}
              >
                <div className="flex items-center justify-between">
                  {link.label}
                  {isActive(link.to) && (
                    <div className="w-2 h-2 bg-amber-600 rounded-full" />
                  )}
                </div>
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="space-y-3 mb-8">
            {auth.isAuthenticated ? (
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard" onClick={closeMobileMenu}>
                  <User className="h-4 w-4 mr-3" />
                  {t('navigation.dashboard')}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/login" onClick={closeMobileMenu}>
                  <User className="h-4 w-4 mr-3" />
                  {t('navigation.login')}
                </Link>
              </Button>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider px-4">
              {t('navigation.settings')}
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
                <CurrencyToggle />
                <span className="text-xs text-foreground/60">{t('navigation.currency')}</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
                <LanguageToggle />
                <span className="text-xs text-foreground/60">{t('navigation.language')}</span>
              </div>
              
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30">
                <ThemeToggle />
                <span className="text-xs text-foreground/60">{t('theme.title')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
