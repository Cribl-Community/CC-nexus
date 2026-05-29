# Split-Pane Integrations View — Plan

## Overview

Convert the integrations list + detail flow from a "navigate to full-page detail" pattern into a **split-pane layout** within `IntegrationsListPage`. Clicking a row selects it (highlighted), and a resizable splitter reveals the config panel on the right — no page navigation.

The existing `IntegrationDetailPage` route stays intact for direct URL deep-linking.

---

## Tasks

1. **Extract a shared `IntegrationConfigPanel` component**
   - Lives in `src/components/IntegrationConfigPanel.tsx`
   - Accepts `groupId`, `role`, `integrationId`, `integrationConfig` (pre-loaded config), and a `onRefresh` callback
   - Renders the header (name, role badge, enabled status) + JSON `<pre>` block
   - Reuses the same `loadIntegrationConfig` / `isIntegrationConfigEnabled` logic currently in `IntegrationDetailPage`

2. **Add a draggable `SplitPane` component**
   - Lives in `src/components/SplitPane.tsx`
   - Pure CSS + a `mousedown` drag handler — no third-party library
   - Left panel has a min-width (e.g. 320 px); right panel fills the rest
   - Drag handle is a thin vertical bar with a visible grab cursor
   - Stores split ratio in local state (starts 40 % / 60 %)

3. **Refactor `IntegrationsListPage` to use the split pane**
   - Track `selectedRow: IntegrationListEntry | null` in state (initially `null`)
   - Clicking a row sets `selectedRow` instead of calling `navigate()`
   - When `selectedRow` is non-null, render the list + `SplitPane` + `IntegrationConfigPanel`
   - Highlight the selected row with an `aria-selected` + CSS class
   - Add an "×" close button at the top of the config panel to deselect
   - Keep URL unchanged (no navigation), breadcrumb stays on the list page

4. **Update `IntegrationDetailPage`**
   - No functional changes; it remains available for direct URL access
   - Optionally reuse `IntegrationConfigPanel` internally to reduce duplication

5. **CSS additions in `App.css`**
   - `.split-pane` — flex row, full height
   - `.split-pane-left` / `.split-pane-right` — flex children with overflow
   - `.split-handle` — the draggable divider (4 px wide, hover accent color)
   - `.row-selected` — highlight style for the selected table row
   - Shrink `.table-wrap` overflow when inside the left pane so the table doesn't force horizontal scroll

---

## What stays the same

- All existing routes and URL structure
- Worker groups page
- Filter / sort logic
- `IntegrationDetailPage` (direct URL navigation still works)
- All API modules
