import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  loadPAT,
  savePAT,
  clearPAT,
  loadTheme,
  saveTheme,
  loadSRSStore,
  saveSRSStore,
  loadNotes,
  saveNotes,
  loadFavorites,
  saveFavorites,
  type Theme,
  type NotesStore,
} from '../lib/storage'
import { validatePAT, GitHubAPIError } from '../lib/github'
import { calculateNextReview, getRetentionLevel, isDue, buildSessionCards } from '../lib/srs'
import { readRemoteJson, writeRemoteJson } from '../lib/remoteStorage'
import type { SRSStore, SRSRating, RetentionLevel, FlashCard } from '../types/srs'
import type { KnowledgeFile } from '../types/knowledge'

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
  srsStore: SRSStore
  dueTodayCount: number
  notes: NotesStore
  favorites: Set<string>
}

interface AppActions {
  setPAT: (pat: string) => Promise<boolean>
  removePAT: () => void
  setTheme: (theme: Theme) => void
  addToast: (message: string, type: Toast['type']) => void
  dismissToast: (id: number) => void
  recordReview: (path: string, rating: SRSRating) => void
  getSRSLevel: (path: string) => RetentionLevel
  buildCards: (files: KnowledgeFile[]) => FlashCard[]
  getNote: (path: string) => string
  hasNote: (path: string) => boolean
  saveNote: (path: string, text: string) => void
  isFavorited: (path: string) => boolean
  toggleFavorite: (path: string) => void
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

  // SRS
  const [srsStore, setSrsStore] = useState<SRSStore>(() => loadSRSStore())
  const srsStoreRef = useRef<SRSStore>(srsStore)
  const srsShaRef = useRef<string | null>(null)
  const srsDirtyRef = useRef(false)

  // Notes
  const [notes, setNotes] = useState<NotesStore>(() => loadNotes())
  const notesShaRef = useRef<string | null>(null)

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())
  const favoritesShaRef = useRef<string | null>(null)

  // ── Toast ──────────────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // ── PAT ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadPAT().then((p) => {
      setPATState(p)
      setPatLoading(false)
    })
  }, [])

  // ── Remote load (after PAT is ready) ─────────────────────────────────────

  useEffect(() => {
    if (!pat) return
    Promise.all([
      readRemoteJson<SRSStore>(pat, 'srs'),
      readRemoteJson<NotesStore>(pat, 'notes'),
      readRemoteJson<string[]>(pat, 'favorites'),
    ]).then(([srsResult, notesResult, favResult]) => {
      if (srsResult) {
        setSrsStore(srsResult.data)
        saveSRSStore(srsResult.data)
        srsStoreRef.current = srsResult.data
        srsShaRef.current = srsResult.sha
      }
      if (notesResult) {
        setNotes(notesResult.data)
        saveNotes(notesResult.data)
        notesShaRef.current = notesResult.sha
      }
      if (favResult) {
        const favSet = new Set(favResult.data)
        setFavorites(favSet)
        saveFavorites(favSet)
        favoritesShaRef.current = favResult.sha
      }
    })
  }, [pat])

  // ── SRS visibilitychange sync ─────────────────────────────────────────────

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && srsDirtyRef.current && pat) {
        srsDirtyRef.current = false
        writeRemoteJson(pat, 'srs', srsStoreRef.current, srsShaRef.current)
          .then((sha) => {
            srsShaRef.current = sha
          })
          .catch(() => {
            srsDirtyRef.current = true // re-mark dirty on failure
          })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [pat])

  // ── Theme ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    const root = document.documentElement
    if (
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // ── PAT actions ───────────────────────────────────────────────────────────

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

  // ── SRS actions ───────────────────────────────────────────────────────────

  const recordReview = useCallback((path: string, rating: SRSRating) => {
    setSrsStore((prev) => {
      const next = {
        ...prev,
        [path]: calculateNextReview(prev[path] ?? null, rating, path),
      }
      saveSRSStore(next)
      srsStoreRef.current = next
      srsDirtyRef.current = true
      return next
    })
  }, [])

  const getSRSLevel = useCallback(
    (path: string): RetentionLevel => getRetentionLevel(srsStore[path] ?? null),
    [srsStore],
  )

  const buildCards = useCallback(
    (files: KnowledgeFile[]): FlashCard[] => buildSessionCards(files, srsStore),
    [srsStore],
  )

  const dueTodayCount = Object.values(srsStore).filter((s) => isDue(s)).length

  // ── Notes actions ─────────────────────────────────────────────────────────

  const getNote = useCallback((path: string) => notes[path] ?? '', [notes])

  const hasNote = useCallback((path: string) => Boolean(notes[path]), [notes])

  const saveNote = useCallback(
    (path: string, text: string) => {
      setNotes((prev) => {
        const next = { ...prev }
        if (text.trim()) {
          next[path] = text.trim()
        } else {
          delete next[path]
        }
        saveNotes(next)
        if (pat) {
          writeRemoteJson(pat, 'notes', next, notesShaRef.current)
            .then((sha) => {
              notesShaRef.current = sha
            })
            .catch(() => {})
        }
        return next
      })
    },
    [pat],
  )

  // ── Favorites actions ─────────────────────────────────────────────────────

  const isFavorited = useCallback((path: string) => favorites.has(path), [favorites])

  const toggleFavorite = useCallback(
    (path: string) => {
      setFavorites((prev) => {
        const next = new Set(prev)
        if (next.has(path)) {
          next.delete(path)
        } else {
          next.add(path)
        }
        saveFavorites(next)
        if (pat) {
          writeRemoteJson(pat, 'favorites', [...next], favoritesShaRef.current)
            .then((sha) => {
              favoritesShaRef.current = sha
            })
            .catch(() => {})
        }
        return next
      })
    },
    [pat],
  )

  return (
    <AppContext.Provider
      value={{
        pat,
        patLoading,
        theme,
        toasts,
        srsStore,
        dueTodayCount,
        notes,
        favorites,
        setPAT: handleSetPAT,
        removePAT,
        setTheme,
        addToast,
        dismissToast,
        recordReview,
        getSRSLevel,
        buildCards,
        getNote,
        hasNote,
        saveNote,
        isFavorited,
        toggleFavorite,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
