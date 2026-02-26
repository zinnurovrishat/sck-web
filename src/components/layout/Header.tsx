import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Phone, Menu, X } from 'lucide-react'
import { useCart } from '../../context/CartContext'

const LOGO_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6983642a051677d93d98d43e/e6cf459eb_grok-image-376bee61-792c-45cd-9207-dd73497145571.png'

const NAV_LINKS = [
  { to: '/shop', label: 'Магазин' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/about', label: 'О компании' },
  { to: '/contacts', label: 'Контакты' },
]

export default function Header() {
  const { totalItems, openCart } = useCart()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={LOGO_URL} alt="СЦК" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-[#f97316] ${
                  location.pathname === link.to
                    ? 'text-[#1e3a5f] font-semibold'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="tel:89177969222"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1e3a5f] hover:text-[#f97316] transition-colors"
            >
              <Phone className="h-4 w-4" />
              8-917-796-92-22
            </a>

            <button
              onClick={openCart}
              className="relative p-2 rounded-lg border border-gray-200 hover:border-[#f97316] transition-colors cursor-pointer"
              aria-label="Корзина"
            >
              <ShoppingCart className="h-5 w-5 text-[#1e3a5f]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#f97316] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Меню"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'bg-[#1e3a5f]/5 text-[#1e3a5f] font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:89177969222"
              className="mt-2 flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium text-[#1e3a5f] bg-[#1e3a5f]/5"
            >
              <Phone className="h-4 w-4" />
              8-917-796-92-22
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
