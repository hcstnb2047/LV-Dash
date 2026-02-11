const KEY_NAME = 'lv-dash-key'
const SALT = new TextEncoder().encode('lv-dash-pat-encryption')

async function getOrCreateKey(): Promise<CryptoKey> {
  const stored = localStorage.getItem(KEY_NAME)
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
      'encrypt',
      'decrypt',
    ])
  }
  const raw = crypto.getRandomValues(new Uint8Array(32))
  localStorage.setItem(KEY_NAME, btoa(String.fromCharCode(...raw)))
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ])
}

export async function encryptPAT(pat: string): Promise<string> {
  const key = await getOrCreateKey()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(pat)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: SALT },
    key,
    encoded,
  )
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length)
  combined.set(iv)
  combined.set(new Uint8Array(encrypted), iv.length)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptPAT(stored: string): Promise<string | null> {
  try {
    const key = await getOrCreateKey()
    const combined = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, additionalData: SALT },
      key,
      data,
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}
