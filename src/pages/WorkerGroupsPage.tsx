import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getIntegrationCountForGroup } from '../api/integrationsApi'
import {
  loadWorkerGroupDashboardRows,
  type WorkerGroupRow,
} from '../api/workerGroupsDashboard'

export default function WorkerGroupsPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<WorkerGroupRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshGen = useRef(0)

  const refresh = useCallback(async () => {
    const gen = ++refreshGen.current
    setLoading(true)
    setError(null)
    try {
      const base = await loadWorkerGroupDashboardRows()
      if (gen !== refreshGen.current) return
      setRows(
        base.map((r) => ({
          ...r,
          integrationCount: undefined,
          integrationCountFailed: false,
        })),
      )
      setLoading(false)

      await Promise.all(
        base.map(async (r) => {
          try {
            const count = await getIntegrationCountForGroup(r.id)
            if (gen !== refreshGen.current) return
            setRows((prev) =>
              prev?.map((row) =>
                row.id === r.id
                  ? { ...row, integrationCount: count, integrationCountFailed: false }
                  : row,
              ) ?? null,
            )
          } catch {
            if (gen !== refreshGen.current) return
            setRows((prev) =>
              prev?.map((row) =>
                row.id === r.id ? { ...row, integrationCountFailed: true } : row,
              ) ?? null,
            )
          }
        }),
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setRows(null)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount fetch
    void refresh()
  }, [refresh])

  function formatIntegrationCell(r: WorkerGroupRow): string {
    if (r.integrationCountFailed) return '—'
    if (r.integrationCount === undefined) return '…'
    return String(r.integrationCount)
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Worker groups</h1>
          <p className="dashboard-sub">
            Workers connected to the Leader. Integrations counts match the sources and
            destinations list for each group. Select a row to browse integrations.
          </p>
        </div>
        <button
          type="button"
          className="refresh"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {error ? (
        <div className="panel error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Worker group</th>
              <th scope="col">Workers</th>
              <th scope="col">Integrations</th>
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
                  No worker groups returned from{' '}
                  <code>/master/groups</code>.
                </td>
              </tr>
            ) : null}
            {(rows ?? []).map((r) => (
              <tr
                key={r.id}
                className="click-row"
                tabIndex={0}
                onClick={() =>
                  navigate(`/group/${encodeURIComponent(r.id)}/integrations`, {
                    state: { groupName: r.name },
                  })
                }
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault()
                    navigate(`/group/${encodeURIComponent(r.id)}/integrations`, {
                      state: { groupName: r.name },
                    })
                  }
                }}
              >
                <td>
                  <span className="wg-name">{r.name}</span>
                  <span className="wg-id">{r.id}</span>
                </td>
                <td>{r.workerCount}</td>
                <td>{formatIntegrationCell(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
