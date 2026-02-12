import { useState, useEffect, useCallback } from 'react'
import { getKnowledgeTree } from '../lib/knowledge'
import type { KnowledgeFile } from '../types/knowledge'

const CACHE_KEY = 'lv-dash-knowledge-tree'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface TreeCache {
  files: KnowledgeFile[]
  cachedAt: number
}

function loadCache(): KnowledgeFile[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache: TreeCache = JSON.parse(raw)
    if (Date.now() - cache.cachedAt > CACHE_TTL) return null
    return cache.files
  } catch {
    return null
  }
}

function saveCache(files: KnowledgeFile[]) {
  try {
    const cache: TreeCache = { files, cachedAt: Date.now() }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // sessionStorage full or unavailable
  }
}

export function useKnowledge(pat: string | null) {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTree = useCallback(
    async (bypassCache = false) => {
      if (!pat) return
      setLoading(true)
      setError(null)

      if (!bypassCache) {
        const cached = loadCache()
        if (cached) {
          setFiles(cached)
          setLoading(false)
          return
        }
      }

      try {
        const result = await getKnowledgeTree(pat)
        setFiles(result)
        saveCache(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'ファイル一覧の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    },
    [pat],
  )

  useEffect(() => {
    fetchTree()
  }, [fetchTree])

  const refresh = useCallback(() => fetchTree(true), [fetchTree])

  return { files, loading, error, refresh }
}