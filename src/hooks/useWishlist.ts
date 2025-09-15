import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { wishlistService } from '@/services/wishlist'
import type { Wishlist } from '@/types'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const useWishlist = () => {
  const { firebaseUser } = useAuth()
  const { t } = useTranslation()
  const [wishlist, setWishlist] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())

  // Load user's wishlist - now works without authentication
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true)
      try {
        // Use firebaseUser.uid if available, otherwise use 'guest' as identifier
        const userId = firebaseUser?.uid || 'guest'
        const userWishlist = await wishlistService.getUserWishlist(userId)
        setWishlist(userWishlist)
        setWishlistItems(new Set(userWishlist.map(item => item.product_id)))
      } catch (error) {
        console.error('Error loading wishlist:', error)
        setWishlist([])
        setWishlistItems(new Set())
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [firebaseUser])

  // Refresh wishlist data
  const refreshWishlist = async () => {
    try {
      const userId = firebaseUser?.uid || 'guest'
      const userWishlist = await wishlistService.getUserWishlist(userId)
      setWishlist(userWishlist)
      setWishlistItems(new Set(userWishlist.map(item => item.product_id)))
    } catch (error) {
      console.error('Error refreshing wishlist:', error)
    }
  }

  // Add to wishlist - no authentication required
  const addToWishlist = async (productId: string) => {
    try {
      setLoading(true)
      const userId = firebaseUser?.uid || 'guest'
      await wishlistService.addToWishlist(userId, productId)
      await refreshWishlist() // Manually refresh data
      toast.success(t('wishlist.addedToWishlist') || 'Added to wishlist')
      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove from wishlist - no authentication required
  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true)
      const userId = firebaseUser?.uid || 'guest'
      await wishlistService.removeFromWishlist(userId, productId)
      await refreshWishlist() // Manually refresh data
      toast.success(t('wishlist.removedFromWishlist') || 'Removed from wishlist')
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Toggle wishlist - no authentication required
  const toggleWishlist = async (productId: string) => {
    try {
      setLoading(true)
      const userId = firebaseUser?.uid || 'guest'
      const isAdded = await wishlistService.toggleWishlist(userId, productId)
      await refreshWishlist() // Manually refresh data
      
      if (isAdded) {
        toast.success(t('wishlist.addedToWishlist') || 'Added to wishlist')
      } else {
        toast.success(t('wishlist.removedFromWishlist') || 'Removed from wishlist')
      }
      
      return isAdded
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Failed to update wishlist')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.has(productId)
  }

  return {
    wishlist,
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount: wishlist.length,
    refreshWishlist
  }
}
