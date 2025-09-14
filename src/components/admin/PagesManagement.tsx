import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  ArrowLeft, 
  FileText, 
  Settings, 
  Globe, 
  Eye,
  EyeOff,
  Upload
} from 'lucide-react'
import { firestoreService, type Page } from '@/lib/firebase'
import SEOForm from '@/components/seo/SEOForm'
import type { SEOMeta } from '@/types/seo'
import toast from 'react-hot-toast'

interface PageForm {
  title: string
  title_ar: string
  content: string
  content_ar: string
  slug: string
  meta_description?: string
  meta_description_ar?: string
  is_active: boolean
  show_in_footer: boolean
  sort_order: number
  seo?: SEOMeta
}

// Helper function to convert Firebase Page to SEOMeta format
const pageToSEOMeta = (page: Page): SEOMeta => {
  return {
    title: page.meta_title || '',
    titleAr: page.meta_title_ar || '',
    description: page.meta_description || '',
    descriptionAr: page.meta_description_ar || '',
    keywords: page.meta_keywords || '',
    keywordsAr: page.meta_keywords_ar || '',
    canonicalUrl: page.canonical_url || '',
    ogTitle: page.og_title || '',
    ogTitleAr: page.og_title_ar || '',
    ogDescription: page.og_description || '',
    ogDescriptionAr: page.og_description_ar || '',
    ogImage: page.og_image || '',
    twitterTitle: page.twitter_title || '',
    twitterTitleAr: page.twitter_title_ar || '',
    twitterDescription: page.twitter_description || '',
    twitterDescriptionAr: page.twitter_description_ar || '',
    twitterImage: page.twitter_image || ''
  }
}

// Helper function to convert SEOMeta to Firebase Page fields
const seoMetaToPage = (seo: SEOMeta): Partial<Page> => {
  return {
    meta_title: seo.title,
    meta_title_ar: seo.titleAr,
    meta_description: seo.description,
    meta_description_ar: seo.descriptionAr,
    meta_keywords: seo.keywords,
    meta_keywords_ar: seo.keywordsAr,
    canonical_url: seo.canonicalUrl,
    og_title: seo.ogTitle,
    og_title_ar: seo.ogTitleAr,
    og_description: seo.ogDescription,
    og_description_ar: seo.ogDescriptionAr,
    og_image: seo.ogImage,
    twitter_title: seo.twitterTitle,
    twitter_title_ar: seo.twitterTitleAr,
    twitter_description: seo.twitterDescription,
    twitter_description_ar: seo.twitterDescriptionAr,
    twitter_image: seo.twitterImage
  }
}

// Default page templates with content from public/pages
const DEFAULT_PAGES = {
  'privacy-policy': {
    title: 'Privacy Policy',
    title_ar: 'سياسة الخصوصية',
    slug: 'privacy-policy',
    show_in_footer: true,
    sort_order: 1
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    title_ar: 'الشروط والأحكام',
    slug: 'terms-and-conditions',
    show_in_footer: true,
    sort_order: 2
  },
  'delivery-policy': {
    title: 'Delivery Policy',
    title_ar: 'سياسة التوصيل',
    slug: 'delivery-policy',
    show_in_footer: true,
    sort_order: 3
  },
  'refund-policy': {
    title: 'Refund Policy',
    title_ar: 'سياسة الاستبدال والإرجاع',
    slug: 'refund-policy',
    show_in_footer: true,
    sort_order: 4
  },
  'faq': {
    title: 'FAQ',
    title_ar: 'الأسئلة الشائعة',
    slug: 'faq',
    show_in_footer: true,
    sort_order: 5
  }
}

