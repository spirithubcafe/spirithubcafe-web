import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Save,
  X
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { jsonDataService } from '@/services/jsonDataService'

interface PageMeta {
  id: string
  title: string
  title_ar: string
  slug: string
  content: string
  content_ar: string
  meta_title?: string
  meta_title_ar?: string
  meta_description?: string
  meta_description_ar?: string
  keywords?: string
  keywords_ar?: string
  status: 'published' | 'draft' | 'archived'
  featured_image?: string
  created_at: string
  updated_at: string
  author?: string
}

const defaultPage: Omit<PageMeta, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  title_ar: '',
  slug: '',
  content: '',
  content_ar: '',
  meta_title: '',
  meta_title_ar: '',
  meta_description: '',
  meta_description_ar: '',
  keywords: '',
  keywords_ar: '',
  status: 'draft',
  featured_image: '',
  author: 'Admin'
}

export default function PagesManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [pages, setPages] = useState<PageMeta[]>([])
  const [filteredPages, setFilteredPages] = useState<PageMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageMeta | null>(null)
  const [formData, setFormData] = useState<Omit<PageMeta, 'id' | 'created_at' | 'updated_at'>>(defaultPage)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPages()
  }, [])

  useEffect(() => {
    filterPages()
  }, [pages, searchTerm, statusFilter])

  const loadPages = async () => {
    try {
      setLoading(true)
      const data = await jsonDataService.fetchJSON('/data/pages.json')
      if (data && Array.isArray(data)) {
        setPages(data)
      }
    } catch (error) {
      console.error('Error loading pages:', error)
      setPages([])
    } finally {
      setLoading(false)
    }
  }

  const filterPages = () => {
    let filtered = pages

    if (searchTerm) {
      filtered = filtered.filter(page => 
        page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter)
    }

    setFilteredPages(filtered)
  }

  const handleEdit = (page: PageMeta) => {
    setEditingPage(page)
    setFormData({
      title: page.title,
      title_ar: page.title_ar,
      slug: page.slug,
      content: page.content,
      content_ar: page.content_ar,
      meta_title: page.meta_title || '',
      meta_title_ar: page.meta_title_ar || '',
      meta_description: page.meta_description || '',
      meta_description_ar: page.meta_description_ar || '',
      keywords: page.keywords || '',
      keywords_ar: page.keywords_ar || '',
      status: page.status,
      featured_image: page.featured_image || '',
      author: page.author || 'Admin'
    })
    setIsEditDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingPage(null)
    setFormData(defaultPage)
    setIsEditDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const now = new Date().toISOString()
      
      let updatedPages: PageMeta[]
      
      if (editingPage) {
        // Update existing page
        updatedPages = pages.map(page =>
          page.id === editingPage.id
            ? { ...page, ...formData, updated_at: now }
            : page
        )
      } else {
        // Create new page
        const newPage: PageMeta = {
          ...formData,
          id: Date.now().toString(),
          created_at: now,
          updated_at: now
        }
        updatedPages = [...pages, newPage]
      }

      await jsonDataService.saveJSON('/data/pages.json', updatedPages)
      setPages(updatedPages)
      setIsEditDialogOpen(false)
      console.log(isArabic ? 'تم حفظ الصفحة بنجاح' : 'Page saved successfully')
    } catch (error) {
      console.error('Error saving page:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Are you sure you want to delete this page?')) {
      return
    }

    try {
      const updatedPages = pages.filter(page => page.id !== id)
      await jsonDataService.saveJSON('/data/pages.json', updatedPages)
      setPages(updatedPages)
      console.log(isArabic ? 'تم حذف الصفحة بنجاح' : 'Page deleted successfully')
    } catch (error) {
      console.error('Error deleting page:', error)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { 
        variant: 'default' as const, 
        text: isArabic ? 'منشور' : 'Published' 
      },
      draft: { 
        variant: 'secondary' as const, 
        text: isArabic ? 'مسودة' : 'Draft' 
      },
      archived: { 
        variant: 'outline' as const, 
        text: isArabic ? 'مؤرشف' : 'Archived' 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    return config ? (
      <Badge variant={config.variant}>{config.text}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'إدارة الصفحات' : 'Pages Management'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة صفحات الموقع والمحتوى' : 'Manage website pages and content'}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {isArabic ? 'إضافة صفحة' : 'Add Page'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {isArabic ? 'قائمة الصفحات' : 'Pages List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder={isArabic ? 'البحث في الصفحات...' : 'Search pages...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <select 
              className="px-3 py-2 border rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              title={isArabic ? 'تصفية حسب الحالة' : 'Filter by status'}
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
              <option value="published">{isArabic ? 'منشور' : 'Published'}</option>
              <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
              <option value="archived">{isArabic ? 'مؤرشف' : 'Archived'}</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredPages.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد صفحات' : 'No pages found'}
                </p>
              </div>
            ) : (
              filteredPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{isArabic ? page.title_ar || page.title : page.title}</h3>
                      {getStatusBadge(page.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Slug: /{page.slug}</p>
                      <p>Updated: {new Date(page.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(page.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage 
                ? (isArabic ? 'تحرير الصفحة' : 'Edit Page')
                : (isArabic ? 'إضافة صفحة جديدة' : 'Add New Page')
              }
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'قم بتعديل معلومات الصفحة' : 'Fill in the page information'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value })
                    if (!editingPage && !formData.slug) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                  }}
                />
              </div>
              <div>
                <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                <Input
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>{isArabic ? 'الرابط' : 'Slug'}</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="page-url"
              />
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>{isArabic ? 'المحتوى (انجليزي)' : 'Content (English)'}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                />
              </div>
              <div>
                <Label>{isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                <Textarea
                  value={formData.content_ar}
                  onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                  rows={6}
                />
              </div>
            </div>

            {/* SEO Meta */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{isArabic ? 'إعدادات SEO' : 'SEO Settings'}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'عنوان SEO (انجليزي)' : 'SEO Title (English)'}</Label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'عنوان SEO (عربي)' : 'SEO Title (Arabic)'}</Label>
                  <Input
                    value={formData.meta_title_ar}
                    onChange={(e) => setFormData({ ...formData, meta_title_ar: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'وصف SEO (انجليزي)' : 'SEO Description (English)'}</Label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'وصف SEO (عربي)' : 'SEO Description (Arabic)'}</Label>
                  <Textarea
                    value={formData.meta_description_ar}
                    onChange={(e) => setFormData({ ...formData, meta_description_ar: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (انجليزي)' : 'Keywords (English)'}</Label>
                  <Input
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'الكلمات المفتاحية (عربي)' : 'Keywords (Arabic)'}</Label>
                  <Input
                    value={formData.keywords_ar}
                    onChange={(e) => setFormData({ ...formData, keywords_ar: e.target.value })}
                    placeholder="كلمة1, كلمة2, كلمة3"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{isArabic ? 'الإعدادات' : 'Settings'}</h3>
              
              <div>
                <Label>{isArabic ? 'صورة مميزة' : 'Featured Image URL'}</Label>
                <Input
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
                  <option value="published">{isArabic ? 'منشور' : 'Published'}</option>
                  <option value="archived">{isArabic ? 'مؤرشف' : 'Archived'}</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.slug}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving 
                  ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...')
                  : (isArabic ? 'حفظ' : 'Save')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
