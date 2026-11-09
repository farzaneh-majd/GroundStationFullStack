"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket } from "@/types/telemetry";
import { telemetryDataSource, runtimeConfig } from "@/services/telemetry";
import { usePolling } from "./usePolling";

type LoadOptions = { limit?: number; satellite_id?: string; tlm_id?: string; pollingMs?: number };
export function useRawTelemetryPackets(options?: LoadOptions, pollingMsOverride?: number) {
  const filters = { limit: options?.limit ?? 200, satellite_id: options?.satellite_id, tlm_id: options?.tlm_id };
  const effectivePollingMs = pollingMsOverride ?? options?.pollingMs ?? 3000;
  const [packets, setPackets] = useState<StoredRawTelemetryPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const filtersRef = useRef(filters); filtersRef.current = filters;

  const loadPackets = useCallback(async () => {
    try { setError(null); setPackets(await telemetryDataSource.listRawPackets(filtersRef.current)); setLastUpdate(new Date().toLocaleTimeString()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unknown packet loading error"); }
    finally { setLoading(false); }
  }, []);

  const createPacket = useCallback(async (packet: IncomingRawTelemetryPacket) => { const created = await telemetryDataSource.createRawPacket(packet); await loadPackets(); return created; }, [loadPackets]);
  const updatePacket = useCallback(async (recordId: string, packet: IncomingRawTelemetryPacket) => { const updated = await telemetryDataSource.updateRawPacket(recordId, packet); await loadPackets(); return updated; }, [loadPackets]);
  const deletePacket = useCallback(async (recordId: string) => { await telemetryDataSource.deleteRawPacket(recordId); await loadPackets(); }, [loadPackets]);

  // Legacy mode keeps the current app working. GraphQL mode switches to a real
  // subscription and only performs the initial historical query once.
  usePolling(loadPackets, runtimeConfig.dataSource === "legacy" ? effectivePollingMs : 0);
  useEffect(() => {
    if (runtimeConfig.dataSource !== "graphql") return;
    void loadPackets();
    if (!telemetryDataSource.subscribeRawPackets) return;
    return telemetryDataSource.subscribeRawPackets(filtersRef.current, (packet) => {
      setPackets((current) => [packet, ...current.filter((x) => x.record_id !== packet.record_id)].slice(0, filtersRef.current.limit ?? 200));
      setLastUpdate(new Date().toLocaleTimeString());
    }, (err) => setError(err.message));
  }, [loadPackets, filters.limit, filters.satellite_id, filters.tlm_id]);

  return { packets, loading, error, lastUpdate, loadPackets, createPacket, updatePacket, deletePacket, dataSource: runtimeConfig.dataSource };
}
