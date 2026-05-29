import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  isIntegrationConfigEnabled,
  loadIntegrationConfig,
  type IntegrationRole,
} from '../api/integrationsApi'

type LocationState = {
  groupName?: string
  integrationName?: string
  /** Present when opening from the integrations list (same payload as the list API). */
  integrationConfig?: unknown
}

function isRole(s: string | undefined): s is IntegrationRole {
  return s === 'input' || s === 'output'
}

export default function IntegrationDetailPage() {
  const { groupId: groupIdParam, role: roleParam, integrationId: idParam } =
    useParams()
  const groupId = groupIdParam ? decodeURIComponent(groupIdParam) : ''
  const integrationId = idParam ? decodeURIComponent(idParam) : ''
  const role = isRole(roleParam) ? roleParam : null
  const roleInvalid = Boolean(roleParam) && !isRole(roleParam)

  const location = useLocation()
  const navState = (location.state as LocationState | null) ?? {}
  const groupName = navState.groupName
  const integrationName = navState.integrationName

  const [config, setConfig] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(
    async (forceNetwork: boolean) => {
      if (roleInvalid) {
        setError('Integration role must be "input" (source) or "output" (destination).')
        setLoading(false)
        return
      }
      if (!groupId || !integrationId || !role) {
        setError('Missing route parameters.')
        setLoading(false)
        return
      }

      const ls = (location.state as LocationState | null) ?? {}
      if (!forceNetwork && ls.integrationConfig !== undefined) {
        setConfig(ls.integrationConfig)
        setError(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        setConfig(await loadIntegrationConfig(groupId, role, integrationId))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
        setConfig(null)
      } finally {
        setLoading(false)
      }
    },
    [groupId, integrationId, role, roleInvalid, location.state],
  )

  useEffect(() => {
    void load(false)
  }, [load])

  const groupTitle = groupName ?? groupId
  const listPath = `/group/${encodeURIComponent(groupId)}/integrations`
  const listState = { groupName }

  const json =
    config !== null && config !== undefined
      ? JSON.stringify(config, null, 2)
      : ''

  const configEnabled =
    config !== null && config !== undefined
      ? isIntegrationConfigEnabled(config)
      : null

  return (
    <div className="dashboard">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Worker groups</Link>
        <span className="breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <Link to={listPath} state={listState}>
          {groupTitle}
        </Link>
        <span className="breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="breadcrumb-current">
          {integrationName ?? integrationId}
        </span>
      </nav>

      <header className="dashboard-header">
        <div>
          <h1>Integration config</h1>
          <p className="dashboard-sub">
            {role === 'input' ? 'Source' : 'Destination'} ·{' '}
            <code className="type-tag">{integrationId}</code>
            {configEnabled !== null ? (
              <>
                {' '}
                <span
                  className={
                    configEnabled ? 'badge badge-enabled' : 'badge badge-disabled'
                  }
                >
                  {configEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </>
            ) : null}
          </p>
        </div>
        <button type="button" className="refresh" onClick={() => void load(true)}>
          Refresh
        </button>
      </header>

      {error ? (
        <div className="panel error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="muted">Loading configuration…</p>
      ) : (
        <pre className="config-json" tabIndex={0}>
          {json}
        </pre>
      )}
    </div>
  )
}
