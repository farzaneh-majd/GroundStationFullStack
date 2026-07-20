"use client";

import { useState } from "react";
import { Badge, Button } from "@grafana/ui";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Panel from "@/components/ui/Panel";
import TextField from "@/components/ui/TextField";
import { useSamples } from "@/hooks/useSamples";
import type { StoredSample } from "@/types/sample";
import { formatTime } from "@/utils/format";

export default function SampleCrudPanel() {
  const { samples, loading, error, lastUpdate, loadSamples, createSample, updateSample, deleteSample } = useSamples({ limit: 100, pollingMs: 5000 });
  const [selectedSample, setSelectedSample] = useState<StoredSample | null>(null);
  const [form, setForm] = useState({
    sampleType: "magnetometer",
    tlmId: "20",
    dataHex: "00112233445566778899",
    value: "42",
    x: "12.5",
    y: "-3.1",
    z: "7.8",
    unit: "uT",
  });
  const [formError, setFormError] = useState<string | null>(null);

  function setField(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function loadForEdit(sample: StoredSample) {
    setSelectedSample(sample);
    setForm({
      sampleType: sample.sampleType,
      tlmId: sample.tlmId,
      dataHex: sample.dataHex,
      value: String(sample.value ?? ""),
      x: String(sample.x ?? ""),
      y: String(sample.y ?? ""),
      z: String(sample.z ?? ""),
      unit: sample.unit ?? "",
    });
  }

  async function submit() {
    try {
      setFormError(null);
      const payload = {
        sampleType: form.sampleType,
        tlmId: form.tlmId,
        dataHex: form.dataHex,
        value: form.value === "" ? undefined : Number(form.value),
        x: form.x === "" ? undefined : Number(form.x),
        y: form.y === "" ? undefined : Number(form.y),
        z: form.z === "" ? undefined : Number(form.z),
        unit: form.unit,
      };

      if (selectedSample) {
        const updated = await updateSample(selectedSample.recordId, payload);
        setSelectedSample(updated);
      } else {
        const created = await createSample(payload);
        setSelectedSample(created);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to submit sample");
    }
  }

  if (loading) {
    return <LoadingState label="Loading sample CRUD data" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">API / CRUD Test</h2>
          <p className="mt-1 text-sm text-[#9fa7b3]">
            Manual CRUD panel for <span className="font-mono">/api/samples</span> and the <span className="font-mono">tlm_samples</span> measurement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge text="CRUD" color="orange" />
          <span className="text-xs text-[#9fa7b3]">Last update: {lastUpdate || "--"}</span>
          <Button size="sm" onClick={loadSamples}>Refresh</Button>
        </div>
      </div>

      {(error || formError) && (
        <div className="rounded border border-[#F2495C] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {error || formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <Panel
          title={selectedSample ? "Update Sample" : "Create Sample"}
          subtitle={selectedSample ? `PUT /api/samples/${selectedSample.recordId}` : "POST /api/samples"}
        >
          <div className="space-y-3">
            <TextField label="Sample Type" value={form.sampleType} onChange={(value) => setField("sampleType", value)} />
            <TextField label="tlmId" value={form.tlmId} onChange={(value) => setField("tlmId", value)} />
            <TextField label="DATA hex" value={form.dataHex} onChange={(value) => setField("dataHex", value)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Value" value={form.value} onChange={(value) => setField("value", value)} />
              <TextField label="Unit" value={form.unit} onChange={(value) => setField("unit", value)} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <TextField label="X" value={form.x} onChange={(value) => setField("x", value)} />
              <TextField label="Y" value={form.y} onChange={(value) => setField("y", value)} />
              <TextField label="Z" value={form.z} onChange={(value) => setField("z", value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={submit}>{selectedSample ? "PUT Sample" : "POST Sample"}</Button>
              {selectedSample && (
                <Button variant="secondary" onClick={() => setSelectedSample(null)}>
                  Clear Selection
                </Button>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Stored Samples" subtitle="GET /api/samples">
          {samples.length === 0 ? (
            <EmptyState title="No samples" message="Create a sample from the form or seed the InfluxDB database." />
          ) : (
            <div className="gs-scrollbar overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[#9fa7b3]">
                  <tr>
                    <th className="p-2">Time</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">tlmId</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">X/Y/Z</th>
                    <th className="p-2">CRC</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {samples.map((sample) => (
                    <tr key={sample.recordId} className="border-t border-[#2f3240]">
                      <td className="p-2 text-[#9fa7b3]">{formatTime(sample.time)}</td>
                      <td className="p-2">{sample.sampleType}</td>
                      <td className="p-2 font-mono">{sample.tlmId}</td>
                      <td className="p-2">{sample.value ?? "--"} {sample.unit}</td>
                      <td className="p-2">{sample.x ?? "--"} / {sample.y ?? "--"} / {sample.z ?? "--"}</td>
                      <td className="p-2 font-mono">{sample.crc}</td>
                      <td className="flex gap-2 p-2">
                        <Button size="sm" variant="secondary" onClick={() => loadForEdit(sample)}>Edit</Button>
                        <button
                          type="button"
                          onClick={() => void deleteSample(sample.recordId)}
                          className="rounded border border-[#F2495C] px-3 py-1 text-xs text-[#ff9ba8] hover:bg-[#2a1217]"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
