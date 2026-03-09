import { encryptPAT, decryptPAT } from './crypto'

const KEYS = {
  PAT: 'lv-dash-pat',
  THEME: 'lv-dash-theme',
  SRS: 'lv-dash-srs',
  FAVORITES: 'lv-dash-favorites',
  NOTES: 'lv-dash-notes',
} as const

export async function savePAT(pat: string): Promise<void> {
  const encrypted = await encryptPAT(pat)
  localStorage.setItem(KEYS.PAT, encrypted)
}

export async function loadPAT(): Promise<string | null> {
  const stored = localStorage.getItem(KEYS.PAT)
  if (!stored) return null
  return decryptPAT(stored)
}

export function clearPAT(): void {
  localStorage.removeItem(KEYS.PAT)
}

export type Theme = 'system' | 'light' | 'dark'

export function loadTheme(): Theme {
  return (localStorage.getItem(KEYS.THEME) as Theme) || 'system'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme)
}

// SRS persistence (Task 6)
import type { SRSStore, SRSData } from '../types/srs'

export function loadSRSStore(): SRSStore {
  const stored = localStorage.getItem(KEYS.SRS)
  return stored ? JSON.parse(stored) : {}
}

export function saveSRSStore(store: SRSStore): void {
  localStorage.setItem(KEYS.SRS, JSON.stringify(store))
}

export function exportSRSData(): string {
  return localStorage.getItem(KEYS.SRS) ?? '{}'
}

export function importSRSData(json: string): void {
  const parsed = JSON.parse(json) as Record<string, unknown>
  for (const [key, value] of Object.entries(parsed)) {
    const entry = value as Partial<SRSData>
    if (
      typeof entry.path !== 'string' ||
      typeof entry.interval !== 'number' ||
      typeof entry.repetitions !== 'number' ||
      typeof entry.easeFactor !== 'number' ||
      typeof entry.dueDate !== 'string' ||
      typeof entry.lastReviewDate !== 'string'
    ) {
      throw new Error(`Invalid SRSData entry: ${key}`)
    }
  }
  saveSRSStore(parsed as SRSStore)
}

// Favorites persistence
export function loadFavorites(): Set<string> {
  const stored = localStorage.getItem(KEYS.FAVORITES)
  return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
}

export function saveFavorites(favorites: Set<string>): void {
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify([...favorites]))
}

// Notes persistence
export type NotesStore = Record<string, string>

export function loadNotes(): NotesStore {
  const stored = localStorage.getItem(KEYS.NOTES)
  return stored ? JSON.parse(stored) : {}
}

export function saveNotes(notes: NotesStore): void {
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes))
}
