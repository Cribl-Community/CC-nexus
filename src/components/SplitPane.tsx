import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  left: ReactNode
  right: ReactNode
  /** Initial left-panel width as a percentage (0–100). Defaults to 40. */
  defaultSplit?: number
  /** Minimum left-panel width in pixels. Defaults to 280. */
  minLeftPx?: number
  /** Minimum right-panel width in pixels. Defaults to 300. */
  minRightPx?: number
}

export default function SplitPane({
  left,
  right,
  defaultSplit = 40,
  minLeftPx = 280,
  minRightPx = 300,
}: Props) {
  const [splitPct, setSplitPct] = useState(defaultSplit)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalWidth = rect.width
      const rawPx = e.clientX - rect.left
      const clampedPx = Math.max(
        minLeftPx,
        Math.min(rawPx, totalWidth - minRightPx),
      )
      setSplitPct((clampedPx / totalWidth) * 100)
    },
    [minLeftPx, minRightPx],
  )

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  function startDrag() {
    dragging.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div className="split-pane" ref={containerRef}>
      <div className="split-pane-left" style={{ width: `${splitPct}%` }}>
        {left}
      </div>
      <div
        className="split-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panels"
        tabIndex={0}
        onMouseDown={startDrag}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft')
            setSplitPct((p) => Math.max((minLeftPx / (containerRef.current?.offsetWidth ?? 1000)) * 100, p - 2))
          if (e.key === 'ArrowRight')
            setSplitPct((p) => Math.min(100 - (minRightPx / (containerRef.current?.offsetWidth ?? 1000)) * 100, p + 2))
        }}
      />
      <div className="split-pane-right" style={{ width: `${100 - splitPct}%` }}>
        {right}
      </div>
    </div>
  )
}
