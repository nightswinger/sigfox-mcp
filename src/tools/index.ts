import { getDevice } from "./sigfox/get-device.js";
import { getDeviceMessages } from "./sigfox/get-device-messages.js";
import { getCoveragePredictions } from "./sigfox/get-coverage-predictions.js";
import type { Tool } from './types.js';

export { createToolCallback } from './factory.js';

export const tools: readonly Tool<any, any>[] = [
  getDevice,
  getDeviceMessages,
  getCoveragePredictions,
];
