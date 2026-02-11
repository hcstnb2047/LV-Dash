import { useApp } from '../context/AppContext'
import { CATEGORY_LABELS, type WorkflowCategory } from '../types'

type FilterKey = WorkflowCategory | 'all' | 'favorites'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全て' },
  { key: 'favorites', label: '★' },
  { key: 'collect', label: '記録' },
  { key: 'analysis', label: '分析' },
  { key: 'reminder', label: 'リマインダー' },
  { key: 'research', label: 'リサーチ' },
  { key: 'system', label: 'システム' },
  { key: 'iphone', label: 'iPhone' },
]

export function CategoryFilter() {
  const { filter, setFilter, workflows } = useApp()

  // Only show categories that have workflows
  const activeCategories = new Set(
    workflows.map((w) => w.meta?.category ?? 'uncategorized'),
  )
  const hasFavorites = workflows.some((w) => w.isFavorite)

  const visibleFilters = FILTERS.filter((f) => {
    if (f.key === 'all') return true
    if (f.key === 'favorites') return hasFavorites
    return activeCategories.has(f.key as WorkflowCategory)
  })

  // Add uncategorized if present
  if (activeCategories.has('uncategorized')) {
    visibleFilters.push({ key: 'uncategorized' as FilterKey, label: CATEGORY_LABELS.uncategorized })
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {visibleFilters.map((f) => (
        <button
          key={f.key}
          onClick={() => setFilter(f.key)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filter === f.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
