// SEO Meta Data Types
export interface SEOMeta {
  title?: string
  titleAr?: string
  description?: string
  descriptionAr?: string
  keywords?: string
  keywordsAr?: string
  canonicalUrl?: string
  ogTitle?: string
  ogTitleAr?: string
  ogDescription?: string
  ogDescriptionAr?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  ogUrl?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterTitle?: string
  twitterTitleAr?: string
  twitterDescription?: string
  twitterDescriptionAr?: string
  twitterImage?: string
  robots?: string
  author?: string
  noIndex?: boolean
  noFollow?: boolean
  lastModified?: string
}

// Schema.org Types
export interface SchemaOrg {
  '@context': string
  '@type': string
  [key: string]: any
}

export interface ProductSchema extends SchemaOrg {
  '@type': 'Product'
  name: string
  nameAr?: string
  description: string
  descriptionAr?: string
  image: string[]
  sku: string
  brand: {
    '@type': 'Brand'
    name: string
  }
  category: string
  offers: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    url: string
    seller: {
      '@type': 'Organization'
      name: string
    }
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
  }
  review?: ReviewSchema[]
}

export interface ReviewSchema extends SchemaOrg {
  '@type': 'Review'
  author: {
    '@type': 'Person'
    name: string
  }
  reviewRating: {
    '@type': 'Rating'
    ratingValue: number
    bestRating: number
  }
  reviewBody: string
  datePublished: string
}

export interface OrganizationSchema extends SchemaOrg {
  '@type': 'Organization'
  name: string
  nameAr?: string
  url: string
  logo: string
  description: string
  descriptionAr?: string
  address: {
    '@type': 'PostalAddress'
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
  contactPoint: {
    '@type': 'ContactPoint'
    telephone: string
    contactType: string
    availableLanguage: string[]
  }
  sameAs: string[]
  openingHours: string[]
}

export interface BreadcrumbSchema extends SchemaOrg {
  '@type': 'BreadcrumbList'
  itemListElement: BreadcrumbItem[]
}

export interface BreadcrumbItem {
  '@type': 'ListItem'
  position: number
  name: string
  item: string
}

export interface WebsiteSchema extends SchemaOrg {
  '@type': 'WebSite'
  name: string
  nameAr?: string
  url: string
  description: string
  descriptionAr?: string
  inLanguage: string[]
  potentialAction: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

export interface FAQSchema extends SchemaOrg {
  '@type': 'FAQPage'
  mainEntity: FAQItem[]
}

export interface FAQItem {
  '@type': 'Question'
  name: string
  acceptedAnswer: {
    '@type': 'Answer'
    text: string
  }
}

// SEO Settings
export interface SEOSettings {
  // Global settings
  siteName: string
  siteNameAr: string
  siteDescription: string
  siteDescriptionAr: string
  siteUrl: string
  defaultImage: string
  favicon: string
  robotsTxt: string
  
  // Social media
  twitterHandle: string
  facebookAppId: string
  facebookPageId: string
  
  // Analytics
  googleAnalyticsId: string
  googleTagManagerId: string
  googleSearchConsoleId: string
  facebookPixelId: string
  
  // Organization info
  organizationName: string
  organizationNameAr: string
  organizationLogo: string
  organizationDescription: string
  organizationDescriptionAr: string
  
  // Contact info
  contactPhone: string
  contactEmail: string
  address: {
    street: string
    city: string
    region: string
    postalCode: string
    country: string
  }
  
  // Business hours
  openingHours: string[]
  
  // Default meta
  defaultTitle: string
  defaultTitleAr: string
  defaultDescription: string
  defaultDescriptionAr: string
  defaultKeywords: string
  defaultKeywordsAr: string
  
  // SEO features
  enableAutoSitemap: boolean
  enableBreadcrumbs: boolean
  enableOpenGraph: boolean
  enableTwitterCards: boolean
  enableSchema: boolean
  enableRichSnippets: boolean
}

// SEO Analysis
export interface SEOAnalysis {
  score: number
  issues: SEOIssue[]
  suggestions: SEOSuggestion[]
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  field?: string
  priority: 'high' | 'medium' | 'low'
}

export interface SEOSuggestion {
  message: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

// URL and Slug management
export interface URLStructure {
  pattern: string
  variables: string[]
  example: string
}

export interface SlugSettings {
  products: URLStructure
  categories: URLStructure
  pages: URLStructure
  transliteration: boolean
  removeStopWords: boolean
  maxLength: number
}

// Redirect management
export interface Redirect {
  id: string
  from: string
  to: string
  type: 301 | 302 | 307 | 308
  isActive: boolean
  createdAt: string
  hits?: number
}

// Sitemap
export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}
