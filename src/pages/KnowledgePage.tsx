import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useKnowledge } from '../hooks/useKnowledge'
import { useKnowledgeSearch } from '../hooks/useKnowledgeSearch'
import { useSRS } from '../hooks/useSRS'
import { useFavorites } from '../hooks/useFavorites'
import { useNotes } from '../hooks/useNotes'
import { isDue } from '../lib/srs'
import {
  KnowledgeCategoryFilter,
  type KnowledgeFilterKey,
} from '../components/KnowledgeCategoryFilter'
import { KnowledgeFileCard } from '../components/KnowledgeFileCard'
import { SearchInput } from '../components/SearchInput'
import type { KnowledgeSearchResult } from '../types/knowledge'

function SearchResultCard({ result }: { result: KnowledgeSearchResult }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() =>
        navigate(`/knowledge/view?path=${encodeURIComponent(result.path)}`)
      }
      className="w-full text-left rounded border border-zinc-800 bg-zinc-900 p-3 active:bg-zinc-800 transition-colors"
    >
      <p className="font-mono text-sm text-zinc-100 truncate">{result.displayName}</p>
      {result.category && (
        <span className="font-mono inline-block mt-1 rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
          {result.category}
        </span>
      )}
      {result.textMatches.length > 0 && (
        <p className="mt-1.5 font-mono text-xs text-zinc-500 line-clamp-2">
          {result.textMatches[0]}
        </p>
      )}
    </button>
  )
}

type SortKey = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'retention'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date-desc', label: '新しい順' },
  { key: 'date-asc', label: '古い順' },
  { key: 'name-asc', label: '名前 A→Z' },
  { key: 'name-desc', label: '名前 Z→A' },
  { key: 'retention', label: '要復習順' },
]

const RETENTION_ORDER = { due: 0, learning: 1, young: 2, mature: 3, new: 4 }

export function KnowledgePage() {
  const { pat, addToast } = useApp()
  const { files, loading, error, refresh } = useKnowledge(pat)
  const { query, setQuery, results, searching, rateLimited, searchError, clearSearch } =
    useKnowledgeSearch(pat)
  const { dueTodayCount, getLevel, store } = useSRS()
  const { isFavorited, toggle: toggleFavorite } = useFavorites()
  const { hasNote } = useNotes()
  const navigate = useNavigate()
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
    .filter((f) => {
      if (filter === 'favorites') return isFavorited(f.path)
      return filter === 'all' || f.category === filter
    })
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
        case 'retention': {
          const srsA = store[a.path] ?? null
          const srsB = store[b.path] ?? null
          const levelA = isDue(srsA) ? 'due' : getLevel(a.path)
          const levelB = isDue(srsB) ? 'due' : getLevel(b.path)
          return (RETENTION_ORDER[levelA] ?? 9) - (RETENTION_ORDER[levelB] ?? 9)
        }
        default:
          return 0
      }
    })

  return (
    <div className="flex-1 flex flex-col bg-zinc-950">
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-base font-bold text-zinc-100 uppercase tracking-wider">
              Knowledge
            </h1>
            {dueTodayCount > 0 && (
              <button
                onClick={() => navigate('/flashcards')}
                className="font-mono flex items-center gap-1.5 rounded border border-sky-400 px-2 py-0.5 text-[11px] text-sky-400 uppercase tracking-wider hover:bg-sky-400 hover:text-zinc-950 transition-colors"
              >
                <span>{dueTodayCount}</span>
                <span>due</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setShowSearch((s) => !s)
                if (showSearch) clearSearch()
              }}
              className="rounded p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              aria-label="検索"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu((s) => !s)}
                className="rounded p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                aria-label="ソート"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 mt-1 w-36 rounded border border-zinc-700 bg-zinc-900 shadow-lg z-20">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSortKey(option.key)
                        setShowSortMenu(false)
                      }}
                      className={`w-full text-left px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                        sortKey === option.key
                          ? 'text-sky-400 bg-zinc-800'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="rounded p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-40"
              aria-label="更新"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
          <KnowledgeCategoryFilter filter={filter} onFilterChange={setFilter} />
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
        {loading && files.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          </div>
        ) : isSearching ? (
          searching ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            </div>
          ) : searchError ? (
            <p className="font-mono text-center text-sm text-red-400 py-12">
              {searchError}
            </p>
          ) : results.length === 0 ? (
            <p className="font-mono text-center text-sm text-zinc-500 py-12">
              検索結果なし
            </p>
          ) : (
            results.map((r) => <SearchResultCard key={r.path} result={r} />)
          )
        ) : filteredFiles.length === 0 ? (
          <p className="font-mono text-center text-sm text-zinc-500 py-12">
            ファイルなし
          </p>
        ) : (
          filteredFiles.map((f) => (
            <KnowledgeFileCard
              key={f.path}
              file={f}
              retentionLevel={getLevel(f.path)}
              isFavorited={isFavorited(f.path)}
              hasNote={hasNote(f.path)}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  )
}
