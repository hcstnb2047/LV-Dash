import type { SRSData, SRSRating, SRSStore, RetentionLevel, FlashCard } from '../types/srs'
import type { KnowledgeFile } from '../types/knowledge'

export function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function calculateNextReview(
  current: SRSData | null,
  rating: SRSRating,
  path: string,
): SRSData {
  const today = getTodayString()
  const interval = current?.interval ?? 0
  const repetitions = current?.repetitions ?? 0
  const easeFactor = current?.easeFactor ?? 2.5

  let newInterval: number
  let newRepetitions: number
  let newEaseFactor: number

  if (rating === 0) {
    // Again: reset
    newInterval = 1
    newRepetitions = 0
    newEaseFactor = easeFactor
  } else if (rating === 1) {
    // Hard
    newInterval = Math.max(1, Math.floor(interval * 0.8))
    newRepetitions = repetitions
    newEaseFactor = Math.max(1.3, easeFactor - 0.15)
  } else if (rating === 2) {
    // Good
    if (repetitions === 0) newInterval = 1
    else if (repetitions === 1) newInterval = 6
    else newInterval = Math.round(interval * easeFactor)
    newRepetitions = repetitions + 1
    newEaseFactor = easeFactor
  } else {
    // Easy (3)
    if (repetitions === 0) newInterval = Math.round(1 * 1.3)
    else if (repetitions === 1) newInterval = Math.round(6 * 1.3)
    else newInterval = Math.round(interval * easeFactor * 1.3)
    newRepetitions = repetitions + 1
    newEaseFactor = Math.max(1.3, easeFactor + 0.1)
  }

  return {
    path,
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    dueDate: addDays(today, newInterval),
    lastReviewDate: today,
  }
}

export function getRetentionLevel(srs: SRSData | null): RetentionLevel {
  if (!srs) return 'new'
  if (srs.interval < 7) return 'learning'
  if (srs.interval <= 21) return 'young'
  return 'mature'
}

export function isDue(srs: SRSData | null): boolean {
  if (!srs) return true
  return srs.dueDate <= getTodayString()
}

export function buildSessionCards(
  files: KnowledgeFile[],
  store: SRSStore,
  maxNewCards = 10,
): FlashCard[] {
  const dueCards: FlashCard[] = []
  const newCards: FlashCard[] = []

  for (const file of files) {
    const srs = store[file.path] ?? null
    if (srs !== null && isDue(srs)) {
      dueCards.push({ file, srs })
    } else if (srs === null) {
      newCards.push({ file, srs: null })
    }
  }

  return [...dueCards, ...newCards.slice(0, maxNewCards)]
}
