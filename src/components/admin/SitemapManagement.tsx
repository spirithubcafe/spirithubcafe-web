import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Download, 
  Globe, 
  FileText, 
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { sitemapService } from '@/services/sitemap'
import toast from 'react-hot-toast'

export default function SitemapManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{
    totalUrls: number
    lastGenerated: string
    categories: number
    products: number
    pages: number
    static: number
  } | null>(null)
  const [baseUrl, setBaseUrl] = useState(sitemapService.getBaseUrl())
  const [xmlPreview, setXmlPreview] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadStats()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadStats = async () => {
    try {
      setLoading(true)
      const sitemapStats = await sitemapService.getSitemapStats()
      setStats(sitemapStats)
    } catch (error) {
      console.error('Error loading sitemap stats:', error)
      toast.error(isArabic ? 'خطأ في تحميل إحصائيات الخريطة' : 'Error loading sitemap stats')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePreview = async () => {
    try {
      setLoading(true)
      const xml = await sitemapService.generateXmlSitemap()
      setXmlPreview(xml)
      setShowPreview(true)
      await loadStats() // Refresh stats
      toast.success(isArabic ? 'تم إنشاء معاينة الخريطة' : 'Sitemap preview generated')
    } catch (error) {
      console.error('Error generating sitemap preview:', error)
      toast.error(isArabic ? 'خطأ في إنشاء معاينة الخريطة' : 'Error generating sitemap preview')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadSitemap = async () => {
    try {
      setLoading(true)
      await sitemapService.downloadSitemap()
      toast.success(isArabic ? 'تم تحميل ملف sitemap.xml' : 'sitemap.xml downloaded successfully')
    } catch (error) {
      console.error('Error downloading sitemap:', error)
      toast.error(isArabic ? 'خطأ في تحميل الخريطة' : 'Error downloading sitemap')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadRobots = () => {
    try {
      sitemapService.downloadRobotsTxt()
      toast.success(isArabic ? 'تم تحميل ملف robots.txt' : 'robots.txt downloaded successfully')
    } catch (error) {
      console.error('Error downloading robots.txt:', error)
      toast.error(isArabic ? 'خطأ في تحميل ملف robots.txt' : 'Error downloading robots.txt')
    }
  }

  const handleUpdateBaseUrl = () => {
    try {
      sitemapService.setBaseUrl(baseUrl)
      toast.success(isArabic ? 'تم تحديث الرابط الأساسي' : 'Base URL updated successfully')
      loadStats() // Refresh stats with new URL
    } catch (error) {
      console.error('Error updating base URL:', error)
      toast.error(isArabic ? 'خطأ في تحديث الرابط الأساسي' : 'Error updating base URL')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'إدارة خريطة الموقع' : 'Sitemap Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إنشاء وإدارة خريطة الموقع للمحركات البحث' : 'Generate and manage sitemaps for search engines'}
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {isArabic ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUrls}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'إجمالي الروابط' : 'Total URLs'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.products}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'المنتجات' : 'Products'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.categories}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'الفئات' : 'Categories'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.pages}</p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'الصفحات' : 'Pages'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {isArabic ? 'إعدادات الخريطة' : 'Sitemap Configuration'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'تكوين الإعدادات الأساسية لخريطة الموقع' : 'Configure basic settings for sitemap generation'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="baseUrl" className="block mb-2">
                {isArabic ? 'الرابط الأساسي للموقع' : 'Website Base URL'}
              </Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://spirithubcafe.com"
                dir="ltr"
              />
            </div>
            <Button onClick={handleUpdateBaseUrl} variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              {isArabic ? 'تحديث' : 'Update'}
            </Button>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {isArabic 
                ? 'يجب أن يكون الرابط الأساسي هو النطاق الرئيسي لموقعك الإلكتروني دون شرطة مائلة في النهاية.'
                : 'The base URL should be your main website domain without a trailing slash.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            {isArabic ? 'إجراءات الخريطة' : 'Sitemap Actions'}
          </CardTitle>
          <CardDescription>
            {isArabic ? 'إنشاء وتحميل ملفات خريطة الموقع' : 'Generate and download sitemap files'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleGeneratePreview} disabled={loading}>
              <FileText className="h-4 w-4 mr-2" />
              {isArabic ? 'إنشاء معاينة' : 'Generate Preview'}
            </Button>

            <Button onClick={handleDownloadSitemap} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              {isArabic ? 'تحميل sitemap.xml' : 'Download sitemap.xml'}
            </Button>

            <Button onClick={handleDownloadRobots} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {isArabic ? 'تحميل robots.txt' : 'Download robots.txt'}
            </Button>
          </div>

          {stats && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-xs">
                {isArabic ? 'آخر إنشاء: ' : 'Last generated: '}
                {new Date(stats.lastGenerated).toLocaleString(isArabic ? 'ar' : 'en')}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* XML Preview */}
      {showPreview && xmlPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isArabic ? 'معاينة XML' : 'XML Preview'}
            </CardTitle>
            <CardDescription>
              {isArabic ? 'معاينة محتوى ملف sitemap.xml' : 'Preview of sitemap.xml content'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={xmlPreview}
              readOnly
              className="font-mono text-sm h-96"
              placeholder={isArabic ? 'لا توجد بيانات' : 'No data'}
            />
          </CardContent>
        </Card>
      )}

      {/* SEO Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {isArabic ? 'نصائح تحسين محركات البحث' : 'SEO Tips'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">
                {isArabic ? 'تحميل خريطة الموقع' : 'Submit Your Sitemap'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'قم برفع ملف sitemap.xml إلى Google Search Console و Bing Webmaster Tools'
                  : 'Upload sitemap.xml to Google Search Console and Bing Webmaster Tools'
                }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium">
                {isArabic ? 'تحديث منتظم' : 'Regular Updates'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'قم بإنشاء خريطة الموقع بانتظام عند إضافة منتجات أو صفحات جديدة'
                  : 'Regenerate your sitemap regularly when adding new products or pages'
                }
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium">
                {isArabic ? 'فحص الروابط' : 'Check URLs'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? 'تأكد من أن جميع الروابط في الخريطة تعمل بشكل صحيح وتعيد كود 200'
                  : 'Ensure all URLs in your sitemap return a 200 status code'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
