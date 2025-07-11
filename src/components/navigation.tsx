import { Link, useLocation } from 'react-router-dom'
import { Coffee } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { useTranslation } from 'react-i18next'

export function Navigation() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - در RTL سمت راست، در LTR سمت چپ */}
        <div className={`flex items-center gap-3 ${isRTL ? 'order-3' : 'order-1'}`}>
          <Coffee className="h-6 w-6 text-amber-600 no-flip" />
          <Link to="/" className="text-xl font-bold text-foreground">
            {t('navigation.brandName')}
          </Link>
        </div>
        
        {/* Navigation Links - وسط */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium order-2">
          <Link 
            to="/" 
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            {t('navigation.home')}
          </Link>
          <Link 
            to="/shop" 
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/shop') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            {t('navigation.shop')}
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/about') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            {t('navigation.about')}
          </Link>
          <Link 
            to="/contact" 
            className={`transition-colors hover:text-foreground/80 ${
              isActive('/contact') ? 'text-foreground' : 'text-foreground/60'
            }`}
          >
            {t('navigation.contact')}
          </Link>
        </nav>

        {/* Action Icons - در RTL سمت چپ، در LTR سمت راست */}
        <div className={`flex items-center gap-3 ${isRTL ? 'order-1' : 'order-3'}`}>
          <CurrencyToggle />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
