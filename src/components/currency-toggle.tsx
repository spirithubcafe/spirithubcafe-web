import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrency } from '@/components/currency-provider'
import { useTranslation } from 'react-i18next'

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency()
  const { t } = useTranslation()

  const currencies = [
    { code: 'USD', flag: '🇺🇸', name: t('currency.usd') },
    { code: 'SAR', flag: '🇸🇦', name: t('currency.sar') },
    { code: 'OMR', flag: '🇴🇲', name: t('currency.omr') },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <DollarSign className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle currency</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((curr) => (
          <DropdownMenuItem 
            key={curr.code}
            onClick={() => setCurrency(curr.code as any)}
            className={currency === curr.code ? 'bg-accent' : ''}
          >
            <span className="mr-2">{curr.flag}</span>
            <span className="font-medium">{curr.code}</span>
            <span className="ml-2 text-muted-foreground">{curr.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
