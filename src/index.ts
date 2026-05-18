import { parseArgs } from 'node:util';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createToolCallback, tools } from './tools/index.js';
import { getSigfoxClient } from './client/index.js';

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

  console.log('Starting MCP server...');
  const server = new McpServer({ name: 'my-server', version: '1.0.0' });

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
