import type { Product, CoffeeProperty, CoffeePropertyOption } from '@/types/index'

export interface SelectedCoffeeOptions {
  [propertyId: string]: string[] // property ID -> selected option IDs
}

export interface ProductPricing {
  base_price_omr: number
  base_price_usd: number
  base_price_sar: number
  final_price_omr: number
  final_price_usd: number
  final_price_sar: number
  sale_price_omr?: number
  sale_price_usd?: number
  sale_price_sar?: number
  has_sale: boolean
  selected_options: Array<{
    property_name: string
    property_name_ar: string
    option_label: string
    option_label_ar: string
    price_omr: number
    price_usd: number
    price_sar: number
  }>
}

/**
 * Calculate the final price for a product based on selected coffee properties
 * Unlike traditional variants that modify the base price, coffee properties have individual prices
 * When a coffee property is selected, it replaces the base price entirely
 */
export function calculateProductPricing(
  product: Product,
  selectedOptions: SelectedCoffeeOptions = {}
): ProductPricing {
  const basePricing = {
    base_price_omr: product.price_omr || 0,
    base_price_usd: product.price_usd || 0,
    base_price_sar: product.price_sar || 0,
    final_price_omr: product.price_omr || 0,
    final_price_usd: product.price_usd || 0,
    final_price_sar: product.price_sar || 0,
    has_sale: false,
    selected_options: []
  }

  // If no coffee properties or no selections, return base pricing
  if (!product.coffee_properties || product.coffee_properties.length === 0) {
    return basePricing
  }

  let finalPriceOMR = product.price_omr || 0
  let finalPriceUSD = product.price_usd || 0
  let finalPriceSAR = product.price_sar || 0
  let salePriceOMR: number | undefined
  let salePriceUSD: number | undefined
  let salePriceSAR: number | undefined
  let hasSale = false
  const selectedOptionsDetails: ProductPricing['selected_options'] = []

  // Process each selected coffee property
  for (const [propertyId, optionIds] of Object.entries(selectedOptions)) {
    const property = product.coffee_properties.find(p => p.id === propertyId)
    if (!property || !optionIds.length) continue

    // For coffee properties, we take the first selected option (or combine if multiple selection is allowed)
    const selectedOptionId = optionIds[0] // Take first option for simplicity
    const selectedOption = property.options.find(o => o.id === selectedOptionId)
    
    if (selectedOption && selectedOption.is_active) {
      // Replace the base price with the individual option price
      finalPriceOMR = selectedOption.price_omr
      finalPriceUSD = selectedOption.price_usd
      finalPriceSAR = selectedOption.price_sar

      // Check for sale price
      if (selectedOption.is_on_sale && selectedOption.sale_price_omr) {
        salePriceOMR = selectedOption.sale_price_omr
        salePriceUSD = selectedOption.sale_price_usd
        salePriceSAR = selectedOption.sale_price_sar
        hasSale = true
      }

      selectedOptionsDetails.push({
        property_name: property.name,
        property_name_ar: property.name_ar,
        option_label: selectedOption.label,
        option_label_ar: selectedOption.label_ar,
        price_omr: selectedOption.price_omr,
        price_usd: selectedOption.price_usd,
        price_sar: selectedOption.price_sar
      })

      // For now, we only handle one coffee property at a time
      // In the future, you could implement combination logic for multiple properties
      break
    }
  }

  return {
    base_price_omr: product.price_omr || 0,
    base_price_usd: product.price_usd || 0,
    base_price_sar: product.price_sar || 0,
    final_price_omr: finalPriceOMR,
    final_price_usd: finalPriceUSD,
    final_price_sar: finalPriceSAR,
    sale_price_omr: salePriceOMR,
    sale_price_usd: salePriceUSD,
    sale_price_sar: salePriceSAR,
    has_sale: hasSale,
    selected_options: selectedOptionsDetails
  }
}

/**
 * Get available options for a specific coffee property
 */
export function getAvailableOptionsForProperty(
  property: CoffeeProperty
): CoffeePropertyOption[] {
  return property.options.filter(option => option.is_active)
}

/**
 * Check if a coffee property is required and has no selection
 */
export function isRequiredPropertyMissing(
  property: CoffeeProperty,
  selectedOptions: SelectedCoffeeOptions
): boolean {
  if (!property.required) return false
  
  const propertySelections = selectedOptions[property.id]
  return !propertySelections || propertySelections.length === 0
}

/**
 * Get all missing required properties
 */
export function getMissingRequiredProperties(
  coffeeProperties: CoffeeProperty[],
  selectedOptions: SelectedCoffeeOptions
): CoffeeProperty[] {
  return coffeeProperties.filter(property => 
    isRequiredPropertyMissing(property, selectedOptions)
  )
}

/**
 * Validate that all required coffee properties are selected
 */
export function validateCoffeePropertySelection(
  coffeeProperties: CoffeeProperty[],
  selectedOptions: SelectedCoffeeOptions
): { isValid: boolean; missingProperties: CoffeeProperty[] } {
  const missingProperties = getMissingRequiredProperties(coffeeProperties, selectedOptions)
  
  return {
    isValid: missingProperties.length === 0,
    missingProperties
  }
}

/**
 * Create a URL-safe string representing the selected coffee options
 * This can be used for product URLs or sharing
 */
export function encodeSelectedOptions(selectedOptions: SelectedCoffeeOptions): string {
  const encoded = Object.entries(selectedOptions)
    .map(([propertyId, optionIds]) => `${propertyId}:${optionIds.join(',')}`)
    .join('|')
  
  return encodeURIComponent(encoded)
}

/**
 * Decode a URL-safe string back to selected coffee options
 */
export function decodeSelectedOptions(encoded: string): SelectedCoffeeOptions {
  try {
    const decoded = decodeURIComponent(encoded)
    const result: SelectedCoffeeOptions = {}
    
    decoded.split('|').forEach(part => {
      const [propertyId, optionIds] = part.split(':')
      if (propertyId && optionIds) {
        result[propertyId] = optionIds.split(',')
      }
    })
    
    return result
  } catch (error) {
    console.error('Error decoding selected options:', error)
    return {}
  }
}