export default function PagesManagement() {
  const { i18n } = useTranslation()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingPage, setEditingPage] = useState<Page | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [initializing, setInitializing] = useState(false)

  const isArabic = i18n.language === 'ar'

  const [form, setForm] = useState<PageForm>({
    title: '',
    title_ar: '',
    content: '',
    content_ar: '',
    slug: '',
    meta_description: '',
    meta_description_ar: '',
    is_active: true,
    show_in_footer: false,
    sort_order: 0,
    seo: {}
  })

  const loadPages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await firestoreService.pages.list()
      setPages(response.items)
    } catch (error) {
      console.error('Error loading pages:', error)
      toast.error(isArabic ? 'خطأ في تحميل الصفحات' : 'Error loading pages')
    } finally {
      setLoading(false)
    }
  }, [isArabic])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const loadDefaultPageContent = async (pageType: string): Promise<{ content: string; content_ar: string }> => {
    try {
      let fileName = ''
      switch (pageType) {
        case 'privacy-policy':
          fileName = 'PrivacyPolicy.txt'
          break
        case 'terms-and-conditions':
          fileName = 'TermsAndConditions.txt'
          break
        case 'delivery-policy':
          fileName = 'DeliveryPolicy.txt'
          break
        case 'refund-policy':
          fileName = 'RefundPolicy.txt'
          break
        case 'faq':
          fileName = 'FAQ.txt'
          break
        default:
          return { content: '', content_ar: '' }
      }

      const response = await fetch(`/pages/${fileName}`)
      if (response.ok) {
        const content = await response.text()
        return {
          content: content,
          content_ar: content // Use same content for Arabic, can be translated later
        }
      }
    } catch (error) {
      console.warn('Could not load default content:', error)
    }
    
    return { content: '', content_ar: '' }
  }

  const initializeDefaultPages = async () => {
    try {
      setInitializing(true)
      toast.loading(isArabic ? 'جاري إنشاء الصفحات الافتراضية...' : 'Creating default pages...')

      const existingPages = await firestoreService.pages.list()
      const existingSlugs = existingPages.items.map(p => p.slug)

      let createdCount = 0
      
      for (const [pageType, pageData] of Object.entries(DEFAULT_PAGES)) {
        if (!existingSlugs.includes(pageData.slug)) {
          const { content, content_ar } = await loadDefaultPageContent(pageType)
          
          const newPage = {
            ...pageData,
            content,
            content_ar,
            meta_description: `${pageData.title} - SpiritHub Cafe`,
            meta_description_ar: `${pageData.title_ar} - سبيرت هب كافي`,
            is_active: true
          }

          await firestoreService.pages.create(newPage)
          createdCount++
        }
      }

      toast.dismiss()
      if (createdCount > 0) {
        toast.success(isArabic ? `تم إنشاء ${createdCount} صفحة بنجاح` : `Created ${createdCount} pages successfully`)
        await loadPages()
      } else {
        toast.success(isArabic ? 'جميع الصفحات الافتراضية موجودة بالفعل' : 'All default pages already exist')
      }
    } catch (error) {
      console.error('Error initializing default pages:', error)
      toast.error(isArabic ? 'خطأ في إنشاء الصفحات الافتراضية' : 'Error creating default pages')
    } finally {
      setInitializing(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const resetForm = () => {
    setForm({
      title: '',
      title_ar: '',
      content: '',
      content_ar: '',
      slug: '',
      meta_description: '',
      meta_description_ar: '',
      is_active: true,
      show_in_footer: false,
      sort_order: pages.length,
      seo: {}
    })
    setEditingPage(null)
    setActiveTab('basic')
  }

  const handleEdit = (page: Page) => {
    const convertedSEO = pageToSEOMeta(page)
    console.log('Page SEO Data Loading:', {
      original: page,
      converted: convertedSEO
    })
    setForm({
      title: page.title,
      title_ar: page.title_ar,
      content: page.content,
      content_ar: page.content_ar,
      slug: page.slug,
      meta_description: page.meta_description || '',
      meta_description_ar: page.meta_description_ar || '',
      is_active: page.is_active,
      show_in_footer: page.show_in_footer,
      sort_order: page.sort_order,
      seo: convertedSEO
    })
    setEditingPage(page)
    setShowForm(true)
  }

  const handleNew = () => {
    resetForm()
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.title_ar || !form.slug) {
      toast.error(isArabic ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields')
      return
    }

    setSaving(true)
    try {
      // Prepare data with SEO conversion
      const pageData = {
        title: form.title,
        title_ar: form.title_ar,
        content: form.content,
        content_ar: form.content_ar,
        slug: form.slug,
        meta_description: form.meta_description,
        meta_description_ar: form.meta_description_ar,
        is_active: form.is_active,
        show_in_footer: form.show_in_footer,
        sort_order: form.sort_order,
        ...(form.seo ? seoMetaToPage(form.seo) : {})
      }

      if (editingPage) {
        await firestoreService.pages.update(editingPage.id, pageData)
        toast.success(isArabic ? 'تم تحديث الصفحة بنجاح' : 'Page updated successfully')
      } else {
        await firestoreService.pages.create(pageData)
        toast.success(isArabic ? 'تم إنشاء الصفحة بنجاح' : 'Page created successfully')
      }

      await loadPages()
      setShowForm(false)
      resetForm()
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error(isArabic ? 'خطأ في حفظ الصفحة' : 'Error saving page')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (page: Page) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
      return
    }

    try {
      await firestoreService.pages.delete(page.id)
      toast.success(isArabic ? 'تم حذف الصفحة بنجاح' : 'Page deleted successfully')
      await loadPages()
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error(isArabic ? 'خطأ في حذف الصفحة' : 'Error deleting page')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {editingPage 
                ? (isArabic ? 'تعديل الصفحة' : 'Edit Page')
                : (isArabic ? 'إنشاء صفحة جديدة' : 'Create New Page')
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {editingPage 
                ? (isArabic ? 'تعديل محتوى الصفحة' : 'Edit page content')
                : (isArabic ? 'إنشاء صفحة جديدة للموقع' : 'Create a new page for the website')
              }
            </p>
          </div>
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isArabic ? 'رجوع' : 'Back'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {isArabic ? 'المحتوى' : 'Content'}
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {isArabic ? 'إعدادات SEO' : 'SEO Settings'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'أدخل المعلومات الأساسية للصفحة' : 'Enter the basic page information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-en">{isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'} *</Label>
                    <Input
                      id="title-en"
                      value={form.title}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        title: e.target.value,
                        slug: !editingPage ? generateSlug(e.target.value) : prev.slug
                      }))}
                      placeholder={isArabic ? 'أدخل عنوان الصفحة بالإنجليزية' : 'Enter page title in English'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title-ar">{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'} *</Label>
                    <Input
                      id="title-ar"
                      value={form.title_ar}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        title_ar: e.target.value
                      }))}
                      placeholder={isArabic ? 'أدخل عنوان الصفحة بالعربية' : 'Enter page title in Arabic'}
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">{isArabic ? 'الرابط المختصر' : 'Slug'} *</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-slug"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sort-order">{isArabic ? 'ترتيب العرض' : 'Sort Order'}</Label>
                    <Input
                      id="sort-order"
                      type="number"
                      min="0"
                      value={form.sort_order}
                      onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is-active">{isArabic ? 'صفحة نشطة' : 'Active Page'}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-in-footer"
                      checked={form.show_in_footer}
                      onCheckedChange={(checked) => setForm(prev => ({ ...prev, show_in_footer: checked }))}
                    />
                    <Label htmlFor="show-in-footer">{isArabic ? 'عرض في الفوتر' : 'Show in Footer'}</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'محتوى الصفحة' : 'Page Content'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'اكتب محتوى الصفحة بالإنجليزية والعربية' : 'Write the page content in English and Arabic'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="content-en">{isArabic ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                  <RichTextEditor
                    value={form.content}
                    onChange={(value) => setForm(prev => ({ ...prev, content: value }))}
                    placeholder={isArabic ? 'اكتب محتوى الصفحة بالإنجليزية' : 'Write page content in English'}
                    direction="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-ar">{isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                  <RichTextEditor
                    value={form.content_ar}
                    onChange={(value) => setForm(prev => ({ ...prev, content_ar: value }))}
                    placeholder={isArabic ? 'اكتب محتوى الصفحة بالعربية' : 'Write page content in Arabic'}
                    direction="rtl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOForm
              initialData={form.seo || {}}
              onChange={(seoData) => setForm(prev => ({ ...prev, seo: seoData }))}
              entityType="page"
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isArabic ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {isArabic ? 'حفظ' : 'Save'}
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{isArabic ? 'إدارة الصفحات' : 'Pages Management'}</h3>
          <p className="text-sm text-muted-foreground">
            {isArabic ? 'إدارة صفحات الموقع مثل سياسة الخصوصية والشروط والأحكام' : 'Manage website pages like privacy policy, terms & conditions'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={initializeDefaultPages}
            disabled={initializing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {initializing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                {isArabic ? 'جاري الإنشاء...' : 'Creating...'}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {isArabic ? 'إنشاء الصفحات الافتراضية' : 'Create Default Pages'}
              </>
            )}
          </Button>
          <Button onClick={handleNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isArabic ? 'صفحة جديدة' : 'New Page'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'جميع الصفحات' : 'All Pages'}</CardTitle>
          <CardDescription>
            {isArabic ? 'عرض وإدارة جميع صفحات الموقع' : 'View and manage all website pages'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isArabic ? 'لا توجد صفحات' : 'No pages found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isArabic ? 'ابدأ بإنشاء صفحة جديدة أو استيراد الصفحات الافتراضية' : 'Start by creating a new page or importing default pages'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={initializeDefaultPages} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  {isArabic ? 'استيراد الصفحات الافتراضية' : 'Import Default Pages'}
                </Button>
                <Button onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? 'إنشاء صفحة جديدة' : 'Create New Page'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {isArabic ? page.title_ar : page.title}
                      </h4>
                      <div className="flex gap-2">
                        {page.is_active ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {isArabic ? 'نشطة' : 'Active'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            {isArabic ? 'غير نشطة' : 'Inactive'}
                          </Badge>
                        )}
                        {page.show_in_footer && (
                          <Badge variant="outline">
                            {isArabic ? 'في الفوتر' : 'In Footer'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{page.slug}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isArabic ? 'تم التحديث: ' : 'Updated: '}
                      {page.updated.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page)}
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
