import type { WorkflowWithMeta } from '../types'
import { CATEGORY_LABELS } from '../types'

interface Props {
  workflows: WorkflowWithMeta[]
}

export function WorkflowStats({ workflows }: Props) {
  const visibleWorkflows = workflows.filter((w) => w.isVisible)
  const totalCount = visibleWorkflows.length
  const favoriteCount = visibleWorkflows.filter((w) => w.isFavorite).length

  // Count by category
  const categoryCounts = visibleWorkflows.reduce(
    (acc, w) => {
      const cat = w.meta?.category ?? 'uncategorized'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryEntries = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6) // Top 6 categories

  const maxCount = Math.max(...categoryEntries.map(([, count]) => count))

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
          <div className="text-2xl font-bold">{totalCount}</div>
          <div className="text-xs opacity-90">ワークフロー</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-3 text-white shadow-lg">
          <div className="text-2xl font-bold">{favoriteCount}</div>
          <div className="text-xs opacity-90">お気に入り</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
          <div className="text-2xl font-bold">{Object.keys(categoryCounts).length}</div>
          <div className="text-xs opacity-90">カテゴリ</div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
          カテゴリ別分布
        </h3>
        <div className="space-y-2">
          {categoryEntries.map(([category, count]) => {
            const percentage = (count / maxCount) * 100
            const label = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category
            return (
              <div key={category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {count}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
