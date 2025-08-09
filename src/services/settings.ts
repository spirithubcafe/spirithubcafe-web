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
        return doc.data() as FooterSettings
      }
      
      // Return default settings if not found
      return this.getDefaultFooterSettings()
    } catch (error) {
      console.error('Error getting footer settings:', error)
      return this.getDefaultFooterSettings()
    }
  }

  async updateFooterSettings(settings: FooterSettings): Promise<void> {
    try {
      await firestoreService.setDocument(this.collection, 'footer', settings)
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
      workingHoursAr: 'كل أيام الأسبوع: 8 صباحاً - 11 مساءً'
    }
  }
}

export const settingsService = new SettingsService()
