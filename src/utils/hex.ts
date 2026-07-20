export function normalizeHex(input: unknown, options?: { allowEmpty?: boolean }) {
  const cleanHex = String(input ?? "")
    .replace(/^0x/i, "")
    .replace(/\s+/g, "")
    .toUpperCase();

  if (!cleanHex && options?.allowEmpty) return "";

  if (!/^[0-9A-F]*$/.test(cleanHex)) {
    throw new Error("Payload must be a valid hex string");
  }

  if (cleanHex.length % 2 !== 0) {
    throw new Error("Payload hex length must be even");
  }

  return cleanHex;
}

export function normalizeHexWithFallback(input: unknown, fallback = "") {
  const raw = String(input ?? fallback)
    .replace(/^0x/i, "")
    .replace(/[^0-9a-fA-F]/g, "")
    .toUpperCase();

  if (raw.length === 0) return fallback;
  return raw.length % 2 === 0 ? raw : `0${raw}`;
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = normalizeHex(hex, { allowEmpty: true });
  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.slice(i, i + 2), 16);
  }

  return bytes;
}

export function crc16Ccitt(hex: string) {
  const cleanHex = normalizeHex(hex, { allowEmpty: true });
  let crc = 0xffff;

  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.slice(i, i + 2), 16);
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
