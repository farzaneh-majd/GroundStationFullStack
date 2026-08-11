import Panel from "@/components/ui/Panel";
import { consoleMessages } from "@/data/data";
import type { StoredRawTelemetryPacket } from "@/types/telemetry";
import { formatTime } from "@/utils/format";

export default function TelemetryConsole({ packets }: { packets: StoredRawTelemetryPacket[] }) {
  const rows = packets.slice(0, 8).map((packet) => ({
    time: formatTime(packet.time),
    text: `${packet.satellite_id} · tlm_id=${packet.tlm_id} · ${packet.decoded.name}`,
  }));

  const fallback = consoleMessages.map((msg) => ({ time: "", text: msg }));
  const messages = rows.length > 0 ? rows : fallback;

  return (
    <Panel title="Telemetry Console" subtitle="Most recent decoded packets, newest first" noPadding>
      <div className="gs-scrollbar max-h-[220px] overflow-y-auto bg-[var(--gs-bg-canvas)] font-mono text-xs">
        {messages.map((row, index) => (
          <div
            key={`${row.text}-${index}`}
            className="flex items-baseline gap-3 border-l-2 border-l-[var(--gs-green)] px-3 py-1.5 transition-colors hover:bg-[var(--gs-surface-hover)]"
          >
            {row.time && <span className="shrink-0 text-[var(--gs-faint)]">{row.time}</span>}
            <span className="text-[var(--gs-text)]">{row.text}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
