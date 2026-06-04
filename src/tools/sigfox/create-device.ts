import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-create-device';

const inputSchema = {
  id: z
    .string()
    .describe("The device's identifier (hexadecimal format)."),
  name: z
    .string()
    .describe("The device's name (max 100 characters)."),
  deviceTypeId: z
    .string()
    .describe('The identifier of the device type this device is affected to.'),
  pac: z
    .string()
    .describe("The device's PAC (Porting Access Code)."),
  prototype: z
    .boolean()
    .optional()
    .describe('Set to true if the device is a prototype. Defaults to false.'),
  automaticRenewal: z
    .boolean()
    .optional()
    .describe('Subscription to automatic token renewal. Defaults to true.'),
  activable: z
    .boolean()
    .optional()
    .describe('Whether the device is activable and can take a token. Defaults to true.'),
  lat: z
    .number()
    .optional()
    .describe("The device's provided latitude. Defaults to 0."),
  lng: z
    .number()
    .optional()
    .describe("The device's provided longitude. Defaults to 0."),
};

const outputSchema = {
  id: z
    .string()
    .describe('The unique identifier (hexadecimal format) of the newly created device.'),
};

const toolConfig = {
  title: 'Create Sigfox Device',
  description: 'Provisions a new Sigfox device under a given device type. Returns the new device identifier.',
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { id, name, deviceTypeId, pac, prototype, automaticRenewal, activable, lat, lng },
  { client },
) => {
  const device = await client.createDevice({
    id,
    name,
    deviceTypeId,
    pac,
    prototype,
    automaticRenewal,
    activable,
    lat,
    lng,
  });
  const result = {
    id: device.id,
  };

  return {
    structuredContent: result,
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }
    ]
  };
};

export const createDevice = createTool(toolName, toolConfig, callback);
