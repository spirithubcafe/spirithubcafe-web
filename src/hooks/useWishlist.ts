import { useState, useEffect } from 'react'
import { wishlistService } from '@/services/wishlist'
import type { Wishlist } from '@/types'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export const useWishlist = () => {
  const { t } = useTranslation()
  const [wishlist, setWishlist] = useState<Wishlist[]>([])
  const [loading, setLoading] = useState(false)
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set())

  // Load wishlist from localStorage
  useEffect(() => {
    setLoading(true)
    
    // Subscribe to wishlist updates
    const unsubscribe = wishlistService.subscribeToWishlist('local_user', (updatedWishlist) => {
      setWishlist(updatedWishlist)
      setWishlistItems(new Set(updatedWishlist.map(item => item.product_id)))
      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Add to wishlist
  const addToWishlist = async (productId: string) => {
    try {
      setLoading(true)
      await wishlistService.addToWishlist('local_user', productId)
      toast.success(t('wishlist.addedToWishlist'))
      return true
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      toast.error('Failed to add to wishlist')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Remove from wishlist
  const removeFromWishlist = async (productId: string) => {
    try {
      setLoading(true)
      await wishlistService.removeFromWishlist('local_user', productId)
      toast.success(t('wishlist.removedFromWishlist'))
      return true
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      toast.error('Failed to remove from wishlist')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Toggle wishlist
  const toggleWishlist = async (productId: string) => {
    try {
      setLoading(true)
      const isAdded = await wishlistService.toggleWishlist('local_user', productId)
      
      if (isAdded) {
        toast.success(t('wishlist.addedToWishlist'))
      } else {
        toast.success(t('wishlist.removedFromWishlist'))
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
    wishlistCount: wishlist.length
  }
}
