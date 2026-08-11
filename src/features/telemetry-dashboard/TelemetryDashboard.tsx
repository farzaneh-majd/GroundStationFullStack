"use client";

import DashboardHeader from "@/components/layout/DashboardHeader";
import GrafanaLineChart from "@/components/charts/GrafanaLineChart";
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

export default function TelemetryDashboard() {
  const { samples, loading, error, lastUpdate, loadSamples } = useSamples({ limit: 200, pollingMs: 5000 });

  const latestBattery = getLatest(samples, "battery");
  const latestTemperature = getLatest(samples, "temperature");
  const latestMagnetometer = getLatest(samples, "magnetometer");
  const latestLed = getLatest(samples, "led");

  if (loading) {
    return <LoadingState label="Loading telemetry samples" />;
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Telemetry Dashboard"
        description="Decoded sensor readings from the tlm_samples telemetry data."
        badgeText="tlm_samples"
        badgeColor="blue"
        lastUpdate={lastUpdate}
        onRefresh={loadSamples}
      />

      {error && (
        <div className="rounded-[var(--gs-radius)] border border-[var(--gs-red)] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
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
          <GrafanaLineChart data={makeValueSeries(samples, "battery")} series={[{ key: "value", label: "Battery", color: "var(--gs-green)" }]} />
        </Panel>
        <Panel title="CPU Temperature Trend">
          <GrafanaLineChart data={makeValueSeries(samples, "temperature")} series={[{ key: "value", label: "Temperature", color: "var(--gs-orange)" }]} />
        </Panel>
        <Panel title="Magnetometer Magnitude Trend">
          <GrafanaLineChart data={makeMagnetometerSeries(samples)} series={[{ key: "value", label: "|B|", color: "var(--gs-blue-light)" }]} />
        </Panel>
        <Panel title="LED State History">
          <GrafanaLineChart data={makeValueSeries(samples, "led")} series={[{ key: "value", label: "LED", color: "var(--gs-purple)" }]} />
        </Panel>
      </div>

      <Panel title="Recent Decoded Samples" noPadding>
        {samples.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No samples found" message="Seed the database or use the CRUD tab to create sample points." />
          </div>
        ) : (
          <div className="gs-scrollbar overflow-x-auto">
            <table className="gs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>tlmId</th>
                  <th>LEN</th>
                  <th>Value</th>
                  <th>X/Y/Z</th>
                  <th>CRC</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {samples.slice(0, 30).map((sample) => (
                  <tr key={sample.recordId}>
                    <td className="text-[var(--gs-muted)]">{formatTime(sample.time)}</td>
                    <td>{sample.sampleType}</td>
                    <td className="font-mono">{sample.tlmId}</td>
                    <td>{sample.len}</td>
                    <td>{sample.value ?? "--"} {sample.unit}</td>
                    <td>{sample.x ?? "--"} / {sample.y ?? "--"} / {sample.z ?? "--"}</td>
                    <td className="font-mono">{sample.crc}</td>
                    <td className="max-w-[260px] truncate font-mono text-[var(--gs-muted)]">{sample.payloadHex}</td>
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
