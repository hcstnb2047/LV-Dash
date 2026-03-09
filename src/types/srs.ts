import type { KnowledgeFile } from './knowledge'

export interface SRSData {
  path: string
  interval: number
  repetitions: number
  easeFactor: number
  dueDate: string        // YYYY-MM-DD
  lastReviewDate: string // YYYY-MM-DD
}

export type SRSRating = 0 | 1 | 2 | 3

export type RetentionLevel = 'new' | 'learning' | 'young' | 'mature'

export type SRSStore = Record<string, SRSData>

export interface FlashCard {
  file: KnowledgeFile
  srs: SRSData | null
}

export interface SessionSummary {
  total: number
  ratings: Record<SRSRating, number>
}
