import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getFileContent } from '../lib/knowledge'
import { MarkdownContent } from '../components/MarkdownContent'
import { OWNER, REPO } from '../lib/github'

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
  const { pat, addToast } = useApp()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const path = searchParams.get('path') ?? ''

  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  if (!pat || !path) return null

  const title = getDisplayTitle(path)
  const githubUrl = `https://github.com/${OWNER}/${REPO}/blob/main/${path}`

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/knowledge')}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 shrink-0"
            aria-label="戻る"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-sm font-bold truncate flex-1">{title}</h1>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 shrink-0"
            aria-label="GitHubで開く"
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
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : content !== null ? (
          <MarkdownContent content={content} />
        ) : (
          <p className="text-center text-sm text-gray-500 py-12">
            コンテンツを読み込めませんでした
          </p>
        )}
      </div>
    </div>
  )
}
