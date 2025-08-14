import { useState, useEffect, useCallback } from 'react'
import { settingsService, type CategoriesSettings } from '@/services/settings'

export function useCategoriesSettings() {
  const [settings, setSettings] = useState<CategoriesSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const categoriesSettings = await settingsService.getCategoriesSettings()
      console.log('useCategoriesSettings - Loaded settings:', categoriesSettings)
      setSettings(categoriesSettings)
    } catch (error) {
      console.error('Error loading categories settings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSettings = async (newSettings: CategoriesSettings) => {
    try {
      await settingsService.updateCategoriesSettings(newSettings)
      setSettings(newSettings)
      console.log('useCategoriesSettings - Settings updated successfully')
      
      // Force a reload to make sure we have the latest data
      setTimeout(() => {
        loadSettings()
      }, 500)
    } catch (error) {
      console.error('Error updating categories settings:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    refetch: loadSettings
  }
}
