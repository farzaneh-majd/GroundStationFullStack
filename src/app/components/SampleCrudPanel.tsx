"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Spinner } from "@grafana/ui";

type Sample = {
  recordId: string;
  time: string;
  sampleType: string;
  tlmId: string;
  sync: string;
  len: number;
  payloadHex: string;
  dataHex: string;
  crc: string;
  value?: number;
  x?: number;
  y?: number;
  z?: number;
  unit?: string;
};

export default function SampleCrudPanel() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function loadSamples() {
    setLoading(true);

    const res = await fetch("/api/samples", {
      cache: "no-store",
    });

    const data = await res.json();

    setSamples(data);
    setLoading(false);
  }

  async function createSample() {
    await fetch("/api/samples", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sampleType: form.sampleType,
        tlmId: form.tlmId,
        dataHex: form.dataHex,
        value: Number(form.value),
        x: Number(form.x),
        y: Number(form.y),
        z: Number(form.z),
        unit: form.unit,
      }),
    });

    await loadSamples();
  }

  async function updateSample(sample: Sample) {
    await fetch(`/api/samples/${sample.recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sampleType: sample.sampleType,
        tlmId: sample.tlmId,
        dataHex: sample.dataHex,
        value: Number(sample.value ?? 0) + 1,
        x: Number(sample.x ?? 0) + 0.1,
        y: sample.y ?? 0,
        z: sample.z ?? 0,
        unit: sample.unit || "",
      }),
    });

    await loadSamples();
  }

  async function deleteSample(recordId: string) {
    await fetch(`/api/samples/${recordId}`, {
      method: "DELETE",
    });

    await loadSamples();
  }

  useEffect(() => {
    loadSamples();
  }, []);

  return (
    <main className="min-h-screen bg-[#111217] text-[#d8d9da]">
      <header className="flex items-center justify-between border-b border-[#2f3240] bg-[#181b24] px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold">CubeSat Telemetry CRUD</h1>
          <p className="text-sm text-[#9fa7b3]">
           ISSS GS dashboard
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge text="INFLUXDB" color="blue" />
          <Button size="sm" onClick={loadSamples}>
            Refresh
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-[360px_1fr] gap-6 p-6">
        <div className="rounded border border-[#2f3240] bg-[#181b24] p-4">
          <h2 className="mb-4 text-lg font-semibold">Create Mock Sample</h2>

          <div className="space-y-3">
            <Field
              label="Sample Type"
              value={form.sampleType}
              onChange={(value) => setForm({ ...form, sampleType: value })}
            />

            <Field
              label="tlmId"
              value={form.tlmId}
              onChange={(value) => setForm({ ...form, tlmId: value })}
            />

            <Field
              label="DATA hex"
              value={form.dataHex}
              onChange={(value) => setForm({ ...form, dataHex: value })}
            />

            <Field
              label="Value"
              value={form.value}
              onChange={(value) => setForm({ ...form, value })}
            />

            <Field
              label="X"
              value={form.x}
              onChange={(value) => setForm({ ...form, x: value })}
            />

            <Field
              label="Y"
              value={form.y}
              onChange={(value) => setForm({ ...form, y: value })}
            />

            <Field
              label="Z"
              value={form.z}
              onChange={(value) => setForm({ ...form, z: value })}
            />

            <Field
              label="Unit"
              value={form.unit}
              onChange={(value) => setForm({ ...form, unit: value })}
            />

            <Button onClick={createSample}>POST Sample</Button>
          </div>
        </div>

        <div className="rounded border border-[#2f3240] bg-[#181b24]">
          <div className="border-b border-[#2f3240] px-4 py-3">
            <h2 className="text-lg font-semibold">Stored Samples</h2>
          </div>

          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full text-left text-sm">
                <thead className="text-[#9fa7b3]">
                  <tr>
                    <th className="p-2">Type</th>
                    <th className="p-2">tlmId</th>
                    <th className="p-2">LEN</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">X/Y/Z</th>
                    <th className="p-2">CRC</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {samples.map((sample) => (
                    <tr
                      key={sample.recordId}
                      className="border-t border-[#2f3240]"
                    >
                      <td className="p-2">{sample.sampleType}</td>
                      <td className="p-2 font-mono">{sample.tlmId}</td>
                      <td className="p-2">{sample.len}</td>
                      <td className="p-2">
                        {sample.value ?? "--"} {sample.unit}
                      </td>
                      <td className="p-2">
                        {sample.x ?? "--"} / {sample.y ?? "--"} /{" "}
                        {sample.z ?? "--"}
                      </td>
                      <td className="p-2 font-mono">{sample.crc}</td>
                      <td className="flex gap-2 p-2">
                        <Button size="sm" onClick={() => updateSample(sample)}>
                          PUT
                        </Button>

                        <button
                          onClick={() => deleteSample(sample.recordId)}
                          className="rounded border border-red-500 px-3 py-1 text-red-400 hover:bg-red-950"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {samples.length === 0 && (
                <div className="p-8 text-center text-[#9fa7b3]">
                  No samples yet. Create one from the left panel.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-[#9fa7b3]">{label}</div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-[#2f3240] bg-[#111217] px-3 py-2 text-[#d8d9da] outline-none focus:border-[#73BF69]"
      />
    </label>
  );
}
