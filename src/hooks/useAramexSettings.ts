import { useState, useEffect } from 'react'
import { firestoreService } from '@/lib/firebase'
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
    stateProvince: 'Muscat',
    postalCode: '111',
    countryCode: 'OM'
  },
  services: [
    {
      id: 'OND',
      name: 'Aramex Domestic',
      customLabel: 'Aramex Domestic (OND)',
      type: 'domestic',
      enabled: true
    },
    {
      id: 'CDS',
      name: 'Cash on Delivery',
      customLabel: 'Cash on Delivery (CDS)',
      type: 'domestic',
      enabled: true
    },
    {
      id: 'EPX',
      name: 'Aramex Express',
      customLabel: 'Aramex Express (EPX)',
      type: 'international',
      enabled: true
    },
    {
      id: 'PPX',
      name: 'Aramex Priority',
      customLabel: 'Aramex Priority (PPX)',
      type: 'international',
      enabled: true
    },
    {
      id: 'GRD',
      name: 'Aramex Ground',
      customLabel: 'Aramex Ground (GRD)',
      type: 'international',
      enabled: true
    }
  ],
  autoCreateShipment: true,
  enabled: true,
  testMode: false,
  enableLogging: true
}

export function useAramexSettings() {
  const [settings, setSettings] = useState<AramexSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const settingsDoc = await firestoreService.getDocument('settings', 'aramex')
      
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AramexSettings)
      } else {
        // Initialize with default settings if doesn't exist
        await saveSettings(defaultAramexSettings)
        setSettings(defaultAramexSettings)
      }
    } catch (err) {
      console.error('Error fetching Aramex settings:', err)
      setError('Failed to fetch Aramex settings')
      // Fallback to default settings
      setSettings(defaultAramexSettings)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (newSettings: AramexSettings) => {
    try {
      setError(null)
      await firestoreService.setDocument('settings', 'aramex', newSettings)
      setSettings(newSettings)
      return true
    } catch (err) {
      console.error('Error saving Aramex settings:', err)
      setError('Failed to save Aramex settings')
      return false
    }
  }

  const updateCredentials = async (credentials: Partial<AramexSettings['credentials']>) => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      credentials: {
        ...settings.credentials,
        ...credentials
      }
    }
    
    return await saveSettings(updatedSettings)
  }

  const updateShipperInfo = async (shipperInfo: Partial<AramexSettings['shipperInfo']>) => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      shipperInfo: {
        ...settings.shipperInfo,
        ...shipperInfo
      }
    }
    
    return await saveSettings(updatedSettings)
  }

  const toggleService = async (serviceId: string, enabled: boolean) => {
    if (!settings) return false
    
    const updatedServices = settings.services.map(service =>
      service.id === serviceId ? { ...service, enabled } : service
    )
    
    const updatedSettings = {
      ...settings,
      services: updatedServices
    }
    
    return await saveSettings(updatedSettings)
  }

  const updateServiceLabel = async (serviceId: string, customLabel: string) => {
    if (!settings) return false
    
    const updatedServices = settings.services.map(service =>
      service.id === serviceId ? { ...service, customLabel } : service
    )
    
    const updatedSettings = {
      ...settings,
      services: updatedServices
    }
    
    return await saveSettings(updatedSettings)
  }

  const toggleAutoCreateShipment = async (autoCreate: boolean) => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      autoCreateShipment: autoCreate
    }
    
    return await saveSettings(updatedSettings)
  }

  const toggleEnabled = async (enabled: boolean) => {
    if (!settings) return false
    
    const updatedSettings = {
      ...settings,
      enabled
    }
    
    return await saveSettings(updatedSettings)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateCredentials,
    updateShipperInfo,
    toggleService,
    updateServiceLabel,
    toggleAutoCreateShipment,
    toggleEnabled,
    refetch: fetchSettings
  }
}
