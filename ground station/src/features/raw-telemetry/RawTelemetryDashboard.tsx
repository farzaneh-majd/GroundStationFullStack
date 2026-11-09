"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import CodeBlock from "@/components/ui/CodeBlock";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import Panel from "@/components/ui/Panel";
import { useRawTelemetryPackets } from "@/hooks/useRawTelemetryPackets";
import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket } from "@/types/telemetry";
import RawPacketComposer from "./components/RawPacketComposer";
import RawPacketTable from "./components/RawPacketTable";
import RawTelemetryCharts from "./components/RawTelemetryCharts";
import RawTelemetryStats from "./components/RawTelemetryStats";
import TelemetryMapPanel from "./components/TelemetryMapPanel";
import TelecommandPanel from "./components/TelecommandPanel";
import { useMission } from "@/state/MissionContext";

export default function RawTelemetryDashboard() {
  const { satelliteId } = useMission();
  const {
    packets,
    loading,
    error,
    lastUpdate,
    loadPackets,
    createPacket,
    updatePacket,
    deletePacket,
    dataSource,
  } = useRawTelemetryPackets({ limit: 200, satellite_id: satelliteId, pollingMs: 3000 });

  const [selectedPacket, setSelectedPacket] = useState<StoredRawTelemetryPacket | null>(null);

  useEffect(() => setSelectedPacket(null), [satelliteId]);

  const latestPacket = useMemo(() => selectedPacket ?? packets[0] ?? null, [packets, selectedPacket]);

  async function handleCreate(packet: IncomingRawTelemetryPacket) {
    const created = await createPacket(packet);
    setSelectedPacket(created);
  }

  async function handleUpdate(recordId: string, packet: IncomingRawTelemetryPacket) {
    const updated = await updatePacket(recordId, packet);
    setSelectedPacket(updated);
  }

  async function handleDelete(recordId: string) {
    await deletePacket(recordId);
    if (selectedPacket?.record_id === recordId) {
      setSelectedPacket(null);
    }
  }

  if (loading) {
    return <LoadingState label="Loading decoded raw telemetry" />;
  }

  return (
    <div className="space-y-6 p-6">
      <DashboardHeader
        title="Decoded Raw Telemetry"
        description={dataSource === "graphql" ? "Telemetry is loaded through the Python GraphQL boundary; live packets arrive by subscription." : "Legacy compatibility mode: current Next.js API routes remain active until the Python GraphQL backend is connected."}
        badgeText={dataSource === "graphql" ? "GRAPHQL LIVE" : "LEGACY API"}
        badgeColor="green"
        lastUpdate={lastUpdate}
        onRefresh={loadPackets}
      />

      {error && (
        <div className="rounded-[var(--gs-radius)] border border-[var(--gs-red)] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {error}
        </div>
      )}

      <RawTelemetryStats packets={packets} />

      <Panel title="Telecommands" subtitle="UI is transport-agnostic; GraphQL mode sends commands to the Python backend.">
        <TelecommandPanel satelliteId={satelliteId} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <Panel
          title="Raw Packet Writer"
          subtitle="Use POST for a new packet or select a row and use PUT."
        >
          <RawPacketComposer
            satelliteId={satelliteId}
            selectedPacket={selectedPacket}
            onClearSelection={() => setSelectedPacket(null)}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
        </Panel>

        <Panel
          title="Latest / Selected Decoded Object"
          subtitle="This is what the Grafana-style frontend receives after API decoding."
        >
          <CodeBlock value={latestPacket ?? { message: "No packets yet" }} />
        </Panel>
      </div>

      <Panel title="Professional Telemetry Trends" subtitle="Numeric decoded fields are plotted automatically.">
        <RawTelemetryCharts packets={packets} />
      </Panel>

      <TelemetryMapPanel />

      <Panel title="Raw Packet Monitor" subtitle={dataSource === "graphql" ? "GraphQL query + live subscription" : "Legacy /api/telemetry/packets compatibility"} noPadding>
        {packets.length > 0 ? (
          <RawPacketTable packets={packets} onSelect={setSelectedPacket} onDelete={handleDelete} />
        ) : (
          <div className="p-4">
            <EmptyState
              title="No raw packets stored yet"
              message="Use the writer above to POST an LED or IMU packet, or ask your friend to POST to /api/telemetry/packets."
            />
          </div>
        )}
      </Panel>
    </div>
  );
}
