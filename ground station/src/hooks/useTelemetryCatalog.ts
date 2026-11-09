"use client";
import { useEffect, useState } from "react";
import { telemetryDataSource } from "@/services/telemetry";
import type { TelemetryCatalog } from "@/types/telemetry-domain";

export function useTelemetryCatalog(satelliteId?: string) {
  const [catalog, setCatalog] = useState<TelemetryCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null);
    telemetryDataSource.getCatalog(satelliteId).then((value) => active && setCatalog(value)).catch((err) => active && setError(err instanceof Error ? err.message : "Unable to load telemetry catalog")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [satelliteId]);
  return { catalog, channels: catalog?.channels ?? [], subsystems: catalog?.subsystems ?? [], loading, error };
}
