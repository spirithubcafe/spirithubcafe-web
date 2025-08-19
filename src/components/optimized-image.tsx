import React, { useState, useRef, useEffect } from 'react'
import { useImageCache } from '@/hooks/useCache'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallback?: string
  lazy?: boolean
  placeholder?: React.ReactNode
  className?: string
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.png',
  lazy = true,
  placeholder,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(lazy ? '' : src)
  const [isVisible, setIsVisible] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)
  const { loaded, error } = useImageCache(currentSrc)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setCurrentSrc(src)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, isVisible, src])

  // Set src immediately if not lazy loading
  useEffect(() => {
    if (!lazy) {
      setCurrentSrc(src)
    }
  }, [src, lazy])

  const handleError = () => {
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback)
    }
  }

  const showPlaceholder = lazy && !isVisible
  const showImage = currentSrc && (loaded || !lazy)
  const showError = error && currentSrc === fallback

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="text-gray-400 text-sm">Loading...</div>
          )}
        </div>
      )}
      
      {showImage && !showError && (
        <img
          {...props}
          src={currentSrc}
          alt={alt}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
      
      {showError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm text-center">
            <div>Failed to load image</div>
            <div className="text-xs mt-1">{alt}</div>
          </div>
        </div>
      )}
      
      {!loaded && currentSrc && !showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

// Progressive image component with multiple sizes
interface ProgressiveImageProps extends OptimizedImageProps {
  srcSet?: string
  sizes?: string
  webpSrc?: string
  avifSrc?: string
}

export function ProgressiveImage({
  src,
  srcSet,
  sizes,
  webpSrc,
  avifSrc,
  ...props
}: ProgressiveImageProps) {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <OptimizedImage
        {...props}
        src={src}
        srcSet={srcSet}
        sizes={sizes}
      />
    </picture>
  )
}
