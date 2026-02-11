import type { Workflow, WorkflowRun } from '../types'

const OWNER = 'hcstnb2047'
const REPO = 'LifeVault'
const BASE = 'https://api.github.com'

export class GitHubAPIError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubAPIError'
    this.status = status
  }
}

async function request<T>(
  path: string,
  pat: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    if (res.status === 401) throw new GitHubAPIError(401, 'PATが無効です')
    if (res.status === 403) throw new GitHubAPIError(403, 'APIレート制限に達しました')
    throw new GitHubAPIError(res.status, `API エラー: ${res.status}`)
  }
  if (res.status === 204) return {} as T
  return res.json()
}

export async function validatePAT(pat: string): Promise<boolean> {
  try {
    await request('/user', pat)
    return true
  } catch {
    return false
  }
}

export async function listWorkflows(pat: string): Promise<Workflow[]> {
  const data = await request<{ workflows: Workflow[] }>(
    `/repos/${OWNER}/${REPO}/actions/workflows?per_page=50`,
    pat,
  )
  return data.workflows.filter(
    (w) => w.state === 'active' || w.state === 'disabled_manually',
  )
}

export async function getWorkflowRuns(
  pat: string,
  workflowId: number,
  count = 3,
): Promise<WorkflowRun[]> {
  const data = await request<{ workflow_runs: WorkflowRun[] }>(
    `/repos/${OWNER}/${REPO}/actions/workflows/${workflowId}/runs?per_page=${count}`,
    pat,
  )
  return data.workflow_runs
}

export async function dispatchWorkflow(
  pat: string,
  workflowId: string,
  inputs: Record<string, string> = {},
): Promise<void> {
  await request(
    `/repos/${OWNER}/${REPO}/actions/workflows/${workflowId}/dispatches`,
    pat,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'main', inputs }),
    },
  )
}

export async function getLatestRunAfterDispatch(
  pat: string,
  workflowId: number,
  dispatchedAt: Date,
  maxRetries = 3,
): Promise<WorkflowRun | null> {
  for (let i = 0; i < maxRetries; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const runs = await getWorkflowRuns(pat, workflowId, 1)
    if (runs.length > 0) {
      const run = runs[0]
      if (new Date(run.created_at) >= dispatchedAt) return run
    }
  }
  return null
}
