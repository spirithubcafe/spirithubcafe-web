// Dashboard Data Types - JSON based instead of Firebase

export interface Product {
  id: string
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  price?: number
  image?: string
  category_id?: string
  is_active?: boolean
  is_featured?: boolean
  is_new_arrival?: boolean
  stock_quantity?: number
  farm?: string
  farm_ar?: string
  roast_level?: string
  roast_level_ar?: string
  processing_method?: string
  altitude?: string
  altitude_ar?: string
  flavor_notes?: string
  flavor_notes_ar?: string
  intensity?: string
  intensity_ar?: string
  uses?: string
  uses_ar?: string
  sort_order?: number
  meta_title?: string
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  meta_keywords?: string
  meta_keywords_ar?: string
  og_title?: string
  og_title_ar?: string
  og_description?: string
  og_description_ar?: string
  twitter_title?: string
  twitter_title_ar?: string
  twitter_description?: string
  twitter_description_ar?: string
  twitter_image?: string
  created?: string
  updated?: string
}

export interface Category {
  id: string
  name: string
  name_ar?: string
  description?: string
  description_ar?: string
  image?: string
  is_active?: boolean
  sort_order?: number
  meta_title?: string
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  meta_keywords?: string
  meta_keywords_ar?: string
  og_title?: string
  og_title_ar?: string
  og_description?: string
  og_description_ar?: string
  twitter_title?: string
  twitter_title_ar?: string
  twitter_description?: string
  twitter_description_ar?: string
  created?: string
  updated?: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  role: 'admin' | 'user' | 'manager'
  is_active?: boolean
  email_verified?: boolean
  created: string
  updated?: string
  last_login?: string
  avatar?: string
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  preferences?: {
    language?: string
    theme?: string
    notifications?: boolean
  }
}

export interface SettingsData {
  id: string
  exported_at: string
  exported_from: string
  data: Record<string, any>
}

// Service interfaces for JSON file operations
export interface JSONDataService {
  // Products
  getProducts(): Promise<Product[]>
  updateProducts(products: Product[]): Promise<void>
  
  // Categories
  getCategories(): Promise<Category[]>
  updateCategories(categories: Category[]): Promise<void>
  
  // Settings
  getSettings(settingId: string): Promise<SettingsData | null>
  updateSettings(settingId: string, data: Record<string, any>): Promise<void>
  
  // Users (mock data for dashboard)
  getUsers(): Promise<UserProfile[]>
  updateUsers(users: UserProfile[]): Promise<void>
}
