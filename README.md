# Sigfox MCP

A Model Context Protocol (MCP) server that exposes the Sigfox cloud API as tools. It lets an LLM look up Sigfox device metadata and recent uplink messages on behalf of the user. Authenticates with a Sigfox API access (login / password) credential pair.

This is an unofficial community project. It is not affiliated with or endorsed by Sigfox or UnaBiz.

## Installation

Both methods need a **Sigfox API Login** and **Sigfox API Password**, issued from the Sigfox backend (**Group → API access**).

### npx (any MCP client)

The server is published to npm as [`sigfox-mcp`](https://www.npmjs.com/package/sigfox-mcp) and runs with `npx`. It requires Node.js 22 or later.

For Claude Code:

```bash
claude mcp add --transport stdio --env SIGFOX_LOGIN=<login> --env SIGFOX_PASSWORD=<password> sigfox -- npx -y sigfox-mcp
```

For clients configured with a JSON file (Claude Desktop, Cursor, and others), add this entry:

```json
{
  "mcpServers": {
    "sigfox": {
      "command": "npx",
      "args": ["-y", "sigfox-mcp"],
      "env": {
        "SIGFOX_LOGIN": "<login>",
        "SIGFOX_PASSWORD": "<password>"
      }
    }
  }
}
```

The credentials can also be passed as `--login` / `--password` arguments, but environment variables are preferred because arguments are visible in the process list.

### MCPB bundle (Claude Desktop)

Sigfox MCP is also distributed as an MCPB bundle (`sigfox-mcp-<version>.mcpb`).

1. Download the latest `.mcpb` file from the [Releases](https://github.com/nightswinger/sigfox-mcp/releases) page.
2. Open Claude Desktop, go to **Settings → Extensions**, and drag-and-drop the `.mcpb` file into the window (or use the "Install from file" option) to install it.
3. When prompted, enter the Sigfox API Login and Sigfox API Password.

## Tools

| Name | Description |
| --- | --- |
| `sigfox-get-device` | Retrieves detailed information about a specific Sigfox device using its unique identifier. |
| `sigfox-get-device-messages` | Retrieves the list of messages received from a specific Sigfox device, with optional time range and pagination. Base station reception info (`rinfos`) is omitted unless `fields` includes `rinfos`. |
| `sigfox-get-coverage-predictions` | Retrieve Sigfox global coverage predictions for a given latitude and longitude. Returns coverage margins (dB) for redundancy levels 1, 2, and 3. |
| `sigfox-list-device-types` | List Sigfox device types with optional filters (group, contract, name) and pagination. |
| `sigfox-list-devices` | List Sigfox devices with optional filters (id, group, device type, operator, sort, id range) and pagination. |
| `sigfox-create-device` | Provisions a new Sigfox device under a given device type. Returns the new device identifier. |

## License

[MIT](LICENSE)
