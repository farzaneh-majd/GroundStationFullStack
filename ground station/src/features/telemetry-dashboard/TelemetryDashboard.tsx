"use client";

import { useMemo } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import GrafanaLineChart from "@/components/charts/GrafanaLineChart";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Panel from "@/components/ui/Panel";
import StatCard from "@/components/ui/StatCard";
import { useRawTelemetryPackets } from "@/hooks/useRawTelemetryPackets";
import { useTelemetryHistory } from "@/hooks/useTelemetryHistory";
import { useMission } from "@/state/MissionContext";
import { useMissionTime } from "@/state/MissionTimeContext";
import type { TelemetryHistoryInput, TelemetryPoint } from "@/types/telemetry-domain";
import { formatNumber, formatTime, toNumber } from "@/utils/format";

type ChartPoint = { time: string; label: string; value: number };

function historyInput(
  satelliteId: string,
  telemetryId: string,
  field: string,
  from: Date,
  to: Date,
  refreshToken: number,
): TelemetryHistoryInput {
  // refreshToken deliberately participates in the memoized input lifecycle via
  // the caller, causing a fresh GraphQL request without becoming API payload.
  void refreshToken;
  return {
    satelliteId,
    channelId: `${satelliteId}:${telemetryId}`,
    field,
    from: from.toISOString(),
    to: to.toISOString(),
    limit: 10_000,
  };
}

function toChartPoints(points: TelemetryPoint[], multiplier = 1): ChartPoint[] {
  return points.map((point) => ({
    time: point.timestamp,
    label: formatTime(point.timestamp),
    value: (toNumber(point.value) ?? 0) * multiplier,
  }));
}

function latest(points: TelemetryPoint[]) {
  return points.at(-1);
}

function magnetometerMagnitude(
  xPoints: TelemetryPoint[],
  yPoints: TelemetryPoint[],
  zPoints: TelemetryPoint[],
): ChartPoint[] {
  const rows = new Map<string, { x?: number; y?: number; z?: number }>();
  for (const [axis, points] of [["x", xPoints], ["y", yPoints], ["z", zPoints]] as const) {
    for (const point of points) {
      const row = rows.get(point.timestamp) ?? {};
      row[axis] = toNumber(point.value);
      rows.set(point.timestamp, row);
    }
  }
  return Array.from(rows.entries())
    .filter(([, row]) => row.x !== undefined && row.y !== undefined && row.z !== undefined)
    .sort(([left], [right]) => new Date(left).getTime() - new Date(right).getTime())
    .map(([time, row]) => ({
      time,
      label: formatTime(time),
      value: Math.sqrt((row.x ?? 0) ** 2 + (row.y ?? 0) ** 2 + (row.z ?? 0) ** 2) * 1_000_000,
    }));
}

