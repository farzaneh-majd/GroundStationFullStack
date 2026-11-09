import type { SampleInput, StoredSample } from "@/types/sample";
import { crc16Ccitt, normalizeHexWithFallback } from "./hex";

function maybeNumber(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

export function buildSample(input: SampleInput, recordId: string): StoredSample {
  const tlmId = normalizeHexWithFallback(input.tlmId, "01");
  const dataHex = normalizeHexWithFallback(input.dataHex, "00");
  const sync = normalizeHexWithFallback(input.sync, "AA55");
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
    crc: crc16Ccitt(payloadHex),
    value: maybeNumber(input.value),
    x: maybeNumber(input.x),
    y: maybeNumber(input.y),
    z: maybeNumber(input.z),
    unit: input.unit || "",
  };
}
