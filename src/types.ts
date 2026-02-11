export type WorkflowCategory =
  | 'collect'
  | 'analysis'
  | 'reminder'
  | 'research'
  | 'iphone'
  | 'system'
  | 'uncategorized'

export const CATEGORY_LABELS: Record<WorkflowCategory, string> = {
  collect: '記録・収集',
  analysis: '分析・レポート',
  reminder: 'リマインダー',
  research: 'リサーチ',
  iphone: 'iPhone',
  system: 'システム',
  uncategorized: '未分類',
}

export interface WorkflowInput {
  name: string
  type: 'string' | 'choice' | 'boolean'
  required: boolean
  default?: string
  options?: string[]
  description?: string
}

export interface WorkflowMeta {
  fileName: string
  displayName: string
  category: WorkflowCategory
  inputs?: WorkflowInput[]
  defaultHidden?: boolean
}

export type RunStatus = 'success' | 'failure' | 'in_progress' | 'queued' | 'cancelled' | 'unknown'

export interface WorkflowRun {
  id: number
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  run_started_at?: string
  html_url: string
}

export interface Workflow {
  id: number
  name: string
  path: string
  state: string
}

export interface WorkflowState {
  workflow: Workflow
  meta: WorkflowMeta | null
  latestRuns: WorkflowRun[]
  isFavorite: boolean
  isVisible: boolean
}

export function getRunStatus(run: WorkflowRun): RunStatus {
  if (run.status === 'completed') {
    if (run.conclusion === 'success') return 'success'
    if (run.conclusion === 'failure') return 'failure'
    if (run.conclusion === 'cancelled') return 'cancelled'
    return 'unknown'
  }
  if (run.status === 'in_progress') return 'in_progress'
  if (run.status === 'queued') return 'queued'
  return 'unknown'
}
