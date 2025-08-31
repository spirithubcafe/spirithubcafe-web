import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { aboutService, type AboutSectionData, type AboutHeaderData } from '@/services/about';
import { HTMLContent } from '@/components/ui/html-content';
import { Loader } from '@/components/ui/loader';
import { AlertCircle } from 'lucide-react';
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function AboutPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [header, setHeader] = useState<AboutHeaderData | null>(null);
  const [sections, setSections] = useState<AboutSectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      // First try to load existing header and sections
      console.log('Loading about header and sections...');
      
      const [headerData, sectionsData] = await Promise.all([
        aboutService.getHeader(),
        aboutService.getSections()
      ]);

      if (!headerData) {
        console.log('No header found, initializing defaults...');
        await aboutService.initializeDefaultHeader();
        const newHeaderData = await aboutService.getHeader();
        setHeader(newHeaderData);
      } else {
        setHeader(headerData);
      }
      
      if (sectionsData.length === 0) {
        console.log('No sections found, initializing default sections...');
        await aboutService.initializeDefaultSections();
        const newSectionsData = await aboutService.getSections();
        setSections(newSectionsData);
      } else {
        setSections(sectionsData);
      }
      
      console.log('Loaded header:', headerData);
      console.log('Loaded sections:', sectionsData);
    } catch (err) {
      console.error('Error loading about page data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load about page data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-background via-muted/5 to-accent/10 bg-coffee-pattern">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader size="md" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-b from-background via-muted/5 to-accent/10 bg-coffee-pattern">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-muted/5 to-accent/10 bg-coffee-pattern">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="space-y-6 text-center">
            <div className="text-5xl font-bold tracking-tight text-shadow-coffee bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {header ? (
                <HTMLContent 
                  content={isRTL ? header.title_ar : header.title_en}
                  className="inline-block"
                />
              ) : (
                isRTL ? 'من نحن' : 'About Us'
              )}
            </div>
            <div className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {header ? (
                <HTMLContent 
                  content={isRTL ? header.subtitle_ar : header.subtitle_en}
                />
              ) : (
                isRTL ? 'من نحن' : 'Who We Are'
              )}
            </div>
          </div>

          {/* Dynamic Sections */}
          {sections.map((section) => (
            <section
              key={section.id}
              className={
                section.layout === 'full-width' 
                  ? 'card-clean rounded-xl p-8 space-y-8' 
                  : 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
              }
            >
              {section.layout === 'full-width' ? (
                // Full Width Layout
                <div className="text-center space-y-4">
                  <div className="text-3xl font-bold text-foreground">
                    <HTMLContent 
                      content={isRTL ? section.title_ar : section.title_en}
                    />
                  </div>
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <HTMLContent 
                      content={isRTL ? section.content_ar : section.content_en}
                      className="space-y-4 text-lg text-foreground/90 leading-relaxed"
                    />
                  </div>
                </div>
              ) : (
                // Side by Side Layout
                <>
                  {/* Image */}
                  {section.image_url && (
                    <div className={section.layout === 'text-right' ? 'order-2 lg:order-1' : (section.layout === 'text-left' ? 'order-1 lg:order-2' : 'order-1')}>
                      <img 
                        src={section.image_url} 
                        alt={isRTL ? section.title_ar : section.title_en}
                        className="w-full h-auto object-contain rounded-xl shadow-lg"
                      />
                    </div>
                  )}
                  
                  {/* Text Content */}
                  <div className={section.layout === 'text-right' ? 'order-1 lg:order-2 space-y-6' : (section.layout === 'text-left' ? 'order-2 lg:order-1 space-y-6' : 'space-y-6')}>
                    <div className="text-3xl font-bold text-foreground">
                      <HTMLContent 
                        content={isRTL ? section.title_ar : section.title_en}
                      />
                    </div>
                    <HTMLContent 
                      content={isRTL ? section.content_ar : section.content_en}
                      className="space-y-4 text-lg text-foreground/90 leading-relaxed"
                    />
                  </div>
                </>
              )}
            </section>
          ))}

          {/* No Sections Fallback */}
          {sections.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No sections available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
