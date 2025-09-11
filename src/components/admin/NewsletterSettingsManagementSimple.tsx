import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Save,
  RefreshCw,
  Mail,
  Settings
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { jsonDataService } from '@/services/jsonDataService'

interface NewsletterSettings {
  enabled: boolean
  title: string
  title_ar: string
  description: string
  description_ar: string
  placeholder: string
  placeholder_ar: string
  success_message: string
  success_message_ar: string
  privacy_text: string
  privacy_text_ar: string
  design: {
    background_color: string
    text_color: string
    button_color: string
    button_text_color: string
  }
}

const defaultSettings: NewsletterSettings = {
  enabled: true,
  title: 'Stay Updated',
  title_ar: 'ابق على تواصل',
  description: 'Get the latest updates and offers',
  description_ar: 'احصل على أحدث التحديثات والعروض',
  placeholder: 'Enter your email',
  placeholder_ar: 'أدخل بريدك الإلكتروني',
  success_message: 'Thank you for subscribing!',
  success_message_ar: 'شكراً لك على الاشتراك!',
  privacy_text: 'We respect your privacy and will never share your email.',
  privacy_text_ar: 'نحن نحترم خصوصيتك ولن نشارك بريدك الإلكتروني مع أحد.',
  design: {
    background_color: '#f8f9fa',
    text_color: '#212529',
    button_color: '#007bff',
    button_text_color: '#ffffff'
  }
}

export default function NewsletterSettingsManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [settings, setSettings] = useState<NewsletterSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.getSettings('newsletter')
      if (data && data.data) {
        setSettings({ ...defaultSettings, ...data.data })
      }
    } catch (error) {
      console.error('Error loading newsletter settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await jsonDataService.updateSettings('newsletter', settings)
      console.log(isArabic ? 'تم حفظ إعدادات النشرة البريدية' : 'Newsletter settings saved successfully')
    } catch (error) {
      console.error('Error saving newsletter settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateDesignSettings = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      design: {
        ...prev.design,
        [field]: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إعدادات النشرة البريدية' : 'Newsletter Settings'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة إعدادات النشرة البريدية والتصميم' : 'Manage newsletter settings and design'}
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

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'عام' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="content">
            <Mail className="h-4 w-4 mr-2" />
            {isArabic ? 'المحتوى' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="design">
            {isArabic ? 'التصميم' : 'Design'}
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الإعدادات العامة' : 'General Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings('enabled', checked)}
                />
                <Label>{isArabic ? 'تفعيل النشرة البريدية' : 'Enable Newsletter'}</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={settings.title}
                    onChange={(e) => updateSettings('title', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={settings.title_ar}
                    onChange={(e) => updateSettings('title_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'الوصف (انجليزي)' : 'Description (English)'}</Label>
                  <Input
                    value={settings.description}
                    onChange={(e) => updateSettings('description', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                  <Input
                    value={settings.description_ar}
                    onChange={(e) => updateSettings('description_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'نص المربع (انجليزي)' : 'Placeholder (English)'}</Label>
                  <Input
                    value={settings.placeholder}
                    onChange={(e) => updateSettings('placeholder', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'نص المربع (عربي)' : 'Placeholder (Arabic)'}</Label>
                  <Input
                    value={settings.placeholder_ar}
                    onChange={(e) => updateSettings('placeholder_ar', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Settings */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات المحتوى' : 'Content Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'رسالة النجاح (انجليزي)' : 'Success Message (English)'}</Label>
                  <Input
                    value={settings.success_message}
                    onChange={(e) => updateSettings('success_message', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'رسالة النجاح (عربي)' : 'Success Message (Arabic)'}</Label>
                  <Input
                    value={settings.success_message_ar}
                    onChange={(e) => updateSettings('success_message_ar', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'نص الخصوصية (انجليزي)' : 'Privacy Text (English)'}</Label>
                  <Input
                    value={settings.privacy_text}
                    onChange={(e) => updateSettings('privacy_text', e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'نص الخصوصية (عربي)' : 'Privacy Text (Arabic)'}</Label>
                  <Input
                    value={settings.privacy_text_ar}
                    onChange={(e) => updateSettings('privacy_text_ar', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Settings */}
        <TabsContent value="design">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات التصميم' : 'Design Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'لون الخلفية' : 'Background Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.design.background_color}
                      onChange={(e) => updateDesignSettings('background_color', e.target.value)}
                      className="w-12 h-10 p-0 border"
                    />
                    <Input
                      value={settings.design.background_color}
                      onChange={(e) => updateDesignSettings('background_color', e.target.value)}
                      placeholder="#f8f9fa"
                    />
                  </div>
                </div>
                <div>
                  <Label>{isArabic ? 'لون النص' : 'Text Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.design.text_color}
                      onChange={(e) => updateDesignSettings('text_color', e.target.value)}
                      className="w-12 h-10 p-0 border"
                    />
                    <Input
                      value={settings.design.text_color}
                      onChange={(e) => updateDesignSettings('text_color', e.target.value)}
                      placeholder="#212529"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'لون الزر' : 'Button Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.design.button_color}
                      onChange={(e) => updateDesignSettings('button_color', e.target.value)}
                      className="w-12 h-10 p-0 border"
                    />
                    <Input
                      value={settings.design.button_color}
                      onChange={(e) => updateDesignSettings('button_color', e.target.value)}
                      placeholder="#007bff"
                    />
                  </div>
                </div>
                <div>
                  <Label>{isArabic ? 'لون نص الزر' : 'Button Text Color'}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.design.button_text_color}
                      onChange={(e) => updateDesignSettings('button_text_color', e.target.value)}
                      className="w-12 h-10 p-0 border"
                    />
                    <Input
                      value={settings.design.button_text_color}
                      onChange={(e) => updateDesignSettings('button_text_color', e.target.value)}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <Label className="text-lg font-medium">{isArabic ? 'معاينة' : 'Preview'}</Label>
                <div 
                  className="mt-4 p-6 rounded-lg border-2 border-dashed"
                  style={{ 
                    backgroundColor: settings.design.background_color,
                    color: settings.design.text_color 
                  }}
                >
                  <div className="max-w-md mx-auto text-center">
                    <h3 className="text-xl font-bold mb-2">
                      {isArabic ? settings.title_ar : settings.title}
                    </h3>
                    <p className="mb-4">
                      {isArabic ? settings.description_ar : settings.description}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder={isArabic ? settings.placeholder_ar : settings.placeholder}
                        className="flex-1"
                      />
                      <Button
                        style={{
                          backgroundColor: settings.design.button_color,
                          color: settings.design.button_text_color
                        }}
                      >
                        {isArabic ? 'اشتراك' : 'Subscribe'}
                      </Button>
                    </div>
                    <p className="text-sm mt-2 opacity-75">
                      {isArabic ? settings.privacy_text_ar : settings.privacy_text}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
