import { request, OWNER, REPO, BASE } from './github'
import type {
  GitTreeResponse,
  GitContentResponse,
  GitSearchResponse,
  KnowledgeFile,
  KnowledgeCategory,
  KnowledgeSearchResult,
} from '../types/knowledge'

function categorizeFile(path: string): KnowledgeCategory | null {
  if (path.startsWith('Knowledge/Research/')) return 'report'
  if (path.startsWith('Knowledge/Books/')) return 'book'
  if (path.startsWith('Knowledge/Notes/')) return 'note'
  if (path.startsWith('Knowledge/Topics/')) return 'topic'
  if (path.startsWith('Knowledge/WebClips/')) return 'webclip'
  return null
}

function parseDateFromFilename(filename: string): string | null {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})\.md$/)
  return match ? match[1] : null
}

function getDisplayName(filename: string): string {
  let name = filename.replace(/\.md$/, '')
  name = name.replace(/^\d{4}-\d{2}-\d{2}[_-]?/, '')
  return name || filename.replace(/\.md$/, '')
}

export async function getKnowledgeTree(pat: string): Promise<KnowledgeFile[]> {
  const data = await request<GitTreeResponse>(
    `/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`,
    pat,
  )

  return data.tree
    .filter(
      (entry) =>
        entry.type === 'blob' &&
        entry.path.startsWith('Knowledge/') &&
        entry.path.endsWith('.md') &&
        !entry.path.startsWith('Knowledge/prompts/'),
    )
    .map((entry) => {
      const name = entry.path.split('/').pop()!
      const category = categorizeFile(entry.path)
      if (!category) return null
      return {
        path: entry.path,
        name,
        displayName: getDisplayName(name),
        category,
        date: parseDateFromFilename(name),
        sha: entry.sha,
      }
    })
    .filter((f): f is KnowledgeFile => f !== null)
    .sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date)
      if (a.date && !b.date) return -1
      if (!a.date && b.date) return 1
      return a.displayName.localeCompare(b.displayName)
    })
}

export async function getFileContent(
  pat: string,
  path: string,
): Promise<string> {
  const data = await request<GitContentResponse>(
    `/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}?ref=main`,
    pat,
  )
  const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), (c) =>
    c.charCodeAt(0),
  )
  return new TextDecoder('utf-8').decode(bytes)
}

export async function searchKnowledge(
  pat: string,
  query: string,
): Promise<{ results: KnowledgeSearchResult[]; rateLimitRemaining: number }> {
  const q = encodeURIComponent(`${query} repo:${OWNER}/${REPO} path:Knowledge extension:md`)
  const res = await fetch(`${BASE}/search/code?q=${q}`, {
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github.text-match+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  const rateLimitRemaining = parseInt(
    res.headers.get('X-RateLimit-Remaining') ?? '30',
    10,
  )

  if (!res.ok) {
    if (res.status === 403) {
      return { results: [], rateLimitRemaining: 0 }
    }
    throw new Error(`Search API error: ${res.status}`)
  }

  const data: GitSearchResponse = await res.json()

  const results: KnowledgeSearchResult[] = data.items.map((item) => {
    const name = item.path.split('/').pop()!
    return {
      path: item.path,
      name,
      displayName: getDisplayName(name),
      category: categorizeFile(item.path),
      textMatches:
        item.text_matches?.map((tm) => tm.fragment).slice(0, 2) ?? [],
    }
  })

  return { results, rateLimitRemaining }
}
