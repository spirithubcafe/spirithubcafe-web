import { jsonHeroService } from '@/services/jsonSettingsService'
import type { HeroSettings, HeroSlide } from '@/types'

class HeroService {
  async getHeroSettings(): Promise<HeroSettings> {
    try {
      const settings = await jsonHeroService.getHeroSettings()
      if (settings) {
        // Ensure all advanced settings exist, merge with defaults if missing
        const defaultSettings = this.getDefaultHeroSettings()
        return this.mergeWithDefaults(settings, defaultSettings)
      }
      
      // Return default settings if not found
      return this.getDefaultHeroSettings()
    } catch (error) {
      console.error('Error getting hero settings:', error)
      return this.getDefaultHeroSettings()
    }
  }

  private mergeWithDefaults(current: HeroSettings, defaults: HeroSettings): HeroSettings {
    return {
      ...defaults,
      ...current,
      global_typography: { ...defaults.global_typography, ...current.global_typography },
      global_animation: { ...defaults.global_animation, ...current.global_animation },
      global_button_settings: {
        primary_button_style: { ...defaults.global_button_settings?.primary_button_style, ...current.global_button_settings?.primary_button_style },
        secondary_button_style: { ...defaults.global_button_settings?.secondary_button_style, ...current.global_button_settings?.secondary_button_style }
      },
      global_layout: { 
        ...defaults.global_layout, 
        ...current.global_layout,
        responsive_breakpoints: {
          mobile: { ...defaults.global_layout?.responsive_breakpoints?.mobile, ...current.global_layout?.responsive_breakpoints?.mobile },
          tablet: { ...defaults.global_layout?.responsive_breakpoints?.tablet, ...current.global_layout?.responsive_breakpoints?.tablet },
          desktop: { ...defaults.global_layout?.responsive_breakpoints?.desktop, ...current.global_layout?.responsive_breakpoints?.desktop }
        }
      },
      global_effects: {
        ...defaults.global_effects,
        ...current.global_effects,
        particle_system: { ...defaults.global_effects?.particle_system, ...current.global_effects?.particle_system },
        gradient_overlay: { ...defaults.global_effects?.gradient_overlay, ...current.global_effects?.gradient_overlay }
      },
      slides: current.slides.map(slide => ({
        ...slide,
        typography: { ...defaults.slides[0]?.typography, ...slide.typography },
        animation: { ...defaults.slides[0]?.animation, ...slide.animation },
        button_settings: {
          primary_button_style: { ...defaults.slides[0]?.button_settings?.primary_button_style, ...slide.button_settings?.primary_button_style },
          secondary_button_style: { ...defaults.slides[0]?.button_settings?.secondary_button_style, ...slide.button_settings?.secondary_button_style }
        },
        layout: {
          ...defaults.slides[0]?.layout,
          ...slide.layout,
          responsive_breakpoints: {
            mobile: { ...defaults.slides[0]?.layout?.responsive_breakpoints?.mobile, ...slide.layout?.responsive_breakpoints?.mobile },
            tablet: { ...defaults.slides[0]?.layout?.responsive_breakpoints?.tablet, ...slide.layout?.responsive_breakpoints?.tablet },
            desktop: { ...defaults.slides[0]?.layout?.responsive_breakpoints?.desktop, ...slide.layout?.responsive_breakpoints?.desktop }
          }
        },
        effects: {
          ...defaults.slides[0]?.effects,
          ...slide.effects,
          particle_system: { ...defaults.slides[0]?.effects?.particle_system, ...slide.effects?.particle_system },
          gradient_overlay: { ...defaults.slides[0]?.effects?.gradient_overlay, ...slide.effects?.gradient_overlay }
        }
      }))
    }
  }

  async updateHeroSettings(settings: HeroSettings): Promise<void> {
    try {
      await jsonHeroService.saveHeroSettings(settings)
    } catch (error) {
      console.error('Error updating hero settings:', error)
      throw error
    }
  }

