import { consoleMessages } from "@/data/mockSatelliteData";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatTime } from "@/utils/format";

export default function TelemetryConsole({ packets }: { packets: StoredRawTelemetryPacket[] }) {
  const rawMessages = packets.slice(0, 6).map((packet) =>
    `[${formatTime(packet.time)}] ${packet.satellite_id} tlm_id=${packet.tlm_id} ${packet.decoded.name}`,
  );

  const messages = rawMessages.length > 0 ? rawMessages : consoleMessages;

  return (
    <div className="rounded border border-[#2f3240] bg-[#181b24]">
      <div className="border-b border-[#2f3240] px-4 py-3 text-sm font-semibold">Telemetry Console</div>
      <div className="min-h-[180px] rounded-b bg-black p-4 font-mono text-sm text-green-400">
        {messages.map((msg, index) => (
          <div key={`${msg}-${index}`}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
