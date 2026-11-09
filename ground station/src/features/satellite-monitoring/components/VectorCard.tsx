import HealthBadge, { healthHexColor } from "./HealthBadge";
import type { HealthState, Vector3 } from "@/types/satellite";

function Axis({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-[var(--gs-radius)] bg-[var(--gs-surface-2)] p-3">
      <div className="text-xs text-[var(--gs-muted)]">{label}</div>
      <div className="mt-1 font-mono text-[var(--gs-text)]">
        {value.toFixed(2)} <span className="text-xs text-[var(--gs-muted)]">{unit}</span>
      </div>
    </div>
  );
}

export default function VectorCard({
  title,
  vector,
  unit,
  health,
}: {
  title: string;
  vector: Vector3;
  unit: string;
  health: HealthState;
}) {
  return (
    <div
      className="rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] p-4 shadow-[var(--gs-shadow)]"
      style={{ borderLeft: `3px solid ${healthHexColor[health]}` }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[13px] font-semibold text-[var(--gs-text-strong)]">{title}</span>
        <HealthBadge state={health} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Axis label="X" value={vector.x} unit={unit} />
        <Axis label="Y" value={vector.y} unit={unit} />
        <Axis label="Z" value={vector.z} unit={unit} />
      </div>
    </div>
  );
}
