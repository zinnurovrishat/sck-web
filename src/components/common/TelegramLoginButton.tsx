import { useEffect, useRef } from 'react'
import { useAuth, type TelegramAuthData } from '../../context/AuthContext'

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void
  }
}

interface Props {
  onSuccess?: () => void
  onError?: (err: string) => void
}

export default function TelegramLoginButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { loginWithTelegram } = useAuth()

  // Refs so the stable callback always sees the latest values without re-running the effect
  const loginRef = useRef(loginWithTelegram)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  loginRef.current = loginWithTelegram
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    const botName = import.meta.env.VITE_TG_BOT_USERNAME as string
    if (!botName || !containerRef.current) return

    // Set once — stays alive until component unmounts so Telegram can call it after popup
    window.onTelegramAuth = async (data: TelegramAuthData) => {
      try {
        await loginRef.current(data)
        onSuccessRef.current?.()
      } catch (err) {
        onErrorRef.current?.(err instanceof Error ? err.message : 'Ошибка авторизации')
      }
    }

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', 'large')
    script.setAttribute('data-radius', '12')
    script.setAttribute('data-on-auth', 'onTelegramAuth')
    script.setAttribute('data-request-access', 'write')
    script.async = true
    containerRef.current.appendChild(script)

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).onTelegramAuth = undefined
    }
  }, []) // Run once on mount only

  return <div ref={containerRef} />
}
