import { useState, useCallback } from 'react'
import { loadFavorites, saveFavorites } from '../lib/storage'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites())

  const toggle = useCallback((path: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      saveFavorites(next)
      return next
    })
  }, [])

  const isFavorited = useCallback(
    (path: string) => favorites.has(path),
    [favorites],
  )

  return { favorites, toggle, isFavorited }
}
