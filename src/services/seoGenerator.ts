import { firestoreService } from '@/lib/firebase'
import type { Product, Category, Page } from '@/lib/firebase'

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
    
    // Generate slug if not exists
    const slug = product.slug || this.generateSlug(nameEn)
    
    // Get main image
    const mainImage = product.image_url || product.image || product.images?.[0] || ''
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn.join(', '),
      meta_keywords_ar: keywordsAr.join(', '),
      slug: slug,
      canonical_url: `/products/${slug}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      og_image: mainImage,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr,
      twitter_image: mainImage
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
    const metaTitleEn = `${nameEn} - Shop from ${nameEn} Collection | ${siteName}`
    const metaTitleAr = `${nameAr} - تسوق من مجموعة ${nameAr} | ${siteName}`
    
    // Generate descriptions
    const metaDescriptionEn = this.truncateText(
      cleanDescriptionEn || `Discover the amazing ${nameEn} collection at ${siteName}. Best products with the best prices and fast delivery.`,
      160
    )
    const metaDescriptionAr = this.truncateText(
      cleanDescriptionAr || `اكتشف مجموعة ${nameAr} الرائعة في ${siteName}. أفضل المنتجات بأفضل الأسعار مع التوصيل السريع.`,
      160
    )
    
    // Generate keywords
    const keywordsEn = this.generateCategoryKeywords(category, 'en')
    const keywordsAr = this.generateCategoryKeywords(category, 'ar')
    
    // Generate slug if not exists
    const slug = category.slug || this.generateSlug(nameEn)
    
    // Get main image
    const mainImage = category.image || ''
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn.join(', '),
      meta_keywords_ar: keywordsAr.join(', '),
      slug: slug,
      canonical_url: `/categories/${slug}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      og_image: mainImage,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr,
      twitter_image: mainImage
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
    
    // Generate descriptions from content (first 160 chars)
    const metaDescriptionEn = this.truncateText(
      cleanContentEn || `${titleEn} - Important information from ${siteName}`,
      160
    )
    const metaDescriptionAr = this.truncateText(
      cleanContentAr || `${titleAr} - معلومات مهمة من ${siteName}`,
      160
    )
    
    // Generate keywords
    const keywordsEn = this.generatePageKeywords(page, 'en')
    const keywordsAr = this.generatePageKeywords(page, 'ar')
    
    // Generate slug if not exists
    const slug = page.slug || this.generateSlug(titleEn)
    
    return {
      meta_title: metaTitleEn,
      meta_title_ar: metaTitleAr,
      meta_description: metaDescriptionEn,
      meta_description_ar: metaDescriptionAr,
      meta_keywords: keywordsEn.join(', '),
      meta_keywords_ar: keywordsAr.join(', '),
      slug: slug,
      canonical_url: `/pages/${slug}`,
      og_title: metaTitleEn,
      og_title_ar: metaTitleAr,
      og_description: metaDescriptionEn,
      og_description_ar: metaDescriptionAr,
      twitter_title: metaTitleEn,
      twitter_title_ar: metaTitleAr,
      twitter_description: metaDescriptionEn,
      twitter_description_ar: metaDescriptionAr
    }
  }
  
  // Generate keywords for product
  private static generateProductKeywords(product: Product, language: 'en' | 'ar' = 'en'): string[] {
    const keywords: string[] = []
    
    if (language === 'en') {
      // English keywords
      if (product.name) keywords.push(product.name)
      if (product.roast_level) keywords.push(product.roast_level)
      if (product.processing_method) keywords.push(product.processing_method)
      if (product.variety) keywords.push(product.variety)
      if (product.notes) keywords.push(...product.notes.split(',').map(n => n.trim()))
      
      // Add general English coffee keywords
      keywords.push('coffee', 'specialty coffee', 'premium coffee', 'roasted coffee', 'beans')
    } else {
      // Arabic keywords
      if (product.name_ar) keywords.push(product.name_ar)
      if (product.roast_level_ar) keywords.push(product.roast_level_ar)
      if (product.processing_method_ar) keywords.push(product.processing_method_ar)
      if (product.variety_ar) keywords.push(product.variety_ar)
      if (product.notes_ar) keywords.push(...product.notes_ar.split(',').map(n => n.trim()))
      
      // Add general Arabic coffee keywords
      keywords.push('قهوة', 'كافيه', 'قهوة عربية', 'قهوة مختصة', 'قهوة محمصة', 'حبوب قهوة')
    }
    
    // Remove empty strings and duplicates
    return [...new Set(keywords.filter(k => k && k.trim() !== ''))]
  }
  
  // Generate keywords for category
  private static generateCategoryKeywords(category: Category, language: 'en' | 'ar' = 'en'): string[] {
    const keywords: string[] = []
    
    if (language === 'en') {
      // English keywords
      if (category.name) keywords.push(category.name)
      keywords.push('shop', 'products', 'coffee', 'collection', 'category', 'buy')
    } else {
      // Arabic keywords
      if (category.name_ar) keywords.push(category.name_ar)
      keywords.push('تسوق', 'منتجات', 'قهوة', 'مجموعة', 'فئة', 'شراء')
    }
    
    return [...new Set(keywords.filter(k => k && k.trim() !== ''))]
  }
  
  // Generate keywords for page
  private static generatePageKeywords(page: Page, language: 'en' | 'ar' = 'en'): string[] {
    const keywords: string[] = []
    
    if (language === 'en') {
      // English keywords
      if (page.title) keywords.push(page.title)
      
      // Extract keywords from English content
      const content = this.cleanHTML(page.content || '')
      const words = content.split(' ').slice(0, 100)
      const importantWords = words.filter(word => 
        word.length > 3 && 
        !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
      )
      keywords.push(...importantWords.slice(0, 8))
      keywords.push('page', 'information', 'details')
    } else {
      // Arabic keywords
      if (page.title_ar) keywords.push(page.title_ar)
      
      // Extract keywords from Arabic content
      const content = this.cleanHTML(page.content_ar || '')
      const words = content.split(' ').slice(0, 100)
      const importantWords = words.filter(word => 
        word.length > 3 && 
        !['هذا', 'هذه', 'ذلك', 'التي', 'الذي', 'كان', 'كانت', 'يكون', 'تكون'].includes(word)
      )
      keywords.push(...importantWords.slice(0, 8))
      keywords.push('صفحة', 'معلومات', 'تفاصيل')
    }
    
    return [...new Set(keywords.filter(k => k && k.trim() !== ''))]
  }
  
  // Generate URL-friendly slug
  private static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[ء]/g, '')
      .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }
  
  // Clean HTML tags from text
  private static cleanHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }
  
  // Truncate text to specified length
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    
    const truncated = text.substring(0, maxLength)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...'
  }
  
  // Auto-generate SEO for all products
  static async autoGenerateAllProductsSEO(): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }
    
    try {
      const productsResult = await firestoreService.products.list()
      const products = productsResult.items
      
      for (const product of products) {
        try {
          const seoData = this.generateProductSEO(product)
          
          console.log('Updating product SEO:', product.id, seoData)
          
          await firestoreService.products.update(product.id, {
            meta_title: seoData.meta_title,
            meta_title_ar: seoData.meta_title_ar,
            meta_description: seoData.meta_description,
            meta_description_ar: seoData.meta_description_ar,
            meta_keywords: seoData.meta_keywords,
            meta_keywords_ar: seoData.meta_keywords_ar,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_title_ar: seoData.og_title_ar,
            og_description: seoData.og_description,
            og_description_ar: seoData.og_description_ar,
            og_image: seoData.og_image,
            twitter_title: seoData.twitter_title,
            twitter_title_ar: seoData.twitter_title_ar,
            twitter_description: seoData.twitter_description,
            twitter_description_ar: seoData.twitter_description_ar,
            twitter_image: seoData.twitter_image,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          
          console.log('Product SEO updated successfully:', product.id)
          results.success++
        } catch (error) {
          results.failed++
          results.errors.push(`Product ${product.name}: ${error}`)
        }
      }
    } catch (error) {
      results.errors.push(`Failed to fetch products: ${error}`)
    }
    
    return results
  }
  
  // Auto-generate SEO for all categories
  static async autoGenerateAllCategoriesSEO(): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }
    
    try {
      const categoriesResult = await firestoreService.categories.list()
      const categories = categoriesResult.items
      
      for (const category of categories) {
        try {
          const seoData = this.generateCategorySEO(category)
          
          await firestoreService.categories.update(category.id, {
            meta_title: seoData.meta_title,
            meta_title_ar: seoData.meta_title_ar,
            meta_description: seoData.meta_description,
            meta_description_ar: seoData.meta_description_ar,
            meta_keywords: seoData.meta_keywords,
            meta_keywords_ar: seoData.meta_keywords_ar,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_title_ar: seoData.og_title_ar,
            og_description: seoData.og_description,
            og_description_ar: seoData.og_description_ar,
            og_image: seoData.og_image,
            twitter_title: seoData.twitter_title,
            twitter_title_ar: seoData.twitter_title_ar,
            twitter_description: seoData.twitter_description,
            twitter_description_ar: seoData.twitter_description_ar,
            twitter_image: seoData.twitter_image,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          
          results.success++
        } catch (error) {
          results.failed++
          results.errors.push(`Category ${category.name}: ${error}`)
        }
      }
    } catch (error) {
      results.errors.push(`Failed to fetch categories: ${error}`)
    }
    
    return results
  }
  
  // Auto-generate SEO for all pages
  static async autoGenerateAllPagesSEO(): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] }
    
    try {
      const pagesResult = await firestoreService.pages.list()
      const pages = pagesResult.items
      
      for (const page of pages) {
        try {
          const seoData = this.generatePageSEO(page)
          
          await firestoreService.pages.update(page.id, {
            meta_title: seoData.meta_title,
            meta_title_ar: seoData.meta_title_ar,
            meta_description: seoData.meta_description,
            meta_description_ar: seoData.meta_description_ar,
            meta_keywords: seoData.meta_keywords,
            meta_keywords_ar: seoData.meta_keywords_ar,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_title_ar: seoData.og_title_ar,
            og_description: seoData.og_description,
            og_description_ar: seoData.og_description_ar,
            twitter_title: seoData.twitter_title,
            twitter_title_ar: seoData.twitter_title_ar,
            twitter_description: seoData.twitter_description,
            twitter_description_ar: seoData.twitter_description_ar,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          
          results.success++
        } catch (error) {
          results.failed++
          results.errors.push(`Page ${page.title}: ${error}`)
        }
      }
    } catch (error) {
      results.errors.push(`Failed to fetch pages: ${error}`)
    }
    
    return results
  }
  
  // Generate SEO for single item
  static async generateSingleItemSEO(type: 'product' | 'category' | 'page', id: string): Promise<SEOData> {
    switch (type) {
      case 'product':
        const product = await firestoreService.products.get(id)
        if (!product) throw new Error('Product not found')
        return this.generateProductSEO(product)
        
      case 'category':
        const category = await firestoreService.categories.get(id)
        if (!category) throw new Error('Category not found')
        return this.generateCategorySEO(category)
        
      case 'page':
        const page = await firestoreService.pages.get(id)
        if (!page) throw new Error('Page not found')
        return this.generatePageSEO(page)
        
      default:
        throw new Error('Invalid type')
    }
  }
}

export default SEOGenerator
