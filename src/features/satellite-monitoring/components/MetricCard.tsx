import HealthBadge from "./HealthBadge";
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
  return (
    <div className="rounded border border-[#2f3240] bg-[#111217] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[#9fa7b3]">{title}</span>
        <HealthBadge state={health} />
      </div>
      <div className="text-3xl font-bold text-white">
        {value} {unit}
      </div>
    </div>
  );
}
