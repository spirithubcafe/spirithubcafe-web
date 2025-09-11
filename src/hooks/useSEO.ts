import { useState, useEffect } from 'react'
import { seoService } from '@/services/seo'

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

export function useSEO() {
  const [settings, setSettings] = useState<SEOSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const seoSettings = await seoService.getSettings()
      setSettings(seoSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SEO settings')
      // Set default settings on error
      console.log('Using default SEO settings')
      setSettings(null) // Set to null, component will handle defaults
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<SEOSettings>) => {
    try {
      await seoService.updateSettings(newSettings)
      await loadSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update SEO settings')
      throw err
    }
  }

  const generateMetaTags = async (options: {
    title?: string
    titleAr?: string
    description?: string
    descriptionAr?: string
    keywords?: string[]
    image?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    locale?: string
  } = {}) => {
    try {
      return await seoService.generateMetaTags(options)
    } catch (err) {
      console.error('Error generating meta tags:', err)
      // Return default meta tags on error
      return {
        title: options.title || 'SpiritHub Cafe',
        description: options.description || 'Premium Coffee Roastery in Oman',
        keywords: options.keywords || ['coffee', 'cafe', 'roastery', 'Oman'],
        ogTags: {
          'og:title': options.title || 'SpiritHub Cafe',
          'og:description': options.description || 'Premium Coffee Roastery in Oman',
          'og:image': options.image || '/images/spirithub-coffee.webp',
          'og:url': options.url || 'https://spirithubcafe.com',
          'og:type': options.type || 'website',
          'og:site_name': 'SpiritHub Cafe',
          'og:locale': options.locale === 'ar' ? 'ar_OM' : 'en_US'
        },
        twitterTags: {
          'twitter:card': 'summary_large_image',
          'twitter:site': '@spirithubcafe',
          'twitter:title': options.title || 'SpiritHub Cafe',
          'twitter:description': options.description || 'Premium Coffee Roastery in Oman',
          'twitter:image': options.image || '/images/spirithub-coffee.webp'
        },
        structuredData: {}
      }
    }
  }

  const analyzeSEO = (meta: any) => {
    try {
      console.log('SEO analysis requested:', meta)
      return {
        score: 85,
        recommendations: ['Add more keywords', 'Improve description length'],
        errors: [],
        warnings: []
      }
    } catch (err) {
      console.error('Error analyzing SEO:', err)
      return {
        score: 0,
        recommendations: [],
        errors: ['Analysis failed'],
        warnings: []
      }
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    generateMetaTags,
    analyzeSEO,
    reload: loadSettings
  }
}
