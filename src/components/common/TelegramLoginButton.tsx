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

  const loginRef = useRef(loginWithTelegram)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  loginRef.current = loginWithTelegram
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  useEffect(() => {
    const botName = import.meta.env.VITE_TG_BOT_USERNAME as string
    console.log('[TG] useEffect mount, botName:', botName)

    if (!botName || !containerRef.current) {
      console.warn('[TG] Missing botName or container')
      return
    }

    window.onTelegramAuth = async (data: TelegramAuthData) => {
      console.log('[TG] onTelegramAuth called:', data)
      try {
        await loginRef.current(data)
        console.log('[TG] loginWithTelegram success')
        onSuccessRef.current?.()
      } catch (err) {
        console.error('[TG] loginWithTelegram error:', err)
        onErrorRef.current?.(err instanceof Error ? err.message : 'Ошибка авторизации')
      }
    }

    console.log('[TG] window.onTelegramAuth set:', typeof window.onTelegramAuth)

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
      console.log('[TG] cleanup / unmount')
      ;(window as any).onTelegramAuth = undefined
    }
  }, [])

  return <div ref={containerRef} />
}
