import HealthBadge from "./HealthBadge";
import type { HealthState, Vector3 } from "@/types/satellite";

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
    <div className="rounded border border-[#2f3240] bg-[#181b24] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-semibold text-[#d8d9da]">{title}</span>
        <HealthBadge state={health} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded bg-[#111217] p-3">
          <div className="text-xs text-[#9fa7b3]">X</div>
          <div className="mt-1 font-mono text-[#d8d9da]">{vector.x.toFixed(2)} {unit}</div>
        </div>
        <div className="rounded bg-[#111217] p-3">
          <div className="text-xs text-[#9fa7b3]">Y</div>
          <div className="mt-1 font-mono text-[#d8d9da]">{vector.y.toFixed(2)} {unit}</div>
        </div>
        <div className="rounded bg-[#111217] p-3">
          <div className="text-xs text-[#9fa7b3]">Z</div>
          <div className="mt-1 font-mono text-[#d8d9da]">{vector.z.toFixed(2)} {unit}</div>
        </div>
      </div>
    </div>
  );
}
