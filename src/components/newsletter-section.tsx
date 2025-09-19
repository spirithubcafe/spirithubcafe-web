import { logger } from "@/utils/logger";
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/theme-provider'
import { firestoreService } from '@/lib/firebase'
import { useGlobalNewsletterSettings } from '@/contexts/enhanced-data-provider'
import toast from 'react-hot-toast'

export function NewsletterSection() {
  const { i18n } = useTranslation()
  const { resolvedTheme } = useTheme()
  const { settings: newsletterSettings } = useGlobalNewsletterSettings()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const isArabic = i18n.language === 'ar'

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast.error(isArabic ? 'يرجى إدخال عنوان البريد الإلكتروني' : 'Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      toast.error(isArabic ? 'يرجى إدخال عنوان بريد إلكتروني صحيح' : 'Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      logger.log('🔍 Checking for duplicate email:', email.toLowerCase().trim())
      
      // Check if email already exists
      const existingSubscriptions = await firestoreService.newsletters.list()
      logger.log('📋 Existing subscriptions found:', existingSubscriptions.items.length)
      
      const normalizedEmail = email.toLowerCase().trim()
      const emailExists = existingSubscriptions.items.some(
        (sub: any) => {
          const existingEmail = sub.email?.toLowerCase().trim()
          logger.log('🔍 Comparing:', normalizedEmail, 'vs', existingEmail)
          return existingEmail === normalizedEmail
        }
      )

      logger.log('✅ Email exists check result:', emailExists)

      if (emailExists) {
        toast.error(isArabic ? 'هذا البريد الإلكتروني مشترك بالفعل' : 'This email is already subscribed')
        setIsLoading(false)
        return
      }

      // Add new subscription
      const subscriptionData = {
        email: normalizedEmail,
        subscribed_at: new Date().toISOString(),
        status: 'active',
        source: 'homepage'
      }
      
      logger.log('📧 Creating newsletter subscription with data:', subscriptionData)
      const result = await firestoreService.newsletters.create(subscriptionData)
      logger.log('✅ Newsletter subscription result:', result)

      if (!result) {
        throw new Error('Failed to create subscription - no result returned')
      }

      setIsSubscribed(true)
      setEmail('')
      toast.success(isArabic ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!')
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail('')
        setIsSubscribed(false)
      }, 3000)

    } catch (error) {
      logger.error('❌ Newsletter subscription error:', error)
      
      // Check if it's a duplicate error from Firestore
      if (error instanceof Error && error.message.includes('already exists')) {
        toast.error(isArabic ? 'هذا البريد الإلكتروني مشترك بالفعل' : 'This email is already subscribed')
      } else {
        toast.error(isArabic ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <section 
        className="py-12 lg:py-16 relative"
        style={{
          backgroundColor: newsletterSettings?.newsletterBackgroundType === 'color' 
            ? (resolvedTheme === 'dark' 
                ? newsletterSettings?.newsletterBackgroundColorDark || newsletterSettings?.newsletterBackgroundColor
                : newsletterSettings?.newsletterBackgroundColorLight || newsletterSettings?.newsletterBackgroundColor)
            : undefined,
          backgroundImage: newsletterSettings?.newsletterBackgroundType === 'image' && newsletterSettings?.newsletterBackgroundImage
            ? `url(${newsletterSettings.newsletterBackgroundImage})`
            : undefined,
          backgroundSize: newsletterSettings?.newsletterBackgroundType === 'image' ? 'cover' : undefined,
          backgroundPosition: newsletterSettings?.newsletterBackgroundType === 'image' ? 'center' : undefined,
          backgroundRepeat: newsletterSettings?.newsletterBackgroundType === 'image' ? 'no-repeat' : undefined,
          backgroundAttachment: newsletterSettings?.newsletterBackgroundType === 'image' ? 'fixed' : undefined
        }}
      >
        {/* Overlay for better text readability when using background image */}
        {newsletterSettings?.newsletterBackgroundType === 'image' && newsletterSettings?.newsletterBackgroundImage && (
          <div className="absolute inset-0 bg-black/20"></div>
        )}
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Image */}
            <div className={`${isArabic ? 'lg:order-2' : 'lg:order-1'}`}>
              <div className="relative h-[280px] lg:h-[400px] rounded-xl overflow-hidden shadow-lg">
                <img 
                  src={newsletterSettings?.newsletterImage || "/images/cats/specialty-coffee-capsules.webp"} 
                  alt="Coffee Newsletter"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/back.jpg"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            {/* Right side - Success message */}
            <div className={`${isArabic ? 'lg:order-1' : 'lg:order-2'}`}>
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  {isArabic ? 'شكراً لك!' : 'Thank You!'}
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  {isArabic 
                    ? 'تم الاشتراك في النشرة الإخبارية بنجاح. ستصلك أحدث الأخبار والعروض قريباً!'
                    : 'You have successfully subscribed to our newsletter. You\'ll receive the latest news and offers soon!'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section 
      className="py-12 lg:py-16 relative"
      style={{
        backgroundColor: newsletterSettings?.newsletterBackgroundType === 'color' 
          ? (resolvedTheme === 'dark' 
              ? newsletterSettings?.newsletterBackgroundColorDark || newsletterSettings?.newsletterBackgroundColor
              : newsletterSettings?.newsletterBackgroundColorLight || newsletterSettings?.newsletterBackgroundColor)
          : undefined,
        backgroundImage: newsletterSettings?.newsletterBackgroundType === 'image' && newsletterSettings?.newsletterBackgroundImage
          ? `url(${newsletterSettings.newsletterBackgroundImage})`
          : undefined,
        backgroundSize: newsletterSettings?.newsletterBackgroundType === 'image' ? 'cover' : undefined,
        backgroundPosition: newsletterSettings?.newsletterBackgroundType === 'image' ? 'center' : undefined,
        backgroundRepeat: newsletterSettings?.newsletterBackgroundType === 'image' ? 'no-repeat' : undefined,
        backgroundAttachment: newsletterSettings?.newsletterBackgroundType === 'image' ? 'fixed' : undefined
      }}
    >
      {/* Overlay for better text readability when using background image */}
      {newsletterSettings?.newsletterBackgroundType === 'image' && newsletterSettings?.newsletterBackgroundImage && (
        <div className="absolute inset-0 bg-black/40"></div>
      )}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Image */}
          <div className={`${isArabic ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="relative h-[280px] lg:h-[400px] rounded-xl overflow-hidden shadow-lg">
              <img 
                src={newsletterSettings?.newsletterImage || "/images/cats/specialty-coffee-capsules.webp"} 
                alt="Coffee Newsletter"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/back.jpg"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

          {/* Right side - Newsletter form */}
          <div className={`${isArabic ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="max-w-lg">
              <h2 className={`text-2xl md:text-3xl font-bold mb-4 leading-tight ${
                newsletterSettings?.newsletterBackgroundType === 'image' ? 'text-white' : 'text-foreground'
              }`}>
                {isArabic 
                  ? (newsletterSettings?.newsletterTitleAr || 'ابق على اطلاع مع آخر أخبار سبيريت هب كافيه!')
                  : (newsletterSettings?.newsletterTitle || 'Stay Updated with Spirit Hub Cafe!')
                }
              </h2>
              
              <p className={`text-base mb-6 leading-relaxed ${
                newsletterSettings?.newsletterBackgroundType === 'image' ? 'text-gray-200' : 'text-muted-foreground'
              }`}>
                {isArabic 
                  ? (newsletterSettings?.newsletterDescriptionAr || 'اشترك في نشرتنا الإخبارية وكن أول من يعرف عن منتجاتنا الجديدة والعروض الخاصة.')
                  : (newsletterSettings?.newsletterDescription || 'Sign up to our newsletter and be the first to know about our new products and special offers.')
                }
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder={isArabic ? 'عنوان بريدك الإلكتروني' : 'Your email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base w-full"
                    disabled={isLoading}
                    dir={isArabic ? 'rtl' : 'ltr'}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="h-12 px-6 font-semibold w-full transition-all duration-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {isArabic ? 'جاري الاشتراك...' : 'Subscribing...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        {isArabic ? 'اشترك' : 'Subscribe'}
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
