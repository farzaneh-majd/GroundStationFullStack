"use client";
import { useEffect, useState } from "react";
import { telemetryDataSource } from "@/services/telemetry";
import type { TelemetryHistoryInput, TelemetrySeries } from "@/types/telemetry-domain";

export function useTelemetryHistory(input: TelemetryHistoryInput | null) {
  const [series, setSeries] = useState<TelemetrySeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!input) return;
    let active = true; setLoading(true); setError(null);
    telemetryDataSource.getHistory(input).then((value) => active && setSeries(value)).catch((err) => active && setError(err instanceof Error ? err.message : "Unable to load telemetry history")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [input]);
  return { series, loading, error };
}
