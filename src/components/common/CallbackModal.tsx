import { useState } from 'react'
import { CheckCircle, Phone, PhoneCall, Loader2 } from 'lucide-react'
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

interface Props {
  open: boolean
  onClose: () => void
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

export default function CallbackModal({ open, onClose }: Props) {
  const [phone, setPhone] = useState('+7')
  const [phoneError, setPhoneError] = useState('')
  const [step, setStep] = useState<Step>('form')

  const validatePhone = (v: string) => v.replace(/\D/g, '').length === 11

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
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

    const text = [
      '📞 <b>Запрос обратного звонка</b>',
      '',
      `📱 <b>Телефон:</b> ${phone.trim()}`,
      '',
      'Клиент оставил заявку через кнопку «Перезвоните мне» на сайте СЦК',
    ].join('\n')

    const ok = await sendTelegramMessage(text)
    setStep(ok ? 'success' : 'error')
  }

  const handleClose = () => {
    if (step === 'sending') return
    setStep('form')
    setPhone('+7')
    setPhoneError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        {step === 'success' ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-9 w-9 text-green-500" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1e3a5f] mb-2">
                Ждите звонка!
              </DialogTitle>
              <p className="text-gray-500 text-sm">Ришат перезвонит на номер</p>
              <p className="font-semibold text-[#1e3a5f] mt-1">{phone}</p>
              <p className="text-gray-400 text-xs mt-3">Обычно в течение 15 минут</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full bg-[#f97316] hover:bg-[#ea6c04] text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Хорошо, жду!
            </button>
          </div>
        ) : step === 'error' ? (
          <div className="flex flex-col items-center text-center py-6 gap-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <Phone className="h-9 w-9 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#1e3a5f] mb-2">
                Не удалось отправить
              </DialogTitle>
              <p className="text-gray-500 text-sm">Позвоните нам напрямую — ответим сразу:</p>
              <a
                href="tel:89177969222"
                className="font-bold text-[#f97316] text-xl mt-2 block hover:underline"
              >
                8-917-796-92-22
              </a>
              <p className="text-gray-400 text-xs mt-2">Пн–Пт 8:00–18:00, Сб 9:00–15:00</p>
            </div>
            <button
              onClick={handleClose}
              className="mt-2 w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-xl transition-colors cursor-pointer"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-[#1e3a5f]">Перезвоним вам</DialogTitle>
              <DialogDescription>
                Оставьте номер — Ришат перезвонит в течение 15 минут
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
              <div>
                <Label htmlFor="cb-phone" className="text-sm text-gray-600 mb-1 block">
                  Ваш телефон <span className="text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="cb-phone"
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
                className="w-full flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6c04] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                {step === 'sending' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Отправляем...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-5 w-5" />
                    Перезвоните мне
                  </>
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
