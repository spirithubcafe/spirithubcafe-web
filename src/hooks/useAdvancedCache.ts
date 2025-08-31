import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'

// Cache Types
export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: boolean
  persist?: boolean // Store in localStorage
  compression?: boolean
  priority?: 'high' | 'medium' | 'low'
  tags?: string[] // For cache invalidation by tags
}

export interface CacheItem<T = any> {
  data: T | string // Can be compressed string or original data
  timestamp: number
  ttl: number
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  compressed: boolean
  version: string
}

export interface CacheStats {
  totalSize: number
  itemCount: number
  hitRate: number
  lastCleanup: number
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheItem>()
  private hitCount = 0
  private missCount = 0
  private maxSize = 50 * 1024 * 1024 // 50MB
  private version = '1.0.0'

  // Compression utilities
  private compress(data: any): string {
    try {
      return btoa(JSON.stringify(data))
    } catch {
      return JSON.stringify(data)
    }
  }

  private decompress(data: string): any {
    try {
      return JSON.parse(atob(data))
    } catch {
      return JSON.parse(data)
    }
  }

  // Cache size calculation
  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  // LRU eviction
  private evictLRU(): void {
    const entries = Array.from(this.cache.entries())
    const sorted = entries.sort((a, b) => {
      // Sort by priority first, then by timestamp
      const priorityWeight = { high: 3, medium: 2, low: 1 }
      const aPriority = priorityWeight[a[1].priority]
      const bPriority = priorityWeight[b[1].priority]
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority
      }
      
      return a[1].timestamp - b[1].timestamp
    })

    // Remove oldest, lowest priority items
    const toRemove = sorted.slice(0, Math.floor(entries.length * 0.3))
    toRemove.forEach(([key]) => this.cache.delete(key))
  }

  // Check if cache is too large
  private checkSize(): void {
    const currentSize = this.getCurrentSize()
    if (currentSize > this.maxSize) {
      this.evictLRU()
    }
  }

  // Get current cache size
  getCurrentSize(): number {
    let size = 0
    this.cache.forEach(item => {
      size += this.calculateSize(item)
    })
    return size
  }

  // Set cache item
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      compression = false,
      priority = 'medium',
      tags = [],
      persist = false
    } = options

    const cacheItem: CacheItem<T> = {
      data: compression ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl,
      tags,
      priority,
      compressed: compression,
      version: this.version
    }

    this.cache.set(key, cacheItem)

    // Persist to localStorage if requested
    if (persist) {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem))
      } catch (error) {
        console.warn('Failed to persist cache item:', error)
      }
    }

    this.checkSize()
  }

  // Get cache item
  get<T>(key: string): T | null {
    let item = this.cache.get(key)

    // If not in memory, try localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          item = JSON.parse(stored)
          // Restore to memory cache
          if (item) {
            this.cache.set(key, item)
          }
        }
      } catch (error) {
        console.warn('Failed to retrieve from localStorage:', error)
      }
    }

    if (!item) {
      this.missCount++
      return null
    }

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key)
      this.missCount++
      return null
    }

    // Check version compatibility
    if (item.version !== this.version) {
      this.delete(key)
      this.missCount++
      return null
    }

    this.hitCount++
    
    // Update timestamp for LRU
    item.timestamp = Date.now()
    
    return item.compressed ? this.decompress(item.data as string) : item.data
  }

  // Check if item is stale
  isStale(key: string, maxAge?: number): boolean {
    const item = this.cache.get(key)
    if (!item) return true
    
    const age = Date.now() - item.timestamp
    return age > (maxAge || item.ttl * 0.8) // Consider stale at 80% of TTL
  }

  // Delete cache item
  delete(key: string): boolean {
    const deleted = this.cache.delete(key)
    
    // Remove from localStorage
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
    
    return deleted
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0
    
    this.cache.forEach((item, key) => {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.delete(key)
        cleared++
      }
    })
    
    return cleared
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
    
    // Clear localStorage cache items
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error)
    }
  }

  // Cleanup expired items
  cleanup(): number {
    let cleaned = 0
    const now = Date.now()
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        this.delete(key)
        cleaned++
      }
    })
    
    return cleaned
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount
    
    return {
      totalSize: this.getCurrentSize(),
      itemCount: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      lastCleanup: Date.now()
    }
  }

  // Preload critical resources
  async preload(urls: string[], options: CacheOptions = {}): Promise<void> {
    const promises = urls.map(async (url) => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          this.set(url, data, { ...options, tags: ['preload'] })
        }
      } catch (error) {
        console.warn(`Failed to preload ${url}:`, error)
      }
    })

    await Promise.all(promises)
  }
}

