import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import CalculatorPage from './pages/CalculatorPage'
import AboutPage from './pages/AboutPage'
import ContactsPage from './pages/ContactsPage'
import PrivacyPage from './pages/PrivacyPage'
import OfferPage from './pages/OfferPage'
import NotFoundPage from './pages/NotFoundPage'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-[#1e3a5f]">{title}</h1>
      <p className="text-gray-400 mt-2">Страница в разработке</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/offer" element={<OfferPage />} />
            <Route path="/dashboard" element={<PlaceholderPage title="Личный кабинет" />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </CartProvider>
    </BrowserRouter>
  )
}
