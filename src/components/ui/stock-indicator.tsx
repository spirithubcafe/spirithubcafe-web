import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StockIndicatorProps {
  stock: number
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  lowStockThreshold?: number
  outOfStockThreshold?: number
}

export function StockIndicator({ 
  stock, 
  className,
  showIcon = true,
  variant = 'default',
  lowStockThreshold = 10,
  outOfStockThreshold = 0
}: StockIndicatorProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const getStockStatus = () => {
    if (stock <= outOfStockThreshold) {
      return {
        status: 'out-of-stock',
        label: isArabic ? 'غير متوفر' : 'Out of Stock',
        color: 'destructive',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        textColor: 'text-red-700 dark:text-red-400',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertTriangle
      }
    } else if (stock <= lowStockThreshold) {
      return {
        status: 'low-stock',
        label: isArabic ? `${stock} فقط متبقي` : `Only ${stock} left`,
        color: 'secondary',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        textColor: 'text-amber-700 dark:text-amber-400',
        borderColor: 'border-amber-200 dark:border-amber-800',
        icon: Package
      }
    } else {
      return {
        status: 'in-stock',
        label: isArabic ? 'متوفر' : 'In Stock',
        color: 'default',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        textColor: 'text-green-700 dark:text-green-400',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle
      }
    }
  }

  const stockInfo = getStockStatus()
  const Icon = stockInfo.icon

  if (variant === 'compact') {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
        stockInfo.bgColor,
        stockInfo.textColor,
        stockInfo.borderColor,
        className
      )}>
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{stockInfo.label}</span>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border",
        stockInfo.bgColor,
        stockInfo.borderColor,
        className
      )}>
        <div className="flex items-center gap-2">
          {showIcon && <Icon className={cn("h-4 w-4", stockInfo.textColor)} />}
          <span className={cn("font-medium", stockInfo.textColor)}>
            {stockInfo.label}
          </span>
        </div>
        <div className={cn("text-sm font-bold", stockInfo.textColor)}>
          {stock > 0 ? stock : 0} {isArabic ? 'قطعة' : 'items'}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <Badge 
      variant={stockInfo.color as any}
      className={cn(
        "flex items-center gap-1.5 text-xs",
        stockInfo.status === 'out-of-stock' && "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400",
        stockInfo.status === 'low-stock' && "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400",
        stockInfo.status === 'in-stock' && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400",
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {stockInfo.label}
    </Badge>
  )
}

export default StockIndicator
