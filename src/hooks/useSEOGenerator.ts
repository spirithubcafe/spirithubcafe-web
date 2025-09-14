import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { SEOGenerator } from '@/services/seoGenerator'
import { firestoreService } from '@/lib/firebase'

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
      const seoData = await SEOGenerator.generateSingleItemSEO(type, id)
      
      // Update the item with SEO data
      switch (type) {
        case 'product':
          await firestoreService.products.update(id, {
            ...seoData,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          break
        case 'category':
          await firestoreService.categories.update(id, {
            ...seoData,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          break
        case 'page':
          await firestoreService.pages.update(id, {
            ...seoData,
            seo_auto_generated: true,
            seo_generated_at: new Date().toISOString()
          })
          break
      }
      
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
      
      const result = await SEOGenerator.autoGenerateAllProductsSEO()
      
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
      
      const result = await SEOGenerator.autoGenerateAllCategoriesSEO()
      
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
      
      const result = await SEOGenerator.autoGenerateAllPagesSEO()
      
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
      const productsResult = await SEOGenerator.autoGenerateAllProductsSEO()
      
      // Generate for categories
      setProgress(50)
      const categoriesResult = await SEOGenerator.autoGenerateAllCategoriesSEO()
      
      // Generate for pages
      setProgress(80)
      const pagesResult = await SEOGenerator.autoGenerateAllPagesSEO()
      
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
      return await SEOGenerator.generateSingleItemSEO(type, id)
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
