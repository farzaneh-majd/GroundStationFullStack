export type FieldFormat = "u8" | "u16" | "u32" | "i8" | "i16" | "i32" | "f32";

export type TelemetryKind = "scalar" | "struct" | "binary";

export type Endian = "big" | "little";

export type TelemetryField = {
  name: string;
  format: FieldFormat;
  unit?: string;
  enum?: Record<string, string>;
  enumMap?: Record<string, string>;
  endian?: Endian;
};

export type TelemetryDefinition = {
  tlmId: string;
  name: string;
  kind: TelemetryKind;
  endian?: Endian;
  fields: TelemetryField[];
};

export type DecodedTelemetryField = {
  name: string;
  value: number | string;
  unit?: string;
  format?: FieldFormat;
};

export type DecodedTelemetry = {
  tlmId: string;
  name: string;
  kind: TelemetryKind | "unknown";
  values: Record<string, number | string>;
  fields: DecodedTelemetryField[];
  rawPayload: string;
  byteLength: number;
};

export type IncomingRawTelemetryPacket = {
  satellite_id?: string;
  satelliteId?: string;
  tlm_id?: string | number;
  tlmId?: string | number;
  payload?: string;
  payload_str?: string;
  payloadHex?: string;
  ts?: string | number;
  timestamp?: string | number;
  time_precision?: "s" | "ms" | "us" | "ns";
  timePrecision?: "s" | "ms" | "us" | "ns";
};

export type StoredRawTelemetryPacket = {
  record_id: string;
  time: string;
  satellite_id: string;
  tlm_id: string;
  payload: string;
  decoded: DecodedTelemetry;
};

export type TelemetryPacketFilters = {
  satellite_id?: string;
  tlm_id?: string;
  limit?: number;
};
