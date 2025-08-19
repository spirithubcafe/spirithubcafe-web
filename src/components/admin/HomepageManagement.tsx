import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Save, 
  FileVideo, 
  Eye, 
  Settings,
  AlertTriangle,
  X,
  Image,
  Type,
} from 'lucide-react'
import { useHomepageSettings } from '@/hooks/useHomepageSettings'
import { storageService, auth } from '@/lib/firebase'
import { settingsService } from '@/services/settings'
import toast from 'react-hot-toast'

export default function HomepageManagement() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  
  const { settings, loading, updateSettings } = useHomepageSettings()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewVideo, setPreviewVideo] = useState<string>('')

  const [formData, setFormData] = useState({
    // Coffee Selection Section (Video Background)
    backgroundVideo: '',
    backgroundVideoBlur: 30,
    showBackgroundVideo: true,
    overlayOpacity: 70,
    coffeeSelectionTitle: 'COFFEE SELECTION',
    coffeeSelectionTitleAr: 'مجموعة القهوة',
    coffeeSelectionDescription: 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
    coffeeSelectionDescriptionAr: 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
    coffeeSelectionButtonText: 'SHOP NOW',
    coffeeSelectionButtonTextAr: 'تسوق الآن',
    
    // Mission Statement Section (Fixed Background Image)
    missionBackgroundImage: '/images/back.jpg',
    showMissionSection: true,
    missionTitle: 'SUSTAINABILITY, QUALITY, COMMITMENT',
    missionTitleAr: 'الاستدامة والجودة والالتزام',
    missionDescription: 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
    missionDescriptionAr: 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
    missionButtonText: 'SHOP NOW',
    missionButtonTextAr: 'تسوق الآن',
    
    // Community Section (Fixed Background Image + Gallery)
    communityBackgroundImage: '/images/back.jpg',
    showCommunitySection: true,
    communityText: 'Become an integral part of our Spirit Hub family! Connect with us on social media for exclusive updates, behind-the-scenes glimpses, and thrilling content. Follow us to stay in the loop. From sneak peeks into our creative process to special promotions, our social channels are your ticket to the latest. Engage with like-minded enthusiasts, share your experiences, and be a crucial member of our dynamic online community. Don\'t miss out on the excitement; join us today!',
    communityTextAr: 'كن جزءًا لا يتجزأ من عائلة سبيريت هب! تواصل معنا على وسائل التواصل الاجتماعي للحصول على تحديثات حصرية، ولمحات من وراء الكواليس، ومحتوى مثير. تابعنا لتبقى على اطلاع دائم. من النظرات الخاطفة على عمليتنا الإبداعية إلى العروض الترويجية الخاصة، قنواتنا الاجتماعية هي تذكرتك للأحدث. تفاعل مع المتحمسين ذوي التفكير المماثل، وشارك تجاربك، وكن عضوًا مهمًا في مجتمعنا الديناميكي عبر الإنترنت. لا تفوت الإثارة؛ انضم إلينا اليوم!',
    communityImage1: '',
    communityImage2: '',
    communityImage3: '',
    communityImage4: ''
  })

  useEffect(() => {
    if (settings) {
      setFormData({
        // Coffee Selection Section (Video Background)
        backgroundVideo: settings.backgroundVideo || '',
        backgroundVideoBlur: settings.backgroundVideoBlur || 30,
        showBackgroundVideo: settings.showBackgroundVideo ?? true,
        overlayOpacity: settings.overlayOpacity || 70,
        coffeeSelectionTitle: settings.coffeeSelectionTitle || 'COFFEE SELECTION',
        coffeeSelectionTitleAr: settings.coffeeSelectionTitleAr || 'مجموعة القهوة',
        coffeeSelectionDescription: settings.coffeeSelectionDescription || 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
        coffeeSelectionDescriptionAr: settings.coffeeSelectionDescriptionAr || 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
        coffeeSelectionButtonText: settings.coffeeSelectionButtonText || 'SHOP NOW',
        coffeeSelectionButtonTextAr: settings.coffeeSelectionButtonTextAr || 'تسوق الآن',
        
        // Mission Statement Section (Fixed Background Image)
        missionBackgroundImage: settings.missionBackgroundImage || '/images/back.jpg',
        showMissionSection: settings.showMissionSection ?? true,
        missionTitle: settings.missionTitle || 'SUSTAINABILITY, QUALITY, COMMITMENT',
        missionTitleAr: settings.missionTitleAr || 'الاستدامة والجودة والالتزام',
        missionDescription: settings.missionDescription || 'Our mission is to enrich each customer\'s day with a hand-crafted coffee experience. Through SpiritHub Roastery, we guarantee exceptional quality and flavor in every cup, from carefully selected beans to expert roasting. Wherever we serve, our passion and dedication shine through, making every sip unforgettable.',
        missionDescriptionAr: settings.missionDescriptionAr || 'مهمتنا هي إثراء يوم كل عميل بتجربة قهوة مصنوعة يدوياً. من خلال محمصة سبيريت هب، نضمن جودة ونكهة استثنائية في كل كوب، من الحبوب المختارة بعناية إلى التحميص الخبير. أينما نخدم، تتألق شغفنا وتفانينا، مما يجعل كل رشفة لا تُنسى.',
        missionButtonText: settings.missionButtonText || 'SHOP NOW',
        missionButtonTextAr: settings.missionButtonTextAr || 'تسوق الآن',
        
        // Community Section (Fixed Background Image + Gallery)
        communityBackgroundImage: settings.communityBackgroundImage || '/images/back.jpg',
        showCommunitySection: settings.showCommunitySection ?? true,
        communityText: settings.communityText || 'Become an integral part of our Spirit Hub family! Connect with us on social media for exclusive updates, behind-the-scenes glimpses, and thrilling content. Follow us to stay in the loop. From sneak peeks into our creative process to special promotions, our social channels are your ticket to the latest. Engage with like-minded enthusiasts, share your experiences, and be a crucial member of our dynamic online community. Don\'t miss out on the excitement; join us today!',
        communityTextAr: settings.communityTextAr || 'كن جزءًا لا يتجزأ من عائلة سبيريت هب! تواصل معنا على وسائل التواصل الاجتماعي للحصول على تحديثات حصرية، ولمحات من وراء الكواليس، ومحتوى مثير. تابعنا لتبقى على اطلاع دائم. من النظرات الخاطفة على عمليتنا الإبداعية إلى العروض الترويجية الخاصة، قنواتنا الاجتماعية هي تذكرتك للأحدث. تفاعل مع المتحمسين ذوي التفكير المماثل، وشارك تجاربك، وكن عضوًا مهمًا في مجتمعنا الديناميكي عبر الإنترنت. لا تفوت الإثارة؛ انضم إلينا اليوم!',
        communityImage1: settings.communityImage1 || '',
        communityImage2: settings.communityImage2 || '',
        communityImage3: settings.communityImage3 || '',
        communityImage4: settings.communityImage4 || ''
      })
      setPreviewVideo(settings.backgroundVideo || '')
    }
  }, [settings])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى رفع ملف صورة صالح' : 'Please upload a valid image file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 10MB)' : 'File size too large (max 10MB)')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const user = auth.currentUser
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before uploading files')
      }

      // Upload image to storage
      const fileName = `mission-background-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `images/homepage/${fileName}`
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const downloadUrl = await storageService.upload(filePath, file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ ...prev, missionBackgroundImage: downloadUrl }))
      
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      
      // Clear progress
      const progressInterval2 = setInterval(() => {
        setUploadProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval2)
            return 0
          }
          return prev - 10
        })
      }, 100)
      
      // Specific error handling
      let errorMessage = isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image'
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الملفات' : 'You do not have permission to upload files'
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = isArabic ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('storage/unauthenticated') || error.message.includes('not authenticated')) {
          errorMessage = isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'
        } else if (error.message.includes('network')) {
          errorMessage = isArabic ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' : 'Network error, please try again'
        } else {
          errorMessage = `${isArabic ? 'خطأ' : 'Error'}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      const input = event.target
      if (input) {
        input.value = ''
      }
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error(isArabic ? 'يرجى رفع ملف فيديو صالح' : 'Please upload a valid video file')
      return
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      toast.error(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 50MB)' : 'File size too large (max 50MB)')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const user = auth.currentUser
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before uploading files')
      }

      // Upload video to storage
      const fileName = `homepage-settings-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `videos/homepage/${fileName}`
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const downloadUrl = await storageService.upload(filePath, file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ ...prev, backgroundVideo: downloadUrl }))
      setPreviewVideo(downloadUrl)
      
      toast.success(isArabic ? 'تم رفع الفيديو بنجاح' : 'Video uploaded successfully')
    } catch (error) {
      console.error('Error uploading video:', error)
      
      // Clear progress
      const progressInterval2 = setInterval(() => {
        setUploadProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval2)
            return 0
          }
          return prev - 10
        })
      }, 100)
      
      // Specific error handling
      let errorMessage = isArabic ? 'خطأ في رفع الفيديو' : 'Error uploading video'
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الملفات' : 'You do not have permission to upload files'
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = isArabic ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('storage/unauthenticated') || error.message.includes('not authenticated')) {
          errorMessage = isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'
        } else if (error.message.includes('network')) {
          errorMessage = isArabic ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' : 'Network error, please try again'
        } else {
          errorMessage = `${isArabic ? 'خطأ' : 'Error'}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      const input = event.target
      if (input) {
        input.value = ''
      }
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await updateSettings(formData)
      
      // Force cache invalidation and refresh
      settingsService.forceRefreshHomepage()
      
      toast.success(isArabic ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully')
      
      // Add a small delay then trigger a page refresh signal
      setTimeout(() => {
        // Trigger a custom event that HomePage can listen to
        window.dispatchEvent(new CustomEvent('homepageSettingsUpdated'))
      }, 500)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(isArabic ? 'خطأ في حفظ الإعدادات' : 'Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const removeVideo = () => {
    setFormData(prev => ({ ...prev, backgroundVideo: '' }))
    setPreviewVideo('')
    toast.success(isArabic ? 'تم إزالة الفيديو' : 'Video removed')
  }

  const handleCommunityBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى رفع ملف صورة صالح' : 'Please upload a valid image file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 10MB)' : 'File size too large (max 10MB)')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const user = auth.currentUser
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before uploading files')
      }

      // Upload image to storage
      const fileName = `community-background-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `images/homepage/${fileName}`
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const downloadUrl = await storageService.upload(filePath, file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ ...prev, communityBackgroundImage: downloadUrl }))
      
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      
      // Clear progress
      const progressInterval2 = setInterval(() => {
        setUploadProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval2)
            return 0
          }
          return prev - 10
        })
      }, 100)
      
      // Specific error handling
      let errorMessage = isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image'
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الملفات' : 'You do not have permission to upload files'
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = isArabic ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('storage/unauthenticated') || error.message.includes('not authenticated')) {
          errorMessage = isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'
        } else if (error.message.includes('network')) {
          errorMessage = isArabic ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' : 'Network error, please try again'
        } else {
          errorMessage = `${isArabic ? 'خطأ' : 'Error'}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      const input = event.target
      if (input) {
        input.value = ''
      }
    }
  }

  const handleCommunityImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, imageNumber: number) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى رفع ملف صورة صالح' : 'Please upload a valid image file')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error(isArabic ? 'حجم الملف كبير جداً (الحد الأقصى 10MB)' : 'File size too large (max 10MB)')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const user = auth.currentUser
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (!user.emailVerified) {
        throw new Error('Please verify your email before uploading files')
      }

      // Upload image to storage
      const fileName = `community-image-${imageNumber}-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = `images/homepage/community/${fileName}`
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 300)

      const downloadUrl = await storageService.upload(filePath, file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Update form data
      setFormData(prev => ({ 
        ...prev, 
        [`communityImage${imageNumber}`]: downloadUrl 
      }))
      
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      
      // Clear progress
      const progressInterval2 = setInterval(() => {
        setUploadProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressInterval2)
            return 0
          }
          return prev - 10
        })
      }, 100)
      
      // Specific error handling
      let errorMessage = isArabic ? 'خطأ في رفع الصورة' : 'Error uploading image'
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized') || error.message.includes('Unauthorized')) {
          errorMessage = isArabic ? 'ليس لديك صلاحية لرفع الملفات' : 'You do not have permission to upload files'
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = isArabic ? 'تم تجاوز حد التخزين' : 'Storage quota exceeded'
        } else if (error.message.includes('storage/unauthenticated') || error.message.includes('not authenticated')) {
          errorMessage = isArabic ? 'يرجى تسجيل الدخول أولاً' : 'Please login first'
        } else if (error.message.includes('network')) {
          errorMessage = isArabic ? 'خطأ في الشبكة، يرجى المحاولة مرة أخرى' : 'Network error, please try again'
        } else {
          errorMessage = `${isArabic ? 'خطأ' : 'Error'}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Reset file input
      const input = event.target
      if (input) {
        input.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'إدارة الصفحة الرئيسية' : 'Homepage Management'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'إدارة محتوى وإعدادات أقسام الصفحة الرئيسية' : 'Manage content and settings for homepage sections'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="coffee-selection" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coffee-selection" className="flex items-center gap-2">
            <FileVideo className="h-4 w-4" />
            {isArabic ? 'قسم القهوة' : 'Coffee Selection'}
          </TabsTrigger>
          <TabsTrigger value="mission-statement" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {isArabic ? 'بيان المهمة' : 'Mission Statement'}
          </TabsTrigger>
          <TabsTrigger value="community-section" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            {isArabic ? 'قسم المجتمع' : 'Community Section'}
          </TabsTrigger>
        </TabsList>

        {/* Coffee Selection Tab */}
        <TabsContent value="coffee-selection" className="space-y-6">
          {/* Content Management */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'محتوى القسم' : 'Section Content'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'إدارة العنوان والوصف وزر العمل لقسم مجموعة القهوة' : 'Manage title, description, and action button for Coffee Selection section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coffee-title-en" className="text-sm font-medium">
                    {isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}
                  </Label>
                  <Input
                    id="coffee-title-en"
                    value={formData.coffeeSelectionTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionTitle: e.target.value }))}
                    placeholder="COFFEE SELECTION"
                    className="text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coffee-title-ar" className="text-sm font-medium">
                    {isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  </Label>
                  <Input
                    id="coffee-title-ar"
                    value={formData.coffeeSelectionTitleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionTitleAr: e.target.value }))}
                    placeholder="مجموعة القهوة"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coffee-desc-en" className="text-sm font-medium">
                    {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </Label>
                  <Textarea
                    id="coffee-desc-en"
                    value={formData.coffeeSelectionDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionDescription: e.target.value }))}
                    placeholder="Our mission is to enrich each customer's day..."
                    className="min-h-[120px] text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coffee-desc-ar" className="text-sm font-medium">
                    {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </Label>
                  <Textarea
                    id="coffee-desc-ar"
                    value={formData.coffeeSelectionDescriptionAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionDescriptionAr: e.target.value }))}
                    placeholder="مهمتنا هي إثراء يوم كل عميل..."
                    className="min-h-[120px] text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Button Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="coffee-btn-en" className="text-sm font-medium">
                    {isArabic ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}
                  </Label>
                  <Input
                    id="coffee-btn-en"
                    value={formData.coffeeSelectionButtonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionButtonText: e.target.value }))}
                    placeholder="SHOP NOW"
                    className="text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coffee-btn-ar" className="text-sm font-medium">
                    {isArabic ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}
                  </Label>
                  <Input
                    id="coffee-btn-ar"
                    value={formData.coffeeSelectionButtonTextAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, coffeeSelectionButtonTextAr: e.target.value }))}
                    placeholder="تسوق الآن"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Upload Section */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileVideo className="h-6 w-6 text-primary" />
                </div>
                {isArabic ? 'إدارة فيديو الخلفية' : 'Background Video Management'}
              </CardTitle>
              <CardDescription className="text-base">
                {isArabic ? 'رفع وإدارة فيديو خلفية الصفحة الرئيسية مع تأثير Parallax' : 'Upload and manage homepage background video with parallax effect'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Current Video Preview */}
              {previewVideo && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">
                        {isArabic ? 'الفيديو الحالي' : 'Current Video'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <video
                      src={previewVideo}
                      className="w-full max-w-md rounded-lg shadow-lg aspect-video mx-auto"
                      controls
                      muted
                    />
                  </div>
                </div>
              )}

              {/* Upload Zone */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2 text-foreground">
                    {isArabic ? 'رفع فيديو جديد' : 'Upload New Video'}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {isArabic ? 'اسحب الملف هنا أو انقر للتصفح' : 'Drag and drop your video here or click to browse'}
                  </p>
                </div>

                {/* Drag & Drop Upload Area */}
                <div className="relative">
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                    ${uploading 
                      ? 'border-primary bg-primary/5 cursor-not-allowed' 
                      : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5 cursor-pointer'
                    }
                  `}>
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`
                        p-4 rounded-full transition-colors duration-300
                        ${uploading ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}
                      `}>
                        <FileVideo className={`h-8 w-8 ${uploading ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-base font-medium text-foreground">
                          {uploading 
                            ? (isArabic ? 'جاري الرفع...' : 'Uploading...') 
                            : (isArabic ? 'اختر ملف فيديو' : 'Choose video file')
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'MP4, WebM, MOV (الحد الأقصى: 50MB)' : 'MP4, WebM, MOV (Max: 50MB)'}
                        </p>
                      </div>

                      {uploading && (
                        <div className="w-full max-w-xs space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {isArabic ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="font-medium text-primary">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out`}
                              {...({ style: { width: `${uploadProgress}%` } })}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-sm text-muted-foreground bg-background px-3">
                      {isArabic ? 'أو أدخل رابط الفيديو' : 'Or enter video URL'}
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-url" className="text-sm font-medium">
                      {isArabic ? 'رابط الفيديو' : 'Video URL'}
                    </Label>
                    <Input
                      id="video-url"
                      value={formData.backgroundVideo}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, backgroundVideo: e.target.value }))
                        setPreviewVideo(e.target.value)
                      }}
                      placeholder={isArabic ? 'https://example.com/video.mp4' : 'https://example.com/video.mp4'}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Settings */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xl">
                    {isArabic ? 'إعدادات الفيديو المتقدمة' : 'Advanced Video Settings'}
                  </span>
                </div>
                <Badge variant="outline" className="bg-background">
                  {isArabic ? 'متقدم' : 'Advanced'}
                </Badge>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'تخصيص مظهر وتأثيرات الفيديو مع خيارات متقدمة' : 'Customize video appearance and effects with advanced options'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              {/* Show/Hide Video */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    {isArabic ? 'عرض فيديو الخلفية' : 'Show Background Video'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تفعيل أو إلغاء فيديو الخلفية في قسم القهوة' : 'Enable or disable background video in coffee selection section'}
                  </p>
                </div>
                <Switch
                  checked={formData.showBackgroundVideo}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, showBackgroundVideo: checked }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Blur Intensity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold text-foreground">
                    {isArabic ? 'شدة الضبابية' : 'Blur Intensity'}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm font-medium">
                      {formData.backgroundVideoBlur}%
                    </Badge>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="px-4 py-3 bg-muted/50 rounded-lg border border-border/30">
                    <p className="text-sm text-muted-foreground mb-3">
                      {isArabic ? 'اسحب المؤشر لضبط مستوى الضبابية' : 'Drag the slider to adjust blur level'}
                    </p>
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.backgroundVideoBlur}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, backgroundVideoBlur: parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{isArabic ? 'واضح' : 'Clear'}</span>
                      <span>{isArabic ? 'ضبابي جداً' : 'Very Blurry'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Overlay Opacity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">
                    {isArabic ? 'شفافية الطبقة العلوية' : 'Overlay Opacity'}
                  </Label>
                  <Badge variant="secondary">
                    {formData.overlayOpacity}%
                  </Badge>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={formData.overlayOpacity}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, overlayOpacity: parseInt(e.target.value) }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isArabic ? 'شفاف' : 'Transparent'}</span>
                  <span>{isArabic ? 'معتم' : 'Opaque'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mission Statement Tab */}
        <TabsContent value="mission-statement" className="space-y-6">
          {/* Content Management */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'محتوى بيان المهمة' : 'Mission Statement Content'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'إدارة العنوان والوصف وزر العمل لقسم بيان المهمة' : 'Manage title, description, and action button for Mission Statement section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Show/Hide Section */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="space-y-1">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    {isArabic ? 'عرض قسم بيان المهمة' : 'Show Mission Statement Section'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تفعيل أو إلغاء قسم بيان المهمة في الصفحة الرئيسية' : 'Enable or disable mission statement section in homepage'}
                  </p>
                </div>
                <Switch
                  checked={formData.showMissionSection}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, showMissionSection: checked }))
                  }
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Title Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mission-title-en" className="text-sm font-medium">
                    {isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}
                  </Label>
                  <Input
                    id="mission-title-en"
                    value={formData.missionTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionTitle: e.target.value }))}
                    placeholder="SUSTAINABILITY, QUALITY, COMMITMENT"
                    className="text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission-title-ar" className="text-sm font-medium">
                    {isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}
                  </Label>
                  <Input
                    id="mission-title-ar"
                    value={formData.missionTitleAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionTitleAr: e.target.value }))}
                    placeholder="الاستدامة والجودة والالتزام"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Description Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mission-desc-en" className="text-sm font-medium">
                    {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                  </Label>
                  <Textarea
                    id="mission-desc-en"
                    value={formData.missionDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionDescription: e.target.value }))}
                    placeholder="Our mission is to enrich each customer's day..."
                    className="min-h-[120px] text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission-desc-ar" className="text-sm font-medium">
                    {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                  </Label>
                  <Textarea
                    id="mission-desc-ar"
                    value={formData.missionDescriptionAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionDescriptionAr: e.target.value }))}
                    placeholder="مهمتنا هي إثراء يوم كل عميل..."
                    className="min-h-[120px] text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Button Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mission-btn-en" className="text-sm font-medium">
                    {isArabic ? 'نص الزر (إنجليزي)' : 'Button Text (English)'}
                  </Label>
                  <Input
                    id="mission-btn-en"
                    value={formData.missionButtonText}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionButtonText: e.target.value }))}
                    placeholder="SHOP NOW"
                    className="text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission-btn-ar" className="text-sm font-medium">
                    {isArabic ? 'نص الزر (عربي)' : 'Button Text (Arabic)'}
                  </Label>
                  <Input
                    id="mission-btn-ar"
                    value={formData.missionButtonTextAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, missionButtonTextAr: e.target.value }))}
                    placeholder="تسوق الآن"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Image Upload Section */}
          <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-3 text-xl">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                {isArabic ? 'إدارة صورة الخلفية' : 'Background Image Management'}
              </CardTitle>
              <CardDescription className="text-base">
                {isArabic ? 'رفع وإدارة صورة خلفية قسم بيان المهمة مع تأثير ثابت' : 'Upload and manage mission statement background image with fixed effect'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Current Image Preview */}
              {formData.missionBackgroundImage && (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-background rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-foreground">
                        {isArabic ? 'الصورة الحالية' : 'Current Image'}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, missionBackgroundImage: '/images/back.jpg' }))}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={formData.missionBackgroundImage}
                      alt="Mission background"
                      className="w-full max-w-md rounded-lg shadow-lg aspect-video mx-auto object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/back.jpg'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Zone */}
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-2 text-foreground">
                    {isArabic ? 'رفع صورة جديدة' : 'Upload New Image'}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {isArabic ? 'اسحب الملف هنا أو انقر للتصفح' : 'Drag and drop your image here or click to browse'}
                  </p>
                </div>

                {/* Drag & Drop Upload Area */}
                <div className="relative">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                    ${uploading 
                      ? 'border-primary bg-primary/5 cursor-not-allowed' 
                      : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5 cursor-pointer'
                    }
                  `}>
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`
                        p-4 rounded-full transition-colors duration-300
                        ${uploading ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}
                      `}>
                        <Image className={`h-8 w-8 ${uploading ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-base font-medium text-foreground">
                          {uploading 
                            ? (isArabic ? 'جاري الرفع...' : 'Uploading...') 
                            : (isArabic ? 'اختر ملف صورة' : 'Choose image file')
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'JPG, PNG, WebP (الحد الأقصى: 10MB)' : 'JPG, PNG, WebP (Max: 10MB)'}
                        </p>
                      </div>

                      {uploading && (
                        <div className="w-full max-w-xs space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {isArabic ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="font-medium text-primary">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out`}
                              {...({ style: { width: `${uploadProgress}%` } })}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Manual URL Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border"></div>
                    <span className="text-sm text-muted-foreground bg-background px-3">
                      {isArabic ? 'أو أدخل رابط الصورة' : 'Or enter image URL'}
                    </span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image-url" className="text-sm font-medium">
                      {isArabic ? 'رابط الصورة' : 'Image URL'}
                    </Label>
                    <Input
                      id="image-url"
                      value={formData.missionBackgroundImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, missionBackgroundImage: e.target.value }))}
                      placeholder={isArabic ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Community Section Tab */}
        <TabsContent value="community-section" className="space-y-6">
          {/* Show/Hide Community Section */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Settings className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'إعدادات العرض' : 'Display Settings'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'تحكم في عرض قسم المجتمع على الصفحة الرئيسية' : 'Control the display of community section on homepage'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-medium">
                    {isArabic ? 'عرض قسم المجتمع' : 'Show Community Section'}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تحديد ما إذا كان سيتم عرض قسم المجتمع على الصفحة الرئيسية' : 'Determines if the community section is displayed on the homepage'}
                  </p>
                </div>
                <Switch
                  checked={formData.showCommunitySection}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showCommunitySection: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Image Upload */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'صورة الخلفية' : 'Background Image'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'رفع وإدارة صورة خلفية قسم المجتمع' : 'Upload and manage community section background image'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <Label htmlFor="community-background" className="text-sm font-medium">
                  {isArabic ? 'صورة الخلفية' : 'Background Image'}
                </Label>
                <Input
                  id="community-background"
                  type="file"
                  accept="image/*"
                  onChange={handleCommunityBackgroundUpload}
                  disabled={uploading}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {formData.communityBackgroundImage && (
                  <div className="space-y-2">
                    <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                      <img
                        src={formData.communityBackgroundImage}
                        alt="Community background preview"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, communityBackgroundImage: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? 'انقر على X لإزالة الصورة' : 'Click X to remove image'}
                    </p>
                  </div>
                )}
                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${uploadProgress}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'جاري الرفع...' : 'Uploading...'} {uploadProgress}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Community Text Content */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Type className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'نص المجتمع' : 'Community Text'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'إدارة النص المعروض في قسم المجتمع' : 'Manage the text displayed in community section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="community-text-en" className="text-sm font-medium">
                    {isArabic ? 'النص (إنجليزي)' : 'Text (English)'}
                  </Label>
                  <Textarea
                    id="community-text-en"
                    value={formData.communityText}
                    onChange={(e) => setFormData(prev => ({ ...prev, communityText: e.target.value }))}
                    placeholder="Become an integral part of our Spirit Hub family!"
                    className="min-h-[150px] text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community-text-ar" className="text-sm font-medium">
                    {isArabic ? 'النص (عربي)' : 'Text (Arabic)'}
                  </Label>
                  <Textarea
                    id="community-text-ar"
                    value={formData.communityTextAr}
                    onChange={(e) => setFormData(prev => ({ ...prev, communityTextAr: e.target.value }))}
                    placeholder="كن جزءًا لا يتجزأ من عائلة سبيريت هب!"
                    className="min-h-[150px] text-right"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Images Gallery */}
          <Card className="border border-border/50 shadow-lg py-0">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg py-6">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl">
                  {isArabic ? 'معرض الصور' : 'Image Gallery'}
                </span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {isArabic ? 'رفع وإدارة 4 صور لعرضها في قسم المجتمع' : 'Upload and manage 4 images to display in community section'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image 1 */}
                <div className="space-y-4">
                  <Label htmlFor="community-image-1" className="text-sm font-medium">
                    {isArabic ? 'الصورة الأولى' : 'Image 1'}
                  </Label>
                  <Input
                    id="community-image-1"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCommunityImageUpload(e, 1)}
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.communityImage1 && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={formData.communityImage1}
                        alt="Community image 1"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, communityImage1: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image 2 */}
                <div className="space-y-4">
                  <Label htmlFor="community-image-2" className="text-sm font-medium">
                    {isArabic ? 'الصورة الثانية' : 'Image 2'}
                  </Label>
                  <Input
                    id="community-image-2"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCommunityImageUpload(e, 2)}
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.communityImage2 && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={formData.communityImage2}
                        alt="Community image 2"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, communityImage2: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image 3 */}
                <div className="space-y-4">
                  <Label htmlFor="community-image-3" className="text-sm font-medium">
                    {isArabic ? 'الصورة الثالثة' : 'Image 3'}
                  </Label>
                  <Input
                    id="community-image-3"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCommunityImageUpload(e, 3)}
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.communityImage3 && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={formData.communityImage3}
                        alt="Community image 3"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, communityImage3: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Image 4 */}
                <div className="space-y-4">
                  <Label htmlFor="community-image-4" className="text-sm font-medium">
                    {isArabic ? 'الصورة الرابعة' : 'Image 4'}
                  </Label>
                  <Input
                    id="community-image-4"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCommunityImageUpload(e, 4)}
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {formData.communityImage4 && (
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={formData.communityImage4}
                        alt="Community image 4"
                        className="w-full h-full object-cover"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData(prev => ({ ...prev, communityImage4: '' }))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isArabic ? 'حفظ...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isArabic ? 'حفظ الإعدادات' : 'Save Settings'}
            </>
          )}
        </Button>
      </div>

      {/* Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {isArabic 
            ? 'لأفضل النتائج، استخدم فيديو بجودة 1080p أو أعلى بنسبة عرض إلى ارتفاع 16:9 للقسم الأول، وصورة بجودة عالية بنسبة 16:9 للقسم الثاني.'
            : 'For best results, use 1080p or higher quality video with 16:9 aspect ratio for coffee section, and high-quality image with 16:9 ratio for mission section.'
          }
        </AlertDescription>
      </Alert>
    </div>
  )
}