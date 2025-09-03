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
  videoOverlayOpacity?: number // Overlay opacity percentage for background video (0-100)
  enableVideoOverlay?: boolean // Enable/disable video overlay
  enableVideoBlur?: boolean // Enable/disable video blur
  enableGradientOverlay?: boolean // Enable/disable gradient overlay
  gradientOverlayOpacity?: number // Gradient overlay opacity percentage (0-100)
  transparentVideoMode?: boolean // Enable completely transparent video mode (no overlay, no blur)
  
  // Color Theme Settings
  colorTheme?: 'auto' | 'light' | 'dark' | 'custom' // Color theme mode
  textColor?: string // Custom text color (hex)
  headingColor?: string // Custom heading color (hex)
  linkColor?: string // Custom link color (hex)
  linkHoverColor?: string // Custom link hover color (hex)
  logoTheme?: 'auto' | 'light' | 'dark' // Logo theme independent of text
  borderColor?: string // Custom border color (hex)
  socialIconsColor?: string // Custom social icons color (hex)
  socialIconsHoverColor?: string // Custom social icons hover color (hex)
}

export interface CategoriesSettings {
  backgroundVideo?: string // URL to background video
  backgroundVideoBlur?: number // Blur percentage (0-100)
  showBackgroundVideo?: boolean // Whether to show background video
  overlayOpacity?: number // Overlay opacity (0-100)
}

export interface HomepageSettings {
  // Coffee Selection Section (Video Background)
  backgroundVideo?: string // URL to background video
  backgroundVideoBlur?: number // Blur percentage (0-100)
  showBackgroundVideo?: boolean // Whether to show background video
  overlayOpacity?: number // Overlay opacity (0-100)
  coffeeSelectionTitle?: string // Coffee selection title in English
  coffeeSelectionTitleAr?: string // Coffee selection title in Arabic
  coffeeSelectionDescription?: string // Coffee selection description in English
  coffeeSelectionDescriptionAr?: string // Coffee selection description in Arabic
  coffeeSelectionButtonText?: string // Coffee selection button text in English
  coffeeSelectionButtonTextAr?: string // Coffee selection button text in Arabic
  
  // Mission Statement Section (Fixed Background Image)
  missionBackgroundImage?: string // URL to mission section background image
  showMissionSection?: boolean // Whether to show mission section
  missionTitle?: string // Mission title in English
  missionTitleAr?: string // Mission title in Arabic
  missionDescription?: string // Mission description in English
  missionDescriptionAr?: string // Mission description in Arabic
  missionButtonText?: string // Mission button text in English
  missionButtonTextAr?: string // Mission button text in Arabic
  
  // Community Section (Fixed Background Image + Gallery)
  communityBackgroundImage?: string // URL to community section background image
  showCommunitySection?: boolean // Whether to show community section
  communityText?: string // Community text in English
  communityTextAr?: string // Community text in Arabic
  communityImage1?: string // First community image
  communityImage2?: string // Second community image
  communityImage3?: string // Third community image
  communityImage4?: string // Fourth community image
  instagramUrl?: string // Instagram URL
  facebookUrl?: string // Facebook URL
  
  // Feature Section (Image and Text)
  showFeatureSection?: boolean // Whether to show feature section
  featureSectionTitle?: string // Feature section title in English
  featureSectionTitleAr?: string // Feature section title in Arabic
  featureSectionDescription?: string // Feature section description in English
  featureSectionDescriptionAr?: string // Feature section description in Arabic
  featureSectionButtonText?: string // Feature section button text in English
  featureSectionButtonTextAr?: string // Feature section button text in Arabic
  featureSectionImage?: string // Feature section image URL
  featureSectionBackgroundImage?: string // Feature section background image URL
  featureSectionBackgroundColor?: string // Feature section background color (legacy)
  featureSectionBackgroundColorLight?: string // Feature section background color for light theme
  featureSectionBackgroundColorDark?: string // Feature section background color for dark theme
  featureSectionBackgroundType?: 'color' | 'image' // Background type

  // Latest Release Section
  showLatestReleaseSection?: boolean // Whether to show latest release section
  latestReleaseTitle?: string // Latest release title in English
  latestReleaseTitleAr?: string // Latest release title in Arabic
  latestReleaseDescription?: string // Latest release description in English
  latestReleaseDescriptionAr?: string // Latest release description in Arabic
  latestReleaseBackgroundImage?: string // Latest release background image URL
  latestReleaseBackgroundColor?: string // Latest release background color (legacy)
  latestReleaseBackgroundColorLight?: string // Latest release background color for light theme
  latestReleaseBackgroundColorDark?: string // Latest release background color for dark theme
  latestReleaseBackgroundType?: 'color' | 'image' // Background type
}

