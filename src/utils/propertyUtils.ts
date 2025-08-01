import type { ProductPropertyOption } from '@/lib/firebase'

// Helper function for backward compatibility
export function getPropertyPrice(option: ProductPropertyOption | any): number {
  // Try new format first
  if (option.price_modifier_omr !== undefined) {
    return option.price_modifier_omr
  }
  
  // Fall back to old format
  if (option.price_modifier !== undefined) {
    return option.price_modifier
  }
  
  return 0
}

// Helper function to get property price in specific currency
export function getPropertyPriceInCurrency(
  option: ProductPropertyOption | any, 
  currency: 'omr' | 'usd' | 'sar' = 'omr'
): number {
  const isOnSale = option.on_sale && 
    (!option.sale_start_date || new Date(option.sale_start_date) <= new Date()) &&
    (!option.sale_end_date || new Date(option.sale_end_date) >= new Date())
  
  if (isOnSale) {
    // Try sale prices first
    switch (currency) {
      case 'usd': 
        return option.sale_price_modifier_usd || option.price_modifier_usd || getPropertyPrice(option) * 2.6
      case 'sar': 
        return option.sale_price_modifier_sar || option.price_modifier_sar || getPropertyPrice(option) * 3.75
      default: 
        return option.sale_price_modifier_omr || option.price_modifier_omr || getPropertyPrice(option)
    }
  } else {
    // Regular prices
    switch (currency) {
      case 'usd': 
        return option.price_modifier_usd || getPropertyPrice(option) * 2.6
      case 'sar': 
        return option.price_modifier_sar || getPropertyPrice(option) * 3.75
      default: 
        return option.price_modifier_omr || getPropertyPrice(option)
    }
  }
}
