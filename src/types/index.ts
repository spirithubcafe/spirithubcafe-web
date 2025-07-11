// User Types
export interface User {
  id: string
  name: string
  nameAr?: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
  phone?: string
  address?: string
  joinDate: string
}

// Product Types
export interface Product {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  price: number
  image: string
  category: string
  categoryAr: string
  inStock: boolean
  rating: number
  reviews: number
}

// Cart Types
export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  total: number
  totalItems: number
}

// Order Types
export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  paymentMethod: string
}

// Auth Types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

// Demo Users
export const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'John Smith',
    nameAr: 'جون سميث',
    email: 'user@demo.com',
    role: 'user',
    avatar: '/avatars/user.jpg',
    phone: '+1 555-0123',
    address: '123 Coffee Street, Bean City',
    joinDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Admin User',
    nameAr: 'مستخدم مدير',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: '/avatars/admin.jpg',
    phone: '+1 555-0456',
    address: '456 Admin Avenue, Control City',
    joinDate: '2023-06-01'
  }
]

// Demo Products
export const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Arabica Beans',
    nameAr: 'حبوب أرابيكا فاخرة',
    description: 'Premium quality Arabica coffee beans from Ethiopia',
    descriptionAr: 'حبوب قهوة أرابيكا عالية الجودة من إثيوبيا',
    price: 24.99,
    image: '/products/arabica.jpg',
    category: 'Coffee Beans',
    categoryAr: 'حبوب القهوة',
    inStock: true,
    rating: 4.8,
    reviews: 127
  },
  {
    id: '2',
    name: 'Dark Roast Espresso',
    nameAr: 'إسبريسو محمص داكن',
    description: 'Rich and bold dark roast perfect for espresso',
    descriptionAr: 'تحميص داكن غني ومميز مثالي للإسبريسو',
    price: 19.99,
    image: '/products/dark-roast.jpg',
    category: 'Coffee Beans',
    categoryAr: 'حبوب القهوة',
    inStock: true,
    rating: 4.6,
    reviews: 89
  },
  {
    id: '3',
    name: 'Colombian Single Origin',
    nameAr: 'كولومبي أصل واحد',
    description: 'Single origin Colombian coffee with chocolate notes',
    descriptionAr: 'قهوة كولومبية أصل واحد مع نكهات الشوكولاتة',
    price: 29.99,
    image: '/products/colombian.jpg',
    category: 'Coffee Beans',
    categoryAr: 'حبوب القهوة',
    inStock: true,
    rating: 4.9,
    reviews: 156
  },
  {
    id: '4',
    name: 'French Press',
    nameAr: 'فرنش بريس',
    description: 'Professional French press coffee maker',
    descriptionAr: 'صانعة قهوة فرنش بريس احترافية',
    price: 39.99,
    image: '/products/french-press.jpg',
    category: 'Equipment',
    categoryAr: 'المعدات',
    inStock: true,
    rating: 4.7,
    reviews: 203
  },
  {
    id: '5',
    name: 'Coffee Grinder',
    nameAr: 'طاحونة القهوة',
    description: 'Electric burr coffee grinder for perfect grind',
    descriptionAr: 'طاحونة قهوة كهربائية للطحن المثالي',
    price: 79.99,
    image: '/products/grinder.jpg',
    category: 'Equipment',
    categoryAr: 'المعدات',
    inStock: false,
    rating: 4.5,
    reviews: 94
  },
  {
    id: '6',
    name: 'Coffee Mug Set',
    nameAr: 'طقم أكواب القهوة',
    description: 'Set of 4 ceramic coffee mugs',
    descriptionAr: 'طقم من 4 أكواب قهوة سيراميك',
    price: 24.99,
    image: '/products/mugs.jpg',
    category: 'Accessories',
    categoryAr: 'الإكسسوارات',
    inStock: true,
    rating: 4.4,
    reviews: 67
  }
]
