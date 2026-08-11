"use client";

import { useCallback, useState } from "react";
import {
  createPacket as createPacketRecord,
  deletePacket as deletePacketRecord,
  listPackets,
  updatePacket as updatePacketRecord,
} from "@/data/data";
import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket } from "@/types/telemetry";
import { usePolling } from "./usePolling";

type LoadOptions = {
  limit?: number;
  satellite_id?: string;
  tlm_id?: string;
};

export function useRawTelemetryPackets(options?: LoadOptions & { pollingMs?: number }) {
  const limit = options?.limit ?? 200;
  const satelliteId = options?.satellite_id;
  const tlmId = options?.tlm_id;
  const pollingMs = options?.pollingMs ?? 3000;

  const [packets, setPackets] = useState<StoredRawTelemetryPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const loadPackets = useCallback(async () => {
    try {
      setError(null);
      const nextPackets = listPackets({ limit, satelliteId, tlmId });
      setPackets(nextPackets);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown packet loading error");
    } finally {
      setLoading(false);
    }
  }, [limit, satelliteId, tlmId]);

  const createPacket = useCallback(async (packet: IncomingRawTelemetryPacket) => {
    const created = createPacketRecord(packet);
    const nextPackets = listPackets({ limit, satelliteId, tlmId });
    setPackets(nextPackets);
    setLastUpdate(new Date().toLocaleTimeString());
    return created;
  }, [limit, satelliteId, tlmId]);

  const updatePacket = useCallback(async (recordId: string, packet: IncomingRawTelemetryPacket) => {
    const updated = updatePacketRecord(recordId, packet);
    const nextPackets = listPackets({ limit, satelliteId, tlmId });
    setPackets(nextPackets);
    setLastUpdate(new Date().toLocaleTimeString());
    return updated;
  }, [limit, satelliteId, tlmId]);

  const deletePacket = useCallback(async (recordId: string) => {
    deletePacketRecord(recordId);
    const nextPackets = listPackets({ limit, satelliteId, tlmId });
    setPackets(nextPackets);
    setLastUpdate(new Date().toLocaleTimeString());
  }, [limit, satelliteId, tlmId]);

  usePolling(loadPackets, pollingMs);

  return {
    packets,
    loading,
    error,
    lastUpdate,
    loadPackets,
    createPacket,
    updatePacket,
    deletePacket,
  };
}
