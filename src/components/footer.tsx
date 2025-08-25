import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFooterSettings } from '@/hooks/useFooterSettings'
import { useState, useEffect, useCallback } from 'react'
import { firestoreService, type Page } from '@/lib/firebase'
import { useTheme } from '@/components/theme-provider'

export function Footer() {
  const { t, i18n } = useTranslation()
  const { theme } = useTheme()
  const { settings } = useFooterSettings()
  const [footerPages, setFooterPages] = useState<Page[]>([])
  const isArabic = i18n.language === 'ar'

  // Load footer pages
  useEffect(() => {
    const loadFooterPages = async () => {
      try {
        const pages = await firestoreService.pages.getFooterPages()
        setFooterPages(pages)
      } catch (error) {
        console.error('Error loading footer pages:', error)
      }
    }
    
    loadFooterPages()
  }, [])

  // Use settings if available, otherwise fallback to translation keys
  const description = isArabic 
    ? (settings?.descriptionAr || settings?.description || t('footer.description'))
    : (settings?.description || t('footer.description'))
  const address = isArabic 
    ? (settings?.addressAr || settings?.address || t('contact.info.address'))
    : (settings?.address || t('contact.info.address'))
  const phone = settings?.phone || t('contact.info.phone')
  const phone2 = settings?.phone2
  const email = settings?.email || t('contact.info.email')
  const workingHours = isArabic 
    ? (settings?.workingHoursAr || settings?.workingHours || t('contact.info.hours'))
    : (settings?.workingHours || t('contact.info.hours'))
  
  // Calculate blur intensity based on settings (default 50%)
  const blurIntensity = settings?.backgroundVideoBlur ?? 50
  
  // Debug: Add console.log to check if settings are loaded
  useEffect(() => {
    console.log('Footer - Settings loaded:', settings)
    console.log('Footer - Blur intensity:', blurIntensity)
  }, [settings, blurIntensity])
  
  // Get overlay opacity class based on blur intensity
  const getOverlayClass = useCallback(() => {
    if (blurIntensity <= 20) return 'bg-black/30'
    if (blurIntensity <= 40) return 'bg-black/40'
    if (blurIntensity <= 60) return 'bg-black/50'
    if (blurIntensity <= 80) return 'bg-black/60'
    return 'bg-black/70'
  }, [blurIntensity])

  // Create blur class based on intensity
  const getBlurClass = () => {
    const blurClass = blurIntensity <= 12.5 ? 'blur-none' :
                     blurIntensity <= 25 ? 'blur-sm' :
                     blurIntensity <= 50 ? 'blur' :
                     blurIntensity <= 75 ? 'blur-md' : 'blur-lg'
    console.log('Footer - Blur class:', blurClass, 'for intensity:', blurIntensity)
    return blurClass
  }

  return (
    <footer className="border-t border-border/40 shadow-inner w-full relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover ${getBlurClass()}`}
        >
          <source src="/video/back.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className={`absolute inset-0 ${getOverlayClass()}`}></div>
        {/* Additional gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/90"></div>
      </div>
      
      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand - Takes more space (3 columns) */}
            <div className="space-y-4 lg:col-span-3">
              <div className="flex items-center gap-3">
                <img 
                  src={theme === 'dark' ? "/images/logo/logo-light.png" : "/images/logo/logo-dark.png"}
                  alt="SpiritHub Cafe Logo" 
                  className="h-16 w-auto object-contain no-flip flex-shrink-0"
                />
              </div>
              <div 
                className="text-sm text-foreground/90 leading-relaxed drop-shadow-sm prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* Quick Links - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground drop-shadow-sm">{t('footer.quickLinks')}</h3>
              <nav className="flex flex-col space-y-2">
                <Link to="/" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                  {t('navigation.home')}
                </Link>
                <Link to="/shop" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                  {t('navigation.shop')}
                </Link>
                <Link to="/about" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                  {t('navigation.about')}
                </Link>
                <Link to="/contact" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                  {t('navigation.contact')}
                </Link>
              </nav>
            </div>

            {/* Legal Pages - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground drop-shadow-sm">{isArabic ? 'الصفحات القانونية' : 'Legal Pages'}</h3>
              <nav className="flex flex-col space-y-2">
                {footerPages.map((page) => (
                  <Link 
                    key={page.id}
                    to={`/page/${page.slug}`} 
                    className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm"
                  >
                    {isArabic ? page.title_ar : page.title}
                  </Link>
                ))}
                {/* Fallback links if no pages are loaded */}
                {footerPages.length === 0 && (
                  <>
                    <Link to="/privacy-policy" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                      {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </Link>
                    <Link to="/terms-and-conditions" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                      {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                    </Link>
                    <Link to="/refund-policy" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                      {isArabic ? 'سياسة الاستبدال والإرجاع' : 'Refund Policy'}
                    </Link>
                    <Link to="/delivery-policy" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                      {isArabic ? 'سياسة التوصيل' : 'Delivery Policy'}
                    </Link>
                    <Link to="/faq" className="text-sm text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm">
                      {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Contact Info - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground drop-shadow-sm">{t('navigation.contact')}</h3>
              <div className="space-y-3 text-sm text-foreground/80 drop-shadow-sm">
                <p>{address}</p>
                <div className="space-y-1">
                  <p className="ltr">{phone}</p>
                  {phone2 && <p className="ltr">{phone2}</p>}
                </div>
                <p className="ltr">{email}</p>
                <div 
                  className="prose prose-sm prose-invert max-w-none text-sm text-foreground/80 drop-shadow-sm"
                  dangerouslySetInnerHTML={{ __html: workingHours }}
                />
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="border-t border-foreground/20 mt-8 pt-8">
            <div className="text-center space-y-4">
              <h3 className="text-sm font-semibold text-foreground drop-shadow-sm">{t('footer.followUs')}</h3>
              <div className="flex justify-center gap-4">
                {settings?.facebook && (
                  <a 
                    href={`https://facebook.com/${settings.facebook}`} 
                    className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5 no-flip" />
                  </a>
                )}
                {settings?.twitter && (
                  <a 
                    href={`https://twitter.com/${settings.twitter}`} 
                    className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5 no-flip" />
                  </a>
                )}
                {settings?.instagram && (
                  <a 
                    href={`https://instagram.com/${settings.instagram.replace('@', '')}`} 
                    className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5 no-flip" />
                  </a>
                )}
                {/* Fallback to translation keys if settings not available */}
                {!settings && (
                  <>
                    <a href="#" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm" aria-label="Facebook">
                      <Facebook className="h-5 w-5 no-flip" />
                    </a>
                    <a href="#" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm" aria-label="Twitter">
                      <Twitter className="h-5 w-5 no-flip" />
                    </a>
                    <a href="#" className="text-foreground/80 hover:text-foreground transition-colors drop-shadow-sm" aria-label="Instagram">
                      <Instagram className="h-5 w-5 no-flip" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-foreground/20 mt-8 pt-8 text-center">
            <p className="text-sm text-foreground/80 drop-shadow-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
