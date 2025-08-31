// Service Worker Registration and Management
import { logger } from "@/utils/logger";
import { useState, useEffect, useCallback } from 'react'

interface ServiceWorkerManager {
  register: () => Promise<ServiceWorkerRegistration | null>
  update: () => Promise<boolean>
  unregister: () => Promise<boolean>
  isSupported: () => boolean
  getRegistration: () => Promise<ServiceWorkerRegistration | null>
  sendMessage: (message: any) => Promise<any>
}

class SWManager implements ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null

  isSupported(): boolean {
    return 'serviceWorker' in navigator
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      logger.warn('Service Worker not supported')
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      logger.log('✅ Service Worker registered successfully')

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.log('🔄 New Service Worker available')
              this.showUpdateNotification()
            }
          })
        }
      })

      // Check for updates every 60 seconds
      setInterval(() => {
        this.registration?.update()
      }, 60000)

      return this.registration
    } catch (error) {
      logger.error('❌ Service Worker registration failed:', error)
      return null
    }
  }

  async update(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.update()
      return true
    } catch (error) {
      logger.error('Service Worker update failed:', error)
      return false
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const result = await this.registration.unregister()
      this.registration = null
      return result
    } catch (error) {
      logger.error('Service Worker unregistration failed:', error)
      return false
    }
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      return null
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      return registration || null
    } catch (error) {
      logger.error('Failed to get Service Worker registration:', error)
      return null
    }
  }

  async sendMessage(message: any): Promise<any> {
    if (!this.registration?.active) {
      throw new Error('No active Service Worker')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'ERROR') {
          reject(new Error(event.data.payload))
        } else {
          resolve(event.data.payload)
        }
      }

      this.registration!.active!.postMessage(message, [messageChannel.port2])
    })
  }

  private showUpdateNotification(): void {
    // You can integrate with your toast system here
    if (typeof window !== 'undefined' && 'toast' in window) {
      // @ts-ignore
      window.toast.success('App update available! Refresh to get the latest version.', {
        duration: 5000,
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      })
    }
  }
}

// Global instance
export const serviceWorkerManager = new SWManager()

// React Hook for Service Worker
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && serviceWorkerManager.isSupported()) {
      // Register in production only
      if (import.meta.env.PROD) {
        serviceWorkerManager.register().then(registration => {
          if (registration) {
            setIsRegistered(true)
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              setUpdateAvailable(true)
            })
          }
        })
      }
    }
  }, [])

  const updateServiceWorker = useCallback(async () => {
    setIsUpdating(true)
    try {
      const success = await serviceWorkerManager.update()
      if (success) {
        // Force reload to activate new version
        window.location.reload()
      }
    } catch (error) {
      logger.error('Update failed:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [])

  const unregisterServiceWorker = useCallback(async () => {
    try {
      await serviceWorkerManager.unregister()
      setIsRegistered(false)
    } catch (error) {
      logger.error('Unregister failed:', error)
    }
  }, [])

  const getCacheStats = useCallback(async () => {
    try {
      return await serviceWorkerManager.sendMessage({ type: 'GET_CACHE_STATS' })
    } catch (error) {
      logger.error('Failed to get cache stats:', error)
      return null
    }
  }, [])

  const clearCache = useCallback(async (cacheName?: string) => {
    try {
      await serviceWorkerManager.sendMessage({ 
        type: 'CLEAR_CACHE', 
        payload: cacheName 
      })
      return true
    } catch (error) {
      logger.error('Failed to clear cache:', error)
      return false
    }
  }, [])

  const preloadResources = useCallback(async (urls: string[]) => {
    try {
      await serviceWorkerManager.sendMessage({ 
        type: 'PRELOAD_RESOURCES', 
        payload: urls 
      })
      return true
    } catch (error) {
      logger.error('Failed to preload resources:', error)
      return false
    }
  }, [])

  return {
    isRegistered,
    isUpdating,
    updateAvailable,
    updateServiceWorker,
    unregisterServiceWorker,
    getCacheStats,
    clearCache,
    preloadResources,
    isSupported: serviceWorkerManager.isSupported()
  }
}

// Auto-register function
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      serviceWorkerManager.register()
    })
  }
}
