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
          <div key={definition.tlmId} className="rounded border border-[#2f3240] bg-[#111217] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-[#d8d9da]">{definition.name}</div>
              <div className="rounded bg-[#202430] px-2 py-1 font-mono text-xs text-[#9fa7b3]">
                tlm_id={definition.tlmId}
              </div>
            </div>

            <div className="mt-2 text-xs text-[#9fa7b3]">
              kind={definition.kind} · endian={definition.endian ?? "big"}
            </div>

            <div className="mt-3 space-y-2">
              {definition.fields.map((field) => (
                <div key={field.name} className="rounded bg-black/30 p-2 text-xs">
                  <span className="font-mono text-[#d8d9da]">{field.name}</span>
                  <span className="text-[#9fa7b3]"> · {field.format}</span>
                  {field.unit && <span className="text-[#9fa7b3]"> · {field.unit}</span>}
                  {(field.enum || field.enumMap) && (
                    <div className="mt-1 font-mono text-[#73BF69]">
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
