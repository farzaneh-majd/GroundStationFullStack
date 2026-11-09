export type PayloadType = "number" | "string" | "json" | "boolean";

export type RawInfluxTelemetryRow = {
  _time?: string;
  time?: string;
  satellite_id?: string;
  satelliteId?: string;
  tlm_id?: string;
  tlmId?: string;
  payload?: string;
  _value?: string;
};

export type TelemetryDefinition = {
  tlmId: string;
  name: string;
  unit: string;
  type: PayloadType;
  description?: string;
  warningLimit?: number;
  criticalLimit?: number;
};

export type InterpretedTelemetry = {
  time: string;
  satelliteId: string;
  tlmId: string;
  name: string;
  value: number | string | boolean | object | null;
  rawPayload: string;
  unit: string;
  type: PayloadType;
  status: "normal" | "warning" | "critical" | "unknown";
  description?: string;
};

export const telemetryMap: Record<string, TelemetryDefinition> = {
  "1": {
    tlmId: "1",
    name: "Temperature",
    unit: "°C",
    type: "number",
    description: "Internal satellite temperature",
    warningLimit: 30,
    criticalLimit: 40,
  },

  "2": {
    tlmId: "2",
    name: "Battery Voltage",
    unit: "V",
    type: "number",
    description: "EPS battery voltage",
    warningLimit: 7.0,
    criticalLimit: 6.6,
  },

  "3": {
    tlmId: "3",
    name: "Satellite Mode",
    unit: "",
    type: "string",
    description: "Current satellite operation mode",
  },

  "4": {
    tlmId: "4",
    name: "Payload Data",
    unit: "",
    type: "json",
    description: "Generic payload data",
  },

  "5": {
    tlmId: "5",
    name: "Communication Status",
    unit: "",
    type: "boolean",
    description: "Communication subsystem status",
  },
};

export function parsePayload(
  payload: string | undefined | null,
  definition?: TelemetryDefinition
): number | string | boolean | object | null {
  if (payload === undefined || payload === null) {
    return null;
  }

  const cleanPayload = String(payload).trim();

  if (!definition) {
    return cleanPayload;
  }

  switch (definition.type) {
    case "number": {
      const numericValue = Number(cleanPayload);

      if (Number.isNaN(numericValue)) {
        return cleanPayload;
      }

      return numericValue;
    }

    case "boolean": {
      const lower = cleanPayload.toLowerCase();

      if (lower === "true" || cleanPayload === "1") {
        return true;
      }

      if (lower === "false" || cleanPayload === "0") {
        return false;
      }

      return cleanPayload;
    }

    case "json": {
      try {
        return JSON.parse(cleanPayload);
      } catch {
        return cleanPayload;
      }
    }

    case "string":
    default:
      return cleanPayload;
  }
}

export function getTelemetryStatus(
  value: number | string | boolean | object | null,
  definition?: TelemetryDefinition
): "normal" | "warning" | "critical" | "unknown" {
  if (!definition) {
    return "unknown";
  }

  if (definition.type !== "number") {
    return "normal";
  }

  if (typeof value !== "number") {
    return "unknown";
  }

  if (
    typeof definition.criticalLimit === "number" &&
    value >= definition.criticalLimit
  ) {
    return "critical";
  }

  if (
    typeof definition.warningLimit === "number" &&
    value >= definition.warningLimit
  ) {
    return "warning";
  }

  return "normal";
}

export function interpretTelemetryRow(
  row: RawInfluxTelemetryRow
): InterpretedTelemetry {
  const time = row._time ?? row.time ?? "";
  const satelliteId = row.satellite_id ?? row.satelliteId ?? "UNKNOWN_SAT";
  const tlmId = String(row.tlm_id ?? row.tlmId ?? "UNKNOWN_TLM");

  const rawPayload = String(row.payload ?? row._value ?? "");

  const definition = telemetryMap[tlmId];

  const value = parsePayload(rawPayload, definition);

  const status = getTelemetryStatus(value, definition);

  return {
    time,
    satelliteId,
    tlmId,
    name: definition?.name ?? `Unknown Telemetry ${tlmId}`,
    value,
    rawPayload,
    unit: definition?.unit ?? "",
    type: definition?.type ?? "string",
    status,
    description: definition?.description,
  };
}

export function interpretTelemetryRows(
  rows: RawInfluxTelemetryRow[]
): InterpretedTelemetry[] {
  return rows.map((row) => interpretTelemetryRow(row));
}

export function getTelemetryDefinition(
  tlmId: string
): TelemetryDefinition | undefined {
  return telemetryMap[String(tlmId)];
}

export function getTelemetryDisplayValue(item: InterpretedTelemetry): string {
  if (item.value === null || item.value === undefined) {
    return "N/A";
  }

  if (typeof item.value === "object") {
    return JSON.stringify(item.value);
  }

  if (item.unit) {
    return `${item.value} ${item.unit}`;
  }

  return String(item.value);
}

export function groupTelemetryByTlmId(
  rows: InterpretedTelemetry[]
): Record<string, InterpretedTelemetry[]> {
  return rows.reduce<Record<string, InterpretedTelemetry[]>>((acc, item) => {
    if (!acc[item.tlmId]) {
      acc[item.tlmId] = [];
    }

    acc[item.tlmId].push(item);

    return acc;
  }, {});
}

export function getLatestTelemetryByTlmId(
  rows: InterpretedTelemetry[]
): Record<string, InterpretedTelemetry> {
  return rows.reduce<Record<string, InterpretedTelemetry>>((acc, item) => {
    const current = acc[item.tlmId];

    if (!current) {
      acc[item.tlmId] = item;
      return acc;
    }

    const currentTime = new Date(current.time).getTime();
    const itemTime = new Date(item.time).getTime();

    if (itemTime > currentTime) {
      acc[item.tlmId] = item;
    }

    return acc;
  }, {});
}