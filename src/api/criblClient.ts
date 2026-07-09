import { getCriblApiUrl } from '../criblEnv'

export type UnknownRecord = Record<string, unknown>

export function asRecord(v: unknown): UnknownRecord | null {
  return v !== null && typeof v === 'object' ? (v as UnknownRecord) : null
}

export async function criblGet<T = unknown>(path: string): Promise<T> {
  const base = getCriblApiUrl().replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cribl API ${res.status} ${res.statusText}${text ? `: ${text.slice(0, 200)}` : ''}`)
  }
  return res.json() as Promise<T>
}

export async function criblPatch<T = unknown>(path: string, body: unknown): Promise<T> {
  const base = getCriblApiUrl().replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cribl API ${res.status} ${res.statusText}${text ? `: ${text.slice(0, 200)}` : ''}`)
  }
  return res.json() as Promise<T>
}

/** Arrays, `{ items: [...] }`, `{ groups: [...] }`, or a map of id -> config. */
export function extractObjectList(payload: unknown): UnknownRecord[] {
  if (Array.isArray(payload)) {
    return payload.map((x) => asRecord(x)).filter(Boolean) as UnknownRecord[]
  }
  const o = asRecord(payload)
  if (!o) return []
  const items = o.items
  if (Array.isArray(items)) {
    return items.map((x) => asRecord(x)).filter(Boolean) as UnknownRecord[]
  }
  const groups = o.groups
  if (Array.isArray(groups)) {
    return groups.map((x) => asRecord(x)).filter(Boolean) as UnknownRecord[]
  }
  return Object.entries(o)
    .filter(([k]) => k !== 'items' && k !== 'count')
    .map(([, v]) => asRecord(v))
    .filter(Boolean) as UnknownRecord[]
}

export function strField(obj: UnknownRecord, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return ''
}
