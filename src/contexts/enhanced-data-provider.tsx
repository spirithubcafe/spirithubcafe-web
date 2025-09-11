import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jsonProductsService, jsonCategoriesDataService } from '@/services/jsonSettingsService'
import { type Product, type Category } from '@/types'
import type { HeroSettings } from '@/types'
import { 
  type HomepageSettings, 
  type FooterSettings, 
  type CategoriesSettings,
  type NewsletterSettings,
  settingsService
} from '@/services/settings'
import { heroService } from '@/services/hero'
import { useAdvancedCache } from '@/hooks/useAdvancedCache'

interface DataContextType {
  // Data
  products: Product[]
  categories: Category[]
  homepageSettings: HomepageSettings | null
  footerSettings: FooterSettings | null
  categoriesSettings: CategoriesSettings | null
  heroSettings: HeroSettings | null
  newsletterSettings: NewsletterSettings | null
  
  // Loading states
  loadingProducts: boolean
  loadingCategories: boolean
  loadingHomepageSettings: boolean
  loadingFooterSettings: boolean
  loadingCategoriesSettings: boolean
  loadingHeroSettings: boolean
  loadingNewsletterSettings: boolean
  
  // Overall loading state
  isInitialLoading: boolean
  
  // Actions
  refreshProducts: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshHomepageSettings: () => Promise<void>
  refreshFooterSettings: () => Promise<void>
  refreshCategoriesSettings: () => Promise<void>
  refreshHeroSettings: () => Promise<void>
  refreshNewsletterSettings: () => Promise<void>
  refreshAllData: () => Promise<void>
  
  // Get specific product
  getProduct: (id: string) => Product | undefined
  getProductBySlug: (slug: string) => Product | undefined
  
  // Get specific category
  getCategory: (id: string) => Category | undefined
  
  // Cache management
  clearDataCache: () => void
  // preloadCriticalData removed to avoid API calls
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Products cache
  const {
    data: productsData,
    loading: loadingProducts,
    refetch: refreshProducts,
    invalidate: invalidateProducts
  } = useAdvancedCache(
    'products',
    async () => {
      const products = await jsonProductsService.getProducts()
      return products
    },
    {
      ttl: 10 * 60 * 1000, // 10 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'high',
      tags: ['products', 'critical']
    }
  )

  // Categories cache
  const {
    data: categoriesData,
    loading: loadingCategories,
    refetch: refreshCategories,
    invalidate: invalidateCategories
  } = useAdvancedCache(
    'categories',
    async () => {
      const categories = await jsonCategoriesDataService.getCategories()
      return categories
    },
    {
      ttl: 15 * 60 * 1000, // 15 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'high',
      tags: ['categories', 'critical']
    }
  )

  // Type-safe data with fallbacks
  const products = (productsData as Product[]) || []
  const categories = (categoriesData as Category[]) || []

