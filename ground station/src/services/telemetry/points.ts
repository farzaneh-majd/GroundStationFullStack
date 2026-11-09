import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import type { TelemetryCatalog, TelemetryPoint } from "@/types/telemetry-domain";
import { evaluateNumericQuality } from "./quality";

export function packetToTelemetryPoints(packet: StoredRawTelemetryPacket, catalog: TelemetryCatalog): TelemetryPoint[] {
  const channel = catalog.channels.find((item) => item.telemetryId === String(packet.tlm_id));
  if (!channel) return [];
  return Object.entries(packet.decoded.values).map(([fieldKey, value]) => {
    const field = channel.fields.find((item) => item.key === fieldKey);
    return {
      satelliteId: packet.satellite_id,
      channelId: channel.id,
      telemetryId: channel.telemetryId,
      field: fieldKey,
      timestamp: packet.time,
      value,
      unit: field?.unit,
      quality: evaluateNumericQuality(value, field),
      source: channel.source,
    } satisfies TelemetryPoint;
  });
}
