import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getReadingLog, updateBookStatus, addBookNote, invalidateCache } from '../lib/books'
import type {
  BookEntry,
  BookTier,
  BookStatus,
  ReadingLog,
} from '../types/books'
import {
  TIER_COLORS,
  STATUS_LABELS,
  STATUS_ICONS,
  CATEGORY_LABELS,
} from '../types/books'

type TierFilter = BookTier | 'all'
type StatusFilter = BookStatus | 'all'

// --- Filter Bar ---

function TierFilterBar({
  selected,
  onSelect,
  counts,
}: {
  selected: TierFilter
  onSelect: (t: TierFilter) => void
  counts: Record<TierFilter, number>
}) {
  const options: { key: TierFilter; label: string }[] = [
    { key: 'all', label: `全て (${counts.all})` },
    { key: 'A', label: `A (${counts.A})` },
    { key: 'B', label: `B (${counts.B})` },
    { key: 'C', label: `C (${counts.C})` },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onSelect(o.key)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === o.key
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function StatusFilterBar({
  selected,
  onSelect,
  counts,
}: {
  selected: StatusFilter
  onSelect: (s: StatusFilter) => void
  counts: Record<StatusFilter, number>
}) {
  const options: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全て' },
    { key: 'unread', label: `未読 (${counts.unread})` },
    { key: 'reading', label: `読書中 (${counts.reading})` },
    { key: 'read', label: `読了 (${counts.read})` },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onSelect(o.key)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selected === o.key
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// --- Book Card ---

function BookCard({
  book,
  basePath,
  onStatusChange,
  onAddNote,
}: {
  book: BookEntry
  basePath: string
  onStatusChange: (file: string, status: BookStatus) => Promise<void>
  onAddNote: (file: string, text: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const statuses: BookStatus[] = ['unread', 'reading', 'read']

  const handleStatusChange = async (status: BookStatus) => {
    if (status === book.status || saving) return
    setSaving(true)
    try {
      await onStatusChange(book.file, status)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async () => {
    if (!noteText.trim() || saving) return
    setSaving(true)
    try {
      await onAddNote(book.file, noteText.trim())
      setNoteText('')
    } finally {
      setSaving(false)
    }
  }

  const summaryPath = `${basePath}/${book.file}`

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
      >
        <div className="flex items-start gap-2">
          <span
            className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold ${TIER_COLORS[book.tier]}`}
          >
            {book.tier}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
              {book.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium">
                {CATEGORY_LABELS[book.category] ?? book.category}
              </span>
              <span className="text-xs">
                {STATUS_ICONS[book.status]} {STATUS_LABELS[book.status]}
              </span>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 shrink-0 mt-1 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-800 px-3 pb-3">
          {/* Vault connection */}
          {book.vault_connection && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Vault: {book.vault_connection}
            </p>
          )}

          {/* Status toggle */}
          <div className="flex gap-1.5 mt-3">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={saving}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                  book.status === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                } ${saving ? 'opacity-50' : ''}`}
              >
                {STATUS_ICONS[s]} {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Note input */}
          <div className="mt-3">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="気づき・感想をメモ..."
              rows={2}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-1.5">
              <button
                onClick={() =>
                  navigate(
                    `/knowledge/view?path=${encodeURIComponent(summaryPath)}`,
                  )
                }
                className="text-xs text-blue-600 dark:text-blue-400 font-medium"
              >
                サマリーを読む &rarr;
              </button>
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim() || saving}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  noteText.trim() && !saving
                    ? 'bg-blue-600 text-white active:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-800'
                }`}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          {/* Existing notes */}
          {book.notes.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                メモ ({book.notes.length})
              </p>
              {book.notes.map((note, i) => (
                <div
                  key={i}
                  className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2"
                >
                  <p className="text-[11px] text-gray-400 mb-0.5">
                    {note.date}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- Main Page ---

export function BookLibraryPage() {
  const { pat } = useApp()
  const [log, setLog] = useState<ReadingLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const loadBooks = useCallback(async () => {
    if (!pat) return
    setLoading(true)
    setError(null)
    try {
      const { log } = await getReadingLog(pat)
      setLog(log)
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }, [pat])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const handleStatusChange = async (file: string, status: BookStatus) => {
    if (!pat || !log) return
    try {
      await updateBookStatus(pat, file, status)
      // Optimistic update
      setLog((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          books: prev.books.map((b) =>
            b.file === file ? { ...b, status } : b,
          ),
        }
      })
    } catch (e) {
      invalidateCache()
      await loadBooks()
      throw e
    }
  }

  const handleAddNote = async (file: string, text: string) => {
    if (!pat || !log) return
    const today = new Date().toISOString().split('T')[0]
    try {
      await addBookNote(pat, file, text)
      // Optimistic update
      setLog((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          books: prev.books.map((b) =>
            b.file === file
              ? { ...b, notes: [...b.notes, { date: today, text }] }
              : b,
          ),
        }
      })
    } catch (e) {
      invalidateCache()
      await loadBooks()
      throw e
    }
  }

  if (!pat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500">設定でPATを登録してください</p>
      </div>
    )
  }

  const books = log?.books ?? []
  const basePath = log?.base_path ?? ''

  // Compute counts
  const tierCounts: Record<TierFilter, number> = {
    all: books.length,
    A: books.filter((b) => b.tier === 'A').length,
    B: books.filter((b) => b.tier === 'B').length,
    C: books.filter((b) => b.tier === 'C').length,
  }

  const filteredByTier =
    tierFilter === 'all' ? books : books.filter((b) => b.tier === tierFilter)

  const statusCounts: Record<StatusFilter, number> = {
    all: filteredByTier.length,
    unread: filteredByTier.filter((b) => b.status === 'unread').length,
    reading: filteredByTier.filter((b) => b.status === 'reading').length,
    read: filteredByTier.filter((b) => b.status === 'read').length,
  }

  const filteredBooks =
    statusFilter === 'all'
      ? filteredByTier
      : filteredByTier.filter((b) => b.status === statusFilter)

  // Stats
  const readCount = books.filter((b) => b.status === 'read').length
  const readingCount = books.filter((b) => b.status === 'reading').length

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            書籍ライブラリ
          </h1>
          {!loading && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {readCount}読了 / {readingCount}読書中 / {books.length}冊
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!loading && books.length > 0 && (
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 mb-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${((readCount + readingCount * 0.5) / books.length) * 100}%`,
              }}
            />
          </div>
        )}

        <TierFilterBar
          selected={tierFilter}
          onSelect={setTierFilter}
          counts={tierCounts}
        />
        <div className="mt-1.5">
          <StatusFilterBar
            selected={statusFilter}
            onSelect={setStatusFilter}
            counts={statusCounts}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={loadBooks}
              className="text-sm text-blue-600 dark:text-blue-400 font-medium"
            >
              再読み込み
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">
            該当する書籍がありません
          </p>
        ) : (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.file}
                book={book}
                basePath={basePath}
                onStatusChange={handleStatusChange}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}