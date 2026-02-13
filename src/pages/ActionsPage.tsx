import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { WorkflowCard } from '../components/WorkflowCard'
import { CategoryFilter } from '../components/CategoryFilter'
import { WorkflowStats } from '../components/WorkflowStats'

type SortKey = 'favorites' | 'name-asc' | 'name-desc'

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'favorites', label: 'お気に入り優先', icon: '⭐' },
  { key: 'name-asc', label: '名前順 (A→Z)', icon: '🔤↑' },
  { key: 'name-desc', label: '名前順 (Z→A)', icon: '🔤↓' },
]

export function ActionsPage() {
  const { workflows, loading, filter, refreshAll, pat } = useApp()
  const [sortKey, setSortKey] = useState<SortKey>('favorites')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showStats, setShowStats] = useState(true)

  if (!pat) return null

  const filtered = workflows
    .filter((w) => w.isVisible)
    .filter((w) => {
      if (filter === 'all') return true
      if (filter === 'favorites') return w.isFavorite
      return (w.meta?.category ?? 'uncategorized') === filter
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'favorites':
          if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
          return a.workflow.name.localeCompare(b.workflow.name)
        case 'name-asc':
          return a.workflow.name.localeCompare(b.workflow.name)
        case 'name-desc':
          return b.workflow.name.localeCompare(a.workflow.name)
        default:
          return 0
      }
    })

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">LV Dash</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowStats((s) => !s)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label="統計"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu((s) => !s)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                aria-label="ソート"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortKey(option.key)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                        sortKey === option.key
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } ${option.key === SORT_OPTIONS[0].key ? 'rounded-t-xl' : ''} ${option.key === SORT_OPTIONS[SORT_OPTIONS.length - 1].key ? 'rounded-b-xl' : ''}`}
                    >
                      <span className="text-base">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40"
              aria-label="更新"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        {showStats && (
          <div className="mb-3">
            <WorkflowStats workflows={workflows} />
          </div>
        )}
        <CategoryFilter />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
        {loading && workflows.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">
            ワークフローがありません
          </p>
        ) : (
          filtered.map((wf) => <WorkflowCard key={wf.workflow.id} wf={wf} />)
        )}
      </div>
    </div>
  )
}
