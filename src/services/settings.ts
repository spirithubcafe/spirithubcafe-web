import { firestoreService } from '@/lib/firebase'

export interface FooterSettings {
  companyName: string
  companyNameAr: string
  description: string
  descriptionAr: string
  address: string
  addressAr: string
  phone: string
  phone2?: string
  email: string
  whatsapp?: string
  instagram?: string
  facebook?: string
  twitter?: string
  workingHours: string
  workingHoursAr: string
  backgroundVideoBlur?: number // Blur percentage for background video (0-100)
}

export interface CategoriesSettings {
  backgroundVideo?: string // URL to background video
  backgroundVideoBlur?: number // Blur percentage (0-100)
  showBackgroundVideo?: boolean // Whether to show background video
  overlayOpacity?: number // Overlay opacity (0-100)
}

export interface AppSettings {
  footer: FooterSettings
  categories: CategoriesSettings
}

class SettingsService {
  private collection = 'settings'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 30 * 1000 // 30 seconds cache

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key)
    if (!cached) return false
    return Date.now() - cached.timestamp < this.cacheTimeout
  }

  private getFromCache<T>(key: string): T | null {
    if (this.isCacheValid(key)) {
      console.log(`SettingsService - Returning cached data for: ${key}`)
      return this.cache.get(key)?.data as T || null
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key)
    console.log(`SettingsService - Cache invalidated for: ${key}`)
  }

  async getFooterSettings(): Promise<FooterSettings> {
    const cacheKey = 'footer'
    
    // Try cache first
    const cached = this.getFromCache<FooterSettings>(cacheKey)
    if (cached) return cached

    try {
      const doc = await firestoreService.getDocument(this.collection, 'footer')
      if (doc.exists()) {
        const data = doc.data() as FooterSettings
        console.log('SettingsService - Loaded footer settings from Firestore:', data)
        this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
      console.log('SettingsService - No footer settings found, returning defaults')
      const defaults = this.getDefaultFooterSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
      console.error('Error getting footer settings:', error)
      console.log('SettingsService - Error occurred, returning defaults')
      return this.getDefaultFooterSettings()
    }
  }

  async updateFooterSettings(settings: FooterSettings): Promise<void> {
    try {
      console.log('SettingsService - Saving footer settings to Firestore:', settings)
      await firestoreService.setDocument(this.collection, 'footer', settings)
      this.invalidateCache('footer')
      console.log('SettingsService - Footer settings saved successfully')
    } catch (error) {
      console.error('Error updating footer settings:', error)
      throw error
    }
  }

  getDefaultFooterSettings(): FooterSettings {
    return {
      companyName: 'SpiritHub',
      companyNameAr: 'سبيريت هاب',
      description: 'Premium coffee roasted with passion and expertise.',
      descriptionAr: 'قهوة فاخرة محمصة بشغف وخبرة.',
      address: 'Al Mouj Street, Muscat, Oman',
      addressAr: 'شارع الموج، مسقط، عمان',
      phone: '+968 9190 0005',
      phone2: '+968 7272 6999',
      email: 'info@spirithubcafe.com',
      whatsapp: '+968 7272 6999',
      instagram: '@spirithubcafe',
      facebook: 'spirithubcafe',
      twitter: 'spirithubcafe',
      workingHours: 'Daily: 8 AM - 11 PM',
      workingHoursAr: 'كل أيام الأسبوع: 8 صباحاً - 11 مساءً',
      backgroundVideoBlur: 50 // Default 50% blur
    }
  }

  async getCategoriesSettings(): Promise<CategoriesSettings> {
    const cacheKey = 'categories'
    
    // Try cache first
    const cached = this.getFromCache<CategoriesSettings>(cacheKey)
    if (cached) return cached

    try {
      const doc = await firestoreService.getDocument(this.collection, 'categories')
      if (doc.exists()) {
        const data = doc.data() as CategoriesSettings
        console.log('SettingsService - Loaded categories settings from Firestore:', data)
        this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
      console.log('SettingsService - No categories settings found, returning defaults')
      const defaults = this.getDefaultCategoriesSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
      console.error('Error getting categories settings:', error)
      console.log('SettingsService - Error occurred, returning defaults')
      return this.getDefaultCategoriesSettings()
    }
  }

  async updateCategoriesSettings(settings: CategoriesSettings): Promise<void> {
    try {
      console.log('SettingsService - Saving categories settings to Firestore:', settings)
      await firestoreService.setDocument(this.collection, 'categories', settings)
      this.invalidateCache('categories')
      console.log('SettingsService - Categories settings saved successfully')
    } catch (error) {
      console.error('Error updating categories settings:', error)
      throw error
    }
  }

  private getDefaultCategoriesSettings(): CategoriesSettings {
    return {
      backgroundVideo: '/video/back.mp4',
      backgroundVideoBlur: 30,
      showBackgroundVideo: true,
      overlayOpacity: 70
    }
  }

  // Utility methods for cache management
  invalidateAllCache(): void {
    this.cache.clear()
    console.log('SettingsService - All cache cleared')
  }

  forceRefreshCategories(): void {
    this.invalidateCache('categories')
  }

  forceRefreshFooter(): void {
    this.invalidateCache('footer')
  }
}

export const settingsService = new SettingsService()
