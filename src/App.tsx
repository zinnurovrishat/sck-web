import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const ShopPage = lazy(() => import('./pages/ShopPage'))
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactsPage = lazy(() => import('./pages/ContactsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const OfferPage = lazy(() => import('./pages/OfferPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const CabinetPage = lazy(() => import('./pages/CabinetPage'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Страницы без Layout */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/admin" element={<AdminPage />} />

                {/* Основные страницы */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:id" element={<ProductPage />} />
                  <Route path="/calculator" element={<CalculatorPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/offer" element={<OfferPage />} />
                  <Route path="/cabinet" element={<CabinetPage />} />
                  <Route path="/dashboard" element={<Navigate to="/cabinet" replace />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
