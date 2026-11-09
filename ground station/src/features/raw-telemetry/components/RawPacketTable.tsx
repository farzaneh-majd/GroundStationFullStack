import { Button } from "@grafana/ui";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatTime } from "@/utils/format";

export default function RawPacketTable({
  packets,
  onSelect,
  onDelete,
}: {
  packets: StoredRawTelemetryPacket[];
  onSelect: (packet: StoredRawTelemetryPacket) => void;
  onDelete: (recordId: string) => Promise<void>;
}) {
  return (
    <div className="gs-scrollbar overflow-x-auto">
      <table className="gs-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Satellite</th>
            <th>tlm_id</th>
            <th>Name</th>
            <th>Decoded Values</th>
            <th>Payload</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {packets.map((packet) => (
            <tr key={packet.record_id}>
              <td className="whitespace-nowrap text-[var(--gs-muted)]">{formatTime(packet.time)}</td>
              <td>{packet.satellite_id}</td>
              <td className="font-mono">{packet.tlm_id}</td>
              <td>{packet.decoded.name}</td>
              <td className="max-w-[420px] truncate font-mono text-[var(--gs-text)]">
                {JSON.stringify(packet.decoded.values)}
              </td>
              <td className="max-w-[260px] truncate font-mono text-[var(--gs-muted)]">
                {packet.payload}
              </td>
              <td className="whitespace-nowrap">
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onSelect(packet)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => void onDelete(packet.record_id)}
                    className="rounded-[var(--gs-radius)] border border-[var(--gs-red)] px-3 py-1 text-xs text-[#ff9ba8] transition-colors hover:bg-[#2a1217]"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
