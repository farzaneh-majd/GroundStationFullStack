import type { TelemetryAlert, TelemetryPoint } from "@/types/telemetry-domain";

export function alertFromPoint(point: TelemetryPoint): TelemetryAlert | null {
  if (point.quality !== "WARNING" && point.quality !== "CRITICAL" && point.quality !== "STALE") return null;
  return {
    id: `${point.satelliteId}:${point.channelId}:${point.field}:${point.timestamp}:${point.quality}`,
    satelliteId: point.satelliteId,
    channelId: point.channelId,
    field: point.field,
    severity: point.quality,
    message: point.quality === "STALE" ? `${point.field} telemetry is stale` : `${point.field} is outside ${point.quality.toLowerCase()} limits`,
    timestamp: point.timestamp,
    value: point.value,
    acknowledged: false,
  };
}
