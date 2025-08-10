import { firestoreService, type Product, type Category } from '@/lib/firebase'

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

export const productsService = {
  // Get all products with filters and pagination
  async getProducts(options: ProductsListOptions = {}): Promise<PaginatedResponse<Product>> {
    try {
      const {
        page = 1,
        limit = 12,
        ...filters
      } = options

      const result = await firestoreService.products.list(filters)
      
      // Client-side pagination (for now)
      const start = (page - 1) * limit
      const end = start + limit
      const paginatedData = result.items.slice(start, end)
      
      const total_pages = Math.ceil(result.totalItems / limit)

      return {
        data: paginatedData,
        total: result.totalItems,
        page,
        limit,
        total_pages
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  // Get single product by ID
  async getProduct(id: string): Promise<Product | null> {
    try {
      return await firestoreService.products.get(id)
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list({ search: searchTerm })
      return result.items
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list({ featured: true })
      return result.items.slice(0, limit)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  },

  // Get bestseller products
  async getBestsellerProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list({ bestseller: true })
      return result.items.slice(0, limit)
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      throw error
    }
  },

  // Get new arrival products
  async getNewArrivalProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list({ new_arrival: true })
      return result.items.slice(0, limit)
    } catch (error) {
      console.error('Error fetching new arrival products:', error)
      throw error
    }
  },

  // Get on sale products
  async getOnSaleProducts(limit = 8): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list()
      const onSaleProducts = result.items.filter((product: any) => product.is_on_sale)
      return onSaleProducts.slice(0, limit)
    } catch (error) {
      console.error('Error fetching on sale products:', error)
      throw error
    }
  },

  // Get related products (same category, different product)
  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    try {
      const result = await firestoreService.products.list({ category: categoryId })
      const relatedProducts = result.items.filter((product: any) => product.id !== productId)
      return relatedProducts.slice(0, limit)
    } catch (error) {
      console.error('Error fetching related products:', error)
      throw error
    }
  },

  // Create a new product (admin only)
  async createProduct(productData: Omit<Product, 'id' | 'created' | 'updated'>): Promise<any> {
    try {
      return await firestoreService.products.create(productData)
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  // Update a product (admin only)
  async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      await firestoreService.products.update(id, productData)
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete a product (admin only)
  async deleteProduct(id: string): Promise<void> {
    try {
      await firestoreService.products.delete(id)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },
}

export const categoriesService = {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const result = await firestoreService.categories.list()
      return result.items
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get single category
  async getCategory(id: string): Promise<Category | null> {
    try {
      return await firestoreService.categories.get(id)
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  },

  // Create a new category (admin only)
  async createCategory(categoryData: Omit<Category, 'id' | 'created' | 'updated'>): Promise<any> {
    try {
      return await firestoreService.categories.create(categoryData)
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  },

  // Update a category (admin only)
  async updateCategory(id: string, categoryData: Partial<Category>): Promise<void> {
    try {
      await firestoreService.categories.update(id, categoryData)
    } catch (error) {
      console.error('Error updating category:', error)
      throw error
    }
  },

  // Delete a category (admin only)
  async deleteCategory(id: string): Promise<void> {
    try {
      await firestoreService.categories.delete(id)
    } catch (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  },
}
