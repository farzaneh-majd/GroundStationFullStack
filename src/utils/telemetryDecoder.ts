import { telemetryMap } from "@/data/telemetryMap";
import type {
  DecodedTelemetry,
  FieldFormat,
  TelemetryField,
} from "@/types/telemetry";
import { hexToBytes, normalizeHex } from "./hex";

export function getFormatByteSize(format: FieldFormat): number {
  switch (format) {
    case "u8":
    case "i8":
      return 1;

    case "u16":
    case "i16":
      return 2;

    case "u32":
    case "i32":
    case "f32":
      return 4;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function readValue(
  view: DataView,
  offset: number,
  format: FieldFormat,
  littleEndian: boolean,
): number {
  switch (format) {
    case "u8":
      return view.getUint8(offset);

    case "i8":
      return view.getInt8(offset);

    case "u16":
      return view.getUint16(offset, littleEndian);

    case "i16":
      return view.getInt16(offset, littleEndian);

    case "u32":
      return view.getUint32(offset, littleEndian);

    case "i32":
      return view.getInt32(offset, littleEndian);

    case "f32":
      return view.getFloat32(offset, littleEndian);

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function enumValue(field: TelemetryField, rawValue: number): number | string {
  const enumMap = field.enum ?? field.enumMap;
  return enumMap?.[String(rawValue)] ?? rawValue;
}

export function decodeTelemetryPayload(
  tlmId: string | number,
  payloadHex: string,
): DecodedTelemetry {
  const id = String(tlmId);
  const cleanPayload = normalizeHex(payloadHex, { allowEmpty: true });
  const definition = telemetryMap[id];

  if (!definition) {
    return {
      tlmId: id,
      name: `Unknown Telemetry ${id}`,
      kind: "unknown",
      values: { raw: cleanPayload },
      fields: [{ name: "raw", value: cleanPayload }],
      rawPayload: cleanPayload,
      byteLength: cleanPayload.length / 2,
    };
  }

  const bytes = hexToBytes(cleanPayload);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const values: Record<string, number | string> = {};
  const fields: DecodedTelemetry["fields"] = [];

  let offset = 0;

  for (const field of definition.fields) {
    const byteSize = getFormatByteSize(field.format);

    if (offset + byteSize > bytes.length) {
      throw new Error(
        `Payload too short for ${definition.name}.${field.name}. Expected ${byteSize} byte(s) at offset ${offset}, got ${bytes.length} byte(s).`,
      );
    }

    const endian = field.endian ?? definition.endian ?? "big";
    const rawValue = readValue(view, offset, field.format, endian === "little");
    const decodedValue = enumValue(field, rawValue);

    values[field.name] = decodedValue;
    fields.push({
      name: field.name,
      value: decodedValue,
      unit: field.unit,
      format: field.format,
    });

    offset += byteSize;
  }

  return {
    tlmId: id,
    name: definition.name,
    kind: definition.kind,
    values,
    fields,
    rawPayload: cleanPayload,
    byteLength: bytes.length,
  };
}
