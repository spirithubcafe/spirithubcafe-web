import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Save, 
  FileVideo, 
  Eye, 
  Settings,
  AlertTriangle,
  X
} from 'lucide-react'
import { useCategoriesSettings } from '@/hooks/useCategoriesSettings'
import { storageService, auth } from '@/lib/firebase'
import { settingsService } from '@/services/settings'
import toast from 'react-hot-toast'

export default function CategoriesBackgroundManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const { settings, loading, updateSettings } = useCategoriesSettings()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewVideo, setPreviewVideo] = useState<string>('')

  const [formData, setFormData] = useState({
    backgroundVideo: '',
    backgroundVideoBlur: 30,
    showBackgroundVideo: true,
    overlayOpacity: 70
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        backgroundVideo: settings.backgroundVideo || '',
        backgroundVideoBlur: settings.backgroundVideoBlur || 30,
        showBackgroundVideo: settings.showBackgroundVideo ?? true,
        overlayOpacity: settings.overlayOpacity || 70
      })
      setPreviewVideo(settings.backgroundVideo || '')
    }
  }, [settings])

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error(isArabic ? 'يرجى رفع ملف فيديو صالح' : 'Please upload a valid video file')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      toast.error(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 50MB)' : 'File size too large (max 50MB)')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const user = auth.currentUser
      console.log('Current user:', user)
      console.log('User email verified:', user?.emailVerified)
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before uploading files')
      }

      // Upload video to storage
      const fileName = `categories-background-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `videos/categories/${fileName}`
      
      console.log('Uploading to path:', filePath)
      console.log('File size:', file.size, 'bytes')
      console.log('File type:', file.type)
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const downloadUrl = await storageService.upload(filePath, file)
      
      console.log('Upload successful, download URL:', downloadUrl)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ ...prev, backgroundVideo: downloadUrl }))
      setPreviewVideo(downloadUrl)
      
      toast.success(isArabic ? 'تم رفع الفيديو بنجاح' : 'Video uploaded successfully')
    } catch (error) {
      console.error('Error uploading video:', error)
      
      // Clear progress
      const progressInterval2 = setInterval(() => {
        setUploadProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval2)
            return 0
          }
          return prev - 10
        })
      }, 100)
      
      // Specific error handling
      let errorMessage = isArabic ? 'خطأ في رفع الفيديو' : 'Error uploading video'
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الملفات' : 'You do not have permission to upload files'
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = isArabic ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('storage/unauthenticated') || error.message.includes('not authenticated')) {
          errorMessage = isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'
        } else if (error.message.includes('network')) {
          errorMessage = isArabic ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' : 'Network error, please try again'
        } else {
          errorMessage = `${isArabic ? 'خطأ' : 'Error'}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      const input = event.target
      if (input) {
        input.value = ''
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateSettings(formData)
      
      // Force cache invalidation and refresh
      settingsService.forceRefreshCategories()
      
      toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
      
      // Add a small delay then trigger a page refresh signal
      setTimeout(() => {
        // Trigger a custom event that HomePage can listen to
        window.dispatchEvent(new CustomEvent('categoriesSettingsUpdated'))
      }, 500)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(isArabic ? 'خطأ في حفظ الإعدادات' : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, backgroundVideo: '' }))
    setPreviewVideo('')
    toast.success(isArabic ? 'تم إزالة الفيديو' : 'Video removed')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'تنظیمات بک‌گراند دسته‌بندی‌ها' : 'Categories Background Settings'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة فيديو الخلفية وتأثيراته للفئات' : 'Manage background video and effects for categories section'}
          </p>
        </div>
      </div>

      {/* Video Upload Section */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-full">
              <FileVideo className="h-6 w-6 text-primary" />
            </div>
            {isArabic ? 'إدارة فيديو الخلفية' : 'Background Video Management'}
          </CardTitle>
          <CardDescription className="text-base">
            {isArabic ? 'رفع وإدارة فيديو خلفية القسم مع تأثير Parallax' : 'Upload and manage section background video with parallax effect'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Current Video Preview */}
          {previewVideo && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-background rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-foreground">
                    {isArabic ? 'الفيديو الحالي' : 'Current Video'}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeVideo}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <video
                  src={previewVideo}
                  className="w-full max-w-md rounded-lg shadow-lg aspect-video mx-auto"
                  controls
                  muted
                />
              </div>
            </div>
          )}

          {/* Upload Zone */}
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold mb-2 text-foreground">
                {isArabic ? 'رفع فيديو جديد' : 'Upload New Video'}
              </h4>
              <p className="text-muted-foreground text-sm">
                {isArabic ? 'اسحب الملف هنا أو انقر للتصفح' : 'Drag and drop your video here or click to browse'}
              </p>
            </div>

            {/* Drag & Drop Upload Area */}
            <div className="relative">
              <Input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                ${uploading 
                  ? 'border-primary bg-primary/5 cursor-not-allowed' 
                  : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5 cursor-pointer'
                }
              `}>
                <div className="flex flex-col items-center space-y-4">
                  <div className={`
                    p-4 rounded-full transition-colors duration-300
                    ${uploading ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}
                  `}>
                    <FileVideo className={`h-8 w-8 ${uploading ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-base font-medium text-foreground">
                      {uploading 
                        ? (isArabic ? 'جاري الرفع...' : 'Uploading...') 
                        : (isArabic ? 'اختر ملف فيديو' : 'Choose video file')
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'MP4, WebM, MOV (الحد الأقصى: 50MB)' : 'MP4, WebM, MOV (Max: 50MB)'}
                    </p>
                  </div>

                  {uploading && (
                    <div className="w-full max-w-xs space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isArabic ? 'التقدم' : 'Progress'}
                        </span>
                        <span className="font-medium text-primary">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out`}
                          {...({ style: { width: `${uploadProgress}%` } })}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Manual URL Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-sm text-muted-foreground bg-background px-3">
                  {isArabic ? 'أو أدخل رابط الفيديو' : 'Or enter video URL'}
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-url" className="text-sm font-medium">
                  {isArabic ? 'رابط الفيديو' : 'Video URL'}
                </Label>
                <Input
                  id="video-url"
                  value={formData.backgroundVideo}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, backgroundVideo: e.target.value }))
                    setPreviewVideo(e.target.value)
                  }}
                  placeholder={isArabic ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4'}
                  className="text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Settings */}
      <Card className="border border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl">
                {isArabic ? 'إعدادات الفيديو المتقدمة' : 'Advanced Video Settings'}
              </span>
            </div>
            <Badge variant="outline" className="bg-background">
              {isArabic ? 'متقدم' : 'Advanced'}
            </Badge>
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {isArabic ? 'تخصيص مظهر وتأثيرات الفيديو مع خيارات متقدمة' : 'Customize video appearance and effects with advanced options'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          {/* Show/Hide Video */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {isArabic ? 'عرض فيديو الخلفية' : 'Show Background Video'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'تفعيل أو إلغاء فيديو الخلفية في قسم الفئات' : 'Enable or disable background video in categories section'}
              </p>
            </div>
            <Switch
              checked={formData.showBackgroundVideo}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, showBackgroundVideo: checked }))
              }
              className="data-[state=checked]:bg-primary"
            />
          </div>

          {/* Blur Intensity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold text-foreground">
                {isArabic ? 'شدة الضبابية' : 'Blur Intensity'}
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm font-medium">
                  {formData.backgroundVideoBlur}%
                </Badge>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="px-4 py-3 bg-muted/50 rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-3">
                  {isArabic ? 'اسحب المؤشر لضبط مستوى الضبابية' : 'Drag the slider to adjust blur level'}
                </p>
            <Input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.backgroundVideoBlur}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, backgroundVideoBlur: parseInt(e.target.value) }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isArabic ? 'واضح' : 'Clear'}</span>
              <span>{isArabic ? 'ضبابي جداً' : 'Very Blurry'}</span>
            </div>
          </div>
          </div>
          {/* Overlay Opacity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base">
                {isArabic ? 'شفافية الطبقة العلوية' : 'Overlay Opacity'}
              </Label>
              <Badge variant="secondary">
                {formData.overlayOpacity}%
              </Badge>
            </div>
            <Input
              type="range"
              min="0"
              max="100"
              step="10"
              value={formData.overlayOpacity}
              onChange={(e) => 
                setFormData(prev => ({ ...prev, overlayOpacity: parseInt(e.target.value) }))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{isArabic ? 'شفاف' : 'Transparent'}</span>
              <span>{isArabic ? 'معتم' : 'Opaque'}</span>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {formData.showBackgroundVideo && previewVideo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {isArabic ? 'معاينة با افکت Parallax' : 'Parallax Preview'}
            </CardTitle>
            <CardDescription>
              {isArabic ? 'پیش‌نمایش ویدیو با افکت حرکت موازی' : 'Preview video with parallax motion effect'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg overflow-hidden aspect-video bg-gray-900">
              <video
                src={previewVideo}
                autoPlay
                loop
                muted
                className={`absolute -top-[15%] -left-[15%] min-w-[130%] min-h-[130%] object-cover transition-all duration-300 ${
                  formData.backgroundVideoBlur <= 12.5 
                    ? 'blur-none' 
                    : formData.backgroundVideoBlur <= 25 
                    ? 'blur-sm' 
                    : formData.backgroundVideoBlur <= 50 
                    ? 'blur' 
                    : formData.backgroundVideoBlur <= 75 
                    ? 'blur-lg' 
                    : 'blur-xl'
                }`}
                onMouseMove={(e) => {
                  // Simple parallax simulation on mouse move (reduced movement)
                  const video = e.currentTarget
                  const rect = video.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const centerX = rect.width / 2
                  const centerY = rect.height / 2
                  const deltaX = (x - centerX) / centerX
                  const deltaY = (y - centerY) / centerY
                  
                  video.style.transform = `translate3d(${deltaX * -5}px, ${deltaY * -5}px, 0) scale(1.2)`
                }}
                onMouseLeave={(e) => {
                  // Reset position
                  e.currentTarget.style.transform = 'translate3d(0, 0, 0) scale(1.2)'
                }}
              />
              {/* Black overlay */}
              <div 
                className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                  formData.overlayOpacity <= 10 
                    ? 'opacity-10'
                    : formData.overlayOpacity <= 20
                    ? 'opacity-20'
                    : formData.overlayOpacity <= 30
                    ? 'opacity-30'
                    : formData.overlayOpacity <= 40
                    ? 'opacity-40'
                    : formData.overlayOpacity <= 50
                    ? 'opacity-50'
                    : formData.overlayOpacity <= 60
                    ? 'opacity-60'
                    : formData.overlayOpacity <= 70
                    ? 'opacity-70'
                    : formData.overlayOpacity <= 80
                    ? 'opacity-80'
                    : formData.overlayOpacity <= 90
                    ? 'opacity-90'
                    : 'opacity-70'
                }`}
              />
              {/* Theme-aware gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-2xl font-bold drop-shadow-lg mb-2 text-foreground">
                    {isArabic ? 'فئات SpiritHub' : 'SpiritHub Categories'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {isArabic ? 'استكشف مجموعة القهوة لدينا' : 'Explore our coffee collection'}
                  </p>
                  <div className="text-sm text-muted-foreground/80 bg-background/20 rounded-lg px-3 py-1 inline-block backdrop-blur-sm">
                    {isArabic ? 'تحرک الماوس لرؤیة تأثیر Parallax' : 'Move mouse to see parallax effect'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isArabic ? 'حفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isArabic 
            ? 'لأفضل النتائج، استخدم فيديو بجودة 1080p أو أعلى بنسبة عرض إلى ارتفاع 16:9. تجنب الفيديوهات السريعة الحركة للحصول على تأثير أفضل.'
            : 'For best results, use 1080p or higher quality video with 16:9 aspect ratio. Avoid fast-moving videos for better visual effect.'
          }
        </AlertDescription>
      </Alert>
    </div>
  )
}
