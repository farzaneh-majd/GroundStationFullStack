"use client";

import { useCallback, useState } from "react";
import {
  createSample as createSampleRecord,
  deleteSample as deleteSampleRecord,
  listSamples,
  updateSample as updateSampleRecord,
} from "@/data/data";
import type { SampleInput, StoredSample } from "@/types/sample";
import { usePolling } from "./usePolling";

type LoadOptions = {
  sampleType?: string;
  limit?: number;
  pollingMs?: number;
};

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
      const nextSamples = listSamples({ sampleType, limit });
      setSamples(nextSamples);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown sample loading error");
    } finally {
      setLoading(false);
    }
  }, [sampleType, limit]);

  const createSample = useCallback(async (sample: SampleInput) => {
    const created = createSampleRecord(sample);
    const nextSamples = listSamples({ sampleType, limit });
    setSamples(nextSamples);
    setLastUpdate(new Date().toLocaleTimeString());
    return created;
  }, [sampleType, limit]);

  const updateSample = useCallback(async (recordId: string, sample: SampleInput) => {
    const updated = updateSampleRecord(recordId, sample);
    const nextSamples = listSamples({ sampleType, limit });
    setSamples(nextSamples);
    setLastUpdate(new Date().toLocaleTimeString());
    return updated;
  }, [sampleType, limit]);

  const deleteSample = useCallback(async (recordId: string) => {
    deleteSampleRecord(recordId);
    const nextSamples = listSamples({ sampleType, limit });
    setSamples(nextSamples);
    setLastUpdate(new Date().toLocaleTimeString());
  }, [sampleType, limit]);

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
