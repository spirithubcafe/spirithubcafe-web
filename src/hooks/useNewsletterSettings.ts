import { useState, useEffect } from 'react'
import { settingsService, type NewsletterSettings } from '@/services/settings'

export function useNewsletterSettings() {
  const [settings, setSettings] = useState<NewsletterSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const newsletterSettings = await settingsService.getNewsletterSettings()
      setSettings(newsletterSettings)
    } catch (err) {
      console.error('Error loading newsletter settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load newsletter settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: NewsletterSettings) => {
    try {
      setError(null)
      await settingsService.updateNewsletterSettings(newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      console.error('Error updating newsletter settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update newsletter settings')
      return false
    }
  }

  const refreshSettings = () => {
    settingsService.forceRefreshNewsletter()
    loadSettings()
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    reload: loadSettings
  }
}
