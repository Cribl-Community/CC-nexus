import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  isIntegrationEnabled,
  listIntegrationsForGroup,
  type IntegrationEnabledFilter,
  type IntegrationListEntry,
} from '../api/integrationsApi'
import IntegrationConfigPanel from '../components/IntegrationConfigPanel'
import SplitPane from '../components/SplitPane'

type LocationState = { groupName?: string }

export default function IntegrationsListPage() {
  const { groupId: groupIdParam } = useParams()
  const groupId = groupIdParam ? decodeURIComponent(groupIdParam) : ''
  const location = useLocation()
  const groupName = (location.state as LocationState | null)?.groupName

  const [rows, setRows] = useState<IntegrationListEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enabledFilter, setEnabledFilter] =
    useState<IntegrationEnabledFilter>('enabled')
  const [typeSortDir, setTypeSortDir] = useState<'asc' | 'desc' | null>(null)
  const [selected, setSelected] = useState<IntegrationListEntry | null>(null)

  const refresh = useCallback(async () => {
    if (!groupId) return
    setLoading(true)
    setError(null)
    try {
      const data = await listIntegrationsForGroup(groupId)
      setRows(data)
      setSelected((prev) => prev ?? data[0] ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setRows(null)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    setTypeSortDir(null)
    setSelected(null)
  }, [groupId])

  const title = groupName ?? groupId

  const filteredRows = useMemo(() => {
    if (!rows) return []
    if (enabledFilter === 'all') return rows
    return rows.filter((r) => {
      const on = isIntegrationEnabled(r)
      return enabledFilter === 'enabled' ? on : !on
    })
  }, [rows, enabledFilter])

  const displayRows = useMemo(() => {
    const list = [...filteredRows]
    if (typeSortDir === null) return list
    list.sort((a, b) => {
      const cmp = a.type.localeCompare(b.type, undefined, {
        sensitivity: 'base',
        numeric: true,
      })
      return typeSortDir === 'asc' ? cmp : -cmp
    })
    return list
  }, [filteredRows, typeSortDir])

  function cycleTypeSort() {
    setTypeSortDir((prev) => {
      if (prev === null) return 'asc'
      if (prev === 'asc') return 'desc'
      return null
    })
  }

  function selectRow(r: IntegrationListEntry) {
    setSelected(r)
  }

  const table = (
    <div className="list-pane">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th
                scope="col"
                aria-sort={
                  typeSortDir === 'asc'
                    ? 'ascending'
                    : typeSortDir === 'desc'
                      ? 'descending'
                      : 'none'
                }
              >
                <button
                  type="button"
                  className="th-sort"
                  onClick={cycleTypeSort}
                  title="Sort by type (click to change order)"
                  aria-label={
                    typeSortDir === null
                      ? 'Sort by type: not sorted. Activate for A to Z'
                      : typeSortDir === 'asc'
                        ? 'Sort by type: A to Z. Activate for Z to A'
                        : 'Sort by type: Z to A. Activate to clear sort'
                  }
                >
                  Type
                  <span className="th-sort-indicator" aria-hidden="true">
                    {typeSortDir === 'asc'
                      ? ' ↑'
                      : typeSortDir === 'desc'
                        ? ' ↓'
                        : ''}
                  </span>
                </button>
              </th>
              <th scope="col">Role</th>
            </tr>
          </thead>
          <tbody>
            {loading && !rows?.length ? (
              <tr>
                <td colSpan={3} className="muted">
                  Loading…
                </td>
              </tr>
            ) : null}
            {!loading && rows?.length === 0 ? (
              <tr>
                <td colSpan={3} className="muted">
                  No inputs or outputs returned for this group.
                </td>
              </tr>
            ) : null}
            {!loading &&
            rows &&
            rows.length > 0 &&
            filteredRows.length === 0 ? (
              <tr>
                <td colSpan={3} className="muted">
                  No integrations match this filter. Try &quot;All&quot; to see
                  every source and destination.
                </td>
              </tr>
            ) : null}
            {displayRows.map((r) => {
              const isSelected =
                selected?.id === r.id && selected?.role === r.role
              return (
                <tr
                  key={`${r.role}-${r.id}`}
                  className={`click-row${isSelected ? ' row-selected' : ''}`}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => selectRow(r)}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault()
                      selectRow(r)
                    }
                  }}
                >
                  <td>
                    <span className="wg-name">{r.name}</span>
                    <span className="wg-id">{r.id}</span>
                    {r.disabled ? (
                      <span className="badge badge-disabled">disabled</span>
                    ) : null}
                  </td>
                  <td>
                    <code className="type-tag">{r.type}</code>
                  </td>
                  <td>{r.role === 'input' ? 'Source' : 'Destination'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="dashboard">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Worker groups</Link>
        <span className="breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb-current">{title}</span>
      </nav>

      <header className="dashboard-header">
        <div>
          <h1>Integrations</h1>
          <p className="dashboard-sub">
            Sources and destinations configured for this worker group. Select a
            row to view its configuration.
          </p>
        </div>
        <div className="header-actions">
          <div className="integrations-toolbar">
            <label htmlFor="integration-enabled-filter">Show</label>
            <select
              id="integration-enabled-filter"
              className="filter-select"
              value={enabledFilter}
              onChange={(e) =>
                setEnabledFilter(e.target.value as IntegrationEnabledFilter)
              }
              aria-label="Filter by enabled or disabled integrations"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              <option value="all">All</option>
            </select>
          </div>
          <button
            type="button"
            className="refresh"
            onClick={() => void refresh()}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error ? (
        <div className="panel error" role="alert">
          {error}
        </div>
      ) : null}

      {selected ? (
        <SplitPane
          left={table}
          right={
            <IntegrationConfigPanel
              key={`${selected.role}-${selected.id}`}
              groupId={groupId}
              role={selected.role}
              integrationId={selected.id}
              integrationName={selected.name}
              initialConfig={selected.config}
            />
          }
        />
      ) : (
        table
      )}
    </div>
  )
}
