import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Loader } from './loader'
import './loading-animations.css'

interface AdvancedLoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  message?: string
  className?: string
  overlay?: boolean
  animated?: boolean
}

const loadingMessages = [
  'Loading...',
  'Please wait...',
  'Almost ready...',
  'Loading content...',
  'Just a moment...'
]

export function AdvancedLoading({
  size = 'md',
  fullScreen = false,
  message,
  className,
  overlay = false,
  animated = true
}: AdvancedLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0])
  const [messageIndex, setMessageIndex] = useState(0)

  // Rotate loading messages
  useEffect(() => {
    if (!message && animated) {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % loadingMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [message, animated])

  useEffect(() => {
    if (!message) {
      setCurrentMessage(loadingMessages[messageIndex])
    }
  }, [messageIndex, message])

  const renderLoader = () => {
    const sizeMap = {
      sm: 'sm' as const,
      md: 'md' as const, 
      lg: 'lg' as const,
      xl: 'lg' as const
    }
    
    return (
      <div className="flex items-center justify-center">
        <Loader size={sizeMap[size]} />
      </div>
    )
  }

  const LoadingContent = () => (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 animate-fade-in',
        className
      )}
    >
      {renderLoader()}
      
      {(message || animated) && (
        <p className="text-sm text-muted-foreground text-center font-medium animate-fade-in">
          {currentMessage}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center animate-fade-in',
          overlay ? 'loading-overlay' : 'bg-background'
        )}
      >
        <LoadingContent />
      </div>
    )
  }

  return <LoadingContent />
}

// Smart Loading Hook
export function useSmartLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
    setIsLoading(Object.values({ ...loadingStates, [key]: loading }).some(Boolean))
  }

  const startLoading = (key: string) => setLoading(key, true)
  const stopLoading = (key: string) => setLoading(key, false)
  const stopAllLoading = () => {
    setLoadingStates({})
    setIsLoading(false)
  }

  return {
    isLoading,
    loadingStates,
    setLoading,
    startLoading,
    stopLoading,
    stopAllLoading
  }
}

// Loading Wrapper Component
interface LoadingWrapperProps {
  loading: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
  minLoadingTime?: number
}

export function LoadingWrapper({
  loading,
  children,
  fallback,
  minLoadingTime = 300
}: LoadingWrapperProps) {
  const [showLoading, setShowLoading] = useState(loading)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (loading) {
      setShowLoading(true)
      setFadeOut(false)
    } else {
      // Start fade out animation
      setFadeOut(true)
      const timer = setTimeout(() => {
        setShowLoading(false)
        setFadeOut(false)
      }, 200) // Reduced from minLoadingTime to 200ms for faster fade
      return () => clearTimeout(timer)
    }
  }, [loading, minLoadingTime])

  if (showLoading) {
    return (
      <div className={cn(
        'transition-opacity duration-200 ease-out',
        fadeOut ? 'animate-fade-out opacity-0' : 'animate-fade-in opacity-100'
      )}>
        {fallback || (
          <AdvancedLoading
            message="Loading content..."
          />
        )}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {children}
    </div>
  )
}
