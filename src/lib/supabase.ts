import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Create and export the Supabase client with TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Auth helpers
export const auth = {
  signUp: (email: string, password: string, userData?: any) => 
    supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: userData
      }
    }),
  
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  
  signOut: () => supabase.auth.signOut(),
  
  getUser: () => supabase.auth.getUser(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
}

// Database helpers
export const db = {
  // Profiles
  profiles: {
    get: (id: string) => 
      supabase.from('profiles').select('*').eq('id', id).single(),
    
    update: (id: string, data: any) => 
      supabase.from('profiles').update(data).eq('id', id),
    
    list: () => 
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
  },

  // Categories
  categories: {
    list: () => 
      supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
    
    get: (id: number) => 
      supabase.from('categories').select('*').eq('id', id).single(),
  },

  // Coffee Origins
  coffeeOrigins: {
    list: () => 
      supabase.from('coffee_origins').select('*').order('name'),
    
    get: (id: number) => 
      supabase.from('coffee_origins').select('*').eq('id', id).single(),
  },

  // Roast Levels
  roastLevels: {
    list: () => 
      supabase.from('roast_levels').select('*').order('id'),
    
    get: (id: number) => 
      supabase.from('roast_levels').select('*').eq('id', id).single(),
  },

  // Products
  products: {
    list: (filters?: any) => {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          origin:coffee_origins(*),
          roast_level:roast_levels(*),
          variants:product_variants(*),
          tags:product_tag_relations(tag:product_tags(*))
        `)
        .eq('is_active', true)

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters?.featured) {
        query = query.eq('featured', true)
      }
      if (filters?.bestseller) {
        query = query.eq('bestseller', true)
      }
      if (filters?.new_arrival) {
        query = query.eq('new_arrival', true)
      }
      if (filters?.on_sale) {
        query = query.eq('on_sale', true)
      }

      return query.order('sort_order').order('created_at', { ascending: false })
    },
    
    get: (id: number) => 
      supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          origin:coffee_origins(*),
          roast_level:roast_levels(*),
          variants:product_variants(*),
          reviews:product_reviews(*, user:profiles(*)),
          tags:product_tag_relations(tag:product_tags(*))
        `)
        .eq('id', id)
        .single(),
    
    getBySlug: (slug: string) => 
      supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          origin:coffee_origins(*),
          roast_level:roast_levels(*),
          variants:product_variants(*),
          reviews:product_reviews(*, user:profiles(*)),
          tags:product_tag_relations(tag:product_tags(*))
        `)
        .eq('slug', slug)
        .single(),

    create: (data: any) => 
      supabase.from('products').insert(data).select().single(),
    
    update: (id: number, data: any) => 
      supabase.from('products').update(data).eq('id', id),
    
    delete: (id: number) => 
      supabase.from('products').delete().eq('id', id),

    search: (searchTerm: string) =>
      supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          origin:coffee_origins(*),
          roast_level:roast_levels(*)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('name'),
  },

  // Cart
  cart: {
    get: (userId: string) => 
      supabase
        .from('carts')
        .select(`
          *,
          items:cart_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `)
        .eq('user_id', userId)
        .single(),
    
    create: (data: { user_id: string }) => 
      supabase.from('carts').insert(data).select().single(),
    
    addItem: (cartId: number, productId: number, quantity: number, variantId?: number) => 
      supabase.from('cart_items').upsert({
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
      }),
    
    updateItem: (itemId: number, quantity: number) => 
      supabase.from('cart_items').update({ quantity }).eq('id', itemId),
    
    removeItem: (itemId: number) => 
      supabase.from('cart_items').delete().eq('id', itemId),
    
    clear: (cartId: number) => 
      supabase.from('cart_items').delete().eq('cart_id', cartId),
  },

  // Wishlist
  wishlist: {
    get: (userId: string) => 
      supabase
        .from('wishlists')
        .select('*, product:products(*)')
        .eq('user_id', userId),
    
    add: (userId: string, productId: number) => 
      supabase.from('wishlists').insert({ user_id: userId, product_id: productId }),
    
    remove: (userId: string, productId: number) => 
      supabase.from('wishlists').delete().eq('user_id', userId).eq('product_id', productId),
  },

  // Addresses
  addresses: {
    list: (userId: string) => 
      supabase.from('addresses').select('*').eq('user_id', userId).eq('is_active', true),
    
    get: (id: number) => 
      supabase.from('addresses').select('*').eq('id', id).single(),
    
    create: (data: any) => 
      supabase.from('addresses').insert(data).select().single(),
    
    update: (id: number, data: any) => 
      supabase.from('addresses').update(data).eq('id', id),
    
    delete: (id: number) => 
      supabase.from('addresses').update({ is_active: false }).eq('id', id),
  },

  // Orders
  orders: {
    list: (userId?: string) => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:profiles(*),
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*),
          shipping_method:shipping_methods(*),
          items:order_items(*, product:products(*), variant:product_variants(*))
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      return query
    },
    
    get: (id: number) => 
      supabase
        .from('orders')
        .select(`
          *,
          user:profiles(*),
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*),
          shipping_method:shipping_methods(*),
          items:order_items(*, product:products(*), variant:product_variants(*)),
          payments:payments(*),
          status_history:order_status_history(*, user:profiles(*))
        `)
        .eq('id', id)
        .single(),
    
    create: (data: any) => 
      supabase.from('orders').insert(data).select().single(),
    
    update: (id: number, data: any) => 
      supabase.from('orders').update(data).eq('id', id),
    
    updateStatus: (id: number, status: string, note?: string) => 
      supabase.from('order_status_history').insert({
        order_id: id,
        status,
        note,
        created_by: null // Will be set by database if user is authenticated
      }),
  },

  // Shipping Methods
  shippingMethods: {
    list: () => 
      supabase
        .from('shipping_methods')
        .select('*, zone:shipping_zones(*)')
        .eq('is_active', true)
        .order('sort_order'),
  },

  // Coupons
  coupons: {
    validate: (code: string) => 
      supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single(),
  },

  // Reviews
  reviews: {
    create: (data: any) => 
      supabase.from('product_reviews').insert(data).select().single(),
    
    list: (productId: number) => 
      supabase
        .from('product_reviews')
        .select('*, user:profiles(*)')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false }),
  },

  // Tickets
  tickets: {
    list: (userId?: string) => {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          user:profiles(*),
          order:orders(*),
          messages:ticket_messages(*, user:profiles(*))
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      return query
    },
    
    get: (id: number) => 
      supabase
        .from('tickets')
        .select(`
          *,
          user:profiles(*),
          order:orders(*),
          messages:ticket_messages(*, user:profiles(*))
        `)
        .eq('id', id)
        .single(),
    
    create: (data: any) => 
      supabase.from('tickets').insert(data).select().single(),
    
    addMessage: async (ticketId: number, message: string, attachments?: string[]) => {
      const { data: { user } } = await supabase.auth.getUser()
      return supabase.from('ticket_messages').insert({
        ticket_id: ticketId,
        message,
        attachments,
        user_id: user?.id,
      })
    },
  },

  // Newsletter
  newsletter: {
    subscribe: (email: string, name?: string) => 
      supabase.from('newsletter_subscribers').insert({ email, name }),
    
    unsubscribe: (email: string) => 
      supabase.from('newsletter_subscribers').update({ 
        is_active: false, 
        unsubscribed_at: new Date().toISOString() 
      }).eq('email', email),
  },

  // Blog
  blog: {
    list: () => 
      supabase
        .from('blog_posts')
        .select('*, author:profiles(*)')
        .eq('is_published', true)
        .order('published_at', { ascending: false }),
    
    get: (slug: string) => 
      supabase
        .from('blog_posts')
        .select('*, author:profiles(*)')
        .eq('slug', slug)
        .eq('is_published', true)
        .single(),
  },

  // Static Pages
  pages: {
    get: (slug: string) => 
      supabase
        .from('static_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single(),
  },

  // Settings
  settings: {
    get: (key: string) => 
      supabase.from('settings').select('value').eq('key', key).single(),
    
    getAll: () => 
      supabase.from('settings').select('*'),
  },
}
