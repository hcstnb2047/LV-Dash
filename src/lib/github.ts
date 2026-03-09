export const OWNER = 'hcstnb2047'
export const DATA_REPO = 'life-data'
export const BASE = 'https://api.github.com'

export class GitHubAPIError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubAPIError'
    this.status = status
  }
}

export async function request<T>(
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
