/* eslint-disable @typescript-eslint/no-explicit-any */
import { Point } from "@influxdata/influxdb-client";
import type {
  IncomingRawTelemetryPacket,
  StoredRawTelemetryPacket,
  TelemetryPacketFilters,
} from "@/types/telemetry";
import { decodeTelemetryPayload } from "@/utils/telemetryDecoder";
import {
  deleteFromInflux,
  escapeFluxString,
  getWriteApi,
  influxConfig,
  isSafeId,
  queryApi,
} from "./client";
import { telemetryMap } from "@/data/telemetryMap";

export const RAW_TELEMETRY_MEASUREMENT = "raw_telemetry";

const HERMES_CHANNELS: Record<string, { tlmId: string; field: string }> = {
  LedState: { tlmId: "1", field: "led_state" },
  AccelX: { tlmId: "2", field: "accel_x" },
  AccelY: { tlmId: "2", field: "accel_y" },
  AccelZ: { tlmId: "2", field: "accel_z" },
  GyroX: { tlmId: "2", field: "gyro_x" },
  GyroY: { tlmId: "2", field: "gyro_y" },
  GyroZ: { tlmId: "2", field: "gyro_z" },
  BatteryVoltage: { tlmId: "3", field: "battery_voltage" },
  SolarPanel1: { tlmId: "4", field: "solar_cell_voltage_LL" },
  SolarPanel2: { tlmId: "4", field: "solar_cell_voltage_LU" },
  SolarPanel3: { tlmId: "4", field: "solar_cell_voltage_RL" },
  SolarPanel4: { tlmId: "4", field: "solar_cell_voltage_RU" },
  FrontTemperature: { tlmId: "5", field: "temperature" },
  FrontHumidity: { tlmId: "5", field: "humidity" },
  BackTemperature: { tlmId: "6", field: "temperature" },
  BackHumidity: { tlmId: "6", field: "humidity" },
  MagnetometerX: { tlmId: "7", field: "u_x" },
  MagnetometerY: { tlmId: "7", field: "u_y" },
  MagnetometerZ: { tlmId: "7", field: "u_z" },
  Heading: { tlmId: "7", field: "headingDeg" },
  MagnetometerTemperature: { tlmId: "8", field: "magneto_meter" },
};

