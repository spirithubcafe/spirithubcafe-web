import React, { createContext, useContext, useEffect, useState } from 'react'

type Currency = 'USD' | 'SAR' | 'OMR'

type CurrencyProviderProps = {
  children: React.ReactNode
  defaultCurrency?: Currency
  storageKey?: string
}

type CurrencyProviderState = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (price: number) => string
  getSymbol: () => string
}

const initialState: CurrencyProviderState = {
  currency: 'USD',
  setCurrency: () => null,
  formatPrice: () => '',
  getSymbol: () => '',
}

const CurrencyProviderContext = createContext<CurrencyProviderState>(initialState)

const currencySymbols = {
  USD: '$',
  SAR: 'ر.س',
  OMR: 'ر.ع'
}

const currencyRates = {
  USD: 1,
  SAR: 3.75, // 1 USD = 3.75 SAR
  OMR: 0.385 // 1 USD = 0.385 OMR
}

export function CurrencyProvider({
  children,
  defaultCurrency = 'USD',
  storageKey = 'spirithub-currency',
  ...props
}: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<Currency>(
    () => (localStorage.getItem(storageKey) as Currency) || defaultCurrency
  )

  useEffect(() => {
    localStorage.setItem(storageKey, currency)
  }, [currency, storageKey])

  const formatPrice = (price: number): string => {
    const convertedPrice = price * currencyRates[currency]
    const symbol = currencySymbols[currency]
    
    // Format based on currency
    const formattedPrice = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'OMR' ? 3 : 2,
      maximumFractionDigits: currency === 'OMR' ? 3 : 2,
    }).format(convertedPrice)

    // For Arabic currencies, put symbol after number
    if (currency === 'SAR' || currency === 'OMR') {
      return `${formattedPrice} ${symbol}`
    }
    
    return `${symbol}${formattedPrice}`
  }

  const getSymbol = (): string => {
    return currencySymbols[currency]
  }

  const value = {
    currency,
    setCurrency: (currency: Currency) => {
      setCurrency(currency)
    },
    formatPrice,
    getSymbol,
  }

  return (
    <CurrencyProviderContext.Provider {...props} value={value}>
      {children}
    </CurrencyProviderContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext)

  if (context === undefined)
    throw new Error('useCurrency must be used within a CurrencyProvider')

  return context
}
