import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect } from 'react'

/**
 * Auto-updater component that silently updates the app without user intervention
 * Place this in your App.tsx or main component
 */
export function AutoUpdater() {
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ Service Worker registered successfully')
      
      // Only set up auto-update in production
      if (!import.meta.env.DEV && registration) {
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update().catch(error => {
            console.warn('Failed to check for updates:', error)
          })
        }, 60000)
      }
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration failed:', error)
    },
    onNeedRefresh() {
      console.log('🔄 New version available - Auto updating...')
      // Automatically update without showing popup
      updateServiceWorker(true)
    },
    onOfflineReady() {
      console.log('📱 App ready to work offline')
    },
  })

  // Auto-update when needRefresh is triggered
  useEffect(() => {
    if (needRefresh && !import.meta.env.DEV) {
      console.log('🚀 Installing update automatically...')
      updateServiceWorker(true)
    }
  }, [needRefresh, updateServiceWorker])

  // This component renders nothing - it's just for functionality
  return null
}
