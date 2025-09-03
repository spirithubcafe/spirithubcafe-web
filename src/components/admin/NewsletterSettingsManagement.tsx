import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Upload, 
  Image, 
  Palette, 
  Save,
  RefreshCw,
  Monitor,
  Moon,
  Sun,
  Users,
  Trash2,
  Download,
  FileImage
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useData, useGlobalNewsletterSettings } from '@/contexts/enhanced-data-provider'
import { settingsService } from '@/services/settings'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { getNewsletterSubscribers, unsubscribeFromNewsletter, type NewsletterSubscriber } from '@/services/newsletters'
import toast from 'react-hot-toast'

export default function NewsletterSettingsManagement() {
  const { i18n } = useTranslation()
  const { settings, loading } = useGlobalNewsletterSettings()
  
  // Get refresh function from context
  const { refreshNewsletterSettings } = useData()
  
  const [formData, setFormData] = useState({
    showNewsletterSection: true,
    newsletterBackgroundType: 'color' as 'color' | 'image',
    newsletterBackgroundColor: '#f8fafc',
    newsletterBackgroundColorLight: '#f8fafc',
    newsletterBackgroundColorDark: '#1e293b',
    newsletterBackgroundImage: '',
    newsletterImage: '',
    newsletterTitle: 'Subscribe to our Newsletter',
    newsletterTitleAr: 'اشترك في نشرتنا الإخبارية',
    newsletterDescription: 'Get the latest updates and exclusive offers.',
    newsletterDescriptionAr: 'احصل على آخر التحديثات والعروض الحصرية.'
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loadingSubscribers, setLoadingSubscribers] = useState(false)
  
  const isArabic = i18n.language === 'ar'

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setFormData({
        showNewsletterSection: settings.showNewsletterSection ?? true,
        newsletterBackgroundType: settings.newsletterBackgroundType ?? 'color',
        newsletterBackgroundColor: settings.newsletterBackgroundColor ?? '#f8fafc',
        newsletterBackgroundColorLight: settings.newsletterBackgroundColorLight ?? '#f8fafc',
        newsletterBackgroundColorDark: settings.newsletterBackgroundColorDark ?? '#1e293b',
        newsletterBackgroundImage: settings.newsletterBackgroundImage ?? '',
        newsletterImage: settings.newsletterImage ?? '',
        newsletterTitle: settings.newsletterTitle ?? 'Subscribe to our Newsletter',
        newsletterTitleAr: settings.newsletterTitleAr ?? 'اشترك في نشرتنا الإخبارية',
        newsletterDescription: settings.newsletterDescription ?? 'Get the latest updates and exclusive offers.',
        newsletterDescriptionAr: settings.newsletterDescriptionAr ?? 'احصل على آخر التحديثات والعروض الحصرية.'
      })
    }
  }, [settings])

  // Load subscribers
  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setLoadingSubscribers(true)
    try {
      const subscribersData = await getNewsletterSubscribers()
      setSubscribers(subscribersData)
    } catch (error) {
      console.error('Error loading subscribers:', error)
      toast.error(isArabic ? 'خطأ في تحميل المشتركين' : 'Error loading subscribers')
    } finally {
      setLoadingSubscribers(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'background' | 'newsletter') => {
    if (!file) return

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `newsletter/${type}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      if (type === 'background') {
        setFormData(prev => ({ ...prev, newsletterBackgroundImage: downloadURL }))
      } else {
        setFormData(prev => ({ ...prev, newsletterImage: downloadURL }))
      }
      
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await settingsService.updateNewsletterSettings(formData)
      toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
      refreshNewsletterSettings()
    } catch (error) {
      console.error('Error saving newsletter settings:', error)
      toast.error(isArabic ? 'خطأ في حفظ الإعدادات' : 'Error saving settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSubscriber = async (subscriberId: string) => {
    try {
      await unsubscribeFromNewsletter(subscriberId)
      toast.success(isArabic ? 'تم حذف المشترك بنجاح' : 'Subscriber deleted successfully')
      loadSubscribers()
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      toast.error(isArabic ? 'خطأ في حذف المشترك' : 'Error deleting subscriber')
    }
  }

  const exportSubscribers = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Date,Status\n"
      + subscribers.map(sub => {
          const dateField = sub.subscribed_at
          let dateStr = 'N/A'
          if (dateField) {
            if (typeof dateField === 'string') {
              dateStr = new Date(dateField).toISOString()
            } else if (typeof dateField === 'object' && dateField !== null && 'toDate' in dateField && typeof (dateField as any).toDate === 'function') {
              dateStr = (dateField as any).toDate().toISOString()
            } else if (dateField instanceof Date) {
              dateStr = dateField.toISOString()
            } else if (typeof dateField === 'number') {
              dateStr = new Date(dateField).toISOString()
            }
          }
          return `${sub.email},${dateStr},${sub.status || 'active'}`
        }).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "newsletter_subscribers.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'إدارة إعدادات النشرة الإخبارية' : 'Newsletter Settings Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isArabic 
              ? 'تخصيص مظهر ومحتوى قسم النشرة الإخبارية' 
              : 'Customize the appearance and content of the newsletter section'
            }
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            {isArabic ? 'عام' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="background">
            {isArabic ? 'الخلفية' : 'Background'}
          </TabsTrigger>
          <TabsTrigger value="content">
            {isArabic ? 'المحتوى' : 'Content'}
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            {isArabic ? 'المشتركين' : 'Subscribers'}
          </TabsTrigger>
        </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    {isArabic ? 'الإعدادات العامة' : 'General Settings'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic 
                      ? 'إعدادات عرض وسلوك قسم النشرة الإخبارية' 
                      : 'Display and behavior settings for the newsletter section'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">
                        {isArabic ? 'إظهار قسم النشرة الإخبارية' : 'Show Newsletter Section'}
                      </Label>
                      <div className="text-sm text-gray-500">
                        {isArabic 
                          ? 'تفعيل أو إلغاء عرض قسم النشرة الإخبارية في الموقع' 
                          : 'Enable or disable the newsletter section on the website'
                        }
                      </div>
                    </div>
                    <Switch
                      checked={formData.showNewsletterSection}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, showNewsletterSection: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Background Settings */}
            <TabsContent value="background">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    {isArabic ? 'إعدادات الخلفية' : 'Background Settings'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic 
                      ? 'تخصيص لون أو صورة خلفية قسم النشرة الإخبارية' 
                      : 'Customize the background color or image for the newsletter section'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Background Type */}
                  <div className="space-y-2">
                    <Label>{isArabic ? 'نوع الخلفية' : 'Background Type'}</Label>
                    <Select
                      value={formData.newsletterBackgroundType}
                      onValueChange={(value: 'color' | 'image') => 
                        setFormData(prev => ({ ...prev, newsletterBackgroundType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isArabic ? 'اختر نوع الخلفية' : 'Select background type'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="color">{isArabic ? 'لون خالص' : 'Solid Color'}</SelectItem>
                        <SelectItem value="image">{isArabic ? 'صورة خلفية' : 'Background Image'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.newsletterBackgroundType === 'color' ? (
                    <div className="space-y-4">
                      {/* Light Mode Color */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          {isArabic ? 'لون الخلفية (الوضع الفاتح)' : 'Background Color (Light Mode)'}
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.newsletterBackgroundColorLight}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              newsletterBackgroundColorLight: e.target.value 
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            title={isArabic ? 'اختر لون الخلفية للوضع الفاتح' : 'Choose background color for light mode'}
                          />
                          <Input
                            value={formData.newsletterBackgroundColorLight}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              newsletterBackgroundColorLight: e.target.value 
                            }))}
                            placeholder="#f8fafc"
                            className="font-mono"
                          />
                        </div>
                      </div>

                      {/* Dark Mode Color */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          {isArabic ? 'لون الخلفية (الوضع المظلم)' : 'Background Color (Dark Mode)'}
                        </Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.newsletterBackgroundColorDark}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              newsletterBackgroundColorDark: e.target.value 
                            }))}
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            title={isArabic ? 'اختر لون الخلفية للوضع المظلم' : 'Choose background color for dark mode'}
                          />
                          <Input
                            value={formData.newsletterBackgroundColorDark}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              newsletterBackgroundColorDark: e.target.value 
                            }))}
                            placeholder="#1e293b"
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        {isArabic ? 'صورة الخلفية' : 'Background Image'}
                      </Label>
                      
                      {/* URL Input */}
                      <div className="space-y-2">
                        <Label className="text-sm">{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={formData.newsletterBackgroundImage}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              newsletterBackgroundImage: e.target.value 
                            }))}
                            placeholder={isArabic ? 'أدخل رابط الصورة' : 'Enter image URL'}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('background-file-input')?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2"
                          >
                            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isArabic ? 'رفع' : 'Upload'}
                          </Button>
                        </div>
                        <input
                          id="background-file-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          title={isArabic ? 'اختر صورة الخلفية' : 'Select background image'}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'background')
                          }}
                        />
                      </div>
                      
                      {formData.newsletterBackgroundImage && (
                        <div className="space-y-2">
                          <Label className="text-sm">{isArabic ? 'معاينة الصورة' : 'Image Preview'}</Label>
                          <div className="w-full h-32 border rounded-lg overflow-hidden">
                            <img 
                              src={formData.newsletterBackgroundImage} 
                              alt="Background preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-image.jpg'
                              }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        {isArabic 
                          ? 'يفضل استخدام صور بدقة عالية وبنسبة عرض إلى ارتفاع 16:9' 
                          : 'Prefer high-resolution images with 16:9 aspect ratio'
                        }
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Settings */}
            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    {isArabic ? 'إعدادات المحتوى' : 'Content Settings'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic 
                      ? 'تخصيص نصوص ومحتوى قسم النشرة الإخبارية' 
                      : 'Customize texts and content for the newsletter section'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Title */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                      <Input
                        value={formData.newsletterTitle}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          newsletterTitle: e.target.value 
                        }))}
                        placeholder="Subscribe to our Newsletter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                      <Input
                        value={formData.newsletterTitleAr}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          newsletterTitleAr: e.target.value 
                        }))}
                        placeholder="اشترك في نشرتنا الإخبارية"
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                      <Input
                        value={formData.newsletterDescription}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          newsletterDescription: e.target.value 
                        }))}
                        placeholder="Get the latest updates and exclusive offers."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                      <Input
                        value={formData.newsletterDescriptionAr}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          newsletterDescriptionAr: e.target.value 
                        }))}
                        placeholder="احصل على آخر التحديثات والعروض الحصرية."
                        className="text-right"
                      />
                    </div>
                  </div>

                  {/* Newsletter Image */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2">
                      <FileImage className="w-4 h-4" />
                      {isArabic ? 'صورة النشرة الإخبارية' : 'Newsletter Image'}
                    </Label>
                    
                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label className="text-sm">{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.newsletterImage}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            newsletterImage: e.target.value 
                          }))}
                          placeholder={isArabic ? 'أدخل رابط الصورة' : 'Enter image URL'}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('newsletter-file-input')?.click()}
                          disabled={isUploading}
                          className="flex items-center gap-2"
                        >
                          {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {isArabic ? 'رفع' : 'Upload'}
                        </Button>
                      </div>
                      <input
                        id="newsletter-file-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        title={isArabic ? 'اختر صورة النشرة الإخبارية' : 'Select newsletter image'}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, 'newsletter')
                        }}
                      />
                    </div>
                    
                    {formData.newsletterImage && (
                      <div className="space-y-2">
                        <Label className="text-sm">{isArabic ? 'معاينة الصورة' : 'Image Preview'}</Label>
                        <div className="w-full max-w-xs h-32 border rounded-lg overflow-hidden">
                          <img 
                            src={formData.newsletterImage} 
                            alt="Newsletter preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-image.jpg'
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      {isArabic 
                        ? 'صورة تظهر بجانب نموذج الاشتراك في النشرة الإخبارية' 
                        : 'Image displayed next to the newsletter subscription form'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscribers Tab */}
            <TabsContent value="subscribers">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {isArabic ? 'قائمة المشتركين' : 'Subscribers List'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic 
                      ? 'إدارة قائمة المشتركين في النشرة الإخبارية' 
                      : 'Manage newsletter subscribers list'
                    }
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={loadSubscribers}
                      variant="outline"
                      size="sm"
                      disabled={loadingSubscribers}
                    >
                      {loadingSubscribers ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {isArabic ? 'تحديث' : 'Refresh'}
                    </Button>
                    <Button
                      onClick={exportSubscribers}
                      variant="outline" 
                      size="sm"
                      disabled={subscribers.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isArabic ? 'تصدير CSV' : 'Export CSV'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingSubscribers ? (
                    <div className="flex items-center justify-center p-4">
                      <RefreshCw className="w-6 h-6 animate-spin" />
                      <span className="ml-2">{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
                    </div>
                  ) : subscribers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {isArabic ? 'لا يوجد مشتركين حتى الآن' : 'No subscribers yet'}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{isArabic ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                          <TableHead>{isArabic ? 'تاريخ الاشتراك' : 'Subscribe Date'}</TableHead>
                          <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                          <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.map((subscriber) => (
                          <TableRow key={subscriber.id || subscriber.email}>
                            <TableCell className="font-medium">{subscriber.email}</TableCell>
                            <TableCell>
                              {(() => {
                                const dateField = subscriber.subscribed_at
                                if (dateField) {
                                  // Handle ISO string date
                                  if (typeof dateField === 'string') {
                                    return new Date(dateField).toLocaleDateString()
                                  }
                                  // Handle Firestore Timestamp
                                  if (typeof dateField === 'object' && dateField !== null && 'toDate' in dateField && typeof (dateField as any).toDate === 'function') {
                                    return (dateField as any).toDate().toLocaleDateString()
                                  }
                                  // Handle JavaScript Date
                                  if (dateField instanceof Date) {
                                    return dateField.toLocaleDateString()
                                  }
                                  // Handle timestamp number
                                  if (typeof dateField === 'number') {
                                    return new Date(dateField).toLocaleDateString()
                                  }
                                }
                                return 'N/A'
                              })()}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                subscriber.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {subscriber.status === 'active' 
                                  ? (isArabic ? 'نشط' : 'Active')
                                  : (isArabic ? 'غير نشط' : 'Inactive')
                                }
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button
                                onClick={() => handleDeleteSubscriber(subscriber.id || '')}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={!subscriber.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
      </div>
    )
  }
