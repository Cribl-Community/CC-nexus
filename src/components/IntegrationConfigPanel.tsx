import { useCallback, useEffect, useState } from 'react'
import {
  isIntegrationConfigEnabled,
  loadIntegrationConfig,
  updateIntegrationConfig,
  type IntegrationRole,
} from '../api/integrationsApi'
import JsonViewer from './JsonViewer'

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

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
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
  }, [groupId, role, integrationId])

  useEffect(() => {
    if (initialConfig === undefined) {
      void load()
    }
  }, [initialConfig, load])

  const configEnabled =
    config !== null && config !== undefined
      ? isIntegrationConfigEnabled(config)
      : null

  function startEdit() {
    setDraft(JSON.stringify(config, null, 2))
    setParseError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setDraft('')
    setParseError(null)
  }

  async function save() {
    let parsed: unknown
    try {
      parsed = JSON.parse(draft)
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON')
      return
    }
    setParseError(null)
    setSaving(true)
    try {
      const updated = await updateIntegrationConfig(groupId, role, integrationId, parsed)
      setConfig(updated ?? parsed)
      setEditing(false)
      setDraft('')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

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

        <div className="config-panel-actions">
          {editing ? (
            <>
              <button
                type="button"
                className="btn-save"
                onClick={() => void save()}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="refresh"
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn-edit"
                onClick={startEdit}
                disabled={loading || config === null || config === undefined}
              >
                Edit
              </button>
              <button
                type="button"
                className="refresh"
                onClick={() => void load()}
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div className="panel error" role="alert">
          {error}
        </div>
      ) : null}

      {editing ? (
        <div className="config-edit-wrap">
          {parseError ? (
            <div className="parse-error" role="alert">
              {parseError}
            </div>
          ) : null}
          <textarea
            className="config-edit-textarea"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (parseError) setParseError(null)
            }}
            spellCheck={false}
            aria-label="Edit integration configuration JSON"
          />
        </div>
      ) : loading ? (
        <p className="muted">Loading configuration…</p>
      ) : config !== null && config !== undefined ? (
        <JsonViewer data={config} />
      ) : null}
    </div>
  )
}
