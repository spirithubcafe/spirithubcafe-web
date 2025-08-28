import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Coffee, 
  Flame, 
  Droplet, 
  Wheat, 
  Mountain, 
  Flower2, 
  Home,
  Zap,
  Target,
  Sparkles
} from 'lucide-react'

interface CoffeeInfoDisplayProps {
  roastLevel?: string
  roastLevel_ar?: string
  process?: string
  process_ar?: string
  variety?: string
  variety_ar?: string
  altitude?: string
  altitude_ar?: string
  notes?: string
  notes_ar?: string
  uses?: string
  uses_ar?: string
  farm?: string
  farm_ar?: string
  aromatic_profile?: string
  aromatic_profile_ar?: string
  intensity?: string
  intensity_ar?: string
  compatibility?: string
  compatibility_ar?: string
  className?: string
}

export default function CoffeeInfoDisplay({
  roastLevel,
  roastLevel_ar,
  process,
  process_ar,
  variety,
  variety_ar,
  altitude,
  altitude_ar,
  notes,
  notes_ar,
  uses,
  uses_ar,
  farm,
  farm_ar,
  aromatic_profile,
  aromatic_profile_ar,
  intensity,
  intensity_ar,
  compatibility,
  compatibility_ar,
  className
}: CoffeeInfoDisplayProps) {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  // Filter out empty fields and add icons
  const coffeeInfo = [
    { 
      label: isArabic ? 'درجة التحميص' : 'Roast Level', 
      value: isArabic ? (roastLevel_ar || roastLevel) : roastLevel, 
      icon: <Flame className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'المعالجة' : 'Process', 
      value: isArabic ? (process_ar || process) : process, 
      icon: <Droplet className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'النوع' : 'Variety', 
      value: isArabic ? (variety_ar || variety) : variety, 
      icon: <Wheat className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الارتفاع' : 'Altitude', 
      value: isArabic ? (altitude_ar || altitude) : altitude, 
      icon: <Mountain className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الملاحظات' : 'Notes', 
      value: isArabic ? (notes_ar || notes) : notes, 
      icon: <Flower2 className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'المزرعة' : 'Farm', 
      value: isArabic ? (farm_ar || farm) : farm, 
      icon: <Home className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الملف العطري' : 'Aromatic Profile', 
      value: isArabic ? (aromatic_profile_ar || aromatic_profile) : aromatic_profile, 
      icon: <Sparkles className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الكثافة' : 'Intensity', 
      value: isArabic ? (intensity_ar || intensity) : intensity, 
      icon: <Zap className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'التوافق' : 'Compatibility', 
      value: isArabic ? (compatibility_ar || compatibility) : compatibility, 
      icon: <Target className="h-5 w-5 text-amber-800 dark:text-amber-200" />
    },
    { 
      label: isArabic ? 'الاستخدامات' : 'Uses', 
      value: isArabic ? (uses_ar || uses) : uses, 
      icon: <Coffee className="h-5 w-5 text-red-600 dark:text-red-400 font-bold" />,
      highlight: true
    }
  ].filter(item => item.value && item.value.trim())

  if (coffeeInfo.length === 0) {
    return null
  }

  return (
    <Card className={`${className} compact-mode py-0`}>
      <CardContent className="p-3" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className={`w-full mb-2 ${isArabic ? 'text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 ${isArabic ? 'justify-end' : 'justify-start'}`}>
            <Coffee className="h-4 w-4 text-amber-800 dark:text-amber-200" />
            <h3 className="font-medium text-sm">
              {t('product.coffeeInformation')}
            </h3>
          </div>
        </div>
        <div className="space-y-2">
          {coffeeInfo.map((item, index) => (
            <div key={index} className={`w-full ${(item as any).highlight ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-2' : ''}`}>
              {isArabic ? (
                <div className="flex items-center text-xs text-right" dir="rtl">
                  {item.icon}
                  <span className={`font-medium mx-1.5 ${(item as any).highlight ? 'text-red-700 dark:text-red-300 font-semibold' : 'text-muted-foreground'}`}>
                    {item.label}:
                  </span>
                  <span className={`font-medium mr-auto text-right ${(item as any).highlight ? 'text-red-800 dark:text-red-200 font-semibold' : 'text-foreground'}`}>
                    {item.value}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-xs">
                  {item.icon}
                  <span className={`font-medium mx-1.5 ${(item as any).highlight ? 'text-red-700 dark:text-red-300 font-semibold' : 'text-muted-foreground'}`}>
                    {item.label}:
                  </span>
                  <span className={`font-medium ml-auto ${(item as any).highlight ? 'text-red-800 dark:text-red-200 font-semibold' : 'text-foreground'}`}>
                    {item.value}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
