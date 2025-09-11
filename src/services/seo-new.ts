// SEO service - JSON-based implementation

interface SEOSettings {
  siteName: string
  siteNameAr: string
  siteUrl: string
  defaultTitle: string
  defaultTitleAr: string
  defaultDescription: string
  defaultDescriptionAr: string
  defaultKeywords: string[]
  ogImage: string
  twitterHandle: string
  organizationName: string
  organizationNameAr: string
  organizationLogo: string
  organizationDescription: string
  organizationDescriptionAr: string
  contactPhone: string
  facebookPageId: string
  openingHours: string[]
  address: {
    street: string
    city: string
    region: string
    postalCode: string
    country: string
  }
}

export class SEOService {
  private settings: SEOSettings | null = null
  private isInitialized = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Use static settings since jsonSettingsService doesn't have getSettings
      // const settingsData = await jsonSettingsService.getSettings()
      this.settings = this.getDefaultSettings()

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize SEO settings:', error)
      // Fallback to default settings
      this.settings = this.getDefaultSettings()
      this.isInitialized = true
    }
  }

  private getDefaultSettings(): SEOSettings {
    return {
      siteName: 'SpiritHub Cafe',
      siteNameAr: 'سبيريت هاب كافيه',
      siteUrl: 'https://spirithubcafe.com',
      defaultTitle: 'Premium Coffee Roastery in Oman',
      defaultTitleAr: 'محمصة القهوة المميزة في عُمان',
      defaultDescription: 'Discover premium specialty coffee at SpiritHub Cafe in Muscat, Oman',
      defaultDescriptionAr: 'اكتشف القهوة المميزة في سبيريت هاب كافيه في مسقط، عُمان',
      defaultKeywords: ['coffee', 'cafe', 'roastery', 'Oman', 'Muscat', 'premium coffee', 'espresso'],
      ogImage: '/images/spirithub-coffee.webp',
      twitterHandle: '@spirithubcafe',
      organizationName: 'SpiritHub Cafe',
      organizationNameAr: 'سبيريت هاب كافيه',
      organizationLogo: '/images/logo.png',
      organizationDescription: 'Premium coffee roastery and cafe in Muscat, Oman',
      organizationDescriptionAr: 'محمصة ومقهى القهوة المميزة في مسقط، عُمان',
      contactPhone: '+968 9999 9999',
      facebookPageId: 'spirithubcafe',
      openingHours: ['Mo-Su 07:00-23:00'],
      address: {
        street: 'Al Khuwair Street',
        city: 'Muscat',
        region: 'Muscat Governorate',
        postalCode: '100',
        country: 'Oman'
      }
    }
  }

  async getSettings(): Promise<SEOSettings> {
    if (!this.isInitialized) {
      await this.initialize()
    }
    return this.settings!
  }

  // Update settings (placeholder - would integrate with Google Sheets later)
  async updateSettings(settings: Partial<SEOSettings>): Promise<void> {
    console.log('SEO settings update requested:', settings)
    // TODO: Integrate with Google Sheets service
    if (this.settings) {
      this.settings = { ...this.settings, ...settings }
    }
  }

  // Generate meta tags for pages
  async generateMetaTags(options: {
    title?: string
    titleAr?: string
    description?: string
    descriptionAr?: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    locale?: string
  } = {}): Promise<{
    title: string
    description: string
    keywords: string[]
    ogTags: Record<string, string>
    twitterTags: Record<string, string>
    structuredData: any
  }> {
    const settings = await this.getSettings()
    const isArabic = options.locale === 'ar'

    const title = isArabic 
      ? (options.titleAr || options.title || settings.defaultTitleAr)
      : (options.title || settings.defaultTitle)

    const description = isArabic
      ? (options.descriptionAr || options.description || settings.defaultDescriptionAr)
      : (options.description || settings.defaultDescription)

    const keywords = options.keywords || settings.defaultKeywords
    const image = options.image || settings.ogImage
    const url = options.url || settings.siteUrl
    const type = options.type || 'website'

    return {
      title,
      description,
      keywords,
      ogTags: {
        'og:title': title,
        'og:description': description,
        'og:image': image,
        'og:url': url,
        'og:type': type,
        'og:site_name': isArabic ? settings.siteNameAr : settings.siteName,
        'og:locale': isArabic ? 'ar_OM' : 'en_US'
      },
      twitterTags: {
        'twitter:card': 'summary_large_image',
        'twitter:site': settings.twitterHandle,
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': image
      },
      structuredData: this.generateStructuredData(settings)
    }
  }

  private generateStructuredData(settings: SEOSettings) {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${settings.siteUrl}#organization`,
          name: settings.organizationName,
          nameAr: settings.organizationNameAr,
          url: settings.siteUrl,
          logo: `${settings.siteUrl}${settings.organizationLogo}`,
          description: settings.organizationDescription,
          descriptionAr: settings.organizationDescriptionAr,
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address.street,
            addressLocality: settings.address.city,
            addressRegion: settings.address.region,
            postalCode: settings.address.postalCode,
            addressCountry: settings.address.country
          },
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: settings.contactPhone,
            contactType: 'customer service'
          },
          sameAs: [
            `https://facebook.com/${settings.facebookPageId}`,
            settings.twitterHandle
          ],
          openingHours: settings.openingHours
        },
        {
          '@type': 'WebSite',
          '@id': `${settings.siteUrl}#website`,
          url: settings.siteUrl,
          name: settings.siteName,
          nameAr: settings.siteNameAr,
          description: settings.defaultDescription,
          descriptionAr: settings.defaultDescriptionAr,
          publisher: {
            '@id': `${settings.siteUrl}#organization`
          },
          potentialAction: {
            '@type': 'SearchAction',
            target: `${settings.siteUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    }
  }

  // Generate product-specific SEO
  async generateProductSEO(product: any, locale: string = 'en'): Promise<any> {
    const settings = await this.getSettings()
    const isArabic = locale === 'ar'

    const title = isArabic 
      ? `${product.nameAr || product.name} - ${settings.siteNameAr}`
      : `${product.name} - ${settings.siteName}`

    const description = isArabic
      ? (product.descriptionAr || product.description || settings.defaultDescriptionAr)
      : (product.description || settings.defaultDescription)

    return this.generateMetaTags({
      title,
      description,
      keywords: [...settings.defaultKeywords, ...(product.tags || [])],
      image: product.image,
      url: `${settings.siteUrl}/products/${product.slug}`,
      type: 'product',
      locale
    })
  }

  // Generate category-specific SEO
  async generateCategorySEO(category: any, locale: string = 'en'): Promise<any> {
    const settings = await this.getSettings()
    const isArabic = locale === 'ar'

    const title = isArabic
      ? `${category.nameAr || category.name} - ${settings.siteNameAr}`
      : `${category.name} - ${settings.siteName}`

    const description = isArabic
      ? (category.descriptionAr || category.description || settings.defaultDescriptionAr)
      : (category.description || settings.defaultDescription)

    return this.generateMetaTags({
      title,
      description,
      keywords: [...settings.defaultKeywords, category.name],
      image: category.image,
      url: `${settings.siteUrl}/categories/${category.slug}`,
      type: 'website',
      locale
    })
  }
}

export const seoService = new SEOService()
