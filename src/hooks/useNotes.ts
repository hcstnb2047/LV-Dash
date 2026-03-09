import { useState, useCallback } from 'react'
import { loadNotes, saveNotes } from '../lib/storage'

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() => loadNotes())

  const getNote = useCallback((path: string) => notes[path] ?? '', [notes])

  const hasNote = useCallback((path: string) => Boolean(notes[path]), [notes])

  const saveNote = useCallback((path: string, text: string) => {
    setNotes((prev) => {
      const next = { ...prev }
      if (text.trim()) {
        next[path] = text.trim()
      } else {
        delete next[path]
      }
      saveNotes(next)
      return next
    })
  }, [])

  return { getNote, hasNote, saveNote }
}
