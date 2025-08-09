import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Coffee } from 'lucide-react'

interface CoffeeInfoDisplayProps {
  roastLevel?: string
  process?: string
  variety?: string
  altitude?: string
  notes?: string
  farm?: string
  className?: string
}

export default function CoffeeInfoDisplay({
  roastLevel,
  process,
  variety,
  altitude,
  notes,
  farm,
  className
}: CoffeeInfoDisplayProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Filter out empty fields
  const coffeeInfo = [
    { label: isArabic ? 'درجة التحميص' : 'Roast Level', value: roastLevel },
    { label: isArabic ? 'المعالجة' : 'Process', value: process },
    { label: isArabic ? 'النوع' : 'Variety', value: variety },
    { label: isArabic ? 'الارتفاع' : 'Altitude', value: altitude },
    { label: isArabic ? 'الملاحظات' : 'Notes', value: notes },
    { label: isArabic ? 'المزرعة' : 'Farm', value: farm }
  ].filter(item => item.value && item.value.trim())

  if (coffeeInfo.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Coffee className="h-4 w-4 text-amber-600" />
          <h3 className="font-medium text-sm">
            {isArabic ? 'معلومات القهوة' : 'Coffee Information'}
          </h3>
        </div>
        <div className="space-y-2">
          {coffeeInfo.map((item, index) => (
            <div key={index} className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground font-medium">
                {item.label}:
              </span>
              <span className="text-right flex-1 ml-2" dir={isArabic ? 'rtl' : 'ltr'}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
