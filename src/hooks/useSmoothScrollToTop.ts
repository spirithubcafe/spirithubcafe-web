import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Hook for smooth scrolling to top when route or activeTab changes
 * @param dependency - Optional dependency like activeTab for internal page changes
 * @param containerRef - Optional ref to the scroll container
 */
export const useSmoothScrollToTop = (dependency?: string, containerRef?: React.RefObject<HTMLElement | null>) => {
  const location = useLocation()

  useEffect(() => {
    const scrollToTop = () => {
      const container = containerRef?.current || document.documentElement

      // Check if the container supports smooth scrolling
      if (container && container.scrollTo) {
        container.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      } else if (container) {
        // Fallback for older browsers - custom smooth scroll
        const startPosition = container.scrollTop
        const distance = startPosition
        const duration = 500 // 500ms for smooth animation
        let startTime: number | null = null

        const smoothScroll = (currentTime: number) => {
          if (startTime === null) startTime = currentTime
          const timeElapsed = currentTime - startTime
          const progress = Math.min(timeElapsed / duration, 1)
          
          // Easing function for smooth animation
          const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
          const easedProgress = easeInOutQuad(progress)
          
          container.scrollTop = startPosition - (distance * easedProgress)
          
          if (progress < 1) {
            requestAnimationFrame(smoothScroll)
          }
        }
        
        requestAnimationFrame(smoothScroll)
      }
    }

    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToTop, 100)
    
    return () => clearTimeout(timer)
  }, [location.pathname, dependency, containerRef])
}

/**
 * Simple hook for smooth scrolling to top on route changes
 */
export const useScrollToTopOnRouteChange = () => {
  useSmoothScrollToTop()
}
