"use client";

import { Badge, Button } from "@grafana/ui";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Panel from "@/components/ui/Panel";
import StatCard from "@/components/ui/StatCard";
import { useSamples } from "@/hooks/useSamples";
import type { StoredSample } from "@/types/sample";
import { formatNumber, formatTime, toNumber, vectorMagnitude } from "@/utils/format";

type ChartPoint = {
  time: string;
  label: string;
  value: number;
};

function getLatest(samples: StoredSample[], sampleType: string) {
  return samples.find((sample) => sample.sampleType === sampleType);
}

function makeValueSeries(samples: StoredSample[], sampleType: string): ChartPoint[] {
  return samples
    .filter((sample) => sample.sampleType === sampleType)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((sample) => ({
      time: sample.time,
      label: formatTime(sample.time),
      value: toNumber(sample.value) ?? 0,
    }));
}

function makeMagnetometerSeries(samples: StoredSample[]): ChartPoint[] {
  return samples
    .filter((sample) => sample.sampleType === "magnetometer")
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((sample) => ({
      time: sample.time,
      label: formatTime(sample.time),
      value: vectorMagnitude(sample.x, sample.y, sample.z),
    }));
}

function TelemetryChart({ data, unit }: { data: ChartPoint[]; unit: string }) {
  if (data.length === 0) {
    return <EmptyState title="No chart data" message="Seed mock samples or POST new samples first." />;
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#2f3240" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fill: "#9fa7b3", fontSize: 11 }} />
          <YAxis tick={{ fill: "#9fa7b3", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              background: "#181b24",
              border: "1px solid #2f3240",
              color: "#d8d9da",
            }}
            formatter={(value) => [`${Number(value).toFixed(2)} ${unit}`, "Value"]}
          />
          <Line type="monotone" dataKey="value" dot={false} stroke="#73BF69" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MockTelemetryDashboard() {
  const { samples, loading, error, lastUpdate, loadSamples } = useSamples({ limit: 200, pollingMs: 5000 });

  const latestBattery = getLatest(samples, "battery");
  const latestTemperature = getLatest(samples, "temperature");
  const latestMagnetometer = getLatest(samples, "magnetometer");
  const latestLed = getLatest(samples, "led");

  if (loading) {
    return <LoadingState label="Loading mock telemetry samples" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mock Telemetry Dashboard</h2>
          <p className="mt-1 text-sm text-[#9fa7b3]">
            Reads older mock sensor data from <span className="font-mono">GET /api/samples</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge text="tlm_samples" color="blue" />
          <span className="text-xs text-[#9fa7b3]">Last update: {lastUpdate || "--"}</span>
          <Button size="sm" onClick={loadSamples}>Refresh</Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-[#F2495C] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Battery Voltage" value={formatNumber(latestBattery?.value)} unit={latestBattery?.unit || "V"} />
        <StatCard title="CPU Temperature" value={formatNumber(latestTemperature?.value)} unit={latestTemperature?.unit || "°C"} />
        <StatCard
          title="Magnetometer |B|"
          value={latestMagnetometer ? formatNumber(vectorMagnitude(latestMagnetometer.x, latestMagnetometer.y, latestMagnetometer.z)) : "--"}
          unit={latestMagnetometer?.unit || "uT"}
        />
        <StatCard title="LED State" value={Number(latestLed?.value) === 1 ? "ON" : "OFF"} unit="state" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Battery Voltage Trend">
          <TelemetryChart data={makeValueSeries(samples, "battery")} unit="V" />
        </Panel>
        <Panel title="CPU Temperature Trend">
          <TelemetryChart data={makeValueSeries(samples, "temperature")} unit="°C" />
        </Panel>
        <Panel title="Magnetometer Magnitude Trend">
          <TelemetryChart data={makeMagnetometerSeries(samples)} unit="uT" />
        </Panel>
        <Panel title="LED State History">
          <TelemetryChart data={makeValueSeries(samples, "led")} unit="state" />
        </Panel>
      </div>

      <Panel title="Recent Decoded Mock Samples">
        {samples.length === 0 ? (
          <EmptyState title="No samples found" message="Seed the database or use the CRUD tab to create sample points." />
        ) : (
          <div className="gs-scrollbar overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[#9fa7b3]">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">tlmId</th>
                  <th className="p-2">LEN</th>
                  <th className="p-2">Value</th>
                  <th className="p-2">X/Y/Z</th>
                  <th className="p-2">CRC</th>
                  <th className="p-2">Payload</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(0, 30).map((sample) => (
                  <tr key={sample.recordId} className="border-t border-[#2f3240]">
                    <td className="p-2 text-[#9fa7b3]">{formatTime(sample.time)}</td>
                    <td className="p-2">{sample.sampleType}</td>
                    <td className="p-2 font-mono">{sample.tlmId}</td>
                    <td className="p-2">{sample.len}</td>
                    <td className="p-2">{sample.value ?? "--"} {sample.unit}</td>
                    <td className="p-2">{sample.x ?? "--"} / {sample.y ?? "--"} / {sample.z ?? "--"}</td>
                    <td className="p-2 font-mono">{sample.crc}</td>
                    <td className="max-w-[260px] truncate p-2 font-mono text-[#9fa7b3]">{sample.payloadHex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
