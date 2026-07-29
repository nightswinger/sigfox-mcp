import type { z, ZodRawShape, ZodTypeAny } from 'zod';
import type { CallToolResult } from "@modelcontextprotocol/server";
import type { SigfoxAPIClient } from '../client/client.js';

export type ToolCallbackOptions = {
  client: SigfoxAPIClient
}

export type ToolConfig<
  InputArgs extends ZodRawShape,
  OutputArgs extends ZodRawShape,
> = {
  title: string;
  description: string;
  inputSchema: InputArgs;
  outputSchema: OutputArgs;
};

export type Tool<
  InputArgs extends ZodRawShape = ZodRawShape,
  OutputArgs extends ZodRawShape = ZodRawShape,
> = {
  name: string;
  config: ToolConfig<InputArgs, OutputArgs>;
  callback: SigfoxToolCallback<InputArgs>;
};

export type SigfoxToolCallback<InputArgs extends ZodRawShape> = (
  args: z.infer<z.ZodObject<InputArgs>>,
  extra: ToolCallbackOptions,
) => CallToolResult | Promise<CallToolResult>;
