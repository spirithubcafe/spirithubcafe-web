import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import type { HeroSettings, HeroSlide } from '@/types'
import { heroService } from '@/services/hero'
import toast from 'react-hot-toast'

interface HeroSliderSettingsProps {
  onClose?: () => void
}

export function HeroSliderSettings({ onClose }: HeroSliderSettingsProps) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      // Initialize advanced settings first
      await heroService.initializeAdvancedSettings()
      const heroSettings = await heroService.getHeroSettings()
      setSettings(heroSettings)
      if (heroSettings.slides.length > 0) {
        setSelectedSlide(heroSettings.slides[0])
      }
    } catch (error) {
      console.error('Error loading hero settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      await heroService.updateHeroSettings(settings)
      
      // Notify other components that settings have been updated
      localStorage.setItem('hero-settings-updated', Date.now().toString())
      window.dispatchEvent(new CustomEvent('hero-settings-updated'))
      
      toast.success('Settings saved successfully! / تم حفظ الإعدادات بنجاح!')
      // Reload settings to ensure consistency
      await loadSettings()
    } catch (error) {
      console.error('Error saving hero settings:', error)
      toast.error('Error saving settings. Please try again. / خطأ في حفظ الإعدادات. يرجى المحاولة مرة أخرى.')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = (updates: Partial<HeroSettings>) => {
    if (!settings) return
    setSettings({ ...settings, ...updates })
  }

  const updateSlide = (slideId: string, updates: Partial<HeroSlide>) => {
    if (!settings) return
    
    const updatedSlides = settings.slides.map(slide =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    )
    
    setSettings({ ...settings, slides: updatedSlides })
    
    if (selectedSlide?.id === slideId) {
      setSelectedSlide({ ...selectedSlide, ...updates })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load hero settings</p>
        <Button onClick={loadSettings} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('admin.heroSlider.settings', 'Hero Slider Settings')}</h1>
          <p className="text-muted-foreground">
            {t('admin.heroSlider.settingsDescription', 'Configure your hero slider appearance and behavior')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Changes')}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">{t('admin.heroSlider.general', 'General')}</TabsTrigger>
          <TabsTrigger value="typography">{t('admin.heroSlider.typography', 'Typography')}</TabsTrigger>
          <TabsTrigger value="animation">{t('admin.heroSlider.animation', 'Animation')}</TabsTrigger>
          <TabsTrigger value="buttons">{t('admin.heroSlider.buttons', 'Buttons')}</TabsTrigger>
          <TabsTrigger value="layout">{t('admin.heroSlider.layout', 'Layout')}</TabsTrigger>
          <TabsTrigger value="effects">{t('admin.heroSlider.effects', 'Effects')}</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.generalSettings', 'General Settings')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.generalDescription', 'Basic slider configuration')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Autoplay Settings */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoplay"
                      checked={settings.autoplay}
                      onCheckedChange={(checked) => updateSettings({ autoplay: checked })}
                    />
                    <Label htmlFor="autoplay">{t('admin.heroSlider.autoplay', 'Autoplay')}</Label>
                  </div>
                  
                  {settings.autoplay && (
                    <div className="space-y-2">
                      <Label htmlFor="autoplay-delay">
                        {t('admin.heroSlider.autoplayDelay', 'Autoplay Delay')} ({settings.autoplay_delay}ms)
                      </Label>
                      <Slider
                        id="autoplay-delay"
                        min={1000}
                        max={10000}
                        step={500}
                        value={[settings.autoplay_delay]}
                        onValueChange={(value: number[]) => updateSettings({ autoplay_delay: value[0] })}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="pause-on-hover"
                      checked={settings.pause_on_hover}
                      onCheckedChange={(checked) => updateSettings({ pause_on_hover: checked })}
                    />
                    <Label htmlFor="pause-on-hover">{t('admin.heroSlider.pauseOnHover', 'Pause on Hover')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="infinite-loop"
                      checked={settings.infinite_loop}
                      onCheckedChange={(checked) => updateSettings({ infinite_loop: checked })}
                    />
                    <Label htmlFor="infinite-loop">{t('admin.heroSlider.infiniteLoop', 'Infinite Loop')}</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Navigation Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('admin.heroSlider.navigation', 'Navigation')}</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-arrows"
                      checked={settings.show_arrows}
                      onCheckedChange={(checked) => updateSettings({ show_arrows: checked })}
                    />
                    <Label htmlFor="show-arrows">{t('admin.heroSlider.showArrows', 'Show Arrows')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-dots"
                      checked={settings.show_dots}
                      onCheckedChange={(checked) => updateSettings({ show_dots: checked })}
                    />
                    <Label htmlFor="show-dots">{t('admin.heroSlider.showDots', 'Show Dots')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-progress"
                      checked={settings.show_progress}
                      onCheckedChange={(checked) => updateSettings({ show_progress: checked })}
                    />
                    <Label htmlFor="show-progress">{t('admin.heroSlider.showProgress', 'Show Progress')}</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Transition Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t('admin.heroSlider.transition', 'Transition')}</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="transition-effect">{t('admin.heroSlider.transitionEffect', 'Effect')}</Label>
                    <Select
                      value={settings.transition_effect}
                      onValueChange={(value) => updateSettings({ transition_effect: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="flip">Flip</SelectItem>
                        <SelectItem value="cube">Cube</SelectItem>
                        <SelectItem value="coverflow">Coverflow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transition-duration">
                      {t('admin.heroSlider.transitionDuration', 'Duration')} ({settings.transition_duration}ms)
                    </Label>
                    <Slider
                      id="transition-duration"
                      min={200}
                      max={2000}
                      step={100}
                      value={[settings.transition_duration]}
                      onValueChange={(value: number[]) => updateSettings({ transition_duration: value[0] })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Settings */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.typographySettings', 'Typography Settings')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.typographyDescription', 'Configure text appearance for different languages')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSlide && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t('admin.heroSlider.selectedSlide', 'Selected Slide')}: {selectedSlide.title}
                    </h3>
                    <Select
                      value={selectedSlide.id}
                      onValueChange={(slideId) => {
                        const slide = settings.slides.find(s => s.id === slideId)
                        if (slide) setSelectedSlide(slide)
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.slides.map((slide) => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Title Typography */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.titleTypography', 'Title Typography')}
                      <Badge variant="secondary">Title</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* English Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">English</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title-font-family">Font Family</Label>
                          <Input
                            id="title-font-family"
                            value={selectedSlide.typography?.title_font_family || settings.global_typography?.title_font_family || 'Inter, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_family: e.target.value
                              }
                            })}
                            placeholder="e.g., Inter, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-font-size">Font Size</Label>
                          <Input
                            id="title-font-size"
                            value={selectedSlide.typography?.title_font_size || settings.global_typography?.title_font_size || '3rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_size: e.target.value
                              }
                            })}
                            placeholder="e.g., 3rem, 48px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-font-weight">Font Weight</Label>
                          <Select
                            value={(selectedSlide.typography?.title_font_weight || settings.global_typography?.title_font_weight || 700).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_weight: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - Thin</SelectItem>
                              <SelectItem value="300">300 - Light</SelectItem>
                              <SelectItem value="400">400 - Normal</SelectItem>
                              <SelectItem value="500">500 - Medium</SelectItem>
                              <SelectItem value="600">600 - Semibold</SelectItem>
                              <SelectItem value="700">700 - Bold</SelectItem>
                              <SelectItem value="800">800 - Extrabold</SelectItem>
                              <SelectItem value="900">900 - Black</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-color">Color</Label>
                          <Input
                            id="title-color"
                            type="color"
                            value={selectedSlide.typography?.title_color || settings.global_typography?.title_color || '#ffffff'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_color: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Arabic Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">العربية</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="title-font-family-ar">خط الكتابة</Label>
                          <Input
                            id="title-font-family-ar"
                            value={selectedSlide.typography?.title_font_family_ar || settings.global_typography?.title_font_family_ar || 'Tajawal, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_family_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: Tajawal, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-font-size-ar">حجم الخط</Label>
                          <Input
                            id="title-font-size-ar"
                            value={selectedSlide.typography?.title_font_size_ar || settings.global_typography?.title_font_size_ar || '3rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_size_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: 3rem, 48px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-font-weight-ar">وزن الخط</Label>
                          <Select
                            value={(selectedSlide.typography?.title_font_weight_ar || settings.global_typography?.title_font_weight_ar || 700).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_font_weight_ar: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - رفيع</SelectItem>
                              <SelectItem value="300">300 - خفيف</SelectItem>
                              <SelectItem value="400">400 - عادي</SelectItem>
                              <SelectItem value="500">500 - متوسط</SelectItem>
                              <SelectItem value="600">600 - نصف عريض</SelectItem>
                              <SelectItem value="700">700 - عريض</SelectItem>
                              <SelectItem value="800">800 - عريض جداً</SelectItem>
                              <SelectItem value="900">900 - أسود</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="title-color-ar">اللون</Label>
                          <Input
                            id="title-color-ar"
                            type="color"
                            value={selectedSlide.typography?.title_color_ar || settings.global_typography?.title_color_ar || '#ffffff'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                title_color_ar: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Subtitle Typography */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.subtitleTypography', 'Subtitle Typography')}
                      <Badge variant="secondary">Subtitle</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* English Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">English</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-family">Font Family</Label>
                          <Input
                            id="subtitle-font-family"
                            value={selectedSlide.typography?.subtitle_font_family || settings.global_typography?.subtitle_font_family || 'Inter, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_family: e.target.value
                              }
                            })}
                            placeholder="e.g., Inter, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-size">Font Size</Label>
                          <Input
                            id="subtitle-font-size"
                            value={selectedSlide.typography?.subtitle_font_size || settings.global_typography?.subtitle_font_size || '1.25rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_size: e.target.value
                              }
                            })}
                            placeholder="e.g., 1.25rem, 20px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-weight">Font Weight</Label>
                          <Select
                            value={(selectedSlide.typography?.subtitle_font_weight || settings.global_typography?.subtitle_font_weight || 500).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_weight: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - Thin</SelectItem>
                              <SelectItem value="300">300 - Light</SelectItem>
                              <SelectItem value="400">400 - Normal</SelectItem>
                              <SelectItem value="500">500 - Medium</SelectItem>
                              <SelectItem value="600">600 - Semibold</SelectItem>
                              <SelectItem value="700">700 - Bold</SelectItem>
                              <SelectItem value="800">800 - Extrabold</SelectItem>
                              <SelectItem value="900">900 - Black</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-color">Color</Label>
                          <Input
                            id="subtitle-color"
                            type="color"
                            value={selectedSlide.typography?.subtitle_color || settings.global_typography?.subtitle_color || '#e5e7eb'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_color: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Arabic Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">العربية</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-family-ar">خط الكتابة</Label>
                          <Input
                            id="subtitle-font-family-ar"
                            value={selectedSlide.typography?.subtitle_font_family_ar || settings.global_typography?.subtitle_font_family_ar || 'Tajawal, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_family_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: Tajawal, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-size-ar">حجم الخط</Label>
                          <Input
                            id="subtitle-font-size-ar"
                            value={selectedSlide.typography?.subtitle_font_size_ar || settings.global_typography?.subtitle_font_size_ar || '1.25rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_size_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: 1.25rem, 20px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-font-weight-ar">وزن الخط</Label>
                          <Select
                            value={(selectedSlide.typography?.subtitle_font_weight_ar || settings.global_typography?.subtitle_font_weight_ar || 500).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_font_weight_ar: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - رفيع</SelectItem>
                              <SelectItem value="300">300 - خفيف</SelectItem>
                              <SelectItem value="400">400 - عادي</SelectItem>
                              <SelectItem value="500">500 - متوسط</SelectItem>
                              <SelectItem value="600">600 - نصف عريض</SelectItem>
                              <SelectItem value="700">700 - عريض</SelectItem>
                              <SelectItem value="800">800 - عريض جداً</SelectItem>
                              <SelectItem value="900">900 - أسود</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle-color-ar">اللون</Label>
                          <Input
                            id="subtitle-color-ar"
                            type="color"
                            value={selectedSlide.typography?.subtitle_color_ar || settings.global_typography?.subtitle_color_ar || '#e5e7eb'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                subtitle_color_ar: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description Typography */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.descriptionTypography', 'Description Typography')}
                      <Badge variant="secondary">Description</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      {/* English Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">English</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description-font-family">Font Family</Label>
                          <Input
                            id="description-font-family"
                            value={selectedSlide.typography?.description_font_family || settings.global_typography?.description_font_family || 'Inter, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_family: e.target.value
                              }
                            })}
                            placeholder="e.g., Inter, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-font-size">Font Size</Label>
                          <Input
                            id="description-font-size"
                            value={selectedSlide.typography?.description_font_size || settings.global_typography?.description_font_size || '1rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_size: e.target.value
                              }
                            })}
                            placeholder="e.g., 1rem, 16px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-font-weight">Font Weight</Label>
                          <Select
                            value={(selectedSlide.typography?.description_font_weight || settings.global_typography?.description_font_weight || 400).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_weight: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - Thin</SelectItem>
                              <SelectItem value="300">300 - Light</SelectItem>
                              <SelectItem value="400">400 - Normal</SelectItem>
                              <SelectItem value="500">500 - Medium</SelectItem>
                              <SelectItem value="600">600 - Semibold</SelectItem>
                              <SelectItem value="700">700 - Bold</SelectItem>
                              <SelectItem value="800">800 - Extrabold</SelectItem>
                              <SelectItem value="900">900 - Black</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-color">Color</Label>
                          <Input
                            id="description-color"
                            type="color"
                            value={selectedSlide.typography?.description_color || settings.global_typography?.description_color || '#d1d5db'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_color: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      {/* Arabic Typography */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-muted-foreground">العربية</h5>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description-font-family-ar">خط الكتابة</Label>
                          <Input
                            id="description-font-family-ar"
                            value={selectedSlide.typography?.description_font_family_ar || settings.global_typography?.description_font_family_ar || 'Tajawal, sans-serif'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_family_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: Tajawal, sans-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-font-size-ar">حجم الخط</Label>
                          <Input
                            id="description-font-size-ar"
                            value={selectedSlide.typography?.description_font_size_ar || settings.global_typography?.description_font_size_ar || '1rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_size_ar: e.target.value
                              }
                            })}
                            placeholder="مثال: 1rem, 16px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-font-weight-ar">وزن الخط</Label>
                          <Select
                            value={(selectedSlide.typography?.description_font_weight_ar || settings.global_typography?.description_font_weight_ar || 400).toString()}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_font_weight_ar: parseInt(value)
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="100">100 - رفيع</SelectItem>
                              <SelectItem value="300">300 - خفيف</SelectItem>
                              <SelectItem value="400">400 - عادي</SelectItem>
                              <SelectItem value="500">500 - متوسط</SelectItem>
                              <SelectItem value="600">600 - نصف عريض</SelectItem>
                              <SelectItem value="700">700 - عريض</SelectItem>
                              <SelectItem value="800">800 - عريض جداً</SelectItem>
                              <SelectItem value="900">900 - أسود</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-color-ar">اللون</Label>
                          <Input
                            id="description-color-ar"
                            type="color"
                            value={selectedSlide.typography?.description_color_ar || settings.global_typography?.description_color_ar || '#d1d5db'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              typography: {
                                ...selectedSlide.typography,
                                description_color_ar: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Animation Settings */}
        <TabsContent value="animation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.animationSettings', 'Animation Settings')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.animationDescription', 'Configure animations for text elements')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSlide && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t('admin.heroSlider.selectedSlide', 'Selected Slide')}: {selectedSlide.title}
                    </h3>
                    <Select
                      value={selectedSlide.id}
                      onValueChange={(slideId) => {
                        const slide = settings.slides.find(s => s.id === slideId)
                        if (slide) setSelectedSlide(slide)
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.slides.map((slide) => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Title Animation */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.titleAnimation', 'Title Animation')}
                      <Badge variant="secondary">Title</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title-animation">Animation Type</Label>
                        <Select
                          value={selectedSlide.animation?.title_animation || 'fadeIn'}
                          onValueChange={(value) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              title_animation: value as any
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="fadeIn">Fade In</SelectItem>
                            <SelectItem value="slideIn">Slide In</SelectItem>
                            <SelectItem value="zoomIn">Zoom In</SelectItem>
                            <SelectItem value="bounceIn">Bounce In</SelectItem>
                            <SelectItem value="rotateIn">Rotate In</SelectItem>
                            <SelectItem value="flipIn">Flip In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title-animation-delay">
                          Delay ({selectedSlide.animation?.title_animation_delay || 0}ms)
                        </Label>
                        <Slider
                          id="title-animation-delay"
                          min={0}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.title_animation_delay || 0]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              title_animation_delay: value[0]
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title-animation-duration">
                          Duration ({selectedSlide.animation?.title_animation_duration || 1000}ms)
                        </Label>
                        <Slider
                          id="title-animation-duration"
                          min={200}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.title_animation_duration || 1000]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              title_animation_duration: value[0]
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Subtitle Animation */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.subtitleAnimation', 'Subtitle Animation')}
                      <Badge variant="secondary">Subtitle</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subtitle-animation">Animation Type</Label>
                        <Select
                          value={selectedSlide.animation?.subtitle_animation || 'fadeIn'}
                          onValueChange={(value) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              subtitle_animation: value as any
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="fadeIn">Fade In</SelectItem>
                            <SelectItem value="slideIn">Slide In</SelectItem>
                            <SelectItem value="zoomIn">Zoom In</SelectItem>
                            <SelectItem value="bounceIn">Bounce In</SelectItem>
                            <SelectItem value="rotateIn">Rotate In</SelectItem>
                            <SelectItem value="flipIn">Flip In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subtitle-animation-delay">
                          Delay ({selectedSlide.animation?.subtitle_animation_delay || 300}ms)
                        </Label>
                        <Slider
                          id="subtitle-animation-delay"
                          min={0}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.subtitle_animation_delay || 300]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              subtitle_animation_delay: value[0]
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subtitle-animation-duration">
                          Duration ({selectedSlide.animation?.subtitle_animation_duration || 1000}ms)
                        </Label>
                        <Slider
                          id="subtitle-animation-duration"
                          min={200}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.subtitle_animation_duration || 1000]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              subtitle_animation_duration: value[0]
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Description Animation */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.descriptionAnimation', 'Description Animation')}
                      <Badge variant="secondary">Description</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description-animation">Animation Type</Label>
                        <Select
                          value={selectedSlide.animation?.description_animation || 'fadeIn'}
                          onValueChange={(value) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              description_animation: value as any
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="fadeIn">Fade In</SelectItem>
                            <SelectItem value="slideIn">Slide In</SelectItem>
                            <SelectItem value="zoomIn">Zoom In</SelectItem>
                            <SelectItem value="bounceIn">Bounce In</SelectItem>
                            <SelectItem value="rotateIn">Rotate In</SelectItem>
                            <SelectItem value="flipIn">Flip In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description-animation-delay">
                          Delay ({selectedSlide.animation?.description_animation_delay || 600}ms)
                        </Label>
                        <Slider
                          id="description-animation-delay"
                          min={0}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.description_animation_delay || 600]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              description_animation_delay: value[0]
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description-animation-duration">
                          Duration ({selectedSlide.animation?.description_animation_duration || 1000}ms)
                        </Label>
                        <Slider
                          id="description-animation-duration"
                          min={200}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.description_animation_duration || 1000]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              description_animation_duration: value[0]
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Buttons Animation */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.buttonsAnimation', 'Buttons Animation')}
                      <Badge variant="secondary">Buttons</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buttons-animation">Animation Type</Label>
                        <Select
                          value={selectedSlide.animation?.buttons_animation || 'fadeIn'}
                          onValueChange={(value) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              buttons_animation: value as any
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="fadeIn">Fade In</SelectItem>
                            <SelectItem value="slideIn">Slide In</SelectItem>
                            <SelectItem value="zoomIn">Zoom In</SelectItem>
                            <SelectItem value="bounceIn">Bounce In</SelectItem>
                            <SelectItem value="rotateIn">Rotate In</SelectItem>
                            <SelectItem value="flipIn">Flip In</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buttons-animation-delay">
                          Delay ({selectedSlide.animation?.buttons_animation_delay || 900}ms)
                        </Label>
                        <Slider
                          id="buttons-animation-delay"
                          min={0}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.buttons_animation_delay || 900]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              buttons_animation_delay: value[0]
                            }
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="buttons-animation-duration">
                          Duration ({selectedSlide.animation?.buttons_animation_duration || 1000}ms)
                        </Label>
                        <Slider
                          id="buttons-animation-duration"
                          min={200}
                          max={3000}
                          step={100}
                          value={[selectedSlide.animation?.buttons_animation_duration || 1000]}
                          onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                            animation: {
                              ...selectedSlide.animation,
                              buttons_animation_duration: value[0]
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Button Settings */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.buttonSettings', 'Button Settings')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.buttonDescription', 'Customize button appearance and behavior')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSlide && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t('admin.heroSlider.selectedSlide', 'Selected Slide')}: {selectedSlide.title}
                    </h3>
                    <Select
                      value={selectedSlide.id}
                      onValueChange={(slideId) => {
                        const slide = settings.slides.find(s => s.id === slideId)
                        if (slide) setSelectedSlide(slide)
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.slides.map((slide) => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Primary Button Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.primaryButton', 'Primary Button')}
                      <Badge variant="default">Primary</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary-bg-color">Background Color</Label>
                          <Input
                            id="primary-bg-color"
                            type="color"
                            value={selectedSlide.button_settings?.primary_button_style?.background_color || '#d97706'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  background_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-text-color">Text Color</Label>
                          <Input
                            id="primary-text-color"
                            type="color"
                            value={selectedSlide.button_settings?.primary_button_style?.text_color || '#ffffff'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  text_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-border-radius">Border Radius</Label>
                          <Input
                            id="primary-border-radius"
                            value={selectedSlide.button_settings?.primary_button_style?.border_radius || '0.375rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  border_radius: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 0.375rem, 8px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-font-size">Font Size</Label>
                          <Input
                            id="primary-font-size"
                            value={selectedSlide.button_settings?.primary_button_style?.font_size || '1rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  font_size: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 1rem, 16px"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary-padding">Padding</Label>
                          <Input
                            id="primary-padding"
                            value={selectedSlide.button_settings?.primary_button_style?.padding || '0.75rem 1.5rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  padding: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 0.75rem 1.5rem"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-font-weight">Font Weight</Label>
                          <Select
                            value={selectedSlide.button_settings?.primary_button_style?.font_weight?.toString() || '500'}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  font_weight: parseInt(value)
                                }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="400">400 - Normal</SelectItem>
                              <SelectItem value="500">500 - Medium</SelectItem>
                              <SelectItem value="600">600 - Semibold</SelectItem>
                              <SelectItem value="700">700 - Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-shadow">Box Shadow</Label>
                          <Input
                            id="primary-shadow"
                            value={selectedSlide.button_settings?.primary_button_style?.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  shadow: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-transition">
                            Transition Duration ({selectedSlide.button_settings?.primary_button_style?.transition_duration || 300}ms)
                          </Label>
                          <Slider
                            id="primary-transition"
                            min={100}
                            max={1000}
                            step={50}
                            value={[selectedSlide.button_settings?.primary_button_style?.transition_duration || 300]}
                            onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  transition_duration: value[0]
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hover Effects */}
                    <div className="space-y-4">
                      <h5 className="font-medium text-sm">Hover Effects</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primary-hover-bg">Hover Background</Label>
                          <Input
                            id="primary-hover-bg"
                            type="color"
                            value={selectedSlide.button_settings?.primary_button_style?.hover_background_color || '#b45309'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  hover_background_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-hover-transform">Hover Transform</Label>
                          <Select
                            value={selectedSlide.button_settings?.primary_button_style?.hover_transform || 'translateY(-2px)'}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  hover_transform: value
                                }
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="translateY(-2px)">Lift Up</SelectItem>
                              <SelectItem value="scale(1.05)">Scale Up</SelectItem>
                              <SelectItem value="rotate(2deg)">Rotate Slight</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="primary-hover-shadow">Hover Shadow</Label>
                          <Input
                            id="primary-hover-shadow"
                            value={selectedSlide.button_settings?.primary_button_style?.hover_shadow || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                primary_button_style: {
                                  ...selectedSlide.button_settings?.primary_button_style,
                                  hover_shadow: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Secondary Button Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.secondaryButton', 'Secondary Button')}
                      <Badge variant="outline">Secondary</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="secondary-bg-color">Background Color</Label>
                          <Input
                            id="secondary-bg-color"
                            type="color"
                            value={selectedSlide.button_settings?.secondary_button_style?.background_color || 'rgba(255,255,255,0.1)'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  background_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondary-text-color">Text Color</Label>
                          <Input
                            id="secondary-text-color"
                            type="color"
                            value={selectedSlide.button_settings?.secondary_button_style?.text_color || '#ffffff'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  text_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondary-border-color">Border Color</Label>
                          <Input
                            id="secondary-border-color"
                            type="color"
                            value={selectedSlide.button_settings?.secondary_button_style?.border_color || 'rgba(255,255,255,0.3)'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  border_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="secondary-border-width">
                            Border Width ({selectedSlide.button_settings?.secondary_button_style?.border_width || 1}px)
                          </Label>
                          <Slider
                            id="secondary-border-width"
                            min={0}
                            max={5}
                            step={1}
                            value={[selectedSlide.button_settings?.secondary_button_style?.border_width || 1]}
                            onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  border_width: value[0]
                                }
                              }
                            })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondary-border-radius">Border Radius</Label>
                          <Input
                            id="secondary-border-radius"
                            value={selectedSlide.button_settings?.secondary_button_style?.border_radius || '0.375rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  border_radius: e.target.value
                                }
                              }
                            })}
                            placeholder="e.g., 0.375rem, 8px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="secondary-hover-bg">Hover Background</Label>
                          <Input
                            id="secondary-hover-bg"
                            type="color"
                            value={selectedSlide.button_settings?.secondary_button_style?.hover_background_color || 'rgba(255,255,255,0.2)'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              button_settings: {
                                ...selectedSlide.button_settings,
                                secondary_button_style: {
                                  ...selectedSlide.button_settings?.secondary_button_style,
                                  hover_background_color: e.target.value
                                }
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Settings */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.layoutSettings', 'Layout Settings')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.layoutDescription', 'Configure content positioning and spacing')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSlide && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t('admin.heroSlider.selectedSlide', 'Selected Slide')}: {selectedSlide.title}
                    </h3>
                    <Select
                      value={selectedSlide.id}
                      onValueChange={(slideId) => {
                        const slide = settings.slides.find(s => s.id === slideId)
                        if (slide) setSelectedSlide(slide)
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.slides.map((slide) => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Container Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.containerSettings', 'Container Settings')}
                      <Badge variant="secondary">Container</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="container-max-width">Max Width</Label>
                          <Input
                            id="container-max-width"
                            value={selectedSlide.layout?.container_max_width || '1200px'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                container_max_width: e.target.value
                              }
                            })}
                            placeholder="e.g., 1200px, 100%, 80rem"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content-width">Content Width</Label>
                          <Input
                            id="content-width"
                            value={selectedSlide.layout?.content_width || '100%'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                content_width: e.target.value
                              }
                            })}
                            placeholder="e.g., 100%, 80%, 600px"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content-padding">Content Padding</Label>
                          <Input
                            id="content-padding"
                            value={selectedSlide.layout?.content_padding || '2rem'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                content_padding: e.target.value
                              }
                            })}
                            placeholder="e.g., 2rem, 1rem 2rem, 16px 32px"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="content-margin">Content Margin</Label>
                          <Input
                            id="content-margin"
                            value={selectedSlide.layout?.content_margin || '0 auto'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                content_margin: e.target.value
                              }
                            })}
                            placeholder="e.g., 0 auto, 2rem 0"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vertical-alignment">Vertical Alignment</Label>
                          <Select
                            value={selectedSlide.layout?.vertical_alignment || 'center'}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                vertical_alignment: value as any
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Top</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="bottom">Bottom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="horizontal-alignment">Horizontal Alignment</Label>
                          <Select
                            value={selectedSlide.layout?.horizontal_alignment || 'center'}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                horizontal_alignment: value as any
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Background Overlay Shape */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.overlayShape', 'Background Overlay Shape')}
                      <Badge variant="secondary">Overlay</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="overlay-shape">Shape Type</Label>
                          <Select
                            value={selectedSlide.layout?.background_overlay_shape || 'none'}
                            onValueChange={(value) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                background_overlay_shape: value as any
                              }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="circle">Circle</SelectItem>
                              <SelectItem value="rectangle">Rectangle</SelectItem>
                              <SelectItem value="polygon">Polygon</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="overlay-shape-color">Shape Color</Label>
                          <Input
                            id="overlay-shape-color"
                            type="color"
                            value={selectedSlide.layout?.background_overlay_shape_color || '#000000'}
                            onChange={(e) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                background_overlay_shape_color: e.target.value
                              }
                            })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="overlay-shape-opacity">
                            Shape Opacity ({selectedSlide.layout?.background_overlay_shape_opacity || 50}%)
                          </Label>
                          <Slider
                            id="overlay-shape-opacity"
                            min={0}
                            max={100}
                            step={5}
                            value={[selectedSlide.layout?.background_overlay_shape_opacity || 50]}
                            onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                              layout: {
                                ...selectedSlide.layout,
                                background_overlay_shape_opacity: value[0]
                              }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Responsive Settings */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.responsiveSettings', 'Responsive Settings')}
                      <Badge variant="secondary">Responsive</Badge>
                    </h4>
                    
                    <Tabs defaultValue="mobile" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                        <TabsTrigger value="tablet">Tablet</TabsTrigger>
                        <TabsTrigger value="desktop">Desktop</TabsTrigger>
                      </TabsList>

                      {/* Mobile */}
                      <TabsContent value="mobile" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="mobile-title-size">Title Font Size</Label>
                            <Input
                              id="mobile-title-size"
                              value={selectedSlide.layout?.responsive_breakpoints?.mobile?.title_font_size || '2rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    mobile: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.mobile,
                                      title_font_size: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 2rem, 32px"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="mobile-content-padding">Content Padding</Label>
                            <Input
                              id="mobile-content-padding"
                              value={selectedSlide.layout?.responsive_breakpoints?.mobile?.content_padding || '1rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    mobile: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.mobile,
                                      content_padding: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 1rem, 16px"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Tablet */}
                      <TabsContent value="tablet" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="tablet-title-size">Title Font Size</Label>
                            <Input
                              id="tablet-title-size"
                              value={selectedSlide.layout?.responsive_breakpoints?.tablet?.title_font_size || '3rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    tablet: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.tablet,
                                      title_font_size: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 3rem, 48px"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tablet-content-padding">Content Padding</Label>
                            <Input
                              id="tablet-content-padding"
                              value={selectedSlide.layout?.responsive_breakpoints?.tablet?.content_padding || '1.5rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    tablet: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.tablet,
                                      content_padding: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 1.5rem, 24px"
                            />
                          </div>
                        </div>
                      </TabsContent>

                      {/* Desktop */}
                      <TabsContent value="desktop" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="desktop-title-size">Title Font Size</Label>
                            <Input
                              id="desktop-title-size"
                              value={selectedSlide.layout?.responsive_breakpoints?.desktop?.title_font_size || '4rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    desktop: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.desktop,
                                      title_font_size: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 4rem, 64px"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="desktop-content-padding">Content Padding</Label>
                            <Input
                              id="desktop-content-padding"
                              value={selectedSlide.layout?.responsive_breakpoints?.desktop?.content_padding || '2rem'}
                              onChange={(e) => updateSlide(selectedSlide.id, {
                                layout: {
                                  ...selectedSlide.layout,
                                  responsive_breakpoints: {
                                    ...selectedSlide.layout?.responsive_breakpoints,
                                    desktop: {
                                      ...selectedSlide.layout?.responsive_breakpoints?.desktop,
                                      content_padding: e.target.value
                                    }
                                  }
                                }
                              })}
                              placeholder="e.g., 2rem, 32px"
                            />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Settings */}
        <TabsContent value="effects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.heroSlider.effectsSettings', 'Advanced Effects')}</CardTitle>
              <CardDescription>
                {t('admin.heroSlider.effectsDescription', 'Configure advanced visual effects')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedSlide && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      {t('admin.heroSlider.selectedSlide', 'Selected Slide')}: {selectedSlide.title}
                    </h3>
                    <Select
                      value={selectedSlide.id}
                      onValueChange={(slideId) => {
                        const slide = settings.slides.find(s => s.id === slideId)
                        if (slide) setSelectedSlide(slide)
                      }}
                    >
                      <SelectTrigger className="w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.slides.map((slide) => (
                          <SelectItem key={slide.id} value={slide.id}>
                            {slide.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Parallax Effect */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.parallaxEffect', 'Parallax Effect')}
                      <Badge variant="secondary">Parallax</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="parallax-enabled"
                            checked={selectedSlide.effects?.parallax_enabled || false}
                            onCheckedChange={(checked) => updateSlide(selectedSlide.id, {
                              effects: {
                                ...selectedSlide.effects,
                                parallax_enabled: checked
                              }
                            })}
                          />
                          <Label htmlFor="parallax-enabled">Enable Parallax</Label>
                        </div>
                      </div>

                      {selectedSlide.effects?.parallax_enabled && (
                        <div className="space-y-2">
                          <Label htmlFor="parallax-speed">
                            Parallax Speed ({selectedSlide.effects?.parallax_speed || 0.5})
                          </Label>
                          <Slider
                            id="parallax-speed"
                            min={0.1}
                            max={2.0}
                            step={0.1}
                            value={[selectedSlide.effects?.parallax_speed || 0.5]}
                            onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                              effects: {
                                ...selectedSlide.effects,
                                parallax_speed: value[0]
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Ken Burns Effect */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.kenBurnsEffect', 'Ken Burns Effect')}
                      <Badge variant="secondary">Animation</Badge>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="ken-burns-enabled"
                            checked={selectedSlide.effects?.ken_burns_effect || false}
                            onCheckedChange={(checked) => updateSlide(selectedSlide.id, {
                              effects: {
                                ...selectedSlide.effects,
                                ken_burns_effect: checked
                              }
                            })}
                          />
                          <Label htmlFor="ken-burns-enabled">Enable Ken Burns Effect</Label>
                        </div>

                        {selectedSlide.effects?.ken_burns_effect && (
                          <div className="space-y-2">
                            <Label htmlFor="ken-burns-direction">Direction</Label>
                            <Select
                              value={selectedSlide.effects?.ken_burns_direction || 'zoom-in'}
                              onValueChange={(value) => updateSlide(selectedSlide.id, {
                                effects: {
                                  ...selectedSlide.effects,
                                  ken_burns_direction: value as any
                                }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="zoom-in">Zoom In</SelectItem>
                                <SelectItem value="zoom-out">Zoom Out</SelectItem>
                                <SelectItem value="zoom-in-out">Zoom In-Out</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {selectedSlide.effects?.ken_burns_effect && (
                        <div className="space-y-2">
                          <Label htmlFor="ken-burns-duration">
                            Duration ({selectedSlide.effects?.ken_burns_duration || 10}s)
                          </Label>
                          <Slider
                            id="ken-burns-duration"
                            min={5}
                            max={30}
                            step={1}
                            value={[selectedSlide.effects?.ken_burns_duration || 10]}
                            onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                              effects: {
                                ...selectedSlide.effects,
                                ken_burns_duration: value[0]
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Particle System */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.particleSystem', 'Particle System')}
                      <Badge variant="secondary">Particles</Badge>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="particles-enabled"
                          checked={selectedSlide.effects?.particle_system?.enabled || false}
                          onCheckedChange={(checked) => updateSlide(selectedSlide.id, {
                            effects: {
                              ...selectedSlide.effects,
                              particle_system: {
                                ...selectedSlide.effects?.particle_system,
                                enabled: checked
                              }
                            }
                          })}
                        />
                        <Label htmlFor="particles-enabled">Enable Particle System</Label>
                      </div>

                      {selectedSlide.effects?.particle_system?.enabled && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="particle-type">Particle Type</Label>
                              <Select
                                value={selectedSlide.effects?.particle_system?.type || 'stars'}
                                onValueChange={(value) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    particle_system: {
                                      ...selectedSlide.effects?.particle_system,
                                      type: value as any
                                    }
                                  }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="stars">Stars</SelectItem>
                                  <SelectItem value="dots">Dots</SelectItem>
                                  <SelectItem value="lines">Lines</SelectItem>
                                  <SelectItem value="bubbles">Bubbles</SelectItem>
                                  <SelectItem value="snow">Snow</SelectItem>
                                  <SelectItem value="rain">Rain</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="particle-density">
                                Density ({selectedSlide.effects?.particle_system?.density || 50})
                              </Label>
                              <Slider
                                id="particle-density"
                                min={1}
                                max={100}
                                step={1}
                                value={[selectedSlide.effects?.particle_system?.density || 50]}
                                onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    particle_system: {
                                      ...selectedSlide.effects?.particle_system,
                                      density: value[0]
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="particle-speed">
                                Speed ({selectedSlide.effects?.particle_system?.speed || 5})
                              </Label>
                              <Slider
                                id="particle-speed"
                                min={1}
                                max={10}
                                step={1}
                                value={[selectedSlide.effects?.particle_system?.speed || 5]}
                                onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    particle_system: {
                                      ...selectedSlide.effects?.particle_system,
                                      speed: value[0]
                                    }
                                  }
                                })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="particle-color">Particle Color</Label>
                              <Input
                                id="particle-color"
                                type="color"
                                value={selectedSlide.effects?.particle_system?.color || '#ffffff'}
                                onChange={(e) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    particle_system: {
                                      ...selectedSlide.effects?.particle_system,
                                      color: e.target.value
                                    }
                                  }
                                })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="particle-opacity">
                                Opacity ({selectedSlide.effects?.particle_system?.opacity || 50}%)
                              </Label>
                              <Slider
                                id="particle-opacity"
                                min={0}
                                max={100}
                                step={5}
                                value={[selectedSlide.effects?.particle_system?.opacity || 50]}
                                onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    particle_system: {
                                      ...selectedSlide.effects?.particle_system,
                                      opacity: value[0]
                                    }
                                  }
                                })}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Gradient Overlay */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.gradientOverlay', 'Gradient Overlay')}
                      <Badge variant="secondary">Gradient</Badge>
                    </h4>
                    
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                      💡 <strong>Theme Awareness:</strong> When no custom colors are set, the gradient will automatically adapt to your current theme (darker gradients for dark mode, lighter gradients for light mode).
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="gradient-enabled"
                          checked={selectedSlide.effects?.gradient_overlay?.enabled || false}
                          onCheckedChange={(checked) => updateSlide(selectedSlide.id, {
                            effects: {
                              ...selectedSlide.effects,
                              gradient_overlay: {
                                ...selectedSlide.effects?.gradient_overlay,
                                enabled: checked
                              }
                            }
                          })}
                        />
                        <Label htmlFor="gradient-enabled">Enable Gradient Overlay</Label>
                      </div>

                      {selectedSlide.effects?.gradient_overlay?.enabled && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="gradient-type">Gradient Type</Label>
                              <Select
                                value={selectedSlide.effects?.gradient_overlay?.type || 'linear'}
                                onValueChange={(value) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    gradient_overlay: {
                                      ...selectedSlide.effects?.gradient_overlay,
                                      type: value as any
                                    }
                                  }
                                })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="linear">Linear</SelectItem>
                                  <SelectItem value="radial">Radial</SelectItem>
                                  <SelectItem value="conic">Conic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="gradient-direction">Direction</Label>
                              <Input
                                id="gradient-direction"
                                value={selectedSlide.effects?.gradient_overlay?.direction || 'to bottom'}
                                onChange={(e) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    gradient_overlay: {
                                      ...selectedSlide.effects?.gradient_overlay,
                                      direction: e.target.value
                                    }
                                  }
                                })}
                                placeholder="e.g., to bottom, 45deg"
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="gradient-opacity">
                                Opacity ({selectedSlide.effects?.gradient_overlay?.opacity || 50}%)
                              </Label>
                              <Slider
                                id="gradient-opacity"
                                min={0}
                                max={100}
                                step={5}
                                value={[selectedSlide.effects?.gradient_overlay?.opacity || 50]}
                                onValueChange={(value: number[]) => updateSlide(selectedSlide.id, {
                                  effects: {
                                    ...selectedSlide.effects,
                                    gradient_overlay: {
                                      ...selectedSlide.effects?.gradient_overlay,
                                      opacity: value[0]
                                    }
                                  }
                                })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Gradient Colors</Label>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <Input
                                    type="color"
                                    value={selectedSlide.effects?.gradient_overlay?.colors?.[0] || '#000000'}
                                    onChange={(e) => {
                                      const colors = selectedSlide.effects?.gradient_overlay?.colors || ['#000000', '#ffffff']
                                      colors[0] = e.target.value
                                      updateSlide(selectedSlide.id, {
                                        effects: {
                                          ...selectedSlide.effects,
                                          gradient_overlay: {
                                            ...selectedSlide.effects?.gradient_overlay,
                                            colors: colors
                                          }
                                        }
                                      })
                                    }}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">Start Color</p>
                                </div>
                                <div className="flex-1">
                                  <Input
                                    type="color"
                                    value={selectedSlide.effects?.gradient_overlay?.colors?.[1] || '#ffffff'}
                                    onChange={(e) => {
                                      const colors = selectedSlide.effects?.gradient_overlay?.colors || ['#000000', '#ffffff']
                                      colors[1] = e.target.value
                                      updateSlide(selectedSlide.id, {
                                        effects: {
                                          ...selectedSlide.effects,
                                          gradient_overlay: {
                                            ...selectedSlide.effects?.gradient_overlay,
                                            colors: colors
                                          }
                                        }
                                      })
                                    }}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">End Color</p>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Leave colors as default to use theme-aware automatic colors
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Theme-aware default colors
                                  const themeAwareColors = theme === 'dark' 
                                    ? ['#000000', '#333333'] 
                                    : ['#ffffff', '#f0f0f0'];
                                  updateSlide(selectedSlide.id, {
                                    effects: {
                                      ...selectedSlide.effects,
                                      gradient_overlay: {
                                        ...selectedSlide.effects?.gradient_overlay,
                                        colors: themeAwareColors
                                      }
                                    }
                                  })
                                }}
                                className="mt-2"
                              >
                                Reset to Theme Defaults
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Custom CSS */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      {t('admin.heroSlider.customCSS', 'Custom CSS')}
                      <Badge variant="secondary">Advanced</Badge>
                    </h4>
                    
                    <Tabs defaultValue="desktop" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="desktop">Desktop</TabsTrigger>
                        <TabsTrigger value="tablet">Tablet</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                      </TabsList>

                      <TabsContent value="desktop" className="space-y-2">
                        <Label htmlFor="custom-css-desktop">Desktop CSS</Label>
                        <textarea
                          id="custom-css-desktop"
                          className="w-full h-32 p-3 text-sm border rounded-md font-mono"
                          value={selectedSlide.custom_css || ''}
                          onChange={(e) => updateSlide(selectedSlide.id, {
                            custom_css: e.target.value
                          })}
                          placeholder="/* Custom CSS for desktop */
.hero-content {
  /* Your custom styles here */
}"
                        />
                      </TabsContent>

                      <TabsContent value="tablet" className="space-y-2">
                        <Label htmlFor="custom-css-tablet">Tablet CSS</Label>
                        <textarea
                          id="custom-css-tablet"
                          className="w-full h-32 p-3 text-sm border rounded-md font-mono"
                          value={selectedSlide.custom_css_tablet || ''}
                          onChange={(e) => updateSlide(selectedSlide.id, {
                            custom_css_tablet: e.target.value
                          })}
                          placeholder="/* Custom CSS for tablet */
@media (max-width: 768px) {
  .hero-content {
    /* Your tablet styles here */
  }
}"
                        />
                      </TabsContent>

                      <TabsContent value="mobile" className="space-y-2">
                        <Label htmlFor="custom-css-mobile">Mobile CSS</Label>
                        <textarea
                          id="custom-css-mobile"
                          className="w-full h-32 p-3 text-sm border rounded-md font-mono"
                          value={selectedSlide.custom_css_mobile || ''}
                          onChange={(e) => updateSlide(selectedSlide.id, {
                            custom_css_mobile: e.target.value
                          })}
                          placeholder="/* Custom CSS for mobile */
@media (max-width: 480px) {
  .hero-content {
    /* Your mobile styles here */
  }
}"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}