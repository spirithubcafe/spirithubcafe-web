import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { firestoreService, type Product, type Category } from '@/lib/firebase'
import type { HeroSettings } from '@/types'
import { 
  type HomepageSettings, 
  type FooterSettings, 
  type CategoriesSettings,
  settingsService
} from '@/services/settings'
import { heroService } from '@/services/hero'

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000

interface CachedData<T> {
  data: T
  timestamp: number
}

interface DataCache {
  products: CachedData<Product[]> | null
  categories: CachedData<Category[]> | null
  homepageSettings: CachedData<HomepageSettings> | null
  footerSettings: CachedData<FooterSettings> | null
  categoriesSettings: CachedData<CategoriesSettings> | null
  heroSettings: CachedData<HeroSettings> | null
}

interface DataContextType {
  // Data
  products: Product[]
  categories: Category[]
  homepageSettings: HomepageSettings | null
  footerSettings: FooterSettings | null
  categoriesSettings: CategoriesSettings | null
  heroSettings: HeroSettings | null
  
  // Loading states
  loadingProducts: boolean
  loadingCategories: boolean
  loadingHomepageSettings: boolean
  loadingFooterSettings: boolean
  loadingCategoriesSettings: boolean
  loadingHeroSettings: boolean
  
  // Actions
  refreshProducts: () => Promise<void>
  refreshCategories: () => Promise<void>
  refreshHomepageSettings: () => Promise<void>
  refreshFooterSettings: () => Promise<void>
  refreshCategoriesSettings: () => Promise<void>
  refreshHeroSettings: () => Promise<void>
  refreshAllData: () => Promise<void>
  
  // Get specific product
  getProduct: (id: string) => Product | undefined
  getProductBySlug: (slug: string) => Product | undefined
  
  // Get specific category
  getCategory: (id: string) => Category | undefined
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [cache, setCache] = useState<DataCache>({
    products: null,
    categories: null,
    homepageSettings: null,
    footerSettings: null,
    categoriesSettings: null,
    heroSettings: null,
  })
  
  const [loadingStates, setLoadingStates] = useState({
    loadingProducts: true,
    loadingCategories: true,
    loadingHomepageSettings: true,
    loadingFooterSettings: true,
    loadingCategoriesSettings: true,
    loadingHeroSettings: true,
  })

  // Check if cache is valid
  const isCacheValid = <T,>(cachedData: CachedData<T> | null): boolean => {
    if (!cachedData) return false
    return Date.now() - cachedData.timestamp < CACHE_DURATION
  }

