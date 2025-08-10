import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Coffee, 
  Flame, 
  Droplet, 
  Wheat, 
  Mountain, 
  Flower2, 
  Home 
} from 'lucide-react'

interface CoffeeInfoDisplayProps {
  roastLevel?: string
  process?: string
  variety?: string
  altitude?: string
  notes?: string
  uses?: string
  farm?: string
  className?: string
}

export default function CoffeeInfoDisplay({
  roastLevel,
  process,
  variety,
  altitude,
  notes,
  uses,
  farm,
  className
}: CoffeeInfoDisplayProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Filter out empty fields and add icons
  const coffeeInfo = [
    { 
      label: isArabic ? 'درجة التحميص' : 'Roast Level', 
      value: roastLevel, 
      icon: <Flame className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'المعالجة' : 'Process', 
      value: process, 
      icon: <Droplet className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'النوع' : 'Variety', 
      value: variety, 
      icon: <Wheat className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الارتفاع' : 'Altitude', 
      value: altitude, 
      icon: <Mountain className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الملاحظات' : 'Notes', 
      value: notes, 
      icon: <Flower2 className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الاستخدامات' : 'Uses', 
      value: uses, 
      icon: <Coffee className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'المزرعة' : 'Farm', 
      value: farm, 
      icon: <Home className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    }
  ].filter(item => item.value && item.value.trim())

  if (coffeeInfo.length === 0) {
    return null
  }

  return (
    <Card className={className} >
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="h-5 w-5 text-amber-800 dark:text-amber-200" />
          <h3 className="font-medium text-sm">
            {t('product.coffeeInformation')}
          </h3>
        </div>
        <div className="space-y-2">
          {coffeeInfo.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm gap-3">
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-muted-foreground font-medium">
                  {item.label}:
                </span>
              </div>
              <span className="text-right flex-1" dir={isArabic ? 'rtl' : 'ltr'}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
