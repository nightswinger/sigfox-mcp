import { z } from 'zod';
import { createTool } from '../factory.js';
import type { SigfoxToolCallback } from '../types.js';

const toolName = 'sigfox-get-coverage-predictions';

const inputSchema = {
  lat: z.number().describe('The latitude of the location to check.'),
  lng: z.number().describe('The longitude of the location to check.'),
  radius: z
    .number()
    .int()
    .optional()
    .describe('The radius of the area in meters to average results over. Defaults to 300.'),
  groupId: z
    .string()
    .optional()
    .describe('The id of a group to include its operator in the global coverage.'),
};

const outputSchema = {
  locationCovered: z.boolean().describe('True if the requested location is considered covered.'),
  margins: z
    .array(z.number())
    .describe('Coverage margins in dB for redundancy levels 1, 2, and 3 respectively.'),
};

const toolConfig = {
  title: 'Get Sigfox Coverage Predictions',
  description:
    'Retrieve Sigfox global coverage predictions for a given latitude and longitude. Returns coverage margins (dB) for redundancy levels 1, 2, and 3.',
  inputSchema,
  outputSchema,
};

const callback: SigfoxToolCallback<typeof inputSchema> = async (
  { lat, lng, radius, groupId },
  { client },
) => {
  const response = await client.getCoveragePredictions({ lat, lng, radius, groupId });
  const result = {
    locationCovered: response.locationCovered,
    margins: response.margins,
  };

  return {
    structuredContent: result,
    content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
  };
};

export const getCoveragePredictions = createTool(toolName, toolConfig, callback);
