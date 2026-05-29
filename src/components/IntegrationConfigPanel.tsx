import { useCallback, useEffect, useState } from 'react'
import {
  isIntegrationConfigEnabled,
  loadIntegrationConfig,
  type IntegrationRole,
} from '../api/integrationsApi'

interface Props {
  groupId: string
  role: IntegrationRole
  integrationId: string
  integrationName?: string
  /** Pre-loaded config from the list payload — avoids an extra fetch. */
  initialConfig?: unknown
}

export default function IntegrationConfigPanel({
  groupId,
  role,
  integrationId,
  integrationName,
  initialConfig,
}: Props) {
  const [config, setConfig] = useState<unknown>(initialConfig ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(initialConfig === undefined)

  const load = useCallback(
    async () => {
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
    [groupId, role, integrationId],
  )

  useEffect(() => {
    if (initialConfig === undefined) {
      void load()
    }
  }, [initialConfig, load])

  const json =
    config !== null && config !== undefined
      ? JSON.stringify(config, null, 2)
      : ''

  const configEnabled =
    config !== null && config !== undefined
      ? isIntegrationConfigEnabled(config)
      : null

  return (
    <div className="config-panel">
      <div className="config-panel-header">
        <div className="config-panel-title">
          <span className="config-panel-name">
            {integrationName ?? integrationId}
          </span>
          <span className="config-panel-meta">
            {role === 'input' ? 'Source' : 'Destination'} ·{' '}
            <code className="type-tag">{integrationId}</code>
            {configEnabled !== null ? (
              <span
                className={
                  configEnabled ? 'badge badge-enabled' : 'badge badge-disabled'
                }
              >
                {configEnabled ? 'Enabled' : 'Disabled'}
              </span>
            ) : null}
          </span>
        </div>
        <button
          type="button"
          className="refresh"
          onClick={() => void load()}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

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
