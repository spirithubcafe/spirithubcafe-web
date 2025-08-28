import { firestoreService } from '@/lib/firebase'
import type { Product } from '@/lib/firebase'

interface SEOData {
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  slug?: string
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
}

export class SEOGenerator {
  
  // Generate SEO for Product
  static generateProductSEO(product: Product, siteName: string = 'SpiritHub Cafe'): SEOData {
    const name = product.name || ''
    const description = product.description || ''
    
    // Clean HTML from description
    const cleanDescription = this.cleanHTML(description)
    
    // Generate titles
    const metaTitle = `${name} - قهوة مختصة | ${siteName}`
    
    // Generate descriptions (max 160 characters)
    const metaDescription = this.truncateText(
      cleanDescription || `اكتشف ${name} من ${siteName}. قهوة عالية الجودة مع أفضل الأسعار والتوصيل السريع.`,
      160
    )
    
    // Generate keywords
    const keywords = this.generateProductKeywords(product)
    
    // Generate slug if not exists
    const slug = product.slug || this.generateSlug(name)
    
    // Get main image
    const mainImage = product.image_url || product.image || product.images?.[0] || ''
    
    return {
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: keywords.join(', '),
      slug: slug,
      canonical_url: `/products/${slug}`,
      og_title: metaTitle,
      og_description: metaDescription,
      og_image: mainImage,
      twitter_title: metaTitle,
      twitter_description: metaDescription,
      twitter_image: mainImage
    }
  }
  
  // Generate SEO for Category
  static generateCategorySEO(category: any, siteName: string = 'SpiritHub Cafe'): SEOData {
    const name = category.name || ''
    const nameAr = category.name_ar || ''
    const description = category.description || ''
    const descriptionAr = category.description_ar || ''
    
    // Clean HTML from description
    const cleanDescription = this.cleanHTML(description)
    const cleanDescriptionAr = this.cleanHTML(descriptionAr)
    
    // Generate titles
    const metaTitle = `${name} - تسوق من مجموعة ${nameAr} | ${siteName}`
    
    // Generate descriptions
    const metaDescription = this.truncateText(
      cleanDescription || cleanDescriptionAr || `اكتشف مجموعة ${nameAr} الرائعة في ${siteName}. أفضل المنتجات بأفضل الأسعار مع التوصيل السريع.`,
      160
    )
    
    // Generate keywords
    const keywords = this.generateCategoryKeywords(category)
    
    // Generate slug if not exists
    const slug = category.slug || this.generateSlug(name)
    
    // Get main image
    const mainImage = category.image || category.banner_image || ''
    
    return {
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: keywords.join(', '),
      slug: slug,
      canonical_url: `/categories/${slug}`,
      og_title: metaTitle,
      og_description: metaDescription,
      og_image: mainImage,
      twitter_title: metaTitle,
      twitter_description: metaDescription,
      twitter_image: mainImage
    }
  }
  
  // Generate SEO for Page
  static generatePageSEO(page: any, siteName: string = 'SpiritHub Cafe'): SEOData {
    const title = page.title || ''
    const content = page.content || ''
    const contentAr = page.content_ar || ''
    
    // Clean HTML from content
    const cleanContent = this.cleanHTML(content)
    const cleanContentAr = this.cleanHTML(contentAr)
    
    // Generate titles
    const metaTitle = `${title} | ${siteName}`
    
    // Generate descriptions from content (first 160 chars)
    const metaDescription = this.truncateText(
      cleanContent || cleanContentAr || `${title} - معلومات مهمة من ${siteName}`,
      160
    )
    
    // Generate keywords
    const keywords = this.generatePageKeywords(page)
    
    // Generate slug if not exists
    const slug = page.slug || this.generateSlug(title)
    
    return {
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keywords: keywords.join(', '),
      slug: slug,
      canonical_url: `/pages/${slug}`,
      og_title: metaTitle,
      og_description: metaDescription,
      twitter_title: metaTitle,
      twitter_description: metaDescription
    }
  }
  
  // Generate keywords for product
  private static generateProductKeywords(product: Product): string[] {
    const keywords: string[] = []
    
    // Add product name
    if (product.name) keywords.push(product.name)
    if (product.name_ar) keywords.push(product.name_ar)
    
    // Add coffee-specific keywords
    if (product.roast_level) keywords.push(product.roast_level, product.roast_level_ar || '')
    if (product.processing_method) keywords.push(product.processing_method, product.processing_method_ar || '')
    if (product.variety) keywords.push(product.variety, product.variety_ar || '')
    if (product.notes) keywords.push(...product.notes.split(',').map(n => n.trim()))
    if (product.notes_ar) keywords.push(...product.notes_ar.split(',').map(n => n.trim()))
    
    // Add general coffee keywords
    keywords.push('قهوة', 'coffee', 'كافيه', 'قهوة عربية', 'قهوة مختصة', 'specialty coffee')
    
    // Remove empty strings and duplicates
    return [...new Set(keywords.filter(k => k && k.trim() !== ''))]
  }
  
  // Generate keywords for category
  private static generateCategoryKeywords(category: any): string[] {
    const keywords: string[] = []
    
    if (category.name) keywords.push(category.name)
    if (category.name_ar) keywords.push(category.name_ar)
    
    // Add general keywords
    keywords.push('تسوق', 'منتجات', 'قهوة', 'coffee', 'shop', 'products')
    
    return [...new Set(keywords.filter(k => k && k.trim() !== ''))]
  }
  
  // Generate keywords for page
  private static generatePageKeywords(page: any): string[] {
    const keywords: string[] = []
    
    if (page.title) keywords.push(page.title)
    if (page.title_ar) keywords.push(page.title_ar)
    
    // Extract keywords from content (first 100 words)
    const content = this.cleanHTML(page.content || page.content_ar || '')
    const words = content.split(' ').slice(0, 100)
    const importantWords = words.filter(word => 
      word.length > 3 && 
      !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
    )
    
    keywords.push(...importantWords.slice(0, 10))
    
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
            meta_description: seoData.meta_description,
            meta_keywords: seoData.meta_keywords,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_description: seoData.og_description,
            og_image: seoData.og_image,
            twitter_title: seoData.twitter_title,
            twitter_description: seoData.twitter_description,
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
            meta_description: seoData.meta_description,
            meta_keywords: seoData.meta_keywords,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_description: seoData.og_description,
            og_image: seoData.og_image,
            twitter_title: seoData.twitter_title,
            twitter_description: seoData.twitter_description,
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
            meta_description: seoData.meta_description,
            meta_keywords: seoData.meta_keywords,
            slug: seoData.slug,
            canonical_url: seoData.canonical_url,
            og_title: seoData.og_title,
            og_description: seoData.og_description,
            twitter_title: seoData.twitter_title,
            twitter_description: seoData.twitter_description,
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
