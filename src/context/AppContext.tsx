import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { loadPAT, savePAT, clearPAT, loadTheme, saveTheme, type Theme } from '../lib/storage'
import { validatePAT, GitHubAPIError } from '../lib/github'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  pat: string | null
  patLoading: boolean
  theme: Theme
  toasts: Toast[]
}

interface AppActions {
  setPAT: (pat: string) => Promise<boolean>
  removePAT: () => void
  setTheme: (theme: Theme) => void
  addToast: (message: string, type: Toast['type']) => void
  dismissToast: (id: number) => void
}

const AppContext = createContext<(AppState & AppActions) | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

let toastId = 0

export function AppProvider({ children }: { children: ReactNode }) {
  const [pat, setPATState] = useState<string | null>(null)
  const [patLoading, setPatLoading] = useState(true)
  const [theme, setThemeState] = useState<Theme>(loadTheme())
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    loadPAT().then((p) => {
      setPATState(p)
      setPatLoading(false)
    })
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const handleSetPAT = async (newPat: string): Promise<boolean> => {
    try {
      const valid = await validatePAT(newPat)
      if (!valid) {
        addToast('PATが無効です。確認してください', 'error')
        return false
      }
      await savePAT(newPat)
      setPATState(newPat)
      addToast('PAT設定完了', 'success')
      return true
    } catch (e) {
      if (e instanceof GitHubAPIError) {
        addToast(e.message, 'error')
      } else {
        addToast('PAT検証に失敗しました', 'error')
      }
      return false
    }
  }

  const removePAT = () => {
    clearPAT()
    setPATState(null)
    addToast('PATを削除しました', 'info')
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    saveTheme(t)
  }

  return (
    <AppContext.Provider
      value={{
        pat,
        patLoading,
        theme,
        toasts,
        setPAT: handleSetPAT,
        removePAT,
        setTheme,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