// Global cache manager instance
export const advancedCacheManager = new AdvancedCacheManager()

// React Hook for advanced caching
export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & {
    enabled?: boolean
    refetchInterval?: number
    onError?: (error: Error) => void
    onSuccess?: (data: T) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const {
    enabled = true,
    staleWhileRevalidate = true,
    refetchInterval,
    onError,
    onSuccess,
    ...cacheOptions
  } = options

  const fetchData = useCallback(async (isBackground = false) => {
    if (!enabled) return

    if (!isBackground) setLoading(true)
    setError(null)

    try {
      // Check cache first
      const cachedData = advancedCacheManager.get<T>(key)
      
      if (cachedData) {
        setData(cachedData)
        if (!isBackground) setLoading(false)
        
        if (onSuccess) onSuccess(cachedData)
        
        // If stale-while-revalidate and data is stale, fetch in background
        if (staleWhileRevalidate && advancedCacheManager.isStale(key)) {
          setTimeout(() => fetchData(true), 0)
        }
        return
      }

      // Fetch fresh data
      const freshData = await fetcher()
      advancedCacheManager.set(key, freshData, cacheOptions)
      setData(freshData)
      
      if (onSuccess) onSuccess(freshData)
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Unknown error')
      setError(errorObj)
      if (onError) onError(errorObj)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }, [key, enabled, staleWhileRevalidate, fetcher, onError, onSuccess, cacheOptions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Setup refetch interval
  useEffect(() => {
    if (!refetchInterval) return

    const interval = setInterval(() => {
      fetchData(true)
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, fetchData])

  const mutate = useCallback(async (newData?: T) => {
    if (newData) {
      advancedCacheManager.set(key, newData, cacheOptions)
      setData(newData)
    } else {
      await fetchData()
    }
  }, [key, cacheOptions, fetchData])

  const invalidate = useCallback(() => {
    advancedCacheManager.delete(key)
    setData(null)
    setError(null)
  }, [key])

  return {
    data,
    loading,
    error,
    mutate,
    invalidate,
    refetch: () => fetchData()
  }
}

// Cache management hook
export function useCacheManager() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(false)

  const refreshStats = useCallback(() => {
    setStats(advancedCacheManager.getStats())
  }, [])

  const clearCache = useCallback(async () => {
    setLoading(true)
    try {
      advancedCacheManager.clear()
      refreshStats()
      toast.success('Cache cleared successfully')
    } catch (error) {
      toast.error('Failed to clear cache')
    } finally {
      setLoading(false)
    }
  }, [refreshStats])

  const cleanupExpired = useCallback(async () => {
    setLoading(true)
    try {
      const cleaned = advancedCacheManager.cleanup()
      refreshStats()
      toast.success(`Cleaned ${cleaned} expired items`)
    } catch (error) {
      toast.error('Failed to cleanup cache')
    } finally {
      setLoading(false)
    }
  }, [refreshStats])

  const preloadCritical = useCallback(async (urls: string[]) => {
    setLoading(true)
    try {
      await advancedCacheManager.preload(urls, {
        ttl: 30 * 60 * 1000, // 30 minutes
        priority: 'high',
        persist: true,
        tags: ['critical', 'preload']
      })
      refreshStats()
      toast.success('Critical resources preloaded')
    } catch (error) {
      toast.error('Failed to preload resources')
    } finally {
      setLoading(false)
    }
  }, [refreshStats])

  useEffect(() => {
    refreshStats()
    
    // Cleanup expired items every 5 minutes
    const cleanupInterval = setInterval(() => {
      advancedCacheManager.cleanup()
      refreshStats()
    }, 5 * 60 * 1000)

    return () => clearInterval(cleanupInterval)
  }, [refreshStats])

  return {
    stats,
    loading,
    clearCache,
    cleanupExpired,
    preloadCritical,
    refreshStats
  }
}
