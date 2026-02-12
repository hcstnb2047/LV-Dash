import { useNavigate } from 'react-router-dom'
import type { KnowledgeFile, KnowledgeCategory } from '../types/knowledge'

const CATEGORY_COLORS: Record<KnowledgeCategory, string> = {
  research: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  notes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  webclips: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

interface Props {
  file: KnowledgeFile
}

export function KnowledgeFileCard({ file }: Props) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() =>
        navigate(`/knowledge/view?path=${encodeURIComponent(file.path)}`)
      }
      className="w-full text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 shadow-sm active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {file.displayName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[file.category]}`}
            >
              {file.category}
            </span>
            {file.date && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {file.date}
              </span>
            )}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  )
}
