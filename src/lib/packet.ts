export type SampleInput = {
  tlmId?: string;
  sampleType?: string;
  dataHex?: string;
  value?: number;
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
  sync?: string;
};

export type telemetry = {
 header: string;
};

export type StoredSample = {
  recordId: string;
  time: string;
  sampleType: string;
  tlmId: string;
  sync: string;
  len: number;
  payloadHex: string;
  dataHex: string;
  crc: string;
  value?: number;
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
};

function normalizeHex(input: unknown, fallback = "") {
  const raw = String(input ?? fallback)
    .replace(/^0x/i, "")
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase();

  if (raw.length === 0) return fallback;
  return raw.length % 2 === 0 ? raw : `0${raw}`;
}

function mockCrc16(hex: string) {
  let crc = 0xffff;

  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function maybeNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function buildSample(
  input: SampleInput,
  recordId: string,
): StoredSample {
  const tlmId = normalizeHex(input.tlmId, "01");
  const dataHex = normalizeHex(input.dataHex, "00");
  const sync = normalizeHex(input.sync, "AA55");

  const payloadHex = `${tlmId}${dataHex}`;

  return {
    recordId,
    time: new Date().toISOString(),
    sampleType: input.sampleType || "generic",
    tlmId,
    sync,
    len: payloadHex.length / 2,
    payloadHex,
    dataHex,
    crc: mockCrc16(payloadHex),
    value: maybeNumber(input.value),
    x: maybeNumber(input.x),
    y: maybeNumber(input.y),
    z: maybeNumber(input.z),
    unit: input.unit || "",
  };
}
