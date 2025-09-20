// Aramex supported GCC countries with their states/provinces and cities
export interface AramexCity {
  name: string;
  nameAr: string;
  code?: string;
}

export interface AramexState {
  name: string;
  nameAr: string;
  code: string;
  cities: AramexCity[];
}

export interface AramexCountry {
  name: string;
  nameAr: string;
  code: string;
  flag: string;
  currency: string;
  states: AramexState[];
}

export const ARAMEX_GCC_COUNTRIES: AramexCountry[] = [
  {
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    code: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    states: [
      {
        name: 'Dubai',
        nameAr: 'دبي',
        code: 'DU',
        cities: [
          { name: 'Dubai', nameAr: 'دبي' },
          { name: 'Jebel Ali', nameAr: 'جبل علي' },
          { name: 'Dubai International Airport', nameAr: 'مطار دبي الدولي' },
          { name: 'Dubai Marina', nameAr: 'مرسى دبي' },
          { name: 'Downtown Dubai', nameAr: 'وسط مدينة دبي' },
        ]
      },
      {
        name: 'Abu Dhabi',
        nameAr: 'أبوظبي',
        code: 'AZ',
        cities: [
          { name: 'Abu Dhabi', nameAr: 'أبوظبي' },
          { name: 'Al Ain', nameAr: 'العين' },
          { name: 'Madinat Zayed', nameAr: 'مدينة زايد' },
          { name: 'Liwa', nameAr: 'ليوا' },
        ]
      },
      {
        name: 'Sharjah',
        nameAr: 'الشارقة',
        code: 'SH',
        cities: [
          { name: 'Sharjah', nameAr: 'الشارقة' },
          { name: 'Khor Fakkan', nameAr: 'خورفكان' },
          { name: 'Kalba', nameAr: 'كلباء' },
        ]
      },
      {
        name: 'Ajman',
        nameAr: 'عجمان',
        code: 'AJ',
        cities: [
          { name: 'Ajman', nameAr: 'عجمان' },
        ]
      },
      {
        name: 'Fujairah',
        nameAr: 'الفجيرة',
        code: 'FU',
        cities: [
          { name: 'Fujairah', nameAr: 'الفجيرة' },
          { name: 'Dibba Al-Fujairah', nameAr: 'دبا الفجيرة' },
        ]
      },
      {
        name: 'Ras Al Khaimah',
        nameAr: 'رأس الخيمة',
        code: 'RK',
        cities: [
          { name: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
        ]
      },
      {
        name: 'Umm Al Quwain',
        nameAr: 'أم القيوين',
        code: 'UQ',
        cities: [
          { name: 'Umm Al Quwain', nameAr: 'أم القيوين' },
        ]
      },
    ]
  },
  {
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    code: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    states: [
      {
        name: 'Riyadh',
        nameAr: 'الرياض',
        code: 'RI',
        cities: [
          { name: 'Riyadh', nameAr: 'الرياض' },
          { name: 'Al Kharj', nameAr: 'الخرج' },
          { name: 'Diriyah', nameAr: 'الدرعية' },
          { name: 'Al Majmaah', nameAr: 'المجمعة' },
        ]
      },
      {
        name: 'Makkah',
        nameAr: 'مكة المكرمة',
        code: 'MK',
        cities: [
          { name: 'Mecca', nameAr: 'مكة المكرمة' },
          { name: 'Jeddah', nameAr: 'جدة' },
          { name: 'Taif', nameAr: 'الطائف' },
          { name: 'Medina', nameAr: 'المدينة المنورة' },
        ]
      },
      {
        name: 'Eastern Province',
        nameAr: 'المنطقة الشرقية',
        code: 'EP',
        cities: [
          { name: 'Dammam', nameAr: 'الدمام' },
          { name: 'Al Khobar', nameAr: 'الخبر' },
          { name: 'Dhahran', nameAr: 'الظهران' },
          { name: 'Jubail', nameAr: 'الجبيل' },
          { name: 'Al Ahsa', nameAr: 'الأحساء' },
        ]
      },
      {
        name: 'Qassim',
        nameAr: 'القصيم',
        code: 'QS',
        cities: [
          { name: 'Buraydah', nameAr: 'بريدة' },
          { name: 'Unaizah', nameAr: 'عنيزة' },
        ]
      },
    ]
  },
  {
    name: 'Kuwait',
    nameAr: 'الكويت',
    code: 'KW',
    flag: '🇰🇼',
    currency: 'KWD',
    states: [
      {
        name: 'Capital',
        nameAr: 'العاصمة',
        code: 'CA',
        cities: [
          { name: 'Kuwait City', nameAr: 'مدينة الكويت' },
          { name: 'Shuwaikh', nameAr: 'الشويخ' },
        ]
      },
      {
        name: 'Hawalli',
        nameAr: 'حولي',
        code: 'HA',
        cities: [
          { name: 'Hawalli', nameAr: 'حولي' },
          { name: 'Salmiya', nameAr: 'السالمية' },
        ]
      },
      {
        name: 'Ahmadi',
        nameAr: 'الأحمدي',
        code: 'AH',
        cities: [
          { name: 'Ahmadi', nameAr: 'الأحمدي' },
          { name: 'Fahaheel', nameAr: 'الفحيحيل' },
        ]
      },
    ]
  },
  {
    name: 'Qatar',
    nameAr: 'قطر',
    code: 'QA',
    flag: '🇶🇦',
    currency: 'QAR',
    states: [
      {
        name: 'Doha',
        nameAr: 'الدوحة',
        code: 'DO',
        cities: [
          { name: 'Doha', nameAr: 'الدوحة' },
          { name: 'West Bay', nameAr: 'الخليج الغربي' },
        ]
      },
      {
        name: 'Al Rayyan',
        nameAr: 'الريان',
        code: 'RA',
        cities: [
          { name: 'Al Rayyan', nameAr: 'الريان' },
        ]
      },
    ]
  },
  {
    name: 'Bahrain',
    nameAr: 'البحرين',
    code: 'BH',
    flag: '🇧🇭',
    currency: 'BHD',
    states: [
      {
        name: 'Capital',
        nameAr: 'العاصمة',
        code: 'CA',
        cities: [
          { name: 'Manama', nameAr: 'المنامة' },
        ]
      },
      {
        name: 'Muharraq',
        nameAr: 'المحرق',
        code: 'MU',
        cities: [
          { name: 'Muharraq', nameAr: 'المحرق' },
        ]
      },
    ]
  },
  {
    name: 'Oman',
    nameAr: 'عُمان',
    code: 'OM',
    flag: '🇴🇲',
    currency: 'OMR',
    states: [
      {
        name: 'Muscat',
        nameAr: 'مسقط',
        code: 'MA',
        cities: [
          { name: 'Muscat', nameAr: 'مسقط' },
          { name: 'Seeb', nameAr: 'السيب' },
          { name: 'Bausher', nameAr: 'بوشر' },
          { name: 'Al Amarat', nameAr: 'العامرات' },
          { name: 'Quriyat', nameAr: 'قريات' },
          { name: 'Mutrah', nameAr: 'مطرح' },
        ]
      },
      {
        name: 'Dhofar',
        nameAr: 'ظفار',
        code: 'DH',
        cities: [
          { name: 'Salalah', nameAr: 'صلالة' },
          { name: 'Mirbat', nameAr: 'مرباط' },
        ]
      },
      {
        name: 'Batinah North',
        nameAr: 'شمال الباطنة',
        code: 'BN',
        cities: [
          { name: 'Sohar', nameAr: 'صحار' },
          { name: 'Shinas', nameAr: 'شناص' },
        ]
      },
      {
        name: 'Batinah South',
        nameAr: 'جنوب الباطنة',
        code: 'BS',
        cities: [
          { name: 'Rustaq', nameAr: 'الرستاق' },
          { name: 'Nakhal', nameAr: 'نخل' },
        ]
      },
      {
        name: 'Dakhliyah',
        nameAr: 'الداخلية',
        code: 'DA',
        cities: [
          { name: 'Nizwa', nameAr: 'نزوى' },
          { name: 'Bahla', nameAr: 'بهلاء' },
          { name: 'Manah', nameAr: 'منح' },
        ]
      },
      {
        name: 'Sharqiyah North',
        nameAr: 'شمال الشرقية',
        code: 'SN',
        cities: [
          { name: 'Ibra', nameAr: 'إبراء' },
          { name: 'Al Mudhaybi', nameAr: 'المضيبي' },
        ]
      },
      {
        name: 'Sharqiyah South',
        nameAr: 'جنوب الشرقية',
        code: 'SS',
        cities: [
          { name: 'Sur', nameAr: 'صور' },
          { name: 'Al Kamil', nameAr: 'الكامل' },
        ]
      },
    ]
  },
];

// Helper functions
export const getCountryByCode = (code: string): AramexCountry | undefined => {
  return ARAMEX_GCC_COUNTRIES.find(country => country.code === code);
};

export const getStatesByCountryCode = (countryCode: string): AramexState[] => {
  const country = getCountryByCode(countryCode);
  return country ? country.states : [];
};

export const getCitiesByStateCode = (countryCode: string, stateCode: string): AramexCity[] => {
  const states = getStatesByCountryCode(countryCode);
  const state = states.find(s => s.code === stateCode);
  return state ? state.cities : [];
};

export const getAllCitiesByCountryCode = (countryCode: string): AramexCity[] => {
  const states = getStatesByCountryCode(countryCode);
  return states.flatMap(state => state.cities);
};

export const isValidAramexDestination = (countryCode: string, city: string): boolean => {
  const cities = getAllCitiesByCountryCode(countryCode);
  return cities.some(c => c.name.toLowerCase() === city.toLowerCase());
};