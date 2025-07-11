import { Link } from 'react-router-dom'
import { ArrowRight, Coffee, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              {t('homepage.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('homepage.hero.subtitle')}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {t('homepage.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg">
                <Link to="/shop" className="flex items-center justify-center">
                  {t('homepage.hero.shopNow')}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 no-flip" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about">
                  {t('homepage.hero.learnMore')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-amber-600 no-flip" />
                </div>
                <CardTitle>{t('homepage.features.quality.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('homepage.features.quality.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-amber-600 no-flip" />
                </div>
                <CardTitle>{t('homepage.features.freshness.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('homepage.features.freshness.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950 rounded-lg flex items-center justify-center mb-4">
                  <Coffee className="h-6 w-6 text-amber-600 no-flip" />
                </div>
                <CardTitle>{t('homepage.features.expertise.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('homepage.features.expertise.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
