import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

export interface AuthUser {
  id: string
  telegram_id: string
  name: string
  username?: string | null
  photo_url?: string | null
}

export interface TelegramAuthData {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  loginWithTelegram: (tgData: TelegramAuthData) => Promise<void>
  logout: () => void
}

const STORAGE_KEY = 'sck_auth'
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-auth`
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const AuthContext = createContext<AuthContextType | null>(null)

function loadFromStorage(): { user: AuthUser; token: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function validateToken(token: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('expires_at')
      .eq('token', token)
      .single()
    if (error || !data) return false
    return new Date(data.expires_at) > new Date()
  } catch {
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount + validate token
  useEffect(() => {
    const saved = loadFromStorage()
    if (!saved) {
      setLoading(false)
      return
    }
    validateToken(saved.token).then(valid => {
      if (valid) {
        setUser(saved.user)
        setToken(saved.token)
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
      setLoading(false)
    })
  }, [])

  const loginWithTelegram = async (tgData: TelegramAuthData) => {
    console.log('[Auth] loginWithTelegram called, URL:', EDGE_FUNCTION_URL)
    const res = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(tgData),
    })

    console.log('[Auth] Edge Function response status:', res.status)

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[Auth] Edge Function error:', err)
      throw new Error(err.error ?? 'Auth failed')
    }

    const json = await res.json()
    console.log('[Auth] Edge Function success:', json)
    const { userId: _userId, token: newToken, user: newUser } = json
    setUser(newUser)
    setToken(newToken)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: newUser, token: newToken }))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithTelegram, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
