import { firestoreService } from '@/lib/firebase'
import type { HeroSettings, HeroSlide } from '@/types'

class HeroService {
  private collection = 'settings'
  private heroDocId = 'hero'

  async getHeroSettings(): Promise<HeroSettings> {
    try {
      const doc = await firestoreService.getDocument(this.collection, this.heroDocId)
      if (doc.exists()) {
        return doc.data() as HeroSettings
      }
      
      // Return default settings if not found
      return this.getDefaultHeroSettings()
    } catch (error) {
      console.error('Error getting hero settings:', error)
      return this.getDefaultHeroSettings()
    }
  }

  async updateHeroSettings(settings: HeroSettings): Promise<void> {
    try {
      await firestoreService.setDocument(this.collection, this.heroDocId, {
        ...settings,
        updated_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error updating hero settings:', error)
      throw error
    }
  }

  async addSlide(slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>): Promise<HeroSlide> {
    try {
      const settings = await this.getHeroSettings()
      const newSlide: HeroSlide = {
        ...slide,
        id: this.generateSlideId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      settings.slides.push(newSlide)
      settings.slides.sort((a, b) => a.sort_order - b.sort_order)
      
      await this.updateHeroSettings(settings)
      return newSlide
    } catch (error) {
      console.error('Error adding slide:', error)
      throw error
    }
  }

  async updateSlide(slideId: string, updates: Partial<HeroSlide>): Promise<void> {
    try {
      const settings = await this.getHeroSettings()
      const slideIndex = settings.slides.findIndex(slide => slide.id === slideId)
      
      if (slideIndex === -1) {
        throw new Error('Slide not found')
      }
      
      settings.slides[slideIndex] = {
        ...settings.slides[slideIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      settings.slides.sort((a, b) => a.sort_order - b.sort_order)
      await this.updateHeroSettings(settings)
    } catch (error) {
      console.error('Error updating slide:', error)
      throw error
    }
  }

  async deleteSlide(slideId: string): Promise<void> {
    try {
      const settings = await this.getHeroSettings()
      settings.slides = settings.slides.filter(slide => slide.id !== slideId)
      
      await this.updateHeroSettings(settings)
    } catch (error) {
      console.error('Error deleting slide:', error)
      throw error
    }
  }

  async reorderSlides(slideIds: string[]): Promise<void> {
    try {
      const settings = await this.getHeroSettings()
      
      // Update sort_order based on the new order
      settings.slides = settings.slides.map(slide => {
        const newIndex = slideIds.indexOf(slide.id)
        return {
          ...slide,
          sort_order: newIndex !== -1 ? newIndex : slide.sort_order,
          updated_at: new Date().toISOString()
        }
      }).sort((a, b) => a.sort_order - b.sort_order)
      
      await this.updateHeroSettings(settings)
    } catch (error) {
      console.error('Error reordering slides:', error)
      throw error
    }
  }

  async toggleSlideStatus(slideId: string): Promise<void> {
    try {
      const settings = await this.getHeroSettings()
      const slideIndex = settings.slides.findIndex(slide => slide.id === slideId)
      
      if (slideIndex === -1) {
        throw new Error('Slide not found')
      }
      
      settings.slides[slideIndex].is_active = !settings.slides[slideIndex].is_active
      settings.slides[slideIndex].updated_at = new Date().toISOString()
      
      await this.updateHeroSettings(settings)
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
      show_arrows: true,
      show_dots: true,
      show_progress: true,
      transition_effect: 'slide',
      transition_duration: 800,
      enable_swipe: true,
      pause_on_hover: true,
      infinite_loop: true,
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
          updated_at: new Date().toISOString()
        }
      ]
    }
  }
}

export const heroService = new HeroService()
