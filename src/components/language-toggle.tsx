import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

export function LanguageToggle() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    document.documentElement.lang = lng
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'
    
    // Add/remove Arabic font class to body
    if (lng === 'ar') {
      document.body.classList.add('font-arabic')
    } else {
      document.body.classList.remove('font-arabic')
    }
  }

  // Set initial direction and font based on current language
  useEffect(() => {
    const currentLang = i18n.language
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
    
    if (currentLang === 'ar') {
      document.body.classList.add('font-arabic')
    } else {
      document.body.classList.remove('font-arabic')
    }
  }, [i18n.language])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('common.toggleLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <span className="mr-2">🇺🇸</span>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('ar')}>
          <span className="mr-2">🇸🇦</span>
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
