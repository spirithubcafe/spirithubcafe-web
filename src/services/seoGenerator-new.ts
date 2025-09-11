// SEO Generator - JSON-based implementation without Firebase
import type { Product, Category, Page } from '@/types'

interface SEOData {
  meta_title?: string
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  meta_keywords?: string
  meta_keywords_ar?: string
  slug?: string
  canonical_url?: string
  og_title?: string
  og_title_ar?: string
  og_description?: string
  og_description_ar?: string
  og_image?: string
  twitter_title?: string
  twitter_title_ar?: string
  twitter_description?: string
  twitter_description_ar?: string
  twitter_image?: string
}

export class SEOGenerator {
  
  // Generate SEO for Product
  static generateProductSEO(product: Product, siteName: string = 'SpiritHub Cafe'): SEOData {
    const nameEn = product.name || ''
    const nameAr = product.name_ar || product.name || ''
    const descriptionEn = product.description || ''
    const descriptionAr = product.description_ar || product.description || ''
    
    // Clean HTML from descriptions
    const cleanDescriptionEn = this.cleanHTML(descriptionEn)
    const cleanDescriptionAr = this.cleanHTML(descriptionAr)
    
    // Generate titles
    const metaTitleEn = `${nameEn} - Premium Coffee | ${siteName}`
    const metaTitleAr = `${nameAr} - قهوة مختصة | ${siteName}`
    
    // Generate descriptions (max 160 characters)
    const metaDescriptionEn = this.truncateText(
      cleanDescriptionEn || `Discover ${nameEn} from ${siteName}. High quality coffee with the best prices and fast delivery.`,
      160
    )
    const metaDescriptionAr = this.truncateText(
      cleanDescriptionAr || `اكتشف ${nameAr} من ${siteName}. قهوة عالية الجودة مع أفضل الأسعار والتوصيل السريع.`,
      160
    )
    
    // Generate keywords
    const keywordsEn = this.generateProductKeywords(product, 'en')
    const keywordsAr = this.generateProductKeywords(product, 'ar')
    
    // Product image
    const productImage = product.image || '/images/default-product.jpg'
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn,
      meta_keywords_ar: keywordsAr,
      slug: product.slug || this.generateSlug(nameEn),
      canonical_url: `/products/${product.slug || this.generateSlug(nameEn)}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      og_image: productImage,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr,
      twitter_image: productImage
    }
  }

  // Generate SEO for Category
  static generateCategorySEO(category: Category, siteName: string = 'SpiritHub Cafe'): SEOData {
    const nameEn = category.name || ''
    const nameAr = category.name_ar || category.name || ''
    const descriptionEn = category.description || ''
    const descriptionAr = category.description_ar || category.description || ''
    
    // Clean HTML from descriptions
    const cleanDescriptionEn = this.cleanHTML(descriptionEn)
    const cleanDescriptionAr = this.cleanHTML(descriptionAr)
    
    // Generate titles
    const metaTitleEn = `${nameEn} - Premium Coffee Collection | ${siteName}`
    const metaTitleAr = `${nameAr} - مجموعة القهوة المختصة | ${siteName}`
    
    // Generate descriptions
    const metaDescriptionEn = this.truncateText(
      cleanDescriptionEn || `Explore our ${nameEn.toLowerCase()} collection at ${siteName}. Premium quality coffee with worldwide delivery.`,
      160
    )
    const metaDescriptionAr = this.truncateText(
      cleanDescriptionAr || `استكشف مجموعة ${nameAr} في ${siteName}. قهوة عالية الجودة مع التوصيل العالمي.`,
      160
    )
    
    // Generate keywords
    const keywordsEn = this.generateCategoryKeywords(category, 'en')
    const keywordsAr = this.generateCategoryKeywords(category, 'ar')
    
    // Category image
    const categoryImage = category.image || '/images/default-category.jpg'
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn,
      meta_keywords_ar: keywordsAr,
      slug: category.slug || this.generateSlug(nameEn),
      canonical_url: `/categories/${category.slug || this.generateSlug(nameEn)}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      og_image: categoryImage,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr,
      twitter_image: categoryImage
    }
  }

  // Generate SEO for Page
  static generatePageSEO(page: Page, siteName: string = 'SpiritHub Cafe'): SEOData {
    const titleEn = page.title || ''
    const titleAr = page.title_ar || page.title || ''
    const contentEn = page.content || ''
    const contentAr = page.content_ar || page.content || ''
    
    // Clean HTML from content
    const cleanContentEn = this.cleanHTML(contentEn)
    const cleanContentAr = this.cleanHTML(contentAr)
    
    // Generate titles
    const metaTitleEn = `${titleEn} | ${siteName}`
    const metaTitleAr = `${titleAr} | ${siteName}`
    
    // Generate descriptions from content
    const metaDescriptionEn = this.truncateText(
      this.extractDescriptionFromContent(cleanContentEn) || `Learn more about ${titleEn.toLowerCase()} at ${siteName}.`,
      160
    )
    const metaDescriptionAr = this.truncateText(
      this.extractDescriptionFromContent(cleanContentAr) || `تعرف على المزيد حول ${titleAr} في ${siteName}.`,
      160
    )
    
    // Generate keywords
    const keywordsEn = this.generatePageKeywords(page, 'en')
    const keywordsAr = this.generatePageKeywords(page, 'ar')
    
    // Page image
    const pageImage = '/images/default-page.jpg'
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn,
      meta_keywords_ar: keywordsAr,
      slug: page.slug || this.generateSlug(titleEn),
      canonical_url: `/${page.slug || this.generateSlug(titleEn)}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      og_image: pageImage,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr,
      twitter_image: pageImage
    }
  }

  // Helper methods
  static cleanHTML(text: string): string {
    return text.replace(/<[^>]*>/g, '').trim()
  }

  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  static extractDescriptionFromContent(content: string): string {
    const sentences = content.split(/[.!?]+/)
    const firstSentence = sentences[0]?.trim()
    return firstSentence && firstSentence.length > 20 ? firstSentence : content.substring(0, 100)
  }

  static generateProductKeywords(product: Product, language: 'en' | 'ar'): string {
    const baseKeywords = language === 'en' 
      ? ['coffee', 'premium coffee', 'specialty coffee', 'arabica', 'robusta', 'roasted', 'beans']
      : ['قهوة', 'قهوة مختصة', 'قهوة فاخرة', 'أرابيكا', 'روبوستا', 'محمصة', 'حبوب']

    const productName = language === 'en' ? product.name : (product.name_ar || product.name)
    const category = language === 'en' ? product.category?.name : product.category?.name // Assuming category name
    
    let keywords = [...baseKeywords]
    
    if (productName) {
      keywords.push(productName.toLowerCase())
    }
    
    if (category) {
      keywords.push(category.toLowerCase())
    }
    
    // Add product-specific keywords based on tags
    if (product.tags) {
      keywords.push(...product.tags.map(tag => tag.name?.toLowerCase() || '').filter(Boolean))
    }
    
    // Add origin-based keywords if available
    if (product.origin) {
      keywords.push(product.origin.name?.toLowerCase() || '')
    }
    
    // Remove duplicates and return as comma-separated string
    return [...new Set(keywords)].join(', ')
  }

  static generateCategoryKeywords(category: Category, language: 'en' | 'ar'): string {
    const baseKeywords = language === 'en' 
      ? ['coffee', 'coffee collection', 'premium coffee', 'specialty coffee', 'coffee shop', 'roastery']
      : ['قهوة', 'مجموعة قهوة', 'قهوة مختصة', 'قهوة فاخرة', 'محل قهوة', 'محمصة']

    const categoryName = language === 'en' ? category.name : (category.name_ar || category.name)
    
    let keywords = [...baseKeywords]
    
    if (categoryName) {
      keywords.push(categoryName.toLowerCase())
      keywords.push(`${categoryName.toLowerCase()} coffee`)
    }
    
    // Add location-based keywords
    keywords.push(...(language === 'en' ? ['Oman', 'Muscat', 'Middle East'] : ['عمان', 'مسقط', 'الشرق الأوسط']))
    
    return [...new Set(keywords)].join(', ')
  }

  static generatePageKeywords(page: Page, language: 'en' | 'ar'): string {
    const baseKeywords = language === 'en' 
      ? ['SpiritHub Cafe', 'coffee shop', 'premium coffee', 'Oman', 'Muscat']
      : ['سبيريت هاب كافيه', 'محل قهوة', 'قهوة مختصة', 'عمان', 'مسقط']

    const pageTitle = language === 'en' ? page.title : (page.title_ar || page.title)
    
    let keywords = [...baseKeywords]
    
    if (pageTitle) {
      const titleWords = pageTitle.toLowerCase().split(/\s+/)
      keywords.push(...titleWords)
    }
    
    // Add content-based keywords (extract from first 200 characters)
    if (page.content) {
      const content = this.cleanHTML(page.content).toLowerCase()
      const contentWords = content.substring(0, 200).split(/\s+/)
      const relevantWords = contentWords.filter(word => 
        word.length > 3 && 
        !['the', 'and', 'for', 'with', 'من', 'في', 'على', 'إلى'].includes(word)
      )
      keywords.push(...relevantWords.slice(0, 5))
    }
    
    return [...new Set(keywords)].join(', ')
  }

  // Generate structured data for products
  static generateProductStructuredData(product: Product, siteName: string = 'SpiritHub Cafe'): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: this.cleanHTML(product.description || ''),
      image: product.image,
      brand: {
        '@type': 'Brand',
        name: siteName
      },
      offers: {
        '@type': 'Offer',
        price: (product as any).price || (product as any).base_price || 0,
        priceCurrency: 'OMR',
        availability: (product.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: siteName
        }
      },
      category: product.category?.name,
      sku: product.id,
      aggregateRating: ((product as any).rating || 0) > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: (product as any).rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: product.review_count || 1
      } : undefined
    }
  }
}

export default SEOGenerator
