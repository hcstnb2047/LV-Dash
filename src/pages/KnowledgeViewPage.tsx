import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getFileContent } from '../lib/knowledge'
import { MarkdownContent } from '../components/MarkdownContent'
import { OWNER, DATA_REPO } from '../lib/github'

// Simple in-memory content cache (survives SPA navigation)
const contentCache = new Map<string, string>()
const MAX_CACHE = 20

function cacheContent(path: string, content: string) {
  if (contentCache.size >= MAX_CACHE) {
    const firstKey = contentCache.keys().next().value
    if (firstKey) contentCache.delete(firstKey)
  }
  contentCache.set(path, content)
}

function getDisplayTitle(path: string): string {
  const name = path.split('/').pop() ?? path
  return name
    .replace(/\.md$/, '')
    .replace(/^\d{4}-\d{2}-\d{2}[_-]?/, '')
    || name.replace(/\.md$/, '')
}

export function KnowledgeViewPage() {
  const { pat, addToast, isFavorited, toggleFavorite, getNote, saveNote } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const path = searchParams.get('path') ?? ''

  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  useEffect(() => {
    setNoteText(getNote(path))
  }, [path, getNote])

  const fetchContent = useCallback(async () => {
    if (!pat || !path) return

    const cached = contentCache.get(path)
    if (cached) {
      setContent(cached)
      return
    }

    setLoading(true)
    try {
      const text = await getFileContent(pat, path)
      cacheContent(path, text)
      setContent(text)
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : 'ファイルの取得に失敗しました',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [pat, path, addToast])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleSaveNote = () => {
    saveNote(path, noteText)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 1500)
  }

  if (!pat || !path) return null

  const title = getDisplayTitle(path)
  const githubUrl = `https://github.com/${OWNER}/${DATA_REPO}/blob/main/${path}`
  const favorited = isFavorited(path)

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="rounded p-2 text-zinc-500 hover:bg-zinc-800 shrink-0"
            aria-label="戻る"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-mono text-sm text-zinc-100 truncate flex-1">{title}</h1>
          <button
            onClick={() => toggleFavorite(path)}
            className="rounded p-2 transition-colors shrink-0"
            aria-label={favorited ? 'お気に入り解除' : 'お気に入り登録'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} style={{ color: favorited ? '#fbbf24' : '#71717a' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-2 text-zinc-500 hover:bg-zinc-800 shrink-0"
            aria-label="GitHubで開く"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-48">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          </div>
        ) : content !== null ? (
          <MarkdownContent content={content} />
        ) : (
          <p className="font-mono text-center text-sm text-zinc-500 py-12">
            コンテンツを読み込めませんでした
          </p>
        )}
      </div>

      {/* Memo — fixed bottom panel */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950 px-4 pt-3 pb-4">
        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2">Memo</p>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="メモを入力..."
          rows={3}
          className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:border-sky-500 focus:outline-none resize-none"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSaveNote}
            className="font-mono rounded border border-sky-600 text-sky-400 px-4 py-1.5 text-xs uppercase tracking-wider hover:bg-sky-600 hover:text-zinc-950 transition-colors"
          >
            {noteSaved ? 'Saved!' : 'Save'}
          </button>
          {noteText && (
            <button
              onClick={() => { setNoteText(''); saveNote(path, '') }}
              className="font-mono rounded border border-zinc-700 text-zinc-500 px-4 py-1.5 text-xs uppercase tracking-wider hover:border-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
