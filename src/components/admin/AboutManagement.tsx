import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AboutManagement.css';
import { aboutService, type AboutSectionData, type AboutHeaderData } from '@/services/about';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { HTMLContent } from '@/components/ui/html-content';
import { storageService } from '@/lib/firebase';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  Upload,
  Link
} from 'lucide-react';

export function AboutManagement() {
  const { t } = useTranslation();
  const [header, setHeader] = useState<AboutHeaderData | null>(null);
  const [sections, setSections] = useState<AboutSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSectionData | null>(null);
  const [editingHeader, setEditingHeader] = useState<AboutHeaderData | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showHeaderDialog, setShowHeaderDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [headerData, sectionsData] = await Promise.all([
        aboutService.getHeader(),
        aboutService.getAllSections()
      ]);
      
      setHeader(headerData);
      setSections(sectionsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = () => {
    const newSection: AboutSectionData = {
      section_key: '',
      title_en: '',
      title_ar: '',
      content_en: '',
      content_ar: '',
      image_url: null,
      layout: 'text-left',
      order_index: sections.length + 1,
      is_active: true
    };
    setEditingSection(newSection);
    setShowEditDialog(true);
  };

  const handleEditSection = (section: AboutSectionData) => {
    setEditingSection({ ...section });
    setShowEditDialog(true);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    try {
      setSaving(true);
      
      if (editingSection.id) {
        // Update existing section
        await aboutService.updateSection(editingSection.id, editingSection);
        console.log('Section updated successfully');
      } else {
        // Create new section
        await aboutService.createSection(editingSection);
        console.log('Section created successfully');
      }

      await loadData();
      setShowEditDialog(false);
      setEditingSection(null);
    } catch (err) {
      console.error('Error saving section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!editingHeader) return;

    try {
      setSaving(true);
      
      if (editingHeader.id) {
        // Update existing header
        await aboutService.updateHeader(editingHeader.id, editingHeader);
        console.log('Header updated successfully');
      } else {
        // Create new header
        await aboutService.createHeader(editingHeader);
        console.log('Header created successfully');
      }

      await loadData();
      setShowHeaderDialog(false);
      setEditingHeader(null);
    } catch (err) {
      console.error('Error saving header:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm(t('dashboard.admin.about.confirmDelete', 'Are you sure you want to delete this section?'))) return;

    try {
      setSaving(true);
      await aboutService.deleteSection(id);
      await loadData();
      console.log('Section deleted successfully');
    } catch (err) {
      console.error('Error deleting section:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await aboutService.toggleSectionStatus(id, isActive);
      await loadData();
      console.log('Status updated successfully');
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleReorderSection = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];

    // Update order indices
    const updatePromises = newSections.map((section, index) => ({
      id: section.id!,
      order_index: index + 1
    }));

    try {
      setSaving(true);
      await aboutService.updateSectionsOrder(updatePromises);
      await loadData();
      console.log('Order updated successfully');
    } catch (err) {
      console.error('Error reordering sections:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File, isHeaderImage = false) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('admin.products.invalidImageType'));
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error(t('admin.products.imageTooLarge'));
      return;
    }

    try {
      setUploadingImage(true);
      setUploadProgress(0);

      // Check authentication first
      const { authService } = await import('@/lib/firebase');
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        toast.error('Please login first to upload images');
        return;
      }

      console.log('Current user:', currentUser.uid, currentUser.email);

      // Show progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Generate safe filename
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${safeFileName}`;
      const filePath = isHeaderImage ? `admin/about-header/${fileName}` : `admin/about-sections/${fileName}`;
      
      console.log('Uploading to path:', filePath);
      
      // Upload to Firebase Storage
      const url = await storageService.upload(filePath, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update the editing data with the uploaded URL
      if (isHeaderImage && editingHeader) {
        // Header doesn't support images, skip
        return;
      } else if (editingSection) {
        setEditingSection({ ...editingSection, image_url: url });
      }

      setTimeout(() => setUploadProgress(0), 1000);
      toast.success(t('admin.products.imageUploaded'));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      
      let errorMessage = t('admin.products.imageUploadError');
      if (error instanceof Error) {
        if (error.message.includes('authentication') || error.message.includes('Unauthorized')) {
          errorMessage = t('admin.products.loginRequired');
        } else if (error.message.includes('quota')) {
          errorMessage = t('admin.products.quotaExceeded');
        } else if (error.message.includes('CORS')) {
          errorMessage = t('admin.products.corsError');
        } else if (error.message.includes('permission')) {
          errorMessage = t('admin.products.noPermission');
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('dashboard.admin.about.title', 'About Page Management')}</h2>
        <Button onClick={handleCreateSection}>
          <Plus className="h-4 w-4 mr-2" />
          {t('dashboard.admin.about.addSection', 'Add Section')}
        </Button>
      </div>

      {/* Header Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('dashboard.admin.about.pageHeader', 'Page Header')}</CardTitle>
            <Button
              variant="outline"
              onClick={() => {
                setEditingHeader(header || {
                  title_en: '',
                  title_ar: '',
                  subtitle_en: '',
                  subtitle_ar: '',
                  is_active: true
                });
                setShowHeaderDialog(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              {header ? t('dashboard.admin.about.editHeader', 'Edit Header') : t('dashboard.admin.about.createHeader', 'Create Header')}
            </Button>
          </div>
        </CardHeader>
        {header && (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('dashboard.admin.about.titleEn', 'Title (English)')}</p>
                <p className="font-medium">{header.title_en}</p>
                <p className="text-sm text-muted-foreground mb-2 mt-3">{t('dashboard.admin.about.subtitleEn', 'Subtitle (English)')}</p>
                <div className="text-sm">
                  <HTMLContent content={header.subtitle_en} />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('dashboard.admin.about.titleAr', 'Title (Arabic)')}</p>
                <p className="font-medium text-right" dir="rtl">{header.title_ar}</p>
                <p className="text-sm text-muted-foreground mb-2 mt-3">{t('dashboard.admin.about.subtitleAr', 'Subtitle (Arabic)')}</p>
                <div className="text-sm text-right" dir="rtl">
                  <HTMLContent content={header.subtitle_ar} />
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4">
        {sections.map((section, index) => (
          <Card key={section.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">
                    {section.title_en}
                  </CardTitle>
                  <Badge variant={section.is_active ? 'default' : 'secondary'}>
                    {section.is_active ? t('dashboard.admin.about.active', 'Active') : t('dashboard.admin.about.inactive', 'Inactive')}
                  </Badge>
                  <Badge variant="outline">
                    {section.layout}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderSection(section.id!, 'up')}
                    disabled={index === 0 || saving}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReorderSection(section.id!, 'down')}
                    disabled={index === sections.length - 1 || saving}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(section.id!, !section.is_active)}
                    disabled={saving}
                  >
                    {section.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSection(section)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSection(section.id!)}
                    disabled={saving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('dashboard.admin.about.englishContent', 'English Content')}</p>
                  <div className="text-sm line-clamp-3">
                    <HTMLContent content={section.content_en} maxLength={150} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('dashboard.admin.about.arabicContent', 'Arabic Content')}</p>
                  <div className="text-sm line-clamp-3 text-right" dir="rtl">
                    <HTMLContent content={section.content_ar} maxLength={150} />
                  </div>
                </div>
              </div>
              {section.image_url && (
                <div className="mt-4">
                  <img 
                    src={section.image_url} 
                    alt={section.title_en}
                    className="w-24 h-16 object-cover rounded"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[80%] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection?.id ? t('dashboard.admin.about.editSection', 'Edit Section') : t('dashboard.admin.about.addSection', 'Add Section')}
            </DialogTitle>
          </DialogHeader>

          {editingSection && (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">{t('dashboard.admin.about.content', 'Content')}</TabsTrigger>
                <TabsTrigger value="settings">{t('dashboard.admin.about.settings', 'Settings')}</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title_en" className="block mb-2">{t('dashboard.admin.about.titleEn', 'Title (English)')}</Label>
                      <RichTextEditor
                        value={editingSection.title_en}
                        onChange={(value) => setEditingSection({
                          ...editingSection,
                          title_en: value
                        })}
                        placeholder={t('dashboard.admin.about.enterPlaceholder.titleEn', 'Enter English title')}
                        direction="ltr"
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_en" className="block mb-2">{t('dashboard.admin.about.contentEn', 'Content (English)')}</Label>
                      <RichTextEditor
                        value={editingSection.content_en}
                        onChange={(value) => setEditingSection({
                          ...editingSection,
                          content_en: value
                        })}
                        placeholder={t('dashboard.admin.about.enterPlaceholder.contentEn', 'Enter English content')}
                        direction="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title_ar" className="block mb-2">{t('dashboard.admin.about.titleAr', 'Title (Arabic)')}</Label>
                      <RichTextEditor
                        value={editingSection.title_ar}
                        onChange={(value) => setEditingSection({
                          ...editingSection,
                          title_ar: value
                        })}
                        placeholder={t('dashboard.admin.about.enterPlaceholder.titleAr', 'Enter Arabic title')}
                        direction="rtl"
                        className="min-h-[120px]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="content_ar" className="block mb-2">{t('dashboard.admin.about.contentAr', 'Content (Arabic)')}</Label>
                      <RichTextEditor
                        value={editingSection.content_ar}
                        onChange={(value) => setEditingSection({
                          ...editingSection,
                          content_ar: value
                        })}
                        placeholder={t('dashboard.admin.about.enterPlaceholder.contentAr', 'Enter Arabic content')}
                        direction="rtl"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="section_key" className="block mb-2">{t('dashboard.admin.about.sectionKey', 'Section Key')}</Label>
                    <Input
                      id="section_key"
                      value={editingSection.section_key}
                      onChange={(e) => setEditingSection({
                        ...editingSection,
                        section_key: e.target.value
                      })}
                      placeholder={t('dashboard.admin.about.enterPlaceholder.sectionKey', 'e.g., mission, quality, values')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="layout" className="block mb-2">{t('dashboard.admin.about.layout', 'Layout')}</Label>
                    <Select
                      value={editingSection.layout}
                      onValueChange={(value: 'text-left' | 'text-right' | 'full-width') =>
                        setEditingSection({
                          ...editingSection,
                          layout: value
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text-left">{t('dashboard.admin.about.layoutTextLeft', 'Text Left, Image Right')}</SelectItem>
                        <SelectItem value="text-right">{t('dashboard.admin.about.layoutTextRight', 'Text Right, Image Left')}</SelectItem>
                        <SelectItem value="full-width">{t('dashboard.admin.about.layoutFullWidth', 'Full Width (No Image)')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="block mb-2">{t('dashboard.admin.about.sectionImage', 'Section Image')}</Label>
                  
                  {/* Current Image Preview */}
                  {editingSection.image_url && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">{t('dashboard.admin.about.currentImage', 'Current Image')}:</div>
                      <img 
                        src={editingSection.image_url} 
                        alt={t('dashboard.admin.about.sectionImage', 'Section preview')}
                        className="w-full max-w-md h-40 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {/* Image Upload */}
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        id="section-image-upload"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, false);
                        }}
                        className="hidden"
                        aria-label={t('dashboard.admin.about.selectImageFile', 'Upload section image')}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('section-image-upload')?.click()}
                        disabled={uploadingImage}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImage ? t('dashboard.admin.about.uploading', 'Uploading...') : t('dashboard.admin.about.uploadImage', 'Upload Image')}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingSection({
                          ...editingSection,
                          image_url: null
                        })}
                        title={t('dashboard.admin.about.removeImage', 'Remove image')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                      <Progress value={uploadProgress} className="w-full" />
                    )}
                    
                    {/* Manual URL Input */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Link className="h-4 w-4" />
                        <Label className="text-sm">{t('dashboard.admin.about.enterImageUrl', 'Or enter image URL')}:</Label>
                      </div>
                      <Input
                        value={editingSection.image_url || ''}
                        onChange={(e) => setEditingSection({
                          ...editingSection,
                          image_url: e.target.value || null
                        })}
                        placeholder={t('dashboard.admin.about.enterPlaceholder.imageUrl', 'https://example.com/image.jpg')}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rtl:flex-row-reverse">
                  <Switch
                    id="is_active"
                    checked={editingSection.is_active}
                    onCheckedChange={(checked) => setEditingSection({
                      ...editingSection,
                      is_active: checked
                    })}
                  />
                  <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('dashboard.admin.about.active', 'Active')}
                  </Label>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveSection} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header Edit Dialog */}
      <Dialog open={showHeaderDialog} onOpenChange={setShowHeaderDialog}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHeader?.id ? t('dashboard.admin.about.editHeader', 'Edit Page Header') : t('dashboard.admin.about.createHeader', 'Create Page Header')}
            </DialogTitle>
          </DialogHeader>

          {editingHeader && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="header_title_en" className="block mb-2">{t('dashboard.admin.about.titleEn', 'Title (English)')}</Label>
                    <RichTextEditor
                      value={editingHeader.title_en}
                      onChange={(value) => setEditingHeader({
                        ...editingHeader,
                        title_en: value
                      })}
                      placeholder={t('dashboard.admin.about.enterPlaceholder.titleEn', 'Enter English title')}
                      direction="ltr"
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="header_subtitle_en" className="block mb-2">{t('dashboard.admin.about.subtitleEn', 'Subtitle (English)')}</Label>
                    <RichTextEditor
                      value={editingHeader.subtitle_en}
                      onChange={(value) => setEditingHeader({
                        ...editingHeader,
                        subtitle_en: value
                      })}
                      placeholder={t('dashboard.admin.about.enterPlaceholder.subtitleEn', 'Enter English subtitle')}
                      direction="ltr"
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="header_title_ar" className="block mb-2">{t('dashboard.admin.about.titleAr', 'Title (Arabic)')}</Label>
                    <RichTextEditor
                      value={editingHeader.title_ar}
                      onChange={(value) => setEditingHeader({
                        ...editingHeader,
                        title_ar: value
                      })}
                      placeholder={t('dashboard.admin.about.enterPlaceholder.titleAr', 'Enter Arabic title')}
                      direction="rtl"
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="header_subtitle_ar" className="block mb-2">{t('dashboard.admin.about.subtitleAr', 'Subtitle (Arabic)')}</Label>
                    <RichTextEditor
                      value={editingHeader.subtitle_ar}
                      onChange={(value) => setEditingHeader({
                        ...editingHeader,
                        subtitle_ar: value
                      })}
                      placeholder={t('dashboard.admin.about.enterPlaceholder.subtitleAr', 'Enter Arabic subtitle')}
                      direction="rtl"
                      className="min-h-[150px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                <Switch
                  id="header_is_active"
                  checked={editingHeader.is_active || false}
                  onCheckedChange={(checked) => setEditingHeader({
                    ...editingHeader,
                    is_active: checked
                  })}
                />
                <Label htmlFor="header_is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {t('dashboard.admin.about.active', 'Active')}
                </Label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowHeaderDialog(false)}>
              <X className="h-4 w-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveHeader} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}