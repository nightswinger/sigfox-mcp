import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-list-device-types';

const inputSchema = {
  groupIds: z
    .string()
    .optional()
    .describe('Comma-separated list of group ids used to filter device types.'),
  contractId: z
    .string()
    .optional()
    .describe('Contract id used to filter device types.'),
  name: z
    .string()
    .optional()
    .describe('Filter device types by name (case-insensitive prefix match).'),
  fields: z
    .string()
    .optional()
    .describe('Comma-separated list of additional fields to include in the response.'),
  sort: z
    .string()
    .optional()
    .describe('Sort criterion. Allowed values: name, -name, id, -id.'),
  limit: z
    .number()
    .int()
    .optional()
    .describe('The maximum number of items to return.'),
  offset: z
    .number()
    .int()
    .optional()
    .describe('The number of items to skip.'),
  deep: z
    .boolean()
    .optional()
    .describe('Whether to include detailed nested objects (group, contract, etc.). Defaults to true.'),
};

const deviceTypeGroupRefSchema = z
  .object({
    id: z.string().optional().describe('The group identifier.'),
    name: z.string().optional().describe('The group name.'),
  })
  .partial();

const deviceTypeContractRefSchema = z
  .object({
    id: z.string().optional().describe('The contract identifier.'),
    name: z.string().optional().describe('The contract name.'),
  })
  .partial();

const deviceTypeSchema = z.object({
  id: z.string().describe('The device type identifier.'),
  name: z.string().describe('The device type name.'),
  description: z.string().optional().describe('The device type description.'),
  downlinkMode: z
    .number()
    .optional()
    .describe('Downlink mode. 0: DIRECT, 1: CALLBACK, 2: NONE, 3: MANAGED.'),
  payloadType: z
    .number()
    .optional()
    .describe(
      'Payload type. 0: Regular (no payload), 2: Custom grammar, 3: Geolocation, 4: Display in ASCII, 5: Radio planning frame, 6: Sensitv2.',
    ),
  payloadConfig: z.string().optional().describe('Payload configuration string (for custom grammar).'),
  keepAlive: z.number().optional().describe('Keep-alive period in seconds (0 disables the feature).'),
  alertEmail: z.string().optional().describe('Email address for alert notifications.'),
  automaticRenewal: z.boolean().optional().describe('Whether automatic renewal is enabled.'),
  group: deviceTypeGroupRefSchema.optional().describe('The group this device type belongs to.'),
  contract: deviceTypeContractRefSchema.optional().describe('The contract associated with this device type.'),
  creationTime: z.string().optional().describe('The device type creation time (ISO 8601 format).'),
  lastEditionTime: z.string().optional().describe('The last edition time (ISO 8601 format).'),
});

const outputSchema = {
  data: z.array(deviceTypeSchema).describe('The list of device types.'),
  paging: z
    .object({
      next: z.string().optional().describe('URL to the next page of results, if any.'),
    })
    .describe('Pagination information.'),
};

const toolConfig = {
  title: 'List Sigfox Device Types',
  description:
    'List Sigfox device types with optional filters (group, contract, name) and pagination. Returns nested group/contract details by default (deep=true).',
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { groupIds, contractId, name, fields, sort, limit, offset, deep },
  { client },
) => {
  const response = await client.getDeviceTypes({
    groupIds,
    contractId,
    name,
    fields,
    sort,
    limit,
    offset,
    deep,
  });

  const result = {
    data: response.data.map((dt) => ({
      id: dt.id,
      name: dt.name,
      description: dt.description,
      downlinkMode: dt.downlinkMode,
      payloadType: dt.payloadType,
      payloadConfig: dt.payloadConfig,
      keepAlive: dt.keepAlive,
      alertEmail: dt.alertEmail,
      automaticRenewal: dt.automaticRenewal,
      group: dt.group,
      contract: dt.contract,
      creationTime:
        dt.creationTime !== undefined ? new Date(dt.creationTime).toISOString() : undefined,
      lastEditionTime:
        dt.lastEditionTime !== undefined ? new Date(dt.lastEditionTime).toISOString() : undefined,
    })),
    paging: response.paging,
  };

  return {
    structuredContent: result,
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
};

export const listDeviceTypes = createTool(toolName, toolConfig, callback);
