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

  // Load user's wishlist
  useEffect(() => {
    if (!firebaseUser) {
      setWishlist([])
      setWishlistItems(new Set())
      return
    }

    setLoading(true)
    
    // Subscribe to real-time wishlist updates
    const unsubscribe = wishlistService.subscribeToWishlist(firebaseUser.uid, (updatedWishlist) => {
      setWishlist(updatedWishlist)
      setWishlistItems(new Set(updatedWishlist.map(item => item.product_id)))
      setLoading(false)
    })

    return unsubscribe
  }, [firebaseUser])

  // Add to wishlist
  const addToWishlist = async (productId: string) => {
    if (!firebaseUser) {
      toast.error(t('wishlist.loginRequired'))
      return false
    }

    try {
      setLoading(true)
      await wishlistService.addToWishlist(firebaseUser.uid, productId)
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
    if (!firebaseUser) {
      toast.error(t('wishlist.loginRequired'))
      return false
    }

    try {
      setLoading(true)
      await wishlistService.removeFromWishlist(firebaseUser.uid, productId)
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
    if (!firebaseUser) {
      toast.error(t('wishlist.loginRequired'))
      return false
    }

    try {
      setLoading(true)
      const isAdded = await wishlistService.toggleWishlist(firebaseUser.uid, productId)
      
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
