"use client";

import { useCallback, useState } from "react";
import type { SampleInput, StoredSample } from "@/types/sample";
import { usePolling } from "./usePolling";

type LoadOptions = {
  sampleType?: string;
  limit?: number;
  pollingMs?: number;
};

function makeQuery(options?: LoadOptions) {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 100));
  if (options?.sampleType) params.set("sampleType", options.sampleType);
  return params.toString();
}

export function useSamples(options?: LoadOptions) {
  const sampleType = options?.sampleType;
  const limit = options?.limit ?? 100;
  const pollingMs = options?.pollingMs ?? 5000;

  const [samples, setSamples] = useState<StoredSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const loadSamples = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/samples?${makeQuery({ sampleType, limit })}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to load samples");
      }

      setSamples(Array.isArray(data) ? data : []);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown sample loading error");
    } finally {
      setLoading(false);
    }
  }, [sampleType, limit]);

  const createSample = useCallback(async (sample: SampleInput) => {
    const response = await fetch("/api/samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sample),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to create sample");
    }

    await loadSamples();
    return data as StoredSample;
  }, [loadSamples]);

  const updateSample = useCallback(async (recordId: string, sample: SampleInput) => {
    const response = await fetch(`/api/samples/${recordId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sample),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to update sample");
    }

    await loadSamples();
    return data as StoredSample;
  }, [loadSamples]);

  const deleteSample = useCallback(async (recordId: string) => {
    const response = await fetch(`/api/samples/${recordId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error ?? "Failed to delete sample");
    }

    await loadSamples();
  }, [loadSamples]);

  usePolling(loadSamples, pollingMs);

  return {
    samples,
    loading,
    error,
    lastUpdate,
    loadSamples,
    createSample,
    updateSample,
    deleteSample,
  };
}
