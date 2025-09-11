import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { jsonDataService } from '@/services/jsonDataService'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff
} from 'lucide-react'

interface AboutHeader {
  id: string
  title: string
  title_ar: string
  subtitle: string
  subtitle_ar: string
  image: string
  is_active: boolean
  sort_order: number
  created: string
  updated: string
}

interface AboutSection {
  id: string
  title: string
  title_ar: string
  content: string
  content_ar: string
  image: string
  is_active: boolean
  sort_order: number
  section_type: string
  created: string
  updated: string
}

export default function AboutManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const [headers, setHeaders] = useState<AboutHeader[]>([])
  const [sections, setSections] = useState<AboutSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editingHeader, setEditingHeader] = useState<AboutHeader | null>(null)
  const [editingSection, setEditingSection] = useState<AboutSection | null>(null)
  const [headerDialogOpen, setHeaderDialogOpen] = useState(false)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [headerData, sectionData] = await Promise.all([
        jsonDataService.fetchJSON<AboutHeader[]>('about_header.json'),
        jsonDataService.fetchJSON<AboutSection[]>('about_sections.json')
      ])
      setHeaders(headerData || [])
      setSections(sectionData || [])
    } catch (error) {
      console.error('Error loading about data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHeader = async () => {
    if (!editingHeader) return

    try {
      let updatedHeaders: AboutHeader[]
      
      if (headers.find(h => h.id === editingHeader.id)) {
        // Update existing header
        updatedHeaders = headers.map(header => 
          header.id === editingHeader.id 
            ? { ...editingHeader, updated: new Date().toISOString() }
            : header
        )
      } else {
        // Create new header
        const newHeader: AboutHeader = {
          ...editingHeader,
          id: `header_${Date.now()}`,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
        updatedHeaders = [...headers, newHeader]
      }
      
      await jsonDataService.saveJSON('about_header.json', updatedHeaders)
      setHeaders(updatedHeaders)
      setHeaderDialogOpen(false)
      setEditingHeader(null)
    } catch (error) {
      console.error('Error saving header:', error)
    }
  }

  const handleSaveSection = async () => {
    if (!editingSection) return

    try {
      let updatedSections: AboutSection[]
      
      if (sections.find(s => s.id === editingSection.id)) {
        // Update existing section
        updatedSections = sections.map(section => 
          section.id === editingSection.id 
            ? { ...editingSection, updated: new Date().toISOString() }
            : section
        )
      } else {
        // Create new section
        const newSection: AboutSection = {
          ...editingSection,
          id: `section_${Date.now()}`,
          created: new Date().toISOString(),
          updated: new Date().toISOString()
        }
        updatedSections = [...sections, newSection]
      }
      
      await jsonDataService.saveJSON('about_sections.json', updatedSections)
      setSections(updatedSections)
      setSectionDialogOpen(false)
      setEditingSection(null)
    } catch (error) {
      console.error('Error saving section:', error)
    }
  }

  const handleDeleteHeader = async (headerId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا العنوان؟' : 'Are you sure you want to delete this header?')) {
      return
    }
    
    try {
      const updatedHeaders = headers.filter(h => h.id !== headerId)
      await jsonDataService.saveJSON('about_header.json', updatedHeaders)
      setHeaders(updatedHeaders)
    } catch (error) {
      console.error('Error deleting header:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm(isArabic ? 'هل أنت متأكد من حذف هذا القسم؟' : 'Are you sure you want to delete this section?')) {
      return
    }
    
    try {
      const updatedSections = sections.filter(s => s.id !== sectionId)
      await jsonDataService.saveJSON('about_sections.json', updatedSections)
      setSections(updatedSections)
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleToggleHeaderStatus = async (headerId: string) => {
    try {
      const updatedHeaders = headers.map(header => 
        header.id === headerId 
          ? { ...header, is_active: !header.is_active, updated: new Date().toISOString() }
          : header
      )
      await jsonDataService.saveJSON('about_header.json', updatedHeaders)
      setHeaders(updatedHeaders)
    } catch (error) {
      console.error('Error toggling header status:', error)
    }
  }

  const handleToggleSectionStatus = async (sectionId: string) => {
    try {
      const updatedSections = sections.map(section => 
        section.id === sectionId 
          ? { ...section, is_active: !section.is_active, updated: new Date().toISOString() }
          : section
      )
      await jsonDataService.saveJSON('about_sections.json', updatedSections)
      setSections(updatedSections)
    } catch (error) {
      console.error('Error toggling section status:', error)
    }
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
        <h2 className="text-2xl font-bold">
          {isArabic ? 'إدارة صفحة من نحن' : 'About Page Management'}
        </h2>
      </div>

      {/* Headers Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isArabic ? 'عناوين الصفحة' : 'Page Headers'}</CardTitle>
          <Button 
            onClick={() => {
              setEditingHeader({
                id: '',
                title: '',
                title_ar: '',
                subtitle: '',
                subtitle_ar: '',
                image: '',
                is_active: true,
                sort_order: headers.length,
                created: '',
                updated: ''
              })
              setHeaderDialogOpen(true)
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة عنوان' : 'Add Header'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {headers.map((header) => (
              <div key={header.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{isArabic ? header.title_ar || header.title : header.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? header.subtitle_ar || header.subtitle : header.subtitle}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={header.is_active ? "default" : "secondary"}>
                      {header.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleHeaderStatus(header.id)}
                  >
                    {header.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingHeader(header)
                      setHeaderDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteHeader(header.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isArabic ? 'أقسام الصفحة' : 'Page Sections'}</CardTitle>
          <Button 
            onClick={() => {
              setEditingSection({
                id: '',
                title: '',
                title_ar: '',
                content: '',
                content_ar: '',
                image: '',
                is_active: true,
                sort_order: sections.length,
                section_type: 'text',
                created: '',
                updated: ''
              })
              setSectionDialogOpen(true)
            }}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة قسم' : 'Add Section'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{isArabic ? section.title_ar || section.title : section.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(isArabic ? section.content_ar || section.content : section.content).substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? (isArabic ? 'نشط' : 'Active') : (isArabic ? 'غير نشط' : 'Inactive')}
                    </Badge>
                    <Badge variant="outline">{section.section_type}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleSectionStatus(section.id)}
                  >
                    {section.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingSection(section)
                      setSectionDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header Edit Dialog */}
      <Dialog open={headerDialogOpen} onOpenChange={setHeaderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingHeader?.id ? (isArabic ? 'تعديل العنوان' : 'Edit Header') : (isArabic ? 'إضافة عنوان جديد' : 'Add New Header')}
            </DialogTitle>
          </DialogHeader>
          
          {editingHeader && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={editingHeader.title}
                    onChange={(e) => setEditingHeader({...editingHeader, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={editingHeader.title_ar}
                    onChange={(e) => setEditingHeader({...editingHeader, title_ar: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان الفرعي (انجليزي)' : 'Subtitle (English)'}</Label>
                  <Input
                    value={editingHeader.subtitle}
                    onChange={(e) => setEditingHeader({...editingHeader, subtitle: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</Label>
                  <Input
                    value={editingHeader.subtitle_ar}
                    onChange={(e) => setEditingHeader({...editingHeader, subtitle_ar: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                <Input
                  value={editingHeader.image}
                  onChange={(e) => setEditingHeader({...editingHeader, image: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingHeader.is_active}
                  onCheckedChange={(checked) => setEditingHeader({...editingHeader, is_active: checked})}
                />
                <Label>{isArabic ? 'نشط' : 'Active'}</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setHeaderDialogOpen(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveHeader}>
                  <Save className="h-4 w-4 mr-2" />
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Section Edit Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? (isArabic ? 'تعديل القسم' : 'Edit Section') : (isArabic ? 'إضافة قسم جديد' : 'Add New Section')}
            </DialogTitle>
          </DialogHeader>
          
          {editingSection && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'العنوان (انجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={editingSection.title}
                    onChange={(e) => setEditingSection({...editingSection, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={editingSection.title_ar}
                    onChange={(e) => setEditingSection({...editingSection, title_ar: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{isArabic ? 'المحتوى (انجليزي)' : 'Content (English)'}</Label>
                  <Textarea
                    value={editingSection.content}
                    onChange={(e) => setEditingSection({...editingSection, content: e.target.value})}
                    rows={6}
                  />
                </div>
                <div>
                  <Label>{isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                  <Textarea
                    value={editingSection.content_ar}
                    onChange={(e) => setEditingSection({...editingSection, content_ar: e.target.value})}
                    rows={6}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? 'رابط الصورة' : 'Image URL'}</Label>
                <Input
                  value={editingSection.image}
                  onChange={(e) => setEditingSection({...editingSection, image: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSection.is_active}
                  onCheckedChange={(checked) => setEditingSection({...editingSection, is_active: checked})}
                />
                <Label>{isArabic ? 'نشط' : 'Active'}</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button onClick={handleSaveSection}>
                  <Save className="h-4 w-4 mr-2" />
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
