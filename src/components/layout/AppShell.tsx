"use client";

import { useMemo, useState } from "react";
import TabButton from "@/components/navigation/TabButton";
import GrafanaProvider from "@/components/providers/GrafanaProvider";
import SideRail from "@/components/layout/SideRail";
import TopBar from "@/components/layout/TopBar";
import RawTelemetryDashboard from "@/features/raw-telemetry/RawTelemetryDashboard";
import TelemetryDashboard from "@/features/telemetry-dashboard/TelemetryDashboard";
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
    id: "telemetry",
    label: "Telemetry Dashboard",
    description: "Dashboard for the tlm_samples sensor data time series.",
  },
  {
    id: "satellite",
    label: "Satellite Monitoring",
    description: "Mission-style health overview combining orbit-model and decoded telemetry values.",
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
      <div className="flex min-h-screen bg-[var(--gs-bg-canvas)] text-[var(--gs-text)]">
        <SideRail />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-[var(--gs-border)] bg-[var(--gs-bg)]/95 backdrop-blur">
            <TopBar subtitle={activeConfig.description} />

            <nav className="flex gap-1 overflow-x-auto border-t border-[var(--gs-border-weak)] px-4">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </nav>
          </header>

          <main className="mx-auto max-w-[1600px]">
            {activeTab === "raw" && <RawTelemetryDashboard />}
            {activeTab === "telemetry" && <TelemetryDashboard />}
            {activeTab === "satellite" && <SatelliteDashboard />}
            {activeTab === "crud" && <SampleCrudPanel />}
          </main>
        </div>
      </div>
    </GrafanaProvider>
  );
}
