import type { RunStatus } from '../types'

const CONFIG: Record<RunStatus, { label: string; className: string }> = {
  success: { label: 'success', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  failure: { label: 'failure', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  in_progress: { label: 'running', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  queued: { label: 'queued', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  cancelled: { label: 'cancelled', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  unknown: { label: '---', className: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
}

export function StatusBadge({ status }: { status: RunStatus }) {
  const c = CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${c.className}`}>
      {status === 'in_progress' && (
        <span className="inline-block h-2 w-2 animate-spin rounded-full border border-current border-t-transparent" />
      )}
      {c.label}
    </span>
  )
}
