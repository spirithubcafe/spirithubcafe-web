import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, Move, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { heroService } from '@/services/hero'
import type { HeroSettings } from '@/types'
import { HeroSliderSettings } from './HeroSliderSettings'

export function HeroSlideManagement() {
    const { i18n } = useTranslation()
  const navigate = useNavigate()
  const isRTL = i18n.language === 'ar'

  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [draggedSlide, setDraggedSlide] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await heroService.getHeroSettings()
      setSettings(data)
    } catch (error) {
      console.error('Error loading hero settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه الشريحة؟' : 'Are you sure you want to delete this slide?')) {
      return
    }

    try {
      await heroService.deleteSlide(slideId)
      alert(isRTL ? 'تم حذف الشريحة بنجاح' : 'Slide deleted successfully')
      loadSettings()
    } catch (error) {
      console.error('Error deleting slide:', error)
      alert(isRTL ? 'خطأ في حذف الشريحة' : 'Error deleting slide')
    }
  }

  const handleToggleSlide = async (slideId: string) => {
    try {
      await heroService.toggleSlideStatus(slideId)
      loadSettings()
    } catch (error) {
      console.error('Error toggling slide:', error)
      alert(isRTL ? 'خطأ في تغيير حالة الشريحة' : 'Error toggling slide status')
    }
  }

  const handleDragStart = (slideId: string) => {
    setDraggedSlide(slideId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetSlideId: string) => {
    e.preventDefault()
    
    if (!draggedSlide || draggedSlide === targetSlideId) return

    try {
      const slides = settings?.slides || []
      const draggedIndex = slides.findIndex(s => s.id === draggedSlide)
      const targetIndex = slides.findIndex(s => s.id === targetSlideId)

      if (draggedIndex === -1 || targetIndex === -1) return

      const newSlides = [...slides]
      const [draggedItem] = newSlides.splice(draggedIndex, 1)
      newSlides.splice(targetIndex, 0, draggedItem)

      // Update sort orders
      const reorderedSlideIds = newSlides.map(slide => slide.id)

      await heroService.reorderSlides(reorderedSlideIds)
      loadSettings()
    } catch (error) {
      console.error('Error reordering slides:', error)
      alert(isRTL ? 'خطأ في إعادة ترتيب الشرائح' : 'Error reordering slides')
    } finally {
      setDraggedSlide(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (showSettings) {
    return (
      <HeroSliderSettings 
        onClose={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Settings Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isRTL ? 'إدارة الشريط الرئيسي' : 'Hero Slider Management'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'إدارة شرائح العرض والتنظیمات المتقدمة' : 'Manage slides and advanced settings'}
          </p>
        </div>
        <Button onClick={() => setShowSettings(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          {isRTL ? 'التنظیمات المتقدمة' : 'Advanced Settings'}
        </Button>
      </div>

      {/* Slides Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{isRTL ? 'الشرائح' : 'Slides'}</CardTitle>
            <CardDescription>
              {isRTL ? 'إدارة شرائح العرض في الصفحة الرئيسية' : 'Manage hero slideshow slides'}
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/hero-slide/add')}>
            <Plus className="h-4 w-4 mr-2" />
            {isRTL ? 'إضافة شريحة' : 'Add Slide'}
          </Button>
        </CardHeader>
        <CardContent>
          {settings?.slides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لا توجد شرائح. أضف الشريحة الأولى للبدء.' : 'No slides found. Add your first slide to get started.'}
            </div>
          ) : (
            <div className="space-y-4">
              {settings?.slides
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((slide) => (
                  <div
                    key={slide.id}
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(slide.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, slide.id)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <Move className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    {/* Slide Preview */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                        {slide.media_type === 'video' ? (
                          <video 
                            src={slide.media_url} 
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img 
                            src={slide.media_url} 
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* Slide Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {isRTL && slide.title_ar ? slide.title_ar : slide.title}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {isRTL && slide.subtitle_ar ? slide.subtitle_ar : slide.subtitle}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSlide(slide.id)}
                        className={slide.is_active ? 'text-green-600' : 'text-muted-foreground'}
                      >
                        {slide.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/hero-slide/edit/${slide.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="text-destructive hover:text-destructive"
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
