import { db } from '@/lib/supabase'
import type { Product, Category, CoffeeOrigin, RoastLevelType, PaginatedResponse } from '@/types'

export interface ProductFilters {
  category_id?: number
  origin_id?: number
  roast_level_id?: number
  bean_type?: string
  featured?: boolean
  bestseller?: boolean
  new_arrival?: boolean
  on_sale?: boolean
  min_price?: number
  max_price?: number
  search?: string
  tag_ids?: number[]
}

export interface ProductsListOptions extends ProductFilters {
  page?: number
  limit?: number
  sort_by?: 'name' | 'price' | 'created_at' | 'rating'
  sort_order?: 'asc' | 'desc'
}

export const productsService = {
  // Get all products with filters and pagination
  async getProducts(options: ProductsListOptions = {}): Promise<PaginatedResponse<Product>> {
    try {
      const {
        page = 1,
        limit = 12,
        sort_by = 'created_at',
        sort_order = 'desc',
        ...filters
      } = options

      let query = db.products.list(filters)

      // Apply sorting
      const ascending = sort_order === 'asc'
      query = query.order(sort_by, { ascending })

      // Apply pagination
      const start = (page - 1) * limit
      const end = start + limit - 1
      query = query.range(start, end)

      const { data: products, error, count } = await query

      if (error) {
        throw error
      }

      const total_pages = count ? Math.ceil(count / limit) : 0

      return {
        data: (products || []) as unknown as Product[],
        total: count || 0,
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
  async getProduct(id: number): Promise<Product | null> {
    try {
      const { data: product, error } = await db.products.get(id)
      
      if (error) {
        throw error
      }

      return product as unknown as Product
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  },

  // Get single product by slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const { data: product, error } = await db.products.getBySlug(slug)
      
      if (error) {
        throw error
      }

      return product as unknown as Product
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      throw error
    }
  },

  // Search products
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.search(searchTerm)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  },

  // Get featured products
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.list({ featured: true })
        .limit(limit)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  },

  // Get bestseller products
  async getBestsellerProducts(limit = 8): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.list({ bestseller: true })
        .limit(limit)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error fetching bestseller products:', error)
      throw error
    }
  },

  // Get new arrival products
  async getNewArrivalProducts(limit = 8): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.list({ new_arrival: true })
        .limit(limit)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error fetching new arrival products:', error)
      throw error
    }
  },

  // Get on sale products
  async getOnSaleProducts(limit = 8): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.list({ on_sale: true })
        .limit(limit)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error fetching on sale products:', error)
      throw error
    }
  },

  // Get related products (same category, different product)
  async getRelatedProducts(productId: number, categoryId: number, limit = 4): Promise<Product[]> {
    try {
      const { data: products, error } = await db.products.list({ category_id: categoryId })
        .neq('id', productId)
        .limit(limit)
      
      if (error) {
        throw error
      }

      return (products || []) as unknown as Product[]
    } catch (error) {
      console.error('Error fetching related products:', error)
      throw error
    }
  },

  // Create a new product (admin only)
  async createProduct(productData: any): Promise<Product> {
    try {
      const { data: product, error } = await db.products.create(productData)
      
      if (error) {
        throw error
      }

      return product as unknown as Product
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  // Update a product (admin only)
  async updateProduct(id: number, productData: any): Promise<void> {
    try {
      const { error } = await db.products.update(id, productData)
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  // Delete a product (admin only)
  async deleteProduct(id: number): Promise<void> {
    try {
      const { error } = await db.products.delete(id)
      
      if (error) {
        throw error
      }
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
      const { data: categories, error } = await db.categories.list()
      
      if (error) {
        throw error
      }

      return (categories || []) as unknown as Category[]
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  // Get single category
  async getCategory(id: number): Promise<Category | null> {
    try {
      const { data: category, error } = await db.categories.get(id)
      
      if (error) {
        throw error
      }

      return category as unknown as Category
    } catch (error) {
      console.error('Error fetching category:', error)
      throw error
    }
  },
}

export const coffeeOriginsService = {
  // Get all coffee origins
  async getCoffeeOrigins(): Promise<CoffeeOrigin[]> {
    try {
      const { data: origins, error } = await db.coffeeOrigins.list()
      
      if (error) {
        throw error
      }

      return (origins || []) as unknown as CoffeeOrigin[]
    } catch (error) {
      console.error('Error fetching coffee origins:', error)
      throw error
    }
  },

  // Get single coffee origin
  async getCoffeeOrigin(id: number): Promise<CoffeeOrigin | null> {
    try {
      const { data: origin, error } = await db.coffeeOrigins.get(id)
      
      if (error) {
        throw error
      }

      return origin as unknown as CoffeeOrigin
    } catch (error) {
      console.error('Error fetching coffee origin:', error)
      throw error
    }
  },
}

export const roastLevelsService = {
  // Get all roast levels
  async getRoastLevels(): Promise<RoastLevelType[]> {
    try {
      const { data: levels, error } = await db.roastLevels.list()
      
      if (error) {
        throw error
      }

      return (levels || []) as unknown as RoastLevelType[]
    } catch (error) {
      console.error('Error fetching roast levels:', error)
      throw error
    }
  },

  // Get single roast level
  async getRoastLevel(id: number): Promise<RoastLevelType | null> {
    try {
      const { data: level, error } = await db.roastLevels.get(id)
      
      if (error) {
        throw error
      }

      return level as unknown as RoastLevelType
    } catch (error) {
      console.error('Error fetching roast level:', error)
      throw error
    }
  },
}
