import { firestoreService } from '@/lib/firebase'
import type { 
  SEOMeta, 
  SEOSettings, 
  ProductSchema, 
  OrganizationSchema, 
  BreadcrumbSchema,
  WebsiteSchema,
  FAQSchema,
  SEOAnalysis,
  SEOIssue,
  SEOSuggestion,
  SitemapEntry
} from '@/types/seo'

class SEOService {
  private collection = 'seo'

  // SEO Settings Management
  async getSEOSettings(): Promise<SEOSettings> {
    try {
      const doc = await firestoreService.getDocument(this.collection, 'settings')
      if (doc.exists()) {
        return doc.data() as SEOSettings
      }
      return this.getDefaultSEOSettings()
    } catch (error) {
      console.error('Error getting SEO settings:', error)
      return this.getDefaultSEOSettings()
    }
  }

  async updateSEOSettings(settings: SEOSettings): Promise<void> {
    try {
      await firestoreService.setDocument(this.collection, 'settings', settings)
    } catch (error) {
      console.error('Error updating SEO settings:', error)
      throw error
    }
  }

  getDefaultSEOSettings(): SEOSettings {
    return {
      siteName: 'SpiritHub Cafe',
      siteNameAr: 'مقهى سبيريت هاب',
      siteDescription: 'Premium coffee roasted with passion and expertise in Oman',
      siteDescriptionAr: 'قهوة فاخرة محمصة بشغف وخبرة في عمان',
      siteUrl: 'https://spirithubcafe.com',
      defaultImage: '/images/logo.png',
      favicon: '/images/favicon.png',
      robotsTxt: `User-agent: *\nAllow: /\nSitemap: https://spirithubcafe.com/sitemap.xml`,
      
      twitterHandle: '@spirithubcafe',
      facebookAppId: '',
      facebookPageId: '',
      
      googleAnalyticsId: '',
      googleTagManagerId: '',
      googleSearchConsoleId: '',
      facebookPixelId: '',
      
      organizationName: 'SpiritHub Cafe',
      organizationNameAr: 'مقهى سبيريت هاب',
      organizationLogo: '/images/logo.png',
      organizationDescription: 'Premium coffee shop and roastery in Muscat, Oman',
      organizationDescriptionAr: 'مقهى ومحمصة قهوة فاخرة في مسقط، عمان',
      
      contactPhone: '+968 9190 0005',
      contactEmail: 'info@spirithubcafe.com',
      address: {
        street: 'Al Mouj Street',
        city: 'Muscat',
        region: 'Muscat Governorate',
        postalCode: '100',
        country: 'OM'
      },
      
      openingHours: [
        'Mo-Su 08:00-23:00'
      ],
      
      defaultTitle: 'SpiritHub Cafe - Premium Coffee in Oman',
      defaultTitleAr: 'مقهى سبيريت هاب - قهوة فاخرة في عمان',
      defaultDescription: 'Discover premium coffee beans, expertly roasted and brewed to perfection at SpiritHub Cafe in Muscat, Oman.',
      defaultDescriptionAr: 'اكتشف حبوب القهوة الفاخرة، المحمصة والمحضرة بإتقان في مقهى سبيريت هاب في مسقط، عمان.',
      defaultKeywords: 'coffee, cafe, roastery, Oman, Muscat, premium coffee, espresso',
      defaultKeywordsAr: 'قهوة، مقهى، محمصة، عمان، مسقط، قهوة فاخرة، إسبريسو',
      
      enableAutoSitemap: true,
      enableBreadcrumbs: true,
      enableOpenGraph: true,
      enableTwitterCards: true,
      enableSchema: true,
      enableRichSnippets: true
    }
  }

