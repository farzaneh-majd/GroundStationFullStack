"use client";

import { useEffect, useState } from "react";
import { Button } from "@grafana/ui";
import TextField from "@/components/ui/TextField";
import type { IncomingRawTelemetryPacket, StoredRawTelemetryPacket } from "@/types/telemetry";

const imuDemoPayload = "41C8000041D0000041D8000041E0000041E8000041F00000";

export type RawPacketFormState = {
  satellite_id: string;
  tlm_id: string;
  payload: string;
  timestamp: string;
  time_precision: "s" | "ms" | "us" | "ns";
};

const defaultForm: RawPacketFormState = {
  satellite_id: "cubesat-1",
  tlm_id: "1",
  payload: "01",
  timestamp: "",
  time_precision: "ms",
};

function packetToForm(packet: StoredRawTelemetryPacket): RawPacketFormState {
  return {
    satellite_id: packet.satellite_id,
    tlm_id: packet.tlm_id,
    payload: packet.payload,
    timestamp: packet.time,
    time_precision: "ms",
  };
}

export default function RawPacketComposer({
  selectedPacket,
  onClearSelection,
  onCreate,
  onUpdate,
}: {
  selectedPacket?: StoredRawTelemetryPacket | null;
  onClearSelection: () => void;
  onCreate: (packet: IncomingRawTelemetryPacket) => Promise<void>;
  onUpdate: (recordId: string, packet: IncomingRawTelemetryPacket) => Promise<void>;
}) {
  const [form, setForm] = useState<RawPacketFormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPacket) {
      setForm(packetToForm(selectedPacket));
    }
  }, [selectedPacket]);

  function setField<K extends keyof RawPacketFormState>(key: K, value: RawPacketFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function fillLedOn() {
    setForm({ ...defaultForm, tlm_id: "1", payload: "01" });
    onClearSelection();
  }

  function fillLedOff() {
    setForm({ ...defaultForm, tlm_id: "1", payload: "00" });
    onClearSelection();
  }

  function fillImuDemo() {
    setForm({ ...defaultForm, tlm_id: "2", payload: imuDemoPayload });
    onClearSelection();
  }

  async function submit() {
    try {
      setSubmitting(true);
      setError(null);

      const packet: IncomingRawTelemetryPacket = {
        satellite_id: form.satellite_id,
        tlm_id: form.tlm_id,
        payload: form.payload,
      };

      if (form.timestamp.trim()) {
        packet.timestamp = form.timestamp.trim();
        packet.time_precision = form.time_precision;
      }

      if (selectedPacket) {
        await onUpdate(selectedPacket.record_id, packet);
      } else {
        await onCreate(packet);
      }

      if (!selectedPacket) {
        setForm((current) => ({ ...current, timestamp: "" }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit packet");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <TextField
          label="Satellite ID"
          value={form.satellite_id}
          onChange={(value) => setField("satellite_id", value)}
          placeholder="cubesat-1"
        />

        <TextField
          label="Telemetry ID"
          value={form.tlm_id}
          onChange={(value) => setField("tlm_id", value)}
          helper="1 = LED, 2 = IMU, 3 = Environment"
        />
      </div>

      <TextField
        label="Payload hex"
        value={form.payload}
        onChange={(value) => setField("payload", value)}
        helper="This is the raw PAYLOAD field. The backend decodes it using telemetryMap."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px]">
        <TextField
          label="Timestamp / ts optional"
          value={form.timestamp}
          onChange={(value) => setField("timestamp", value)}
          placeholder="empty = server time"
        />

        <label className="block">
          <div className="mb-1 text-xs text-[#9fa7b3]">Precision</div>
          <select
            value={form.time_precision}
            onChange={(event) => setField("time_precision", event.target.value as RawPacketFormState["time_precision"])}
            className="w-full rounded border border-[#2f3240] bg-[#111217] px-3 py-2 text-[#d8d9da] outline-none focus:border-[#73BF69]"
          >
            <option value="ms">ms</option>
            <option value="s">s</option>
            <option value="us">us</option>
            <option value="ns">ns</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={submitting}>
          {selectedPacket ? "PUT Selected Packet" : "POST Raw Packet"}
        </Button>

        {selectedPacket && (
          <Button
            variant="secondary"
            onClick={() => {
              onClearSelection();
              setForm(defaultForm);
            }}
          >
            Clear Selection
          </Button>
        )}

        <Button variant="secondary" onClick={fillLedOn}>LED ON</Button>
        <Button variant="secondary" onClick={fillLedOff}>LED OFF</Button>
        <Button variant="secondary" onClick={fillImuDemo}>IMU Demo</Button>
      </div>

      {selectedPacket && (
        <div className="rounded border border-[#3274d9] bg-[#0b1930] p-3 text-xs text-[#9fa7b3]">
          Editing record_id: <span className="font-mono text-[#d8d9da]">{selectedPacket.record_id}</span>
        </div>
      )}

      {error && (
        <div className="rounded border border-[#F2495C] bg-[#2a1217] p-3 text-sm text-[#ffb3bd]">
          {error}
        </div>
      )}
    </div>
  );
}
