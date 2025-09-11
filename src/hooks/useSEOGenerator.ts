import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { SEOGenerator } from '@/services/seoGenerator'
import { jsonProductsService, jsonCategoriesDataService } from '@/services/jsonSettingsService'

interface SEOGenerationResult {
  success: number
  failed: number
  errors: string[]
}

export const useSEOGenerator = () => {
  const { t } = useTranslation()
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Generate SEO for single item
  const generateSingleSEO = async (
    type: 'product' | 'category' | 'page',
    id: string
  ): Promise<boolean> => {
    try {
      setIsGenerating(true)
      
      // Get the item data and generate SEO
      let seoData = null
      
      if (type === 'product') {
        const products = await jsonProductsService.getProducts()
        const product = products.find((p: any) => p.id === id)
        if (product) {
          seoData = SEOGenerator.generateProductSEO(product)
        }
      } else if (type === 'category') {
        const categories = await jsonCategoriesDataService.getCategories()
        const category = categories.find((c: any) => c.id === id)
        if (category) {
          seoData = SEOGenerator.generateCategorySEO(category)
        }
      } else if (type === 'page') {
        // For pages, we'll use a simple structure
        const page = { id, title: 'Sample Page', content: 'Sample content' }
        seoData = SEOGenerator.generatePageSEO(page as any)
      }
      
      if (!seoData) {
        throw new Error(`${type} with id ${id} not found`)
      }
      
      // TODO: Save to Google Sheets when implemented
      console.log(`Generated SEO for ${type} ${id}:`, seoData)
      
      toast.success(t('seo.singleSuccess'))
      return true
    } catch (error) {
      console.error('Error generating SEO:', error)
      toast.error(t('seo.singleError'))
      return false
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate SEO for all products
  const generateAllProductsSEO = async (): Promise<SEOGenerationResult> => {
    try {
      setIsGenerating(true)
      setProgress(0)
      
      const products = await jsonProductsService.getProducts()
      let success = 0
      let failed = 0
      const errors: string[] = []
      
      for (let i = 0; i < products.length; i++) {
        try {
          const product = products[i]
          const seoData = SEOGenerator.generateProductSEO(product)
          
          // TODO: Save to Google Sheets when implemented
          console.log(`Generated SEO for product ${product.id}:`, seoData)
          success++
        } catch (error) {
          failed++
          errors.push(`Product ${products[i].id}: ${error}`)
        }
        
        setProgress(Math.round(((i + 1) / products.length) * 100))
      }
      
      const result = { success, failed, errors }
      
      if (result.success > 0) {
        toast.success(t('seo.successProducts', { count: result.success }))
      }
      
      if (result.failed > 0) {
        toast.error(t('seo.failedProducts', { count: result.failed }))
      }
      
      return result
    } catch (error) {
      console.error('Error generating products SEO:', error)
      toast.error(t('seo.errorProducts'))
      return { success: 0, failed: 0, errors: [error as string] }
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  // Generate SEO for all categories
  const generateAllCategoriesSEO = async (): Promise<SEOGenerationResult> => {
    try {
      setIsGenerating(true)
      setProgress(0)
      
      const categories = await jsonCategoriesDataService.getCategories()
      let success = 0
      let failed = 0
      const errors: string[] = []
      
      for (let i = 0; i < categories.length; i++) {
        try {
          const category = categories[i]
          const seoData = SEOGenerator.generateCategorySEO(category)
          
          // TODO: Save to Google Sheets when implemented
          console.log(`Generated SEO for category ${category.id}:`, seoData)
          success++
        } catch (error) {
          failed++
          errors.push(`Category ${categories[i].id}: ${error}`)
        }
        
        setProgress(Math.round(((i + 1) / categories.length) * 100))
      }
      
      const result = { success, failed, errors }
      
      if (result.success > 0) {
        toast.success(t('seo.successCategories', { count: result.success }))
      }
      
      if (result.failed > 0) {
        toast.error(t('seo.failedCategories', { count: result.failed }))
      }
      
      return result
    } catch (error) {
      console.error('Error generating categories SEO:', error)
      toast.error(t('seo.errorCategories'))
      return { success: 0, failed: 0, errors: [error as string] }
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  // Generate SEO for all pages
  const generateAllPagesSEO = async (): Promise<SEOGenerationResult> => {
    try {
      setIsGenerating(true)
      setProgress(0)
      
      // Mock pages data since we don't have a pages service yet
      const mockPages = [
        { id: 'about', title: 'About Us', content: 'Learn more about SpiritHub Cafe' },
        { id: 'contact', title: 'Contact', content: 'Get in touch with us' },
        { id: 'privacy', title: 'Privacy Policy', content: 'Our privacy policy' }
      ]
      
      let success = 0
      let failed = 0
      const errors: string[] = []
      
      for (let i = 0; i < mockPages.length; i++) {
        try {
          const page = mockPages[i]
          const seoData = SEOGenerator.generatePageSEO(page as any)
          
          // TODO: Save to Google Sheets when implemented
          console.log(`Generated SEO for page ${page.id}:`, seoData)
          success++
        } catch (error) {
          failed++
          errors.push(`Page ${mockPages[i].id}: ${error}`)
        }
        
        setProgress(Math.round(((i + 1) / mockPages.length) * 100))
      }
      
      const result = { success, failed, errors }
      
      if (result.success > 0) {
        toast.success(t('seo.successPages', { count: result.success }))
      }
      
      if (result.failed > 0) {
        toast.error(t('seo.failedPages', { count: result.failed }))
      }
      
      return result
    } catch (error) {
      console.error('Error generating pages SEO:', error)
      toast.error(t('seo.errorPages'))
      return { success: 0, failed: 0, errors: [error as string] }
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  // Generate SEO for everything
  const generateAllSEO = async (): Promise<{
    products: SEOGenerationResult
    categories: SEOGenerationResult
    pages: SEOGenerationResult
  }> => {
    try {
      setIsGenerating(true)
      setProgress(0)
      
      toast.loading(t('seo.generatingAll'), { id: 'seo-generation' })
      
      // Generate for products
      setProgress(10)
      const productsResult = await generateAllProductsSEO()
      
      // Generate for categories
      setProgress(50)
      const categoriesResult = await generateAllCategoriesSEO()
      
      // Generate for pages
      setProgress(80)
      const pagesResult = await generateAllPagesSEO()
      
      setProgress(100)
      
      const totalSuccess = productsResult.success + categoriesResult.success + pagesResult.success
      const totalFailed = productsResult.failed + categoriesResult.failed + pagesResult.failed
      
      if (totalSuccess > 0) {
        toast.success(t('seo.successAll', { count: totalSuccess }), { id: 'seo-generation' })
      }
      
      if (totalFailed > 0) {
        toast.error(t('seo.failedAll', { count: totalFailed }), { id: 'seo-generation' })
      }
      
      return {
        products: productsResult,
        categories: categoriesResult,
        pages: pagesResult
      }
    } catch (error) {
      console.error('Error generating all SEO:', error)
      toast.error(t('seo.errorGeneral'), { id: 'seo-generation' })
      return {
        products: { success: 0, failed: 0, errors: [] },
        categories: { success: 0, failed: 0, errors: [] },
        pages: { success: 0, failed: 0, errors: [] }
      }
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  // Generate preview SEO without saving
  const generateSEOPreview = async (
    type: 'product' | 'category' | 'page',
    id: string
  ) => {
    try {
      // Get the item data and generate SEO preview
      if (type === 'product') {
        const products = await jsonProductsService.getProducts()
        const product = products.find((p: any) => p.id === id)
        if (product) {
          return SEOGenerator.generateProductSEO(product)
        }
      } else if (type === 'category') {
        const categories = await jsonCategoriesDataService.getCategories()
        const category = categories.find((c: any) => c.id === id)
        if (category) {
          return SEOGenerator.generateCategorySEO(category)
        }
      } else if (type === 'page') {
        const page = { id, title: 'Sample Page', content: 'Sample content' }
        return SEOGenerator.generatePageSEO(page as any)
      }
      
      return null
    } catch (error) {
      console.error('Error generating SEO preview:', error)
      toast.error(t('seo.errorPreview'))
      return null
    }
  }

  return {
    isGenerating,
    progress,
    generateSingleSEO,
    generateAllProductsSEO,
    generateAllCategoriesSEO,
    generateAllPagesSEO,
    generateAllSEO,
    generateSEOPreview
  }
}

export default useSEOGenerator
