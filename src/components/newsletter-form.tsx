import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { firestoreService } from '@/lib/firebase'
import toast from 'react-hot-toast'

export function NewsletterForm() {
  const { i18n } = useTranslation()
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
      // Check if email already exists
      const existingSubscriptions = await firestoreService.newsletters.list()
      const emailExists = existingSubscriptions.items.some(
        (sub: any) => sub.email.toLowerCase() === email.toLowerCase()
      )

      if (emailExists) {
        toast.error(isArabic ? 'هذا البريد الإلكتروني مشترك بالفعل' : 'This email is already subscribed')
        setIsLoading(false)
        return
      }

      // Add new subscription
      const subscriptionData = {
        email: email.toLowerCase().trim(),
        subscribed_at: new Date().toISOString(),
        status: 'active',
        source: 'homepage'
      }
      
      console.log('Creating newsletter subscription with data:', subscriptionData)
      const result = await firestoreService.newsletters.create(subscriptionData)
      console.log('Newsletter subscription result:', result)

      setIsSubscribed(true)
      setEmail('')
      toast.success(isArabic ? 'تم الاشتراك بنجاح!' : 'Successfully subscribed!')
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)

    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error(isArabic ? 'حدث خطأ، يرجى المحاولة مرة أخرى' : 'An error occurred, please try again')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            {isArabic ? 'شكراً لك!' : 'Thank You!'}
          </h3>
          <p className="text-green-700 dark:text-green-300">
            {isArabic 
              ? 'تم الاشتراك في النشرة الإخبارية بنجاح. ستصلك أحدث الأخبار والعروض قريباً!'
              : 'You have successfully subscribed to our newsletter. You\'ll receive the latest news and offers soon!'
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder={isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 h-12 text-base"
            disabled={isLoading}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold whitespace-nowrap"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              {isArabic ? 'جاري الاشتراك...' : 'Subscribing...'}
            </div>
          ) : (
            isArabic ? 'اشترك الآن' : 'Subscribe Now'
          )}
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {isArabic 
          ? 'بالاشتراك، أنت توافق على تلقي رسائل البريد الإلكتروني منا. يمكنك إلغاء الاشتراك في أي وقت.'
          : 'By subscribing, you agree to receive emails from us. You can unsubscribe at any time.'
        }
      </p>
    </form>
  )
}
