import React, { useEffect, useState } from 'react'
import type { Currency } from '@/lib/currency'
import { currencySymbols } from '@/lib/currency'
import { CurrencyProviderContext } from '@/hooks/useCurrency'

type CurrencyProviderProps = {
  children: React.ReactNode
  defaultCurrency?: Currency
  storageKey?: string
}

export function CurrencyProvider({
  children,
  defaultCurrency = 'OMR',
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
    // Price is already converted in the component level (getProductPrice)
    // We just need to format and add the symbol
    const symbol = currencySymbols[currency]
    
    // Format based on currency
    const formattedPrice = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency === 'OMR' ? 3 : 2,
      maximumFractionDigits: currency === 'OMR' ? 3 : 2,
    }).format(price)

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
