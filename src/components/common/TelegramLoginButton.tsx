import { useEffect, useRef } from 'react'
import { useAuth, type TelegramAuthData } from '../../context/AuthContext'

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramAuthData) => void
    __tgAuthData: TelegramAuthData | null
    __tgAuthDispatch: ((data: TelegramAuthData) => void) | null
  }
}

interface Props {
  onSuccess?: () => void
  onError?: (err: string) => void
}

export default function TelegramLoginButton({ onSuccess, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { loginWithTelegram } = useAuth()

  const loginRef = useRef(loginWithTelegram)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  loginRef.current = loginWithTelegram
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    const botName = import.meta.env.VITE_TG_BOT_USERNAME as string
    if (!botName || !containerRef.current) return

    const handleAuth = async (data: TelegramAuthData) => {
      try {
        await loginRef.current(data)
        onSuccessRef.current?.()
      } catch (err) {
        onErrorRef.current?.(err instanceof Error ? err.message : 'Ошибка авторизации')
      }
    }

    window.__tgAuthDispatch = handleAuth

    // Process buffered data if Telegram fired before React mounted
    if (window.__tgAuthData) {
      const buffered = window.__tgAuthData
      window.__tgAuthData = null
      handleAuth(buffered)
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
      window.__tgAuthDispatch = null
    }
  }, [])

  return <div ref={containerRef} />
}