  async addSlide(slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>): Promise<HeroSlide> {
    try {
      const slides = await jsonHeroService.getHeroSlides()
      const newSlide: HeroSlide = {
        ...slide,
        id: this.generateSlideId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      slides.push(newSlide)
      slides.sort((a, b) => a.sort_order - b.sort_order)
      
      await jsonHeroService.saveHeroSlides(slides)
      return newSlide
    } catch (error) {
      console.error('Error adding slide:', error)
      throw error
    }
  }

  async updateSlide(slideId: string, updates: Partial<HeroSlide>): Promise<void> {
    try {
      const slides = await jsonHeroService.getHeroSlides()
      const slideIndex = slides.findIndex(slide => slide.id === slideId)
      
      if (slideIndex === -1) {
        throw new Error('Slide not found')
      }
      
      slides[slideIndex] = {
        ...slides[slideIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      slides.sort((a, b) => a.sort_order - b.sort_order)
      await jsonHeroService.saveHeroSlides(slides)
    } catch (error) {
      console.error('Error updating slide:', error)
      throw error
    }
  }

  async deleteSlide(slideId: string): Promise<void> {
    try {
      const slides = await jsonHeroService.getHeroSlides()
      const filteredSlides = slides.filter(slide => slide.id !== slideId)
      
      await jsonHeroService.saveHeroSlides(filteredSlides)
    } catch (error) {
      console.error('Error deleting slide:', error)
      throw error
    }
  }

  async reorderSlides(slideIds: string[]): Promise<void> {
    try {
      const slides = await jsonHeroService.getHeroSlides()
      
      // Update sort_order based on the new order
      const reorderedSlides = slides.map(slide => {
        const newIndex = slideIds.indexOf(slide.id)
        return {
          ...slide,
          sort_order: newIndex !== -1 ? newIndex : slide.sort_order,
          updated_at: new Date().toISOString()
        }
      }).sort((a, b) => a.sort_order - b.sort_order)
      
      await jsonHeroService.saveHeroSlides(reorderedSlides)
    } catch (error) {
      console.error('Error reordering slides:', error)
      throw error
    }
  }

  async initializeAdvancedSettings(): Promise<void> {
    try {
      const settings = await this.getHeroSettings()
      // This will trigger the merge with defaults and save updated settings
      await jsonHeroService.saveHeroSettings(settings)
    } catch (error) {
      console.error('Error initializing advanced settings:', error)
      throw error
    }
  }

  async toggleSlideStatus(slideId: string): Promise<void> {
    try {
      const slides = await jsonHeroService.getHeroSlides()
      const slideIndex = slides.findIndex(slide => slide.id === slideId)
      
      if (slideIndex === -1) {
        throw new Error('Slide not found')
      }
      
      slides[slideIndex].is_active = !slides[slideIndex].is_active
      slides[slideIndex].updated_at = new Date().toISOString()
      
      await jsonHeroService.saveHeroSlides(slides)
    } catch (error) {
      console.error('Error toggling slide status:', error)
      throw error
    }
  }

  private generateSlideId(): string {
    return `slide_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getDefaultHeroSettings(): HeroSettings {
    return {
      autoplay: true,
      autoplay_delay: 5000,
      show_arrows: false, // Updated based on user requirements
      show_dots: true,
      show_progress: true,
      transition_effect: 'slide',
      transition_duration: 800,
      enable_swipe: true,
      pause_on_hover: true,
      infinite_loop: true,
      global_typography: {
        title_font_family: 'Inter, sans-serif',
        title_font_family_ar: 'Tajawal, sans-serif',
        title_font_size: '3rem',
        title_font_size_ar: '3rem',
        title_font_weight: 700,
        title_font_weight_ar: 700,
        title_color: '#ffffff',
        title_color_ar: '#ffffff',
        subtitle_font_family: 'Inter, sans-serif',
        subtitle_font_family_ar: 'Tajawal, sans-serif',
        subtitle_font_size: '1.25rem',
        subtitle_font_size_ar: '1.25rem',
        subtitle_font_weight: 500,
        subtitle_font_weight_ar: 500,
        subtitle_color: '#e5e7eb',
        subtitle_color_ar: '#e5e7eb',
        description_font_family: 'Inter, sans-serif',
        description_font_family_ar: 'Tajawal, sans-serif',
        description_font_size: '1rem',
        description_font_size_ar: '1rem',
        description_font_weight: 400,
        description_font_weight_ar: 400,
        description_color: '#d1d5db',
        description_color_ar: '#d1d5db'
      },
      global_animation: {
        title_animation: 'fadeIn',
        title_animation_delay: 0,
        title_animation_duration: 1000,
        subtitle_animation: 'fadeIn',
        subtitle_animation_delay: 300,
        subtitle_animation_duration: 1000,
        description_animation: 'fadeIn',
        description_animation_delay: 600,
        description_animation_duration: 1000,
        buttons_animation: 'fadeIn',
        buttons_animation_delay: 900,
        buttons_animation_duration: 1000
      },
      global_button_settings: {
        primary_button_style: {
          background_color: '#d97706',
          text_color: '#ffffff',
          border_radius: '0.375rem',
          font_size: '1rem',
          font_weight: 500,
          padding: '0.75rem 1.5rem',
          shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition_duration: 300,
          hover_background_color: '#b45309',
          hover_transform: 'translateY(-2px)',
          hover_shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        },
        secondary_button_style: {
          background_color: 'rgba(255,255,255,0.1)',
          text_color: '#ffffff',
          border_color: 'rgba(255,255,255,0.3)',
          border_width: 1,
          border_radius: '0.375rem',
          font_size: '1rem',
          font_weight: 500,
          padding: '0.75rem 1.5rem',
          hover_background_color: 'rgba(255,255,255,0.2)'
        }
      },
      global_layout: {
        container_max_width: '1200px',
        content_width: '100%',
        content_padding: '2rem',
        content_margin: '0 auto',
        vertical_alignment: 'center',
        horizontal_alignment: 'center',
        background_overlay_shape: 'none',
        background_overlay_shape_color: '#000000',
        background_overlay_shape_opacity: 50,
        responsive_breakpoints: {
          mobile: {
            title_font_size: '2rem',
            content_padding: '1rem'
          },
          tablet: {
            title_font_size: '3rem',
            content_padding: '1.5rem'
          },
          desktop: {
            title_font_size: '4rem',
            content_padding: '2rem'
          }
        }
      },
      global_effects: {
        parallax_enabled: false,
        parallax_speed: 0.5,
        ken_burns_effect: false,
        ken_burns_direction: 'zoom-in',
        ken_burns_duration: 10,
        particle_system: {
          enabled: false,
          type: 'stars',
          density: 50,
          speed: 5,
          color: '#ffffff',
          opacity: 50
        },
        gradient_overlay: {
          enabled: false,
          type: 'linear',
          direction: 'to bottom',
          opacity: 50,
          colors: ['#000000', '#ffffff']
        }
      },
      slides: [
        {
          id: 'default_slide_1',
          title: 'Discover Premium Coffee',
          title_ar: 'اكتشف القهوة الفاخرة',
          subtitle: 'Roasted with passion, served with excellence',
          subtitle_ar: 'محمصة بشغف، تُقدم بامتياز',
          description: 'Experience the finest coffee blends from around the world, carefully selected and expertly roasted.',
          description_ar: 'استمتع بأجود خلطات القهوة من جميع أنحاء العالم، مختارة بعناية ومحمصة بخبرة.',
          media_type: 'video',
          media_url: '/video/back.mp4',
          blur_intensity: 6,
          brightness: 50,
          contrast: 130,
          saturation: 80,
          duration: 6,
          button_text: 'Shop Now',
          button_text_ar: 'تسوق الآن',
          button_link: '/shop',
          button_variant: 'primary',
          secondary_button_text: 'About Us',
          secondary_button_text_ar: 'من نحن',
          secondary_button_link: '/about',
          text_position: 'center',
          text_alignment: 'center',
          overlay_opacity: 70,
          overlay_color: '#000000',
          is_active: true,
          sort_order: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Default advanced settings for this slide
          typography: {
            title_font_family: 'Inter, sans-serif',
            title_font_family_ar: 'Tajawal, sans-serif',
            title_font_size: '3rem',
            title_font_size_ar: '3rem',
            title_font_weight: 700,
            title_font_weight_ar: 700,
            title_color: '#ffffff',
            title_color_ar: '#ffffff',
            subtitle_font_family: 'Inter, sans-serif',
            subtitle_font_family_ar: 'Tajawal, sans-serif',
            subtitle_font_size: '1.25rem',
            subtitle_font_size_ar: '1.25rem',
            subtitle_font_weight: 500,
            subtitle_font_weight_ar: 500,
            subtitle_color: '#e5e7eb',
            subtitle_color_ar: '#e5e7eb',
            description_font_family: 'Inter, sans-serif',
            description_font_family_ar: 'Tajawal, sans-serif',
            description_font_size: '1rem',
            description_font_size_ar: '1rem',
            description_font_weight: 400,
            description_font_weight_ar: 400,
            description_color: '#d1d5db',
            description_color_ar: '#d1d5db'
          },
          animation: {
            title_animation: 'fadeIn',
            title_animation_delay: 0,
            title_animation_duration: 1000,
            subtitle_animation: 'fadeIn',
            subtitle_animation_delay: 300,
            subtitle_animation_duration: 1000,
            description_animation: 'fadeIn',
            description_animation_delay: 600,
            description_animation_duration: 1000,
            buttons_animation: 'fadeIn',
            buttons_animation_delay: 900,
            buttons_animation_duration: 1000
          },
          button_settings: {
            primary_button_style: {
              background_color: '#d97706',
              text_color: '#ffffff',
              border_radius: '0.375rem',
              font_size: '1rem',
              font_weight: 500,
              padding: '0.75rem 1.5rem',
              shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition_duration: 300,
              hover_background_color: '#b45309',
              hover_transform: 'translateY(-2px)',
              hover_shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            },
            secondary_button_style: {
              background_color: 'rgba(255,255,255,0.1)',
              text_color: '#ffffff',
              border_color: 'rgba(255,255,255,0.3)',
              border_width: 1,
              border_radius: '0.375rem',
              font_size: '1rem',
              font_weight: 500,
              padding: '0.75rem 1.5rem',
              hover_background_color: 'rgba(255,255,255,0.2)'
            }
          },
          layout: {
            container_max_width: '1200px',
            content_width: '100%',
            content_padding: '2rem',
            content_margin: '0 auto',
            vertical_alignment: 'center',
            horizontal_alignment: 'center',
            background_overlay_shape: 'none',
            background_overlay_shape_color: '#000000',
            background_overlay_shape_opacity: 50,
            responsive_breakpoints: {
              mobile: {
                title_font_size: '2rem',
                content_padding: '1rem'
              },
              tablet: {
                title_font_size: '3rem',
                content_padding: '1.5rem'
              },
              desktop: {
                title_font_size: '4rem',
                content_padding: '2rem'
              }
            }
          },
          effects: {
            parallax_enabled: false,
            parallax_speed: 0.5,
            ken_burns_effect: false,
            ken_burns_direction: 'zoom-in',
            ken_burns_duration: 10,
            particle_system: {
              enabled: false,
              type: 'stars',
              density: 50,
              speed: 5,
              color: '#ffffff',
              opacity: 50
            },
            gradient_overlay: {
              enabled: false,
              type: 'linear',
              direction: 'to bottom',
              opacity: 50,
              colors: ['#000000', '#ffffff']
            }
          }
        }
      ]
    }
  }
}

export const heroService = new HeroService()
