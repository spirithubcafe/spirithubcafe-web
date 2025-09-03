import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'

interface UpdateToggleProps {
  className?: string
}

export function UpdateToggle({ className }: UpdateToggleProps = {}) {
  const { t } = useTranslation()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check for updates on component mount
  useEffect(() => {
    checkForUpdates()
    
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
          setUpdateAvailable(true)
        }
      })
    }
  }, [])

  const checkForUpdates = async () => {
    try {
      if ('serviceWorker' in navigator) {
        // Skip in development mode to avoid MIME type errors
        if (process.env.NODE_ENV === 'development') {
          console.log('Update check skipped in development mode')
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

  const handleUpdate = async () => {
    if (!updateAvailable) {
      toast(t('common.noUpdatesAvailable'))
      return
    }

    setIsLoading(true)
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          toast.success(t('common.updateInstalled'))
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          toast(t('common.noUpdatesAvailable'))
        }
      } else {
        toast.error(t('common.serviceWorkerNotSupported'))
      }
    } catch (error) {
      console.error('Update failed:', error)
      toast.error(t('common.updateCheckFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render if no update is available
  if (!updateAvailable) {
    return null
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={className}
      onClick={handleUpdate}
      disabled={isLoading}
      title={t('common.installUpdate')}
    >
      <Download className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{t('common.installUpdate')}</span>
    </Button>
  )
}
