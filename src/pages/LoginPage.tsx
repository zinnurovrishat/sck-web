import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { ShieldCheck, Package, BadgePercent, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import TelegramLoginButton from '../components/common/TelegramLoginButton'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (loading) return null
  if (user || success) return <Navigate to="/cabinet" replace />

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f1e35] to-[#1e3a5f] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Главная
        </Link>
        <span className="text-xs bg-white/10 text-white/70 border border-white/20 px-3 py-1 rounded-full">
          Личный кабинет
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f97316]/20 border border-[#f97316]/30 mb-4">
              <ShieldCheck className="h-8 w-8 text-[#f97316]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Личный кабинет
            </h1>
            <p className="text-white/50 text-sm">
              Для постоянных клиентов СЦК Стерлитамак
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Package, text: 'История заказов' },
              { icon: BadgePercent, text: 'Скидки за объём' },
              { icon: ShieldCheck, text: 'Без паролей' },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 text-center"
              >
                <Icon className="h-5 w-5 text-[#f97316]" />
                <span className="text-xs text-white/60 leading-tight">{text}</span>
              </div>
            ))}
          </div>

          {/* Login card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-white font-semibold text-center mb-1">
              Войдите через Telegram
            </p>
            <p className="text-white/40 text-sm text-center mb-6">
              Без паролей — один клик через ваш Telegram
            </p>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <TelegramLoginButton
                onSuccess={() => setSuccess(true)}
                onError={msg => setError(msg)}
              />
            </div>

            <p className="text-white/20 text-xs text-center mt-4">
              Кнопка Telegram появится, если домен сайта настроен в BotFather
            </p>
          </div>

          {/* Discount info */}
          <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white/70 text-sm font-medium mb-3">Программа скидок</p>
            <div className="flex flex-col gap-2">
              {[
                { range: '1–4 заказа', discount: '1%' },
                { range: '5–9 заказов', discount: '3%' },
                { range: '10–19 заказов', discount: '5%' },
                { range: '20+ заказов', discount: '10%' },
              ].map(({ range, discount }) => (
                <div key={range} className="flex justify-between items-center">
                  <span className="text-white/40 text-xs">{range}</span>
                  <span className="text-[#f97316] font-semibold text-sm">{discount}</span>
                </div>
              ))}
            </div>
            <p className="text-white/20 text-xs mt-3">
              Скидка применяется автоматически при каждом новом заказе
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
