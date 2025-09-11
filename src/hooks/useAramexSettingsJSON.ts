import { useState, useEffect } from 'react'
import { jsonDataService } from '@/services/jsonDataService'
import type { AramexSettings } from '@/types/aramex'

const defaultAramexSettings: AramexSettings = {
  credentials: {
    username: 'info@spirithubcafe.com',
    password: 'ChemicalShared@33',
    accountNumber: '71925275',
    accountPin: '617333',
    accountEntity: 'MCT',
    accountCountryCode: 'OM',
    apiVersion: 'v1.0',
    source: '24'
  },
  shipperInfo: {
    companyName: 'Spirit Hub',
    contactName: 'Said',
    phoneNumber: '92506030',
    addressLine1: 'Al Hail',
    addressLine2: '',
    city: 'Muscat',
    stateProvince: 'MC',
    postalCode: '111',
    countryCode: 'OM'
  },
  services: [
    {
      id: 'PDX',
      name: 'Priority Document Express',
      customLabel: 'Express Documents',
      type: 'international',
      enabled: true
    },
    {
      id: 'PPX',
      name: 'Priority Parcel Express',
      customLabel: 'Express Parcels',
      type: 'international', 
      enabled: true
    },
    {
      id: 'DOM',
      name: 'Domestic Delivery',
      customLabel: 'Local Delivery',
      type: 'domestic',
      enabled: true
    }
  ],
  autoCreateShipment: false,
  enabled: true,
  testMode: true,
  enableLogging: true
}

export function useAramexSettingsJSON() {
  const [settings, setSettings] = useState<AramexSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await jsonDataService.getAramexSettings()
      setSettings(data || defaultAramexSettings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگیری تنظیمات آرامکس')
      setSettings(defaultAramexSettings)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: AramexSettings): Promise<boolean> => {
    try {
      setError(null)
      await jsonDataService.updateAramexSettings(newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ذخیره تنظیمات آرامکس')
      return false
    }
  }

  const updateCredentials = async (partialCredentials: Partial<AramexSettings['credentials']>) => {
    if (!settings) return false
    const credentials = { ...settings.credentials, ...partialCredentials }
    const newSettings = { ...settings, credentials }
    return await saveSettings(newSettings)
  }

  const updateShipperInfo = async (partialShipperInfo: Partial<AramexSettings['shipperInfo']>) => {
    if (!settings) return false
    const shipperInfo = { ...settings.shipperInfo, ...partialShipperInfo }
    const newSettings = { ...settings, shipperInfo }
    return await saveSettings(newSettings)
  }

  const toggleService = async (serviceId: string, enabled: boolean) => {
    if (!settings) return false
    const newServices = settings.services.map(service =>
      service.id === serviceId ? { ...service, enabled } : service
    )
    const newSettings = { ...settings, services: newServices }
    return await saveSettings(newSettings)
  }

  const updateServiceLabel = async (serviceId: string, customLabel: string) => {
    if (!settings) return false
    const newServices = settings.services.map(service =>
      service.id === serviceId ? { ...service, customLabel } : service
    )
    const newSettings = { ...settings, services: newServices }
    return await saveSettings(newSettings)
  }

  const toggleAutoCreateShipment = async (enabled: boolean) => {
    if (!settings) return false
    const newSettings = { ...settings, autoCreateShipment: enabled }
    return await saveSettings(newSettings)
  }

  const toggleEnabled = async (enabled: boolean) => {
    if (!settings) return false
    const newSettings = { ...settings, enabled }
    return await saveSettings(newSettings)
  }

  return {
    settings,
    saveSettings,
    loading,
    error,
    reload: loadSettings,
    updateCredentials,
    updateShipperInfo,
    toggleService,
    updateServiceLabel,
    toggleAutoCreateShipment,
    toggleEnabled
  }
}
