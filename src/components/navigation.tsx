import { Link, useLocation } from 'react-router-dom'
import { Coffee } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageToggle } from '@/components/language-toggle'
import { CurrencyToggle } from '@/components/currency-toggle'
import { useTranslation } from 'react-i18next'

export function Navigation() {
  const location = useLocation()
  const { t } = useTranslation()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Coffee className="h-6 w-6 text-amber-600 no-flip" />
          <Link to="/" className="text-xl font-bold text-foreground">
            {t('navigation.brandName')}
          </Link>
        </div>
        
        <nav className="flex items-center space-x-6 rtl:space-x-reverse text-sm font-medium">
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

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <CurrencyToggle />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
