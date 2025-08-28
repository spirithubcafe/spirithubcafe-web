import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Mail, MessageCircle } from 'lucide-react'
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

  // Get theme-aware styles based on footer color settings
  const getFooterStyles = useCallback(() => {
    const colorTheme = settings?.colorTheme || 'auto'
    
    // Determine effective theme
    let effectiveTheme = theme
    if (colorTheme === 'light') effectiveTheme = 'light'
    else if (colorTheme === 'dark') effectiveTheme = 'dark'
    
    return {
      textColor: settings?.textColor || (effectiveTheme === 'dark' ? '#ffffff' : '#000000'),
      headingColor: settings?.headingColor || (effectiveTheme === 'dark' ? '#ffffff' : '#000000'), 
      linkColor: settings?.linkColor || (effectiveTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'),
      linkHoverColor: settings?.linkHoverColor || (effectiveTheme === 'dark' ? '#ffffff' : '#000000'),
      borderColor: settings?.borderColor || (effectiveTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
      socialIconsColor: settings?.socialIconsColor || (effectiveTheme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'),
      socialIconsHoverColor: settings?.socialIconsHoverColor || (effectiveTheme === 'dark' ? '#ffffff' : '#000000')
    }
  }, [settings, theme])

  // Get logo based on footer logo theme setting
  const getFooterLogo = useCallback(() => {
    const logoTheme = settings?.logoTheme || 'auto'
    const colorTheme = settings?.colorTheme || 'auto'
    console.log('Footer - Logo theme:', logoTheme, 'Color theme:', colorTheme, 'Global theme:', theme)
    
    if (logoTheme === 'light') {
      console.log('Footer - Using light logo (explicit setting)')
      return "/images/logo/logo-light.png"
    } else if (logoTheme === 'dark') {
      console.log('Footer - Using dark logo (explicit setting)')
      return "/images/logo/logo-dark.png"
    } else {
      // Auto mode - determine based on effective color theme
      let effectiveTheme = theme
      if (colorTheme === 'light') effectiveTheme = 'light'
      else if (colorTheme === 'dark') effectiveTheme = 'dark'
      
      // In dark theme/background, use light (white) logo
      // In light theme/background, use dark (black) logo
      const logo = effectiveTheme === 'dark' ? "/images/logo/logo-light.png" : "/images/logo/logo-dark.png"
      console.log('Footer - Auto mode, effective theme:', effectiveTheme, 'using logo:', logo)
      return logo
    }
  }, [settings, theme])

  const footerStyles = getFooterStyles()
  const logoSrc = getFooterLogo()

  // Styled Link Component
  const StyledLink = ({ to, children, ...props }: { to: string; children: React.ReactNode; [key: string]: any }) => (
    <Link 
      to={to} 
      className="text-base transition-all hover:scale-105 transform duration-200"
      style={{ color: footerStyles.linkColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = footerStyles.linkHoverColor
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = footerStyles.linkColor
      }}
      {...props}
    >
      {children}
    </Link>
  )

  // Styled Social Icon Component
  const StyledSocialIcon = ({ href, children, label }: { href: string; children: React.ReactNode; label: string }) => (
    <a 
      href={href}
      className="transition-all duration-300 hover:scale-110 transform p-3 rounded-full backdrop-blur-sm shadow-lg"
      style={{ 
        color: footerStyles.socialIconsColor,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderColor: 'rgba(255,255,255,0.2)',
        border: '1px solid'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = footerStyles.socialIconsHoverColor
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = footerStyles.socialIconsColor
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {children}
    </a>
  )

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
    <footer className="shadow-inner w-full relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        {/* Transparent video mode check */}
        {!settings?.transparentVideoMode && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover ${getBlurClass()}`}
          >
            <source src="/video/back.mp4" type="video/mp4" />
          </video>
        )}
        
        {/* Conditional overlays based on settings */}
        {!settings?.transparentVideoMode && settings?.enableVideoOverlay !== false && (
          <div 
            className={`absolute inset-0 ${getOverlayClass()}`}
            style={{
              opacity: settings?.videoOverlayOpacity ? settings.videoOverlayOpacity / 100 : undefined
            }}
          ></div>
        )}
        
        {/* Gradient overlay - conditional */}
        {!settings?.transparentVideoMode && settings?.enableGradientOverlay !== false && (
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.9) 100%)',
              opacity: settings?.gradientOverlayOpacity ? settings.gradientOverlayOpacity / 100 : 1
            }}
          ></div>
        )}
      </div>
      
      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-10">
            {/* Brand - Takes more space (3 columns) */}
            <div className="space-y-6 lg:col-span-3">
              <div className="flex items-center gap-4">
                <img 
                  src={logoSrc}
                  alt="SpiritHub Cafe Logo" 
                  className="h-20 w-auto object-contain no-flip flex-shrink-0 drop-shadow-lg"
                />
              </div>
              <div 
                className="text-base leading-relaxed prose prose-base max-w-none drop-shadow-sm"
                style={{ color: footerStyles.textColor }}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* Quick Links - Smaller column with top margin to align with description */}
            <div className="space-y-4 lg:mt-24">
              <h3 
                className="text-base font-semibold"
                style={{ color: footerStyles.headingColor }}
              >
                {t('footer.quickLinks')}
              </h3>
              <nav className="flex flex-col space-y-3">
                <StyledLink to="/">{t('navigation.home')}</StyledLink>
                <StyledLink to="/shop">{t('navigation.shop')}</StyledLink>
                <StyledLink to="/about">{t('navigation.about')}</StyledLink>
                <StyledLink to="/contact">{t('navigation.contact')}</StyledLink>
              </nav>
            </div>

            {/* Legal Pages - Smaller column with top margin to align with description */}
            <div className="space-y-4 lg:mt-24">
              <h3 
                className="text-base font-semibold"
                style={{ color: footerStyles.headingColor }}
              >
                {isArabic ? 'الصفحات القانونية' : 'Legal Pages'}
              </h3>
              <nav className="flex flex-col space-y-3">
                {footerPages.map((page) => (
                  <StyledLink 
                    key={page.id}
                    to={`/page/${page.slug}`}
                  >
                    {isArabic ? page.title_ar : page.title}
                  </StyledLink>
                ))}
                {/* Fallback links if no pages are loaded */}
                {footerPages.length === 0 && (
                  <>
                    <StyledLink to="/privacy-policy">
                      {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
                    </StyledLink>
                    <StyledLink to="/terms-and-conditions">
                      {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
                    </StyledLink>
                    <StyledLink to="/refund-policy">
                      {isArabic ? 'سياسة الاستبدال والإرجاع' : 'Refund Policy'}
                    </StyledLink>
                    <StyledLink to="/delivery-policy">
                      {isArabic ? 'سياسة التوصيل' : 'Delivery Policy'}
                    </StyledLink>
                    <StyledLink to="/faq">
                      {isArabic ? 'الأسئلة الشائعة' : 'FAQ'}
                    </StyledLink>
                  </>
                )}
              </nav>
            </div>

            {/* Contact Info - Smaller column with top margin to align with description */}
            <div className="space-y-4 lg:mt-24">
              <h3 
                className="text-base font-semibold"
                style={{ color: footerStyles.headingColor }}
              >
                {t('navigation.contact')}
              </h3>
              <div className="space-y-3 text-base" style={{ color: footerStyles.textColor }}>
                <p>{address}</p>
                <div className="space-y-1">
                  <p className="ltr">{phone}</p>
                  {phone2 && <p className="ltr">{phone2}</p>}
                </div>
                <p className="ltr">{email}</p>
                <div 
                  className="prose prose-base max-w-none text-base"
                  style={{ color: footerStyles.textColor }}
                  dangerouslySetInnerHTML={{ __html: workingHours }}
                />
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div 
            className="border-t mt-12 pt-12"
            style={{ borderColor: footerStyles.borderColor }}
          >
            <div className="text-center space-y-6">
              <h3 
                className="text-lg font-semibold drop-shadow-sm"
                style={{ color: footerStyles.headingColor }}
              >
                {t('footer.followUs')}
              </h3>
              <div className="flex justify-center gap-6">
                {settings?.facebook && (
                  <StyledSocialIcon 
                    href={`https://facebook.com/${settings.facebook}`}
                    label="Facebook"
                  >
                    <Facebook className="h-6 w-6 no-flip" />
                  </StyledSocialIcon>
                )}
                {settings?.twitter && (
                  <StyledSocialIcon 
                    href={`https://twitter.com/${settings.twitter}`}
                    label="Twitter"
                  >
                    <Twitter className="h-6 w-6 no-flip" />
                  </StyledSocialIcon>
                )}
                {settings?.instagram && (
                  <StyledSocialIcon 
                    href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                    label="Instagram"
                  >
                    <Instagram className="h-6 w-6 no-flip" />
                  </StyledSocialIcon>
                )}
                {settings?.whatsapp && (
                  <StyledSocialIcon 
                    href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
                    label="WhatsApp"
                  >
                    <MessageCircle className="h-6 w-6 no-flip" />
                  </StyledSocialIcon>
                )}
                {settings?.email && (
                  <StyledSocialIcon 
                    href={`mailto:${settings.email}`}
                    label="Email"
                  >
                    <Mail className="h-6 w-6 no-flip" />
                  </StyledSocialIcon>
                )}
                {/* Fallback to translation keys if settings not available */}
                {!settings && (
                  <>
                    <StyledSocialIcon href="#" label="Facebook">
                      <Facebook className="h-6 w-6 no-flip" />
                    </StyledSocialIcon>
                    <StyledSocialIcon href="#" label="Twitter">
                      <Twitter className="h-6 w-6 no-flip" />
                    </StyledSocialIcon>
                    <StyledSocialIcon href="#" label="Instagram">
                      <Instagram className="h-6 w-6 no-flip" />
                    </StyledSocialIcon>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div 
            className="border-t mt-12 pt-12 text-center"
            style={{ borderColor: footerStyles.borderColor }}
          >
            <p 
              className="text-base drop-shadow-sm font-medium"
              style={{ color: footerStyles.textColor }}
            >
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
