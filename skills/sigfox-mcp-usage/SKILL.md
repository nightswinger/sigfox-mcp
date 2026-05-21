---
name: sigfox-mcp-usage
description: Use the sigfox-mcp tools to query a Sigfox IoT fleet — list and inspect devices, read device messages, browse device types, and check Sigfox global coverage. Activate when the user asks about Sigfox devices, messages, fleet status, or coverage.
---

# sigfox-mcp Usage

The sigfox-mcp server wraps the Sigfox v2 cloud API and exposes five read-only
tools. This skill explains when to reach for each one, the non-obvious input
rules, what the responses mean, and how to chain the tools for common fleet
questions.

## When to use this skill

Activate when the user wants to:

- Look up information about a Sigfox device (`"what's the state of device ABC123?"`).
- Read messages a device has emitted (`"show me the last 24h of messages from device ABC123"`).
- Find or filter devices across a fleet (`"which devices in group X look dead?"`).
- Browse device types (`"list all device types whose name starts with 'tracker'"`).
- Check whether a geographic point has Sigfox coverage (`"is this lat/lng covered?"`).

## The 5 tools at a glance

| Tool | Purpose | Required inputs |
|---|---|---|
| `sigfox-list-devices` | Filter/paginate devices in the fleet | (all optional) |
| `sigfox-get-device` | Detailed info for one device | `deviceId` |
| `sigfox-get-device-messages` | Paginated messages from a device | `deviceId` |
| `sigfox-list-device-types` | Filter/paginate device types | (all optional) |
| `sigfox-get-coverage-predictions` | Sigfox global coverage at a location | `lat`, `lng` |

All five are read-only — there's no way to provision, mutate, or send a
downlink from this server.

## Per-tool reference

### `sigfox-list-devices`

Returns `{ data: Device[], paging }`. Filters are all optional and combinable.

Key inputs and gotchas:

- `id`, `groupIds`, `minId`, `maxId` are **hexadecimal** Sigfox identifiers.
  `groupIds` accepts a comma-separated list.
- `sort` syntax is `field` (ascending) or `-field` (descending), e.g.
  `"-id"`. `minId` / `maxId` only work when `sort` is `id` or `-id`.
- `deep` defaults to `true`. When true, the response includes nested
  `deviceType`, `group`, and `contract` objects, and `groupIds` walks
  sub-groups. Pass `false` for a flatter, smaller response.
- `limit` / `offset` for pagination.

Example:

```json
{
  "groupIds": "5a1b2c3d4e5f6789abcdef01",
  "sort": "-lastCom",
  "limit": 50
}
```

### `sigfox-get-device`

Returns one Device by id. Only `deviceId` (hex) is required.

- `fields` is a comma-separated list of extra fields to opt into beyond the
  defaults — most users won't need it.

Example:

```json
{ "deviceId": "1A2B3C" }
```

### `sigfox-get-device-messages`

Returns `{ data: DeviceMessage[], paging }`.

Critical inputs:

- **`since` and `before` are epoch milliseconds**, not ISO strings. Convert
  human dates first, e.g. `Date.parse('2026-05-01T00:00:00Z')` or
  `Date.now() - 7 * 86400000` for "last 7 days".
- `limit` defaults to 100.
- `offset` accepts 0–40000.
- `fields` opts into extras: `oob`, `ackRequired`, `device(name)`,
  `rinfos(cbStatus,rep,repetitions,baseStation(name))`,
  `downlinkAnswerStatus(baseStation(name))`.

Per-message payload notes:

- `data` is the **hex-encoded** raw payload. Decoding requires knowledge of
  the device type's `payloadConfig` (get it from `sigfox-list-device-types`).
- `time` in each message is epoch milliseconds.
- `rinfos[*].rssi` is a string in dBm. `lqi` is an enum (see below).
- `computedLocation` is present only if the contract has the atlas/geolocation
  option enabled.

Example — "last 24h of messages from device ABC123":

```json
{
  "deviceId": "ABC123",
  "since": 1747785600000,
  "limit": 100
}
```

### `sigfox-list-device-types`

Returns `{ data: DeviceType[], paging }`.

- `name` is a **case-insensitive prefix match**, not full-text. Searching
  `"track"` matches `"Tracker-v2"` but not `"GPS-tracker"`.
- `groupIds`, `contractId` for scoping.
- `sort` allowed values: `name`, `-name`, `id`, `-id`.
- `deep` defaults to `true`, populating nested `group` and `contract` refs.

Use this to translate a human-friendly device-type name into the `id` you
need for `sigfox-list-devices`' `deviceTypeId` filter.

### `sigfox-get-coverage-predictions`

Returns `{ locationCovered: boolean, margins: number[] }`.

- `lat` and `lng` are required decimal degrees.
- `radius` (meters) defaults to **300**; increase to average over a larger
  area.
- `groupId` lets you include a private operator linked to that group in the
  global coverage estimate.
- `margins` is a 3-element array of dB margins for redundancy levels 1, 2,
  and 3. Larger = stronger coverage. `locationCovered` is the boolean roll-up.

This tool answers about **locations**, not devices.

Example:

```json
{ "lat": 48.8566, "lng": 2.3522, "radius": 500 }
```

## Output timestamp convention

The underlying Sigfox API returns epoch milliseconds, but every timestamp the
MCP tools surface (e.g. `lastCom`, `creationTime`, `activationTime`,
`lastEditionTime`) is converted to an **ISO 8601 string** before being
returned. The single exception is **inside `sigfox-get-device-messages`
payloads** — message `time` and `cbStatus.time` come through untouched as
epoch ms.

