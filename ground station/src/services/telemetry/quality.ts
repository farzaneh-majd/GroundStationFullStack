import type { TelemetryChannel, TelemetryChannelField, TelemetryPoint, TelemetryQuality } from "@/types/telemetry-domain";

export function evaluateNumericQuality(value: unknown, field?: TelemetryChannelField): TelemetryQuality {
  if (typeof value !== "number" || !Number.isFinite(value)) return "UNKNOWN";
  const limits = field?.limits;
  if (!limits) return "GOOD";
  if ((limits.criticalLow !== undefined && value < limits.criticalLow) || (limits.criticalHigh !== undefined && value > limits.criticalHigh)) return "CRITICAL";
  if ((limits.warningLow !== undefined && value < limits.warningLow) || (limits.warningHigh !== undefined && value > limits.warningHigh)) return "WARNING";
  return "GOOD";
}

export function withStaleness(point: TelemetryPoint, channel?: TelemetryChannel, now = Date.now()): TelemetryPoint {
  const staleAfterMs = channel?.staleAfterMs ?? (channel?.sampleRateHz ? Math.max(3000, (3 / channel.sampleRateHz) * 1000) : 15000);
  const timestamp = new Date(point.timestamp).getTime();
  if (Number.isFinite(timestamp) && now - timestamp > staleAfterMs) return { ...point, quality: "STALE" };
  return point;
}
