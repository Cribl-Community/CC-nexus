import {
  criblGet,
  extractObjectList,
  strField,
  type UnknownRecord,
} from './criblClient'

export type WorkerGroupRow = {
  id: string
  name: string
  workerCount: number
  /** Filled after the main table loads; matches integrations list length for this group. */
  integrationCount?: number
  integrationCountFailed?: boolean
}

function workerGroupId(worker: UnknownRecord): string {
  return strField(worker, ['group', 'workerGroup', 'configGroup', 'groupId'])
}

/** Edge / fleet groups (not Stream worker groups). */
function isFleetGroup(g: UnknownRecord): boolean {
  const t = strField(g, ['type'])
  if (t === 'edge') return true
  if (g.fleet === true || g.isFleet === true) return true
  const kind = strField(g, ['groupKind', 'kind'])
  if (kind.toLowerCase() === 'fleet') return true
  return false
}

/** Outpost groups (bulk-managed Outposts; not Stream worker groups). */
function isOutpostGroup(g: UnknownRecord): boolean {
  const t = strField(g, ['type'])
  if (t === 'outpost') return true
  if (g.outpost === true || g.isOutpost === true || g.is_outpost === true) return true
  const kind = strField(g, ['groupKind', 'kind'])
  if (kind.toLowerCase() === 'outpost') return true
  return false
}

function isWorkerGroupEntry(g: UnknownRecord): boolean {
  const id = strField(g, ['id'])
  if (id === 'default_search') return false
  if (isFleetGroup(g)) return false
  if (isOutpostGroup(g)) return false
  const t = strField(g, ['type'])
  if (t === 'search' || t === 'lake_access' || t === 'local_search') return false
  return true
}

function groupDisplayName(g: UnknownRecord): string {
  const name = strField(g, ['name', 'title'])
  const id = strField(g, ['id'])
  return name || id || '—'
}

export async function loadWorkerGroupDashboardRows(): Promise<WorkerGroupRow[]> {
  const [groupsPayload, workersPayload] = await Promise.all([
    criblGet<unknown>('/master/groups'),
    criblGet<unknown>('/master/workers'),
  ])

  const groupList = extractObjectList(groupsPayload).filter(isWorkerGroupEntry)
  const workers = extractObjectList(workersPayload)

  const workerCountByGroup = new Map<string, number>()
  for (const w of workers) {
    const gid = workerGroupId(w)
    if (!gid) continue
    workerCountByGroup.set(gid, (workerCountByGroup.get(gid) ?? 0) + 1)
  }

  const rows: WorkerGroupRow[] = []
  for (const g of groupList) {
    const id = strField(g, ['id'])
    if (!id) continue
    rows.push({
      id,
      name: groupDisplayName(g),
      workerCount: workerCountByGroup.get(id) ?? 0,
    })
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  return rows
}
