import Panel from "@/components/ui/Panel";
import { telemetryMap, telemetryMapVersion } from "@/data/telemetryMap";

export default function TelemetryMapPanel() {
  return (
    <Panel
      title="Telemetry Map"
      subtitle={`Version ${telemetryMapVersion}. Update this map when your packet contract changes.`}
    >
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        {Object.values(telemetryMap).map((definition) => (
          <div key={definition.tlmId} className="rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface-2)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[var(--gs-text)]">{definition.name}</div>
              <div className="rounded-[var(--gs-radius)] bg-[var(--gs-elevated)] px-2 py-1 font-mono text-xs text-[var(--gs-muted)]">
                tlm_id={definition.tlmId}
              </div>
            </div>

            <div className="mt-2 text-xs text-[var(--gs-muted)]">
              kind={definition.kind} · endian={definition.endian ?? "big"}
            </div>

            <div className="mt-3 space-y-2">
              {definition.fields.map((field) => (
                <div key={field.name} className="rounded-[var(--gs-radius)] bg-black/30 p-2 text-xs">
                  <span className="font-mono text-[var(--gs-text)]">{field.name}</span>
                  <span className="text-[var(--gs-muted)]"> · {field.format}</span>
                  {field.unit && <span className="text-[var(--gs-muted)]"> · {field.unit}</span>}
                  {(field.enum || field.enumMap) && (
                    <div className="mt-1 font-mono text-[var(--gs-green)]">
                      enum {JSON.stringify(field.enum ?? field.enumMap)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
