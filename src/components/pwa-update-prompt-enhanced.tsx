import { useRegisterSW } from 'virtual:pwa-register/react'
import { useState, useEffect } from 'react'
import { RefreshCw, X, Download, Coffee, Wifi } from 'lucide-react'

export function PWAUpdatePrompt() {
  const [show, setShow] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null)

  const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ Service Worker registered successfully:', registration)
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration failed:', error)
    },
    onNeedRefresh() {
      console.log('🔄 New version available')
      setShow(true)
    },
    onOfflineReady() {
      console.log('📱 App ready to work offline')
      setShow(true)
      // Auto hide offline ready message after 6 seconds
      const timer = setTimeout(() => {
        setShow(false)
      }, 6000)
      setAutoHideTimer(timer)
    },
  })

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer)
      }
    }
  }, [autoHideTimer])

  // Close the prompt
  const close = () => {
    setShow(false)
    if (autoHideTimer) {
      clearTimeout(autoHideTimer)
      setAutoHideTimer(null)
    }
  }

  // Handle update with loading state
  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker(true)
    } catch (error) {
      console.error('Update failed:', error)
      setIsUpdating(false)
    }
  }

  // Don't render if no conditions are met
  if (!show || (!offlineReady && !needRefresh)) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-2 duration-300">
      <div className="relative">
        {/* Main notification card */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 
                       border border-amber-200 dark:border-amber-900/30 
                       rounded-2xl shadow-2xl shadow-amber-500/10 dark:shadow-amber-500/5
                       backdrop-blur-lg bg-opacity-95 dark:bg-opacity-95 
                       p-5 transform transition-all duration-300 ease-out hover:scale-105">
          
          {/* Coffee bean decoration */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 
                         rounded-full shadow-lg flex items-center justify-center animate-pulse">
            <Coffee className="w-4 h-4 text-white" />
          </div>

          {/* Header with icon and title */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {offlineReady ? (
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl 
                               flex items-center justify-center shadow-lg">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl 
                               flex items-center justify-center shadow-lg animate-bounce">
                  <Download className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  {offlineReady ? 'Ready for Offline' : 'Update Available'}
                </h3>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  SPIRITHUB ROASTERY
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                       transition-all duration-200 p-2 rounded-full 
                       hover:bg-gray-100 dark:hover:bg-gray-700/50 
                       hover:scale-110 active:scale-95"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content message */}
          <div className="mb-4">
            {offlineReady ? (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                ☕ Your coffee experience is now available offline! 
                Enjoy browsing our premium collection even without internet.
              </p>
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                ✨ A fresh brew of improvements is ready! 
                Update now for the best coffee shopping experience.
              </p>
            )}
          </div>

          {/* Action buttons for updates */}
          {needRefresh && (
            <div className="flex space-x-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 
                         hover:from-amber-600 hover:via-amber-700 hover:to-amber-800
                         text-white px-4 py-3 rounded-xl text-sm font-semibold 
                         transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed 
                         flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/25
                         hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5
                         active:translate-y-0 active:scale-95"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Brewing Update...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Update Now</span>
                  </>
                )}
              </button>
              <button
                onClick={close}
                className="px-4 py-3 text-gray-600 dark:text-gray-400 
                         hover:text-gray-800 dark:hover:text-gray-200 
                         text-sm font-medium transition-all duration-200 
                         rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50
                         hover:scale-105 active:scale-95"
              >
                Later
              </button>
            </div>
          )}

          {/* Offline ready indicator */}
          {offlineReady && (
            <div className="flex items-center justify-center mt-2 text-xs text-green-600 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Auto-closing in a few seconds...
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-to-tr from-amber-300 to-amber-500 
                       rounded-full opacity-60 animate-ping"></div>
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 
                       rounded-full opacity-40"></div>
      </div>
    </div>
  )
}
