import { Spinner } from "@grafana/ui";

export default function LoadingState({ label = "Loading telemetry" }: { label?: string }) {
  return (
    <div className="flex h-[520px] flex-col items-center justify-center gap-3 bg-[var(--gs-bg-canvas)] text-[var(--gs-muted)]">
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}
