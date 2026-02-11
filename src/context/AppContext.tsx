import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { loadPAT, savePAT, clearPAT, loadFavorites, saveFavorites, loadHidden, saveHidden, loadTheme, saveTheme, loadStatusCache, saveStatusCache, type Theme } from '../lib/storage'
import { listWorkflows, getWorkflowRuns, dispatchWorkflow, getLatestRunAfterDispatch, GitHubAPIError } from '../lib/github'
import { getMetaByFileName } from '../data/workflows'
import type { Workflow, WorkflowRun, WorkflowState, WorkflowCategory } from '../types'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  pat: string | null
  patLoading: boolean
  workflows: WorkflowState[]
  loading: boolean
  filter: WorkflowCategory | 'all' | 'favorites'
  theme: Theme
  toasts: Toast[]
  pollingWorkflows: Set<number>
}

interface AppActions {
  setPAT: (pat: string) => Promise<boolean>
  removePAT: () => void
  refreshAll: () => Promise<void>
  dispatch: (wf: WorkflowState, inputs: Record<string, string>) => Promise<void>
  toggleFavorite: (fileName: string) => void
  toggleVisibility: (fileName: string) => void
  setFilter: (filter: AppState['filter']) => void
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
  const [workflows, setWorkflows] = useState<WorkflowState[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<AppState['filter']>('all')
  const [theme, setThemeState] = useState<Theme>(loadTheme())
  const [toasts, setToasts] = useState<Toast[]>([])
  const [favorites, setFavoritesState] = useState<Set<string>>(loadFavorites())
  const [hidden, setHiddenState] = useState<Set<string>>(loadHidden())
  const [pollingWorkflows, setPollingWorkflows] = useState<Set<number>>(new Set())

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Load PAT on mount
  useEffect(() => {
    loadPAT().then((p) => {
      setPATState(p)
      setPatLoading(false)
    })
  }, [])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const buildWorkflowStates = useCallback(
    (wfs: Workflow[], runsMap: Record<string, WorkflowRun[]>): WorkflowState[] => {
      return wfs.map((wf) => {
        const fileName = wf.path.split('/').pop() ?? ''
        const meta = getMetaByFileName(fileName)
        return {
          workflow: wf,
          meta,
          latestRuns: runsMap[String(wf.id)] ?? [],
          isFavorite: favorites.has(fileName),
          isVisible: !hidden.has(fileName),
        }
      })
    },
    [favorites, hidden],
  )

  const refreshAll = useCallback(async () => {
    if (!pat) return
    setLoading(true)
    try {
      const wfs = await listWorkflows(pat)
      const runsMap: Record<string, WorkflowRun[]> = {}
      await Promise.all(
        wfs.map(async (wf) => {
          try {
            runsMap[String(wf.id)] = await getWorkflowRuns(pat, wf.id, 3)
          } catch {
            runsMap[String(wf.id)] = []
          }
        }),
      )
      saveStatusCache(runsMap)
      setWorkflows(buildWorkflowStates(wfs, runsMap))
    } catch (e) {
      if (e instanceof GitHubAPIError) {
        addToast(e.message, 'error')
      } else {
        addToast('ネットワークエラー', 'error')
      }
      // Load from cache
      const cache = loadStatusCache()
      if (cache) {
        try {
          const wfs = await listWorkflows(pat)
          setWorkflows(buildWorkflowStates(wfs, cache.runs))
        } catch {
          // Fully offline
        }
      }
    } finally {
      setLoading(false)
    }
  }, [pat, buildWorkflowStates, addToast])

  // Auto-refresh on PAT set
  useEffect(() => {
    if (pat && !patLoading) refreshAll()
  }, [pat, patLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetPAT = async (newPat: string): Promise<boolean> => {
    try {
      const { validatePAT } = await import('../lib/github')
      const valid = await validatePAT(newPat)
      if (!valid) {
        addToast('PATが無効です。確認してください', 'error')
        return false
      }
      await savePAT(newPat)
      setPATState(newPat)
      addToast('PAT設定完了', 'success')
      return true
    } catch {
      addToast('PAT検証に失敗しました', 'error')
      return false
    }
  }

  const removePAT = () => {
    clearPAT()
    setPATState(null)
    setWorkflows([])
    addToast('PATを削除しました', 'info')
  }

  const handleDispatch = async (wf: WorkflowState, inputs: Record<string, string>) => {
    if (!pat) return
    const fileName = wf.workflow.path.split('/').pop() ?? ''
    try {
      const dispatchedAt = new Date()
      await dispatchWorkflow(pat, fileName, inputs)
      addToast(`${wf.meta?.displayName ?? wf.workflow.name} を実行しました`, 'success')

      // Start polling for this workflow
      setPollingWorkflows((prev) => new Set(prev).add(wf.workflow.id))

      const pollRun = async () => {
        const run = await getLatestRunAfterDispatch(pat, wf.workflow.id, dispatchedAt)
        if (run) {
          // Update this workflow's runs
          setWorkflows((prev) =>
            prev.map((w) =>
              w.workflow.id === wf.workflow.id
                ? { ...w, latestRuns: [run, ...w.latestRuns.slice(0, 2)] }
                : w,
            ),
          )

          // Poll until complete (max 10 min)
          if (run.status !== 'completed') {
            const interval = setInterval(async () => {
              try {
                const runs = await getWorkflowRuns(pat, wf.workflow.id, 1)
                if (runs[0]) {
                  setWorkflows((prev) =>
                    prev.map((w) =>
                      w.workflow.id === wf.workflow.id
                        ? { ...w, latestRuns: [runs[0], ...w.latestRuns.slice(1)] }
                        : w,
                    ),
                  )
                  if (runs[0].status === 'completed') {
                    clearInterval(interval)
                    setPollingWorkflows((prev) => {
                      const next = new Set(prev)
                      next.delete(wf.workflow.id)
                      return next
                    })
                    const result = runs[0].conclusion === 'success' ? 'success' : 'failure'
                    addToast(
                      `${wf.meta?.displayName ?? wf.workflow.name}: ${result}`,
                      result === 'success' ? 'success' : 'error',
                    )
                  }
                }
              } catch {
                clearInterval(interval)
              }
            }, 30_000)
            setTimeout(() => clearInterval(interval), 10 * 60_000)
          }
        }
      }
      pollRun()
    } catch (e) {
      if (e instanceof GitHubAPIError) {
        addToast(`実行に失敗しました: ${e.message}`, 'error')
      } else {
        addToast('実行に失敗しました', 'error')
      }
    }
  }

  const toggleFavorite = (fileName: string) => {
    setFavoritesState((prev) => {
      const next = new Set(prev)
      if (next.has(fileName)) next.delete(fileName)
      else next.add(fileName)
      saveFavorites(next)
      return next
    })
  }

  const toggleVisibility = (fileName: string) => {
    setHiddenState((prev) => {
      const next = new Set(prev)
      if (next.has(fileName)) next.delete(fileName)
      else next.add(fileName)
      saveHidden(next)
      return next
    })
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    saveTheme(t)
  }

  // Keep favorites/hidden in sync with workflow states
  useEffect(() => {
    setWorkflows((prev) =>
      prev.map((w) => {
        const fn = w.workflow.path.split('/').pop() ?? ''
        return {
          ...w,
          isFavorite: favorites.has(fn),
          isVisible: !hidden.has(fn),
        }
      }),
    )
  }, [favorites, hidden])

  return (
    <AppContext.Provider
      value={{
        pat,
        patLoading,
        workflows,
        loading,
        filter,
        theme,
        toasts,
        pollingWorkflows,
        setPAT: handleSetPAT,
        removePAT,
        refreshAll,
        dispatch: handleDispatch,
        toggleFavorite,
        toggleVisibility,
        setFilter,
        setTheme,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
