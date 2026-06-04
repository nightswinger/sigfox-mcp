import type {
  CoveragePredictionsResponse,
  CreateDevicePayload,
  CreateDeviceResponse,
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

  private async request<T>(
    method: string,
    path: string,
    data: Record<string, string> | unknown = {},
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    const init: RequestInit = {
      method,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
    };

    if (method === 'GET') {
      Object.entries(data as Record<string, string>).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    } else {
      init.body = JSON.stringify(data);
    }

    const res = await fetch(url.toString(), init);

    const body = await res.json();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${body.message ?? JSON.stringify(body)}`);
    }

    return body as T;
  }

  async getDevice(deviceId: string, options: GetDeviceOptions = {}): Promise<Device> {
    if (!deviceId) throw new Error('deviceId is required');

    const queryParams: Record<string, string> = {};
    if (options.fields) queryParams.fields = options.fields;
    if (options.authorizations !== undefined) {
      queryParams.authorizations = String(options.authorizations);
    }

    return this.request<Device>('GET', `/devices/${deviceId}`, queryParams);
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
      'GET',
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

    return this.request<CoveragePredictionsResponse>('GET', '/coverages/global/predictions', queryParams);
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

    return this.request<DevicesResponse>('GET', '/devices/', queryParams);
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

    return this.request<DeviceTypesResponse>('GET', '/device-types', queryParams);
  }

  async createDevice(payload: CreateDevicePayload): Promise<CreateDeviceResponse> {
    if (!payload.id) throw new Error('id is required');
    if (!payload.name) throw new Error('name is required');
    if (!payload.deviceTypeId) throw new Error('deviceTypeId is required');
    if (!payload.pac) throw new Error('pac is required');

    return this.request<CreateDeviceResponse>('POST', '/devices/', payload);
  }
}