  // Meta Tags Generation
  generateMetaTags(meta: SEOMeta, isArabic: boolean = false): string {
    const tags: string[] = []

    // Basic meta tags
    if (meta.title || meta.titleAr) {
      const title = isArabic ? (meta.titleAr || meta.title) : (meta.title || meta.titleAr)
      tags.push(`<title>${this.escapeHtml(title || '')}</title>`)
      tags.push(`<meta name="title" content="${this.escapeHtml(title || '')}" />`)
    }

    if (meta.description || meta.descriptionAr) {
      const description = isArabic ? (meta.descriptionAr || meta.description) : (meta.description || meta.descriptionAr)
      tags.push(`<meta name="description" content="${this.escapeHtml(description || '')}" />`)
    }

    if (meta.keywords || meta.keywordsAr) {
      const keywords = isArabic ? (meta.keywordsAr || meta.keywords) : (meta.keywords || meta.keywordsAr)
      tags.push(`<meta name="keywords" content="${this.escapeHtml(keywords || '')}" />`)
    }

    if (meta.author) {
      tags.push(`<meta name="author" content="${this.escapeHtml(meta.author)}" />`)
    }

    if (meta.canonicalUrl) {
      tags.push(`<link rel="canonical" href="${meta.canonicalUrl}" />`)
    }

    // Robots
    const robots = this.generateRobotsContent(meta)
    if (robots) {
      tags.push(`<meta name="robots" content="${robots}" />`)
    }

    // Open Graph
    if (meta.ogTitle || meta.ogTitleAr) {
      const ogTitle = isArabic ? (meta.ogTitleAr || meta.ogTitle) : (meta.ogTitle || meta.ogTitleAr)
      tags.push(`<meta property="og:title" content="${this.escapeHtml(ogTitle || '')}" />`)
    }

    if (meta.ogDescription || meta.ogDescriptionAr) {
      const ogDescription = isArabic ? (meta.ogDescriptionAr || meta.ogDescription) : (meta.ogDescription || meta.ogDescriptionAr)
      tags.push(`<meta property="og:description" content="${this.escapeHtml(ogDescription || '')}" />`)
    }

    if (meta.ogImage) {
      tags.push(`<meta property="og:image" content="${meta.ogImage}" />`)
    }

    if (meta.ogType) {
      tags.push(`<meta property="og:type" content="${meta.ogType}" />`)
    }

    if (meta.ogUrl) {
      tags.push(`<meta property="og:url" content="${meta.ogUrl}" />`)
    }

    // Twitter Cards
    if (meta.twitterCard) {
      tags.push(`<meta name="twitter:card" content="${meta.twitterCard}" />`)
    }

    if (meta.twitterTitle || meta.twitterTitleAr) {
      const twitterTitle = isArabic ? (meta.twitterTitleAr || meta.twitterTitle) : (meta.twitterTitle || meta.twitterTitleAr)
      tags.push(`<meta name="twitter:title" content="${this.escapeHtml(twitterTitle || '')}" />`)
    }

    if (meta.twitterDescription || meta.twitterDescriptionAr) {
      const twitterDescription = isArabic ? (meta.twitterDescriptionAr || meta.twitterDescription) : (meta.twitterDescription || meta.twitterDescriptionAr)
      tags.push(`<meta name="twitter:description" content="${this.escapeHtml(twitterDescription || '')}" />`)
    }

    if (meta.twitterImage) {
      tags.push(`<meta name="twitter:image" content="${meta.twitterImage}" />`)
    }

    if (meta.lastModified) {
      tags.push(`<meta name="last-modified" content="${meta.lastModified}" />`)
    }

    return tags.join('\n')
  }

