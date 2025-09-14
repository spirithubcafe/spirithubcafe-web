import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore/lite'
import { db } from '@/lib/firebase'
import type { Database } from '@/types/database'

type AboutSection = Database['public']['Tables']['about_sections']['Row']
type AboutSectionInsert = Database['public']['Tables']['about_sections']['Insert']
type AboutSectionUpdate = Database['public']['Tables']['about_sections']['Update']

type AboutHeader = Database['public']['Tables']['about_header']['Row']
type AboutHeaderInsert = Database['public']['Tables']['about_header']['Insert']
type AboutHeaderUpdate = Database['public']['Tables']['about_header']['Update']

export interface AboutHeaderData {
  id?: string
  title_en: string
  title_ar: string
  subtitle_en: string
  subtitle_ar: string
  is_active?: boolean
}

export interface AboutSectionData {
  id?: string
  section_key: string
  title_en: string
  title_ar: string
  content_en: string
  content_ar: string
  image_url?: string | null
  layout: 'text-left' | 'text-right' | 'full-width'
  order_index: number
  is_active?: boolean
}

class AboutService {
  private sectionsCollectionName = 'about_sections'
  private headerCollectionName = 'about_header'

  // Header methods
  async getHeader(): Promise<AboutHeader | null> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const q = query(
        collection(db, this.headerCollectionName),
        where('is_active', '==', true)
      )
      
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) return null
      
      const headerDoc = querySnapshot.docs[0]
      return {
        id: headerDoc.id,
        ...headerDoc.data()
      } as AboutHeader
    } catch (error) {
      console.error('Error fetching about header:', error)
      throw new Error('Failed to load about header')
    }
  }

  async createHeader(data: AboutHeaderData): Promise<AboutHeader> {
    const headerData: AboutHeaderInsert = {
      title_en: data.title_en,
      title_ar: data.title_ar,
      subtitle_en: data.subtitle_en,
      subtitle_ar: data.subtitle_ar,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      if (!db) throw new Error('Database not initialized')
      
      const docRef = await addDoc(collection(db, this.headerCollectionName), headerData)
      return { id: docRef.id, ...headerData } as AboutHeader
    } catch (error) {
      console.error('Error creating about header:', error)
      throw new Error('Failed to create about header')
    }
  }

  async updateHeader(id: string, data: Partial<AboutHeaderData>): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const updateData: AboutHeaderUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }
      
      const headerRef = doc(db, this.headerCollectionName, id)
      await updateDoc(headerRef, updateData)
    } catch (error) {
      console.error('Error updating about header:', error)
      throw new Error('Failed to update about header')
    }
  }

  async initializeDefaultHeader(): Promise<void> {
    try {
      const existingHeader = await this.getHeader()
      if (existingHeader) {
        console.log('About header already exists, skipping initialization')
        return
      }

      const defaultHeader: AboutHeaderData = {
        title_en: 'About Us',
        title_ar: 'من نحن',
        subtitle_en: 'Who We Are',
        subtitle_ar: 'من نحن',
        is_active: true
      }

      await this.createHeader(defaultHeader)
      console.log('Default about header initialized successfully')
    } catch (error) {
      console.error('Error initializing default header:', error)
      throw new Error('Failed to initialize default header')
    }
  }

  // Section methods (existing)
  async getSections(): Promise<AboutSection[]> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      console.log('getSections: Starting to fetch sections from Firestore...')
      
      const q = query(
        collection(db, this.sectionsCollectionName),
        where('is_active', '==', true),
        orderBy('order_index', 'asc')
      )
      
      console.log('getSections: Query created, executing...')
      
      const querySnapshot = await getDocs(q)
      console.log('getSections: Query executed successfully, docs count:', querySnapshot.docs.length)
      
      const sections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AboutSection[]

      console.log('getSections: Sections mapped successfully:', sections)
      return sections
    } catch (error) {
      console.error('Error fetching about sections:', error)
      throw new Error('Failed to load about sections')
    }
  }

  // Get all sections for admin (including inactive)
  async getAllSections(): Promise<AboutSection[]> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const q = query(
        collection(db, this.sectionsCollectionName),
        orderBy('order_index', 'asc')
      )
      
      const querySnapshot = await getDocs(q)
      const sections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AboutSection[]

      return sections
    } catch (error) {
      console.error('Error fetching all about sections:', error)
      throw new Error('Failed to load about sections')
    }
  }

  // Create a new about section
  async createSection(data: AboutSectionData): Promise<AboutSection> {
    const sectionData: AboutSectionInsert = {
      section_key: data.section_key,
      title_en: data.title_en,
      title_ar: data.title_ar,
      content_en: data.content_en,
      content_ar: data.content_ar,
      image_url: data.image_url || null,
      layout: data.layout,
      order_index: data.order_index,
      is_active: data.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    try {
      if (!db) throw new Error('Database not initialized')
      
      const docRef = await addDoc(collection(db, this.sectionsCollectionName), sectionData)
      return { id: docRef.id, ...sectionData } as AboutSection
    } catch (error) {
      console.error('Error creating about section:', error)
      throw new Error('Failed to create about section')
    }
  }

  // Update an about section
  async updateSection(id: string, data: Partial<AboutSectionData>): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const updateData: AboutSectionUpdate = {
        ...data,
        updated_at: new Date().toISOString()
      }
      
      const sectionRef = doc(db, this.sectionsCollectionName, id)
      await updateDoc(sectionRef, updateData)
    } catch (error) {
      console.error('Error updating about section:', error)
      throw new Error('Failed to update about section')
    }
  }

  // Delete an about section
  async deleteSection(id: string): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const sectionRef = doc(db, this.sectionsCollectionName, id)
      await deleteDoc(sectionRef)
    } catch (error) {
      console.error('Error deleting about section:', error)
      throw new Error('Failed to delete about section')
    }
  }

  // Toggle section active status
  async toggleSectionStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.updateSection(id, { is_active: isActive })
    } catch (error) {
      console.error('Error toggling section status:', error)
      throw new Error('Failed to toggle section status')
    }
  }

  // Update sections order
  async updateSectionsOrder(sections: { id: string; order_index: number }[]): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const updatePromises = sections.map(section =>
        this.updateSection(section.id, { order_index: section.order_index })
      )
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error updating sections order:', error)
      throw new Error('Failed to update sections order')
    }
  }

  // Initialize default sections
  async initializeDefaultSections(): Promise<void> {
    try {
      const existingSections = await this.getAllSections()
      if (existingSections.length > 0) {
        console.log('About sections already exist, skipping initialization')
        return
      }

      // Initialize header first
      await this.initializeDefaultHeader()

      const defaultSections: AboutSectionData[] = [
        {
          section_key: 'mission',
          title_en: 'OUR MISSION',
          title_ar: 'مهمتنا',
          content_en: `At SPIRIT HUB Coffee, we take great care in selecting only the finest specialty coffees to be part of our exclusive blend. Our team of experienced Q Graders and Roasters carefully manage the roast to create a unique selection of flavors and aromas that are sure to please the most discerning coffee lover.

We believe that quality is of the utmost importance, which is why we strictly adhere to the highest protocols and quality controls during the cupping and testing process. This ensures that every cup of SPIRIT HUB Coffee meets our high standards and delivers a truly exceptional taste experience.

Our commitment to quality extends beyond the coffee itself. We are dedicated to providing our customers with the best possible service and coffee experience. Whether you are enjoying a cup at one of our cafés or brewing a fresh pot at home, we want you to be completely satisfied with your SPIRIT HUB Coffee experience.

In short, at SPIRIT HUB Coffee, we are passionate about coffee and dedicated to providing our customers with the finest quality coffee experience possible. We invite you to try our exclusive blend and taste the difference for yourself.`,
          content_ar: `في سبيريت هاب كوفي، نولي عناية فائقة في اختيار أجود أنواع القهوة المتخصصة لتكون جزءًا من مزيجنا الحصري. يدير فريقنا من خبراء التقييم والمحمصين عملية التحميص بعناية لإنشاء مجموعة فريدة من النكهات والروائح التي ستسعد أكثر محبي القهوة تميزًا.

نؤمن بأن الجودة هي الأهم، ولهذا نلتزم بصرامة بأعلى البروتوكولات ومراقبة الجودة أثناء عملية التذوق والاختبار. يضمن هذا أن كل كوب من قهوة سبيريت هاب يلبي معاييرنا العالية ويقدم تجربة طعم استثنائية حقًا.

التزامنا بالجودة يتجاوز القهوة نفسها. نحن ملتزمون بتقديم أفضل خدمة وتجربة قهوة ممكنة لعملائنا. سواء كنت تستمتع بكوب في أحد مقاهينا أو تحضر إبريقًا طازجًا في المنزل، نريدك أن تكون راضيًا تمامًا عن تجربة قهوة سبيريت هاب.

باختصار، في سبيريت هاب كوفي، نحن شغوفون بالقهوة ومكرسون لتقديم أجود تجربة قهوة ممكنة لعملائنا. ندعوك لتجربة مزيجنا الحصري وتذوق الفرق بنفسك.`,
          image_url: '/images/about/1.webp',
          layout: 'text-right',
          order_index: 1
        },
        {
          section_key: 'quality',
          title_en: 'QUALITY',
          title_ar: 'الجودة',
          content_en: `Coffee, a beloved beverage globally, is enjoyed by millions daily. The flavor and aroma of coffee depend on factors like bean type, roasting, and brewing method.

Many roasters ensure high standards by closely following harvesting seasons. This helps in selecting the freshest, highest quality beans, meticulously roasted to bring out unique flavors and aromas.

The roasting process, considered an art, requires skilled roasters to create the perfect roast profile. They control temperature, time, and air flow to achieve the desired flavor and aroma for each batch of beans.

After roasting, freshly roasted coffee beans contain a high level of CO2, which can affect their flavor and aroma. To allow the CO2 to dissipate and the flavors to fully develop, it is recommended that coffee be allowed to rest for 7 to 10 days before brewing.

Following these steps, roasters produce high-quality coffee rich in flavor and aroma. When you savor your next cup, appreciate the care and attention behind that perfect brew.`,
          content_ar: `القهوة، المشروب المحبوب عالميًا، يستمتع بها الملايين يوميًا. تعتمد النكهة والرائحة على عوامل مثل نوع الحبوب والتحميص وطريقة التحضير.

يضمن العديد من المحمصين معايير عالية من خلال متابعة مواسم الحصاد عن كثب. يساعد هذا في اختيار الحبوب الأطازج والأعلى جودة، المحمصة بدقة لإبراز النكهات والروائح الفريدة.

عملية التحميص، التي تعتبر فنًا، تتطلب محمصين مهرة لإنشاء ملف التحميص المثالي. يتحكمون في درجة الحرارة والوقت وتدفق الهواء لتحقيق النكهة والرائحة المرغوبة لكل دفعة من الحبوب.

بعد التحميص، تحتوي حبوب القهوة المحمصة حديثًا على مستوى عالٍ من ثاني أكسيد الكربون، مما قد يؤثر على نكهتها ورائحتها. للسماح بتبدد ثاني أكسيد الكربون وتطوير النكهات بالكامل، يُنصح بترك القهوة تستريح لمدة 7 إلى 10 أيام قبل التحضير.

باتباع هذه الخطوات، ينتج المحمصون قهوة عالية الجودة غنية بالنكهة والرائحة. عندما تتذوق كوبك التالي، قدر العناية والاهتمام وراء ذلك المشروب المثالي.`,
          image_url: '/images/about/2.webp',
          layout: 'text-left',
          order_index: 2
        },
        {
          section_key: 'accountability',
          title_en: 'Accountability',
          title_ar: 'المساءلة',
          content_en: `Accountability and transparency are crucial for building trust and maintaining a positive reputation in business. At SPIRIT HUB Coffee, we take pride in sharing information and educating our community, customers, and clients about our unique coffee.

By sharing this information, we aim to create openness and trust, fostering strong and lasting relationships with our audience. Excitingly, we publish details about our coffee on various media platforms, such as our website, social media, and newsletter.

Moreover, our commitment extends beyond information sharing to being accountable for our actions and decisions. This entails taking responsibility for the quality of our coffee, as well as addressing our environmental and social impact.

Transparent and accountable practices enable us to build a positive reputation and nurture long-term relationships with our customers and clients. Proudly presenting SPIRIT HUB Coffee to the world, we eagerly anticipate sharing our unique coffee with the community.`,
          content_ar: `المساءلة والشفافية أمران بالغا الأهمية لبناء الثقة والحفاظ على سمعة إيجابية في الأعمال. في سبيريت هاب كوفي، نفخر بمشاركة المعلومات وتثقيف مجتمعنا وعملائنا حول قهوتنا الفريدة.

من خلال مشاركة هذه المعلومات، نهدف إلى خلق الانفتاح والثقة، وتعزيز علاقات قوية ودائمة مع جمهورنا. نشر تفاصيل عن قهوتنا على منصات إعلامية مختلفة، مثل موقعنا الإلكتروني ووسائل التواصل الاجتماعي والنشرة الإخبارية.

علاوة على ذلك، يمتد التزامنا إلى ما وراء مشاركة المعلومات ليشمل المساءلة عن أفعالنا وقراراتنا. يستلزم هذا تحمل المسؤولية عن جودة قهوتنا، بالإضافة إلى معالجة تأثيرنا البيئي والاجتماعي.

تمكننا الممارسات الشفافة والمسؤولة من بناء سمعة إيجابية ورعاية علاقات طويلة الأمد مع عملائنا. نقدم سبيريت هاب كوفي بفخر للعالم، ونتطلع بشوق لمشاركة قهوتنا الفريدة مع المجتمع.`,
          image_url: '/images/about/3.webp',
          layout: 'text-right',
          order_index: 3
        },
        {
          section_key: 'values',
          title_en: 'Values',
          title_ar: 'القيم',
          content_en: `Established in Oman, SPIRIT HUB Roastery & Specialty Coffee is committed to enhancing the coffee experience for its customers. By focusing on specialty coffee, the team at SPIRIT HUB skillfully highlights the unique flavors and aromas of each batch of beans.

A crucial aspect of specialty coffee is the meticulous attention to detail and hard work invested by the farmers in growing and harvesting the beans. SPIRIT HUB not only recognizes but also appreciates the efforts of these farmers, actively striving to showcase their significant contributions to the coffee industry.

In addition to supporting farmers, SPIRIT HUB places a strong emphasis on the scientific aspects of coffee. From the roasting process to the brewing method, the SPIRIT HUB team is dedicated to understanding the intricacies that make each cup of coffee special. This commitment enables them to craft a distinctive and satisfying experience for their customers.

As a business exclusively operated by an OMANI team, SPIRIT HUB contributes significantly to the local economy and community. This support is vital for fostering the growth and sustainability of the specialty coffee industry in Oman.

Overall, SPIRIT HUB Roastery & Specialty Coffee is unwavering in its dedication to delivering a high-quality coffee experience. Simultaneously, the business plays a pivotal role in supporting the local community and the farmers whose hard work makes it all possible.`,
          content_ar: `تأسست في عُمان، تلتزم محمصة سبيريت هاب والقهوة المتخصصة بتعزيز تجربة القهوة لعملائها. من خلال التركيز على القهوة المتخصصة، يسلط فريق سبيريت هاب الضوء بمهارة على النكهات والروائح الفريدة لكل دفعة من الحبوب.

جانب مهم من القهوة المتخصصة هو الاهتمام الدقيق بالتفاصيل والعمل الشاق الذي يستثمره المزارعون في زراعة وحصاد الحبوب. لا تعترف سبيريت هاب فقط بجهود هؤلاء المزارعين ولكنها تقدرها أيضًا، وتسعى بنشاط لإظهار مساهماتهم المهمة في صناعة القهوة.

بالإضافة إلى دعم المزارعين، تضع سبيريت هاب تركيزًا قويًا على الجوانب العلمية للقهوة. من عملية التحميص إلى طريقة التحضير، يكرس فريق سبيريت هاب نفسه لفهم التعقيدات التي تجعل كل كوب قهوة مميزًا. يمكّن هذا الالتزام من صياغة تجربة مميزة ومرضية لعملائهم.

كونها شركة تديرها بشكل حصري فريق عُماني، تساهم سبيريت هاب بشكل كبير في الاقتصاد والمجتمع المحلي. هذا الدعم حيوي لتعزيز نمو واستدامة صناعة القهوة المتخصصة في عُمان.

بشكل عام، محمصة سبيريت هاب والقهوة المتخصصة ثابتة في تفانيها لتقديم تجربة قهوة عالية الجودة. في الوقت نفسه، تلعب الشركة دورًا محوريًا في دعم المجتمع المحلي والمزارعين الذين يجعلون عملهم الشاق كل هذا ممكنًا.`,
          image_url: null,
          layout: 'full-width',
          order_index: 4
        }
      ]

      for (const section of defaultSections) {
        await this.createSection(section)
      }

      console.log('Default about sections initialized successfully')
    } catch (error) {
      console.error('Error initializing default sections:', error)
      throw new Error('Failed to initialize default sections')
    }
  }
}

export const aboutService = new AboutService()