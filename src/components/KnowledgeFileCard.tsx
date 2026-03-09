import { useNavigate } from 'react-router-dom'
import type { KnowledgeFile, KnowledgeCategory } from '../types/knowledge'
import { KNOWLEDGE_CATEGORY_LABELS } from '../types/knowledge'
import type { RetentionLevel } from '../types/srs'
import { RetentionBadge } from './RetentionBadge'

const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  report: 'text-purple-400 border-purple-800',
  note: 'text-amber-400 border-amber-800',
  topic: 'text-sky-400 border-sky-800',
  webclip: 'text-zinc-400 border-zinc-700',
}

interface Props {
  file: KnowledgeFile
  retentionLevel?: RetentionLevel
  isFavorited?: boolean
  hasNote?: boolean
  onToggleFavorite?: (path: string) => void
}

export function KnowledgeFileCard({
  file,
  retentionLevel,
  isFavorited,
  hasNote,
  onToggleFavorite,
}: Props) {
  const navigate = useNavigate()

  return (
    <div className="relative rounded border border-zinc-800 bg-zinc-900 transition-colors active:bg-zinc-800">
      <button
        onClick={() =>
          navigate(`/knowledge/view?path=${encodeURIComponent(file.path)}`)
        }
        className="w-full text-left p-3"
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-mono text-sm text-zinc-100 truncate pr-6">
                {file.displayName}
              </p>
              {retentionLevel && <RetentionBadge level={retentionLevel} />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${CATEGORY_COLORS[file.category]}`}
              >
                {KNOWLEDGE_CATEGORY_LABELS[file.category]}
              </span>
              {file.date && (
                <span className="font-mono text-[11px] text-zinc-500">
                  {file.date}
                </span>
              )}
              {hasNote && (
                <span className="font-mono text-[10px] text-amber-400">
                  memo
                </span>
              )}
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(file.path)
          }}
          className="absolute top-2.5 right-8 p-1 text-zinc-600 hover:text-amber-400 transition-colors"
          aria-label={isFavorited ? 'お気に入り解除' : 'お気に入り登録'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            style={{ color: isFavorited ? '#fbbf24' : undefined }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