  // Schema.org Generation
  async generateOrganizationSchema(): Promise<OrganizationSchema> {
    const settings = await this.getSEOSettings()
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
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
        contactType: 'customer service',
        availableLanguage: ['English', 'Arabic']
      },
      sameAs: [
        `https://facebook.com/${settings.facebookPageId}`,
        `https://twitter.com/${settings.twitterHandle.replace('@', '')}`
      ].filter(url => !url.includes('undefined')),
      openingHours: settings.openingHours
    }
  }

  async generateWebsiteSchema(): Promise<WebsiteSchema> {
    const settings = await this.getSEOSettings()
    
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: settings.siteName,
      nameAr: settings.siteNameAr,
      url: settings.siteUrl,
      description: settings.siteDescription,
      descriptionAr: settings.siteDescriptionAr,
      inLanguage: ['en', 'ar'],
      potentialAction: {
        '@type': 'SearchAction',
        target: `${settings.siteUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  }

  generateProductSchema(product: any): ProductSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      nameAr: product.nameAr,
      description: product.description,
      descriptionAr: product.descriptionAr,
      image: product.images || [],
      sku: product.sku,
      brand: {
        '@type': 'Brand',
        name: 'SpiritHub Cafe'
      },
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price?.toString(),
        priceCurrency: 'OMR',
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${window.location.origin}/product/${product.slug}`,
        seller: {
          '@type': 'Organization',
          name: 'SpiritHub Cafe'
        }
      }
    }
  }

  generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>): BreadcrumbSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    }
  }

  generateFAQSchema(faqs: Array<{question: string, answer: string}>): FAQSchema {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }

  // SEO Analysis
  analyzeSEO(meta: SEOMeta): SEOAnalysis {
    const issues: SEOIssue[] = []
    const suggestions: SEOSuggestion[] = []

    // Title analysis
    if (!meta.title && !meta.titleAr) {
      issues.push({
        type: 'error',
        message: 'Title is missing',
        field: 'title',
        priority: 'high'
      })
    } else {
      const title = meta.title || meta.titleAr || ''
      if (title.length < 30) {
        suggestions.push({
          message: 'Title is too short. Consider adding more descriptive words.',
          action: 'Expand title to 30-60 characters',
          priority: 'medium'
        })
      } else if (title.length > 60) {
        issues.push({
          type: 'warning',
          message: 'Title is too long and may be truncated in search results',
          field: 'title',
          priority: 'medium'
        })
      }
    }

    // Description analysis
    if (!meta.description && !meta.descriptionAr) {
      issues.push({
        type: 'error',
        message: 'Meta description is missing',
        field: 'description',
        priority: 'high'
      })
    } else {
      const description = meta.description || meta.descriptionAr || ''
      if (description.length < 120) {
        suggestions.push({
          message: 'Meta description is too short. Expand to better describe the page.',
          action: 'Expand description to 120-160 characters',
          priority: 'medium'
        })
      } else if (description.length > 160) {
        issues.push({
          type: 'warning',
          message: 'Meta description is too long and may be truncated',
          field: 'description',
          priority: 'medium'
        })
      }
    }

    // Keywords analysis
    if (!meta.keywords && !meta.keywordsAr) {
      suggestions.push({
        message: 'Consider adding keywords for better content organization',
        action: 'Add relevant keywords',
        priority: 'low'
      })
    }

    // Open Graph analysis
    if (!meta.ogTitle && !meta.ogTitleAr) {
      suggestions.push({
        message: 'Add Open Graph title for better social media sharing',
        action: 'Add og:title',
        priority: 'medium'
      })
    }

    if (!meta.ogImage) {
      issues.push({
        type: 'warning',
        message: 'Open Graph image is missing',
        field: 'ogImage',
        priority: 'medium'
      })
    }

    // Calculate score
    const totalChecks = 8
    const passedChecks = totalChecks - issues.filter(issue => issue.type === 'error').length
    const score = Math.round((passedChecks / totalChecks) * 100)

    return {
      score,
      issues,
      suggestions
    }
  }

  // URL and Slug utilities
  generateSlug(text: string, isArabic: boolean = false): string {
    if (isArabic) {
      // Handle Arabic text
      return text
        .toLowerCase()
        .replace(/[\u0600-\u06FF\u0750-\u077F]/g, (match) => {
          // Transliterate Arabic characters
          const arabicToLatin: {[key: string]: string} = {
            'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h',
            'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's',
            'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
            'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm',
            'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y'
          }
          return arabicToLatin[match] || match
        })
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }

    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Sitemap Generation
  async generateSitemap(): Promise<string> {
    const settings = await this.getSEOSettings()
    const entries: SitemapEntry[] = []

    // Add static pages
    entries.push({
      url: settings.siteUrl,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 1.0
    })

    entries.push({
      url: `${settings.siteUrl}/shop`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 0.9
    })

    entries.push({
      url: `${settings.siteUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    })

    entries.push({
      url: `${settings.siteUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6
    })

    // TODO: Add dynamic pages (products, categories, etc.)
    // This will be implemented when integrating with products

    return this.generateSitemapXML(entries)
  }

  private generateSitemapXML(entries: SitemapEntry[]): string {
    const urls = entries.map(entry => `
    <url>
      <loc>${entry.url}</loc>
      <lastmod>${entry.lastModified}</lastmod>
      <changefreq>${entry.changeFrequency}</changefreq>
      <priority>${entry.priority}</priority>
    </url>`).join('')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`
  }

  // Utility methods
  private generateRobotsContent(meta: SEOMeta): string {
    const parts: string[] = []
    
    if (meta.noIndex) parts.push('noindex')
    if (meta.noFollow) parts.push('nofollow')
    
    if (parts.length === 0) {
      parts.push('index', 'follow')
    }
    
    if (meta.robots) {
      parts.push(meta.robots)
    }
    
    return parts.join(', ')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

export const seoService = new SEOService()
