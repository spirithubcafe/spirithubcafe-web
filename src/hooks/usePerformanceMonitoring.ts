import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number
  domContentLoadedTime: number
  firstPaintTime: number
  firstContentfulPaintTime: number
  largestContentfulPaintTime?: number
  firstInputDelayTime?: number
  cumulativeLayoutShiftScore?: number
}

interface UsePerformanceMonitoringOptions {
  onMetricsReady?: (metrics: PerformanceMetrics) => void
  trackUserTiming?: boolean
  trackResourceTiming?: boolean
}

export function usePerformanceMonitoring({
  onMetricsReady,
  trackUserTiming = false,
  trackResourceTiming = false
}: UsePerformanceMonitoringOptions = {}) {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({})

  useEffect(() => {
    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const paint = performance.getEntriesByType('paint')

      if (navigation) {
        metricsRef.current.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
        metricsRef.current.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart
      }

      paint.forEach((entry) => {
        if (entry.name === 'first-paint') {
          metricsRef.current.firstPaintTime = entry.startTime
        } else if (entry.name === 'first-contentful-paint') {
          metricsRef.current.firstContentfulPaintTime = entry.startTime
        }
      })

      // Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          metricsRef.current.largestContentfulPaintTime = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          entries.forEach((entry: any) => {
            if (entry.processingStart) {
              metricsRef.current.firstInputDelayTime = entry.processingStart - entry.startTime
            }
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsScore = 0
          entryList.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value
            }
          })
          metricsRef.current.cumulativeLayoutShiftScore = clsScore
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Cleanup function
        return () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        }
      }
    }

    // Collect metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(collectMetrics, 100)
    } else {
      window.addEventListener('load', () => {
        setTimeout(collectMetrics, 100)
      })
    }

    // Report metrics after a delay to ensure all measurements are complete
    const reportTimer = setTimeout(() => {
      if (onMetricsReady && Object.keys(metricsRef.current).length > 0) {
        onMetricsReady(metricsRef.current as PerformanceMetrics)
      }
    }, 3000)

    return () => {
      clearTimeout(reportTimer)
    }
  }, [onMetricsReady])

  // Track custom user timing
  const markStart = (name: string) => {
    if (trackUserTiming && 'performance' in window && 'mark' in performance) {
      performance.mark(`${name}-start`)
    }
  }

  const markEnd = (name: string) => {
    if (trackUserTiming && 'performance' in window && 'mark' in performance && 'measure' in performance) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }
  }

  // Get resource timing information
  const getResourceTiming = () => {
    if (!trackResourceTiming || !('performance' in window)) return []
    
    return performance.getEntriesByType('resource').map((entry) => {
      const resourceEntry = entry as PerformanceResourceTiming
      return {
        name: resourceEntry.name,
        duration: resourceEntry.duration,
        size: resourceEntry.transferSize || 0,
        type: resourceEntry.initiatorType
      }
    })
  }

  // Get current metrics snapshot
  const getCurrentMetrics = () => ({ ...metricsRef.current })

  return {
    markStart,
    markEnd,
    getResourceTiming,
    getCurrentMetrics
  }
}

// Utility function to log performance metrics
export function logPerformanceMetrics(metrics: PerformanceMetrics) {
  console.group('📊 Performance Metrics')
  console.log(`⏱️ Page Load Time: ${metrics.pageLoadTime?.toFixed(2)}ms`)
  console.log(`🏗️ DOM Content Loaded: ${metrics.domContentLoadedTime?.toFixed(2)}ms`)
  console.log(`🎨 First Paint: ${metrics.firstPaintTime?.toFixed(2)}ms`)
  console.log(`✨ First Contentful Paint: ${metrics.firstContentfulPaintTime?.toFixed(2)}ms`)
  
  if (metrics.largestContentfulPaintTime) {
    console.log(`🖼️ Largest Contentful Paint: ${metrics.largestContentfulPaintTime.toFixed(2)}ms`)
  }
  
  if (metrics.firstInputDelayTime) {
    console.log(`👆 First Input Delay: ${metrics.firstInputDelayTime.toFixed(2)}ms`)
  }
  
  if (metrics.cumulativeLayoutShiftScore) {
    console.log(`📐 Cumulative Layout Shift: ${metrics.cumulativeLayoutShiftScore.toFixed(4)}`)
  }
  
  console.groupEnd()
}