Mirror this asymmetry when answering the user: `Date` objects can be built
directly from the ISO strings, but message `time` values need
`new Date(ms)`.

## Enum cheatsheet

The Sigfox API encodes most categorical fields as integers. The tools pass
them through as-is; translate them when summarising results for the user.

**Device `state`** — overall lifecycle:

| Code | Meaning |
|---|---|
| 0 | OK |
| 1 | DEAD |
| 2 | OFF_CONTRACT |
| 3 | DISABLED |
| 5 | DELETED |
| 6 | SUSPENDED |
| 7 | NOT_ACTIVABLE |

**Device `comState`** — recent communication health:

| Code | Meaning |
|---|---|
| 0 | NO |
| 1 | OK |
| 3 | RED |
| 4 | N/A |
| 5 | NOT_SEEN |

**`lqi`** / **`lqiRepeaters`** — link quality:

| Code | Meaning |
|---|---|
| 0 | LIMIT |
| 1 | AVERAGE |
| 2 | GOOD |
| 3 | EXCELLENT |
| 4 | NA |

**`automaticRenewalStatus`**:

| Code | Meaning |
|---|---|
| 0 | ALLOWED |
| 1 | NOT_ALLOWED |
| 2 | RENEWED |
| 3 | ENDED |

**Device type `downlinkMode`**:

| Code | Meaning |
|---|---|
| 0 | DIRECT |
| 1 | CALLBACK |
| 2 | NONE |
| 3 | MANAGED |

**Device type `payloadType`**:

| Code | Meaning |
|---|---|
| 0 | Regular (no payload) |
| 2 | Custom grammar |
| 3 | Geolocation |
| 4 | Display in ASCII |
| 5 | Radio planning frame |
| 6 | Sensitv2 |

**`computedLocation.source`**:

| Code | Meaning |
|---|---|
| 0 | RSSI/station (legacy) |
| 1 | GPS payload |
| 2 | Network |
| 3 | PoI |
| 4 | HD Network |
| 5 | Private DB |
| 6 | WiFi |
| 7 | Proximity |

**Base-station `resourceType`** (inside `rinfos[*].baseStation` and
`downlinkAnswerStatus.baseStation`):

| Code | Meaning |
|---|---|
| 0 | SBS |
| 1 | NAP |

## Common workflows

**"Recent activity from device X"**

1. `sigfox-get-device` with `{ "deviceId": "X" }` → confirms it exists, shows
   `state`, `comState`, `lastCom`.
2. `sigfox-get-device-messages` with `{ "deviceId": "X", "since": Date.now() - 7 * 86400000 }`
   for the last 7 days.
3. Translate `state` / `lqi` codes and ISO `lastCom` into prose for the user.

**"Which devices in group X look dead?"**

1. `sigfox-list-devices` with `{ "groupIds": "X", "limit": 100 }` — `deep=true`
   default also pulls in sub-groups.
2. Page through with `offset += limit` until `paging.next` is empty.
3. Flag devices with `state` ∈ {1 (DEAD), 5 (DELETED), 6 (SUSPENDED)} or with
   `lastCom` older than the user's threshold.

**"All devices of a given device type"**

1. `sigfox-list-device-types` with `{ "name": "tracker" }` (prefix match) to
   find the device-type `id`.
2. `sigfox-list-devices` with `{ "deviceTypeId": "<id>" }`.

**"Is this site covered?"**

1. `sigfox-get-coverage-predictions` with `{ "lat": …, "lng": … }`. Add
   `radius` for an area average; add `groupId` to count a private operator.
2. Report `locationCovered` and translate `margins` (dB at redundancy
   levels 1/2/3) — e.g. "covered with ~14 dB margin at redundancy 1, ~6 dB at
   redundancy 3".

**Decoding a payload**

1. `sigfox-get-device` → grab the device's `deviceType.id` (only present if
   `deep=true` on a list call; `get-device` doesn't include it, so use
   `sigfox-list-devices` with `{ "id": "<deviceId>" }` instead when you need
   the device-type pointer).
2. `sigfox-list-device-types` filtered to that id (or by name) to read
   `payloadType` and `payloadConfig`.
3. Apply that config to the hex `data` from `sigfox-get-device-messages`.

## Pagination

Every list endpoint returns `{ data, paging }` where `paging.next` is a
Sigfox-internal URL string when more pages exist.

- **Do not** try to call `paging.next` directly — the MCP tools don't accept
  URLs.
- **Do** pass the *same filters* on the next call and bump `offset` by
  `limit` (or rely on `minId`/`maxId` for id-sorted listings).
- `sigfox-get-device-messages` caps `offset` at 40000; for older messages,
  narrow the range with `before`.

## Common pitfalls

- Passing an ISO string to `since` / `before` of
  `sigfox-get-device-messages`. Both are **epoch milliseconds**.
- Using a decimal device id. Sigfox identifiers are **hexadecimal** strings.
- Setting `deep: false` and then being surprised that `deviceType`, `group`,
  and `contract` are missing from the response.
- Asking `sigfox-get-coverage-predictions` whether a *device* is covered.
  It only answers about a `lat`/`lng` point.
- Forgetting that `sigfox-list-device-types`' `name` filter is a prefix
  match — `"v2"` will not match `"Tracker-v2"`.
- Trying to decode message `data` without first looking up the device type's
  `payloadConfig`.
