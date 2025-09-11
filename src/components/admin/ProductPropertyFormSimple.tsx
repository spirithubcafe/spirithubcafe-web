import { useState } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from 'react-i18next'

interface ProductProperty {
  id: string
  name: string
  name_ar: string
  type: 'single' | 'multiple' | 'variant'
  required: boolean
  display_order: number
  options: ProductPropertyOption[]
}

interface ProductPropertyOption {
  id: string
  property_id: string
  name: string
  name_ar: string
  price_adjustment: number
  available: boolean
  display_order: number
}

interface ProductPropertyFormProps {
  properties: ProductProperty[]
  onPropertiesChange: (properties: ProductProperty[]) => void
}

interface PropertyFormData {
  name: string
  name_ar: string
  type: 'single' | 'multiple' | 'variant'
  required: boolean
  display_order: number
  options: ProductPropertyOption[]
}

interface OptionFormData {
  name: string
  name_ar: string
  price_adjustment: number
  available: boolean
  display_order: number
}

const defaultPropertyData: PropertyFormData = {
  name: '',
  name_ar: '',
  type: 'single',
  required: false,
  display_order: 0,
  options: []
}

const defaultOptionData: OptionFormData = {
  name: '',
  name_ar: '',
  price_adjustment: 0,
  available: true,
  display_order: 0
}

