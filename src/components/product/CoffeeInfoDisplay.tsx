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
      label: isArabic ? 'الاستخدامات' : 'Uses', 
      value: isArabic ? (uses_ar || uses) : uses, 
      icon: <Coffee className="h-5 w-5 text-amber-800 dark:text-amber-200" />
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
    }
  ].filter(item => item.value && item.value.trim())

  if (coffeeInfo.length === 0) {
    return null
  }

  return (
    <Card className={className}>
      <CardContent className="p-5" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className={`flex items-center gap-2 mb-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <Coffee className="h-5 w-5 text-amber-800 dark:text-amber-200" />
          <h3 className="font-medium text-sm">
            {t('product.coffeeInformation')}
          </h3>
        </div>
        <div className="space-y-3">
          {coffeeInfo.map((item, index) => (
            <div key={index} className="w-full">
              {isArabic ? (
                <div className="flex items-center text-sm" dir="rtl">
                  {item.icon}
                  <span className="text-muted-foreground font-medium mx-2">
                    {item.label}:
                  </span>
                  <span className="font-medium text-foreground mr-auto">
                    {item.value}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-sm">
                  {item.icon}
                  <span className="text-muted-foreground font-medium mx-2">
                    {item.label}:
                  </span>
                  <span className="font-medium text-foreground ml-auto">
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
