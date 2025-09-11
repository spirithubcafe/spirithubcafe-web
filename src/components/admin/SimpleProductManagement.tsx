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
import { jsonDataService, type Product } from '@/services/jsonDataService'

interface ProductFormData {
  name: string
  name_ar: string
  description: string
  description_ar: string
  price: number
  image: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
}

export default function SimpleProductManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: 0,
    image: '',
    is_active: true,
    is_featured: false,
    sort_order: 0
  })

  // Load products
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      let updatedProducts: Product[]
      
      if (editingProduct) {
        // Update existing product
        updatedProducts = products.map(prod => 
          prod.id === editingProduct.id 
            ? { ...prod, ...formData, updated: new Date().toISOString() }
            : prod
        )
      } else {
        // Create new product
        const newProduct: Product = {
          id: `prod_${Date.now()}`,
          ...formData,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
        updatedProducts = [...products, newProduct]
      }
      
      // Save to JSON file
      await jsonDataService.updateProducts(updatedProducts)
      
      // Update local state
      setProducts(updatedProducts)
      
      // Reset form
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?')) {
      return
    }
    
    try {
      const updatedProducts = products.filter(prod => prod.id !== productId)
      await jsonDataService.updateProducts(updatedProducts)
      setProducts(updatedProducts)
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price ?? 0,
      image: product.image || '',
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      sort_order: product.sort_order ?? 0
    })
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: 0,
      image: '',
      is_active: true,
      is_featured: false,
      sort_order: 0
    })
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: 0,
      image: '',
      is_active: true,
      is_featured: false,
      sort_order: 0
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.name_ar && product.name_ar.includes(searchTerm))
  )

  if (loading) {
    return <div className="p-6">Loading products...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isArabic ? 'إدارة المنتجات' : 'Product Management'}
        </h2>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة منتج' : 'Add Product'}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4" />
        <Input
          placeholder={isArabic ? 'البحث في المنتجات...' : 'Search products...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {isArabic ? product.name_ar || product.name : product.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active 
                      ? (isArabic ? 'نشط' : 'Active')
                      : (isArabic ? 'غير نشط' : 'Inactive')
                    }
                  </Badge>
                  {product.is_featured && (
                    <Badge variant="outline">
                      {isArabic ? 'مميز' : 'Featured'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {isArabic ? product.description_ar || product.description : product.description}
              </p>
              {product.price && (
                <p className="font-semibold mb-4">
                  ${product.price}
                </p>
              )}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {isArabic ? 'تعديل' : 'Edit'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {isArabic ? 'حذف' : 'Delete'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {isArabic ? 'لا توجد منتجات' : 'No products found'}
          </p>
        </div>
      )}

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct 
                ? (isArabic ? 'تعديل المنتج' : 'Edit Product')
                : (isArabic ? 'إضافة منتج جديد' : 'Add New Product')
              }
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'املأ المعلومات أدناه لحفظ المنتج'
                : 'Fill in the information below to save the product'
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
                  rows={3}
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
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {isArabic ? 'السعر' : 'Price'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">
                {isArabic ? 'رابط الصورة' : 'Image URL'}
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/products/example.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
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
              <div className="space-y-2">
                <Label>{isArabic ? 'مميز' : 'Featured'}</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  />
                  <label htmlFor="is_featured">
                    {isArabic ? 'منتج مميز' : 'Featured Product'}
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
