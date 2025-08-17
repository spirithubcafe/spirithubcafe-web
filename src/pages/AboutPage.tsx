import { useScrollToTopOnRouteChange } from '@/hooks/useSmoothScrollToTop'

export function AboutPage() {
  // Smooth scroll to top when page loads
  useScrollToTopOnRouteChange()

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-background via-muted/5 to-accent/10 bg-coffee-pattern">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="space-y-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight text-shadow-coffee bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Who We Are
            </p>
          </div>

          {/* Section 1: Our Mission - Text Right, Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/images/about/1.webp" 
                alt="Our Mission" 
                className="w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">OUR MISSION</h2>
              <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
                <p>
                  At SPIRIT HUB Coffee, we take great care in selecting only the finest specialty coffees to be part of our exclusive blend. Our team of experienced Q Graders and Roasters carefully manage the roast to create a unique selection of flavors and aromas that are sure to please the most discerning coffee lover.
                </p>
                <p>
                  We believe that quality is of the utmost importance, which is why we strictly adhere to the highest protocols and quality controls during the cupping and testing process. This ensures that every cup of SPIRIT HUB Coffee meets our high standards and delivers a truly exceptional taste experience.
                </p>
                <p>
                  Our commitment to quality extends beyond the coffee itself. We are dedicated to providing our customers with the best possible service and coffee experience. Whether you are enjoying a cup at one of our cafés or brewing a fresh pot at home, we want you to be completely satisfied with your SPIRIT HUB Coffee experience.
                </p>
                <p>
                  In short, at SPIRIT HUB Coffee, we are passionate about coffee and dedicated to providing our customers with the finest quality coffee experience possible. We invite you to try our exclusive blend and taste the difference for yourself.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Quality - Text Left, Image Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">QUALITY</h2>
              <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
                <p>
                  Coffee, a beloved beverage globally, is enjoyed by millions daily. The flavor and aroma of coffee depend on factors like bean type, roasting, and brewing method.
                </p>
                <p>
                  Many roasters ensure high standards by closely following harvesting seasons. This helps in selecting the freshest, highest quality beans, meticulously roasted to bring out unique flavors and aromas.
                </p>
                <p>
                  The roasting process, considered an art, requires skilled roasters to create the perfect roast profile. They control temperature, time, and air flow to achieve the desired flavor and aroma for each batch of beans.
                </p>
                <p>
                  After roasting, freshly roasted coffee beans contain a high level of CO2, which can affect their flavor and aroma. To allow the CO2 to dissipate and the flavors to fully develop, it is recommended that coffee be allowed to rest for 7 to 10 days before brewing.
                </p>
                <p>
                  Following these steps, roasters produce high-quality coffee rich in flavor and aroma. When you savor your next cup, appreciate the care and attention behind that perfect brew.
                </p>
              </div>
            </div>
            <div>
              <img 
                src="/images/about/2.webp" 
                alt="Quality" 
                className="w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>

          {/* Section 3: Accountability - Text Right, Image Left */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="/images/about/3.webp" 
                alt="Accountability" 
                className="w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Accountability</h2>
              <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
                <p>
                  Accountability and transparency are crucial for building trust and maintaining a positive reputation in business. At SPIRIT HUB Coffee, we take pride in sharing information and educating our community, customers, and clients about our unique coffee.
                </p>
                <p>
                  By sharing this information, we aim to create openness and trust, fostering strong and lasting relationships with our audience. Excitingly, we publish details about our coffee on various media platforms, such as our website, social media, and newsletter.
                </p>
                <p>
                  Moreover, our commitment extends beyond information sharing to being accountable for our actions and decisions. This entails taking responsibility for the quality of our coffee, as well as addressing our environmental and social impact.
                </p>
                <p>
                  Transparent and accountable practices enable us to build a positive reputation and nurture long-term relationships with our customers and clients. Proudly presenting SPIRIT HUB Coffee to the world, we eagerly anticipate sharing our unique coffee with the community.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Values - Full Width */}
          <div className="card-clean rounded-xl p-8 space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground">Values</h2>
            </div>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="space-y-4 text-lg text-foreground/90 leading-relaxed">
                <p>
                  Established in Oman, SPIRIT HUB Roastery & Specialty Coffee is committed to enhancing the coffee experience for its customers. By focusing on specialty coffee, the team at SPIRIT HUB skillfully highlights the unique flavors and aromas of each batch of beans.
                </p>
                <p>
                  A crucial aspect of specialty coffee is the meticulous attention to detail and hard work invested by the farmers in growing and harvesting the beans. SPIRIT HUB not only recognizes but also appreciates the efforts of these farmers, actively striving to showcase their significant contributions to the coffee industry.
                </p>
                <p>
                  In addition to supporting farmers, SPIRIT HUB places a strong emphasis on the scientific aspects of coffee. From the roasting process to the brewing method, the SPIRIT HUB team is dedicated to understanding the intricacies that make each cup of coffee special. This commitment enables them to craft a distinctive and satisfying experience for their customers.
                </p>
                <p>
                  As a business exclusively operated by an OMANI team, SPIRIT HUB contributes significantly to the local economy and community. This support is vital for fostering the growth and sustainability of the specialty coffee industry in Oman.
                </p>
                <p>
                  Overall, SPIRIT HUB Roastery & Specialty Coffee is unwavering in its dedication to delivering a high-quality coffee experience. Simultaneously, the business plays a pivotal role in supporting the local community and the farmers whose hard work makes it all possible.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
