import { request, OWNER, DATA_REPO } from './github'

const PATHS = {
  srs: 'Profile/lv-dash/srs.json',
  notes: 'Profile/lv-dash/notes.json',
  favorites: 'Profile/lv-dash/favorites.json',
} as const

type RemoteKey = keyof typeof PATHS

export interface RemoteFile<T> {
  data: T
  sha: string
}

export async function readRemoteJson<T>(
  pat: string,
  key: RemoteKey,
): Promise<RemoteFile<T> | null> {
  try {
    const res = await request<{ content: string; sha: string }>(
      `/repos/${OWNER}/${DATA_REPO}/contents/${PATHS[key]}`,
      pat,
    )
    const text = new TextDecoder().decode(
      Uint8Array.from(atob(res.content.replace(/\n/g, '')), (c) => c.charCodeAt(0)),
    )
    return { data: JSON.parse(text) as T, sha: res.sha }
  } catch {
    return null
  }
}

export async function writeRemoteJson<T>(
  pat: string,
  key: RemoteKey,
  data: T,
  sha: string | null,
): Promise<string> {
  const json = JSON.stringify(data, null, 2)
  const content = btoa(unescape(encodeURIComponent(json)))
  const res = await request<{ content: { sha: string } }>(
    `/repos/${OWNER}/${DATA_REPO}/contents/${PATHS[key]}`,
    pat,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `chore: sync lv-dash ${key}`,
        content,
        ...(sha ? { sha } : {}),
      }),
    },
  )
  return res.content.sha
}
