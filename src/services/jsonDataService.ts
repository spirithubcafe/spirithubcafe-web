import type { Product, Category, UserProfile, SettingsData, JSONDataService } from '@/types/dashboard'
import { backendAPI } from './backendAPI'

class JSONDataServiceImpl implements JSONDataService {
  private baseUrl = '/data'

  // Helper method to fetch JSON data
  private async fetchJSON<T>(filename: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/${filename}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${filename}:`, error)
      throw error
    }
  }

  // Helper method to save JSON data through backend API
  private async saveJSON<T>(filename: string, data: T): Promise<void> {
    try {
      const result = await backendAPI.saveJSONData(filename, data)
      
      if (result.success) {
        alert(result.message)
      } else {
        alert(result.message)
        console.error('Save failed:', result.error)
      }
    } catch (error) {
      console.error(`Error saving ${filename}:`, error)
      alert(`❌ خطا در ذخیره فایل ${filename}\n❌ Error saving file ${filename}`)
      throw error
    }
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.fetchJSON<Product[]>('products.json')
  }

  async updateProducts(products: Product[]): Promise<void> {
    return this.saveJSON('products.json', products)
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.fetchJSON<Category[]>('categories.json')
  }

  async updateCategories(categories: Category[]): Promise<void> {
    return this.saveJSON('categories.json', categories)
  }

  // Settings
  async getSettings(settingId: string): Promise<SettingsData | null> {
    try {
      return await this.fetchJSON<SettingsData>(`${settingId}-settings.json`)
    } catch (error) {
      console.warn(`Settings file ${settingId}-settings.json not found`)
      return null
    }
  }

  async updateSettings(settingId: string, data: Record<string, any>): Promise<void> {
    const settingsData: SettingsData = {
      id: settingId,
      exported_at: new Date().toISOString(),
      exported_from: 'dashboard_editor',
      data
    }
    return this.saveJSON(`${settingId}-settings.json`, settingsData)
  }

  // Users (mock data for dashboard - in real app this would come from your auth system)
  async getUsers(): Promise<UserProfile[]> {
    // Check if we have any saved user data in localStorage
    const savedUsers = localStorage.getItem('dashboard_users.json')
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers)
      } catch (error) {
        console.warn('Error parsing saved users data:', error)
      }
    }

    // Return mock data if no saved data
    return [
      {
        id: '1',
        email: 'admin@spirithubcafe.com',
        name: 'Admin User',
        role: 'admin',
        is_active: true,
        email_verified: true,
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        last_login: new Date().toISOString()
      },
      {
        id: '2',
        email: 'manager@spirithubcafe.com',
        name: 'Manager User',
        role: 'manager',
        is_active: true,
        email_verified: true,
        created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        last_login: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '3',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        is_active: true,
        email_verified: true,
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        last_login: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ]
  }

  async updateUsers(users: UserProfile[]): Promise<void> {
    return this.saveJSON('users.json', users)
  }
}

// Export singleton instance
export const jsonDataService = new JSONDataServiceImpl()

// Export types for convenience
export type { Product, Category, UserProfile, SettingsData } from '@/types/dashboard'
