import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

interface CacheInfo {
  name: string
  size: string
  lastModified: string
}

interface CacheStats {
  totalCaches: number
  totalSize: string
  caches: CacheInfo[]
}

export function useCacheManager() {
  const [loading, setLoading] = useState(false)
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)

  // Get all cache information
  const getCacheStats = useCallback(async (): Promise<CacheStats> => {
    if (!('caches' in window)) {
      throw new Error('Cache API not supported')
    }

    const cacheNames = await window.caches.keys()
    const cachesInfo: CacheInfo[] = []
    let totalSizeBytes = 0

    for (const cacheName of cacheNames) {
      try {
        const cache = await window.caches.open(cacheName)
        const requests = await cache.keys()
        
        let cacheSize = 0
        let lastModified = new Date(0)

        for (const request of requests) {
          try {
            const response = await cache.match(request)
            if (response) {
              const responseClone = response.clone()
              const buffer = await responseClone.arrayBuffer()
              cacheSize += buffer.byteLength

              // Get last modified from headers
              const lastModifiedHeader = response.headers.get('last-modified')
              if (lastModifiedHeader) {
                const modDate = new Date(lastModifiedHeader)
                if (modDate > lastModified) {
                  lastModified = modDate
                }
              }
            }
          } catch (error) {
            console.warn(`Error reading cache entry for ${request.url}:`, error)
          }
        }

        totalSizeBytes += cacheSize
        cachesInfo.push({
          name: cacheName,
          size: formatBytes(cacheSize),
          lastModified: lastModified.getTime() > 0 ? lastModified.toLocaleString() : 'Unknown'
        })
      } catch (error) {
        console.warn(`Error reading cache ${cacheName}:`, error)
      }
    }

    return {
      totalCaches: cacheNames.length,
      totalSize: formatBytes(totalSizeBytes),
      caches: cachesInfo
    }
  }, [])

  // Load cache statistics
  const loadCacheStats = useCallback(async () => {
    setLoading(true)
    try {
      const stats = await getCacheStats()
      setCacheStats(stats)
    } catch (error) {
      console.error('Error loading cache stats:', error)
      toast.error('Failed to load cache statistics')
      // Set empty state on error to prevent indefinite loading
      setCacheStats({
        totalCaches: 0,
        totalSize: '0 Bytes',
        caches: []
      })
    } finally {
      setLoading(false)
    }
  }, [getCacheStats])

  // Clear all caches
  const clearAllCaches = useCallback(async () => {
    if (!('caches' in window)) {
      toast.error('Cache API not supported')
      return false
    }

    setLoading(true)
    try {
      const cacheNames = await window.caches.keys()
      const deletePromises = cacheNames.map(cacheName => window.caches.delete(cacheName))
      await Promise.all(deletePromises)
      
      // Clear localStorage
      localStorage.clear()
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Clear IndexedDB (if any)
      try {
        if ('indexedDB' in window) {
          // Get all databases and clear them
          const databases = await indexedDB.databases?.() || []
          for (const db of databases) {
            if (db.name) {
              const deleteRequest = indexedDB.deleteDatabase(db.name)
              await new Promise((resolve, reject) => {
                deleteRequest.onsuccess = () => resolve(undefined)
                deleteRequest.onerror = () => reject(deleteRequest.error)
              })
            }
          }
        }
      } catch (error) {
        console.warn('Error clearing IndexedDB:', error)
      }

      toast.success(`Cleared ${cacheNames.length} caches successfully`)
      
      // Reset cache stats immediately
      setCacheStats({
        totalCaches: 0,
        totalSize: '0 Bytes',
        caches: []
      })
      
      return true
    } catch (error) {
      console.error('Error clearing caches:', error)
      toast.error('Failed to clear caches')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Clear specific cache
  const clearSpecificCache = useCallback(async (cacheName: string) => {
    if (!('caches' in window)) {
      toast.error('Cache API not supported')
      return false
    }

    setLoading(true)
    try {
      const deleted = await window.caches.delete(cacheName)
      if (deleted) {
        // Update stats by removing the deleted cache from state
        setCacheStats(prevStats => {
          if (!prevStats) return null
          
          const filteredCaches = prevStats.caches.filter(cache => cache.name !== cacheName)
          const newTotalCaches = filteredCaches.length
          
          // Recalculate total size
          let totalSizeBytes = 0
          filteredCaches.forEach(cache => {
            // Parse size back to bytes for calculation
            const sizeStr = cache.size
            const [value, unit] = sizeStr.split(' ')
            const numValue = parseFloat(value)
            
            switch (unit) {
              case 'KB':
                totalSizeBytes += numValue * 1024
                break
              case 'MB':
                totalSizeBytes += numValue * 1024 * 1024
                break
              case 'GB':
                totalSizeBytes += numValue * 1024 * 1024 * 1024
                break
              default:
                totalSizeBytes += numValue
            }
          })
          
          return {
            totalCaches: newTotalCaches,
            totalSize: formatBytes(totalSizeBytes),
            caches: filteredCaches
          }
        })
        
        toast.success(`Cache "${cacheName}" cleared successfully`)
        return true
      } else {
        toast.error(`Failed to clear cache "${cacheName}"`)
        return false
      }
    } catch (error) {
      console.error('Error clearing specific cache:', error)
      toast.error(`Error clearing cache: ${error}`)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Force refresh service worker
  const forceUpdateServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Service Worker not supported')
      return false
    }

    setLoading(true)
    try {
      // Check if we're in development mode
      const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost'
      
      if (isDevelopment) {
        // In development, just reload the page as SW might not be properly configured
        toast.success('Reloading page to apply updates...')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        return true
      }

      // In production, properly update the service worker
      const registration = await navigator.serviceWorker.ready
      if (registration) {
        await registration.update()
        
        // Check if there's a waiting service worker
        if (registration.waiting) {
          // Send a message to the waiting SW to skip waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
        
        // Reload the page to apply updates
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating service worker:', error)
      
      // If SW update fails, just reload the page
      toast.success('Reloading page to apply updates...')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      return true
    } finally {
      setLoading(false)
    }
  }, [])

  // Preload critical resources
  const preloadCriticalResources = useCallback(async () => {
    if (!('caches' in window)) {
      toast.error('Cache API not supported')
      return false
    }

    setLoading(true)
    try {
      const cache = await window.caches.open('critical-resources-v1')
      
      const criticalResources = [
        '/',
        '/shop',
        '/about',
        '/contact',
        '/manifest.json',
        '/images/logo.png',
        '/images/favicon.png'
      ]

      const cachePromises = criticalResources.map(async (url) => {
        try {
          await cache.add(url)
        } catch (error) {
          console.warn(`Failed to cache ${url}:`, error)
        }
      })

      await Promise.all(cachePromises)
      await loadCacheStats()
      
      toast.success('Critical resources preloaded successfully')
      return true
    } catch (error) {
      console.error('Error preloading critical resources:', error)
      toast.error('Failed to preload critical resources')
      return false
    } finally {
      setLoading(false)
    }
  }, [loadCacheStats])

  return {
    loading,
    cacheStats,
    loadCacheStats,
    clearAllCaches,
    clearSpecificCache,
    forceUpdateServiceWorker,
    preloadCriticalResources
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
