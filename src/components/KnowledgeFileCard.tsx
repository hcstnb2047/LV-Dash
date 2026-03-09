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
}

export function KnowledgeFileCard({ file, retentionLevel }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() =>
        navigate(`/knowledge/view?path=${encodeURIComponent(file.path)}`)
      }
      className="w-full text-left rounded border border-zinc-800 bg-zinc-900 p-3 active:bg-zinc-800 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-mono text-sm text-zinc-100 truncate">
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
  )
}
