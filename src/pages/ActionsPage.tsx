import { useApp } from '../context/AppContext'
import { WorkflowCard } from '../components/WorkflowCard'
import { CategoryFilter } from '../components/CategoryFilter'

export function ActionsPage() {
  const { workflows, loading, filter, refreshAll, pat } = useApp()

  if (!pat) return null

  const filtered = workflows
    .filter((w) => w.isVisible)
    .filter((w) => {
      if (filter === 'all') return true
      if (filter === 'favorites') return w.isFavorite
      return (w.meta?.category ?? 'uncategorized') === filter
    })
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1
      return 0
    })

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">LV Dash</h1>
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
