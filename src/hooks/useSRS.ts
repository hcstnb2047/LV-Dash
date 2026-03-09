import { useState } from 'react'
import { loadSRSStore, saveSRSStore } from '../lib/storage'
import { calculateNextReview, getRetentionLevel, isDue, buildSessionCards } from '../lib/srs'
import type { SRSStore, SRSRating, RetentionLevel, FlashCard } from '../types/srs'
import type { KnowledgeFile } from '../types/knowledge'

export function useSRS() {
  const [store, setStore] = useState<SRSStore>(() => loadSRSStore())

  const recordReview = (path: string, rating: SRSRating) => {
    setStore((prev) => {
      const next = {
        ...prev,
        [path]: calculateNextReview(prev[path] ?? null, rating, path),
      }
      saveSRSStore(next)
      return next
    })
  }

  const dueTodayCount = Object.values(store).filter((s) => isDue(s)).length

  const getLevel = (path: string): RetentionLevel => {
    return getRetentionLevel(store[path] ?? null)
  }

  const buildCards = (files: KnowledgeFile[]): FlashCard[] => {
    return buildSessionCards(files, store)
  }

  return { store, recordReview, dueTodayCount, getLevel, buildCards }
}
