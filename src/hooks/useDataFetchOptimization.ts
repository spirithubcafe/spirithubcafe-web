import { useCallback, useRef } from 'react'

interface UseDataFetchOptimizationOptions {
  debounceMs?: number
  throttleMs?: number
  cacheKey?: string
}

export function useDataFetchOptimization({
  debounceMs = 300,
  throttleMs = 1000
}: UseDataFetchOptimizationOptions = {}) {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastCallTimeRef = useRef<number>(0)
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map())

  // Debounced function
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = debounceMs
  ) => {
    return (...args: Parameters<T>) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      debounceTimerRef.current = setTimeout(() => func(...args), delay)
    }
  }, [debounceMs])

  // Throttled function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number = throttleMs
  ) => {
    return (...args: Parameters<T>) => {
      const now = Date.now()
      if (now - lastCallTimeRef.current >= delay) {
        func(...args)
        lastCallTimeRef.current = now
      } else if (!throttleTimerRef.current) {
        throttleTimerRef.current = setTimeout(() => {
          func(...args)
          lastCallTimeRef.current = Date.now()
          throttleTimerRef.current = null
        }, delay - (now - lastCallTimeRef.current))
      }
    }
  }, [throttleMs])

  // Cache management
  const getCachedData = useCallback((key: string, maxAge: number = 5 * 60 * 1000) => {
    const cached = cacheRef.current.get(key)
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data
    }
    return null
  }, [])

  const setCachedData = useCallback((key: string, data: any) => {
    cacheRef.current.set(key, { data, timestamp: Date.now() })
  }, [])

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key)
    } else {
      cacheRef.current.clear()
    }
  }, [])

  // Batch requests
  const batchRequests = useCallback(<T>(
    requests: (() => Promise<T>)[],
    batchSize: number = 5
  ) => {
    const batches: (() => Promise<T>)[][] = []
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize))
    }

    return batches.reduce(async (acc, batch) => {
      const results = await acc
      const batchResults = await Promise.allSettled(batch.map(req => req()))
      return [...results, ...batchResults]
    }, Promise.resolve([] as PromiseSettledResult<T>[]))
  }, [])

  // Optimized fetch with cache, debounce, and retry
  const optimizedFetch = useCallback(async <T>(
    fetchFn: () => Promise<T>,
    options: {
      cacheKey?: string
      maxAge?: number
      retries?: number
      retryDelay?: number
    } = {}
  ): Promise<T> => {
    const { cacheKey: key, maxAge = 5 * 60 * 1000, retries = 3, retryDelay = 1000 } = options

    // Check cache first
    if (key) {
      const cached = getCachedData(key, maxAge)
      if (cached) {
        return cached
      }
    }

    // Retry mechanism
    let lastError: Error
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const data = await fetchFn()
        
        // Cache the result
        if (key) {
          setCachedData(key, data)
        }
        
        return data
      } catch (error) {
        lastError = error as Error
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError!
  }, [getCachedData, setCachedData])

  return {
    debounce,
    throttle,
    getCachedData,
    setCachedData,
    clearCache,
    batchRequests,
    optimizedFetch
  }
}
