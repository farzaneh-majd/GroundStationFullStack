import type { Endian, FieldFormat, TelemetryKind } from "./telemetry";

export type TelemetryQuality = "GOOD" | "WARNING" | "CRITICAL" | "STALE" | "UNKNOWN";
export type TelemetrySource = "FPRIME" | "SIMULATOR" | "MANUAL" | "UNKNOWN";
export type TelemetryValue = number | string | boolean | null;

export type TelemetryLimits = {
  warningLow?: number;
  warningHigh?: number;
  criticalLow?: number;
  criticalHigh?: number;
};

export type TelemetryChannelField = {
  key: string;
  name: string;
  description?: string;
  format: FieldFormat;
  unit?: string;
  endian?: Endian;
  enumMap?: Record<string, string>;
  limits?: TelemetryLimits;
};

export type TelemetryChannel = {
  id: string;
  telemetryId: string;
  satelliteId?: string;
  subsystem: string;
  name: string;
  description?: string;
  kind: TelemetryKind;
  endian?: Endian;
  source: TelemetrySource;
  sampleRateHz?: number;
  staleAfterMs?: number;
  fields: TelemetryChannelField[];
};

export type TelemetrySubsystem = {
  id: string;
  name: string;
  description?: string;
  channels: TelemetryChannel[];
};

export type TelemetryCatalog = {
  version: string;
  satelliteId?: string;
  generatedAt?: string;
  subsystems: TelemetrySubsystem[];
  channels: TelemetryChannel[];
};

export type TelemetryPoint = {
  satelliteId: string;
  channelId: string;
  telemetryId: string;
  field: string;
  timestamp: string;
  value: TelemetryValue;
  unit?: string;
  quality: TelemetryQuality;
  source?: TelemetrySource;
};

export type TelemetrySeries = {
  channel: TelemetryChannel;
  field: string;
  points: TelemetryPoint[];
};

export type TelemetrySummary = {
  satelliteId: string;
  channelId: string;
  field: string;
  windowStart: string;
  count: number;
  mean: number;
  minimum: number;
  maximum: number;
  stddev: number;
};

export type TelemetryHistoryInput = {
  satelliteId: string;
  channelId: string;
  field: string;
  from: string;
  to: string;
  limit?: number;
};

export type TelemetryAlert = {
  id: string;
  satelliteId: string;
  channelId: string;
  field: string;
  severity: "WARNING" | "CRITICAL" | "STALE";
  message: string;
  timestamp: string;
  value?: TelemetryValue;
  acknowledged: boolean;
};
