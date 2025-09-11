import { jsonAramexService } from '@/services/jsonSettingsService'
import type { AramexSettings } from '@/types/aramex'

// Default Aramex settings with provided credentials
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

/**
 * Initialize Aramex settings in JSON storage
 * This function should be called once to set up default settings
 */
export async function initializeAramexSettings(): Promise<boolean> {
  try {
    // Check if settings already exist
    const existingSettings = await jsonAramexService.getAramexSettings()
    
    if (existingSettings) {
      console.log('Aramex settings already exist')
      return true
    }

    // Insert default settings
    await jsonAramexService.saveAramexSettings(defaultAramexSettings)
    console.log('Default Aramex settings have been successfully saved to JSON')
    return true
  } catch (error) {
    console.error('Error initializing Aramex settings:', error)
    return false
  }
}

/**
 * Update Aramex settings in JSON storage
 */
export async function updateAramexSettings(settings: AramexSettings): Promise<boolean> {
  try {
    await jsonAramexService.saveAramexSettings(settings)
    console.log('Aramex settings updated successfully')
    return true
  } catch (error) {
    console.error('Error updating Aramex settings:', error)
    return false
  }
}

/**
 * Get current Aramex settings from JSON storage
 */
export async function getAramexSettings(): Promise<AramexSettings | null> {
  try {
    const settings = await jsonAramexService.getAramexSettings()
    return settings as AramexSettings | null
  } catch (error) {
    console.error('Error fetching Aramex settings:', error)
    return null
  }
}

export { defaultAramexSettings }
