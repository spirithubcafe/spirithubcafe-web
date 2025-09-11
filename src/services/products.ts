import { jsonProductsService, jsonCategoriesDataService } from '@/services/jsonSettingsService'
import { type Product, type Category } from '@/types'

export interface ProductFilters {
  category?: string
  featured?: boolean
  bestseller?: boolean
  new_arrival?: boolean
  on_sale?: boolean
  search?: string
}

export interface ProductsListOptions extends ProductFilters {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Simplified products service using JSON data
export const productsService = {
  // Get all products with filters and pagination
  async getProducts(options: ProductsListOptions = {}): Promise<PaginatedResponse<Product>> {
    try {
      const {
        page = 1,
        limit = 12,
        ...filters
      } = options

      let products = await jsonProductsService.getProducts()
      
      // Apply filters
      if (filters.category) {
        products = products.filter((p: Product) => String(p.category_id) === String(filters.category))
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        products = products.filter((p: Product) => 
          p.name.toLowerCase().includes(searchLower) ||
          (p.name_ar && p.name_ar.toLowerCase().includes(searchLower)) ||
          (p.description && p.description.toLowerCase().includes(searchLower))
        )
      }
      
      if (filters.featured) {
        products = products.filter((p: Product) => p.featured)
      }
      
      if (filters.bestseller) {
        products = products.filter((p: Product) => p.bestseller)
      }
      
      if (filters.new_arrival) {
        products = products.filter((p: Product) => p.new_arrival)
      }
      
      if (filters.on_sale) {
        products = products.filter((p: Product) => p.on_sale)
      }
      
      // Client-side pagination
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedData = products.slice(start, end)
      
      const total_pages = Math.ceil(products.length / limit)

      return {
        data: paginatedData,
        total: products.length,
        page,
        limit,
        total_pages
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 12,
        total_pages: 0
      }
    }
  },

  // Get single product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      return await jsonProductsService.getProduct(id)
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const result = await this.getProducts({ search: searchTerm })
      return result.data
    } catch (error) {
      console.error('Error searching products:', error)
      return []
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await this.getProducts({ featured: true, limit })
      return result.data
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  },

  // Get bestseller products
  async getBestsellerProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await this.getProducts({ bestseller: true, limit })
      return result.data
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      return []
    }
  },

  // Get new arrival products
  async getNewArrivalProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await this.getProducts({ new_arrival: true, limit })
      return result.data
    } catch (error) {
      console.error('Error fetching new arrival products:', error)
      return []
    }
  },

  // Get on sale products
  async getOnSaleProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await this.getProducts({ on_sale: true, limit })
      return result.data
    } catch (error) {
      console.error('Error fetching on sale products:', error)
      return []
    }
  },

  // Get related products (same category, different product)
  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    try {
      const result = await this.getProducts({ category: categoryId })
      const relatedProducts = result.data.filter(product => String(product.id) !== String(productId))
      return relatedProducts.slice(0, limit)
    } catch (error) {
      console.error('Error fetching related products:', error)
      return []
    }
  }
}

export const categoriesService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      return await jsonCategoriesDataService.getCategories()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  // Get single category
  async getCategory(id: string): Promise<Category | null> {
    try {
      return await jsonCategoriesDataService.getCategory(id)
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  }
}
