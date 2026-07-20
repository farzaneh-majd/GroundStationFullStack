"use client";

import { useMemo, useState } from "react";
import { Badge, Button } from "@grafana/ui";
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

export default function RawTelemetryDashboard() {
  const {
    packets,
    loading,
    error,
    lastUpdate,
    loadPackets,
    createPacket,
    updatePacket,
    deletePacket,
  } = useRawTelemetryPackets({ limit: 200, pollingMs: 3000 });

  const [selectedPacket, setSelectedPacket] = useState<StoredRawTelemetryPacket | null>(null);

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Decoded Raw Telemetry</h2>
          <p className="mt-1 text-sm text-[#9fa7b3]">
            Friend software sends <span className="font-mono">satellite_id + tlm_id + payload</span>. The backend decodes the payload dynamically from the telemetry map.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge text="RAW PACKET API" color="green" />
          <span className="text-xs text-[#9fa7b3]">Last update: {lastUpdate || "--"}</span>
          <Button size="sm" onClick={loadPackets}>Refresh</Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-[#F2495C] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {error}
        </div>
      )}

      <RawTelemetryStats packets={packets} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
        <Panel
          title="Raw Packet Writer"
          subtitle="Use POST for a new packet or select a row and use PUT."
        >
          <RawPacketComposer
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

      <Panel title="Raw Packet Monitor" subtitle="GET /api/telemetry/packets">
        {packets.length > 0 ? (
          <RawPacketTable packets={packets} onSelect={setSelectedPacket} onDelete={handleDelete} />
        ) : (
          <EmptyState
            title="No raw packets stored yet"
            message="Use the writer above to POST an LED or IMU packet, or ask your friend to POST to /api/telemetry/packets."
          />
        )}
      </Panel>
    </div>
  );
}
