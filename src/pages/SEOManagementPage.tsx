import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw, 
  CheckCircle, 
  FileText, 
  Package, 
  FolderOpen,
  Sparkles
} from 'lucide-react'
import { useSEOGenerator } from '@/hooks/useSEOGenerator'
import { useTranslation } from 'react-i18next'

const SEOManagementPage: React.FC = () => {
  const { t } = useTranslation()
  
  const {
    isGenerating,
    progress,
    generateAllProductsSEO,
    generateAllCategoriesSEO,
    generateAllPagesSEO,
    generateAllSEO
  } = useSEOGenerator()

  const [lastResults, setLastResults] = useState<any>(null)

  const handleGenerateAll = async () => {
    if (isGenerating) return
    
    const confirmed = window.confirm(t('seo.confirmAll'))
    
    if (!confirmed) return
    
    const results = await generateAllSEO()
    setLastResults(results)
  }

  const handleGenerateProducts = async () => {
    if (isGenerating) return
    
    const confirmed = window.confirm(t('seo.confirmProducts'))
    if (!confirmed) return
    
    const result = await generateAllProductsSEO()
    setLastResults({ products: result })
  }

  const handleGenerateCategories = async () => {
    if (isGenerating) return
    
    const confirmed = window.confirm(t('seo.confirmCategories'))
    if (!confirmed) return
    
    const result = await generateAllCategoriesSEO()
    setLastResults({ categories: result })
  }

  const handleGeneratePages = async () => {
    if (isGenerating) return
    
    const confirmed = window.confirm(t('seo.confirmPages'))
    if (!confirmed) return
    
    const result = await generateAllPagesSEO()
    setLastResults({ pages: result })
  }

  const ResultsSummary = ({ results }: { results: any }) => {
    if (!results) return null

    const totalSuccess = (results.products?.success || 0) + 
                        (results.categories?.success || 0) + 
                        (results.pages?.success || 0)
    
    const totalFailed = (results.products?.failed || 0) + 
                       (results.categories?.failed || 0) + 
                       (results.pages?.failed || 0)

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {t('seo.resultsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSuccess}</div>
              <div className="text-sm text-muted-foreground">{t('seo.success')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalFailed}</div>
              <div className="text-sm text-muted-foreground">{t('seo.failed')}</div>
            </div>
          </div>
          
          {(results.products || results.categories || results.pages) && (
            <div className="space-y-2">
              <Separator />
              <div className="text-sm space-y-1">
                {results.products && (
                  <div className="flex justify-between">
                    <span>{t('seo.products')}</span>
                    <span className="text-green-600">
                      {results.products.success} / {results.products.success + results.products.failed}
                    </span>
                  </div>
                )}
                {results.categories && (
                  <div className="flex justify-between">
                    <span>{t('seo.categories')}</span>
                    <span className="text-green-600">
                      {results.categories.success} / {results.categories.success + results.categories.failed}
                    </span>
                  </div>
                )}
                {results.pages && (
                  <div className="flex justify-between">
                    <span>{t('seo.pages')}</span>
                    <span className="text-green-600">
                      {results.pages.success} / {results.pages.success + results.pages.failed}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('seo.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('seo.description')}
        </p>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">{t('seo.generating')}</span>
                <span className="text-sm">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Action Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            {t('seo.generateAll')}
          </CardTitle>
          <CardDescription>
            {t('seo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateAll}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {t('seo.generateAll')}
          </Button>
        </CardContent>
      </Card>

      {/* Individual Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              {t('seo.products').replace(':', '')}
            </CardTitle>
            <CardDescription>
              {t('seo.generateProducts')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleGenerateProducts}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Package className="h-4 w-4 mr-2" />
              {t('seo.generateProducts')}
            </Button>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              {t('seo.categories').replace(':', '')}
            </CardTitle>
            <CardDescription>
              {t('seo.generateCategories')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleGenerateCategories}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {t('seo.generateCategories')}
            </Button>
          </CardContent>
        </Card>

        {/* Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              {t('seo.pages').replace(':', '')}
            </CardTitle>
            <CardDescription>
              {t('seo.generatePages')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleGeneratePages}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              {t('seo.generatePages')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* SEO Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t('seo.featuresTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">{t('seo.productsTitle')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('seo.optimizedTitle')}</li>
                <li>• {t('seo.autoDescription')}</li>
                <li>• {t('seo.keywords')}</li>
                <li>• {t('seo.socialLinks')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{t('seo.othersTitle')}</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t('seo.optimizedTitles')}</li>
                <li>• {t('seo.autoDescriptions')}</li>
                <li>• {t('seo.socialCards')}</li>
                <li>• {t('seo.canonicalUrls')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <ResultsSummary results={lastResults} />

    </div>
  )
}

export default SEOManagementPage
