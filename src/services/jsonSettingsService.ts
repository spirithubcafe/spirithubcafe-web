import type { HeroSlide, HeroSettings } from '@/types'

export class JSONSettingsService {
  private static CACHE: Map<string, any> = new Map()
  
  // Base path for settings files
  private static BASE_PATH = '/data'
  
  // Check if we're in localhost (for admin editing)
  protected isLocalhost(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  }
  
  // Load settings from JSON file
  async loadSettings<T>(settingName: string): Promise<T | null> {
    try {
      const cacheKey = `settings_${settingName}`
      
      // Check localStorage first (for admin edits)
      if (this.isLocalhost()) {
        const localData = localStorage.getItem(cacheKey)
        if (localData) {
          return JSON.parse(localData) as T
        }
      }
      
      // Load from JSON file
      const response = await fetch(`${JSONSettingsService.BASE_PATH}/${settingName}-settings.json`)
      if (!response.ok) {
        throw new Error(`Failed to load ${settingName} settings: ${response.status}`)
      }
      
      const settingsFile = await response.json()
      const data = settingsFile.data as T
      
      // Cache the data
      JSONSettingsService.CACHE.set(settingName, data)
      
      return data
    } catch (error) {
      console.error(`Error loading ${settingName} settings:`, error)
      return null
    }
  }
  
  // Save settings to localStorage (localhost only)
  async saveSettings<T>(settingName: string, data: T): Promise<boolean> {
    try {
      if (!this.isLocalhost()) {
        console.warn('Saving settings only works in localhost environment')
        return false
      }
      
      const cacheKey = `settings_${settingName}`
      
      // Save to localStorage
      localStorage.setItem(cacheKey, JSON.stringify(data))
      
      // Update cache
      JSONSettingsService.CACHE.set(settingName, data)
      
      console.log(`✅ Saved ${settingName} settings to localStorage`)
      return true
    } catch (error) {
      console.error(`Error saving ${settingName} settings:`, error)
      return false
    }
  }
  
  // Reset settings to original (clear localStorage)
  async resetSettings(settingName: string): Promise<boolean> {
    try {
      const cacheKey = `settings_${settingName}`
      
      // Clear localStorage
      localStorage.removeItem(cacheKey)
      
      // Clear cache
      JSONSettingsService.CACHE.delete(settingName)
      
      console.log(`✅ Reset ${settingName} settings`)
      return true
    } catch (error) {
      console.error(`Error resetting ${settingName} settings:`, error)
      return false
    }
  }
  
  // Get all available settings
  async getAvailableSettings(): Promise<string[]> {
    try {
      const response = await fetch(`${JSONSettingsService.BASE_PATH}/settings-index.json`)
      if (!response.ok) {
        throw new Error('Failed to load settings index')
      }
      
      const index = await response.json()
      return index.settings.map((s: any) => s.id)
    } catch (error) {
      console.error('Error loading settings index:', error)
      return []
    }
  }
}

// Hero Settings Service
export class JSONHeroSettingsService extends JSONSettingsService {
  
  // Get hero slides from JSON
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      // First check if we have slides in localStorage (admin edits)
      if (this.isLocalhost()) {
        const localSlides = localStorage.getItem('hero_slides')
        if (localSlides) {
          return JSON.parse(localSlides)
        }
      }
      
      // Load from hero-slides.json
      const response = await fetch('/data/hero-slides.json')
      if (!response.ok) {
        throw new Error('Failed to load hero slides')
      }
      
      const slides = await response.json()
      return slides || []
    } catch (error) {
      console.error('Error loading hero slides:', error)
      return []
    }
  }
  
  // Get hero general settings
  async getHeroSettings(): Promise<HeroSettings | null> {
    return await this.loadSettings<HeroSettings>('hero')
  }
  
  // Save hero slides
  async saveHeroSlides(slides: HeroSlide[]): Promise<boolean> {
    try {
      if (!this.isLocalhost()) {
        console.warn('Saving slides only works in localhost environment')
        return false
      }
      
      // Save to localStorage
      localStorage.setItem('hero_slides', JSON.stringify(slides))
      console.log('✅ Saved hero slides to localStorage')
      return true
    } catch (error) {
      console.error('Error saving hero slides:', error)
      return false
    }
  }
  
  // Save hero general settings
  async saveHeroSettings(settings: HeroSettings): Promise<boolean> {
    return await this.saveSettings('hero', settings)
  }
}

// About Us Settings Service  
export class JSONAboutUsService extends JSONSettingsService {
  async getAboutUsSettings() {
    return await this.loadSettings('aboutUs')
  }
  
  async saveAboutUsSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('aboutUs', settings)
  }
}

// Contact Settings Service
export class JSONContactService extends JSONSettingsService {
  async getContactSettings() {
    return await this.loadSettings('contact')
  }
  
  async getContactInfo() {
    return await this.loadSettings('contact_info')
  }
  
  async saveContactSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('contact', settings)
  }
  
  async saveContactInfo(info: any): Promise<boolean> {
    return await this.saveSettings('contact_info', info)
  }
}

// Newsletter Settings Service
export class JSONNewsletterService extends JSONSettingsService {
  async getNewsletterSettings() {
    return await this.loadSettings('newsletter')
  }
  