export interface NewsletterSettings {
  // Newsletter section visibility
  showNewsletterSection?: boolean
  
  // Background settings
  newsletterBackgroundType?: 'color' | 'image' // Background type for newsletter section
  newsletterBackgroundColor?: string // Background color (legacy)
  newsletterBackgroundColorLight?: string // Background color for light theme
  newsletterBackgroundColorDark?: string // Background color for dark theme
  newsletterBackgroundImage?: string // Background image URL
  
  // Newsletter image
  newsletterImage?: string // Image displayed next to newsletter form
  
  // Content settings
  newsletterTitle?: string // Newsletter title in English
  newsletterTitleAr?: string // Newsletter title in Arabic
  newsletterDescription?: string // Newsletter description in English
  newsletterDescriptionAr?: string // Newsletter description in Arabic
}

export interface AppSettings {
  footer: FooterSettings
  categories: CategoriesSettings
  homepage: HomepageSettings
  newsletter: NewsletterSettings
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
       return this.cache.get(key)?.data as T || null
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key)
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
         this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
       const defaults = this.getDefaultFooterSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
       return this.getDefaultFooterSettings()
    }
  }

  async updateFooterSettings(settings: FooterSettings): Promise<void> {
    try {
       await firestoreService.setDocument(this.collection, 'footer', settings)
      this.invalidateCache('footer')
     } catch (error) {
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
      backgroundVideoBlur: 50, // Default 50% blur
      videoOverlayOpacity: 30, // Default 30% overlay opacity (lighter than current)
      enableVideoOverlay: true, // Enable overlay by default
      enableVideoBlur: true, // Enable blur by default
      enableGradientOverlay: false, // Disable gradient by default (since we removed it)
      gradientOverlayOpacity: 80 // Default 80% gradient opacity
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
        this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
      const defaults = this.getDefaultCategoriesSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
      console.error('Error getting categories settings:', error)
      return this.getDefaultCategoriesSettings()
    }
  }

  async updateCategoriesSettings(settings: CategoriesSettings): Promise<void> {
    try {
       await firestoreService.setDocument(this.collection, 'categories', settings)
      this.invalidateCache('categories')
     } catch (error) {
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

  async getHomepageSettings(): Promise<HomepageSettings> {
    const cacheKey = 'homepage'
    
    // Try cache first
    const cached = this.getFromCache<HomepageSettings>(cacheKey)
    if (cached) return cached

    try {
      const doc = await firestoreService.getDocument(this.collection, 'homepage')
      if (doc.exists()) {
        const data = doc.data() as HomepageSettings
         this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
       const defaults = this.getDefaultHomepageSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
      console.error('Error getting homepage settings:', error)
      return this.getDefaultHomepageSettings()
    }
  }

  async updateHomepageSettings(settings: HomepageSettings): Promise<void> {
    try {
      await firestoreService.setDocument(this.collection, 'homepage', settings)
      this.invalidateCache('homepage')
    } catch (error) {
      throw error
     }
  }

  private getDefaultHomepageSettings(): HomepageSettings {
    return {
      // Coffee Selection Section (Video Background)
      backgroundVideo: '/video/back.mp4',
      backgroundVideoBlur: 30,
      showBackgroundVideo: true,
      overlayOpacity: 30,
      coffeeSelectionTitle: 'COFFEE SELECTION',
      coffeeSelectionTitleAr: 'مجموعة القهوة',
      coffeeSelectionDescription: 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
      coffeeSelectionDescriptionAr: 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
      coffeeSelectionButtonText: 'SHOP NOW',
      coffeeSelectionButtonTextAr: 'تسوق الآن',
      
      // Mission Statement Section (Fixed Background Image)
      missionBackgroundImage: '/images/back.jpg',
      showMissionSection: true,
      missionTitle: 'SUSTAINABILITY, QUALITY, COMMITMENT',
      missionTitleAr: 'الاستدامة والجودة والالتزام',
      missionDescription: 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
      missionDescriptionAr: 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
      missionButtonText: 'SHOP NOW',
      missionButtonTextAr: 'تسوق الآن',
      
      // Community Section (Fixed Background Image + Gallery)
      communityBackgroundImage: '/images/back.jpg',
      showCommunitySection: true,
      communityText: 'Become an integral part of our Spirit Hub family! Connect with us on social media for exclusive updates, behind-the-scenes glimpses, and thrilling content. Follow us to stay in the loop. From sneak peeks into our creative process to special promotions, our social channels are your ticket to the latest. Engage with like-minded enthusiasts, share your experiences, and be a crucial member of our dynamic online community. Don\'t miss out on the excitement; join us today!',
      communityTextAr: 'كن جزءًا لا يتجزأ من عائلة سبيريت هب! تواصل معنا على وسائل التواصل الاجتماعي للحصول على تحديثات حصرية، ولمحات من وراء الكواليس، ومحتوى مثير. تابعنا لتبقى على اطلاع دائم. من النظرات الخاطفة على عمليتنا الإبداعية إلى العروض الترويجية الخاصة، قنواتنا الاجتماعية هي تذكرتك للأحدث. تفاعل مع المتحمسين ذوي التفكير المماثل، وشارك تجاربك، وكن عضوًا مهمًا في مجتمعنا الديناميكي عبر الإنترنت. لا تفوت الإثارة؛ انضم إلينا اليوم!',
      communityImage1: '/images/gallery/1.jpg',
      communityImage2: '/images/gallery/2.jpg',
      communityImage3: '/images/gallery/3.jpg',
      communityImage4: '/images/gallery/4.webp',
      instagramUrl: 'https://instagram.com/spirithubcafe',
      facebookUrl: 'https://facebook.com/spirithubcafe',
      
      // Feature Section (Image and Text)
      showFeatureSection: true,
      featureSectionTitle: 'Exceptional Coffee Experience',
      featureSectionTitleAr: 'تجربة قهوة استثنائية',
      featureSectionDescription: 'Discover the world of premium coffee with our carefully curated selection of the finest roasted beans. Every cup tells a story of passion and craftsmanship.',
      featureSectionDescriptionAr: 'اكتشف عالم القهوة الفاخرة مع مجموعة مختارة من أجود أنواع البن المحمص بعناية. كل كوب يحكي قصة من الشغف والحرفية.',
      featureSectionButtonText: 'Discover More',
      featureSectionButtonTextAr: 'اكتشف المزيد',
      featureSectionImage: '/images/back.jpg'
    }
  }

  async getNewsletterSettings(): Promise<NewsletterSettings> {
    const cacheKey = 'newsletter'
    
    // Try cache first
    const cached = this.getFromCache<NewsletterSettings>(cacheKey)
    if (cached) return cached

    try {
      const doc = await firestoreService.getDocument(this.collection, 'newsletter')
      if (doc.exists()) {
        const data = doc.data() as NewsletterSettings
         this.setCache(cacheKey, data)
        return data
      }
      
      // Return default settings if not found
      const defaults = this.getDefaultNewsletterSettings()
      this.setCache(cacheKey, defaults)
      return defaults
    } catch (error) {
      console.error('Error getting newsletter settings:', error)
      return this.getDefaultNewsletterSettings()
    }
  }

  async updateNewsletterSettings(settings: NewsletterSettings): Promise<void> {
    try {
      await firestoreService.setDocument(this.collection, 'newsletter', settings)
      this.invalidateCache('newsletter')
    } catch (error) {
      console.error('Error updating newsletter settings:', error)
      throw error
    }
  }

  private getDefaultNewsletterSettings(): NewsletterSettings {
    return {
      showNewsletterSection: true,
      newsletterBackgroundType: 'color',
      newsletterBackgroundColor: '#f8fafc',
      newsletterBackgroundColorLight: '#f8fafc',
      newsletterBackgroundColorDark: '#1e293b',
      newsletterBackgroundImage: '/images/back.jpg',
      newsletterImage: '/images/cats/specialty-coffee-capsules.webp',
      newsletterTitle: 'Stay Updated with Spirit Hub Cafe!',
      newsletterTitleAr: 'ابق على اطلاع مع آخر أخبار سبيريت هب كافيه!',
      newsletterDescription: 'Sign up to our newsletter and be the first to know about our new products and special offers.',
      newsletterDescriptionAr: 'اشترك في نشرتنا الإخبارية وكن أول من يعرف عن منتجاتنا الجديدة والعروض الخاصة.'
    }
  }

  // Utility methods for cache management
  invalidateAllCache(): void {
    this.cache.clear()
  }

  forceRefreshCategories(): void {
    this.invalidateCache('categories')
  }

  forceRefreshHomepage(): void {
    this.invalidateCache('homepage')
  }

  forceRefreshNewsletter(): void {
    this.invalidateCache('newsletter')
  }

  forceRefreshFooter(): void {
    this.invalidateCache('footer')
  }
}

export const settingsService = new SettingsService()
