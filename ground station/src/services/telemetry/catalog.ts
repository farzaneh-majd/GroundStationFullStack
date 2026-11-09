import { telemetryMap, telemetryMapVersion } from "@/data/telemetryMap";
import type { TelemetryCatalog, TelemetryChannel, TelemetrySubsystem } from "@/types/telemetry-domain";

function inferSubsystem(name: string): string {
  const value = name.toLowerCase();
  if (value.includes("imu") || value.includes("magnet")) return "ADCS";
  if (value.includes("battery") || value.includes("solar")) return "EPS";
  if (value.includes("temperature") || value.includes("humidity")) return "THERMAL";
  return "OBC";
}

export function buildLegacyTelemetryCatalog(satelliteId?: string): TelemetryCatalog {
  const channels: TelemetryChannel[] = Object.values(telemetryMap).map((definition) => {
    const subsystem = definition.subsystem ?? inferSubsystem(definition.name);
    return {
      id: `${satelliteId ?? "mission"}:${definition.tlmId}`,
      telemetryId: definition.tlmId,
      satelliteId,
      subsystem,
      name: definition.name,
      description: definition.description,
      kind: definition.kind,
      endian: definition.endian,
      source: definition.source?.toUpperCase() === "FPRIME" ? "FPRIME" : "SIMULATOR",
      sampleRateHz: definition.sampleRateHz,
      fields: definition.fields.map((field) => ({
        key: field.name,
        name: field.name,
        format: field.format,
        unit: field.unit,
        endian: field.endian,
        enumMap: field.enumMap ?? field.enum,
        limits: definition.limits,
      })),
    };
  });

  const grouped = new Map<string, TelemetryChannel[]>();
  channels.forEach((channel) => grouped.set(channel.subsystem, [...(grouped.get(channel.subsystem) ?? []), channel]));
  const subsystems: TelemetrySubsystem[] = Array.from(grouped.entries()).map(([name, subsystemChannels]) => ({
    id: name.toLowerCase(), name, channels: subsystemChannels,
  }));
  return { version: telemetryMapVersion, satelliteId, subsystems, channels };
}
