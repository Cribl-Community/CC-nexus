import { useState } from 'react'
import './JsonViewer.css'

// ── Primitive value renderer ─────────────────────────────────

function JsonPrimitive({ value }: { value: unknown }) {
  if (value === null) return <span className="json-null">null</span>
  if (typeof value === 'string')
    return <span className="json-string">&quot;{value}&quot;</span>
  if (typeof value === 'number')
    return <span className="json-number">{String(value)}</span>
  if (typeof value === 'boolean')
    return <span className="json-boolean">{String(value)}</span>
  return <span>{String(value)}</span>
}

// ── Recursive node ───────────────────────────────────────────

interface NodeProps {
  value: unknown
  keyName?: string
  depth: number
  isLast: boolean
}

function JsonNode({ value, keyName, depth, isLast }: NodeProps) {
  const isObject =
    value !== null && typeof value === 'object' && !Array.isArray(value)
  const isArray = Array.isArray(value)
  const isCollapsible = isObject || isArray
  const [open, setOpen] = useState(depth < 2)

  const entries = isObject
    ? Object.entries(value as Record<string, unknown>)
    : isArray
      ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
      : []

  const openBrace = isArray ? '[' : '{'
  const closeBrace = isArray ? ']' : '}'
  const summary = isArray
    ? `${entries.length} item${entries.length !== 1 ? 's' : ''}`
    : `${entries.length} key${entries.length !== 1 ? 's' : ''}`

  const toggle = () => setOpen((o) => !o)

  return (
    <span className="json-node">
      <span className="json-node-inner">
        {isCollapsible ? (
          <button
            type="button"
            className="json-toggle"
            onClick={toggle}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggle()
              }
            }}
            aria-expanded={open}
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? '▾' : '▸'}
          </button>
        ) : (
          <span className="json-toggle-spacer" />
        )}

        {keyName !== undefined && (
          <>
            <span className="json-key">&quot;{keyName}&quot;</span>
            <span className="json-colon">:</span>
          </>
        )}

        {isCollapsible ? (
          <>
            <span className="json-brace">{openBrace}</span>
            {!open && (
              <>
                <span className="json-summary">{summary}</span>
                <span className="json-brace">{closeBrace}</span>
                {!isLast && <span className="json-comma">,</span>}
              </>
            )}
          </>
        ) : (
          <>
            <JsonPrimitive value={value} />
            {!isLast && <span className="json-comma">,</span>}
          </>
        )}
      </span>

      {isCollapsible && open && (
        <>
          <span className="json-children">
            {entries.map(([k, v], idx) => (
              <JsonNode
                key={k}
                keyName={isArray ? undefined : k}
                value={v}
                depth={depth + 1}
                isLast={idx === entries.length - 1}
              />
            ))}
          </span>
          <span className="json-node-inner">
            <span className="json-toggle-spacer" />
            <span className="json-brace">{closeBrace}</span>
            {!isLast && <span className="json-comma">,</span>}
          </span>
        </>
      )}
    </span>
  )
}

// ── Public component ─────────────────────────────────────────

interface Props {
  data: unknown
}

export default function JsonViewer({ data }: Props) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = JSON.stringify(data, null, 2)
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div className="json-viewer-root">
      <div className="json-viewer-toolbar">
        <button type="button" className="json-copy-btn" onClick={copy}>
          {copied ? 'Copied!' : 'Copy JSON'}
        </button>
      </div>
      <div className="json-viewer">
        <JsonNode value={data} depth={0} isLast={true} />
      </div>
    </div>
  )
}
