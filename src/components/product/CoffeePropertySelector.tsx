import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Coffee, AlertCircle } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { formatPrice as formatPriceUtil } from '@/lib/currency'
import type { CoffeeProperty } from '@/types/index'
import type { SelectedCoffeeOptions, ProductPricing } from '@/utils/coffeePropertyUtils'
import { 
  calculateProductPricing, 
  validateCoffeePropertySelection,
  getAvailableOptionsForProperty 
} from '@/utils/coffeePropertyUtils'

interface CoffeePropertySelectorProps {
  coffeeProperties: CoffeeProperty[]
  selectedOptions: SelectedCoffeeOptions
  onSelectionChange: (selectedOptions: SelectedCoffeeOptions) => void
  onPricingChange: (pricing: ProductPricing) => void
  baseProduct: {
    price_omr?: number
    price_usd?: number
    price_sar?: number
  }
}

export default function CoffeePropertySelector({
  coffeeProperties,
  selectedOptions,
  onSelectionChange,
  onPricingChange,
  baseProduct
}: CoffeePropertySelectorProps) {
  const { t, i18n } = useTranslation()
  const { currency } = useCurrency()
  const isArabic = i18n.language === 'ar'

  // Update pricing when selections change
  useEffect(() => {
    const product = {
      ...baseProduct,
      coffee_properties: coffeeProperties
    }
    const pricing = calculateProductPricing(product as any, selectedOptions)
    onPricingChange(pricing)
  }, [selectedOptions, coffeeProperties, baseProduct, onPricingChange])

  const handleOptionSelect = (propertyId: string, optionId: string, isMultiple: boolean) => {
    const newSelections = { ...selectedOptions }

    if (isMultiple) {
      // For now, we'll treat multiple selection as single selection
      // This can be enhanced later if needed
      newSelections[propertyId] = [optionId]
    } else {
      // Handle single selection
      newSelections[propertyId] = [optionId]
    }

    // Clean up empty arrays
    if (newSelections[propertyId]?.length === 0) {
      delete newSelections[propertyId]
    }

    onSelectionChange(newSelections)
  }

  const formatOptionPrice = (price: number) => {
    return formatPriceUtil(price, currency)
  }

  const getPropertyValidation = () => {
    return validateCoffeePropertySelection(coffeeProperties, selectedOptions)
  }

  const renderPropertyOptions = (property: CoffeeProperty) => {
    const availableOptions = getAvailableOptionsForProperty(property)
    const propertySelections = selectedOptions[property.id] || []

    // For now, all properties use radio selection (single choice)
    // Multiple selection can be added later if needed
    return (
      <RadioGroup
        value={propertySelections[0] || ''}
        onValueChange={(optionId) => handleOptionSelect(property.id, optionId, false)}
        className="space-y-3"
      >
        {availableOptions.map((option) => (
          <div key={option.id} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.id}
              id={`${property.id}-${option.id}`}
              className="mt-1"
            />
            <div className="flex-1">
              <Label
                htmlFor={`${property.id}-${option.id}`}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <span className="font-medium">
                    {isArabic ? option.label_ar : option.label}
                  </span>
                  {option.is_on_sale && option.sale_price_omr && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {isArabic ? 'تخفيض' : 'Sale'}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {option.is_on_sale && option.sale_price_omr ? (
                    <div>
                      <span className="price-original text-sm line-through text-muted-foreground">
                        {formatOptionPrice(option.price_omr)}
                      </span>
                      <span className="ml-2 price-sale font-bold">
                        {formatOptionPrice(option.sale_price_omr)}
                      </span>
                    </div>
                  ) : (
                    <span className="price-text font-bold">
                      {formatOptionPrice(option.price_omr)}
                    </span>
                  )}
                </div>
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    )
  }

  // Filter active coffee properties
  const activeProperties = coffeeProperties.filter(property => property.is_active)

  if (activeProperties.length === 0) {
    return null
  }

  const validation = getPropertyValidation()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Coffee className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-semibold">
          {t('product.coffeeProperties')}
        </h3>
      </div>

      {!validation.isValid && (
        <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t('product.pleaseSelectRequired')}
            </p>
            <ul className="mt-1 text-amber-700 dark:text-amber-300">
              {validation.missingProperties.map(property => (
                <li key={property.id}>
                  • {isArabic ? property.name_ar : property.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeProperties.map((property) => (
        <Card key={property.id} className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-600" />
              {isArabic ? property.name_ar : property.name}
              {property.required && (
                <Badge variant="destructive" className="text-xs">
                  {t('product.required')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {renderPropertyOptions(property)}
          </CardContent>
        </Card>
      ))}

      {Object.keys(selectedOptions).length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Coffee className="h-4 w-4 text-amber-600" />
              {t('product.selectionSummary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1.5">
              {Object.entries(selectedOptions).map(([propertyId, optionIds]) => {
                const property = activeProperties.find(p => p.id === propertyId)
                if (!property) return null

                const selectedOptionNames = optionIds
                  .map(optionId => {
                    const option = property.options.find(o => o.id === optionId)
                    return option ? (isArabic ? option.label_ar : option.label) : null
                  })
                  .filter(Boolean)
                  .join(', ')

                return (
                  <div key={propertyId} className="flex justify-between items-center">
                    <span className="font-medium">
                      {isArabic ? property.name_ar : property.name}:
                    </span>
                    <span className="text-amber-800 dark:text-amber-200">
                      {selectedOptionNames}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
