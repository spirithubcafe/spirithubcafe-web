import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RichTextDisplay } from '@/components/ui/rich-text-display'
import { ArrowLeft, FileText, Calendar, AlertCircle } from 'lucide-react'
import { firestoreService, type Page } from '@/lib/firebase'
import toast from 'react-hot-toast'

export default function PageDisplayPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isArabic = i18n.language === 'ar'

  useEffect(() => {
    const getSlugFromPath = () => {
      if (slug) return slug
      const path = location.pathname
      if (path.startsWith('/page/')) {
        return path.replace('/page/', '')
      }
      // Handle direct fallback routes
      return path.replace('/', '')
    }

    const loadPage = async () => {
      const pageSlug = getSlugFromPath()
      
      if (!pageSlug) {
        setError(isArabic ? 'لم يتم العثور على الصفحة' : 'Page not found')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        const pageData = await firestoreService.pages.getBySlug(pageSlug)
        
        if (!pageData) {
          setError(isArabic ? 'لم يتم العثور على الصفحة' : 'Page not found')
        } else {
          setPage(pageData)
          // Update document title
          const title = isArabic ? pageData.title_ar : pageData.title
          document.title = `${title} - SpiritHub Cafe`
          
          // Update meta description if available
          const metaDesc = isArabic 
            ? (pageData.meta_description_ar || pageData.meta_description) 
            : (pageData.meta_description || pageData.meta_description_ar)
          
          if (metaDesc) {
            const metaDescription = document.querySelector('meta[name="description"]')
            if (metaDescription) {
              metaDescription.setAttribute('content', metaDesc)
            } else {
              const newMeta = document.createElement('meta')
              newMeta.name = 'description'
              newMeta.content = metaDesc
              document.head.appendChild(newMeta)
            }
          }
        }
      } catch (error) {
        console.error('Error loading page:', error)
        setError(isArabic ? 'خطأ في تحميل الصفحة' : 'Error loading page')
        toast.error(isArabic ? 'خطأ في تحميل الصفحة' : 'Error loading page')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug, isArabic, location.pathname]) // Use location.pathname instead of currentPath

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname]) // Use location.pathname for better tracking

  const handleGoBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-6">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                  {isArabic ? 'صفحة غير موجودة' : 'Page Not Found'}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {error || (isArabic ? 'لم يتم العثور على الصفحة المطلوبة' : 'The requested page could not be found')}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={handleGoBack} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isArabic ? 'رجوع' : 'Go Back'}
                </Button>
                <Button onClick={() => navigate('/')}>
                  {isArabic ? 'الصفحة الرئيسية' : 'Home Page'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const title = isArabic ? page.title_ar : page.title
  const content = isArabic ? page.content_ar : page.content

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isArabic ? 'رجوع' : 'Back'}
          </Button>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold leading-tight">{title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isArabic ? 'آخر تحديث: ' : 'Last updated: '}
                    {page.updated.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8 md:p-12">
            <RichTextDisplay 
              content={content}
              dir={isArabic ? 'rtl' : 'ltr'}
              className="max-w-none"
            />
          </CardContent>
        </Card>

        {/* Back to top button for long content */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="outline"
          >
            {isArabic ? 'العودة للأعلى' : 'Back to Top'}
          </Button>
        </div>
      </div>
    </div>
  )
}
