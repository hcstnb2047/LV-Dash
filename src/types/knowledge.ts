export type KnowledgeCategory = 'report' | 'book' | 'note' | 'topic' | 'webclip'

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory | 'all', string> = {
  all: '全て',
  report: 'レポート',
  book: 'ブック',
  note: 'ノート',
  topic: 'トピック',
  webclip: 'ウェブクリップ',
}

export interface KnowledgeFile {
  path: string
  name: string
  displayName: string
  category: KnowledgeCategory
  date: string | null
  sha: string
}

export interface KnowledgeSearchResult {
  path: string
  name: string
  displayName: string
  category: KnowledgeCategory | null
  textMatches: string[]
}

// GitHub API response types

export interface GitTreeResponse {
  sha: string
  tree: GitTreeEntry[]
  truncated: boolean
}

export interface GitTreeEntry {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
}

export interface GitContentResponse {
  content: string
  encoding: string
  size: number
  sha: string
}

export interface GitSearchResponse {
  total_count: number
  items: GitSearchItem[]
}

export interface GitSearchItem {
  name: string
  path: string
  sha: string
  html_url: string
  text_matches?: Array<{
    fragment: string
    matches: Array<{ text: string; indices: number[] }>
  }>
}
