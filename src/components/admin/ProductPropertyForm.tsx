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
import type { ProductProperty, ProductPropertyOption } from '@/lib/firebase'

interface ProductPropertyFormProps {
  properties: ProductProperty[]
  onPropertiesChange: (properties: ProductProperty[]) => void
}

interface PropertyFormData {
  id?: string
  name: string
  name_ar: string
  type: 'select' | 'radio' | 'checkbox' | 'color' | 'size'
  required: boolean
  affects_price: boolean
  affects_stock: boolean
  display_type: 'dropdown' | 'buttons' | 'color_swatches' | 'size_grid'
  options: ProductPropertyOption[]
  is_active: boolean
  sort_order: number
}

interface OptionFormData {
  id?: string
  value: string
  label: string
  label_ar: string
  price_modifier?: number
  price_modifier_omr?: number
  price_modifier_usd?: number
  price_modifier_sar?: number
  sale_price_modifier_omr?: number
  sale_price_modifier_usd?: number
  sale_price_modifier_sar?: number
  on_sale?: boolean
  sale_start_date?: string
  sale_end_date?: string
  stock?: number
  sku?: string
  is_active?: boolean
  sort_order?: number
}

export default function ProductPropertyForm({ properties, onPropertiesChange }: ProductPropertyFormProps) {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [editingProperty, setEditingProperty] = useState<PropertyFormData | null>(null)
  const [editingOption, setEditingOption] = useState<OptionFormData | null>(null)
  const [isPropertyDialogOpen, setIsPropertyDialogOpen] = useState(false)
  const [isOptionDialogOpen, setIsOptionDialogOpen] = useState(false)
  
  const emptyProperty: PropertyFormData = {
    name: '',
    name_ar: '',
    type: 'select',
    required: false,
    affects_price: false,
    affects_stock: false,
    display_type: 'dropdown',
    options: [],
    is_active: true,
    sort_order: 0
  }
  
  const emptyOption: OptionFormData = {
    value: '',
    label: '',
    label_ar: '',
    price_modifier_omr: 0,
    price_modifier_usd: 0,
    price_modifier_sar: 0,
    is_active: true,
    sort_order: 0
  }
  
  const handleAddProperty = () => {
    setEditingProperty(emptyProperty)
    setIsPropertyDialogOpen(true)
  }
  
  const handleEditProperty = (property: ProductProperty) => {
    setEditingProperty({
      ...property,
      options: property.options || [],
      affects_stock: property.affects_stock || false,
      display_type: property.display_type || 'dropdown',
      is_active: property.is_active !== false,
      sort_order: property.sort_order || 0
    })
    setIsPropertyDialogOpen(true)
  }
  
  const handleDeleteProperty = (index: number) => {
    const newProperties = properties.filter((_, i) => i !== index)
    onPropertiesChange(newProperties)
  }
  
  const handleSaveProperty = () => {
    if (!editingProperty) return
    
    const newProperties = [...properties]
    const propertyIndex = newProperties.findIndex(p => p.id === editingProperty.id)
    
    if (propertyIndex >= 0) {
      newProperties[propertyIndex] = editingProperty
    } else {
      newProperties.push({
        ...editingProperty,
        id: Date.now().toString()
      })
    }
    
    onPropertiesChange(newProperties)
    setEditingProperty(null)
    setIsPropertyDialogOpen(false)
  }
  
  const handleAddOption = () => {
    setEditingOption(emptyOption)
    setIsOptionDialogOpen(true)
  }
  
  const handleEditOption = (option: ProductPropertyOption) => {
    setEditingOption({
      ...option,
      price_modifier: option.price_modifier || 0,
      price_modifier_omr: option.price_modifier_omr || option.price_modifier || 0,
      price_modifier_usd: option.price_modifier_usd || 0,
      price_modifier_sar: option.price_modifier_sar || 0,
      is_active: option.is_active !== false,
      sort_order: option.sort_order || 0
    })
    setIsOptionDialogOpen(true)
  }
  
  const handleDeleteOption = (optionIndex: number) => {
    if (!editingProperty || !editingProperty.options) return
    
    const newOptions = editingProperty.options.filter((_, i) => i !== optionIndex)
    setEditingProperty({
      ...editingProperty,
      options: newOptions
    })
  }
  
  const handleSaveOption = () => {
    if (!editingOption || !editingProperty || !editingProperty.options) return
    
    const newOptions = [...editingProperty.options]
    const optionIndex = newOptions.findIndex(o => o.id === editingOption.id)
    
    if (optionIndex >= 0) {
      newOptions[optionIndex] = editingOption
    } else {
      newOptions.push({
        ...editingOption,
        id: Date.now().toString()
      })
    }
    
    setEditingProperty({
      ...editingProperty,
      options: newOptions
    })
    setEditingOption(null)
    setIsOptionDialogOpen(false)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isArabic ? 'خصائص المنتج' : 'Product Properties'}
        </h3>
        <Button onClick={handleAddProperty} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة خاصية' : 'Add Property'}
        </Button>
      </div>
      
      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            {isArabic ? 'لا توجد خصائص مضافة' : 'No properties added'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {properties.map((property, index) => (
            <Card key={property.id || index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {isArabic ? property.name_ar : property.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{property.type}</Badge>
                      {property.affects_price && (
                        <Badge variant="secondary">
                          {isArabic ? 'يؤثر على السعر' : 'Affects Price'}
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
                      onClick={() => handleDeleteProperty(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'الخيارات:' : 'Options:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {property.options?.map((option, optionIndex) => (
                      <div
                        key={option.id || optionIndex}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {isArabic ? option.label_ar : option.label}
                          </span>
                          {(option.price_modifier || option.price_modifier_omr) && (
                            <span className="text-xs text-muted-foreground ml-2">
                              (+{option.price_modifier_omr || option.price_modifier} OMR)
                            </span>
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
            <DialogTitle>
              {editingProperty?.id ? 
                (isArabic ? 'تعديل الخاصية' : 'Edit Property') : 
                (isArabic ? 'إضافة خاصية جديدة' : 'Add New Property')
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
                    placeholder="Size"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input
                    value={editingProperty.name_ar}
                    onChange={(e) =>
                      setEditingProperty({ ...editingProperty, name_ar: e.target.value })
                    }
                    placeholder="المقاس"
                  />
                </div>
              </div>
              
              {/* Type & Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'النوع' : 'Type'}</Label>
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
                      <SelectItem value="select">Select</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="color">Color</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'طريقة العرض' : 'Display Type'}</Label>
                  <Select
                    value={editingProperty.display_type}
                    onValueChange={(value: any) =>
                      setEditingProperty({ ...editingProperty, display_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="buttons">Buttons</SelectItem>
                      <SelectItem value="color_swatches">Color Swatches</SelectItem>
                      <SelectItem value="size_grid">Size Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    checked={editingProperty.affects_price}
                    onCheckedChange={(checked) =>
                      setEditingProperty({ ...editingProperty, affects_price: checked })
                    }
                  />
                  <Label>{isArabic ? 'يؤثر على السعر' : 'Affects Price'}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingProperty.affects_stock}
                    onCheckedChange={(checked) =>
                      setEditingProperty({ ...editingProperty, affects_stock: checked })
                    }
                  />
                  <Label>{isArabic ? 'يؤثر على المخزون' : 'Affects Stock'}</Label>
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
                    {isArabic ? 'الخيارات' : 'Options'}
                  </h4>
                  <Button onClick={handleAddOption} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {isArabic ? 'إضافة خيار' : 'Add Option'}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {editingProperty.options?.map((option, index) => (
                    <div
                      key={option.id || index}
                      className="flex items-center justify-between p-3 border rounded"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {isArabic ? option.label_ar : option.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Value: {option.value}
                          {(option.price_modifier || option.price_modifier_omr) && (
                            <span className="ml-2">
                              (+{option.price_modifier_omr || option.price_modifier} OMR)
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
                          onClick={() => handleDeleteOption(index)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingOption?.id ? 
                (isArabic ? 'تعديل الخيار' : 'Edit Option') : 
                (isArabic ? 'إضافة خيار جديد' : 'Add New Option')
              }
            </DialogTitle>
          </DialogHeader>
          
          {editingOption && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'القيمة' : 'Value'}</Label>
                  <Input
                    value={editingOption.value}
                    onChange={(e) =>
                      setEditingOption({ ...editingOption, value: e.target.value })
                    }
                    placeholder="small"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الاسم (إنجليزي)' : 'Label (English)'}</Label>
                  <Input
                    value={editingOption.label}
                    onChange={(e) =>
                      setEditingOption({ ...editingOption, label: e.target.value })
                    }
                    placeholder="Small"
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
                  placeholder="صغير"
                />
              </div>
              
              {/* Pricing */}
              <div className="space-y-4">
                <h5 className="font-semibold">{isArabic ? 'الأسعار' : 'Pricing'}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price (OMR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingOption.price_modifier_omr || 0}
                      onChange={(e) =>
                        setEditingOption({ 
                          ...editingOption, 
                          price_modifier_omr: parseFloat(e.target.value) || 0,
                          price_modifier: parseFloat(e.target.value) || 0 // backward compatibility
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (USD)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingOption.price_modifier_usd || 0}
                      onChange={(e) =>
                        setEditingOption({ 
                          ...editingOption, 
                          price_modifier_usd: parseFloat(e.target.value) || 0 
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (SAR)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingOption.price_modifier_sar || 0}
                      onChange={(e) =>
                        setEditingOption({ 
                          ...editingOption, 
                          price_modifier_sar: parseFloat(e.target.value) || 0 
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              
              {/* Sale Pricing */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editingOption.on_sale || false}
                    onCheckedChange={(checked) =>
                      setEditingOption({ ...editingOption, on_sale: checked })
                    }
                  />
                  <Label>{isArabic ? 'في التخفيض' : 'On Sale'}</Label>
                </div>
                
                {editingOption.on_sale && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Sale Price (OMR)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingOption.sale_price_modifier_omr || 0}
                          onChange={(e) =>
                            setEditingOption({ 
                              ...editingOption, 
                              sale_price_modifier_omr: parseFloat(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sale Price (USD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingOption.sale_price_modifier_usd || 0}
                          onChange={(e) =>
                            setEditingOption({ 
                              ...editingOption, 
                              sale_price_modifier_usd: parseFloat(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sale Price (SAR)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={editingOption.sale_price_modifier_sar || 0}
                          onChange={(e) =>
                            setEditingOption({ 
                              ...editingOption, 
                              sale_price_modifier_sar: parseFloat(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isArabic ? 'تاريخ بداية التخفيض' : 'Sale Start Date'}</Label>
                        <Input
                          type="date"
                          value={editingOption.sale_start_date || ''}
                          onChange={(e) =>
                            setEditingOption({ ...editingOption, sale_start_date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isArabic ? 'تاريخ انتهاء التخفيض' : 'Sale End Date'}</Label>
                        <Input
                          type="date"
                          value={editingOption.sale_end_date || ''}
                          onChange={(e) =>
                            setEditingOption({ ...editingOption, sale_end_date: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
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
                  <Label>SKU</Label>
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
                  checked={editingOption.is_active !== false}
                  onCheckedChange={(checked) =>
                    setEditingOption({ ...editingOption, is_active: checked })
                  }
                />
                <Label>{isArabic ? 'نشط' : 'Active'}</Label>
              </div>
              
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