export default function TelemetryDashboard() {
  const { satelliteId } = useMission();
  const { from, to, refreshToken, refresh } = useMissionTime();
  const packetsState = useRawTelemetryPackets({ satellite_id: satelliteId, limit: 200 });

  const inputs = useMemo(() => ({
    battery: historyInput(satelliteId, "3", "battery_voltage", from, to, refreshToken),
    temperature: historyInput(satelliteId, "5", "temperature", from, to, refreshToken),
    led: historyInput(satelliteId, "1", "led_state", from, to, refreshToken),
    magnetX: historyInput(satelliteId, "7", "u_x", from, to, refreshToken),
    magnetY: historyInput(satelliteId, "7", "u_y", from, to, refreshToken),
    magnetZ: historyInput(satelliteId, "7", "u_z", from, to, refreshToken),
  }), [satelliteId, from, to, refreshToken]);

  const battery = useTelemetryHistory(inputs.battery);
  const temperature = useTelemetryHistory(inputs.temperature);
  const led = useTelemetryHistory(inputs.led);
  const magnetX = useTelemetryHistory(inputs.magnetX);
  const magnetY = useTelemetryHistory(inputs.magnetY);
  const magnetZ = useTelemetryHistory(inputs.magnetZ);

  const batteryPoints = battery.series?.points ?? [];
  const temperaturePoints = temperature.series?.points ?? [];
  const ledPoints = led.series?.points ?? [];
  const magnetPoints = useMemo(
    () => magnetometerMagnitude(magnetX.series?.points ?? [], magnetY.series?.points ?? [], magnetZ.series?.points ?? []),
    [magnetX.series?.points, magnetY.series?.points, magnetZ.series?.points],
  );

  const histories = [battery, temperature, led, magnetX, magnetY, magnetZ];
  const loading = histories.some((item) => item.loading) && histories.every((item) => !item.series);
  const errors = [packetsState.error, ...histories.map((item) => item.error)].filter(Boolean);
  const latestBattery = latest(batteryPoints);
  const latestTemperature = latest(temperaturePoints);
  const latestLed = latest(ledPoints);
  const latestMagnetometer = magnetPoints.at(-1);

  if (loading) return <LoadingState label={`Loading ${satelliteId} telemetry from GraphQL`} />;

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Telemetry Dashboard"
        description={`Decoded live and historical telemetry for ${satelliteId}.`}
        badgeText={`${satelliteId} · GraphQL`}
        badgeColor="blue"
        lastUpdate={packetsState.lastUpdate || formatTime(latestBattery?.timestamp)}
        onRefresh={refresh}
      />

      {errors.length > 0 && (
        <div className="rounded-[var(--gs-radius)] border border-[var(--gs-red)] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {Array.from(new Set(errors)).join("; ")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Battery Voltage" value={formatNumber(latestBattery?.value)} unit={latestBattery?.unit || "V"} />
        <StatCard title="Front Temperature" value={formatNumber(latestTemperature?.value)} unit={latestTemperature?.unit || "°C"} />
        <StatCard title="Magnetometer |B|" value={formatNumber(latestMagnetometer?.value)} unit="µT" />
        <StatCard title="LED State" value={Number(latestLed?.value) === 1 ? "ON" : latestLed ? "OFF" : "--"} unit="state" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel title="Battery Voltage Trend">
          <GrafanaLineChart data={toChartPoints(batteryPoints)} series={[{ key: "value", label: "Battery", color: "var(--gs-green)" }]} />
        </Panel>
        <Panel title="Front Temperature Trend">
          <GrafanaLineChart data={toChartPoints(temperaturePoints)} series={[{ key: "value", label: "Temperature", color: "var(--gs-orange)" }]} />
        </Panel>
        <Panel title="Magnetometer Magnitude Trend">
          <GrafanaLineChart data={magnetPoints} series={[{ key: "value", label: "|B|", color: "var(--gs-blue-light)" }]} />
        </Panel>
        <Panel title="LED State History">
          <GrafanaLineChart data={toChartPoints(ledPoints)} series={[{ key: "value", label: "LED", color: "var(--gs-purple)" }]} />
        </Panel>
      </div>

      <Panel title="Recent Decoded Packets" subtitle="PostgreSQL packet records returned through GraphQL" noPadding>
        {packetsState.packets.length === 0 ? (
          <div className="p-4"><EmptyState title="No packets found" message={`No ${satelliteId} packets exist in the selected environment.`} /></div>
        ) : (
          <div className="gs-scrollbar overflow-x-auto">
            <table className="gs-table">
              <thead><tr><th>Time</th><th>Satellite</th><th>Telemetry</th><th>tlmId</th><th>Values</th><th>Payload</th></tr></thead>
              <tbody>
                {packetsState.packets.slice(0, 30).map((packet) => (
                  <tr key={packet.record_id}>
                    <td className="text-[var(--gs-muted)]">{formatTime(packet.time)}</td>
                    <td>{packet.satellite_id}</td>
                    <td>{packet.decoded.name}</td>
                    <td className="font-mono">{packet.tlm_id}</td>
                    <td className="font-mono text-xs">{JSON.stringify(packet.decoded.values)}</td>
                    <td className="max-w-[260px] truncate font-mono text-[var(--gs-muted)]">{packet.payload}</td>
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
