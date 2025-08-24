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
   * Calculate shipping rates for Aramex
   */
  static async calculateAramexRate(
    request: ShippingCalculationRequest,
    method: ShippingMethod
  ): Promise<ShippingRate> {
    try {
      if (!method.api_settings) {
        throw new Error('Aramex API settings not configured')
      }

      // const { username, password, account_number } = method.api_settings

      // Aramex API call (This is a simplified version - real implementation would need proper SOAP/REST API)
      /*
      const aramexRequest = {
        ClientInfo: {
          UserName: username,
          Password: password,
          AccountNumber: account_number,
          AccountPin: '', // Add if required
          AccountEntity: 'MCT',
          AccountCountryCode: 'OM',
          Source: 24 // Source ID
        },
        OriginAddress: {
          Country: request.origin.country,
          City: request.origin.city,
          PostCode: request.origin.postal_code || ''
        },
        DestinationAddress: {
          Country: request.destination.country,
          City: request.destination.city,
          PostCode: request.destination.postal_code || ''
        },
        ShipmentDetails: {
          Dimensions: request.packages.map(pkg => ({
            Length: pkg.length,
            Width: pkg.width,
            Height: pkg.height,
            Unit: 'CM'
          })),
          ActualWeight: {
            Value: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
            Unit: 'KG'
          },
          ChargeableWeight: {
            Value: request.packages.reduce((sum, pkg) => sum + pkg.weight, 0),
            Unit: 'KG'
          },
          CashOnDeliveryAmount: {
            Value: 0,
            CurrencyCode: request.currency
          },
          InsuranceAmount: {
            Value: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
            CurrencyCode: request.currency
          },
          NumberOfPieces: request.packages.length,
          ProductGroup: 'EXP', // Express
          ProductType: 'PDX', // Aramex product type
          PaymentType: 'P', // Prepaid
          PaymentOptions: '',
          Services: '',
          CashAdditionalAmount: {
            Value: 0,
            CurrencyCode: request.currency
          },
          CashAdditionalAmountDescription: '',
          CollectAmount: {
            Value: 0,
            CurrencyCode: request.currency
          },
          CustomsValueAmount: {
            Value: request.packages.reduce((sum, pkg) => sum + pkg.value, 0),
            CurrencyCode: request.currency
          },
          Items: request.packages.map(pkg => ({
            PackageType: 'Box',
            Quantity: 1,
            Weight: {
              Value: pkg.weight,
              Unit: 'KG'
            },
            Comments: 'Coffee products',
            Reference: ''
          }))
        }
      }
      */

      // In a real implementation, you would call the Aramex API here
      // const response = await fetch(method.api_settings.api_url, { ... })
      
      // For now, return a calculated rate based on weight and distance
      const totalWeight = request.packages.reduce((sum, pkg) => sum + pkg.weight, 0)
      const isInternational = request.origin.country !== request.destination.country
      
      let baseCost = method.base_cost_omr || 1.73
      
      // Add weight-based cost
      if (totalWeight > 1) {
        baseCost += (totalWeight - 1) * 0.5 // 0.5 OMR per additional kg
      }
      
      // Add international surcharge
      if (isInternational) {
        baseCost += 2.0
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
      return {
        service_name: 'Aramex Express',
        cost: method.base_cost_omr || 1.73,
        currency: 'OMR',
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
