import {
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
} from '../types/knowledge'

type FilterKey = KnowledgeCategory | 'all'

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all', label: KNOWLEDGE_CATEGORY_LABELS.all, icon: '📚' },
  { key: 'report', label: KNOWLEDGE_CATEGORY_LABELS.report, icon: '📊' },
  { key: 'book', label: KNOWLEDGE_CATEGORY_LABELS.book, icon: '📖' },
  { key: 'note', label: KNOWLEDGE_CATEGORY_LABELS.note, icon: '📝' },
  { key: 'topic', label: KNOWLEDGE_CATEGORY_LABELS.topic, icon: '🏷️' },
  { key: 'webclip', label: KNOWLEDGE_CATEGORY_LABELS.webclip, icon: '🔖' },
]

interface Props {
  filter: FilterKey
  onFilterChange: (key: FilterKey) => void
}

export function KnowledgeCategoryFilter({ filter, onFilterChange }: Props) {
  const allFilter = FILTERS[0]
  const categoryFilters = FILTERS.slice(1)

  return (
    <div className="space-y-2">
      <button
        onClick={() => onFilterChange(allFilter.key)}
        className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
          filter === allFilter.key
            ? 'bg-blue-600 text-white shadow-lg scale-105'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
        }`}
      >
        <span className="text-xl">{allFilter.icon}</span>
        <span>{allFilter.label}</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {categoryFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95'
            }`}
          >
            <span className="text-xl">{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export type { FilterKey as KnowledgeFilterKey }