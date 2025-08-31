import { useState, useEffect } from 'react'
import { Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'
import './loading-animations.css'

interface AdvancedLoadingProps {
  variant?: 'spinner' | 'pulse' | 'coffee' | 'skeleton' | 'progress'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullScreen?: boolean
  message?: string
  progress?: number
  showProgress?: boolean
  className?: string
  overlay?: boolean
  animated?: boolean
}

const loadingMessages = [
  'Loading delicious coffee...',
  'Brewing your experience...',
  'Preparing fresh content...',
  'Fetching coffee beans...',
  'Almost ready...'
]

export function AdvancedLoading({
  variant = 'spinner',
  size = 'md',
  fullScreen = false,
  message,
  progress,
  showProgress = false,
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

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const SpinnerLoader = () => (
    <div
      className={cn(
        'border-2 border-gray-300 border-t-primary rounded-full animate-spin',
        sizeClasses[size]
      )}
    />
  )

  const PulseLoader = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-primary animate-pulse-dot',
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5',
            i === 0 ? 'pulse-delay-0' : i === 1 ? 'pulse-delay-200' : 'pulse-delay-400'
          )}
        />
      ))}
    </div>
  )

  const CoffeeLoader = () => (
    <div className="relative">
      <Coffee className={cn('text-amber-600 animate-spin', sizeClasses[size])} />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
    </div>
  )

  const SkeletonLoader = () => (
    <div className="space-y-3 w-full max-w-sm">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-300 rounded skeleton-shimmer',
            i === 1 ? 'h-4' : i === 2 ? 'h-3 w-3/4' : 'h-3 w-1/2',
            i === 0 ? 'pulse-delay-0' : i === 1 ? 'pulse-delay-200' : 'pulse-delay-400'
          )}
        />
      ))}
    </div>
  )

  const ProgressLoader = () => (
    <div className="w-full max-w-xs space-y-3">
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out progress-bar-animated',
            progress ? '' : 'animate-progress'
          )}
          style={{
            width: progress ? `${progress}%` : undefined
          }}
        />
      </div>
      {showProgress && progress && (
        <div className="text-center text-sm text-gray-600">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <SpinnerLoader />
      case 'pulse':
        return <PulseLoader />
      case 'coffee':
        return <CoffeeLoader />
      case 'skeleton':
        return <SkeletonLoader />
      case 'progress':
        return <ProgressLoader />
      default:
        return <SpinnerLoader />
    }
  }

  const LoadingContent = () => (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-4 animate-fade-in',
        className
      )}
    >
      {renderLoader()}
      
      {(message || animated) && variant !== 'skeleton' && (
        <p className="text-sm text-gray-600 text-center font-medium animate-fade-in">
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
          overlay ? 'bg-white/80 backdrop-blur-sm' : 'bg-background'
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
  skeleton?: boolean
  minLoadingTime?: number
}

export function LoadingWrapper({
  loading,
  children,
  fallback,
  skeleton = false,
  minLoadingTime = 300
}: LoadingWrapperProps) {
  const [showLoading, setShowLoading] = useState(loading)

  useEffect(() => {
    if (loading) {
      setShowLoading(true)
    } else {
      const timer = setTimeout(() => {
        setShowLoading(false)
      }, minLoadingTime)
      return () => clearTimeout(timer)
    }
  }, [loading, minLoadingTime])

  if (showLoading) {
    return (
      <div className="animate-fade-in">
        {fallback || (
          <AdvancedLoading
            variant={skeleton ? 'skeleton' : 'spinner'}
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
