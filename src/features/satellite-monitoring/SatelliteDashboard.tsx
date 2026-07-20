"use client";

import { Badge, Button } from "@grafana/ui";
import Panel from "@/components/ui/Panel";
import LoadingState from "@/components/ui/LoadingState";
import { gpsData, imuData, satelliteStatus, sensorHealth, timeSeriesData } from "@/data/mockSatelliteData";
import { useRawTelemetryPackets } from "@/hooks/useRawTelemetryPackets";
import type { Vector3 } from "@/types/satellite";
import { formatNumber, toNumber } from "@/utils/format";
import HealthBadge from "./components/HealthBadge";
import MetricCard from "./components/MetricCard";
import TelemetryConsole from "./components/TelemetryConsole";
import VectorCard from "./components/VectorCard";

function getLatestImuVector(values?: Record<string, number | string>): {
  accel?: Vector3;
  gyro?: Vector3;
} {
  if (!values) return {};

  const accel = {
    x: toNumber(values.accel_x),
    y: toNumber(values.accel_y),
    z: toNumber(values.accel_z),
  };

  const gyro = {
    x: toNumber(values.gyro_x),
    y: toNumber(values.gyro_y),
    z: toNumber(values.gyro_z),
  };

  return {
    accel: accel.x !== undefined && accel.y !== undefined && accel.z !== undefined
      ? { x: accel.x, y: accel.y, z: accel.z }
      : undefined,
    gyro: gyro.x !== undefined && gyro.y !== undefined && gyro.z !== undefined
      ? { x: gyro.x, y: gyro.y, z: gyro.z }
      : undefined,
  };
}

export default function SatelliteDashboard() {
  const { packets, loading, loadPackets, lastUpdate } = useRawTelemetryPackets({ limit: 100, pollingMs: 5000 });
  const latest = timeSeriesData[timeSeriesData.length - 1];
  const latestImuPacket = packets.find((packet) => String(packet.tlm_id) === "2");
  const latestLedPacket = packets.find((packet) => String(packet.tlm_id) === "1");
  const { accel, gyro } = getLatestImuVector(latestImuPacket?.decoded.values);

  if (loading) {
    return <LoadingState label="Loading satellite monitoring data" />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Satellite Monitoring</h2>
          <p className="mt-1 text-sm text-[#9fa7b3]">
            Mission-style overview. Static mock data is combined with decoded raw telemetry when available.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge text="MISSION OVERVIEW" color="blue" />
          <span className="text-xs text-[#9fa7b3]">Last update: {lastUpdate || "--"}</span>
          <Button size="sm" onClick={loadPackets}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Solar Cell Voltage" value={latest.solarVoltage} unit="V" health={sensorHealth.solarVoltage} />
        <MetricCard title="Temperature Sensor 1" value={latest.temp1} unit="°C" health={sensorHealth.temperature1} />
        <MetricCard title="Temperature Sensor 2" value={latest.temp2} unit="°C" health={sensorHealth.temperature2} />
        <MetricCard title="Humidity" value={latest.humidity} unit="%" health={sensorHealth.humidity} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_380px]">
        <Panel title="Satellite Panel" subtitle="Commanding UI placeholder for later uplink integration.">
          <div className="space-y-3 text-sm">
            <div><b>Satellite Mode:</b> {satelliteStatus.satelliteMode}</div>
            <div className="flex items-center gap-2"><b>Actuator Health:</b> <HealthBadge state={satelliteStatus.actuatorHealth} /></div>
            <div><b>Actuator Command:</b> {satelliteStatus.actuatorCommand}</div>
            <div><b>Latest LED State:</b> {String(latestLedPacket?.decoded.values.led_state ?? "No packet yet")}</div>
            <Button variant="primary">Send Actuator Command</Button>
          </div>
        </Panel>

        <Panel title="GPS" subtitle="Static mock GPS until real GPS packets are mapped.">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2"><b>Health:</b> <HealthBadge state={sensorHealth.gps} /></div>
            <p>Latitude: {gpsData.latitude}</p>
            <p>Longitude: {gpsData.longitude}</p>
            <p>Altitude: {gpsData.altitudeKm} km</p>
            <p>Speed: {gpsData.speedKms} km/s</p>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <VectorCard title="Accelerometer" vector={accel ?? { x: 0, y: 0, z: 0 }} unit="m/s²" health={latestImuPacket ? "normal" : "warning"} />
        <VectorCard title="Gyroscope" vector={gyro ?? imuData.gyroscope} unit="deg/s" health={sensorHealth.gyroscope} />
        <VectorCard title="Magnetometer" vector={imuData.magnetometer} unit="μT" health={sensorHealth.magnetometer} />
        <Panel title="Raw Telemetry Summary">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-[#111217] p-3">
              <div className="text-xs text-[#9fa7b3]">Packets</div>
              <div className="mt-1 text-2xl font-semibold">{packets.length}</div>
            </div>
            <div className="rounded bg-[#111217] p-3">
              <div className="text-xs text-[#9fa7b3]">Latest IMU accel_x</div>
              <div className="mt-1 text-2xl font-semibold">{formatNumber(latestImuPacket?.decoded.values.accel_x)}</div>
            </div>
          </div>
        </Panel>
      </div>

      <TelemetryConsole packets={packets} />
    </div>
  );
}
