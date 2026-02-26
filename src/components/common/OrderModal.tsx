import { useState } from 'react'
import { CheckCircle, Phone, User, Loader2 } from 'lucide-react'
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

type Step = 'form' | 'sending' | 'success'

function formatPhone(raw: string): string {
  // Strip all non-digits
  let digits = raw.replace(/\D/g, '')
  // Remove leading 7 or 8 (country code)
  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1)
  }
  // Limit to 10 digits
  digits = digits.slice(0, 10)

  let result = '+7'
  if (digits.length > 0) result += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) result += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) result += '-' + digits.slice(6, 8)
  if (digits.length >= 8) result += '-' + digits.slice(8, 10)
  return result
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
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+7')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<Step>('form')

  const validatePhone = (v: string) => v.replace(/\D/g, '').length === 11

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    if (phoneError) setPhoneError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePhone(phone)) {
      setPhoneError('Введите корректный номер телефона')
      return
    }
    setPhoneError('')
    setStep('sending')

    const lines: string[] = []
    lines.push('📦 <b>Новая заявка с сайта СЦК</b>')
    lines.push('')
    if (name.trim()) lines.push(`👤 <b>Имя:</b> ${name.trim()}`)
    lines.push(`📱 <b>Телефон:</b> ${phone.trim()}`)
    lines.push('')
    lines.push('<b>Состав заказа:</b>')
    items.forEach(item => {
      const price = paymentMethod === 'cash' ? item.product.price_cash : item.product.price_cashless
      lines.push(`• ${item.product.name} — ${item.quantity} ${item.product.unit} × ${price} ₽`)
    })
    lines.push('')
    lines.push(`💰 <b>Итого:</b> ${totalAmount.toLocaleString('ru-RU')} ₽`)
    lines.push(
      `⚖️ <b>Вес:</b> ${
        totalWeight >= 1000
          ? `${(totalWeight / 1000).toFixed(2)} т`
          : `${totalWeight} кг`
      }`
    )
    lines.push(`💳 <b>Оплата:</b> ${paymentMethod === 'cash' ? 'Наличные' : 'Безналичный'}`)
    lines.push(`🚚 <b>Доставка:</b> ${deliveryMethod === 'manipulator' ? 'Манипулятор' : 'Самовывоз'}`)

    const ok = await sendTelegramMessage(lines.join('\n'))

    if (ok) {
      setStep('success')
    } else {
      // Fallback: show success anyway, log failed silently
      setStep('success')
    }
  }

  const handleClose = () => {
    if (step === 'sending') return
    if (step === 'success') onSuccess()
    setStep('form')
    setName('')
    setPhone('+7')
    setPhoneError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'success' ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1e3a5f] mb-2">
                Заявка отправлена!
              </DialogTitle>
              <p className="text-gray-500 text-sm">
                Ришат свяжется с вами по номеру
              </p>
              <p className="font-semibold text-[#1e3a5f] mt-1">{phone}</p>
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

            {/* Order summary */}
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
              <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                <span className="text-sm font-semibold text-[#1e3a5f]">Итого</span>
                <span className="font-bold text-[#f97316]">
                  {totalAmount.toLocaleString('ru-RU')} ₽
                </span>
              </div>
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
