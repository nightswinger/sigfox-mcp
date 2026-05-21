import type {
  CoveragePredictionsResponse,
  Device,
  DeviceMessagesResponse,
  DeviceTypesResponse,
  DevicesResponse,
  GetCoveragePredictionsOptions,
  GetDeviceMessagesOptions,
  GetDeviceOptions,
  GetDeviceTypesOptions,
  GetDevicesOptions,
} from './types.js';

const SIGFOX_BASE_URL = 'https://api.sigfox.com/v2';

export class SigfoxAPIClient {
  private readonly baseUrl = 'https://api.sigfox.com/v2';
  private readonly authHeader: string;

  constructor(login: string, password: string) {
    this.authHeader = `Basic ${Buffer.from(`${login}:${password}`).toString("base64")}`;
  }

  private async request<T>(path: string, queryParams: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${data.message ?? JSON.stringify(data)}`);
    }

    return data as T;
  }

  async getDevice(deviceId: string, options: GetDeviceOptions = {}): Promise<Device> {
    if (!deviceId) throw new Error('deviceId is required');

    const queryParams: Record<string, string> = {};
    if (options.fields) queryParams.fields = options.fields;
    if (options.authorizations !== undefined) {
      queryParams.authorizations = String(options.authorizations);
    }

    return this.request<Device>(`/devices/${deviceId}`, queryParams);
  }

  async getDeviceMessages(
    deviceId: string,
    options: GetDeviceMessagesOptions = {},
  ): Promise<DeviceMessagesResponse> {
    if (!deviceId) throw new Error('deviceId is required');

    const queryParams: Record<string, string> = {};
    if (options.fields) queryParams.fields = options.fields;
    if (options.since !== undefined) queryParams.since = String(options.since);
    if (options.before !== undefined) queryParams.before = String(options.before);
    if (options.limit !== undefined) queryParams.limit = String(options.limit);
    if (options.offset !== undefined) queryParams.offset = String(options.offset);

    return this.request<DeviceMessagesResponse>(
      `/devices/${deviceId}/messages`,
      queryParams,
    );
  }

  async getCoveragePredictions(
    options: GetCoveragePredictionsOptions,
  ): Promise<CoveragePredictionsResponse> {
    const queryParams: Record<string, string> = {
      lat: String(options.lat),
      lng: String(options.lng),
    };
    if (options.radius !== undefined) queryParams.radius = String(options.radius);
    if (options.groupId !== undefined) queryParams.groupId = options.groupId;

    return this.request<CoveragePredictionsResponse>('/coverages/global/predictions', queryParams);
  }

  async getDevices(options: GetDevicesOptions = {}): Promise<DevicesResponse> {
    const deep = options.deep ?? true;
    const queryParams: Record<string, string> = { deep: String(deep) };
    if (options.id) queryParams.id = options.id;
    if (options.groupIds) queryParams.groupIds = options.groupIds;
    if (options.deviceTypeId) queryParams.deviceTypeId = options.deviceTypeId;
    if (options.operatorId) queryParams.operatorId = options.operatorId;
    if (options.sort) queryParams.sort = options.sort;
    if (options.minId) queryParams.minId = options.minId;
    if (options.maxId) queryParams.maxId = options.maxId;
    if (options.fields) queryParams.fields = options.fields;
    if (options.limit !== undefined) queryParams.limit = String(options.limit);
    if (options.offset !== undefined) queryParams.offset = String(options.offset);

    return this.request<DevicesResponse>('/devices/', queryParams);
  }

  async getDeviceTypes(
    options: GetDeviceTypesOptions = {},
  ): Promise<DeviceTypesResponse> {
    const deep = options.deep ?? true;
    const queryParams: Record<string, string> = { deep: String(deep) };
    if (options.groupIds) queryParams.groupIds = options.groupIds;
    if (options.contractId) queryParams.contractId = options.contractId;
    if (options.name) queryParams.name = options.name;
    if (options.fields) queryParams.fields = options.fields;
    if (options.sort) queryParams.sort = options.sort;
    if (options.limit !== undefined) queryParams.limit = String(options.limit);
    if (options.offset !== undefined) queryParams.offset = String(options.offset);

    return this.request<DeviceTypesResponse>('/device-types', queryParams);
  }
}
