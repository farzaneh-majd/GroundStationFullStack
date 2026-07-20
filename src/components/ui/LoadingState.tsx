import { Spinner } from "@grafana/ui";

export default function LoadingState({ label = "Loading telemetry" }: { label?: string }) {
  return (
    <div className="flex h-[520px] flex-col items-center justify-center gap-3 bg-[#111217] text-[#9fa7b3]">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}
