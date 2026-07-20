"use client";

import { useMemo, useState } from "react";
import { Badge } from "@grafana/ui";
import TabButton from "@/components/navigation/TabButton";
import GrafanaProvider from "@/components/providers/GrafanaProvider";
import RawTelemetryDashboard from "@/features/raw-telemetry/RawTelemetryDashboard";
import MockTelemetryDashboard from "@/features/mock-telemetry/MockTelemetryDashboard";
import SampleCrudPanel from "@/features/samples-crud/SampleCrudPanel";
import SatelliteDashboard from "@/features/satellite-monitoring/SatelliteDashboard";
import type { GroundStationTab, GroundStationTabConfig } from "@/types/navigation";

const tabs: GroundStationTabConfig[] = [
  {
    id: "raw",
    label: "Decoded Raw Telemetry",
    description: "POST/PUT raw packets, decode payloads, and read them from InfluxDB.",
  },
  {
    id: "mock",
    label: "Mock Telemetry Dashboard",
    description: "Dashboard for your older tlm_samples mock sensor data.",
  },
  {
    id: "satellite",
    label: "Satellite Monitoring",
    description: "Mission-style health overview using mock/static and decoded telemetry values.",
  },
  {
    id: "crud",
    label: "API / CRUD Test",
    description: "Manual GET, POST, PUT, and DELETE testing for tlm_samples.",
  },
];

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<GroundStationTab>("raw");

  const activeConfig = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );

  return (
    <GrafanaProvider>
      <main className="min-h-screen bg-[#111217] text-[#d8d9da]">
        <header className="sticky top-0 z-20 border-b border-[#2f3240] bg-[#181b24]/95 px-6 py-4 backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">CubeSat Ground Station</h1>
              <p className="mt-1 text-sm text-[#9fa7b3]">{activeConfig.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge text="NEXT.JS API" color="blue" />
              <Badge text="INFLUXDB" color="blue" />
              <Badge text="GRAFANA UI" color="green" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={setActiveTab}
              />
            ))}
          </div>
        </header>

        <section>
          {activeTab === "raw" && <RawTelemetryDashboard />}
          {activeTab === "mock" && <MockTelemetryDashboard />}
          {activeTab === "satellite" && <SatelliteDashboard />}
          {activeTab === "crud" && <SampleCrudPanel />}
        </section>
      </main>
    </GrafanaProvider>
  );
}