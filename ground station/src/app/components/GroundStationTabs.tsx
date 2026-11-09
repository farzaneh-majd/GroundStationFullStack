"use client";

import { useState } from "react";
import { Badge } from "@grafana/ui";
import SampleCrudPanel from "./SampleCrudPanel";
import MockTelemetryDashboard from "./MockTelemetryDashboard";
import SatelliteDashboard from "./SatMonitoring/SatelliteDashboard";
type TabName = "crud" | "dashboard";

export default function GroundStationTabs() {
  const [activeTab, setActiveTab] = useState<TabName>("dashboard");

  return (
    <main className="min-h-screen bg-[#111217] text-[#d8d9da]">
      <header className="border-b border-[#2f3240] bg-[#181b24] px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">CubeSat Ground Station</h1>

            <p className="text-sm text-[#9fa7b3]">Ground station Dashboard</p>
          </div>

          <Badge text="GROUND SEGMENT DEV" color="blue" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`rounded px-4 py-2 text-sm ${
              activeTab === "dashboard"
                ? "bg-[#3274d9] text-white"
                : "bg-[#111217] text-[#9fa7b3] hover:text-white"
            }`}
          >
            Telemetry Dashboard
          </button>

          <button
            onClick={() => setActiveTab("crud")}
            className={`rounded px-4 py-2 text-sm ${
              activeTab === "crud"
                ? "bg-[#3274d9] text-white"
                : "bg-[#111217] text-[#9fa7b3] hover:text-white"
            }`}
          >
            API / CRUD Test
          </button>
        </div>
      </header>

      {activeTab === "dashboard" && <MockTelemetryDashboard />}
      {activeTab === "dashboard" && <SatelliteDashboard />}
      {activeTab === "crud" && <SampleCrudPanel />}
    </main>
  );
}
