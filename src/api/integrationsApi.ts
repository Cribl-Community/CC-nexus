import {
  criblGet,
  extractObjectList,
  strField,
  type UnknownRecord,
} from './criblClient'

export type IntegrationRole = 'input' | 'output'

export type IntegrationSummary = {
  id: string
  name: string
  type: string
  role: IntegrationRole
  disabled: boolean
}

/** One row in the integrations table; includes raw config from the list response only. */
export type IntegrationListEntry = IntegrationSummary & {
  config: unknown
}

/** True when raw input/output config is enabled (mirrors worker-group “running” logic). */
export function isIntegrationConfigEnabled(config: unknown): boolean {
  if (config === null || typeof config !== 'object') return true
  const c = config as Record<string, unknown>
  if (c.disabled === true) return false
  if (typeof c.status === 'string') {
    const s = c.status.toLowerCase()
    if (s === 'disabled' || s === 'stopped' || s === 'inactive') return false
  }
  return true
}

/** True when the integration is considered enabled (not disabled flag and not inactive status). */
export function isIntegrationEnabled(entry: IntegrationListEntry): boolean {
  return isIntegrationConfigEnabled(entry.config)
}

export type IntegrationEnabledFilter = 'enabled' | 'disabled' | 'all'

function integrationId(obj: UnknownRecord): string {
  return strField(obj, ['id'])
}

function integrationName(obj: UnknownRecord): string {
  const id = integrationId(obj)
  return strField(obj, ['name', 'title']) || id || '—'
}

function integrationType(obj: UnknownRecord): string {
  const t = strField(obj, ['type', 'output', 'input'])
  if (t) return t
  const o = obj.type
  if (typeof o === 'object' && o !== null && 'type' in o) {
    const inner = (o as { type?: unknown }).type
    if (typeof inner === 'string') return inner
  }
  return 'unknown'
}

function mapToEntries(
  items: UnknownRecord[],
  role: IntegrationRole,
): IntegrationListEntry[] {
  const out: IntegrationListEntry[] = []
  for (const item of items) {
    const id = integrationId(item)
    if (!id) continue
    out.push({
      id,
      name: integrationName(item),
      type: integrationType(item),
      role,
      disabled: item.disabled === true,
      config: item,
    })
  }
  return out
}

/** Total configured sources + destinations (same length as `listIntegrationsForGroup`). */
export async function getIntegrationCountForGroup(groupId: string): Promise<number> {
  const enc = encodeURIComponent(groupId)
  const [inputsRes, outputsRes] = await Promise.all([
    criblGet<unknown>(`/m/${enc}/system/inputs`).catch(() => null),
    criblGet<unknown>(`/m/${enc}/system/outputs`).catch(() => null),
  ])
  const inputs = inputsRes !== null ? extractObjectList(inputsRes) : []
  const outputs = outputsRes !== null ? extractObjectList(outputsRes) : []
  let n = 0
  for (const c of inputs) {
    if (integrationId(c)) n++
  }
  for (const c of outputs) {
    if (integrationId(c)) n++
  }
  return n
}

export async function listIntegrationsForGroup(
  groupId: string,
): Promise<IntegrationListEntry[]> {
  const enc = encodeURIComponent(groupId)
  const [inputsRes, outputsRes] = await Promise.all([
    criblGet<unknown>(`/m/${enc}/system/inputs`),
    criblGet<unknown>(`/m/${enc}/system/outputs`),
  ])
  const inputs = mapToEntries(extractObjectList(inputsRes), 'input')
  const outputs = mapToEntries(extractObjectList(outputsRes), 'output')
  const merged = [...inputs, ...outputs]
  merged.sort((a, b) => {
    const byName = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    if (byName !== 0) return byName
    return `${a.role}:${a.id}`.localeCompare(`${b.role}:${b.id}`)
  })
  return merged
}

export async function loadIntegrationConfig(
  groupId: string,
  role: IntegrationRole,
  integrationId: string,
): Promise<unknown> {
  const encG = encodeURIComponent(groupId)
  const encId = encodeURIComponent(integrationId)
  const collection = role === 'input' ? 'inputs' : 'outputs'
  try {
    return await criblGet(`/m/${encG}/system/${collection}/${encId}`)
  } catch {
    const payload = await criblGet<unknown>(`/m/${encG}/system/${collection}`)
    const items = extractObjectList(payload)
    const found = items.find((x) => strField(x, ['id']) === integrationId)
    if (!found) {
      throw new Error(
        `No ${collection.slice(0, -1)} with id "${integrationId}" in this worker group.`,
      )
    }
    return found
  }
}
