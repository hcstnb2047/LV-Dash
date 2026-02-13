import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useKnowledge } from '../hooks/useKnowledge'
import { useKnowledgeSearch } from '../hooks/useKnowledgeSearch'
import {
  KnowledgeCategoryFilter,
  type KnowledgeFilterKey,
} from '../components/KnowledgeCategoryFilter'
import { KnowledgeFileCard } from '../components/KnowledgeFileCard'
import { SearchInput } from '../components/SearchInput'
import { useNavigate } from 'react-router-dom'
import type { KnowledgeSearchResult } from '../types/knowledge'

function SearchResultCard({ result }: { result: KnowledgeSearchResult }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() =>
        navigate(`/knowledge/view?path=${encodeURIComponent(result.path)}`)
      }
      className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
        {result.displayName}
      </p>
      {result.category && (
        <span className="inline-block mt-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-400">
          {result.category}
        </span>
      )}
      {result.textMatches.length > 0 && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
          {result.textMatches[0]}
        </p>
      )}
    </button>
  )
}

type SortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'date-desc', label: '新しい順', icon: '📅↓' },
  { key: 'date-asc', label: '古い順', icon: '📅↑' },
  { key: 'name-asc', label: '名前順 (A→Z)', icon: '🔤↑' },
  { key: 'name-desc', label: '名前順 (Z→A)', icon: '🔤↓' },
]

export function KnowledgePage() {
  const { pat, addToast } = useApp()
  const { files, loading, error, refresh } = useKnowledge(pat)
  const { query, setQuery, results, searching, rateLimited, clearSearch } =
    useKnowledgeSearch(pat)
  const [filter, setFilter] = useState<KnowledgeFilterKey>('all')
  const [showSearch, setShowSearch] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [showSortMenu, setShowSortMenu] = useState(false)

  if (!pat) return null

  if (error) {
    addToast(error, 'error')
  }

  const isSearching = query.length >= 2
  const filteredFiles = files
    .filter((f) => filter === 'all' || f.category === filter)
    .sort((a, b) => {
      switch (sortKey) {
        case 'date-desc':
          if (a.date && b.date) return b.date.localeCompare(a.date)
          if (a.date && !b.date) return -1
          if (!a.date && b.date) return 1
          return a.displayName.localeCompare(b.displayName)
        case 'date-asc':
          if (a.date && b.date) return a.date.localeCompare(b.date)
          if (a.date && !b.date) return 1
          if (!a.date && b.date) return -1
          return a.displayName.localeCompare(b.displayName)
        case 'name-asc':
          return a.displayName.localeCompare(b.displayName)
        case 'name-desc':
          return b.displayName.localeCompare(a.displayName)
        default:
          return 0
      }
    })

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold">Knowledge</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowSearch((s) => !s)
                if (showSearch) clearSearch()
              }}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
              aria-label="検索"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
              onClick={refresh}
              disabled={loading}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-40"
              aria-label="更新"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
        {showSearch && (
          <div className="mb-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              onClear={clearSearch}
              searching={searching}
              rateLimited={rateLimited}
            />
          </div>
        )}
        {!isSearching && (
          <KnowledgeCategoryFilter
            filter={filter}
            onFilterChange={setFilter}
          />
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {loading && files.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : isSearching ? (
          searching ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-12">
              検索結果がありません
            </p>
          ) : (
            results.map((r) => <SearchResultCard key={r.path} result={r} />)
          )
        ) : filteredFiles.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-12">
            ファイルがありません
          </p>
        ) : (
          filteredFiles.map((f) => <KnowledgeFileCard key={f.path} file={f} />)
        )}
      </div>
    </div>
  )
}
