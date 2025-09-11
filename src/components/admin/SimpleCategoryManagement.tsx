import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { jsonDataService, type Category } from '@/services/jsonDataService'

interface CategoryFormData {
  name: string
  name_ar: string
  description: string
  description_ar: string
  image: string
  is_active: boolean
  sort_order: number
}

export default function SimpleCategoryManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image: '',
    is_active: true,
    sort_order: 0
  })

  // Load categories
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      let updatedCategories: Category[]
      
      if (editingCategory) {
        // Update existing category
        updatedCategories = categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData, updated: new Date().toISOString() }
            : cat
        )
      } else {
        // Create new category
        const newCategory: Category = {
          id: `cat_${Date.now()}`,
          ...formData,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
        updatedCategories = [...categories, newCategory]
      }
      
      // Save to JSON file
      await jsonDataService.updateCategories(updatedCategories)
      
      // Update local state
      setCategories(updatedCategories)
      
      // Reset form
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      return
    }
    
    try {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId)
      await jsonDataService.updateCategories(updatedCategories)
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      name_ar: category.name_ar || '',
      description: category.description || '',
      description_ar: category.description_ar || '',
      image: category.image || '',
      is_active: category.is_active ?? true,
      sort_order: category.sort_order ?? 0
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      image: '',
      is_active: true,
      sort_order: 0
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      image: '',
      is_active: true,
      sort_order: 0
    })
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.name_ar && category.name_ar.includes(searchTerm))
  )

  if (loading) {
    return <div className="p-6">Loading categories...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isArabic ? 'إدارة الفئات' : 'Category Management'}
        </h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة فئة' : 'Add Category'}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder={isArabic ? 'البحث في الفئات...' : 'Search categories...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {isArabic ? category.name_ar || category.name : category.name}
                </CardTitle>
                <Badge variant={category.is_active ? "default" : "secondary"}>
                  {category.is_active 
                    ? (isArabic ? 'نشط' : 'Active')
                    : (isArabic ? 'غير نشط' : 'Inactive')
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {isArabic ? category.description_ar || category.description : category.description}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {isArabic ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isArabic ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isArabic ? 'لا توجد فئات' : 'No categories found'}
          </p>
        </div>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory 
                ? (isArabic ? 'تعديل الفئة' : 'Edit Category')
                : (isArabic ? 'إضافة فئة جديدة' : 'Add New Category')
              }
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'املأ المعلومات أدناه لحفظ الفئة'
                : 'Fill in the information below to save the category'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {isArabic ? 'الاسم (إنجليزي)' : 'Name (English)'}
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_ar">
                  {isArabic ? 'الاسم (عربي)' : 'Name (Arabic)'}
                </Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">
                  {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_ar">
                  {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </Label>
                <Textarea
                  id="description_ar"
                  value={formData.description_ar}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                {isArabic ? 'رابط الصورة' : 'Image URL'}
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/categories/example.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort_order">
                  {isArabic ? 'ترتيب العرض' : 'Sort Order'}
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">
                  {isArabic ? 'الحالة' : 'Status'}
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <label htmlFor="is_active">
                    {isArabic ? 'نشط' : 'Active'}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {isArabic ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
