import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-get-device-messages';

const inputSchema = {
  deviceId: z
    .string()
    .describe('The unique identifier (hexadecimal format) of the device to retrieve messages for.'),
  fields: z
    .string()
    .optional()
    .describe(
      'Comma-separated list of additional fields to include in the response. Allowed values: oob, ackRequired, device(name), rinfos(cbStatus,rep,repetitions,baseStation(name)), downlinkAnswerStatus(baseStation(name)).',
    ),
  since: z
    .number()
    .int()
    .optional()
    .describe('Starting timestamp (in milliseconds since the Unix Epoch).'),
  before: z
    .number()
    .int()
    .optional()
    .describe('Ending timestamp (in milliseconds since the Unix Epoch).'),
  limit: z
    .number()
    .int()
    .optional()
    .describe('The maximum number of items to return. Defaults to 100.'),
  offset: z
    .number()
    .int()
    .optional()
    .describe('The number of items to skip. Defaults to 0. Allowed range: 0 to 40000.'),
};

const commonDeviceReadingSchema = z.object({
  id: z.string().describe("The device's identifier (hexadecimal format)."),
  name: z.string().optional().describe("The device's name."),
});

const computedLocationSchema = z
  .object({
    lat: z.number().optional().describe("The device's estimated latitude."),
    lng: z.number().optional().describe("The device's estimated longitude."),
    radius: z.number().optional().describe('The radius of the circle (meters).'),
    source: z
      .number()
      .optional()
      .describe(
        'How the location has been computed. 0: RSSI/station (legacy), 1: GPS payload, 2: Network, 3: PoI, 4: HD Network, 5: Private DB, 6: WiFi, 7: Proximity.',
      ),
    placeIds: z
      .array(z.string())
      .optional()
      .describe('The place ids computed by the Sigfox Geolocation service.'),
  })
  .partial();

const messageBaseStationSchema = z
  .object({
    id: z.string().optional().describe('The base station identifier in hexadecimal.'),
    name: z.string().optional().describe('The base station name.'),
    resourceType: z.number().optional().describe('Resource type. 0: SBS, 1: NAP.'),
  })
  .partial();

const repetitionSchema = z
  .object({
    nseq: z.number().optional().describe('nseq of the repetition.'),
    rssi: z.string().optional().describe('Received Signal Strength Indication (dBm).'),
    freq: z.number().optional().describe('Frequency at which the message has been received (Hz).'),
    repeated: z
      .boolean()
      .optional()
      .describe('Whether this repetition has been propagated by a repeater.'),
  })
  .partial();

const cbStatusSchema = z
  .object({
    status: z.number().optional().describe('HTTP response status.'),
    info: z.string().optional().describe('More details about the failure.'),
    cbDef: z.string().optional().describe('Callback definition triggered.'),
    time: z
      .number()
      .optional()
      .describe('Time the callback was called (in milliseconds since the Unix Epoch).'),
    attempts: z
      .number()
      .optional()
      .describe('The number of attempts it took to send the callback.'),
  })
  .partial();

const rinfoSchema = z
  .object({
    baseStation: messageBaseStationSchema.optional(),
    rssi: z.string().optional().describe('Received Signal Strength Indication (dBm).'),
    rssiRepeaters: z
      .string()
      .optional()
      .describe('Received Signal Strength Indication from repeaters (dBm).'),
    lat: z
      .string()
      .optional()
      .describe('The latitude of the base station that has received the message.'),
    lng: z
      .string()
      .optional()
      .describe('The longitude of the base station that has received the message.'),
    delay: z
      .number()
      .optional()
      .describe('The delay (in seconds) between sending and receiving the message.'),
    freq: z.number().optional().describe('Frequency at which the message has been received (Hz).'),
    freqRepeaters: z
      .string()
      .optional()
      .describe('Frequency at which the message has been received from repeaters (Hz).'),
    rep: z.number().optional().describe('Number of repetitions sent by the base station.'),
    repetitions: z.array(repetitionSchema).optional().describe('Detail of the repetitions.'),
    cbStatus: z
      .array(cbStatusSchema)
      .optional()
      .describe('List of callback status for this reception.'),
  })
  .partial();

const downlinkAnswerStatusSchema = z
  .object({
    baseStation: z
      .object({
        id: z.string().optional(),
        name: z.string().optional(),
        resourceType: z.number().optional(),
        actions: z.array(z.string()).optional(),
      })
      .partial()
      .optional()
      .describe('Base station to send downlink message.'),
    plannedPower: z
      .number()
      .optional()
      .describe('Planned downlink power as computed by the backend.'),
    data: z.string().optional().describe('Response content, hex encoded.'),
    operator: z
      .string()
      .optional()
      .describe('Name of the first operator which received the message as roaming.'),
    country: z.string().optional().describe('Country of the operator.'),
  })
  .partial();

const deviceMessageSchema = z.object({
  device: commonDeviceReadingSchema.optional().describe('The device that sent the message.'),
  time: z
    .number()
    .optional()
    .describe('Timestamp of the message (in milliseconds since the Unix Epoch).'),
  data: z.string().optional().describe('Message content, hex encoded.'),
  ackRequired: z.boolean().optional().describe('True if an acknowledgement is required.'),
  lqi: z
    .number()
    .optional()
    .describe('Link quality indicator. 0: LIMIT, 1: AVERAGE, 2: GOOD, 3: EXCELLENT, 4: NA.'),
  lqiRepeaters: z
    .number()
    .optional()
    .describe(
      'Link quality indicator for repeated message. 0: LIMIT, 1: AVERAGE, 2: GOOD, 3: EXCELLENT, 4: NA.',
    ),
  seqNumber: z
    .number()
    .optional()
    .describe(
      'The sequence number for this message. May not be present when the device uses the VO protocol.',
    ),
  nbFrames: z
    .number()
    .optional()
    .describe('Number of frames sent by the device. Can be 1 or 3.'),
  computedLocation: z
    .array(computedLocationSchema)
    .optional()
    .describe('Provided only if the atlas option is enabled in your contract.'),
  rinfos: z.array(rinfoSchema).optional().describe('Reception information from base stations.'),
  downlinkAnswerStatus: downlinkAnswerStatusSchema
    .optional()
    .describe('The last callback status for this reception.'),
  downlinkAnswerStatuses: z
    .array(downlinkAnswerStatusSchema)
    .optional()
    .describe('List of callback status for this reception.'),
});

const outputSchema = {
  data: z.array(deviceMessageSchema).describe('The list of messages.'),
  paging: z
    .object({
      next: z.string().optional().describe('URL to the next page of results, if any.'),
    })
    .describe('Pagination information.'),
};

const toolConfig = {
  title: 'Get Sigfox Device Messages',
  description:
    "Retrieves the list of messages received from a specific Sigfox device, with optional time range and pagination.",
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { deviceId, fields, since, before, limit, offset },
  { client },
) => {
  const response = await client.getDeviceMessages(deviceId, {
    fields,
    since,
    before,
    limit,
    offset,
  });
  const result = {
    data: response.data,
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

export const getDeviceMessages = createTool(toolName, toolConfig, callback);
