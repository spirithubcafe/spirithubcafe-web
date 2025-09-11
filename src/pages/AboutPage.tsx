import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HTMLContent } from '@/components/ui/html-content';
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop';

interface AboutSection {
  id: string;
  layout: string;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  section_key: string;
  created_at: string;
  updated_at: string;
}

export function AboutPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [sections, setSections] = useState<AboutSection[]>([]);

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange();

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const response = await fetch('/data/about_sections.json');
      const data = await response.json();
      // Sort sections by order_index and filter active ones
      const activeSections = data
        .filter((section: AboutSection) => section.is_active)
        .sort((a: AboutSection, b: AboutSection) => a.order_index - b.order_index);
      setSections(activeSections);
    } catch (error) {
      console.error('Error loading about sections:', error);
    }
  };

  const renderSection = (section: AboutSection) => {
    const title = isRTL ? section.title_ar : section.title_en;
    const content = isRTL ? section.content_ar : section.content_en;
    
    // Full width section (like VALUES section)
    if (section.layout === 'full-width') {
      return (
        <section key={section.id} className="py-16 bg-muted/30 dark:bg-muted/10">
          <div className="container mx-auto px-4">
            <HTMLContent 
              content={content}
              className="max-w-none prose-headings:text-foreground prose-p:text-muted-foreground"
            />
          </div>
        </section>
      );
    }

    // Text-image layouts
    const isTextLeft = section.layout === 'text-left';
    const hasImage = section.image_url;

    return (
      <section key={section.id} className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {hasImage ? (
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${isRTL ? 'lg:gap-16' : ''}`}>
                {/* Image */}
                <div className={`${isTextLeft ? 'lg:order-2' : 'lg:order-1'} relative group`}>
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-card">
                    <img 
                      src={section.image_url || ''} 
                      alt={title}
                      className="w-full h-[400px] lg:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Content */}
                <div className={`${isTextLeft ? 'lg:order-1' : 'lg:order-2'} space-y-6`}>
                  <div className="space-y-4">
                    <h2 className={`text-4xl lg:text-5xl font-bold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                      {title}
                    </h2>
                    <div className={`w-20 h-1 bg-primary rounded-full ${isRTL ? 'ml-auto' : ''}`}></div>
                  </div>
                  
                  <HTMLContent 
                    content={content}
                    className="prose prose-lg max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground"
                  />
                </div>
              </div>
            ) : (
              // Text only section
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
                    {title}
                  </h2>
                  <div className="w-20 h-1 bg-primary rounded-full mx-auto"></div>
                </div>
                
                <HTMLContent 
                  content={content}
                  className="prose prose-xl max-w-none text-muted-foreground leading-relaxed prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-muted/20 to-primary/10 text-foreground py-24 lg:py-32 overflow-hidden border-b border-border">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-primary/20"></div>
          <img 
            src="/images/spirithub-coffee-roastery-oman.webp" 
            alt="Spirit Hub Coffee Roastery"
            className="w-full h-full object-cover opacity-30 dark:opacity-20"
          />
        </div>
        
        {/* Decorative elements - theme aware */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 dark:bg-primary/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 dark:bg-accent/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className={`text-5xl lg:text-7xl font-bold leading-tight text-foreground ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL ? 'من نحن' : 'About Us'}
            </h1>
            <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {isRTL 
                ? 'اكتشف قصة محمصة سبيريت هب للقهوة المختصة - رحلة من الشغف والتميز في عالم القهوة' 
                : 'Discover the story of Spirit Hub Specialty Coffee Roastery - A journey of passion and excellence in the world of coffee'
              }
            </p>
          </div>
        </div>
        
        {/* Scroll indicator - theme aware */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <div className="relative">
        {sections.map((section) => renderSection(section))}
      </div>

      {/* Call to Action Section - theme aware */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/95 dark:bg-primary/90"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground">
              {isRTL ? 'جرّب قهوتنا المميزة' : 'Experience Our Premium Coffee'}
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              {isRTL 
                ? 'انضم إلى رحلة النكهات الفريدة واكتشف الفرق في كل فنجان من قهوة سبيريت هب'
                : 'Join our unique flavor journey and discover the difference in every cup of Spirit Hub coffee'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/shop"
                className="inline-flex items-center px-8 py-4 bg-background text-foreground font-semibold rounded-full hover:bg-muted transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-border"
              >
                {isRTL ? 'تسوق الآن' : 'Shop Now'}
                <svg className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center px-8 py-4 border-2 border-primary-foreground text-primary-foreground font-semibold rounded-full hover:bg-primary-foreground hover:text-primary transition-all duration-300"
              >
                {isRTL ? 'اتصل بنا' : 'Contact Us'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
