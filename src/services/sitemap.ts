import { firestoreService, type Product } from '@/lib/firebase'

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

export interface SitemapData {
  urls: SitemapUrl[]
  lastGenerated: string
}

class SitemapService {
  private baseUrl = 'https://spirithubcafe.com' // Update with your actual domain

  /**
   * Generate complete sitemap data
   */
  async generateSitemap(): Promise<SitemapData> {
    const urls: SitemapUrl[] = []

    // Add static pages
    urls.push(
      {
        loc: this.baseUrl,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString()
      },
      {
        loc: `${this.baseUrl}/shop`,
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString()
      },
      {
        loc: `${this.baseUrl}/about`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      },
      {
        loc: `${this.baseUrl}/contact`,
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString()
      }
    )

    // Add category pages
    try {
      const categories = await firestoreService.categories.list()
      categories.items.forEach(category => {
        if (category.is_active) {
          urls.push({
            loc: `${this.baseUrl}/category/${category.id}`,
            changefreq: 'weekly',
            priority: 0.8,
            lastmod: category.updated?.toISOString() || new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('Error fetching categories for sitemap:', error)
    }

    // Add product pages
    try {
      const products = await firestoreService.products.list()
      products.items.forEach((product: Product) => {
        if (product.is_active !== false) { // Include products that are active or undefined
          urls.push({
            loc: `${this.baseUrl}/product/${product.slug || product.id}`,
            changefreq: 'weekly',
            priority: 0.7,
            lastmod: product.updated?.toISOString() || new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('Error fetching products for sitemap:', error)
    }

    // Add dynamic pages
    try {
      const pagesResult = await firestoreService.pages.list()
      pagesResult.items.forEach(page => {
        if (page.is_active) {
          urls.push({
            loc: `${this.baseUrl}/page/${page.slug}`,
            changefreq: 'monthly',
            priority: 0.5,
            lastmod: page.updated?.toISOString() || new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('Error fetching pages for sitemap:', error)
    }

    return {
      urls,
      lastGenerated: new Date().toISOString()
    }
  }

  /**
   * Generate XML sitemap string
   */
  async generateXmlSitemap(): Promise<string> {
    const sitemapData = await this.generateSitemap()
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    sitemapData.urls.forEach(url => {
      xml += '  <url>\n'
      xml += `    <loc>${url.loc}</loc>\n`
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`
      }
      if (url.changefreq) {
        xml += `    <changefreq>${url.changefreq}</changefreq>\n`
      }
      if (url.priority !== undefined) {
        xml += `    <priority>${url.priority}</priority>\n`
      }
      xml += '  </url>\n'
    })

    xml += '</urlset>'
    return xml
  }

  /**
   * Generate robots.txt content
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /login
Disallow: /register

# Allow common crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay
Crawl-delay: 1`
  }

  /**
   * Download sitemap as XML file
   */
  async downloadSitemap(): Promise<void> {
    try {
      const xmlContent = await this.generateXmlSitemap()
      const blob = new Blob([xmlContent], { type: 'application/xml' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'sitemap.xml'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading sitemap:', error)
      throw error
    }
  }

  /**
   * Download robots.txt file
   */
  downloadRobotsTxt(): void {
    try {
      const content = this.generateRobotsTxt()
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'robots.txt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading robots.txt:', error)
      throw error
    }
  }

  /**
   * Get sitemap statistics
   */
  async getSitemapStats(): Promise<{
    totalUrls: number
    lastGenerated: string
    categories: number
    products: number
    pages: number
    static: number
  }> {
    const sitemapData = await this.generateSitemap()
    
    const categories = sitemapData.urls.filter(url => url.loc.includes('/category/')).length
    const products = sitemapData.urls.filter(url => url.loc.includes('/product/')).length
    const pages = sitemapData.urls.filter(url => url.loc.includes('/page/')).length
    const staticPages = sitemapData.urls.length - categories - products - pages

    return {
      totalUrls: sitemapData.urls.length,
      lastGenerated: sitemapData.lastGenerated,
      categories,
      products,
      pages,
      static: staticPages
    }
  }

  /**
   * Update base URL for sitemap generation
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl
  }
}

export const sitemapService = new SitemapService()
