import { Link } from 'react-router-dom'
import { Phone } from 'lucide-react'

const LOGO_URL =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6983642a051677d93d98d43e/e6cf459eb_grok-image-376bee61-792c-45cd-9207-dd73497145571.png'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img src={LOGO_URL} alt="СЦК" className="h-12 w-auto object-contain brightness-0 invert mb-4" />
            <p className="text-sm text-white/70 leading-relaxed">
              Комплектация стройплощадок за 1 день.<br />
              Стерлитамак и Юг Башкирии.
            </p>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-white/50 mb-4">
              Контакты
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="tel:89177969222"
                className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-[#f97316]" />
                8-917-796-92-22
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide text-white/50 mb-4">
              Навигация
            </h3>
            <nav className="flex flex-col gap-2">
              {[
                { to: '/shop', label: 'Магазин' },
                { to: '/calculator', label: 'Калькулятор' },
                { to: '/about', label: 'О компании' },
                { to: '/contacts', label: 'Контакты' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/40">
          <div>
            <p>ИП Зиннуров Ришат Мидхатович · ИНН 026800071886 · ОГРНИП 325028000146701</p>
            <p className="mt-1">© {year} СЦК. Все права защищены.</p>
          </div>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white/70 transition-colors">
              Политика конфиденциальности
            </Link>
            <Link to="/offer" className="hover:text-white/70 transition-colors">
              Договор оферты
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
