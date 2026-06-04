import { createDevice } from "./sigfox/create-device.js";
import { getDevice } from "./sigfox/get-device.js";
import { getDeviceMessages } from "./sigfox/get-device-messages.js";
import { getCoveragePredictions } from "./sigfox/get-coverage-predictions.js";
import { listDeviceTypes } from "./sigfox/list-device-types.js";
import { listDevices } from "./sigfox/list-devices.js";
import type { Tool } from './types.js';

export { createToolCallback } from './factory.js';

export const tools: readonly Tool<any, any>[] = [
  getDevice,
  getDeviceMessages,
  getCoveragePredictions,
  listDeviceTypes,
  listDevices,
  createDevice,
];
