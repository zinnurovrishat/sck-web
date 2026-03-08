import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import CalculatorPage from './pages/CalculatorPage'
import AboutPage from './pages/AboutPage'
import ContactsPage from './pages/ContactsPage'
import PrivacyPage from './pages/PrivacyPage'
import OfferPage from './pages/OfferPage'
import LoginPage from './pages/LoginPage'
import CabinetPage from './pages/CabinetPage'
import NotFoundPage from './pages/NotFoundPage'

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
            <Routes>
              {/* Login — без Layout (своя страница) */}
              <Route path="/login" element={<LoginPage />} />

              {/* Основные страницы */}
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
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
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
