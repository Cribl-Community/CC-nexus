# Cribl Nexus — Integration Hub

Nexus is a [Cribl App Platform](https://docs.cribl.io/stream/app-platform/) app that gives you a unified view of every source and destination configured across all your worker groups — and lets you edit them — from a single place, without leaving Cribl Stream.

---

## What Nexus does

Managing integrations across many worker groups means hopping between group contexts, opening individual sources and destinations one by one. Nexus collapses that workflow into three screens:

| Screen | What you see |
|---|---|
| **Worker groups** | Every worker group connected to your Leader, with its worker count and a live total of configured integrations |
| **Integrations list** | All sources and destinations for a selected group — searchable, filterable by enabled/disabled, and sortable by type |
| **Integration config** | The full configuration object for any integration, rendered as an interactive collapsible JSON tree — with inline editing |

---

## Installing

1. Download the latest `cribl-nexus-x.x.x.tgz` from [Releases](../../releases).
2. In Cribl Stream, go to **Settings → App Management → Install App** and upload the `.tgz`.
3. Open the app from the app launcher — no additional configuration required.

---

## Using Nexus

### Worker groups dashboard

When you open Nexus you land on the **Worker groups** dashboard. Each row shows:

- **Worker group** — the group's display name and internal ID
- **Workers** — number of workers currently in the group
- **Integrations** — total count of sources and destinations configured for the group (loaded in the background; shows `…` while fetching)

Click or press **Enter** on any row to drill into that group's integrations.

Use the **Refresh** button at any time to reload the list from the API.

### Integrations list

The integrations list shows all sources (inputs) and destinations (outputs) for the selected worker group.

**Searching**

Type in the **Search integrations** bar to instantly filter the list by name, ID, or type. The list updates as you type — no submit needed.

**Filtering**

Use the **Show** dropdown to narrow by state:

| Option | What it shows |
|---|---|
| Enabled | Only integrations that are currently active |
| Disabled | Only integrations that have been disabled |
| All | Every integration regardless of state |

Search and the Show filter work together — only rows that match both are shown.

**Sorting**

Click the **Type** column header to cycle through sort orders: A → Z, Z → A, or back to default (insertion order).

**Viewing a config**

Click any row to open its configuration in the detail panel on the right. The first row is selected automatically when the list loads.

### Integration config

The config panel shows the raw configuration object for a single integration.

- **Enabled / Disabled badge** — reflects the integration's current state at a glance
- **Collapsible JSON tree** — expand or collapse any node to explore nested settings
- **Edit** — opens the config in an inline JSON editor (see below)
- **Refresh** — re-fetches the config from the API to pick up any changes made outside of Nexus

### Editing a config

Click **Edit** on any integration config to switch to edit mode. The JSON is loaded into a text editor where you can make changes directly.

- **Save** — validates the JSON and then persists to Cribl. The change will show as a pending commit on your Cribl instnace.
- **Cancel** — discards your edits and returns to the read-only view with no changes made.

If the JSON is malformed when you click Save, an inline error is shown and the modal does not open.

