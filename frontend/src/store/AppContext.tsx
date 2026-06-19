import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { Lang, User } from '../types'
import { getToken, setToken, getLang, setLang as persistLang } from '../lib/session'
import { me as fetchMe } from '../api/auth'

// ─── Toast ──────────────────────────────────────────────────────────────────
export interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error'
}

// ─── Context value ────────────────────────────────────────────────────────────
interface AppContextValue {
  // auth
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  authReady: boolean
  setSession: (token: string, user: User) => void
  logout: () => void
  // language
  lang: Lang
  changeLang: (lang: Lang) => void
  // toasts
  toasts: ToastMessage[]
  showToast: (message: string, type?: 'success' | 'error') => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [lang, setLangState] = useState<Lang>(getLang())
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Restore the session from a persisted token on first load.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthReady(true)
      return
    }
    fetchMe()
      .then((u) => setUser(u))
      .catch(() => setToken(null))
      .finally(() => setAuthReady(true))
  }, [])

  const setSession = useCallback((token: string, u: User) => {
    setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const changeLang = useCallback((next: Lang) => {
    persistLang(next)
    setLangState(next)
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.floor(performance.now())
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Auto-dismiss the latest toast.
  useEffect(() => {
    if (toasts.length === 0) return
    const latest = toasts[toasts.length - 1]
    const timer = setTimeout(() => dismissToast(latest.id), 4000)
    return () => clearTimeout(timer)
  }, [toasts, dismissToast])

  const value: AppContextValue = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMINISTRATEUR',
    authReady,
    setSession,
    logout,
    lang,
    changeLang,
    toasts,
    showToast,
    dismissToast,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within an AppProvider')
  return context
}

export default AppContext
