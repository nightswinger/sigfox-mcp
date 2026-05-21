import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-list-devices';

const inputSchema = {
  id: z
    .string()
    .optional()
    .describe("The device's identifier (hexadecimal format) used to filter the result."),
  groupIds: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of group ids used to filter devices. Includes sub-groups when deep is true.',
    ),
  deviceTypeId: z
    .string()
    .optional()
    .describe('Returns all devices of the given device type.'),
  operatorId: z.string().optional().describe('Returns all devices under the given operator.'),
  sort: z
    .string()
    .optional()
    .describe(
      'The field on which the list will be sorted. Use field to sort ascending or -field to sort descending (e.g. id, -id).',
    ),
  minId: z
    .string()
    .optional()
    .describe('The minimal id of the filtered range. Only available when sort is "id" or "-id".'),
  maxId: z
    .string()
    .optional()
    .describe('The maximal id of the filtered range. Only available when sort is "id" or "-id".'),
  fields: z
    .string()
    .optional()
    .describe('Comma-separated list of additional fields to include in the response.'),
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
    .describe(
      'Whether to search by groups and subgroups through the groupIds parameter, and to include detailed nested objects (deviceType, group, contract). Defaults to true.',
    ),
};

const deviceRefSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
  })
  .partial();

const deviceSchema = z.object({
  id: z.string().describe('The unique identifier (hexadecimal format) of the device.'),
  name: z.string().describe('The device name.'),
  pac: z.string().optional().describe('The device PAC (Porting Access Code).'),
  lastCom: z.string().optional().describe('The last communication time (ISO 8601 format).'),
  lqi: z
    .number()
    .optional()
    .describe('Link Quality Indicator. 0: LIMIT, 1: AVERAGE, 2: GOOD, 3: EXCELLENT, 4: NA.'),
  activationTime: z
    .string()
    .optional()
    .describe('The device activation time (ISO 8601 format).'),
  creationTime: z
    .string()
    .optional()
    .describe('The device provisioning time (ISO 8601 format).'),
  state: z
    .number()
    .optional()
    .describe(
      'Device state. 0: OK, 1: DEAD, 2: OFF_CONTRACT, 3: DISABLED, 5: DELETED, 6: SUSPENDED, 7: NOT_ACTIVABLE.',
    ),
  comState: z
    .number()
    .optional()
    .describe('Communication state. 0: NO, 1: OK, 3: RED, 4: N/A, 5: NOT_SEEN.'),
  automaticRenewal: z.boolean().optional().describe('Whether token renewal is allowed.'),
  activable: z
    .boolean()
    .optional()
    .describe('Whether the device is activable and can take a token.'),
  deviceType: deviceRefSchema.optional().describe('The device type this device belongs to.'),
  group: deviceRefSchema.optional().describe('The group this device belongs to.'),
  contract: deviceRefSchema.optional().describe('The contract associated with this device.'),
});

const outputSchema = {
  data: z.array(deviceSchema).describe('The list of devices.'),
  paging: z
    .object({
      next: z.string().optional().describe('URL to the next page of results, if any.'),
    })
    .describe('Pagination information.'),
};

const toolConfig = {
  title: 'List Sigfox Devices',
  description:
    'List Sigfox devices with optional filters (id, group, device type, operator, sort, id range) and pagination. Returns nested deviceType/group/contract details by default (deep=true).',
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { id, groupIds, deviceTypeId, operatorId, sort, minId, maxId, fields, limit, offset, deep },
  { client },
) => {
  const response = await client.getDevices({
    id,
    groupIds,
    deviceTypeId,
    operatorId,
    sort,
    minId,
    maxId,
    fields,
    limit,
    offset,
    deep,
  });

  const result = {
    data: response.data.map((device) => ({
      id: device.id,
      name: device.name,
      pac: device.pac,
      lastCom:
        device.lastCom !== undefined ? new Date(device.lastCom).toISOString() : undefined,
      lqi: device.lqi,
      activationTime:
        device.activationTime !== undefined
          ? new Date(device.activationTime).toISOString()
          : undefined,
      creationTime:
        device.creationTime !== undefined
          ? new Date(device.creationTime).toISOString()
          : undefined,
      state: device.state,
      comState: device.comState,
      automaticRenewal: device.automaticRenewal,
      activable: device.activable,
      deviceType: device.deviceType,
      group: device.group,
      contract: device.contract,
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

export const listDevices = createTool(toolName, toolConfig, callback);
