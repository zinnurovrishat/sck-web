import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Phone, User, Loader2, BadgePercent, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { sendTelegramMessage } from '../../lib/telegram'
import { supabase } from '../../lib/supabase'
import { calcDiscount, applyDiscount, generateOrderNumber } from '../../lib/discount'
import { COMPANY_PHONE, COMPANY_PHONE_HREF, COMPANY_EMAIL, MANAGER_NAME, WORKING_HOURS } from '../../lib/constants'
import type { CartItem, PaymentMethod, DeliveryMethod } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  items: CartItem[]
  paymentMethod: PaymentMethod
  deliveryMethod: DeliveryMethod
  totalAmount: number
  totalWeight: number
  onSuccess: () => void
}

type Step = 'form' | 'sending' | 'success' | 'error'

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }
  digits = digits.slice(0, 10)

  let result = '+7'
  if (digits.length > 0) result += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) result += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) result += '-' + digits.slice(6, 8)
  if (digits.length >= 8) result += '-' + digits.slice(8, 10)
  return result
}

function isValidRussianPhone(v: string): boolean {
  const digits = v.replace(/\D/g, '')
  return digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
}

export default function OrderModal({
  open,
  onClose,
  items,
  paymentMethod,
  deliveryMethod,
  totalAmount,
  totalWeight,
  onSuccess,
}: Props) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+7')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [discount, setDiscount] = useState(0)
  const [savedOrderNumber, setSavedOrderNumber] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(user?.name ?? '')
    setPhone('+7')
    setStep('form')
    setPhoneError('')
    setCopied(false)

    if (!user) { setDiscount(0); return }
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .then(({ count }) => setDiscount(calcDiscount(count ?? 0)))
  }, [open, user])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    if (phoneError) setPhoneError('')
  }

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(savedOrderNumber).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidRussianPhone(phone)) {
      setPhoneError('Введите корректный российский номер телефона')
      return
    }
    setPhoneError('')
    setStep('sending')

    const finalAmount = user && discount > 0 ? applyDiscount(totalAmount, discount) : totalAmount

    const lines: string[] = []
    lines.push('📦 <b>Новая заявка с сайта СЦК</b>')
    lines.push('')
    if (name.trim()) lines.push(`👤 <b>Имя:</b> ${name.trim()}`)
    lines.push(`📱 <b>Телефон:</b> ${phone.trim()}`)
    lines.push('')
    lines.push('<b>Состав заказа:</b>')
    items.forEach(item => {
      const price = paymentMethod === 'cash' ? item.product.price_cash : item.product.price_cashless
      lines.push(`• ${item.product.name} — ${item.quantity} ${item.product.unit} × ${price.toLocaleString('ru-RU')} ₽`)
    })
    lines.push('')
    if (user && discount > 0) {
      lines.push(`💰 <b>Итого:</b> ${totalAmount.toLocaleString('ru-RU')} ₽  →  <b>${finalAmount.toLocaleString('ru-RU')} ₽</b> (скидка ${discount}%)`)
      lines.push(`⭐️ <b>Клиент:</b> @${user.username ?? user.name} (постоянный, скидка ${discount}%)`)
    } else {
      lines.push(`💰 <b>Итого:</b> ${finalAmount.toLocaleString('ru-RU')} ₽`)
    }
    lines.push(
      `⚖️ <b>Вес:</b> ${
        totalWeight >= 1000
          ? `${(totalWeight / 1000).toFixed(2)} т`
          : `${totalWeight} кг`
      }`
    )
    lines.push(`💳 <b>Оплата:</b> ${paymentMethod === 'cash' ? 'Наличные' : 'Безналичный'}`)
    lines.push(`🚚 <b>Доставка:</b> ${deliveryMethod === 'manipulator' ? 'Манипулятор' : 'Самовывоз'}`)

    const orderNumber = generateOrderNumber()
    await supabase.from('orders').insert({
      order_number: orderNumber,
      customer_name: name.trim() || null,
      customer_phone: phone.trim(),
      items: items.map(item => ({
        product_id: item.product.id,
        name: item.product.name,
        qty: item.quantity,
        unit: item.product.unit,
        price: paymentMethod === 'cash' ? item.product.price_cash : item.product.price_cashless,
      })),
      total_amount: finalAmount,
      total_weight: totalWeight,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod,
      status: 'pending',
      user_id: user?.id ?? null,
    })

    const ok = await sendTelegramMessage(lines.join('\n'))

    if (ok) setSavedOrderNumber(orderNumber)
    setStep(ok ? 'success' : 'error')
  }

  const handleClose = () => {
    if (step === 'sending') return
    if (step === 'success') onSuccess()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'error' ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Phone className="h-9 w-9 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1e3a5f] mb-2">
                Не удалось отправить заявку
              </DialogTitle>
              <p className="text-gray-500 text-sm">
                Что-то пошло не так. Позвоните нам напрямую — ответим сразу:
              </p>
              <a
                href={COMPANY_PHONE_HREF}
                className="font-bold text-[#f97316] text-xl mt-2 block hover:underline"
              >
                {COMPANY_PHONE}
              </a>
              <p className="text-gray-400 text-xs mt-2">Или напишите: {COMPANY_EMAIL}</p>
              <p className="text-gray-400 text-xs mt-1">{WORKING_HOURS}</p>
            </div>
            <button
              onClick={() => setStep('form')}
              className="mt-2 w-full bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Попробовать снова
            </button>
            <button
              onClick={handleClose}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        ) : step === 'success' ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-green-500" />
            </div>
            <div className="w-full">
              <DialogTitle className="text-xl font-bold text-[#1e3a5f] mb-2">
                Заявка отправлена!
              </DialogTitle>
              <p className="text-gray-500 text-sm">
                {MANAGER_NAME} свяжется с вами по номеру
              </p>
              <p className="font-semibold text-[#1e3a5f] mt-1">{phone}</p>
              {savedOrderNumber && (
                <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                  <div className="text-left">
                    <p className="text-xs text-gray-400">Номер заявки</p>
                    <p className="text-sm font-mono font-semibold text-[#1e3a5f]">{savedOrderNumber}</p>
                  </div>
                  <button
                    onClick={handleCopyOrderNumber}
                    title="Скопировать номер"
                    className="shrink-0 p-1.5 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-gray-400 hover:text-[#1e3a5f]"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
              <p className="text-gray-400 text-xs mt-3">
                Обычно перезваниваем в течение 15 минут
              </p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Отлично, жду звонка!
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#1e3a5f]">Оформление заявки</DialogTitle>
              <DialogDescription>
                Укажите номер телефона — менеджер перезвонит и уточнит детали
              </DialogDescription>
            </DialogHeader>

            <div className="bg-gray-50 rounded-xl p-3 my-1">
              <p className="text-xs text-gray-400 mb-1.5">Ваш заказ</p>
              <div className="flex flex-col gap-1">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-[#1e3a5f] shrink-0">
                      {(
                        (paymentMethod === 'cash'
                          ? item.product.price_cash
                          : item.product.price_cashless) * item.quantity
                      ).toLocaleString('ru-RU')}{' '}
                      ₽
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-[#1e3a5f]">Итого</span>
                <div className="text-right">
                  {user && discount > 0 ? (
                    <>
                      <span className="text-xs text-gray-400 line-through mr-1.5">
                        {totalAmount.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="font-bold text-[#f97316]">
                        {applyDiscount(totalAmount, discount).toLocaleString('ru-RU')} ₽
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-[#f97316]">
                      {totalAmount.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
              </div>
              {user && discount > 0 && (
                <div className="flex items-center gap-1.5 mt-2 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1.5">
                  <BadgePercent className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span className="text-xs text-purple-700 font-medium">
                    Ваша скидка {discount}% применена
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="order-name" className="text-sm text-gray-600 mb-1 block">
                  Имя <span className="text-gray-400">(необязательно)</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="order-name"
                    type="text"
                    placeholder="Как к вам обращаться?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-9"
                    disabled={step === 'sending'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="order-phone" className="text-sm text-gray-600 mb-1 block">
                  Телефон <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="order-phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={`pl-9 ${phoneError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    disabled={step === 'sending'}
                    autoFocus
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-400 mt-1">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={step === 'sending' || phone === '+7'}
                className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer mt-1"
              >
                {step === 'sending' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  'Отправить заявку'
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Нажимая кнопку, вы соглашаетесь на{' '}
                <a href="/privacy" className="underline hover:text-[#1e3a5f]">
                  обработку персональных данных
                </a>
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