export default function ProductPropertyForm({ properties, onPropertiesChange }: ProductPropertyFormProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const [editingProperty, setEditingProperty] = useState<PropertyFormData | null>(null)
  const [editingOption, setEditingOption] = useState<OptionFormData | null>(null)
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false)
  const [optionDialogOpen, setOptionDialogOpen] = useState(false)
  const [currentPropertyIndex, setCurrentPropertyIndex] = useState<number>(-1)
  const [currentOptionIndex, setCurrentOptionIndex] = useState<number>(-1)

  const handleEditProperty = (property: ProductProperty, index: number) => {
    setEditingProperty({
      name: property.name,
      name_ar: property.name_ar,
      type: property.type,
      required: property.required,
      display_order: property.display_order,
      options: property.options
    })
    setCurrentPropertyIndex(index)
    setPropertyDialogOpen(true)
  }

  const handleAddProperty = () => {
    setEditingProperty(defaultPropertyData)
    setCurrentPropertyIndex(-1)
    setPropertyDialogOpen(true)
  }

  const handleSaveProperty = () => {
    if (!editingProperty) return

    const newProperties = [...properties]
    
    if (currentPropertyIndex >= 0) {
      // Update existing property
      newProperties[currentPropertyIndex] = {
        ...newProperties[currentPropertyIndex],
        ...editingProperty
      }
    } else {
      // Add new property
      const newProperty: ProductProperty = {
        ...editingProperty,
        id: Date.now().toString()
      }
      newProperties.push(newProperty)
    }

    onPropertiesChange(newProperties)
    setPropertyDialogOpen(false)
    setEditingProperty(null)
  }

  const handleDeleteProperty = (index: number) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذه الخاصية؟' : 'Are you sure you want to delete this property?')) {
      const newProperties = properties.filter((_, i) => i !== index)
      onPropertiesChange(newProperties)
    }
  }

  const handleEditOption = (option: ProductPropertyOption, propertyIndex: number, optionIndex: number) => {
    setEditingOption({
      name: option.name,
      name_ar: option.name_ar,
      price_adjustment: option.price_adjustment,
      available: option.available,
      display_order: option.display_order
    })
    setCurrentPropertyIndex(propertyIndex)
    setCurrentOptionIndex(optionIndex)
    setOptionDialogOpen(true)
  }

  const handleAddOption = (propertyIndex: number) => {
    setEditingOption(defaultOptionData)
    setCurrentPropertyIndex(propertyIndex)
    setCurrentOptionIndex(-1)
    setOptionDialogOpen(true)
  }

  const handleSaveOption = () => {
    if (!editingOption || currentPropertyIndex < 0) return

    const newProperties = [...properties]
    const property = newProperties[currentPropertyIndex]
    
    if (currentOptionIndex >= 0) {
      // Update existing option
      property.options[currentOptionIndex] = {
        ...property.options[currentOptionIndex],
        ...editingOption
      }
    } else {
      // Add new option
      const newOption: ProductPropertyOption = {
        ...editingOption,
        id: Date.now().toString(),
        property_id: property.id
      }
      property.options.push(newOption)
    }

    onPropertiesChange(newProperties)
    setOptionDialogOpen(false)
    setEditingOption(null)
  }

  const handleDeleteOption = (propertyIndex: number, optionIndex: number) => {
    if (confirm(isArabic ? 'هل أنت متأكد من حذف هذا الخيار؟' : 'Are you sure you want to delete this option?')) {
      const newProperties = [...properties]
      newProperties[propertyIndex].options = newProperties[propertyIndex].options.filter((_, i) => i !== optionIndex)
      onPropertiesChange(newProperties)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {isArabic ? 'خصائص المنتج' : 'Product Properties'}
        </h3>
        <Button onClick={handleAddProperty} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة خاصية' : 'Add Property'}
        </Button>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {isArabic ? 'لا توجد خصائص للمنتج' : 'No product properties'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((property, propertyIndex) => (
            <Card key={property.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    {isArabic ? property.name_ar || property.name : property.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant={property.required ? 'default' : 'secondary'}>
                      {property.required ? (isArabic ? 'مطلوب' : 'Required') : (isArabic ? 'اختياري' : 'Optional')}
                    </Badge>
                    <Badge variant="outline">{property.type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProperty(property, propertyIndex)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProperty(propertyIndex)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">
                      {isArabic ? 'خيارات الخاصية' : 'Property Options'}
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddOption(propertyIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isArabic ? 'إضافة خيار' : 'Add Option'}
                    </Button>
                  </div>
                  
                  {property.options.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'لا توجد خيارات' : 'No options'}
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {property.options.map((option, optionIndex) => (
                        <div key={option.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">
                              {isArabic ? option.name_ar || option.name : option.name}
                            </span>
                            {option.price_adjustment !== 0 && (
                              <span className="ml-2 text-sm text-muted-foreground">
                                ({option.price_adjustment > 0 ? '+' : ''}${option.price_adjustment})
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={option.available ? 'default' : 'secondary'}>
                              {option.available ? (isArabic ? 'متوفر' : 'Available') : (isArabic ? 'غير متوفر' : 'Unavailable')}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditOption(option, propertyIndex, optionIndex)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteOption(propertyIndex, optionIndex)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentPropertyIndex >= 0 
                ? (isArabic ? 'تحرير الخاصية' : 'Edit Property')
                : (isArabic ? 'إضافة خاصية جديدة' : 'Add New Property')
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingProperty && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'اسم الخاصية (انجليزي)' : 'Property Name (English)'}</Label>
                  <Input
                    value={editingProperty.name}
                    onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'اسم الخاصية (عربي)' : 'Property Name (Arabic)'}</Label>
                  <Input
                    value={editingProperty.name_ar}
                    onChange={(e) => setEditingProperty({ ...editingProperty, name_ar: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'نوع الخاصية' : 'Property Type'}</Label>
                <Select 
                  value={editingProperty.type} 
                  onValueChange={(value: any) => setEditingProperty({ ...editingProperty, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">{isArabic ? 'اختيار واحد' : 'Single Choice'}</SelectItem>
                    <SelectItem value="multiple">{isArabic ? 'اختيار متعدد' : 'Multiple Choice'}</SelectItem>
                    <SelectItem value="variant">{isArabic ? 'متغير' : 'Variant'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingProperty.required}
                  onCheckedChange={(checked) => setEditingProperty({ ...editingProperty, required: checked })}
                />
                <Label>{isArabic ? 'خاصية مطلوبة' : 'Required Property'}</Label>
              </div>

              <div>
                <Label>{isArabic ? 'ترتيب العرض' : 'Display Order'}</Label>
                <Input
                  type="number"
                  value={editingProperty.display_order}
                  onChange={(e) => setEditingProperty({ ...editingProperty, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPropertyDialogOpen(false)}>
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
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentOptionIndex >= 0 
                ? (isArabic ? 'تحرير الخيار' : 'Edit Option')
                : (isArabic ? 'إضافة خيار جديد' : 'Add New Option')
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingOption && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'اسم الخيار (انجليزي)' : 'Option Name (English)'}</Label>
                  <Input
                    value={editingOption.name}
                    onChange={(e) => setEditingOption({ ...editingOption, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'اسم الخيار (عربي)' : 'Option Name (Arabic)'}</Label>
                  <Input
                    value={editingOption.name_ar}
                    onChange={(e) => setEditingOption({ ...editingOption, name_ar: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'تعديل السعر ($)' : 'Price Adjustment ($)'}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingOption.price_adjustment}
                  onChange={(e) => setEditingOption({ ...editingOption, price_adjustment: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingOption.available}
                  onCheckedChange={(checked) => setEditingOption({ ...editingOption, available: checked })}
                />
                <Label>{isArabic ? 'متوفر' : 'Available'}</Label>
              </div>

              <div>
                <Label>{isArabic ? 'ترتيب العرض' : 'Display Order'}</Label>
                <Input
                  type="number"
                  value={editingOption.display_order}
                  onChange={(e) => setEditingOption({ ...editingOption, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOptionDialogOpen(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveOption}>
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
