export type Currency = 'USD' | 'SAR' | 'OMR'

export const currencySymbols = {
  USD: '$',
  SAR: 'ر.س',
  OMR: 'ر.ع'
} as const

export const currencySymbolsEnglish = {
  USD: '$',
  SAR: 'SAR',
  OMR: 'OMR'
} as const

export const conversionRates = {
  USD: 2.6,
  SAR: 9.75,
  OMR: 1
} as const

export type CurrencyProviderState = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (price: number) => string
  getSymbol: () => string
}

export const formatPrice = (price: number, currency: Currency, isArabic: boolean = true): string => {
  const symbol = isArabic ? currencySymbols[currency] : currencySymbolsEnglish[currency]
  
  // Format based on currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: currency === 'OMR' ? 3 : 2,
    maximumFractionDigits: currency === 'OMR' ? 3 : 2,
  }).format(price)

  // For Arabic currencies and OMR, put symbol after number
  if (currency === 'SAR' || currency === 'OMR') {
    return `${formattedPrice} ${symbol}`
  }
  
  return `${symbol}${formattedPrice}`
}

export const convertPrice = (priceInOMR: number, toCurrency: Currency): number => {
  return priceInOMR * conversionRates[toCurrency]
}
