import { useState, useEffect, useRef, useCallback } from 'react'
import { searchKnowledge } from '../lib/knowledge'
import type { KnowledgeSearchResult } from '../types/knowledge'

export function useKnowledgeSearch(pat: string | null) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<KnowledgeSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const timerRef = useRef<number>(undefined)
  const rateLimitTimerRef = useRef<number>(undefined)

  const performSearch = useCallback(
    async (q: string) => {
      if (!pat || q.length < 2) return
      setSearching(true)
      try {
        const { results: items, rateLimitRemaining } =
          await searchKnowledge(pat, q)
        setResults(items)
        if (rateLimitRemaining < 3) {
          setRateLimited(true)
          rateLimitTimerRef.current = window.setTimeout(
            () => setRateLimited(false),
            60_000,
          )
        }
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    },
    [pat],
  )

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }
    clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      performSearch(query)
    }, 500)
    return () => clearTimeout(timerRef.current)
  }, [query, performSearch])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(rateLimitTimerRef.current)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setQuery('')
    setResults([])
  }, [])

  return { query, setQuery, results, searching, rateLimited, clearSearch }
}
