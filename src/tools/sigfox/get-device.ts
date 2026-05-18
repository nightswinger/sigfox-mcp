import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-get-device';

const inputSchema = {
  deviceId: z
    .string()
    .describe('The unique identifier of the device to retrieve.'),
  fields: z
    .string()
    .optional()
    .describe('Comma-separated list of fields to include in the response.'),
};

const outputSchema = {
  id: z.string().describe('The unique identifier (hexadecimal format) of the device.'),
  name: z.string().describe('The device name.'),
  pac: z.string().optional().describe('The device PAC (Porting Access Code).'),
  sequenceNumber: z.number().optional().describe('The last device sequence number.'),
  trashSequenceNumber: z.number().optional().describe('The last trashed device sequence number.'),
  lastCom: z.number().optional().describe('The last communication time (in milliseconds since Unix Epoch).'),
  lqi: z.number().optional().describe('Link Quality Indicator. 0: LIMIT, 1: AVERAGE, 2: GOOD, 3: EXCELLENT, 4: NA.'),
  activationTime: z.number().optional().describe('The device activation time (in milliseconds since Unix Epoch).'),
  creationTime: z.number().optional().describe('The device provisioning time (in milliseconds since Unix Epoch).'),
  state: z.number().optional().describe('Device state. 0: OK, 1: DEAD, 2: OFF_CONTRACT, 3: DISABLED, 5: DELETED, 6: SUSPENDED, 7: NOT_ACTIVABLE.'),
  comState: z.number().optional().describe('Communication state. 0: NO, 1: OK, 3: RED, 4: N/A, 5: NOT_SEEN.'),
  automaticRenewal: z.boolean().optional().describe('Whether token renewal is allowed.'),
  automaticRenewalStatus: z.number().optional().describe('Computed automatic renewal status. 0: ALLOWED, 1: NOT_ALLOWED, 2: RENEWED, 3: ENDED.'),
  activable: z.boolean().optional().describe('Whether the device is activable and can take a token.'),
  prototype: z.boolean().optional().describe('Whether the device is a prototype.'),
  satelliteCapable: z.boolean().optional().describe('Whether the device can communicate using satellite.'),
  repeater: z.boolean().optional().describe('Whether the device has repeater function.'),
  messageModulo: z.number().optional().describe('The message modulo.'),
  unsubscriptionTime: z.number().optional().describe('The device unsubscription time (in milliseconds since Unix Epoch).'),
  createdBy: z.string().optional().describe('The id of the user who created the device.'),
  lastEditionTime: z.number().optional().describe('Date of the last edition (in milliseconds since Unix Epoch).'),
  lastEditedBy: z.string().optional().describe('The id of the user who last edited the device.'),
};

const toolConfig = {
  title: 'Get Sigfox Device',
  description: 'Retrieves detailed information about a specific Sigfox device using its unique identifier.',
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { deviceId, fields },
  { client },
) => {
  const device = await client.getDevice(deviceId, { fields });
  const result = {
    id: device.id,
    name: device.name,
    pac: device.pac,
    lastCom: device.lastCom,
    lqi: device.lqi,
    activationTime: device.activationTime,
    creationTime: device.creationTime,
    state: device.state,
    comState: device.comState,
    automaticRenewal: device.automaticRenewal,
    activable: device.activable,
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

export const getDevice = createTool(toolName, toolConfig, callback);
