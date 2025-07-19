import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { CurrencyProvider } from '@/components/currency-provider'
import { AuthProvider } from '@/components/auth-provider'
import { CartProvider } from '@/components/cart-provider'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { ShopPage } from '@/pages/ShopPage'
import { AboutPage } from '@/pages/AboutPage'
import { ContactPage } from '@/pages/ContactPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import CheckoutPage from '@/pages/CheckoutPage'
import DashboardPage from '@/pages/DashboardPage'
import './App.css'

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="spirithub-ui-theme">
      <CurrencyProvider defaultCurrency="USD" storageKey="spirithub-currency">
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen flex flex-col bg-background">
                <Navigation />
                <main className="flex-1 relative">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
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
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  )
}

export default App