import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import type { HeroSettings, HeroSlide } from '@/types'
import { heroService } from '@/services/hero'
import './hero-slider.css'

interface HeroSliderProps {
  className?: string
}

export function HeroSlider({ className = '' }: HeroSliderProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  
  const [settings, setSettings] = useState<HeroSettings | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [textVisible, setTextVisible] = useState(false)
  
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  // Load hero settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const heroSettings = await heroService.getHeroSettings()
        setSettings(heroSettings)
        setIsPlaying(heroSettings.autoplay)
      } catch (error) {
        console.error('Error loading hero settings:', error)
      }
    }
    
    loadSettings()
  }, [])

  const activeSlides = settings?.slides.filter(slide => slide.is_active) || []

  // Auto-play functionality
  const nextSlide = useCallback(() => {
    if (activeSlides.length <= 1) return
    
    setCurrentSlide(prev => 
      settings?.infinite_loop 
        ? (prev + 1) % activeSlides.length
        : Math.min(prev + 1, activeSlides.length - 1)
    )
    setTextVisible(false)
    setTimeout(() => setTextVisible(true), 300)
  }, [activeSlides.length, settings?.infinite_loop])

  const prevSlide = useCallback(() => {
    if (activeSlides.length <= 1) return
    
    setCurrentSlide(prev => 
      settings?.infinite_loop 
        ? (prev - 1 + activeSlides.length) % activeSlides.length
        : Math.max(prev - 1, 0)
    )
    setTextVisible(false)
    setTimeout(() => setTextVisible(true), 300)
  }, [activeSlides.length, settings?.infinite_loop])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
    setTextVisible(false)
    setTimeout(() => setTextVisible(true), 300)
  }, [])

  // Handle autoplay
  useEffect(() => {
    if (!settings || !isPlaying || isHovered && settings.pause_on_hover) {
      return
    }

    autoplayTimer.current = setInterval(nextSlide, settings.autoplay_delay)
    
    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current)
      }
    }
  }, [settings, isPlaying, isHovered, nextSlide])

  // Progress bar animation
  useEffect(() => {
    if (!settings || !isPlaying || isHovered && settings.pause_on_hover) {
      setLoadProgress(0)
      return
    }

    setLoadProgress(0)
    const duration = settings.autoplay_delay
    const interval = 50
    const increment = (interval / duration) * 100

    progressTimer.current = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          return 0
        }
        return prev + increment
      })
    }, interval)

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current)
      }
    }
  }, [settings, isPlaying, isHovered, currentSlide])

  // Initialize text animation
  useEffect(() => {
    setTextVisible(false)
    const timer = setTimeout(() => setTextVisible(true), 500)
    return () => clearTimeout(timer)
  }, [currentSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (isRTL) {
          nextSlide()
        } else {
          prevSlide()
        }
      } else if (e.key === 'ArrowRight') {
        if (isRTL) {
          prevSlide()
        } else {
          nextSlide()
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextSlide, prevSlide, isRTL])

  const getFilterClasses = (slide: HeroSlide) => {
    const blurClass = `hero-filter-blur-${slide.blur_intensity}`
    const brightnessClass = `hero-brightness-${slide.brightness}`
    const contrastClass = `hero-contrast-${slide.contrast}`
    const saturateClass = `hero-saturate-${slide.saturation}`
    
    return `hero-slider-media ${blurClass} ${brightnessClass} ${contrastClass} ${saturateClass}`
  }

  const getOverlayClasses = () => {
    return 'absolute inset-0'
  }

  const getOverlayStyle = (slide: HeroSlide) => {
    const hex = slide.overlay_color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${slide.overlay_opacity / 100})`
    }
  }

  if (!settings || activeSlides.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>{t('common.loading', 'Loading...')}</p>
        </div>
      </div>
    )
  }

  const currentSlideData = activeSlides[currentSlide]
  if (!currentSlideData) return null

  return (
    <section 
      className={`relative w-full min-h-screen flex items-center overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Background */}
      <div className="absolute inset-0 z-0">
        {activeSlides.map((slide, index) => (
          <div
            key={slide.id}
            ref={(el) => {
              slideRefs.current[index] = el
            }}
            className={`absolute inset-0 transition-all duration-${settings.transition_duration} ease-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {slide.media_type === 'video' ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className={getFilterClasses(slide)}
                poster={slide.media_thumbnail}
              >
                <source src={slide.media_url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={slide.media_url}
                alt={isRTL ? slide.title_ar || slide.title : slide.title}
                className={getFilterClasses(slide)}
              />
            )}
            
            {/* Overlay */}
            <div 
              className={getOverlayClasses()}
              style={getOverlayStyle(slide)}
            />
          </div>
        ))}
        
        {/* Additional gradient overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* Navigation Arrows */}
      {settings.show_arrows && activeSlides.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 w-12 h-12"
            onClick={isRTL ? nextSlide : prevSlide}
            aria-label={isRTL ? t('common.nextSlide', 'Next slide') : t('common.prevSlide', 'Previous slide')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300 w-12 h-12"
            onClick={isRTL ? prevSlide : nextSlide}
            aria-label={isRTL ? t('common.prevSlide', 'Previous slide') : t('common.nextSlide', 'Next slide')}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Content */}
      <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-6xl mx-auto ${
          currentSlideData.text_position === 'left' ? 'text-left' :
          currentSlideData.text_position === 'right' ? 'text-right' :
          'text-center'
        }`}>
          <div className={`space-y-6 transition-all duration-1000 ease-out ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="space-y-4">
              {(currentSlideData.subtitle || currentSlideData.subtitle_ar) && (
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium shadow-xl">
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-5 w-5 mr-2 object-contain no-flip"
                  />
                  {isRTL ? currentSlideData.subtitle_ar || currentSlideData.subtitle : currentSlideData.subtitle}
                </div>
              )}
              
              <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl leading-tight ${
                currentSlideData.text_alignment === 'left' ? 'text-left' :
                currentSlideData.text_alignment === 'right' ? 'text-right' :
                'text-center'
              }`}>
                <span className="block bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent">
                  {isRTL ? currentSlideData.title_ar || currentSlideData.title : currentSlideData.title}
                </span>
              </h1>
            </div>
            
            {(currentSlideData.description || currentSlideData.description_ar) && (
              <p className={`text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-lg ${
                currentSlideData.text_position === 'left' ? 'mx-0' :
                currentSlideData.text_position === 'right' ? 'ml-auto' :
                'mx-auto'
              } ${
                currentSlideData.text_alignment === 'left' ? 'text-left' :
                currentSlideData.text_alignment === 'right' ? 'text-right' :
                'text-center'
              }`}>
                {isRTL ? currentSlideData.description_ar || currentSlideData.description : currentSlideData.description}
              </p>
            )}
            
            {/* Action Buttons */}
            {(currentSlideData.button_text || currentSlideData.secondary_button_text) && (
              <div className={`flex flex-col sm:flex-row gap-4 pt-6 ${
                currentSlideData.text_alignment === 'left' ? 'justify-start' :
                currentSlideData.text_alignment === 'right' ? 'justify-end' :
                'justify-center'
              }`}>
                {currentSlideData.button_text && (
                  <Button 
                    asChild 
                    size="lg" 
                    className={`shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm ${
                      currentSlideData.button_variant === 'primary' ? 'btn-coffee' :
                      currentSlideData.button_variant === 'secondary' ? 'btn-secondary' :
                      'btn-outline'
                    }`}
                  >
                    <a href={currentSlideData.button_link || '#'}>
                      {isRTL ? currentSlideData.button_text_ar || currentSlideData.button_text : currentSlideData.button_text}
                    </a>
                  </Button>
                )}
                {currentSlideData.secondary_button_text && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" 
                    asChild
                  >
                    <a href={currentSlideData.secondary_button_link || '#'}>
                      {isRTL ? currentSlideData.secondary_button_text_ar || currentSlideData.secondary_button_text : currentSlideData.secondary_button_text}
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {settings.show_dots && activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`${t('common.goToSlide', 'Go to slide')} ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {settings.show_progress && isPlaying && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 hero-slider-progress"
            style={{ width: `${loadProgress}%` }}
          />
        </div>
      )}

      {/* Play/Pause Button */}
      {activeSlides.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          onClick={() => setIsPlaying(prev => !prev)}
          aria-label={isPlaying ? t('common.pause', 'Pause') : t('common.play', 'Play')}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
      )}
    </section>
  )
}
