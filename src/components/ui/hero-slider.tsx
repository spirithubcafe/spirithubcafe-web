import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const [cursorSide, setCursorSide] = useState<'left' | 'right'>('right')
  
  const autoplayTimer = useRef<NodeJS.Timeout | null>(null)
  const progressTimer = useRef<NodeJS.Timeout | null>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const sliderRef = useRef<HTMLElement>(null)

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

    // Listen for settings updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hero-settings-updated') {
        loadSettings()
      }
    }

    const handleCustomEvent = () => {
      loadSettings()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('hero-settings-updated', handleCustomEvent)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('hero-settings-updated', handleCustomEvent)
    }
  }, [])

  const activeSlides = useMemo(() => 
    settings?.slides.filter(slide => slide.is_active) || [], 
    [settings?.slides]
  )

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

    const currentSlideDuration = activeSlides[currentSlide]?.duration 
      ? activeSlides[currentSlide].duration * 1000
      : settings.autoplay_delay

    autoplayTimer.current = setInterval(nextSlide, currentSlideDuration)
    
    return () => {
      if (autoplayTimer.current) {
        clearInterval(autoplayTimer.current)
      }
    }
  }, [settings, isPlaying, isHovered, nextSlide, currentSlide, activeSlides])

  // Progress bar animation
  useEffect(() => {
    if (!settings || !isPlaying || isHovered && settings.pause_on_hover) {
      setLoadProgress(0)
      return
    }

    setLoadProgress(0)
    const currentSlideDuration = activeSlides[currentSlide]?.duration 
      ? activeSlides[currentSlide].duration * 1000
      : settings.autoplay_delay
    const interval = 50
    const increment = (interval / currentSlideDuration) * 100

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
  }, [settings, isPlaying, isHovered, currentSlide, activeSlides])

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

  // Mouse tracking for custom cursor
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const centerX = rect.width / 2
    
    setCursorSide(x < centerX ? 'left' : 'right')
  }, [])

  // Handle click navigation
  const handleSliderClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (activeSlides.length <= 1) return
    
    if (!sliderRef.current) return
    
    const rect = sliderRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const centerX = rect.width / 2
    
    if (x < centerX) {
      if (isRTL) {
        nextSlide()
      } else {
        prevSlide()
      }
    } else {
      if (isRTL) {
        prevSlide()
      } else {
        nextSlide()
      }
    }
  }, [activeSlides.length, isRTL, nextSlide, prevSlide])

  // Get typography styles
  const getTypographyStyle = useCallback((slide: HeroSlide, element: 'title' | 'subtitle' | 'description') => {
    const slideTypography = slide.typography
    const globalTypography = settings?.global_typography
    
    const getStyleValue = (slideKey: string, globalKey: string) => {
      return slideTypography?.[slideKey as keyof typeof slideTypography] || 
             globalTypography?.[globalKey as keyof typeof globalTypography]
    }
    
    const suffix = isRTL ? '_ar' : ''
    const baseKey = `${element}_`
    
    const style: React.CSSProperties = {}
    
    const fontFamily = getStyleValue(`${baseKey}font_family${suffix}`, `${baseKey}font_family${suffix}`)
    const fontSize = getStyleValue(`${baseKey}font_size${suffix}`, `${baseKey}font_size${suffix}`)
    const fontWeight = getStyleValue(`${baseKey}font_weight${suffix}`, `${baseKey}font_weight${suffix}`)
    const lineHeight = getStyleValue(`${baseKey}line_height${suffix}`, `${baseKey}line_height${suffix}`)
    const letterSpacing = getStyleValue(`${baseKey}letter_spacing${suffix}`, `${baseKey}letter_spacing${suffix}`)
    const textTransform = getStyleValue(`${baseKey}text_transform${suffix}`, `${baseKey}text_transform${suffix}`)
    
    // Force all text to be white with subtle black shadow
    style.color = '#ffffff'
    style.textShadow = '1px 1px 2px rgba(0, 0, 0, 0.4)'
    
    if (fontFamily && typeof fontFamily === 'string') style.fontFamily = fontFamily
    if (fontSize && typeof fontSize === 'string') style.fontSize = fontSize
    if (fontWeight && typeof fontWeight === 'number') style.fontWeight = fontWeight
    if (lineHeight && typeof lineHeight === 'number') style.lineHeight = lineHeight
    if (letterSpacing && typeof letterSpacing === 'string') style.letterSpacing = letterSpacing
    if (textTransform && typeof textTransform === 'string') style.textTransform = textTransform as any
    
    return style
  }, [isRTL, settings?.global_typography])

  // Get animation classes
  const getAnimationClass = useCallback((slide: HeroSlide, element: 'title' | 'subtitle' | 'description' | 'buttons') => {
    const slideAnimation = slide.animation
    const globalAnimation = settings?.global_animation
    
    const animationType = slideAnimation?.[`${element}_animation` as keyof typeof slideAnimation] || 
                         globalAnimation?.[`${element}_animation` as keyof typeof globalAnimation]
    
    if (!animationType || animationType === 'none') return ''
    
    return `hero-animate-${animationType}`
  }, [settings?.global_animation])

  // Get animation delay and duration
  const getAnimationStyle = useCallback((slide: HeroSlide, element: 'title' | 'subtitle' | 'description' | 'buttons') => {
    const slideAnimation = slide.animation
    const globalAnimation = settings?.global_animation
    
    const delay = slideAnimation?.[`${element}_animation_delay` as keyof typeof slideAnimation] || 
                  globalAnimation?.[`${element}_animation_delay` as keyof typeof globalAnimation] || 0
    const duration = slideAnimation?.[`${element}_animation_duration` as keyof typeof slideAnimation] || 
                     globalAnimation?.[`${element}_animation_duration` as keyof typeof globalAnimation] || 500
    
    return {
      animationDelay: `${delay}ms`,
      animationDuration: `${duration}ms`,
    } as React.CSSProperties
  }, [settings?.global_animation])

  // Get button styles
  const getButtonStyle = useCallback((slide: HeroSlide, buttonType: 'primary' | 'secondary') => {
    const slideButtonSettings = slide.button_settings
    const globalButtonSettings = settings?.global_button_settings
    
    const buttonStyle = buttonType === 'primary' 
      ? slideButtonSettings?.primary_button_style || globalButtonSettings?.primary_button_style
      : slideButtonSettings?.secondary_button_style || globalButtonSettings?.secondary_button_style
    
    if (!buttonStyle) return {}
    
    const style: React.CSSProperties = {}
    
    if (buttonStyle.background_color) style.backgroundColor = buttonStyle.background_color
    if (buttonStyle.background_gradient) style.backgroundImage = buttonStyle.background_gradient
    // Force button text to be white with subtle black shadow
    style.color = '#ffffff'
    style.textShadow = '0.5px 0.5px 1px rgba(0, 0, 0, 0.3)'
    if (buttonStyle.border_color) style.borderColor = buttonStyle.border_color
    if (buttonStyle.border_width) style.borderWidth = `${buttonStyle.border_width}px`
    if (buttonStyle.border_radius) style.borderRadius = buttonStyle.border_radius
    if (buttonStyle.font_family) style.fontFamily = buttonStyle.font_family
    if (buttonStyle.font_size) style.fontSize = buttonStyle.font_size
    if (buttonStyle.font_weight) style.fontWeight = buttonStyle.font_weight
    if (buttonStyle.padding) style.padding = buttonStyle.padding
    if (buttonStyle.margin) style.margin = buttonStyle.margin
    if (buttonStyle.shadow) style.boxShadow = buttonStyle.shadow
    if (buttonStyle.transition_duration) style.transition = `all ${buttonStyle.transition_duration}ms ease`
    
    return style
  }, [settings?.global_button_settings])

  // Get layout styles
  const getLayoutStyle = useCallback((slide: HeroSlide) => {
    const slideLayout = slide.layout
    const globalLayout = settings?.global_layout
    
    const layout = slideLayout || globalLayout
    if (!layout) return {}
    
    const style: React.CSSProperties = {}
    
    if (layout.container_max_width) style.maxWidth = layout.container_max_width
    if (layout.content_padding) style.padding = layout.content_padding
    if (layout.content_margin) style.margin = layout.content_margin
    if (layout.content_width) style.width = layout.content_width
    
    return style
  }, [settings?.global_layout])

  const getFilterClasses = (slide: HeroSlide) => {
    const blurClass = `hero-filter-blur-${slide.blur_intensity}`
    const brightnessClass = `hero-brightness-${slide.brightness}`
    const contrastClass = `hero-contrast-${slide.contrast}`
    const saturateClass = `hero-saturate-${slide.saturation}`
    
    return `hero-slider-media ${blurClass} ${brightnessClass} ${contrastClass} ${saturateClass}`
  }

  const getFilterStyle = (slide: HeroSlide) => {
    const filters = []
    
    if (slide.hue_rotation) filters.push(`hue-rotate(${slide.hue_rotation}deg)`)
    if (slide.sepia) filters.push(`sepia(${slide.sepia}%)`)
    if (slide.grayscale) filters.push(`grayscale(${slide.grayscale}%)`)
    if (slide.invert) filters.push('invert(1)')
    
    return filters.length > 0 ? { filter: filters.join(' ') } : {}
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
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mx-auto mb-8 w-16 h-16">
            <div className="hero-loading-spinner mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl opacity-60">☕</span>
            </div>
          </div>
          <h3 className="text-foreground font-semibold text-xl mb-2">
            {t('common.loading', 'Loading...')}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isRTL ? 'جاري تحضير تجربتك المميزة...' : 'Preparing your premium experience...'}
          </p>
        </div>
      </div>
    )
  }

  const currentSlideData = activeSlides[currentSlide]
  if (!currentSlideData) return null

  return (
    <section 
      ref={sliderRef}
      className={`relative w-full min-h-screen flex items-center overflow-hidden hero-slider-container ${
        activeSlides.length > 1 ? (cursorSide === 'left' ? 'cursor-left' : 'cursor-right') : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleSliderClick}
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
                style={getFilterStyle(slide)}
                poster={slide.media_thumbnail}
              >
                <source src={slide.media_url} type="video/mp4" />
              </video>
            ) : (
              <img
                src={slide.media_url}
                alt={isRTL ? slide.title_ar || slide.title : slide.title}
                className={getFilterClasses(slide)}
                style={getFilterStyle(slide)}
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

      {/* Content */}
      <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8">
        <div 
          className={`max-w-6xl mx-auto ${
            currentSlideData.text_position === 'left' ? 'text-left' :
            currentSlideData.text_position === 'right' ? 'text-right' :
            'text-center'
          }`}
          style={getLayoutStyle(currentSlideData)}
        >
          <div className={`space-y-6 transition-all duration-1000 ease-out ${
            textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="space-y-4">
              {(currentSlideData.subtitle || currentSlideData.subtitle_ar) && (
                <div 
                  className={`inline-flex items-center px-6 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium shadow-xl ${getAnimationClass(currentSlideData, 'subtitle')}`}
                  style={{
                    ...getTypographyStyle(currentSlideData, 'subtitle'),
                    ...getAnimationStyle(currentSlideData, 'subtitle')
                  }}
                >
                  <img 
                    src="/images/logo-s.png" 
                    alt="SpiritHub Cafe Logo" 
                    className="h-5 w-5 mr-2 object-contain no-flip"
                  />
                  {isRTL ? currentSlideData.subtitle_ar || currentSlideData.subtitle : currentSlideData.subtitle}
                </div>
              )}
              
              <h1 
                className={`text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white drop-shadow-md leading-tight ${
                  currentSlideData.text_alignment === 'left' ? 'text-left' :
                  currentSlideData.text_alignment === 'right' ? 'text-right' :
                  'text-center'
                } ${getAnimationClass(currentSlideData, 'title')}`}
                style={{
                  ...getTypographyStyle(currentSlideData, 'title'),
                  ...getAnimationStyle(currentSlideData, 'title')
                }}
              >
                <span className="block">
                  {isRTL ? currentSlideData.title_ar || currentSlideData.title : currentSlideData.title}
                </span>
              </h1>
            </div>
            
            {(currentSlideData.description || currentSlideData.description_ar) && (
              <p 
                className={`text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed drop-shadow-sm ${
                  currentSlideData.text_position === 'left' ? 'mx-0' :
                  currentSlideData.text_position === 'right' ? 'ml-auto' :
                  'mx-auto'
                } ${
                  currentSlideData.text_alignment === 'left' ? 'text-left' :
                  currentSlideData.text_alignment === 'right' ? 'text-right' :
                  'text-center'
                } ${getAnimationClass(currentSlideData, 'description')}`}
                style={{
                  ...getTypographyStyle(currentSlideData, 'description'),
                  ...getAnimationStyle(currentSlideData, 'description')
                }}
              >
                {isRTL ? currentSlideData.description_ar || currentSlideData.description : currentSlideData.description}
              </p>
            )}
            
            {/* Action Buttons */}
            {(currentSlideData.button_text || currentSlideData.secondary_button_text) && (
              <div 
                className={`flex flex-col sm:flex-row gap-4 pt-6 ${
                  currentSlideData.text_alignment === 'left' ? 'justify-start' :
                  currentSlideData.text_alignment === 'right' ? 'justify-end' :
                  'justify-center'
                } ${getAnimationClass(currentSlideData, 'buttons')}`}
                style={getAnimationStyle(currentSlideData, 'buttons')}
              >
                {currentSlideData.button_text && (
                  <a 
                    href={currentSlideData.button_link || '#'}
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
                    style={{
                      ...getButtonStyle(currentSlideData, 'primary'),
                      backgroundColor: currentSlideData.button_variant === 'primary' ? '#d97706' : 
                                     currentSlideData.button_variant === 'secondary' ? 'rgba(255,255,255,0.2)' : 
                                     'transparent',
                      color: 'white',
                      border: currentSlideData.button_variant === 'outline' ? '1px solid rgba(255,255,255,0.5)' : 'none'
                    }}
                  >
                    {isRTL ? currentSlideData.button_text_ar || currentSlideData.button_text : currentSlideData.button_text}
                  </a>
                )}
                {currentSlideData.secondary_button_text && (
                  <a 
                    href={currentSlideData.secondary_button_link || '#'}
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                    style={getButtonStyle(currentSlideData, 'secondary')}
                  >
                    {isRTL ? currentSlideData.secondary_button_text_ar || currentSlideData.secondary_button_text : currentSlideData.secondary_button_text}
                  </a>
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
    </section>
  )
}