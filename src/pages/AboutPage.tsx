import { Heart, Leaf, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story */}
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-lg leading-relaxed">
            {t('about.story')}
          </p>
          <p className="text-lg leading-relaxed">
            {t('about.mission')}
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-red-600 no-flip" />
              </div>
              <CardTitle className="text-lg">Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('about.values.quality')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="h-6 w-6 text-green-600 no-flip" />
              </div>
              <CardTitle className="text-lg">Sustainability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('about.values.sustainability')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 no-flip" />
              </div>
              <CardTitle className="text-lg">Community</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {t('about.values.community')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
