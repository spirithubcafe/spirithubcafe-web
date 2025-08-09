import { db } from '@/lib/firebase'
import { collection, doc, addDoc, deleteDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import type { Wishlist } from '@/types'

export class WishlistService {
  private collectionName = 'wishlists'

  // Add product to wishlist
  async addToWishlist(userId: string, productId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized')
    
    try {
      // Check if product is already in wishlist
      const existing = await this.isInWishlist(userId, productId)
      if (existing) {
        throw new Error('Product already in wishlist')
      }

      await addDoc(collection(db, this.collectionName), {
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  // Remove product from wishlist
  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    if (!db) throw new Error('Database not initialized')
    
    try {
      const q = query(
        collection(db, this.collectionName),
        where('user_id', '==', userId),
        where('product_id', '==', productId)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        const wishlistDoc = querySnapshot.docs[0]
        await deleteDoc(doc(db, this.collectionName, wishlistDoc.id))
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  // Check if product is in wishlist
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    if (!db) throw new Error('Database not initialized')
    
    try {
      const q = query(
        collection(db, this.collectionName),
        where('user_id', '==', userId),
        where('product_id', '==', productId)
      )
      
      const querySnapshot = await getDocs(q)
      return !querySnapshot.empty
    } catch (error) {
      console.error('Error checking wishlist:', error)
      return false
    }
  }

  // Get user's wishlist
  async getUserWishlist(userId: string): Promise<Wishlist[]> {
    if (!db) throw new Error('Database not initialized')
    
    try {
      const q = query(
        collection(db, this.collectionName),
        where('user_id', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Wishlist))
    } catch (error) {
      console.error('Error getting wishlist:', error)
      return []
    }
  }

  // Subscribe to wishlist changes
  subscribeToWishlist(userId: string, callback: (wishlist: Wishlist[]) => void): () => void {
    if (!db) throw new Error('Database not initialized')
    
    const q = query(
      collection(db, this.collectionName),
      where('user_id', '==', userId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const wishlist = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Wishlist))
      callback(wishlist)
    })
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
