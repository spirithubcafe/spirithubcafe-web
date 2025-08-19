import { useState, useEffect } from 'react'

interface CacheOptions {
  maxAge?: number // in milliseconds
  staleWhileRevalidate?: boolean
}

interface CacheItem<T> {
  data: T
  timestamp: number
  maxAge: number
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private readonly prefix = 'spirithub-cache-'

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const maxAge = options.maxAge || 5 * 60 * 1000 // 5 minutes default
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      maxAge,
    }
    
    this.cache.set(key, cacheItem)
    
    // Also save to localStorage for persistence
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  get<T>(key: string): T | null {
    // First check memory cache
    let cacheItem = this.cache.get(key)
    
    // If not in memory, try localStorage
    if (!cacheItem) {
      try {
        const stored = localStorage.getItem(this.prefix + key)
        if (stored) {
          cacheItem = JSON.parse(stored)
          if (cacheItem) {
            this.cache.set(key, cacheItem)
          }
        }
      } catch (error) {
        console.warn('Failed to read from localStorage:', error)
      }
    }

    if (!cacheItem) {
      return null
    }

    const isExpired = Date.now() - cacheItem.timestamp > cacheItem.maxAge
    
    if (isExpired) {
      this.delete(key)
      return null
    }

    return cacheItem.data
  }

  delete(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error)
    }
  }

  clear(): void {
    this.cache.clear()
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  isStale(key: string, maxAge: number): boolean {
    const cacheItem = this.cache.get(key)
    if (!cacheItem) return true
    
    return Date.now() - cacheItem.timestamp > maxAge
  }
}

export const cacheManager = new CacheManager()

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cachedData = cacheManager.get<T>(key)
        
        if (cachedData) {
          setData(cachedData)
          setLoading(false)
          
          // If stale-while-revalidate, update in background
          if (options.staleWhileRevalidate && 
              cacheManager.isStale(key, options.maxAge || 5 * 60 * 1000)) {
            try {
              const freshData = await fetcher()
              cacheManager.set(key, freshData, options)
              setData(freshData)
            } catch (err) {
              // Silently fail background update
              console.warn('Background update failed:', err)
            }
          }
          return
        }

        // No cache, fetch fresh data
        setLoading(true)
        const freshData = await fetcher()
        cacheManager.set(key, freshData, options)
        setData(freshData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [key, options.maxAge, options.staleWhileRevalidate])

  const mutate = async (newData?: T) => {
    if (newData) {
      cacheManager.set(key, newData, options)
      setData(newData)
    } else {
      // Revalidate
      try {
        setLoading(true)
        const freshData = await fetcher()
        cacheManager.set(key, freshData, options)
        setData(freshData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }
  }

  return { data, loading, error, mutate }
}

// Hook for image preloading and caching
export function useImageCache(src: string) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    
    img.onload = () => {
      setLoaded(true)
      setError(false)
    }
    
    img.onerror = () => {
      setError(true)
      setLoaded(false)
    }
    
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { loaded, error }
}
