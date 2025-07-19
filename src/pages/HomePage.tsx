import { Link } from 'react-router-dom'
import { ArrowRight, Coffee, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

export function HomePage() {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [textVisible, setTextVisible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.addEventListener('loadeddata', () => {
        // Start text animation after video loads
        setTimeout(() => setTextVisible(true), 1000)
      })
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full object-cover transition-all duration-[4000ms] ease-out ${
              textVisible ? 'blur-[6px] scale-105' : 'blur-[12px] scale-110'
            }`}
            style={{
              filter: `blur(${textVisible ? '6px' : '12px'}) brightness(0.5) contrast(1.3) saturate(0.8)`
            }}
          >
            <source src="/video/back.mp4" type="video/mp4" />
          </video>
          
          {/* Enhanced overlay gradients for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60"></div>
          
          {/* Additional overlay when text is visible */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-2000 ${
            textVisible ? 'opacity-100' : 'opacity-0'
          }`}></div>
          
          {/* Animated particles overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(251,191,36,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.08),transparent_50%)]"></div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className={`space-y-6 transition-all duration-1000 ease-out ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium shadow-xl">
                <Coffee className="h-4 w-4 mr-2 accent-coffee-gold" />
                {t('homepage.hero.badge', 'Premium Coffee Experience')}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-2xl text-shadow-coffee">
                <span className="block bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent">
                  {t('homepage.hero.title')}
                </span>
              </h1>
            </div>
            
            <div className={`space-y-6 transition-all duration-1000 ease-out delay-300 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                {t('homepage.hero.subtitle')}
              </p>
              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
                {t('homepage.hero.description')}
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-6 transition-all duration-1000 ease-out delay-500 ${
              textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Button asChild size="lg" className="btn-coffee shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
                <Link to="/shop" className="flex items-center justify-center">
                  {t('homepage.hero.shopNow')}
                  <ArrowRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 no-flip" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link to="/about">
                  {t('homepage.hero.learnMore')}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-muted/10 to-accent/5 bg-coffee-pattern w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-shadow-coffee">
                {t('homepage.features.title', 'Why Choose Us')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('homepage.features.subtitle', 'Discover what makes our coffee exceptional')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-8 w-8 text-amber-600 dark:text-amber-400 no-flip" />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.quality.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.quality.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-950 dark:to-emerald-950 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg bg-coffee-green">
                  <Clock className="h-8 w-8 text-green-600 dark:text-green-400 no-flip" />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.freshness.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.freshness.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean group hover:glow-coffee hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg bg-coffee-gold">
                  <Coffee className="h-8 w-8 text-amber-700 dark:text-amber-300 no-flip" />
                </div>
                <CardTitle className="text-xl">{t('homepage.features.expertise.title')}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed">
                  {t('homepage.features.expertise.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>
    </div>
  )
}
