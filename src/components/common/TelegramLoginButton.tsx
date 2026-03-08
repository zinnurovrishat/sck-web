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

  useEffect(() => {
    const botName = import.meta.env.VITE_TG_BOT_USERNAME as string
    if (!botName || !containerRef.current) return

    window.onTelegramAuth = async (data: TelegramAuthData) => {
      try {
        await loginWithTelegram(data)
        onSuccess?.()
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Ошибка авторизации')
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
  }, [loginWithTelegram, onSuccess, onError])

  return <div ref={containerRef} />
}
