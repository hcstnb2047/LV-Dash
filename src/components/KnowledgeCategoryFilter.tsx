import {
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
} from '../types/knowledge'

type FilterKey = KnowledgeCategory | 'all'

const FILTERS: { key: FilterKey; label: string }[] = (
  Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [FilterKey, string][]
).map(([key, label]) => ({ key, label }))

interface Props {
  filter: FilterKey
  onFilterChange: (key: FilterKey) => void
}

export function KnowledgeCategoryFilter({ filter, onFilterChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
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

export type { FilterKey as KnowledgeFilterKey }