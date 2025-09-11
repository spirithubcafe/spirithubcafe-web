import { wishlistStorage } from '@/utils/localStorage'
import type { Wishlist } from '@/types'

export class WishlistService {
  private listeners: Set<(wishlist: Wishlist[]) => void> = new Set()

  // Add product to wishlist
  async addToWishlist(_userId: string, productId: string): Promise<void> {
    try {
      // Check if product is already in wishlist
      const existing = await this.isInWishlist(_userId, productId)
      if (existing) {
        throw new Error('Product already in wishlist')
      }

      const newItem = wishlistStorage.addItem(productId)
      if (!newItem) {
        throw new Error('Product already in wishlist')
      }

      // Notify listeners
      this.notifyListeners()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(_userId: string, productId: string): Promise<void> {
    try {
      const removed = wishlistStorage.removeItem(productId)
      if (!removed) {
        console.warn('Product not found in wishlist:', productId)
      }

      // Notify listeners
      this.notifyListeners()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  // Check if product is in wishlist
  async isInWishlist(_userId: string, productId: string): Promise<boolean> {
    try {
      return wishlistStorage.isInWishlist(productId)
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  }

  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    try {
      const localItems = wishlistStorage.getItems()
      return localItems.map(item => ({
        id: item.id,
        user_id: userId,
        product_id: item.productId,
        created_at: item.addedAt
      } as Wishlist))
    } catch (error) {
      console.error('Error getting wishlist:', error)
      return []
    }
  }

  // Subscribe to wishlist changes
  subscribeToWishlist(userId: string, callback: (wishlist: Wishlist[]) => void): () => void {
    try {
      // Add listener
      this.listeners.add(callback)
      
      // Initial call with current data
      this.getUserWishlist(userId).then(callback)

      // Return unsubscribe function
      return () => {
        this.listeners.delete(callback)
      }
    } catch (error) {
      console.error('Error subscribing to wishlist:', error)
      return () => {}
    }
  }

  // Toggle wishlist status
  async toggleWishlist(_userId: string, productId: string): Promise<boolean> {
    try {
      const isAdded = wishlistStorage.toggleItem(productId)
      
      // Notify listeners
      this.notifyListeners()
      
      return isAdded
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      throw error
    }
  }

  // Private method to notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(async (callback) => {
      try {
        const wishlist = await this.getUserWishlist('') // userId not needed for localStorage
        callback(wishlist)
      } catch (error) {
        console.error('Error notifying wishlist listener:', error)
      }
    })
  }

  // Clear all wishlist items (utility method)
  async clearWishlist(): Promise<void> {
    try {
      wishlistStorage.clearItems()
      this.notifyListeners()
    } catch (error) {
      console.error('Error clearing wishlist:', error)
      throw error
    }
  }
}

export const wishlistService = new WishlistService()
