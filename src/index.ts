#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { McpServer } from "@modelcontextprotocol/server";
import { createToolCallback, tools } from './tools/index.js';
import { getSigfoxClient } from './client/index.js';

// package.json sits one level above this file in every layout we ship:
// src/ (dev), dist/ (npm package) and server/ (MCPB bundle).
const { version } = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { version: string };

const resolveCredentials = () => {
  const { values } = parseArgs({
    options: {
      login: { type: 'string' },
      password: { type: 'string' },
    },
    strict: true,
  });

  const login = values.login ?? process.env.SIGFOX_LOGIN;
  const password = values.password ?? process.env.SIGFOX_PASSWORD;

  if (!login || !password) {
    console.error(
      'Missing Sigfox credentials. Provide --login/--password or set SIGFOX_LOGIN/SIGFOX_PASSWORD env vars.',
    );
    process.exit(1);
  }

  return { login, password };
};

const main = async () => {
  const { login, password } = resolveCredentials();

  const transport = new StdioServerTransport();

  console.error('Starting MCP server...');
  const server = new McpServer({ name: 'sigfox-mcp', version });

  const client = getSigfoxClient(login, password);

  for (const tool of tools) {
    server.registerTool(
      tool.name,
      tool.config,
      createToolCallback(tool.callback, { client }),
    );
  }

  await server.connect(transport);
}

main().catch(console.error);
