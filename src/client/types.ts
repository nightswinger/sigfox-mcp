export interface GetDeviceOptions {
  fields?: string;
  authorizations?: boolean;
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
  freq?: number;
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
