"use client";

import { useCallback, useState } from "react";
import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket } from "@/types/telemetry";
import { usePolling } from "./usePolling";

type LoadOptions = {
  limit?: number;
  satellite_id?: string;
  tlm_id?: string;
};

function makeQuery(options?: LoadOptions) {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 200));
  if (options?.satellite_id) params.set("satellite_id", options.satellite_id);
  if (options?.tlm_id) params.set("tlm_id", options.tlm_id);
  return params.toString();
}

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
      const response = await fetch(`/api/telemetry/packets?${makeQuery({ limit, satellite_id: satelliteId, tlm_id: tlmId })}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load packets");
      }

      setPackets(Array.isArray(data) ? data : []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown packet loading error");
    } finally {
      setLoading(false);
    }
  }, [limit, satelliteId, tlmId]);

  const createPacket = useCallback(async (packet: IncomingRawTelemetryPacket) => {
    const response = await fetch("/api/telemetry/packets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packet),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to create packet");
    }

    await loadPackets();
    return data as StoredRawTelemetryPacket;
  }, [loadPackets]);

  const updatePacket = useCallback(async (recordId: string, packet: IncomingRawTelemetryPacket) => {
    const response = await fetch(`/api/telemetry/packets/${recordId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(packet),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to update packet");
    }

    await loadPackets();
    return data as StoredRawTelemetryPacket;
  }, [loadPackets]);

  const deletePacket = useCallback(async (recordId: string) => {
    const response = await fetch(`/api/telemetry/packets/${recordId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to delete packet");
    }

    await loadPackets();
  }, [loadPackets]);

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
