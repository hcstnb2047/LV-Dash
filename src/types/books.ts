export type BookTier = 'A' | 'B' | 'C'
export type BookStatus = 'unread' | 'reading' | 'read'
export type BookCategory =
  | 'health'
  | 'psychology'
  | 'productivity'
  | 'career'
  | 'AI'
  | 'agile'
  | 'marketing'
  | 'other'

export interface BookNote {
  date: string
  text: string
}

export interface BookEntry {
  title: string
  file: string
  tier: BookTier
  category: BookCategory
  status: BookStatus
  vault_connection?: string
  notes: BookNote[]
}

export interface ReadingLog {
  last_updated: string
  base_path: string
  books: BookEntry[]
}

export const TIER_LABELS: Record<BookTier, string> = {
  A: '行動変容',
  B: '実務参照',
  C: '教養',
}

export const TIER_COLORS: Record<BookTier, string> = {
  A: 'bg-amber-500 text-white',
  B: 'bg-blue-500 text-white',
  C: 'bg-gray-400 text-white',
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  unread: '未読',
  reading: '読書中',
  read: '読了',
}

export const STATUS_ICONS: Record<BookStatus, string> = {
  unread: '📕',
  reading: '📖',
  read: '✅',
}

export const CATEGORY_LABELS: Record<BookCategory, string> = {
  health: '健康',
  psychology: '心理',
  productivity: '生産性',
  career: 'キャリア',
  AI: 'AI',
  agile: 'アジャイル',
  marketing: 'マーケ',
  other: 'その他',
}