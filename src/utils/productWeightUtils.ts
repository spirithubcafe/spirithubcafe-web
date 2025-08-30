import type { Product } from '@/types/index'
import type { SelectedCoffeeOptions } from './coffeePropertyUtils'

/**
 * Calculate the actual weight of a product based on selected coffee properties
 * This function prioritizes coffee property option weights over base product weight
 */
export function calculateProductWeight(
  product: Product,
  selectedProperties: Record<string, string> | SelectedCoffeeOptions = {}
): number {
  // Convert selectedProperties to SelectedCoffeeOptions format if needed
  const selectedOptions: SelectedCoffeeOptions = {}
  
  if (selectedProperties) {
    for (const [propertyId, value] of Object.entries(selectedProperties)) {
      if (Array.isArray(value)) {
        selectedOptions[propertyId] = value
      } else if (typeof value === 'string') {
        selectedOptions[propertyId] = [value]
      }
    }
  }

  // If product has coffee properties and selections are made
  if (product.coffee_properties && product.coffee_properties.length > 0 && Object.keys(selectedOptions).length > 0) {
    // Find the first selected option that has weight_grams
    for (const [propertyId, optionIds] of Object.entries(selectedOptions)) {
      const property = product.coffee_properties.find(p => p.id === propertyId)
      if (!property || !optionIds.length) continue

      const selectedOptionId = optionIds[0] // Take first option
      const selectedOption = property.options.find(o => o.id === selectedOptionId)
      
      if (selectedOption && selectedOption.is_active && selectedOption.weight_grams) {
        return selectedOption.weight_grams / 1000 // Convert grams to kg
      }
    }
  }

  // Fallback to product base weight or default
  if (product.weight_grams) {
    return product.weight_grams / 1000 // Convert grams to kg
  }

  // Default weight fallback
  return 0.5 // 500 grams default
}

/**
 * Get the total weight for all items in cart considering their selected properties
 */
export function calculateCartTotalWeight(
  cartItems: Array<{
    product: Product
    quantity: number
    selectedProperties?: Record<string, string>
  }>
): number {
  return cartItems.reduce((totalWeight, item) => {
    const itemWeight = calculateProductWeight(item.product, item.selectedProperties)
    return totalWeight + (itemWeight * item.quantity)
  }, 0)
}

/**
 * Check if a product has dynamic weight based on coffee properties
 */
export function hasPropertyBasedWeight(product: Product): boolean {
  if (!product.coffee_properties) return false
  
  return product.coffee_properties.some(property => 
    property.is_active && property.options.some(option => 
      option.is_active && option.weight_grams && option.weight_grams > 0
    )
  )
}

/**
 * Get available weight options for a product
 */
export function getProductWeightOptions(product: Product): Array<{
  propertyName: string
  propertyNameAr: string
  options: Array<{
    id: string
    label: string
    labelAr: string
    weightGrams: number
    weightKg: number
  }>
}> {
  if (!product.coffee_properties) return []

  return product.coffee_properties
    .filter(property => property.is_active)
    .map(property => ({
      propertyName: property.name,
      propertyNameAr: property.name_ar,
      options: property.options
        .filter(option => option.is_active && option.weight_grams && option.weight_grams > 0)
        .map(option => ({
          id: option.id,
          label: option.label,
          labelAr: option.label_ar,
          weightGrams: option.weight_grams!,
          weightKg: option.weight_grams! / 1000
        }))
    }))
    .filter(prop => prop.options.length > 0)
}
