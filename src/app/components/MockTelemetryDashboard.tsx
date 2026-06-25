"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Spinner } from "@grafana/ui";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Sample = {
  recordId: string;
  time: string;
  satellite?: string;
  sampleType: string;
  tlmId: string;
  sync?: string;
  len?: number;
  payloadHex?: string;
  dataHex?: string;
  crc?: string;
  value?: number | string;
  x?: number | string;
  y?: number | string;
  z?: number | string;
  unit?: string;
};

type ChartPoint = {
  time: string;
  label: string;
  value: number;
};

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function formatValue(value: unknown, digits = 2) {
  const n = toNumber(value);
  if (n === undefined) return "--";
  return n.toFixed(digits);
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getLatest(samples: Sample[], sampleType: string) {
  return samples.find((sample) => sample.sampleType === sampleType);
}

function makeValueSeries(samples: Sample[], sampleType: string): ChartPoint[] {
  return samples
    .filter((sample) => sample.sampleType === sampleType)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((sample) => ({
      time: sample.time,
      label: formatTime(sample.time),
      value: toNumber(sample.value) ?? 0,
    }));
}

function makeMagnetometerMagnitudeSeries(samples: Sample[]): ChartPoint[] {
  return samples
    .filter((sample) => sample.sampleType === "magnetometer")
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map((sample) => {
      const x = toNumber(sample.x) ?? 0;
      const y = toNumber(sample.y) ?? 0;
      const z = toNumber(sample.z) ?? 0;

      return {
        time: sample.time,
        label: formatTime(sample.time),
        value: Math.sqrt(x * x + y * y + z * z),
      };
    });
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-[#2f3240] bg-[#181b24]">
      <div className="border-b border-[#2f3240] px-4 py-2 text-sm font-semibold text-[#d8d9da]">
        {title}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function StatCard({
  title,
  value,
  unit,
  status = "nominal",
}: {
  title: string;
  value: string;
  unit: string;
  status?: "nominal" | "warning" | "critical";
}) {
  const statusClass =
    status === "critical"
      ? "text-red-400"
      : status === "warning"
        ? "text-yellow-400"
        : "text-green-400";

  return (
    <div className="rounded border border-[#2f3240] bg-[#111217] p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-[#9fa7b3]">{title}</span>
        <span className={`text-xs ${statusClass}`}>●</span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-[#d8d9da]">{value}</span>
        <span className="pb-1 text-sm text-[#9fa7b3]">{unit}</span>
      </div>
    </div>
  );
}

function TelemetryChart({ data, unit }: { data: ChartPoint[]; unit: string }) {
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
            formatter={(value) => [
              `${Number(value).toFixed(2)} ${unit}`,
              "Value",
            ]}
          />

          <Line
            type="monotone"
            dataKey="value"
            dot={false}
            stroke="#73BF69"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MockTelemetryDashboard() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  async function loadSamples() {
    const res = await fetch("/api/samples", {
      cache: "no-store",
    });

    const data = await res.json();

    setSamples(data);
    setLastUpdate(new Date().toLocaleTimeString());
    setLoading(false);
  }

  useEffect(() => {
    loadSamples();

    const interval = setInterval(() => {
      loadSamples();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const dashboardData = useMemo(() => {
    return {
      battery: makeValueSeries(samples, "battery"),
      temperature: makeValueSeries(samples, "temperature"),
      led: makeValueSeries(samples, "led"),
      magnetometer: makeMagnetometerMagnitudeSeries(samples),
    };
  }, [samples]);

  const latestBattery = getLatest(samples, "battery");
  const latestTemperature = getLatest(samples, "temperature");
  const latestMagnetometer = getLatest(samples, "magnetometer");
  const latestLed = getLatest(samples, "led");

  const magX = toNumber(latestMagnetometer?.x) ?? 0;
  const magY = toNumber(latestMagnetometer?.y) ?? 0;
  const magZ = toNumber(latestMagnetometer?.z) ?? 0;
  const magMagnitude = Math.sqrt(magX * magX + magY * magY + magZ * magZ);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center bg-[#111217]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111217] p-6 text-[#d8d9da]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mock Telemetry Dashboard</h2>
          <p className="text-sm text-[#9fa7b3]">
            Data source: InfluxDB / Measurement: tlm_samples
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge text="LIVE MOCK DATA" color="green" />
          <span className="text-xs text-[#9fa7b3]">
            Last update: {lastUpdate}
          </span>
          <Button size="sm" onClick={loadSamples}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        <StatCard
          title="Battery Voltage"
          value={formatValue(latestBattery?.value)}
          unit={latestBattery?.unit || "V"}
        />

        <StatCard
          title="CPU Temperature"
          value={formatValue(latestTemperature?.value)}
          unit={latestTemperature?.unit || "°C"}
        />

        <StatCard
          title="Magnetometer |B|"
          value={formatValue(magMagnitude)}
          unit={latestMagnetometer?.unit || "uT"}
        />

        <StatCard
          title="LED State"
          value={Number(latestLed?.value) === 1 ? "ON" : "OFF"}
          unit="state"
        />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <Panel title="Battery Voltage Trend">
          <TelemetryChart data={dashboardData.battery} unit="V" />
        </Panel>

        <Panel title="CPU Temperature Trend">
          <TelemetryChart data={dashboardData.temperature} unit="°C" />
        </Panel>

        <Panel title="Magnetometer Magnitude Trend">
          <TelemetryChart data={dashboardData.magnetometer} unit="uT" />
        </Panel>

        <Panel title="LED State History">
          <TelemetryChart data={dashboardData.led} unit="state" />
        </Panel>
      </div>

      <Panel title="Recent Decoded Telemetry Packets">
        <div className="overflow-x-auto">
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
              {samples.slice(0, 20).map((sample) => (
                <tr key={sample.recordId} className="border-t border-[#2f3240]">
                  <td className="p-2 text-[#9fa7b3]">
                    {formatTime(sample.time)}
                  </td>

                  <td className="p-2">{sample.sampleType}</td>

                  <td className="p-2 font-mono">{sample.tlmId}</td>

                  <td className="p-2">{sample.len ?? "--"}</td>

                  <td className="p-2">
                    {sample.value ?? "--"} {sample.unit}
                  </td>

                  <td className="p-2">
                    {sample.x ?? "--"} / {sample.y ?? "--"} / {sample.z ?? "--"}
                  </td>

                  <td className="p-2 font-mono">{sample.crc ?? "--"}</td>

                  <td className="max-w-[260px] truncate p-2 font-mono text-[#9fa7b3]">
                    {sample.payloadHex ?? "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
