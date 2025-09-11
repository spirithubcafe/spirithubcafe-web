import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { aboutService, type AboutSection, type AboutHeader } from '@/services/about';
import { HTMLContent } from '@/components/ui/html-content';
import { Loader } from '@/components/ui/loader';
import { AlertCircle } from 'lucide-react';
import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function AboutPage() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [header, setHeader] = useState<AboutHeader | null>(null);
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    try {
      setLoading(true);
      console.log('Loading about page data...');
      
      const { header: headerData, sections: sectionsData } = await aboutService.getAboutPageData(i18n.language);
      
      setHeader(headerData);
      setSections(sectionsData);
      
      console.log('Loaded header:', headerData);
      console.log('Loaded sections:', sectionsData);
      
      if (!headerData) {
        console.warn('No header data found');
      }
      
      if (sectionsData.length === 0) {
        console.warn('No sections data found');
      }
      
    } catch (err) {
      console.error('Error loading about page data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load about page data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading About Page</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header Section */}
      {header && (
        <section className="relative bg-gray-900 text-white py-20">
          <div className="absolute inset-0 z-0">
            <img 
              src={header.background_image} 
              alt={isRTL ? header.title_ar : header.title}
              className="w-full h-full object-cover opacity-50"
            />
          </div>
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {isRTL ? header.title_ar : header.title}
            </h1>
            <p className="text-xl md:text-2xl mb-6">
              {isRTL ? header.subtitle_ar : header.subtitle}
            </p>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {isRTL ? header.description_ar : header.description}
            </p>
            {header.cta_text && header.cta_link && (
              <a 
                href={header.cta_link}
                className="inline-block mt-8 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
              >
                {isRTL ? header.cta_text_ar : header.cta_text}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Sections */}
      <div className="container mx-auto px-4 py-16">
        {sections.length > 0 ? (
          sections.map((section) => (
            <div key={section.id} className="mb-16 last:mb-0">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-center">
                  {isRTL ? section.title_ar : section.title}
                </h2>
                
                {section.type === 'image_text' && section.image ? (
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className={section.order % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
                      <img 
                        src={section.image} 
                        alt={isRTL ? section.title_ar : section.title}
                        className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                    <div className={section.order % 2 === 0 ? 'md:order-2' : 'md:order-1'}>
                      <HTMLContent 
                        content={isRTL ? section.content_ar : section.content}
                        className="prose prose-lg max-w-none text-gray-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {section.image && (
                      <img 
                        src={section.image} 
                        alt={isRTL ? section.title_ar : section.title}
                        className="w-full max-w-2xl mx-auto h-64 object-cover rounded-lg shadow-lg mb-8"
                      />
                    )}
                    <HTMLContent 
                      content={isRTL ? section.content_ar : section.content}
                      className="prose prose-lg max-w-none text-gray-700 mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No content available</p>
          </div>
        )}
      </div>
    </div>
  );
}
