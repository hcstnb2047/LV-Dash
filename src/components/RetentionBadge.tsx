import type { RetentionLevel } from '../types/srs'

const CONFIG: Record<RetentionLevel, { label: string; className: string }> = {
  new: { label: 'NEW', className: 'text-zinc-500' },
  learning: { label: 'LEARNING', className: 'text-amber-400' },
  young: { label: 'YOUNG', className: 'text-sky-400' },
  mature: { label: 'MATURE', className: 'text-sky-600' },
}

interface RetentionBadgeProps {
  level: RetentionLevel
}

export function RetentionBadge({ level }: RetentionBadgeProps) {
  const { label, className } = CONFIG[level]
  return (
    <span className={`font-mono uppercase tracking-wider text-[10px] ${className}`}>
      {label}
    </span>
  )
}
