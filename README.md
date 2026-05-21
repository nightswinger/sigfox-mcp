# Sigfox MCP

A Model Context Protocol (MCP) server that exposes the Sigfox cloud API as tools. It lets an LLM look up Sigfox device metadata and recent uplink messages on behalf of the user. Authenticates with a Sigfox API access (login / password) credential pair.

## Installation

Sigfox MCP is distributed as an MCPB bundle (`sigfox-mcp-<version>.mcpb`).

1. Download the latest `.mcpb` file from the [Releases](https://github.com/nightswinger/sigfox-mcp/releases) page.
2. Open Claude Desktop, go to **Settings → Extensions**, and drag-and-drop the `.mcpb` file into the window (or use the "Install from file" option) to install it.
3. When prompted, enter the **Sigfox API Login** and **Sigfox API Password** issued from the Sigfox backend (**Group → API access**).

## Tools

| Name | Description |
| --- | --- |
| `sigfox-get-device` | Retrieves detailed information about a specific Sigfox device using its unique identifier. |
| `sigfox-get-device-messages` | Retrieves the list of messages received from a specific Sigfox device, with optional time range and pagination. |
| `sigfox-get-coverage-predictions` | Retrieve Sigfox global coverage predictions for a given latitude and longitude. Returns coverage margins (dB) for redundancy levels 1, 2, and 3. |
