import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { SEOMeta, SchemaOrg } from '@/types/seo'

interface SEOHeadProps {
  meta?: Partial<SEOMeta>
  schema?: SchemaOrg[]
  children?: React.ReactNode
}

export function SEOHead({ meta = {}, schema = [], children }: SEOHeadProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Generate complete meta data
  const completeMeta: SEOMeta = {
    title: meta.title,
    titleAr: meta.titleAr,
    description: meta.description,
    descriptionAr: meta.descriptionAr,
    keywords: meta.keywords,
    keywordsAr: meta.keywordsAr,
    canonicalUrl: meta.canonicalUrl,
    ogTitle: meta.ogTitle || meta.title,
    ogTitleAr: meta.ogTitleAr || meta.titleAr,
    ogDescription: meta.ogDescription || meta.description,
    ogDescriptionAr: meta.ogDescriptionAr || meta.descriptionAr,
    ogImage: meta.ogImage,
    ogType: meta.ogType || 'website',
    ogUrl: meta.ogUrl || meta.canonicalUrl,
    twitterCard: meta.twitterCard || 'summary_large_image',
    twitterTitle: meta.twitterTitle || meta.title,
    twitterTitleAr: meta.twitterTitleAr || meta.titleAr,
    twitterDescription: meta.twitterDescription || meta.description,
    twitterDescriptionAr: meta.twitterDescriptionAr || meta.descriptionAr,
    twitterImage: meta.twitterImage || meta.ogImage,
    robots: meta.robots,
    author: meta.author,
    noIndex: meta.noIndex,
    noFollow: meta.noFollow,
    lastModified: meta.lastModified
  }

  useEffect(() => {
    // Update document title
    if (completeMeta.title || completeMeta.titleAr) {
      document.title = isArabic 
        ? (completeMeta.titleAr || completeMeta.title || '')
        : (completeMeta.title || completeMeta.titleAr || '')
    }

    // Update document language and direction
    const htmlElement = document.documentElement
    htmlElement.lang = isArabic ? 'ar' : 'en'
    htmlElement.dir = isArabic ? 'rtl' : 'ltr'

    // Helper function to set or remove meta tag
    const setMetaTag = (name: string, content?: string, property?: boolean) => {
      if (!content) return

      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`
      let existingTag = document.querySelector(selector) as HTMLMetaElement
      
      if (existingTag) {
        existingTag.content = content
      } else {
        const newTag = document.createElement('meta')
        if (property) {
          newTag.setAttribute('property', name)
        } else {
          newTag.setAttribute('name', name)
        }
        newTag.content = content
        document.head.appendChild(newTag)
      }
    }

    // Helper function to set link tag
    const setLinkTag = (rel: string, href?: string) => {
      if (!href) return

      let existingTag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
      
      if (existingTag) {
        existingTag.href = href
      } else {
        const newTag = document.createElement('link')
        newTag.rel = rel
        newTag.href = href
        document.head.appendChild(newTag)
      }
    }

    // Basic meta tags
    setMetaTag('description', isArabic 
      ? (completeMeta.descriptionAr || completeMeta.description) 
      : (completeMeta.description || completeMeta.descriptionAr)
    )

    setMetaTag('keywords', isArabic 
      ? (completeMeta.keywordsAr || completeMeta.keywords) 
      : (completeMeta.keywords || completeMeta.keywordsAr)
    )

    setMetaTag('author', completeMeta.author)
    setMetaTag('robots', generateRobotsContent(completeMeta))
    setMetaTag('format-detection', 'telephone=no')
    setMetaTag('last-modified', completeMeta.lastModified)

    // Open Graph tags
    setMetaTag('og:title', isArabic 
      ? (completeMeta.ogTitleAr || completeMeta.ogTitle) 
      : (completeMeta.ogTitle || completeMeta.ogTitleAr), true
    )

    setMetaTag('og:description', isArabic 
      ? (completeMeta.ogDescriptionAr || completeMeta.ogDescription) 
      : (completeMeta.ogDescription || completeMeta.ogDescriptionAr), true
    )

    setMetaTag('og:image', completeMeta.ogImage, true)
    setMetaTag('og:type', completeMeta.ogType, true)
    setMetaTag('og:url', completeMeta.ogUrl, true)
    setMetaTag('og:locale', isArabic ? 'ar_OM' : 'en_US', true)
    setMetaTag('og:locale:alternate', isArabic ? 'en_US' : 'ar_OM', true)

    // Twitter Card tags
    setMetaTag('twitter:card', completeMeta.twitterCard)
    setMetaTag('twitter:title', isArabic 
      ? (completeMeta.twitterTitleAr || completeMeta.twitterTitle) 
      : (completeMeta.twitterTitle || completeMeta.twitterTitleAr)
    )

    setMetaTag('twitter:description', isArabic 
      ? (completeMeta.twitterDescriptionAr || completeMeta.twitterDescription) 
      : (completeMeta.twitterDescription || completeMeta.twitterDescriptionAr)
    )

    setMetaTag('twitter:image', completeMeta.twitterImage)

    // Canonical URL
    setLinkTag('canonical', completeMeta.canonicalUrl)

    // Schema.org JSON-LD
    schema.forEach((schemaItem, index) => {
      const scriptId = `schema-${index}`
      let existingScript = document.getElementById(scriptId)
      
      if (existingScript) {
        existingScript.textContent = JSON.stringify(schemaItem)
      } else {
        const script = document.createElement('script')
        script.id = scriptId
        script.type = 'application/ld+json'
        script.textContent = JSON.stringify(schemaItem)
        document.head.appendChild(script)
      }
    })

    // Cleanup function to remove old schema scripts if needed
    return () => {
      // Remove schema scripts that are no longer needed
      const existingSchemas = document.querySelectorAll('script[id^="schema-"]')
      existingSchemas.forEach((script, index) => {
        if (index >= schema.length) {
          script.remove()
        }
      })
    }
  }, [completeMeta, schema, isArabic])

  // Render any additional children (for manual meta tags)
  return children ? <>{children}</> : null
}

// Helper function
function generateRobotsContent(meta: SEOMeta): string {
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
