import { type ShippingMethod } from '@/hooks/useCheckoutSettings'

export interface ShippingRate {
  service_name: string
  cost: number
  currency: string
  estimated_delivery_days: string
  error?: string
}

export interface ShippingCalculationRequest {
  origin: {
    country: string
    city: string
    postal_code?: string
  }
  destination: {
    country: string
    city: string
    postal_code?: string
  }
  packages: Array<{
    weight: number // in kg
    length: number // in cm
    width: number // in cm
    height: number // in cm
    value: number // in OMR
  }>
  currency: 'OMR' | 'USD' | 'SAR'
}

export class ShippingService {
  /**
   * Calculate shipping rates for Aramex using real API
   */
  static async calculateAramexRate(
    request: ShippingCalculationRequest,
    method: ShippingMethod
  ): Promise<ShippingRate> {
    try {
      if (!method.api_settings) {
        throw new Error('Aramex API settings not configured')
      }

      // Get Aramex settings from Firestore
      const { firestoreService } = await import('@/lib/firebase')
      let aramexSettings: any = null
      let useRealAPI = false
      
      try {
        const settingsDoc = await firestoreService.getDocument('settings', 'aramex')
        aramexSettings = settingsDoc
        useRealAPI = aramexSettings?.credentials && aramexSettings.enabled
      } catch (settingsError) {
        console.warn('Could not load Aramex settings from Firestore, using weight-based calculation')
        useRealAPI = false
      }

      const totalWeight = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0)
      const isInternational = request.origin.country !== request.destination.country

      // If we have proper Aramex settings, try the real API first
      if (useRealAPI) {
        try {
          const { aramexService } = await import('./aramexService')
          
          const aramexRequest: any = {
            originAddress: {
              line1: aramexSettings.shipperInfo.addressLine1,
              city: aramexSettings.shipperInfo.city,
              stateOrProvinceCode: aramexSettings.shipperInfo.stateProvince,
              postalCode: aramexSettings.shipperInfo.postalCode,
              countryCode: aramexSettings.shipperInfo.countryCode
            },
            destinationAddress: {
              line1: `${request.destination.city}, ${request.destination.country}`,
              city: request.destination.city,
              stateOrProvinceCode: request.destination.city,
              postalCode: request.destination.postal_code || '111',
              countryCode: request.destination.country
            },
            shipmentDetails: {
              dimensions: {
                length: Math.max(...request.packages.map(p => p.length)),
                width: Math.max(...request.packages.map(p => p.width)),
                height: Math.max(...request.packages.map(p => p.height)),
                unit: 'CM'
              },
              actualWeight: {
                value: totalWeight,
                unit: 'KG'
              },
              productGroup: 'EXP',
              productType: request.destination.country === 'OM' ? 'OND' : 'EPX',
              paymentType: 'P',
              paymentOptions: '',
              services: '',
              descriptionOfGoods: 'Coffee Products',
              goodsOriginCountry: 'OM'
            }
          }

          const response = await aramexService.calculateShippingRate(aramexRequest, aramexSettings.credentials)
          
          if (response && response.totalAmount) {
            // Convert from Aramex currency to requested currency
            let cost = response.totalAmount.value
            
            // Aramex typically returns in AED, convert to requested currency
            if (response.totalAmount.currencyCode === 'AED') {
              switch (request.currency) {
                case 'OMR':
                  cost = cost * 0.1 // AED to OMR conversion
                  break
                case 'USD':
                  cost = cost * 0.27 // AED to USD conversion
                  break
                case 'SAR':
                  cost = cost * 1.02 // AED to SAR conversion
                  break
              }
            }
            
            return {
              service_name: 'Aramex Express',
              cost: Math.round(cost * 100) / 100,
              currency: request.currency,
              estimated_delivery_days: request.destination.country === 'OM' ? '1-2 days' : '3-5 days'
            }
          }
        } catch (apiError) {
          console.error('Aramex API call failed, falling back to weight-based calculation:', apiError)
        }
      }

      // Fallback weight-based calculation (always executed if API fails or not available)
      console.log(`Aramex calculation: Weight=${totalWeight}kg, International=${isInternational}, Destination=${request.destination.country}`)
      
      let baseCost = method.base_cost_omr || 1.73
      
      // More accurate weight-based pricing
      if (totalWeight <= 0.5) {
        // Very light packages (up to 0.5kg)
        baseCost = 1.5
      } else if (totalWeight <= 1) {
        // Light packages (0.5-1kg)
        baseCost = 2.0
      } else if (totalWeight <= 2) {
        // Medium packages (1-2kg)
        baseCost = 2.5 + (totalWeight - 1) * 0.8
      } else if (totalWeight <= 5) {
        // Heavy packages (2-5kg)
        baseCost = 3.3 + (totalWeight - 2) * 1.2
      } else {
        // Very heavy packages (5kg+)
        baseCost = 6.9 + (totalWeight - 5) * 1.5
      }
      
      // International surcharge
      if (isInternational) {
        baseCost += Math.min(totalWeight * 0.8, 5.0) // Max 5 OMR international surcharge
      }
      
      // City-specific adjustments (example)
      if (request.destination.city) {
        const city = request.destination.city.toLowerCase()
        if (city.includes('dubai') || city.includes('abu dhabi')) {
          baseCost += 0.5 // Premium destinations
        } else if (city.includes('riyadh') || city.includes('jeddah')) {
          baseCost += 0.3 // Saudi cities
        }
      }

      // Convert to requested currency
      let finalCost = baseCost
      if (request.currency === 'USD') {
        finalCost = baseCost * 2.6
      } else if (request.currency === 'SAR') {
        finalCost = baseCost * 9.75
      }

      return {
        service_name: 'Aramex Express',
        cost: Math.round(finalCost * 100) / 100,
        currency: request.currency,
        estimated_delivery_days: isInternational ? '3-5 days' : '1-2 days'
      }

    } catch (error) {
      console.error('Aramex API error:', error)
      
      // Final fallback to method base cost
      let fallbackCost = method.base_cost_omr || 1.73
      if (request.currency === 'USD') {
        fallbackCost = method.base_cost_usd || 4.5
      } else if (request.currency === 'SAR') {
        fallbackCost = method.base_cost_sar || 16.86
      }
      
      return {
        service_name: 'Aramex Express',
        cost: fallbackCost,
        currency: request.currency,
        estimated_delivery_days: '2-3 days',
        error: 'Could not calculate exact rate, using base rate'
      }
    }
  }

  /**
   * Calculate shipping rates for NOOL Oman
   */
  static async calculateNoolOmanRate(
    request: ShippingCalculationRequest,
    method: ShippingMethod
  ): Promise<ShippingRate> {
    try {
      if (!method.api_settings) {
        throw new Error('NOOL Oman API settings not configured')
      }

      // NOOL Oman API call (simplified)
      /*
      const noolRequest = {
        account_number: method.api_settings.account_number,
        origin: request.origin,
        destination: request.destination,
        packages: request.packages,
        service_type: 'standard'
      }
      */

      // In a real implementation, you would call the NOOL API here
      // const response = await fetch(method.api_settings.api_url + '/calculate-rate', { ... })
      
      // For now, return a calculated rate
      const totalWeight = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0)
      const isWithinOman = request.destination.country === 'OM'
      
      let baseCost = method.base_cost_omr || 2.0
      
      if (!isWithinOman) {
        // NOOL primarily serves Oman, higher cost for international
        baseCost += 5.0
      }
      
      // Weight-based pricing
      if (totalWeight > 2) {
        baseCost += (totalWeight - 2) * 0.75
      }

      // Convert to requested currency
      let finalCost = baseCost
      if (request.currency === 'USD') {
        finalCost = baseCost * 2.6
      } else if (request.currency === 'SAR') {
        finalCost = baseCost * 9.75
      }

      return {
        service_name: 'NOOL Oman',
        cost: Math.round(finalCost * 100) / 100,
        currency: request.currency,
        estimated_delivery_days: isWithinOman ? '1-2 days' : '3-4 days'
      }

    } catch (error) {
      console.error('NOOL Oman API error:', error)
      return {
        service_name: 'NOOL Oman',
        cost: method.base_cost_omr || 2.0,
        currency: 'OMR',
        estimated_delivery_days: '1-2 days',
        error: 'Could not calculate exact rate, using base rate'
      }
    }
  }

  /**
   * Calculate shipping rates for all available methods
   */
  static async calculateShippingRates(
    request: ShippingCalculationRequest,
    methods: ShippingMethod[]
  ): Promise<ShippingRate[]> {
    const results: ShippingRate[] = []

    for (const method of methods) {
      if (!method.enabled) continue

      try {
        let rate: ShippingRate

        if (method.is_free) {
          rate = {
            service_name: method.name,
            cost: 0,
            currency: request.currency,
            estimated_delivery_days: method.estimated_delivery_days || 'Same day'
          }
        } else if (method.pricing_type === 'api_calculated') {
          if (method.api_settings?.provider === 'aramex') {
            rate = await this.calculateAramexRate(request, method)
          } else if (method.api_settings?.provider === 'nool_oman') {
            rate = await this.calculateNoolOmanRate(request, method)
          } else {
            // Fallback to flat rate
            rate = {
              service_name: method.name,
              cost: this.getFlatRate(method, request.currency),
              currency: request.currency,
              estimated_delivery_days: method.estimated_delivery_days || '2-3 days'
            }
          }
        } else {
          // Flat rate or other pricing types
          rate = {
            service_name: method.name,
            cost: this.getFlatRate(method, request.currency),
            currency: request.currency,
            estimated_delivery_days: method.estimated_delivery_days || '2-3 days'
          }
        }

        results.push(rate)
      } catch (error) {
        console.error(`Error calculating rate for ${method.name}:`, error)
        // Add fallback rate
        results.push({
          service_name: method.name,
          cost: this.getFlatRate(method, request.currency),
          currency: request.currency,
          estimated_delivery_days: method.estimated_delivery_days || '2-3 days',
          error: 'Rate calculation failed, using base rate'
        })
      }
    }

    return results
  }

  /**
   * Get flat rate for a shipping method
   */
  private static getFlatRate(method: ShippingMethod, currency: string): number {
    switch (currency) {
      case 'OMR':
        return method.base_cost_omr || 0
      case 'USD':
        return method.base_cost_usd || 0
      case 'SAR':
        return method.base_cost_sar || 0
      default:
        return method.base_cost_omr || 0
    }
  }
}

/**
 * Hook for using shipping calculations
 */
export const useShippingCalculation = () => {
  const calculateRates = async (
    request: ShippingCalculationRequest,
    methods: ShippingMethod[]
  ): Promise<ShippingRate[]> => {
    return await ShippingService.calculateShippingRates(request, methods)
  }

  return {
    calculateRates
  }
}