  // Homepage settings cache
  const {
    data: homepageSettings,
    loading: loadingHomepageSettings,
    refetch: refreshHomepageSettings,
    invalidate: invalidateHomepageSettings
  } = useAdvancedCache(
    'homepage-settings',
    () => settingsService.getHomepageSettings(),
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'medium',
      tags: ['settings', 'homepage']
    }
  )

  // Footer settings cache
  const {
    data: footerSettings,
    loading: loadingFooterSettings,
    refetch: refreshFooterSettings,
    invalidate: invalidateFooterSettings
  } = useAdvancedCache(
    'footer-settings',
    () => settingsService.getFooterSettings(),
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'medium',
      tags: ['settings', 'footer']
    }
  )

  // Categories settings cache
  const {
    data: categoriesSettings,
    loading: loadingCategoriesSettings,
    refetch: refreshCategoriesSettings,
    invalidate: invalidateCategoriesSettings
  } = useAdvancedCache(
    'categories-settings',
    () => settingsService.getCategoriesSettings(),
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'medium',
      tags: ['settings', 'categories']
    }
  )

  // Hero settings cache
  const {
    data: heroSettings,
    loading: loadingHeroSettings,
    refetch: refreshHeroSettings,
    invalidate: invalidateHeroSettings
  } = useAdvancedCache(
    'hero-settings',
    () => heroService.getHeroSettings(),
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'medium',
      tags: ['settings', 'hero']
    }
  )

  // Newsletter settings cache
  const {
    data: newsletterSettings,
    loading: loadingNewsletterSettings,
    refetch: refreshNewsletterSettings,
    invalidate: invalidateNewsletterSettings
  } = useAdvancedCache(
    'newsletter-settings',
    () => settingsService.getNewsletterSettings(),
    {
      ttl: 30 * 60 * 1000, // 30 minutes
      staleWhileRevalidate: true,
      persist: true,
      priority: 'medium',
      tags: ['settings', 'newsletter']
    }
  )

  // Calculate overall loading state
  useEffect(() => {
    // Consider initial loading complete when critical data is loaded
    const criticalLoading = loadingProducts || loadingCategories
    
    setIsInitialLoading(criticalLoading)
  }, [
    loadingProducts,
    loadingCategories,
    loadingHomepageSettings,
    loadingFooterSettings,
    loadingCategoriesSettings,
    loadingHeroSettings,
    loadingNewsletterSettings
  ])

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.allSettled([
      refreshProducts(),
      refreshCategories(),
      refreshHomepageSettings(),
      refreshFooterSettings(),
      refreshCategoriesSettings(),
      refreshHeroSettings(),
      refreshNewsletterSettings()
    ])
  }

  // Get specific product
  const getProduct = (id: string): Product | undefined => {
    return products.find(product => String(product.id) === String(id))
  }

  // Get product by slug
  const getProductBySlug = (slug: string): Product | undefined => {
    return products.find(product => product.slug === slug)
  }

  // Get specific category
  const getCategory = (id: string): Category | undefined => {
    return categories.find(category => String(category.id) === String(id))
  }

  // Clear all data cache
  const clearDataCache = () => {
    invalidateProducts()
    invalidateCategories()
    invalidateHomepageSettings()
    invalidateFooterSettings()
    invalidateCategoriesSettings()
    invalidateHeroSettings()
    invalidateNewsletterSettings()
  }

  // Preload functionality disabled to avoid API calls
  // const preloadCriticalData = async () => {
  //   const criticalUrls = [
  //     '/api/products',
  //     '/api/categories',
  //     '/api/settings/homepage'
  //   ]
  //   
  //   await advancedCacheManager.preload(criticalUrls, {
  //     ttl: 15 * 60 * 1000,
  //     priority: 'high',
  //     persist: true,
  //     tags: ['critical', 'preload']
  //   })
  // }

  // Preload critical data on mount - DISABLED
  // useEffect(() => {
  //   preloadCriticalData()
  // }, [])

  const value: DataContextType = {
    // Data
    products,
    categories,
    homepageSettings,
    footerSettings,
    categoriesSettings,
    heroSettings,
    newsletterSettings,
    
    // Loading states
    loadingProducts,
    loadingCategories,
    loadingHomepageSettings,
    loadingFooterSettings,
    loadingCategoriesSettings,
    loadingHeroSettings,
    loadingNewsletterSettings,
    isInitialLoading,
    
    // Actions
    refreshProducts,
    refreshCategories,
    refreshHomepageSettings,
    refreshFooterSettings,
    refreshCategoriesSettings,
    refreshHeroSettings,
    refreshNewsletterSettings,
    refreshAllData,
    
    // Getters
    getProduct,
    getProductBySlug,
    getCategory,
    
    // Cache management
    clearDataCache
    // preloadCriticalData removed to avoid API calls
  }

 

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Convenience hooks for backward compatibility
export function useProducts() {
  const { products, loadingProducts } = useData()
  return { products, loading: loadingProducts }
}

export function useCategories() {
  const { categories, loadingCategories } = useData()
  return { categories, loading: loadingCategories }
}

export function useGlobalHomepageSettings() {
  const { homepageSettings, loadingHomepageSettings } = useData()
  return { settings: homepageSettings, loading: loadingHomepageSettings }
}

export function useFooterSettings() {
  const { footerSettings, loadingFooterSettings } = useData()
  return { settings: footerSettings, loading: loadingFooterSettings }
}

export function useCategoriesSettings() {
  const { categoriesSettings, loadingCategoriesSettings } = useData()
  return { settings: categoriesSettings, loading: loadingCategoriesSettings }
}

export function useHeroSettings() {
  const { heroSettings, loadingHeroSettings } = useData()
  return { settings: heroSettings, loading: loadingHeroSettings }
}

export function useNewsletterSettings() {
  const { newsletterSettings, loadingNewsletterSettings } = useData()
  return { settings: newsletterSettings, loading: loadingNewsletterSettings }
}

// For backward compatibility with old hook names
export function useGlobalNewsletterSettings() {
  return useNewsletterSettings()
}

// Export for backward compatibility
export { DataProvider as default }
