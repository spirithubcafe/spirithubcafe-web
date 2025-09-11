import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Save, Settings, AlertTriangle } from 'lucide-react'
import { jsonDataService } from '@/services/jsonDataService'

interface HomepageSettings {
  hero: {
    title: string
    title_ar: string
    subtitle: string
    subtitle_ar: string
    background_image: string
    background_video: string
    show_video: boolean
    cta_text: string
    cta_text_ar: string
    cta_link: string
  }
  features: {
    enabled: boolean
    items: Array<{
      id: string
      title: string
      title_ar: string
      description: string
      description_ar: string
      icon: string
      image: string
    }>
  }
  newsletter: {
    enabled: boolean
    title: string
    title_ar: string
    description: string
    description_ar: string
    placeholder: string
    placeholder_ar: string
  }
  seo: {
    title: string
    title_ar: string
    description: string
    description_ar: string
    keywords: string
    keywords_ar: string
  }
}

const defaultSettings: HomepageSettings = {
  hero: {
    title: 'Welcome to Spirit Hub Cafe',
    title_ar: 'مرحباً بكم في كافيه سبيريت هب',
    subtitle: 'Premium Coffee Experience',
    subtitle_ar: 'تجربة قهوة مميزة',
    background_image: '/images/hero-bg.jpg',
    background_video: '',
    show_video: false,
    cta_text: 'Shop Now',
    cta_text_ar: 'تسوق الآن',
    cta_link: '/products'
  },
  features: {
    enabled: true,
    items: [
      {
        id: '1',
        title: 'Premium Quality',
        title_ar: 'جودة مميزة',
        description: 'Finest coffee beans from around the world',
        description_ar: 'أجود حبوب القهوة من حول العالم',
        icon: 'coffee',
        image: '/images/feature-1.jpg'
      },
      {
        id: '2',
        title: 'Fresh Roasted',
        title_ar: 'محمصة طازجة',
        description: 'Roasted to perfection daily',
        description_ar: 'محمصة بإتقان يومياً',
        icon: 'fire',
        image: '/images/feature-2.jpg'
      },
      {
        id: '3',
        title: 'Fast Delivery',
        title_ar: 'توصيل سريع',
        description: 'Quick delivery to your doorstep',
        description_ar: 'توصيل سريع إلى عتبة بيتك',
        icon: 'truck',
        image: '/images/feature-3.jpg'
      }
    ]
  },
  newsletter: {
    enabled: true,
    title: 'Stay Updated',
    title_ar: 'ابق على تواصل',
    description: 'Get the latest updates and offers',
    description_ar: 'احصل على أحدث التحديثات والعروض',
    placeholder: 'Enter your email',
    placeholder_ar: 'أدخل بريدك الإلكتروني'
  },
  seo: {
    title: 'Spirit Hub Cafe - Premium Coffee Experience',
    title_ar: 'كافيه سبيريت هب - تجربة قهوة مميزة',
    description: 'Discover premium coffee beans and exceptional coffee experience at Spirit Hub Cafe',
    description_ar: 'اكتشف حبوب القهوة المميزة وتجربة القهوة الاستثنائية في كافيه سبيريت هب',
    keywords: 'coffee, cafe, premium, beans, espresso, latte',
    keywords_ar: 'قهوة, كافيه, مميز, حبوب, اسبريسو, لاتيه'
  }
}

