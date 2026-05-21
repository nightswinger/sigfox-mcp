# Sigfox MCP

An MCP server (stdio transport) that wraps the Sigfox cloud API (`https://api.sigfox.com/v2`) and exposes endpoints as tools. Auth is HTTP Basic with a Sigfox API login/password (CLI flags `--login`/`--password` or env vars `SIGFOX_LOGIN`/`SIGFOX_PASSWORD`).

## Commands

- `pnpm build` — `tsc` typecheck + emit to `dist/`. Use this to verify a change compiles.
- `pnpm dev` — `tsx --watch src/index.ts` for local iteration with credentials in env.
- `pnpm build:mcpb` — produce the distributable `.mcpb` bundle via [scripts/build-mcpb.ts](scripts/build-mcpb.ts).
- No test suite exists. Manual verification via an MCP client is the bar.

## Architecture

Three layers, kept separate by design:

1. **Client** ([src/client/](src/client/)) — `SigfoxAPIClient` in [client.ts](src/client/client.ts) owns HTTP. Private `request<T>(path, queryParams)` builds the URL, attaches the Basic auth header, parses JSON, and throws on non-2xx. One method per Sigfox endpoint. Types in [types.ts](src/client/types.ts) mirror the API response shapes (timestamps stay as numeric epoch ms here — do not convert at this layer).
2. **Tools** ([src/tools/sigfox/](src/tools/sigfox/)) — one file per tool. Each tool defines `inputSchema` / `outputSchema` (zod), `toolConfig`, and a `callback` that calls a client method and shapes the response. Built with `createTool()` from [factory.ts](src/tools/factory.ts).
3. **Server** ([src/index.ts](src/index.ts)) — registers every tool from the `tools` array in [src/tools/index.ts](src/tools/index.ts) onto an `McpServer` connected via `StdioServerTransport`. Startup logs go to **stderr** (stdout is reserved for the MCP protocol).

The OpenAPI spec at [docs/openapi.json](docs/openapi.json) is the source of truth for endpoint shapes, parameters, and field semantics — consult it when adding or modifying tools.

## Conventions

- **Tool naming:** `sigfox-<verb>-<noun>`. Use `list-` for collection endpoints, `get-` for single-resource endpoints (see existing tools).
- **Timestamps:** the API returns epoch ms as integers. Keep them numeric in client types; convert to ISO 8601 strings in the tool layer via `new Date(value).toISOString()` (mirror [get-device.ts:58-61](src/tools/sigfox/get-device.ts#L58)).
- **Callback return shape:** every tool returns `{ structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }`. Both fields hold the same payload.
- **Query param construction:** in client methods, build a `Record<string, string>` and only set keys whose options are defined — gate optional booleans with `!== undefined` and stringify with `String(...)` (see [client.ts:89-103](src/client/client.ts#L89)).
- **`deep` defaults:** for list endpoints that accept `deep`, default to `true` in the client so nested refs come back unless the caller opts out.
- **Zod descriptions:** every schema field gets a `.describe(...)` — these are surfaced to the LLM as input/output documentation. Include enum value meanings (e.g. `state: 0=OK, 1=DEAD, ...`) where the API uses integer codes.

## Adding a new tool (checklist)

1. Look up the endpoint in [docs/openapi.json](docs/openapi.json) for parameters and response schema.
2. Add request options + response types to [src/client/types.ts](src/client/types.ts). Reuse `Paging` for paginated responses.
3. Add a client method to [src/client/client.ts](src/client/client.ts) following the `Record<string, string>` query-param pattern.
4. Create a tool file in [src/tools/sigfox/](src/tools/sigfox/) modeled on an existing one (`list-*` mirrors [list-device-types.ts](src/tools/sigfox/list-device-types.ts); single-resource `get-*` mirrors [get-device.ts](src/tools/sigfox/get-device.ts)).
5. Register the tool in the `tools` array in [src/tools/index.ts](src/tools/index.ts).
6. Add a row to the tools table in [README.md](README.md).
7. Run `pnpm build` to typecheck.

## Imports

- ESM with `.js` extensions in import specifiers (TypeScript-style). The package is `"type": "module"`.
- Prefer `import type` for type-only imports — the existing files do this consistently.
