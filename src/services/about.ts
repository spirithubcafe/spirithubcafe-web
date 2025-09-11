// About service - JSON-based implementation
interface AboutHeader {
  id: string
  title: string
  title_ar: string
  subtitle: string
  subtitle_ar: string
  description: string
  description_ar: string
  background_image: string
  cta_text?: string
  cta_text_ar?: string
  cta_link?: string
}

interface AboutSection {
  id: string
  title: string
  title_ar: string
  content: string
  content_ar: string
  image?: string
  order: number
  type?: 'text' | 'image_text' | 'gallery' | 'team' | 'timeline'
  is_active?: boolean
}

class AboutService {
  private baseUrl = '/data'

  async getAboutHeader(): Promise<AboutHeader | null> {
    try {
      const response = await fetch(`${this.baseUrl}/about_header.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch about header')
      }
      const data = await response.json()
      
      // Handle array format and convert to single header object
      if (Array.isArray(data) && data.length > 0) {
        const headerData = data[0] // Take first item
        return {
          id: headerData.id || '1',
          title: headerData.title_en || headerData.title || 'About Us',
          title_ar: headerData.title_ar || 'من نحن',
          subtitle: headerData.subtitle_en || headerData.subtitle || 'Who We Are',
          subtitle_ar: headerData.subtitle_ar || 'من نحن',
          description: headerData.description_en || headerData.description || 'Learn more about our story and mission',
          description_ar: headerData.description_ar || 'تعرف على قصتنا ورسالتنا',
          background_image: headerData.background_image || headerData.image || '/images/about/hero-bg.jpg',
          cta_text: headerData.cta_text || 'Visit Our Cafe',
          cta_text_ar: headerData.cta_text_ar || 'زر مقهانا',
          cta_link: headerData.cta_link || '/contact'
        }
      }
      
      // Handle single object format
      if (data && typeof data === 'object') {
        return {
          id: data.id || '1',
          title: data.title_en || data.title || 'About Us',
          title_ar: data.title_ar || 'من نحن',
          subtitle: data.subtitle_en || data.subtitle || 'Who We Are',
          subtitle_ar: data.subtitle_ar || 'من نحن',
          description: data.description_en || data.description || 'Learn more about our story and mission',
          description_ar: data.description_ar || 'تعرف على قصتنا ورسالتنا',
          background_image: data.background_image || data.image || '/images/about/hero-bg.jpg',
          cta_text: data.cta_text || 'Visit Our Cafe',
          cta_text_ar: data.cta_text_ar || 'زر مقهانا',
          cta_link: data.cta_link || '/contact'
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching about header:', error)
      return null
    }
  }

  async getAboutSections(): Promise<AboutSection[]> {
    try {
      const response = await fetch(`${this.baseUrl}/about_sections.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch about sections')
      }
      const data = await response.json()
      
      // Convert to our format and sort by order
      if (Array.isArray(data)) {
        return data
          .filter(section => section.is_active !== false)
          .map((section, index) => ({
            id: section.id || `section-${index}`,
            title: section.title_en || section.title || 'Untitled',
            title_ar: section.title_ar || section.title || 'بدون عنوان',
            content: section.content_en || section.content || '',
            content_ar: section.content_ar || section.content || '',
            image: section.image_url || section.image,
            order: section.order_index || section.order || index,
            type: section.type || 'text',
            is_active: section.is_active !== false
          }))
          .sort((a, b) => a.order - b.order)
      }
      
      return []
    } catch (error) {
      console.error('Error fetching about sections:', error)
      return []
    }
  }

  async getAboutSection(id: string): Promise<AboutSection | null> {
    try {
      const sections = await this.getAboutSections()
      return sections.find(section => section.id === id) || null
    } catch (error) {
      console.error('Error fetching about section:', error)
      return null
    }
  }

  // Main method for AboutPage component
  async getAboutPageData(): Promise<{ header: AboutHeader | null; sections: AboutSection[] }> {
    try {
      const [header, sections] = await Promise.all([
        this.getAboutHeader(),
        this.getAboutSections()
      ])

      return { header, sections }
    } catch (error) {
      console.error('Error fetching about page data:', error)
      return { header: null, sections: [] }
    }
  }

  // Backward compatibility aliases  
  async getHeader(): Promise<AboutHeader | null> {
    return this.getAboutHeader()
  }

  async getSections(): Promise<AboutSection[]> {
    return this.getAboutSections()
  }
}

export const aboutService = new AboutService()
export type { AboutHeader, AboutSection }