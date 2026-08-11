import HealthBadge, { healthHexColor } from "./HealthBadge";
import type { HealthState } from "@/types/satellite";

export default function MetricCard({
  title,
  value,
  unit,
  health,
}: {
  title: string;
  value: string | number;
  unit?: string;
  health: HealthState;
}) {
  const color = healthHexColor[health];

  return (
    <div
      className="rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] p-4 shadow-[var(--gs-shadow)]"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--gs-muted)]">{title}</span>
        <HealthBadge state={health} />
      </div>
      <div className="text-[28px] font-semibold leading-none" style={{ color }}>
        {value} <span className="text-sm font-normal text-[var(--gs-muted)]">{unit}</span>
      </div>
    </div>
  );
}
