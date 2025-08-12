import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Image, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'
import { heroService } from '@/services/hero'
import type { HeroSlide } from '@/types'
import toast from 'react-hot-toast'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function AddHeroSlidePage() {
  useScrollToTopOnRouteChange()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const [loading, setLoading] = useState(false)

  // Form state for slide creation
  const [slideForm, setSlideForm] = useState({
    title: '',
    title_ar: '',
    subtitle: '',
    subtitle_ar: '',
    description: '',
    description_ar: '',
    media_type: 'image' as 'image' | 'video',
    media_url: '',
    media_thumbnail: '',
    blur_intensity: 6,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    button_text: '',
    button_text_ar: '',
    button_link: '',
    button_variant: 'primary' as 'primary' | 'secondary' | 'outline',
    secondary_button_text: '',
    secondary_button_text_ar: '',
    secondary_button_link: '',
    text_position: 'center' as 'left' | 'center' | 'right',
    text_alignment: 'center' as 'left' | 'center' | 'right',
    overlay_opacity: 70,
    overlay_color: '#000000',
    is_active: true,
  })

  const handleInputChange = (field: string, value: any) => {
    setSlideForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!slideForm.title || !slideForm.media_url) {
      toast.error(isRTL ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields')
      return
    }

    setLoading(true)
    try {
      const newSlide: Omit<HeroSlide, 'id'> = {
        ...slideForm,
        sort_order: 0, // Will be set by the service
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        duration: 0 // Set a default value or add to form if needed
      }

      await heroService.addSlide(newSlide)
      toast.success(isRTL ? 'تم إضافة الشريحة بنجاح' : 'Slide added successfully')
      navigate('/dashboard?section=hero-slider')
    } catch (error) {
      console.error('Error adding slide:', error)
      toast.error(isRTL ? 'فشل في إضافة الشريحة' : 'Failed to add slide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard?section=hero-slider')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isRTL ? 'العودة' : 'Back'}
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isRTL ? 'إضافة شريحة جديدة' : 'Add New Slide'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إنشاء شريحة جديدة لشريط العرض الرئيسي' : 'Create a new slide for the hero slider'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
            <CardDescription>
              {isRTL ? 'النص والمحتوى الأساسي للشريحة' : 'Basic text and content for the slide'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">{isRTL ? 'العنوان (إنجليزي) *' : 'Title (English) *'}</Label>
              <Input
                id="title"
                value={slideForm.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان بالإنجليزية' : 'Enter title in English'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_ar">{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
              <Input
                id="title_ar"
                value={slideForm.title_ar}
                onChange={(e) => handleInputChange('title_ar', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان بالعربية' : 'Enter title in Arabic'}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">{isRTL ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}</Label>
              <Input
                id="subtitle"
                value={slideForm.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان الفرعي بالإنجليزية' : 'Enter subtitle in English'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle_ar">{isRTL ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</Label>
              <Input
                id="subtitle_ar"
                value={slideForm.subtitle_ar}
                onChange={(e) => handleInputChange('subtitle_ar', e.target.value)}
                placeholder={isRTL ? 'أدخل العنوان الفرعي بالعربية' : 'Enter subtitle in Arabic'}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
              <Textarea
                id="description"
                value={slideForm.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف بالإنجليزية' : 'Enter description in English'}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_ar">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
              <Textarea
                id="description_ar"
                value={slideForm.description_ar}
                onChange={(e) => handleInputChange('description_ar', e.target.value)}
                placeholder={isRTL ? 'أدخل الوصف بالعربية' : 'Enter description in Arabic'}
                dir="rtl"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media Settings */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'إعدادات الوسائط' : 'Media Settings'}</CardTitle>
            <CardDescription>
              {isRTL ? 'الصور والفيديوهات والمؤثرات البصرية' : 'Images, videos, and visual effects'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'نوع الوسائط' : 'Media Type'}</Label>
              <Select
                value={slideForm.media_type}
                onValueChange={(value: 'image' | 'video') => handleInputChange('media_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      {isRTL ? 'صورة' : 'Image'}
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      {isRTL ? 'فيديو' : 'Video'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="media_url">
                {isRTL ? 'رابط الوسائط *' : 'Media URL *'}
              </Label>
              <Input
                id="media_url"
                value={slideForm.media_url}
                onChange={(e) => handleInputChange('media_url', e.target.value)}
                placeholder={isRTL ? 'أدخل رابط الصورة أو الفيديو' : 'Enter image or video URL'}
                type="url"
              />
            </div>

            {slideForm.media_type === 'video' && (
              <div className="space-y-2">
                <Label htmlFor="media_thumbnail">
                  {isRTL ? 'صورة مصغرة للفيديو' : 'Video Thumbnail'}
                </Label>
                <Input
                  id="media_thumbnail"
                  value={slideForm.media_thumbnail}
                  onChange={(e) => handleInputChange('media_thumbnail', e.target.value)}
                  placeholder={isRTL ? 'أدخل رابط الصورة المصغرة' : 'Enter thumbnail URL'}
                  type="url"
                />
              </div>
            )}

            {/* Visual Effects */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">{isRTL ? 'المؤثرات البصرية' : 'Visual Effects'}</h4>
              
              <div className="space-y-2">
                <Label htmlFor="blur_intensity">
                  {isRTL ? `شدة التشويش: ${slideForm.blur_intensity}px` : `Blur Intensity: ${slideForm.blur_intensity}px`}
                </Label>
                <input
                  type="range"
                  id="blur_intensity"
                  min="0"
                  max="20"
                  value={slideForm.blur_intensity}
                  onChange={(e) => handleInputChange('blur_intensity', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title={isRTL ? `شدة التشويش: ${slideForm.blur_intensity}px` : `Blur Intensity: ${slideForm.blur_intensity}px`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brightness">
                  {isRTL ? `السطوع: ${slideForm.brightness}%` : `Brightness: ${slideForm.brightness}%`}
                </Label>
                <input
                  type="range"
                  id="brightness"
                  min="50"
                  max="150"
                  value={slideForm.brightness}
                  onChange={(e) => handleInputChange('brightness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title={isRTL ? `السطوع: ${slideForm.brightness}%` : `Brightness: ${slideForm.brightness}%`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contrast">
                  {isRTL ? `التباين: ${slideForm.contrast}%` : `Contrast: ${slideForm.contrast}%`}
                </Label>
                <input
                  type="range"
                  id="contrast"
                  min="50"
                  max="150"
                  value={slideForm.contrast}
                  onChange={(e) => handleInputChange('contrast', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title={isRTL ? `التباين: ${slideForm.contrast}%` : `Contrast: ${slideForm.contrast}%`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saturation">
                  {isRTL ? `التشبع: ${slideForm.saturation}%` : `Saturation: ${slideForm.saturation}%`}
                </Label>
                <input
                  type="range"
                  id="saturation"
                  min="0"
                  max="200"
                  value={slideForm.saturation}
                  onChange={(e) => handleInputChange('saturation', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  title={isRTL ? `التشبع: ${slideForm.saturation}%` : `Saturation: ${slideForm.saturation}%`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'إعدادات الأزرار' : 'Button Configuration'}</CardTitle>
            <CardDescription>
              {isRTL ? 'أزرار الإجراءات والروابط' : 'Action buttons and links'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="button_text">{isRTL ? 'نص الزر الأساسي (إنجليزي)' : 'Primary Button Text (English)'}</Label>
              <Input
                id="button_text"
                value={slideForm.button_text}
                onChange={(e) => handleInputChange('button_text', e.target.value)}
                placeholder={isRTL ? 'مثل: تسوق الآن' : 'e.g., Shop Now'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_text_ar">{isRTL ? 'نص الزر الأساسي (عربي)' : 'Primary Button Text (Arabic)'}</Label>
              <Input
                id="button_text_ar"
                value={slideForm.button_text_ar}
                onChange={(e) => handleInputChange('button_text_ar', e.target.value)}
                placeholder={isRTL ? 'مثل: تسوق الآن' : 'e.g., تسوق الآن'}
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_link">{isRTL ? 'رابط الزر الأساسي' : 'Primary Button Link'}</Label>
              <Input
                id="button_link"
                value={slideForm.button_link}
                onChange={(e) => handleInputChange('button_link', e.target.value)}
                placeholder="/shop"
              />
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'نمط الزر الأساسي' : 'Primary Button Style'}</Label>
              <Select
                value={slideForm.button_variant}
                onValueChange={(value: 'primary' | 'secondary' | 'outline') => handleInputChange('button_variant', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">{isRTL ? 'أساسي' : 'Primary'}</SelectItem>
                  <SelectItem value="secondary">{isRTL ? 'ثانوي' : 'Secondary'}</SelectItem>
                  <SelectItem value="outline">{isRTL ? 'محدد' : 'Outline'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-medium">{isRTL ? 'الزر الثانوي (اختياري)' : 'Secondary Button (Optional)'}</h4>
              
              <div className="space-y-2">
                <Label htmlFor="secondary_button_text">{isRTL ? 'نص الزر الثانوي (إنجليزي)' : 'Secondary Button Text (English)'}</Label>
                <Input
                  id="secondary_button_text"
                  value={slideForm.secondary_button_text}
                  onChange={(e) => handleInputChange('secondary_button_text', e.target.value)}
                  placeholder={isRTL ? 'مثل: تعرف أكثر' : 'e.g., Learn More'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_button_text_ar">{isRTL ? 'نص الزر الثانوي (عربي)' : 'Secondary Button Text (Arabic)'}</Label>
                <Input
                  id="secondary_button_text_ar"
                  value={slideForm.secondary_button_text_ar}
                  onChange={(e) => handleInputChange('secondary_button_text_ar', e.target.value)}
                  placeholder={isRTL ? 'مثل: تعرف أكثر' : 'e.g., تعرف أكثر'}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_button_link">{isRTL ? 'رابط الزر الثانوي' : 'Secondary Button Link'}</Label>
                <Input
                  id="secondary_button_link"
                  value={slideForm.secondary_button_link}
                  onChange={(e) => handleInputChange('secondary_button_link', e.target.value)}
                  placeholder="/about"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout & Style */}
        <Card>
          <CardHeader>
            <CardTitle>{isRTL ? 'التخطيط والتصميم' : 'Layout & Style'}</CardTitle>
            <CardDescription>
              {isRTL ? 'موضع النص والخلفية والعرض' : 'Text position, background, and display settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'موضع النص' : 'Text Position'}</Label>
              <Select
                value={slideForm.text_position}
                onValueChange={(value: 'left' | 'center' | 'right') => handleInputChange('text_position', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">{isRTL ? 'يسار' : 'Left'}</SelectItem>
                  <SelectItem value="center">{isRTL ? 'وسط' : 'Center'}</SelectItem>
                  <SelectItem value="right">{isRTL ? 'يمين' : 'Right'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isRTL ? 'محاذاة النص' : 'Text Alignment'}</Label>
              <Select
                value={slideForm.text_alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => handleInputChange('text_alignment', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">{isRTL ? 'يسار' : 'Left'}</SelectItem>
                  <SelectItem value="center">{isRTL ? 'وسط' : 'Center'}</SelectItem>
                  <SelectItem value="right">{isRTL ? 'يمين' : 'Right'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay_opacity">
                {isRTL ? `شفافية الخلفية: ${slideForm.overlay_opacity}%` : `Overlay Opacity: ${slideForm.overlay_opacity}%`}
              </Label>
              <input
                type="range"
                id="overlay_opacity"
                min="0"
                max="100"
                value={slideForm.overlay_opacity}
                onChange={(e) => handleInputChange('overlay_opacity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                title={isRTL ? `شفافية الخلفية: ${slideForm.overlay_opacity}%` : `Overlay Opacity: ${slideForm.overlay_opacity}%`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="overlay_color">{isRTL ? 'لون الخلفية' : 'Overlay Color'}</Label>
              <Input
                id="overlay_color"
                type="color"
                value={slideForm.overlay_color}
                onChange={(e) => handleInputChange('overlay_color', e.target.value)}
                className="h-10 w-full"
              />
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Switch
                id="is_active"
                checked={slideForm.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">{isRTL ? 'نشط' : 'Active'}</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard?section=hero-slider')}
          disabled={loading}
        >
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ الشريحة' : 'Save Slide')}
        </Button>
      </div>
    </div>
  )
}
