import { Heart, Leaf, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function AboutPage() {
  const { t } = useTranslation()

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-muted/5 to-accent/10 bg-coffee-pattern">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-6 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-shadow-coffee bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            {t('about.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Story */}
        <div className="card-clean rounded-xl p-8 space-y-6">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-foreground/90">
              {t('about.story')}
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              {t('about.mission')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="card-clean hover:glow-coffee transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950 dark:to-red-900 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                <Heart className="h-6 w-6 text-red-600 dark:text-red-400 no-flip" />
              </div>
              <CardTitle className="text-lg text-foreground font-semibold">{t('about.values.qualityTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground leading-relaxed">
                {t('about.values.quality')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-clean hover:glow-coffee transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950 dark:to-green-900 rounded-lg flex items-center justify-center mb-4 shadow-lg bg-coffee-green">
                <Leaf className="h-6 w-6 text-green-600 dark:text-green-400 no-flip" />
              </div>
              <CardTitle className="text-lg text-foreground font-semibold">{t('about.values.sustainabilityTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground leading-relaxed">
                {t('about.values.sustainability')}
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-clean hover:glow-coffee transition-all duration-300 transform hover:-translate-y-2">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950 dark:to-amber-900 rounded-lg flex items-center justify-center mb-4 shadow-lg bg-coffee-gold">
                <Users className="h-6 w-6 text-amber-600 dark:text-amber-400 no-flip" />
              </div>
              <CardTitle className="text-lg text-foreground font-semibold">{t('about.values.communityTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground leading-relaxed">
                {t('about.values.community')}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
