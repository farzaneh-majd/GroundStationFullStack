"use client";
import { useEffect, useState } from "react";
import { telemetryDataSource, runtimeConfig } from "@/services/telemetry";
import type { TelemetryPoint } from "@/types/telemetry-domain";

export function useLiveTelemetry(satelliteId: string, channelId?: string, field?: string, maxPoints = 500) {
  const [points, setPoints] = useState<TelemetryPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setPoints([]); setError(null);
    if (runtimeConfig.dataSource !== "graphql" || !telemetryDataSource.subscribeTelemetry) return;
    return telemetryDataSource.subscribeTelemetry(satelliteId, (point) => setPoints((current) => [...current, point].slice(-maxPoints)), (err) => setError(err.message), channelId, field);
  }, [satelliteId, channelId, field, maxPoints]);
  return { points, latest: points.at(-1) ?? null, error, live: runtimeConfig.dataSource === "graphql" };
}
