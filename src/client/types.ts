export interface GetDeviceOptions {
  fields?: string;
  authorizations?: boolean;
}

export interface DeviceRef {
  id?: string;
  name?: string;
}

export interface Device {
  id: string;
  name: string;
  pac?: string;
  state?: number;
  comState?: number;
  lastCom?: number;
  lqi?: number;
  activationTime?: number;
  creationTime?: number;
  automaticRenewal?: boolean;
  activable?: boolean;
  deviceType?: DeviceRef;
  group?: DeviceRef;
  contract?: DeviceRef;
}

export interface CreateDevicePayload {
  id: string;
  name: string;
  deviceTypeId: string;
  pac: string;
  prototype?: boolean;
  automaticRenewal?: boolean;
  activable?: boolean;
  lat?: number;
  lng?: number;
}

export interface CreateDeviceResponse {
  id: string;
}

export interface GetDevicesOptions {
  id?: string;
  groupIds?: string;
  deviceTypeId?: string;
  operatorId?: string;
  sort?: string;
  minId?: string;
  maxId?: string;
  fields?: string;
  limit?: number;
  offset?: number;
  deep?: boolean;
}

export interface DevicesResponse {
  data: Device[];
  paging: Paging;
}

export interface GetDeviceMessagesOptions {
  fields?: string;
  since?: number;
  before?: number;
  limit?: number;
  offset?: number;
}

export interface CommonDeviceReading {
  id: string;
  name?: string;
}

export interface MessageBaseStation {
  id?: string;
  name?: string;
  resourceType?: number;
}

export interface MinBaseStationWithType {
  id?: string;
  name?: string;
  resourceType?: number;
  actions?: string[];
}

export interface Repetition {
  nseq?: number;
  rssi?: string;
  freq?: number | string;
  repeated?: boolean;
}

export interface CbStatus {
  status?: number;
  info?: string;
  cbDef?: string;
  time?: number;
  attempts?: number;
}

export interface ComputedLocation {
  lat?: number;
  lng?: number;
  radius?: number;
  source?: number;
  placeIds?: string[];
}

export interface Rinfo {
  baseStation?: MessageBaseStation;
  rssi?: string;
  rssiRepeaters?: string;
  lat?: string;
  lng?: string;
  delay?: number;
  freq?: number;
  freqRepeaters?: string;
  rep?: number;
  repetitions?: Repetition[];
  cbStatus?: CbStatus[];
}

export interface DownlinkAnswerStatus {
  baseStation?: MinBaseStationWithType;
  plannedPower?: number;
  data?: string;
  operator?: string;
  country?: string;
}

export interface DeviceMessage {
  device?: CommonDeviceReading;
  time?: number;
  data?: string;
  ackRequired?: boolean;
  lqi?: number;
  lqiRepeaters?: number;
  seqNumber?: number;
  nbFrames?: number;
  computedLocation?: ComputedLocation[];
  rinfos?: Rinfo[];
  downlinkAnswerStatus?: DownlinkAnswerStatus;
  downlinkAnswerStatuses?: DownlinkAnswerStatus[];
}

export interface Paging {
  next?: string;
}

export interface DeviceMessagesResponse {
  data: DeviceMessage[];
  paging: Paging;
}

export interface GetCoveragePredictionsOptions {
  lat: number;
  lng: number;
  radius?: number;
  groupId?: string;
}

export interface CoveragePredictionsResponse {
  locationCovered: boolean;
  margins: number[];
}

export interface GetDeviceTypesOptions {
  groupIds?: string;
  contractId?: string;
  name?: string;
  fields?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  deep?: boolean;
}

export interface DeviceTypeGroupRef {
  id?: string;
  name?: string;
}

export interface DeviceTypeContractRef {
  id?: string;
  name?: string;
}

export interface DeviceType {
  id: string;
  name: string;
  description?: string;
  downlinkMode?: number;
  payloadType?: number;
  payloadConfig?: string;
  keepAlive?: number;
  alertEmail?: string;
  automaticRenewal?: boolean;
  group?: DeviceTypeGroupRef;
  contract?: DeviceTypeContractRef;
  creationTime?: number;
  lastEditionTime?: number;
}

export interface DeviceTypesResponse {
  data: DeviceType[];
  paging: Paging;
}
