import { useState } from 'react'
import type { WorkflowState } from '../types'
import { getRunStatus } from '../types'
import { CATEGORY_LABELS } from '../types'
import { StatusBadge } from './StatusBadge'
import { DispatchDialog } from './DispatchDialog'
import { useApp } from '../context/AppContext'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'たった今'
  if (min < 60) return `${min}分前`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours}h前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}

export function WorkflowCard({ wf }: { wf: WorkflowState }) {
  const { toggleFavorite } = useApp()
  const [showDialog, setShowDialog] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [cooldown, setCooldown] = useState(false)

  const fileName = wf.workflow.path.split('/').pop() ?? ''
  const displayName = wf.meta?.displayName ?? wf.workflow.name
  const category = wf.meta?.category ?? 'uncategorized'
  const latestRun = wf.latestRuns[0]
  const status = latestRun ? getRunStatus(latestRun) : 'unknown'

  const handleRun = () => {
    if (cooldown) return
    setShowDialog(true)
  }

  const handleDispatchClose = () => {
    setShowDialog(false)
    setCooldown(true)
    setTimeout(() => setCooldown(false), 3000)
  }

  return (
    <>
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
        <div className="p-4" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(fileName) }}
                  className="text-lg shrink-0"
                  aria-label={wf.isFavorite ? 'お気に入り解除' : 'お気に入り追加'}
                >
                  {wf.isFavorite ? '★' : '☆'}
                </button>
                <h3 className="font-semibold text-sm truncate">{displayName}</h3>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{CATEGORY_LABELS[category]}</span>
                {latestRun && (
                  <>
                    <span>·</span>
                    <StatusBadge status={status} />
                    <span>{timeAgo(latestRun.created_at)}</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleRun() }}
              disabled={cooldown}
              className="ml-3 shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 active:bg-blue-700"
            >
              {cooldown ? '...' : '▶ 実行'}
            </button>
          </div>
        </div>

        {expanded && wf.latestRuns.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-950">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">履歴</p>
            {wf.latestRuns.map((run) => (
              <div key={run.id} className="flex items-center gap-3 py-1 text-xs text-gray-600 dark:text-gray-400">
                <StatusBadge status={getRunStatus(run)} />
                <span>{timeAgo(run.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDialog && <DispatchDialog wf={wf} onClose={handleDispatchClose} />}
    </>
  )
}
