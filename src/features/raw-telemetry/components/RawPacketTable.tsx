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
      <table className="w-full text-left text-sm">
        <thead className="text-[#9fa7b3]">
          <tr>
            <th className="p-2">Time</th>
            <th className="p-2">Satellite</th>
            <th className="p-2">tlm_id</th>
            <th className="p-2">Name</th>
            <th className="p-2">Decoded Values</th>
            <th className="p-2">Payload</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {packets.map((packet) => (
            <tr key={packet.record_id} className="border-t border-[#2f3240]">
              <td className="whitespace-nowrap p-2 text-[#9fa7b3]">{formatTime(packet.time)}</td>
              <td className="p-2">{packet.satellite_id}</td>
              <td className="p-2 font-mono">{packet.tlm_id}</td>
              <td className="p-2">{packet.decoded.name}</td>
              <td className="max-w-[420px] truncate p-2 font-mono text-[#d8d9da]">
                {JSON.stringify(packet.decoded.values)}
              </td>
              <td className="max-w-[260px] truncate p-2 font-mono text-[#9fa7b3]">
                {packet.payload}
              </td>
              <td className="flex gap-2 p-2">
                <Button size="sm" variant="secondary" onClick={() => onSelect(packet)}>
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => void onDelete(packet.record_id)}
                  className="rounded border border-[#F2495C] px-3 py-1 text-xs text-[#ff9ba8] hover:bg-[#2a1217]"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
