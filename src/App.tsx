import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { CurrencyProvider } from '@/components/currency-provider'
import { AuthProvider } from '@/components/auth-provider'
import { CartProvider } from '@/components/cart-provider'
import { DataProvider } from '@/contexts/enhanced-data-provider'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Suspense, lazy, memo } from 'react'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { AdvancedLoading } from '@/components/ui/advanced-loading'
import './App.css'

// Debug utilities (development only - disabled to reduce console noise)
// if (process.env.NODE_ENV === 'development') {
//   import('./utils/auth-debug')
//   import('./utils/firebase-emulator')
// }

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage').then(module => ({ default: module.HomePage })))
const ShopPage = lazy(() => import('@/pages/ShopPage').then(module => ({ default: module.ShopPage })))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const EnhancedCacheManagementPage = lazy(() => import('@/pages/EnhancedCacheManagementPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage').then(module => ({ default: module.AboutPage })))
const ContactPage = lazy(() => import('@/pages/ContactPage').then(module => ({ default: module.ContactPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(module => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(module => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const CheckoutSuccessPage = lazy(() => import('@/pages/CheckoutSuccessPage'))
const CheckoutSettingsPage = lazy(() => import('@/pages/CheckoutSettingsPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const WishlistPage = lazy(() => import('@/pages/WishlistPage').then(module => ({ default: module.WishlistPage })))
const HeroSlidePage = lazy(() => import('@/pages/HeroSlidePage').then(module => ({ default: module.HeroSlidePage })))
const PageDisplayPage = lazy(() => import('@/pages/PageDisplayPage'))
const InitializeAramexPage = lazy(() => import('@/pages/InitializeAramexPage'))
const AramexTrackingPage = lazy(() => import('@/pages/AramexTrackingPage'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <AdvancedLoading
      size="lg"
      message="Loading page..."
      animated
    />
  </div>
)

// Component to conditionally show navigation and footer
const ConditionalNavigation = memo(() => {
  const location = useLocation()
  
  // Hide navigation only on hero-slide pages
  const hideNavPaths = ['/hero-slide']
  const shouldHideNav = hideNavPaths.some(path => 
    location.pathname.startsWith(path)
  )
  
  return shouldHideNav ? null : <Navigation />
})

const ConditionalFooter = memo(() => {
  const location = useLocation()
  
  // Hide footer on dashboard pages
  const hideFooterPaths = ['/dashboard', '/hero-slide']
  const shouldHideFooter = hideFooterPaths.some(path => 
    location.pathname.startsWith(path)
  )
  
  return shouldHideFooter ? null : <Footer />
})

function AppContent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="spirithub-ui-theme">
      <CurrencyProvider defaultCurrency="OMR" storageKey="spirithub-currency">
        <AuthProvider>
          <CartProvider>
            <DataProvider>
              <Router>
                <div className="min-h-screen flex flex-col bg-background">
                  <ConditionalNavigation />
                  <main className="flex-1 relative">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ShopPage />} />
                      <Route path="/product/:slug" element={<ProductPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
                      <Route 
                        path="/wishlist" 
                        element={
                          <ProtectedRoute>
                            <WishlistPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          <ProtectedRoute>
                            <DashboardPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/cache-management" 
                        element={
                          <ProtectedRoute>
                            <EnhancedCacheManagementPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/dashboard/checkout-settings" 
                        element={
                          <ProtectedRoute>
                            <CheckoutSettingsPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/initialize-aramex" 
                        element={
                          <ProtectedRoute>
                            <InitializeAramexPage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route path="/track/:trackingNumber" element={<AramexTrackingPage />} />
                      <Route 
                        path="/hero-slide/add" 
                        element={
                          <ProtectedRoute>
                            <HeroSlidePage />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/hero-slide/edit/:id" 
                        element={
                          <ProtectedRoute>
                            <HeroSlidePage />
                          </ProtectedRoute>
                        } 
                      />
                      {/* Dynamic Page Routes */}
                      <Route path="/page/:slug" element={<PageDisplayPage />} />
                      {/* Fallback routes for direct access */}
                      <Route path="/privacy-policy" element={<PageDisplayPage />} />
                      <Route path="/terms-and-conditions" element={<PageDisplayPage />} />
                      <Route path="/refund-policy" element={<PageDisplayPage />} />
                      <Route path="/delivery-policy" element={<PageDisplayPage />} />
                      <Route path="/faq" element={<PageDisplayPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <ConditionalFooter />
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    duration: 3000,
                    className: 'coffee-toast',
                    style: {
                      background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                      color: 'hsl(var(--card-foreground))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '16px',
                    },
                    success: {
                      style: {
                        background: 'linear-gradient(135deg, oklch(0.95 0.05 85) 0%, oklch(0.92 0.08 75) 100%)',
                        border: '1px solid oklch(0.8 0.1 80)',
                        color: 'oklch(0.3 0.15 85)',
                      },
                      iconTheme: {
                        primary: 'oklch(0.55 0.15 85)',
                        secondary: 'oklch(0.95 0.05 85)',
                      },
                    },
                    error: {
                      style: {
                        background: 'linear-gradient(135deg, oklch(0.95 0.05 25) 0%, oklch(0.92 0.08 15) 100%)',
                        border: '1px solid oklch(0.8 0.1 20)',
                        color: 'oklch(0.3 0.15 25)',
                      },
                      iconTheme: {
                        primary: 'oklch(0.55 0.15 25)',
                        secondary: 'oklch(0.95 0.05 25)',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </DataProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  </ThemeProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
        <AppContent />
    </ErrorBoundary>
  )
}

export default App