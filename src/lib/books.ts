import yaml from 'js-yaml'
import { request, OWNER, REPO } from './github'
import type { GitContentResponse } from '../types/knowledge'
import type { ReadingLog, BookEntry, BookStatus, BookNote } from '../types/books'

const READING_LOG_PATH = 'Knowledge/Research/books/reading-log.yaml'

let cachedLog: ReadingLog | null = null
let cachedSha: string | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

export async function getReadingLog(pat: string): Promise<{ log: ReadingLog; sha: string }> {
  if (cachedLog && cachedSha && Date.now() - cacheTime < CACHE_TTL) {
    return { log: cachedLog, sha: cachedSha }
  }

  const data = await request<GitContentResponse>(
    `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(READING_LOG_PATH)}?ref=main`,
    pat,
  )

  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), (c) =>
    c.charCodeAt(0),
  )
  const text = new TextDecoder('utf-8').decode(bytes)
  const log = yaml.load(text) as ReadingLog

  cachedLog = log
  cachedSha = data.sha
  cacheTime = Date.now()

  return { log, sha: data.sha }
}

export async function updateReadingLog(
  pat: string,
  log: ReadingLog,
  sha: string,
  message: string,
): Promise<string> {
  log.last_updated = new Date().toISOString().split('T')[0]

  const content = yaml.dump(log, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  })

  const encoded = btoa(
    String.fromCharCode(...new TextEncoder().encode(content)),
  )

  const res = await request<{ content: { sha: string } }>(
    `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(READING_LOG_PATH)}`,
    pat,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: encoded,
        sha,
        branch: 'main',
      }),
    },
  )

  const newSha = res.content.sha
  cachedLog = log
  cachedSha = newSha
  cacheTime = Date.now()

  return newSha
}

export async function updateBookStatus(
  pat: string,
  bookFile: string,
  newStatus: BookStatus,
): Promise<void> {
  const { log, sha } = await getReadingLog(pat)
  const book = log.books.find((b) => b.file === bookFile)
  if (!book) return

  book.status = newStatus
  await updateReadingLog(pat, log, sha, `books: ${book.title} を「${newStatus}」に更新`)
}

export async function addBookNote(
  pat: string,
  bookFile: string,
  noteText: string,
): Promise<void> {
  const { log, sha } = await getReadingLog(pat)
  const book = log.books.find((b) => b.file === bookFile)
  if (!book) return

  const note: BookNote = {
    date: new Date().toISOString().split('T')[0],
    text: noteText,
  }
  book.notes.push(note)

  await updateReadingLog(pat, log, sha, `books: ${book.title} にメモ追加`)
}

export function getBookSummaryPath(book: BookEntry, basePath: string): string {
  return `${basePath}/${book.file}`
}

export function invalidateCache(): void {
  cachedLog = null
  cachedSha = null
  cacheTime = 0
}