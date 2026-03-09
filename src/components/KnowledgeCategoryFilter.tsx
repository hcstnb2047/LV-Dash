import {
  KNOWLEDGE_CATEGORY_LABELS,
  type KnowledgeCategory,
} from '../types/knowledge'

type FilterKey = KnowledgeCategory | 'all' | 'favorites'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: KNOWLEDGE_CATEGORY_LABELS.all },
  { key: 'favorites', label: '★' },
  { key: 'report', label: KNOWLEDGE_CATEGORY_LABELS.report },
  { key: 'note', label: KNOWLEDGE_CATEGORY_LABELS.note },
  { key: 'topic', label: KNOWLEDGE_CATEGORY_LABELS.topic },
  { key: 'webclip', label: KNOWLEDGE_CATEGORY_LABELS.webclip },
]

interface Props {
  filter: FilterKey
  onFilterChange: (key: FilterKey) => void
}

export function KnowledgeCategoryFilter({ filter, onFilterChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={`font-mono shrink-0 rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
            filter === f.key
              ? 'border-sky-400 bg-sky-400 text-zinc-950'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export type { FilterKey as KnowledgeFilterKey }
