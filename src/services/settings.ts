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

export interface AppSettings {
  footer: FooterSettings
}

class SettingsService {
  private collection = 'settings'

  async getFooterSettings(): Promise<FooterSettings> {
    try {
      const doc = await firestoreService.getDocument(this.collection, 'footer')
      if (doc.exists()) {
        const data = doc.data() as FooterSettings
        console.log('SettingsService - Loaded settings from Firestore:', data)
        return data
      }
      
      // Return default settings if not found
      console.log('SettingsService - No settings found, returning defaults')
      return this.getDefaultFooterSettings()
    } catch (error) {
      console.error('Error getting footer settings:', error)
      console.log('SettingsService - Error occurred, returning defaults')
      return this.getDefaultFooterSettings()
    }
  }

  async updateFooterSettings(settings: FooterSettings): Promise<void> {
    try {
      console.log('SettingsService - Saving settings to Firestore:', settings)
      await firestoreService.setDocument(this.collection, 'footer', settings)
      console.log('SettingsService - Settings saved successfully')
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
}

export const settingsService = new SettingsService()
