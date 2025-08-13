import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useFooterSettings } from '@/hooks/useFooterSettings'
import { useState, useEffect } from 'react'
import { firestoreService, type Page } from '@/lib/firebase'

export function Footer() {
  const { t, i18n } = useTranslation()
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
  const companyName = settings?.companyName || t('navigation.brandName')
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

  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-background to-muted/20 shadow-inner w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-12">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand - Takes more space (3 columns) */}
            <div className="space-y-4 lg:col-span-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/images/logo-s.png" 
                  alt="SpiritHub Cafe Logo" 
                  className="h-8 w-8 object-contain no-flip flex-shrink-0"
                />
                <span className="text-lg font-bold">{companyName}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                {description}
              </p>
            </div>

            {/* Quick Links - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('footer.quickLinks')}</h3>
              <nav className="flex flex-col space-y-2">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('navigation.home')}
                </Link>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('navigation.shop')}
                </Link>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('navigation.about')}
                </Link>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('navigation.contact')}
                </Link>
              </nav>
            </div>

            {/* Legal Pages - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{isArabic ? 'الصفحات القانونية' : 'Legal Pages'}</h3>
              <nav className="flex flex-col space-y-2">
                {footerPages.map((page) => (
                  <Link 
                    key={page.id}
                    to={`/page/${page.slug}`} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {isArabic ? page.title_ar : page.title}
                  </Link>
                ))}
                {/* Fallback links if no pages are loaded */}
                {footerPages.length === 0 && (
                  <>
                    <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </Link>
                    <Link to="/terms-and-conditions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                    </Link>
                    <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isArabic ? 'سياسة الاستبدال والإرجاع' : 'Refund Policy'}
                    </Link>
                    <Link to="/delivery-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isArabic ? 'سياسة التوصيل' : 'Delivery Policy'}
                    </Link>
                    <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Contact Info - Smaller column */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">{t('navigation.contact')}</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{address}</p>
                <div className="space-y-1">
                  <p>{phone}</p>
                  {phone2 && <p>{phone2}</p>}
                </div>
                <p>{email}</p>
                <p>{workingHours}</p>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="border-t mt-8 pt-8">
            <div className="text-center space-y-4">
              <h3 className="text-sm font-semibold">{t('footer.followUs')}</h3>
              <div className="flex justify-center gap-4">
                {settings?.facebook && (
                  <a 
                    href={`https://facebook.com/${settings.facebook}`} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                    className="text-muted-foreground hover:text-foreground transition-colors"
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
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Facebook">
                      <Facebook className="h-5 w-5 no-flip" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                      <Twitter className="h-5 w-5 no-flip" />
                    </a>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                      <Instagram className="h-5 w-5 no-flip" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
