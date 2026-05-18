import type { z, ZodRawShape, ZodTypeAny } from 'zod';

import type { SigfoxToolCallback, Tool, ToolCallbackOptions, ToolConfig } from './types.js';

export const createTool = <
  InputArgs extends ZodRawShape,
  OutputArgs extends ZodRawShape,
>(
  name: string,
  config: ToolConfig<InputArgs, OutputArgs>,
  callback: SigfoxToolCallback<InputArgs>,
): Tool<InputArgs, OutputArgs> => {
  return {
    name,
    config,
    callback,
  };
};

export const createToolCallback = <InputArgs extends ZodRawShape>(
  callback: SigfoxToolCallback<InputArgs>,
  options: ToolCallbackOptions
) => {
  return (args: z.infer<z.ZodObject<InputArgs>>) => callback(args, options);
};