async function getHermesTelemetryPackets(filters?: TelemetryPacketFilters) {
  if (filters?.satellite_id && filters.satellite_id !== "SAT-A") return [];

  const requestedLimit = Math.min(Math.max(filters?.limit ?? 100, 1), 500);
  // Influx applies limit() to every input series. Keep only enough samples per
  // channel to assemble the requested dashboard packets while telemetry is live.
  const samplesPerChannel = filters?.tlm_id
    ? requestedLimit
    : Math.ceil(requestedLimit / 8) + 2;
  const query = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -15m)
      |> filter(fn: (r) => r._measurement =~ /^EdusatDeployment\\.mission\\./)
      |> filter(fn: (r) => r._field == "value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${samplesPerChannel})
  `;

  const rows = await queryApi.collectRows(query);
  const grouped = new Map<string, StoredRawTelemetryPacket>();

  for (const row of rows as any[]) {
    const channelName = String(row._measurement ?? "").split(".").pop() ?? "";
    const mapping = HERMES_CHANNELS[channelName];
    if (!mapping || (filters?.tlm_id && filters.tlm_id !== mapping.tlmId)) continue;

    const timestamp = new Date(row._time);
    const second = Math.floor(timestamp.getTime() / 1000);
    const key = `${mapping.tlmId}:${second}`;
    let packet = grouped.get(key);

    if (!packet) {
      const definition = telemetryMap[mapping.tlmId];
      packet = {
        record_id: `hermes-${mapping.tlmId}-${second}`,
        time: timestamp.toISOString(),
        satellite_id: String(row.satellite_id ?? "SAT-A"),
        tlm_id: mapping.tlmId,
        payload: "",
        decoded: {
          tlmId: mapping.tlmId,
          name: definition?.name ?? `Hermes Telemetry ${mapping.tlmId}`,
          kind: definition?.kind ?? "unknown",
          values: {},
          fields: [],
          rawPayload: "",
          byteLength: 0,
        },
      };
      grouped.set(key, packet);
    }

    const value = typeof row._value === "number" ? row._value : String(row._value);
    packet.decoded.values[mapping.field] = value;
    packet.decoded.fields.push({ name: mapping.field, value });
  }

  return Array.from(grouped.values())
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, requestedLimit);
}

function safeFieldName(value: string) {
  return value.replace(/[^a-zA-Z0-9_]/g, "_");
}

function parsePacketTimestamp(input: IncomingRawTelemetryPacket) {
  const rawTimestamp = input.ts ?? input.timestamp;
  const precision = input.time_precision ?? input.timePrecision ?? "ms";

  if (rawTimestamp === undefined || rawTimestamp === null || rawTimestamp === "") {
    return new Date();
  }

  if (typeof rawTimestamp === "string" && Number.isNaN(Number(rawTimestamp))) {
    const date = new Date(rawTimestamp);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid timestamp");
    }

    return date;
  }

  const numericTimestamp = Number(rawTimestamp);

  if (!Number.isFinite(numericTimestamp)) {
    throw new Error("Invalid numeric timestamp");
  }

  switch (precision) {
    case "s":
      return new Date(numericTimestamp * 1000);
    case "us":
      return new Date(Math.floor(numericTimestamp / 1000));
    case "ns":
      return new Date(Math.floor(numericTimestamp / 1_000_000));
    case "ms":
    default:
      return new Date(numericTimestamp);
  }
}

export function normalizeIncomingRawPacket(
  input: IncomingRawTelemetryPacket,
  recordId: string,
): StoredRawTelemetryPacket {
  const satelliteId = String(input.satellite_id ?? input.satelliteId ?? "SAT-A");
  const tlmId = String(input.tlm_id ?? input.tlmId ?? "");
  const payload = String(input.payload ?? input.payload_str ?? input.payloadHex ?? "");

  if (!tlmId) {
    throw new Error("Missing tlm_id");
  }

  if (!payload) {
    throw new Error("Missing payload");
  }

  const decoded = decodeTelemetryPayload(tlmId, payload);
  const time = parsePacketTimestamp(input).toISOString();

  return {
    record_id: recordId,
    time,
    satellite_id: satelliteId,
    tlm_id: tlmId,
    payload: decoded.rawPayload,
    decoded,
  };
}

export async function writeRawTelemetryPacket(packet: StoredRawTelemetryPacket) {
  const writeApi = getWriteApi();

  const point = new Point(RAW_TELEMETRY_MEASUREMENT)
    .tag("record_id", packet.record_id)
    .tag("satellite_id", packet.satellite_id)
    .tag("tlm_id", packet.tlm_id)
    .stringField("payload", packet.payload)
    .stringField("telemetry_name", packet.decoded.name)
    .stringField("decoded_json", JSON.stringify(packet.decoded.values))
    .intField("payload_byte_length", packet.decoded.byteLength)
    .timestamp(new Date(packet.time));

  for (const field of packet.decoded.fields) {
    const fieldName = safeFieldName(field.name);

    if (typeof field.value === "number") {
      point.floatField(fieldName, field.value);
    } else {
      point.stringField(fieldName, String(field.value));
    }
  }

  writeApi.writePoint(point);
  await writeApi.close();
}

export async function getRawTelemetryPackets(filters?: TelemetryPacketFilters) {
  const satelliteFilter = filters?.satellite_id
    ? `|> filter(fn: (r) => r.satellite_id == "${escapeFluxString(filters.satellite_id)}")`
    : "";

  const tlmFilter = filters?.tlm_id
    ? `|> filter(fn: (r) => r.tlm_id == "${escapeFluxString(filters.tlm_id)}")`
    : "";

  const limit = Math.min(Math.max(filters?.limit ?? 100, 1), 500);

  const fluxQuery = `
    from(bucket: "${influxConfig.bucket}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "${RAW_TELEMETRY_MEASUREMENT}")
      ${satelliteFilter}
      ${tlmFilter}
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"], desc: true)
      |> limit(n: ${limit})
  `;

  const [rows, hermesPackets] = await Promise.all([
    queryApi.collectRows(fluxQuery),
    getHermesTelemetryPackets(filters),
  ]);

  const rawPackets = rows.map((row: any): StoredRawTelemetryPacket => {
    let decodedValues: Record<string, number | string> = {};

    try {
      decodedValues = JSON.parse(row.decoded_json ?? "{}");
    } catch {
      decodedValues = {};
    }

    return {
      record_id: row.record_id,
      time: row._time,
      satellite_id: row.satellite_id,
      tlm_id: row.tlm_id,
      payload: row.payload,
      decoded: {
        tlmId: row.tlm_id,
        name: row.telemetry_name ?? `Unknown Telemetry ${row.tlm_id}`,
        kind: "unknown",
        values: decodedValues,
        fields: Object.entries(decodedValues).map(([name, value]) => ({ name, value })),
        rawPayload: row.payload,
        byteLength: Number(row.payload_byte_length ?? 0),
      },
    };
  });

  return [...rawPackets, ...hermesPackets]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, limit);
}

export async function deleteRawTelemetryPacket(recordId: string) {
  if (!isSafeId(recordId)) {
    throw new Error("Invalid record_id");
  }

  await deleteFromInflux({
    measurement: RAW_TELEMETRY_MEASUREMENT,
    predicate: `record_id="${recordId}"`,
  });
}
