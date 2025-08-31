import { useState, useEffect } from 'react'

export function useUpdateAvailable() {
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        if ('serviceWorker' in navigator) {
          // Skip in development mode to avoid MIME type errors
          if (process.env.NODE_ENV === 'development') {
            return
          }

          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            // Check if there's already an update waiting
            if (registration.waiting) {
              setUpdateAvailable(true)
              return
            }

            // Check for new updates
            await registration.update()
            
            // Wait a bit and check again
            setTimeout(async () => {
              const newRegistration = await navigator.serviceWorker.getRegistration()
              if (newRegistration && newRegistration.waiting) {
                setUpdateAvailable(true)
              }
            }, 1000)
          }
        }
      } catch (error) {
        console.error('Update check failed:', error)
      }
    }

    checkForUpdates()
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
          setUpdateAvailable(true)
        }
      }

      navigator.serviceWorker.addEventListener('message', handleMessage)
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage)
      }
    }
  }, [])

  return updateAvailable
}
