import React from 'react'
import { Helmet } from 'react-helmet-async'
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

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      {(completeMeta.title || completeMeta.titleAr) && (
        <title>
          {isArabic 
            ? (completeMeta.titleAr || completeMeta.title) 
            : (completeMeta.title || completeMeta.titleAr)
          }
        </title>
      )}
      
      {(completeMeta.description || completeMeta.descriptionAr) && (
        <meta 
          name="description" 
          content={isArabic 
            ? (completeMeta.descriptionAr || completeMeta.description || '') 
            : (completeMeta.description || completeMeta.descriptionAr || '')
          } 
        />
      )}

      {(completeMeta.keywords || completeMeta.keywordsAr) && (
        <meta 
          name="keywords" 
          content={isArabic 
            ? (completeMeta.keywordsAr || completeMeta.keywords || '') 
            : (completeMeta.keywords || completeMeta.keywordsAr || '')
          } 
        />
      )}

      {completeMeta.author && (
        <meta name="author" content={completeMeta.author} />
      )}

      {completeMeta.canonicalUrl && (
        <link rel="canonical" href={completeMeta.canonicalUrl} />
      )}

      {/* Robots */}
      <meta 
        name="robots" 
        content={generateRobotsContent(completeMeta)} 
      />

      {/* Open Graph */}
      {(completeMeta.ogTitle || completeMeta.ogTitleAr) && (
        <meta 
          property="og:title" 
          content={isArabic 
            ? (completeMeta.ogTitleAr || completeMeta.ogTitle || '') 
            : (completeMeta.ogTitle || completeMeta.ogTitleAr || '')
          } 
        />
      )}

      {(completeMeta.ogDescription || completeMeta.ogDescriptionAr) && (
        <meta 
          property="og:description" 
          content={isArabic 
            ? (completeMeta.ogDescriptionAr || completeMeta.ogDescription || '') 
            : (completeMeta.ogDescription || completeMeta.ogDescriptionAr || '')
          } 
        />
      )}

      {completeMeta.ogImage && (
        <meta property="og:image" content={completeMeta.ogImage} />
      )}

      {completeMeta.ogType && (
        <meta property="og:type" content={completeMeta.ogType} />
      )}

      {completeMeta.ogUrl && (
        <meta property="og:url" content={completeMeta.ogUrl} />
      )}

      <meta property="og:locale" content={isArabic ? 'ar_OM' : 'en_US'} />
      {isArabic && <meta property="og:locale:alternate" content="en_US" />}
      {!isArabic && <meta property="og:locale:alternate" content="ar_OM" />}

      {/* Twitter Cards */}
      {completeMeta.twitterCard && (
        <meta name="twitter:card" content={completeMeta.twitterCard} />
      )}

      {(completeMeta.twitterTitle || completeMeta.twitterTitleAr) && (
        <meta 
          name="twitter:title" 
          content={isArabic 
            ? (completeMeta.twitterTitleAr || completeMeta.twitterTitle || '') 
            : (completeMeta.twitterTitle || completeMeta.twitterTitleAr || '')
          } 
        />
      )}

      {(completeMeta.twitterDescription || completeMeta.twitterDescriptionAr) && (
        <meta 
          name="twitter:description" 
          content={isArabic 
            ? (completeMeta.twitterDescriptionAr || completeMeta.twitterDescription || '') 
            : (completeMeta.twitterDescription || completeMeta.twitterDescriptionAr || '')
          } 
        />
      )}

      {completeMeta.twitterImage && (
        <meta name="twitter:image" content={completeMeta.twitterImage} />
      )}

      {/* Language */}
      <html lang={isArabic ? 'ar' : 'en'} dir={isArabic ? 'rtl' : 'ltr'} />

      {/* Schema.org JSON-LD */}
      {schema.map((schemaItem, index) => (
        <script 
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemaItem)
          }}
        />
      ))}

      {/* Additional meta tags */}
      {completeMeta.lastModified && (
        <meta name="last-modified" content={completeMeta.lastModified} />
      )}

      <meta name="format-detection" content="telephone=no" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {children}
    </Helmet>
  )
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