  // Update cache helper
  const updateCache = <K extends keyof DataCache>(key: K, data: any) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }))
  }

  // Update loading state helper
  const updateLoadingState = (key: keyof typeof loadingStates, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }

  // Load products
  const loadProducts = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.products)) {
      return
    }
    
    updateLoadingState('loadingProducts', true)
    try {
      const result = await firestoreService.products.list()
      const products = result.items
      updateCache('products', products)
    } catch (error) {
      console.error('Error loading products:', error)
      updateCache('products', [])
    } finally {
      updateLoadingState('loadingProducts', false)
    }
  }

  // Load categories
  const loadCategories = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.categories)) {
      return
    }
    
    updateLoadingState('loadingCategories', true)
    try {
      const result = await firestoreService.categories.list()
      const categories = result.items.filter(cat => cat.is_active)
      updateCache('categories', categories)
    } catch (error) {
      console.error('Error loading categories:', error)
      updateCache('categories', [])
    } finally {
      updateLoadingState('loadingCategories', false)
    }
  }

  // Load homepage settings
  const loadHomepageSettings = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.homepageSettings)) {
      return
    }
    
    updateLoadingState('loadingHomepageSettings', true)
    try {
      const settings = await settingsService.getHomepageSettings()
      updateCache('homepageSettings', settings)
    } catch (error) {
      console.error('Error loading homepage settings:', error)
      updateCache('homepageSettings', null)
    } finally {
      updateLoadingState('loadingHomepageSettings', false)
    }
  }

  // Load footer settings
  const loadFooterSettings = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.footerSettings)) {
      return
    }
    
    updateLoadingState('loadingFooterSettings', true)
    try {
      const settings = await settingsService.getFooterSettings()
      updateCache('footerSettings', settings)
    } catch (error) {
      console.error('Error loading footer settings:', error)
      updateCache('footerSettings', null)
    } finally {
      updateLoadingState('loadingFooterSettings', false)
    }
  }

  // Load categories settings
  const loadCategoriesSettings = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.categoriesSettings)) {
      return
    }
    
    updateLoadingState('loadingCategoriesSettings', true)
    try {
      const settings = await settingsService.getCategoriesSettings()
      updateCache('categoriesSettings', settings)
    } catch (error) {
      console.error('Error loading categories settings:', error)
      updateCache('categoriesSettings', null)
    } finally {
      updateLoadingState('loadingCategoriesSettings', false)
    }
  }

  // Load hero settings
  const loadHeroSettings = async (forceRefresh = false): Promise<void> => {
    if (!forceRefresh && isCacheValid(cache.heroSettings)) {
      return
    }
    
    updateLoadingState('loadingHeroSettings', true)
    try {
      const settings = await heroService.getHeroSettings()
      updateCache('heroSettings', settings)
    } catch (error) {
      console.error('Error loading hero settings:', error)
      updateCache('heroSettings', null)
    } finally {
      updateLoadingState('loadingHeroSettings', false)
    }
  }

  // Load all data on initial load
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadHomepageSettings(),
        loadFooterSettings(),
        loadCategoriesSettings(),
        loadHeroSettings(),
      ])
    }
    
    loadAllData()
  }, [])

  // Refresh functions
  const refreshProducts = () => loadProducts(true)
  const refreshCategories = () => loadCategories(true)
  const refreshHomepageSettings = () => loadHomepageSettings(true)
  const refreshFooterSettings = () => loadFooterSettings(true)
  const refreshCategoriesSettings = () => loadCategoriesSettings(true)
  const refreshHeroSettings = () => loadHeroSettings(true)
  
  const refreshAllData = async () => {
    await Promise.all([
      refreshProducts(),
      refreshCategories(),
      refreshHomepageSettings(),
      refreshFooterSettings(),
      refreshCategoriesSettings(),
      refreshHeroSettings(),
    ])
  }

  // Helper functions
  const getProduct = (id: string): Product | undefined => {
    return cache.products?.data.find(p => p.id === id)
  }

  const getProductBySlug = (slug: string): Product | undefined => {
    return cache.products?.data.find(p => p.slug === slug)
  }

  const getCategory = (id: string): Category | undefined => {
    return cache.categories?.data.find(c => c.id === id)
  }

  const value: DataContextType = {
    // Data
    products: cache.products?.data || [],
    categories: cache.categories?.data || [],
    homepageSettings: cache.homepageSettings?.data || null,
    footerSettings: cache.footerSettings?.data || null,
    categoriesSettings: cache.categoriesSettings?.data || null,
    heroSettings: cache.heroSettings?.data || null,
    
    // Loading states
    ...loadingStates,
    
    // Actions
    refreshProducts,
    refreshCategories,
    refreshHomepageSettings,
    refreshFooterSettings,
    refreshCategoriesSettings,
    refreshHeroSettings,
    refreshAllData,
    
    // Helpers
    getProduct,
    getProductBySlug,
    getCategory,
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

// Specific hooks for convenience
export function useProducts() {
  const { products, loadingProducts, refreshProducts, getProduct, getProductBySlug } = useData()
  return { products, loading: loadingProducts, refresh: refreshProducts, getProduct, getProductBySlug }
}

export function useCategories() {
  const { categories, loadingCategories, refreshCategories, getCategory } = useData()
  return { categories, loading: loadingCategories, refresh: refreshCategories, getCategory }
}

export function useGlobalHomepageSettings() {
  const { homepageSettings, loadingHomepageSettings, refreshHomepageSettings } = useData()
  return { settings: homepageSettings, loading: loadingHomepageSettings, refresh: refreshHomepageSettings }
}

export function useGlobalFooterSettings() {
  const { footerSettings, loadingFooterSettings, refreshFooterSettings } = useData()
  return { settings: footerSettings, loading: loadingFooterSettings, refresh: refreshFooterSettings }
}

export function useGlobalCategoriesSettings() {
  const { categoriesSettings, loadingCategoriesSettings, refreshCategoriesSettings } = useData()
  return { settings: categoriesSettings, loading: loadingCategoriesSettings, refresh: refreshCategoriesSettings }
}

export function useGlobalHeroSettings() {
  const { heroSettings, loadingHeroSettings, refreshHeroSettings } = useData()
  return { settings: heroSettings, loading: loadingHeroSettings, refresh: refreshHeroSettings }
}
