# JSON Viewer Component — Plan

## Approach

Build a **custom lightweight recursive JSON tree viewer** rather than pulling in a library.
This keeps the bundle small and lets us use the app's existing CSS variables for theming
(including dark mode support) without fighting a third-party stylesheet.

---

## What it will look like

- Collapsible objects `{}` and arrays `[]` with a toggle arrow
- Objects collapsed show `{ 3 keys }`, arrays show `[ 5 items ]`
- All nodes expanded by default (up to a reasonable depth)
- Syntax-colored primitives:
  - Strings → green
  - Numbers → blue
  - Booleans → orange
  - `null` → gray/muted
- Key names styled distinctly from values
- A **Copy JSON** button at the root level

---

## Tasks

1. **`src/components/JsonViewer.tsx`** — recursive React component
   - `JsonNode` handles objects, arrays, and primitives
   - Local `useState` per node for expand/collapse
   - Keyboard accessible (Enter/Space to toggle)

2. **`src/components/JsonViewer.css`** — syntax highlight styles
   - Uses CSS variables so dark mode works automatically

3. **Update `IntegrationConfigPanel`** — swap the `<pre>` block for `<JsonViewer>`

---

## What stays the same

- All existing routes, pages, and API modules
- The `<pre>` fallback in `IntegrationDetailPage` (direct URL view) — can update that too if you like
