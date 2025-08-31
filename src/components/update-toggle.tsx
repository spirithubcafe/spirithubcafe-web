import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

interface UpdateToggleProps {
  className?: string
}

export function UpdateToggle({ className }: UpdateToggleProps = {}) {
  const { t } = useTranslation()

  const handleUpdate = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          // There's an update waiting
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          toast.success(t('common.updateInstalled'))
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          // Check for updates
          await registration?.update()
          toast(t('common.checkingForUpdates'))
          
          // Wait a bit and check again
          setTimeout(async () => {
            const newRegistration = await navigator.serviceWorker.getRegistration()
            if (newRegistration && newRegistration.waiting) {
              newRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })
              toast.success(t('common.updateInstalled'))
              setTimeout(() => {
                window.location.reload()
              }, 1000)
            } else {
              toast(t('common.noUpdatesAvailable'))
            }
          }, 2000)
        }
      } else {
        toast.error(t('common.serviceWorkerNotSupported'))
      }
    } catch (error) {
      console.error('Update check failed:', error)
      toast.error(t('common.updateCheckFailed'))
    }
  }

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className={className}
      onClick={handleUpdate}
      title={t('common.checkForUpdates')}
    >
      <Download className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">{t('common.checkForUpdates')}</span>
    </Button>
  )
}
