import { useContext, createContext } from 'react'
import type { CurrencyProviderState } from '@/lib/currency'

const initialState: CurrencyProviderState = {
  currency: 'OMR',
  setCurrency: () => null,
  formatPrice: () => '',
  getSymbol: () => '',
}

export const CurrencyProviderContext = createContext<CurrencyProviderState>(initialState)

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext)

  if (context === undefined)
    throw new Error('useCurrency must be used within a CurrencyProvider')

  return context
}
