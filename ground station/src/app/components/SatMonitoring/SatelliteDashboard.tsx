"use client";

import MetricCard from "./MetricCard";
import SatellitePanel from "./SatellitePanel";
import ImuCards from "./ImuCards";
import GpsCard from "./GpsCard";
import TelemetryConsole from "./TelemetryConsole";

import { sensorHealth, timeSeriesData } from "@/data/mockSatelliteData";

export default function SatelliteDashboard() {
  const latest = timeSeriesData[timeSeriesData.length - 1];

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-white">Satellite Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Solar Cell Voltage"
          value={latest.solarVoltage}
          unit="V"
          health={sensorHealth.solarVoltage}
        />

        <MetricCard
          title="Temperature Sensor 1"
          value={latest.temp1}
          unit="°C"
          health={sensorHealth.temperature1}
        />

        <MetricCard
          title="Temperature Sensor 2"
          value={latest.temp2}
          unit="°C"
          health={sensorHealth.temperature2}
        />

        <MetricCard
          title="Humidity"
          value={latest.humidity}
          unit="%"
          health={sensorHealth.humidity}
        />
      </div>

      <SatellitePanel />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ImuCards />
        <GpsCard />
      </div>

      <TelemetryConsole />
    </section>
  );
}
