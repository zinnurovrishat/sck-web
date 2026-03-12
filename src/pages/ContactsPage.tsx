import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Clock, Send, Loader2, CheckCircle } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { sendTelegramMessage } from '../lib/telegram'
import { COMPANY_PHONE, COMPANY_PHONE_HREF, MANAGER_NAME, WORKING_HOURS } from '../lib/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1)
  digits = digits.slice(0, 10)
  let result = '+7'
  if (digits.length > 0) result += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) result += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) result += '-' + digits.slice(6, 8)
  if (digits.length >= 8) result += '-' + digits.slice(8, 10)
  return result
}

function isValidPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '')
  return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
}

type FormStep = 'idle' | 'sending' | 'success' | 'error'

export default function ContactsPage() {
  useSEO('Контакты', `Телефон и время работы СЦК. Менеджер ${MANAGER_NAME}: ${COMPANY_PHONE}.`)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+7')
  const [message, setMessage] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<FormStep>('idle')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    if (phoneError) setPhoneError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidPhone(phone)) {
      setPhoneError('Введите корректный российский номер')
      return
    }
    setStep('sending')

    const lines: string[] = [
      '📩 <b>Обратная связь с сайта СЦК</b>',
      '',
    ]
    if (name.trim()) lines.push(`👤 <b>Имя:</b> ${name.trim()}`)
    lines.push(`📱 <b>Телефон:</b> ${phone}`)
    if (message.trim()) lines.push(`💬 <b>Сообщение:</b> ${message.trim()}`)

    const ok = await sendTelegramMessage(lines.join('\n'))
    setStep(ok ? 'success' : 'error')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={stagger}>
        <motion.p variants={fadeUp} className="text-[#f97316] font-medium text-sm mb-2 uppercase tracking-wide">
          Контакты
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-4">
          Свяжитесь с нами
        </motion.h1>
        <motion.p variants={fadeUp} className="text-gray-500 max-w-xl mx-auto">
          {MANAGER_NAME} ответит в течение 15 минут в рабочее время.
          Если не дозвонились — позвоните повторно или оставьте заявку.
        </motion.p>
      </motion.div>

      {/* Contact cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10"
        variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
      >
        <motion.a variants={fadeUp} href={COMPANY_PHONE_HREF}
          className="flex items-start gap-4 p-6 bg-[#1e3a5f] text-white rounded-2xl hover:bg-[#162d4a] transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-[#f97316] flex items-center justify-center shrink-0">
            <Phone className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-white/60 mb-1">Телефон</p>
            <p className="text-xl font-bold group-hover:text-[#f97316] transition-colors">{COMPANY_PHONE}</p>
            <p className="text-xs text-white/50 mt-1">Нажмите для звонка</p>
          </div>
        </motion.a>

        <motion.div variants={fadeUp} className="flex items-start gap-4 p-6 bg-white border border-gray-100 rounded-2xl">
          <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-1">Режим работы</p>
            <p className="font-bold text-[#1e3a5f]">Пн–Пт: 8:00–18:00</p>
            <p className="font-medium text-gray-600 mt-0.5">Сб: 9:00–15:00</p>
            <p className="text-xs text-gray-400 mt-1">Вс — выходной</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Manager + callback form */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
      >
        {/* Manager card */}
        <motion.div variants={fadeUp} className="bg-[#1e3a5f] text-white rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-[#f97316]/50 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-[#f97316] select-none">
              {MANAGER_NAME.charAt(0)}
            </span>
          </div>
          <h2 className="text-lg font-bold mb-1">{MANAGER_NAME}</h2>
          <p className="text-white/60 text-sm mb-2">Менеджер по снабжению</p>
          <p className="text-white/50 text-xs mb-6 max-w-xs">
            Поможет подобрать материалы, рассчитает объём и организует доставку в удобное время.
          </p>
          <a href={COMPANY_PHONE_HREF}
            className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold px-8 py-3 rounded-xl transition-colors">
            <Phone className="h-4 w-4" />
            Позвонить
          </a>
        </motion.div>

        {/* Callback form */}
        <motion.div variants={fadeUp} className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-[#1e3a5f] text-lg mb-1">Оставить заявку</h2>
          <p className="text-gray-400 text-sm mb-5">
            Перезвоним в течение 15 минут в рабочее время
          </p>

          {step === 'success' ? (
            <div className="flex flex-col items-center text-center py-8 gap-3">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-semibold text-[#1e3a5f]">Заявка отправлена!</p>
              <p className="text-sm text-gray-500">{MANAGER_NAME} перезвонит по номеру {phone}</p>
              <button onClick={() => { setStep('idle'); setPhone('+7'); setName(''); setMessage('') }}
                className="mt-2 text-sm text-[#f97316] hover:underline cursor-pointer">
                Отправить ещё
              </button>
            </div>
          ) : step === 'error' ? (
            <div className="flex flex-col items-center text-center py-6 gap-3">
              <p className="text-gray-500 text-sm">Не удалось отправить. Позвоните напрямую:</p>
              <a href={COMPANY_PHONE_HREF} className="font-bold text-[#f97316] text-xl hover:underline">{COMPANY_PHONE}</a>
              <button onClick={() => setStep('idle')} className="text-sm text-gray-400 hover:underline cursor-pointer">Попробовать снова</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Имя <span className="text-gray-400">(необязательно)</span>
                </Label>
                <Input placeholder="Как к вам обращаться?" value={name}
                  onChange={e => setName(e.target.value)} disabled={step === 'sending'} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Телефон <span className="text-red-400">*</span>
                </Label>
                <Input type="tel" placeholder="+7 (___) ___-__-__" value={phone}
                  onChange={handlePhoneChange} disabled={step === 'sending'}
                  className={phoneError ? 'border-red-400 focus-visible:ring-red-400' : ''} />
                {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Сообщение <span className="text-gray-400">(необязательно)</span>
                </Label>
                <textarea
                  placeholder="Что интересует? Примерный объём, сроки..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  disabled={step === 'sending'}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 resize-none disabled:opacity-50"
                />
              </div>
              <button type="submit" disabled={step === 'sending' || phone === '+7'}
                className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
                {step === 'sending' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Отправляем...</>
                ) : (
                  <><Send className="h-4 w-4" />Отправить заявку</>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">
                Нажимая кнопку, вы соглашаетесь на{' '}
                <a href="/privacy" className="underline hover:text-[#1e3a5f]">обработку персональных данных</a>
              </p>
            </form>
          )}
        </motion.div>
      </motion.div>

      {/* Requisites */}
      <motion.div className="p-6 bg-gray-50 rounded-2xl text-sm text-gray-500"
        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <p className="font-medium text-gray-700 mb-2">Реквизиты для документов</p>
        <p>ИП Зиннуров Ришат Мидхатович</p>
        <p>ИНН: 026800071886 · ОГРНИП: 325028000146701</p>
        <p className="mt-1 text-gray-400">{WORKING_HOURS}</p>
      </motion.div>
    </div>
  )
}