export default function HomepageManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [settings, setSettings] = useState<HomepageSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.getSettings('homepage')
      if (data && data.data) {
        setSettings({ ...defaultSettings, ...data.data })
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await jsonDataService.updateSettings('homepage', settings)
      console.log(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateHeroSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }))
  }

  const updateFeatureSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [field]: value
      }
    }))
  }

  const updateNewsletterSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      newsletter: {
        ...prev.newsletter,
        [field]: value
      }
    }))
  }

  const updateSeoSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة الصفحة الرئيسية' : 'Homepage Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة محتوى وإعدادات الصفحة الرئيسية' : 'Manage homepage content and settings'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving 
            ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
            : (isArabic ? 'حفظ الإعدادات' : 'Save Settings')
          }
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isArabic 
            ? 'ملاحظة: لرفع الصور والفيديوهات، يرجى استخدام روابط الصور المباشرة أو رفعها عبر خدمة استضافة خارجية.'
            : 'Note: For uploading images and videos, please use direct image URLs or upload them via external hosting service.'
          }
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hero">
            {isArabic ? 'البانر الرئيسي' : 'Hero Section'}
          </TabsTrigger>
          <TabsTrigger value="features">
            {isArabic ? 'المميزات' : 'Features'}
          </TabsTrigger>
          <TabsTrigger value="newsletter">
            {isArabic ? 'النشرة البريدية' : 'Newsletter'}
          </TabsTrigger>
          <TabsTrigger value="seo">
            {isArabic ? 'SEO' : 'SEO'}
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات البانر الرئيسي' : 'Hero Section Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة محتوى وإعدادات البانر الرئيسي' : 'Manage hero section content and settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={settings.hero.title}
                    onChange={(e) => updateHeroSettings('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={settings.hero.title_ar}
                    onChange={(e) => updateHeroSettings('title_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان الفرعي (انجليزي)' : 'Subtitle (English)'}</Label>
                  <Input
                    value={settings.hero.subtitle}
                    onChange={(e) => updateHeroSettings('subtitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</Label>
                  <Input
                    value={settings.hero.subtitle_ar}
                    onChange={(e) => updateHeroSettings('subtitle_ar', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'صورة الخلفية' : 'Background Image URL'}</Label>
                <Input
                  value={settings.hero.background_image}
                  onChange={(e) => updateHeroSettings('background_image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>{isArabic ? 'فيديو الخلفية' : 'Background Video URL'}</Label>
                <Input
                  value={settings.hero.background_video}
                  onChange={(e) => updateHeroSettings('background_video', e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.hero.show_video}
                  onCheckedChange={(checked) => updateHeroSettings('show_video', checked)}
                />
                <Label>{isArabic ? 'عرض الفيديو بدلاً من الصورة' : 'Show video instead of image'}</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'نص الزر (انجليزي)' : 'CTA Text (English)'}</Label>
                  <Input
                    value={settings.hero.cta_text}
                    onChange={(e) => updateHeroSettings('cta_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'نص الزر (عربي)' : 'CTA Text (Arabic)'}</Label>
                  <Input
                    value={settings.hero.cta_text_ar}
                    onChange={(e) => updateHeroSettings('cta_text_ar', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'رابط الزر' : 'CTA Link'}</Label>
                <Input
                  value={settings.hero.cta_link}
                  onChange={(e) => updateHeroSettings('cta_link', e.target.value)}
                  placeholder="/products"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات المميزات' : 'Features Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة قسم المميزات' : 'Manage features section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.features.enabled}
                  onCheckedChange={(checked) => updateFeatureSettings('enabled', checked)}
                />
                <Label>{isArabic ? 'تفعيل قسم المميزات' : 'Enable features section'}</Label>
              </div>

              {settings.features.enabled && (
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    {isArabic 
                      ? 'يمكنك إدارة المميزات من خلال تعديل ملف features.json مباشرة.'
                      : 'You can manage features by editing the features.json file directly.'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Newsletter Section */}
        <TabsContent value="newsletter">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات النشرة البريدية' : 'Newsletter Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة قسم النشرة البريدية' : 'Manage newsletter section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.newsletter.enabled}
                  onCheckedChange={(checked) => updateNewsletterSettings('enabled', checked)}
                />
                <Label>{isArabic ? 'تفعيل النشرة البريدية' : 'Enable newsletter'}</Label>
              </div>

              {settings.newsletter.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                      <Input
                        value={settings.newsletter.title}
                        onChange={(e) => updateNewsletterSettings('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                      <Input
                        value={settings.newsletter.title_ar}
                        onChange={(e) => updateNewsletterSettings('title_ar', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{isArabic ? 'الوصف (انجليزي)' : 'Description (English)'}</Label>
                      <Textarea
                        value={settings.newsletter.description}
                        onChange={(e) => updateNewsletterSettings('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                      <Textarea
                        value={settings.newsletter.description_ar}
                        onChange={(e) => updateNewsletterSettings('description_ar', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{isArabic ? 'نص المربع (انجليزي)' : 'Placeholder (English)'}</Label>
                      <Input
                        value={settings.newsletter.placeholder}
                        onChange={(e) => updateNewsletterSettings('placeholder', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{isArabic ? 'نص المربع (عربي)' : 'Placeholder (Arabic)'}</Label>
                      <Input
                        value={settings.newsletter.placeholder_ar}
                        onChange={(e) => updateNewsletterSettings('placeholder_ar', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Section */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات SEO' : 'SEO Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة إعدادات تحسين محركات البحث' : 'Manage search engine optimization settings'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'عنوان الصفحة (انجليزي)' : 'Page Title (English)'}</Label>
                  <Input
                    value={settings.seo.title}
                    onChange={(e) => updateSeoSettings('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'عنوان الصفحة (عربي)' : 'Page Title (Arabic)'}</Label>
                  <Input
                    value={settings.seo.title_ar}
                    onChange={(e) => updateSeoSettings('title_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'وصف الصفحة (انجليزي)' : 'Page Description (English)'}</Label>
                  <Textarea
                    value={settings.seo.description}
                    onChange={(e) => updateSeoSettings('description', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'وصف الصفحة (عربي)' : 'Page Description (Arabic)'}</Label>
                  <Textarea
                    value={settings.seo.description_ar}
                    onChange={(e) => updateSeoSettings('description_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (انجليزي)' : 'Keywords (English)'}</Label>
                  <Input
                    value={settings.seo.keywords}
                    onChange={(e) => updateSeoSettings('keywords', e.target.value)}
                    placeholder="coffee, cafe, premium"
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (عربي)' : 'Keywords (Arabic)'}</Label>
                  <Input
                    value={settings.seo.keywords_ar}
                    onChange={(e) => updateSeoSettings('keywords_ar', e.target.value)}
                    placeholder="قهوة, كافيه, مميز"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
