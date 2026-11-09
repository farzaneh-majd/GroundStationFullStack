"use client";
import { useMemo } from "react";
import { useRawTelemetryPackets } from "./useRawTelemetryPackets";
import { useTelemetryCatalog } from "./useTelemetryCatalog";
import { packetToTelemetryPoints } from "@/services/telemetry/points";
import { withStaleness } from "@/services/telemetry/quality";
import { alertFromPoint } from "@/services/telemetry/alerts";

export function useTelemetrySnapshot(satelliteId: string, pollingMs = 3000) {
  const packetsState = useRawTelemetryPackets({ satellite_id: satelliteId, limit: 500 }, pollingMs);
  const catalogState = useTelemetryCatalog(satelliteId);
  const points = useMemo(() => {
    if (!catalogState.catalog) return [];
    const latest = new Map<string, ReturnType<typeof packetToTelemetryPoints>[number]>();
    for (const packet of packetsState.packets) {
      for (const point of packetToTelemetryPoints(packet, catalogState.catalog)) {
        const key = `${point.channelId}:${point.field}`;
        const current = latest.get(key);
        if (!current || new Date(point.timestamp) > new Date(current.timestamp)) latest.set(key, point);
      }
    }
    return Array.from(latest.values()).map((point) => withStaleness(point, catalogState.catalog?.channels.find((c) => c.id === point.channelId)));
  }, [packetsState.packets, catalogState.catalog]);
  const alerts = useMemo(() => points.map(alertFromPoint).filter((item): item is NonNullable<typeof item> => item !== null), [points]);
  return { ...packetsState, catalog: catalogState.catalog, channels: catalogState.channels, subsystems: catalogState.subsystems, points, alerts, catalogLoading: catalogState.loading, catalogError: catalogState.error };
}
