import type { Product } from '@/types'
import { conversionRates } from '@/lib/currency'

export const getProductPriceDetails = (product: Product, selectedProperties?: Record<string, string>, currency: 'USD' | 'OMR' | 'SAR' = 'OMR') => {
  // Base price
  let basePrice = 0
  
  if (currency === 'USD') {
    basePrice = product.price_usd
  } else if (currency === 'SAR') {
    basePrice = product.price_sar || product.price_usd * conversionRates.SAR
  } else {
    basePrice = product.price_omr || product.price_usd * conversionRates.OMR
  }

  // Property modifications
  let propertyModifier = 0
  let onSale = false
  let salePrice = basePrice

  if (selectedProperties && product.properties && Object.keys(selectedProperties).length > 0) {
    for (const [propertyName, selectedValue] of Object.entries(selectedProperties)) {
      const property = product.properties.find(p => p.name === propertyName)
      if (!property || !property.options) continue

      const selectedOption = property.options.find(opt => opt.value === selectedValue)
      if (!selectedOption) continue

      // Check if option has specific price
      const optionOnSale = selectedOption.on_sale || selectedOption.is_on_sale

      if (currency === 'USD' && selectedOption.price_usd) {
        if (optionOnSale && selectedOption.sale_price_usd) {
          salePrice = selectedOption.sale_price_usd
          onSale = true
        } else {
          basePrice = selectedOption.price_usd
        }
      } else if (currency === 'SAR' && selectedOption.price_sar) {
        if (optionOnSale && selectedOption.sale_price_sar) {
          salePrice = selectedOption.sale_price_sar
          onSale = true
        } else {
          basePrice = selectedOption.price_sar
        }
      } else if (currency === 'OMR' && selectedOption.price_omr) {
        if (optionOnSale && selectedOption.sale_price_omr) {
          salePrice = selectedOption.sale_price_omr
          onSale = true
        } else {
          basePrice = selectedOption.price_omr
        }
      } else if (selectedOption.price_modifier) {
        // Use modifier
        if (optionOnSale && selectedOption.sale_price_modifier_omr) {
          propertyModifier += selectedOption.sale_price_modifier_omr
          onSale = true
        } else {
          propertyModifier += selectedOption.price_modifier
        }
      }
    }
  }

  const finalPrice = onSale ? salePrice : (basePrice + propertyModifier)

  return {
    basePrice,
    propertyModifier,
    finalPrice,
    onSale,
    originalPrice: onSale ? basePrice : null
  }
}

export const getProductPriceWithProperties = (product: Product | null, selectedProperties?: Record<string, string>, currency: 'USD' | 'OMR' | 'SAR' = 'OMR'): number => {
  if (!product) return 0
  const priceDetails = getProductPriceDetails(product, selectedProperties, currency)
  return priceDetails.finalPrice
}
