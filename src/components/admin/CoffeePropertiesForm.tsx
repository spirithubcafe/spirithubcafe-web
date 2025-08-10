import { useState } from 'react'
import { Plus, Edit, Trash2, Coffee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { convertPrice } from '@/lib/currency'
import type { CoffeeProperty, CoffeePropertyOption } from '@/types/index'

interface CoffeePropertiesFormProps {
  coffeeProperties: CoffeeProperty[]
  onCoffeePropertiesChange: (properties: CoffeeProperty[]) => void
}

interface PropertyFormData extends Omit<CoffeeProperty, 'id'> {
  id?: string
}

interface OptionFormData extends Omit<CoffeePropertyOption, 'id'> {
  id?: string
}

const COFFEE_PROPERTY_TYPES = [
  { value: 'roast_level', label: 'Roast Level', label_ar: 'درجة التحميص' },
  { value: 'process', label: 'Process', label_ar: 'المعالجة' },
  { value: 'variety', label: 'Variety', label_ar: 'النوع' },
  { value: 'altitude', label: 'Altitude', label_ar: 'الارتفاع' },
  { value: 'notes', label: 'Notes', label_ar: 'الملاحظات' },
  { value: 'farm', label: 'Farm', label_ar: 'المزرعة' }
] as const

export default function CoffeePropertiesForm({ coffeeProperties, onCoffeePropertiesChange }: CoffeePropertiesFormProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [editingProperty, setEditingProperty] = useState<PropertyFormData | null>(null)
  const [editingOption, setEditingOption] = useState<OptionFormData | null>(null)
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false)
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false)
  
  const emptyProperty: PropertyFormData = {
    name: '',
    name_ar: '',
    type: 'roast_level',
    required: false,
    multiple_selection: false,
    options: [],
    is_active: true,
    sort_order: 0
  }
  
  const emptyOption: OptionFormData = {
    value: '',
    label: '',
    label_ar: '',
    price_omr: 0,
    price_usd: 0,
    price_sar: 0,
    is_on_sale: false,
    is_active: true,
    sort_order: 0
  }
  
  const handleAddProperty = () => {
    setEditingProperty({ ...emptyProperty })
    setIsPropertyDialogOpen(true)
  }
  
  const handleEditProperty = (property: CoffeeProperty) => {
    setEditingProperty({ ...property })
    setIsPropertyDialogOpen(true)
  }
  
  const handleDeleteProperty = (propertyId: string) => {
    const newProperties = coffeeProperties.filter(p => p.id !== propertyId)
    onCoffeePropertiesChange(newProperties)
  }
  
  const handleSaveProperty = () => {
    if (!editingProperty) return
    
    const newProperties = [...coffeeProperties]
    const propertyIndex = newProperties.findIndex(p => p.id === editingProperty.id)
    
    const propertyData: CoffeeProperty = {
      ...editingProperty,
      id: editingProperty.id || Date.now().toString()
    }
    
    if (propertyIndex >= 0) {
      newProperties[propertyIndex] = propertyData
    } else {
      newProperties.push(propertyData)
    }
    
    onCoffeePropertiesChange(newProperties)
    setEditingProperty(null)
    setIsPropertyDialogOpen(false)
  }
  
  const handleAddOption = () => {
    setEditingOption({ ...emptyOption })
    setIsOptionDialogOpen(true)
  }
  
  const handleEditOption = (option: CoffeePropertyOption) => {
    setEditingOption({ ...option })
    setIsOptionDialogOpen(true)
  }
  
  const handleDeleteOption = (optionId: string) => {
    if (!editingProperty) return
    
    const newOptions = editingProperty.options.filter(o => o.id !== optionId)
    setEditingProperty({
      ...editingProperty,
      options: newOptions
    })
  }
  
  const handleSaveOption = () => {
    if (!editingOption || !editingProperty) return
    
    const newOptions = [...editingProperty.options]
    const optionIndex = editingOption.id ? newOptions.findIndex(o => o.id === editingOption.id) : -1
    
    const optionData: CoffeePropertyOption = {
      ...editingOption,
      id: editingOption.id || Date.now().toString()
    }
    
    if (optionIndex >= 0) {
      newOptions[optionIndex] = optionData
    } else {
      newOptions.push(optionData)
    }
    
    setEditingProperty({
      ...editingProperty,
      options: newOptions
    })
    setEditingOption(null)
    setIsOptionDialogOpen(false)
  }

  const getPropertyTypeLabel = (type: string) => {
    const propertyType = COFFEE_PROPERTY_TYPES.find(t => t.value === type)
    return propertyType ? (isArabic ? propertyType.label_ar : propertyType.label) : type
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="h-5 w-5 text-amber-600" />
          <h3 className="text-lg font-semibold">
            {isArabic ? 'خصائص القهوة الخاصة' : 'Coffee Properties'}
          </h3>
        </div>
        <Button onClick={handleAddProperty} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة خاصية قهوة' : 'Add Coffee Property'}
        </Button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Coffee className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {isArabic ? 'خصائص قهوة مع أسعار فردية' : 'Coffee Properties with Individual Pricing'}
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {isArabic 
                ? 'كل خاصية قهوة لها سعرها الخاص وليس تعديل على السعر الأساسي' 
                : 'Each coffee property has its own price, not a modifier to the base price'
              }
            </p>
          </div>
        </div>
      </div>
      
      {coffeeProperties.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            <Coffee className="h-12 w-12 mx-auto mb-2 text-amber-400" />
            <p>{isArabic ? 'لا توجد خصائص قهوة مضافة' : 'No coffee properties added'}</p>
            <p className="text-xs mt-1">
              {isArabic ? 'أضف خصائص مثل درجة التحميص، المعالجة، النوع، الارتفاع، الملاحظات، والمزرعة' : 'Add properties like Roast Level, Process, Variety, Altitude, Notes, and Farm'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {coffeeProperties.map((property) => (
            <Card key={property.id} className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-amber-600" />
                      {isArabic ? property.name_ar : property.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        {getPropertyTypeLabel(property.type)}
                      </Badge>
                      {property.multiple_selection && (
                        <Badge variant="secondary">
                          {isArabic ? 'اختيار متعدد' : 'Multiple Selection'}
                        </Badge>
                      )}
                      {property.required && (
                        <Badge variant="destructive">
                          {isArabic ? 'مطلوب' : 'Required'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'الخيارات المتاحة:' : 'Available Options:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {property.options.map((option) => (
                      <div
                        key={option.id}
                        className="flex flex-col p-3 border rounded-lg hover:bg-accent/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {isArabic ? option.label_ar : option.label}
                          </span>
                          {!option.is_active && (
                            <Badge variant="secondary" className="text-xs">
                              {isArabic ? 'غير نشط' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Individual Price Display */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded">
                              {isArabic ? 'السعر' : 'Price'}
                            </span>
                            <span className="text-sm font-mono font-bold text-amber-800 dark:text-amber-200">
                              {option.price_omr.toFixed(3)} OMR
                            </span>
                          </div>
                          
                          {option.is_on_sale && option.sale_price_omr && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                                {isArabic ? 'سعر البيع' : 'Sale Price'}
                              </span>
                              <span className="text-sm font-mono font-bold text-red-600">
                                {option.sale_price_omr.toFixed(3)} OMR
                              </span>
                            </div>
                          )}
                          
                          {option.stock && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                                {isArabic ? 'المخزون' : 'Stock'}
                              </span>
                              <span className="text-xs">{option.stock}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Property Dialog */}
      <Dialog open={isPropertyDialogOpen} onOpenChange={setIsPropertyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              {editingProperty?.id ? 
                (isArabic ? 'تعديل خاصية القهوة' : 'Edit Coffee Property') : 
                (isArabic ? 'إضافة خاصية قهوة جديدة' : 'Add New Coffee Property')
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingProperty && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input
                    value={editingProperty.name}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, name: e.target.value })
                    }
                    placeholder="Roast Level"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={editingProperty.name_ar}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, name_ar: e.target.value })
                    }
                    placeholder="درجة التحميص"
                    dir="rtl"
                  />
                </div>
              </div>
              
              {/* Property Type */}
              <div className="space-y-2">
                <Label>{isArabic ? 'نوع الخاصية' : 'Property Type'}</Label>
                <Select
                  value={editingProperty.type}
                  onValueChange={(value: any) =>
                    setEditingProperty({ ...editingProperty, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COFFEE_PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {isArabic ? type.label_ar : type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Settings */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingProperty.required}
                    onCheckedChange={(checked) =>
                      setEditingProperty({ ...editingProperty, required: checked })
                    }
                  />
                  <Label>{isArabic ? 'مطلوب' : 'Required'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingProperty.multiple_selection}
                    onCheckedChange={(checked) =>
                      setEditingProperty({ ...editingProperty, multiple_selection: checked })
                    }
                  />
                  <Label>{isArabic ? 'اختيار متعدد' : 'Multiple Selection'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingProperty.is_active}
                    onCheckedChange={(checked) =>
                      setEditingProperty({ ...editingProperty, is_active: checked })
                    }
                  />
                  <Label>{isArabic ? 'نشط' : 'Active'}</Label>
                </div>
              </div>
              
              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">
                    {isArabic ? 'خيارات الخاصية' : 'Property Options'}
                  </h4>
                  <Button onClick={handleAddOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? 'إضافة خيار' : 'Add Option'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {editingProperty.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-3 border rounded bg-amber-50/50 dark:bg-amber-950/10"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {isArabic ? option.label_ar : option.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Value: {option.value} | Price: {option.price_omr.toFixed(3)} OMR
                          {option.is_on_sale && option.sale_price_omr && (
                            <span className="text-red-600 ml-2">
                              | Sale: {option.sale_price_omr.toFixed(3)} OMR
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOption(option)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteOption(option.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPropertyDialogOpen(false)}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveProperty}>
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Option Dialog */}
      <Dialog open={isOptionDialogOpen} onOpenChange={setIsOptionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              {editingOption?.id ? 
                (isArabic ? 'تعديل خيار القهوة' : 'Edit Coffee Option') : 
                (isArabic ? 'إضافة خيار قهوة جديد' : 'Add New Coffee Option')
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingOption && (
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">
                  {isArabic ? 'المعلومات الأساسية' : 'Basic Info'}
                </TabsTrigger>
                <TabsTrigger value="pricing">
                  {isArabic ? 'الأسعار' : 'Pricing'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'القيمة' : 'Value'}</Label>
                    <Input
                      value={editingOption.value}
                      onChange={(e) =>
                        setEditingOption({ ...editingOption, value: e.target.value })
                      }
                      placeholder="light-roast"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'الاسم (إنجليزي)' : 'Label (English)'}</Label>
                    <Input
                      value={editingOption.label}
                      onChange={(e) =>
                        setEditingOption({ ...editingOption, label: e.target.value })
                      }
                      placeholder="Light Roast"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>{isArabic ? 'الاسم (عربي)' : 'Label (Arabic)'}</Label>
                  <Input
                    value={editingOption.label_ar}
                    onChange={(e) =>
                      setEditingOption({ ...editingOption, label_ar: e.target.value })
                    }
                    placeholder="تحميص خفيف"
                    dir="rtl"
                  />
                </div>

                {/* Stock & SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'المخزون' : 'Stock'}</Label>
                    <Input
                      type="number"
                      value={editingOption.stock || ''}
                      onChange={(e) =>
                        setEditingOption({ 
                          ...editingOption, 
                          stock: parseInt(e.target.value) || undefined 
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock Keeping Unit</Label>
                    <Input
                      value={editingOption.sku || ''}
                      onChange={(e) =>
                        setEditingOption({ ...editingOption, sku: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Settings */}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingOption.is_active}
                    onCheckedChange={(checked) =>
                      setEditingOption({ ...editingOption, is_active: checked })
                    }
                  />
                  <Label>{isArabic ? 'نشط' : 'Active'}</Label>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                    {isArabic ? 'أسعار فردية' : 'Individual Pricing'}
                  </h5>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    {isArabic ? 
                      'هذه الأسعار تحل محل السعر الأساسي للمنتج عند اختيار هذا الخيار' : 
                      'These prices replace the base product price when this option is selected'
                    }
                  </p>
                </div>

                {/* Regular Price */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <h6 className="font-medium">{isArabic ? 'السعر الأساسي' : 'Regular Price'}</h6>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium">OMR (ريال عماني)</Label>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        value={editingOption.price_omr}
                        onChange={(e) => {
                          const omrPrice = parseFloat(e.target.value) || 0
                          setEditingOption({ 
                            ...editingOption, 
                            price_omr: omrPrice,
                            price_usd: convertPrice(omrPrice, 'USD'),
                            price_sar: convertPrice(omrPrice, 'SAR')
                          })
                        }}
                        className="font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">USD (دولار)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingOption.price_usd.toFixed(2)}
                        disabled
                        className="bg-muted font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'محسوب تلقائياً' : 'Auto-calculated'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">SAR (ريال سعودي)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingOption.price_sar.toFixed(2)}
                        disabled
                        className="bg-muted font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'محسوب تلقائياً' : 'Auto-calculated'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sale Price */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <h6 className="font-medium">{isArabic ? 'سعر البيع (بعد التخفيض)' : 'Sale Price (After Discount)'}</h6>
                    <Switch
                      checked={editingOption.is_on_sale}
                      onCheckedChange={(checked) =>
                        setEditingOption({ ...editingOption, is_on_sale: checked })
                      }
                    />
                  </div>
                  
                  {editingOption.is_on_sale ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="space-y-2">
                        <Label className="font-medium text-red-700 dark:text-red-300">OMR (ريال عماني)</Label>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          max={editingOption.price_omr}
                          value={editingOption.sale_price_omr || 0}
                          onChange={(e) => {
                            const omrSalePrice = parseFloat(e.target.value) || 0
                            setEditingOption({ 
                              ...editingOption, 
                              sale_price_omr: omrSalePrice,
                              sale_price_usd: convertPrice(omrSalePrice, 'USD'),
                              sale_price_sar: convertPrice(omrSalePrice, 'SAR')
                            })
                          }}
                          className="font-mono border-red-300 dark:border-red-700 focus:border-red-500"
                        />
                        {editingOption.sale_price_omr && editingOption.sale_price_omr < editingOption.price_omr && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {isArabic ? 
                              `توفير: ${(editingOption.price_omr - editingOption.sale_price_omr).toFixed(3)} OMR` : 
                              `Savings: ${(editingOption.price_omr - editingOption.sale_price_omr).toFixed(3)} OMR`
                            }
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium text-red-700 dark:text-red-300">USD (دولار)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(editingOption.sale_price_usd || 0).toFixed(2)}
                          disabled
                          className="bg-muted font-mono"
                        />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {isArabic ? 'محسوب تلقائياً' : 'Auto-calculated'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium text-red-700 dark:text-red-300">SAR (ريال سعودي)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={(editingOption.sale_price_sar || 0).toFixed(2)}
                          disabled
                          className="bg-muted font-mono"
                        />
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {isArabic ? 'محسوب تلقائياً' : 'Auto-calculated'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 border border-border rounded-lg text-center">
                      <p className="text-muted-foreground text-sm">
                        {isArabic ? 'فعل التبديل أعلاه لإضافة سعر مخفض لهذا الخيار' : 'Enable the toggle above to add a discounted price for this option'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Actions */}
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOptionDialogOpen(false)}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveOption}>
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
