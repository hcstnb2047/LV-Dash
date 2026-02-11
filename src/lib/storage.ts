import { encryptPAT, decryptPAT } from './crypto'
import type { WorkflowRun } from '../types'

const KEYS = {
  PAT: 'lv-dash-pat',
  FAVORITES: 'lv-dash-favorites',
  HIDDEN: 'lv-dash-hidden',
  THEME: 'lv-dash-theme',
  STATUS_CACHE: 'lv-dash-status-cache',
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

export function loadFavorites(): Set<string> {
  const stored = localStorage.getItem(KEYS.FAVORITES)
  return new Set(stored ? JSON.parse(stored) : [])
}

export function saveFavorites(favs: Set<string>): void {
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify([...favs]))
}

export function loadHidden(): Set<string> {
  const stored = localStorage.getItem(KEYS.HIDDEN)
  return new Set(stored ? JSON.parse(stored) : [])
}

export function saveHidden(hidden: Set<string>): void {
  localStorage.setItem(KEYS.HIDDEN, JSON.stringify([...hidden]))
}

export type Theme = 'system' | 'light' | 'dark'

export function loadTheme(): Theme {
  return (localStorage.getItem(KEYS.THEME) as Theme) || 'system'
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(KEYS.THEME, theme)
}

interface StatusCache {
  runs: Record<string, WorkflowRun[]>
  updatedAt: string
}

export function loadStatusCache(): StatusCache | null {
  const stored = localStorage.getItem(KEYS.STATUS_CACHE)
  return stored ? JSON.parse(stored) : null
}

export function saveStatusCache(runs: Record<string, WorkflowRun[]>): void {
  const cache: StatusCache = { runs, updatedAt: new Date().toISOString() }
  localStorage.setItem(KEYS.STATUS_CACHE, JSON.stringify(cache))
}