  async saveNewsletterSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('newsletter', settings)
  }
}

// Homepage Settings Service
export class JSONHomepageService extends JSONSettingsService {
  async getHomepageSettings() {
    return await this.loadSettings('homepage')
  }
  
  async saveHomepageSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('homepage', settings)
  }
}

// Categories Settings Service
export class JSONCategoriesService extends JSONSettingsService {
  async getCategoriesSettings() {
    return await this.loadSettings('categories')
  }
  
  async saveCategoriesSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('categories', settings)
  }
}

// Footer Settings Service
export class JSONFooterService extends JSONSettingsService {
  async getFooterSettings() {
    return await this.loadSettings('footer')
  }
  
  async saveFooterSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('footer', settings)
  }
}

// Checkout Settings Service
export class JSONCheckoutService extends JSONSettingsService {
  async getCheckoutSettings() {
    return await this.loadSettings('checkout')
  }
  
  async saveCheckoutSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('checkout', settings)
  }
}

// Aramex Settings Service
export class JSONAramexService extends JSONSettingsService {
  async getAramexSettings() {
    return await this.loadSettings('aramex')
  }
  
  async saveAramexSettings(settings: any): Promise<boolean> {
    return await this.saveSettings('aramex', settings)
  }
}

// Products Service
export class JSONProductsService extends JSONSettingsService {
  async getProducts() {
    try {
      const response = await fetch('/data/products.json')
      if (!response.ok) {
        throw new Error('Failed to load products')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading products:', error)
      return []
    }
  }
  
  async getProduct(productId: string) {
    try {
      const products = await this.getProducts()
      return products.find((p: any) => p.id === productId) || null
    } catch (error) {
      console.error('Error loading product:', error)
      return null
    }
  }
  
  async getProductsByCategory(categoryId: string) {
    try {
      const products = await this.getProducts()
      return products.filter((p: any) => p.category_id === categoryId && p.is_active)
    } catch (error) {
      console.error('Error loading products by category:', error)
      return []
    }
  }
  
  async getFeaturedProducts() {
    try {
      const products = await this.getProducts()
      return products.filter((p: any) => p.is_featured && p.is_active)
    } catch (error) {
      console.error('Error loading featured products:', error)
      return []
    }
  }
  
  async getBestsellerProducts() {
    try {
      const products = await this.getProducts()
      return products.filter((p: any) => p.is_bestseller && p.is_active)
    } catch (error) {
      console.error('Error loading bestseller products:', error)
      return []
    }
  }
}

// Categories Service
export class JSONCategoriesDataService extends JSONSettingsService {
  async getCategories() {
    try {
      const response = await fetch('/data/categories.json')
      if (!response.ok) {
        throw new Error('Failed to load categories')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading categories:', error)
      return []
    }
  }
  
  async getCategory(categoryId: string) {
    try {
      const categories = await this.getCategories()
      return categories.find((c: any) => c.id === categoryId) || null
    } catch (error) {
      console.error('Error loading category:', error)
      return null
    }
  }
  
  async getActiveCategories() {
    try {
      const categories = await this.getCategories()
      return categories.filter((c: any) => c.is_active).sort((a: any, b: any) => a.sort_order - b.sort_order)
    } catch (error) {
      console.error('Error loading active categories:', error)
      return []
    }
  }
}

// Pages Service
export class JSONPagesService extends JSONSettingsService {
  async getPages() {
    try {
      const response = await fetch('/data/pages.json')
      if (!response.ok) {
        throw new Error('Failed to load pages')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading pages:', error)
      return []
    }
  }
  
  async getPage(pageId: string) {
    try {
      const pages = await this.getPages()
      return pages.find((p: any) => p.id === pageId) || null
    } catch (error) {
      console.error('Error loading page:', error)
      return null
    }
  }
  
  async getPageBySlug(slug: string) {
    try {
      const pages = await this.getPages()
      return pages.find((p: any) => p.slug === slug && p.is_active) || null
    } catch (error) {
      console.error('Error loading page by slug:', error)
      return null
    }
  }
  
  async getActivePages() {
    try {
      const pages = await this.getPages()
      return pages.filter((p: any) => p.is_active)
    } catch (error) {
      console.error('Error loading active pages:', error)
      return []
    }
  }
  
  async getFooterPages() {
    try {
      const pages = await this.getPages()
      return pages.filter((p: any) => p.show_in_footer && p.is_active)
    } catch (error) {
      console.error('Error loading footer pages:', error)
      return []
    }
  }
}

// Export singleton instances
export const jsonSettingsService = new JSONSettingsService()
export const jsonHeroService = new JSONHeroSettingsService()
export const jsonAboutUsService = new JSONAboutUsService()
export const jsonContactService = new JSONContactService()
export const jsonNewsletterService = new JSONNewsletterService()
export const jsonHomepageService = new JSONHomepageService()
export const jsonCategoriesService = new JSONCategoriesService()
export const jsonFooterService = new JSONFooterService()
export const jsonCheckoutService = new JSONCheckoutService()
export const jsonAramexService = new JSONAramexService()
export const jsonProductsService = new JSONProductsService()
export const jsonCategoriesDataService = new JSONCategoriesDataService()
export const jsonPagesService = new JSONPagesService()
