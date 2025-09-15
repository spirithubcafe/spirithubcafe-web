import type { Wishlist } from '@/types'

// Local storage key for wishlist data
const WISHLIST_STORAGE_KEY = 'spirithub_wishlist'

export class WishlistService {
  // Get wishlist from localStorage
  private getLocalWishlist(): Wishlist[] {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (!savedWishlist) return []
      
      const wishlistData = JSON.parse(savedWishlist)
      return Array.isArray(wishlistData) ? wishlistData : []
    } catch (error) {
      console.error('Error reading wishlist from localStorage:', error)
      return []
    }
  }

  // Save wishlist to localStorage
  private saveLocalWishlist(wishlist: Wishlist[]): void {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error)
    }
  }

  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<void> {
    try {
      // Check if product is already in wishlist
      const existing = await this.isInWishlist(userId, productId)
      if (existing) {
        throw new Error('Product already in wishlist')
      }

      const wishlist = this.getLocalWishlist()
      const newWishlistItem: Wishlist = {
        id: `${productId}_${Date.now()}_${Math.random()}`,
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      }

      wishlist.push(newWishlistItem)
      this.saveLocalWishlist(wishlist)
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(_userId: string, productId: string): Promise<void> {
    try {
      const wishlist = this.getLocalWishlist()
      const filteredWishlist = wishlist.filter(item => 
        !(item.product_id === productId)
      )
      
      this.saveLocalWishlist(filteredWishlist)
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  // Check if product is in wishlist
  async isInWishlist(_userId: string, productId: string): Promise<boolean> {
    try {
      const wishlist = this.getLocalWishlist()
      return wishlist.some(item => item.product_id === productId)
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  }

  // Get user's wishlist
  async getUserWishlist(_userId: string): Promise<Wishlist[]> {
    try {
      return this.getLocalWishlist()
    } catch (error) {
      console.error('Error getting wishlist:', error)
      return []
    }
  }

  // Toggle wishlist status
  async toggleWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const isInWishlist = await this.isInWishlist(userId, productId)
      
      if (isInWishlist) {
        await this.removeFromWishlist(userId, productId)
        return false
      } else {
        await this.addToWishlist(userId, productId)
        return true
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      throw error
    }
  }
}

export const wishlistService = new WishlistService()
