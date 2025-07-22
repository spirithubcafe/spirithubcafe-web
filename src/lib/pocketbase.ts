import PocketBase from 'pocketbase'

// Initialize PocketBase client
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090')

// Types for our collections
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'admin' | 'user'
  avatar?: string
  created: string
  updated: string
}

export interface Category {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  image?: string
  is_active: boolean
  sort_order: number
  created: string
  updated: string
}

export interface Product {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  category: string // relation to categories
  price_usd: number
  price_omr?: number
  price_sar?: number
  sale_price_usd?: number
  sale_price_omr?: number
  sale_price_sar?: number
  image?: string
  gallery: string[] // file field for multiple images
  is_active: boolean
  is_featured: boolean
  is_bestseller: boolean
  is_new_arrival: boolean
  is_on_sale: boolean
  stock_quantity: number
  sku?: string
  weight?: number
  sort_order: number
  meta_title?: string
  meta_description?: string
  created: string
  updated: string
}

export interface CartItem {
  id: string
  user: string // relation to users
  product: string // relation to products
  quantity: number
  created: string
  updated: string
}

export interface Order {
  id: string
  user: string // relation to users
  order_number: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  total_usd: number
  total_omr?: number
  total_sar?: number
  currency: 'USD' | 'OMR' | 'SAR'
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address?: string
  notes?: string
  created: string
  updated: string
}

export interface OrderItem {
  id: string
  order: string // relation to orders
  product: string // relation to products
  quantity: number
  unit_price_usd: number
  unit_price_omr?: number
  unit_price_sar?: number
  total_price_usd: number
  total_price_omr?: number
  total_price_sar?: number
  created: string
  updated: string
}

// Auth helpers
export const auth = {
  login: async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      return { success: true, user: authData.record }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  register: async (email: string, password: string, userData: { full_name: string; phone?: string }) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        full_name: userData.full_name,
        phone: userData.phone,
        role: 'user'
      }
      
      const user = await pb.collection('users').create(data)
      
      // Auto-login after registration
      await pb.collection('users').authWithPassword(email, password)
      
      return { success: true, user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  logout: () => {
    pb.authStore.clear()
    return Promise.resolve()
  },

  getCurrentUser: () => {
    return pb.authStore.model as User | null
  },

  isAuthenticated: () => {
    return pb.authStore.isValid
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return pb.authStore.onChange((_, model) => {
      callback(model as User | null)
    })
  }
}

// Database helpers
export const db = {
  // Categories
  categories: {
    list: () => pb.collection('categories').getList(1, 50, {
      filter: 'is_active = true',
      sort: '+sort_order'
    }),
    
    get: (id: string) => pb.collection('categories').getOne(id),
    
    create: (data: Partial<Category>) => pb.collection('categories').create(data),
    
    update: (id: string, data: Partial<Category>) => pb.collection('categories').update(id, data),
    
    delete: (id: string) => pb.collection('categories').delete(id)
  },

  // Products
  products: {
    list: (filters?: { category?: string; featured?: boolean; search?: string }) => {
      let filter = 'is_active = true'
      
      if (filters?.category) {
        filter += ` && category = "${filters.category}"`
      }
      
      if (filters?.featured) {
        filter += ' && is_featured = true'
      }
      
      if (filters?.search) {
        filter += ` && (name ~ "${filters.search}" || name_ar ~ "${filters.search}")`
      }
      
      return pb.collection('products').getList(1, 50, {
        filter,
        sort: '+sort_order,-created',
        expand: 'category'
      })
    },
    
    get: (id: string) => pb.collection('products').getOne(id, {
      expand: 'category'
    }),
    
    create: (data: Partial<Product>) => pb.collection('products').create(data),
    
    update: (id: string, data: Partial<Product>) => pb.collection('products').update(id, data),
    
    delete: (id: string) => pb.collection('products').delete(id)
  },

  // Cart
  cart: {
    getUserCart: (userId: string) => pb.collection('cart_items').getList(1, 50, {
      filter: `user = "${userId}"`,
      expand: 'product,product.category'
    }),
    
    addItem: (userId: string, productId: string, quantity: number = 1) => {
      return pb.collection('cart_items').create({
        user: userId,
        product: productId,
        quantity
      })
    },
    
    updateQuantity: (itemId: string, quantity: number) => {
      return pb.collection('cart_items').update(itemId, { quantity })
    },
    
    removeItem: (itemId: string) => {
      return pb.collection('cart_items').delete(itemId)
    },
    
    clearCart: (userId: string) => {
      return pb.collection('cart_items').getList(1, 50, {
        filter: `user = "${userId}"`
      }).then(result => {
        const deletePromises = result.items.map(item => 
          pb.collection('cart_items').delete(item.id)
        )
        return Promise.all(deletePromises)
      })
    }
  },

  // Orders
  orders: {
    list: (userId?: string) => {
      const filter = userId ? `user = "${userId}"` : ''
      return pb.collection('orders').getList(1, 50, {
        filter,
        sort: '-created',
        expand: 'user'
      })
    },
    
    get: (id: string) => pb.collection('orders').getOne(id, {
      expand: 'user'
    }),
    
    create: (data: Partial<Order>) => pb.collection('orders').create(data),
    
    update: (id: string, data: Partial<Order>) => pb.collection('orders').update(id, data)
  },

  // Order Items
  orderItems: {
    getByOrder: (orderId: string) => pb.collection('order_items').getList(1, 50, {
      filter: `order = "${orderId}"`,
      expand: 'product'
    }),
    
    create: (data: Partial<OrderItem>) => pb.collection('order_items').create(data)
  }
}

// File upload helpers
export const files = {
  upload: async (collection: string, recordId: string, fieldName: string, file: File) => {
    const formData = new FormData()
    formData.append(fieldName, file)
    
    return pb.collection(collection).update(recordId, formData)
  },
  
  getUrl: (record: any, filename: string, thumb?: { thumb: string }) => {
    return pb.files.getUrl(record, filename, thumb)
  },
  
  delete: async (collection: string, recordId: string, fieldName: string) => {
    const data = { [fieldName]: null }
    return pb.collection(collection).update(recordId, data)
  }
}

export default pb
