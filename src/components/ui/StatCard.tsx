import { classNames } from "@/utils/format";

type StatStatus = "nominal" | "warning" | "critical" | "muted";

const statusColor: Record<StatStatus, string> = {
  nominal: "var(--gs-green)",
  warning: "var(--gs-yellow)",
  critical: "var(--gs-red)",
  muted: "var(--gs-muted)",
};

export default function StatCard({
  title,
  value,
  unit,
  subtitle,
  status = "nominal",
}: {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  status?: StatStatus;
}) {
  const color = statusColor[status];

  return (
    <div
      className="relative overflow-hidden rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] p-4 shadow-[var(--gs-shadow)]"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="text-xs text-[var(--gs-muted)]">{title}</div>

      <div className="mt-2 flex items-end gap-2">
        <span className="text-[28px] font-semibold leading-none" style={{ color }}>
          {value}
        </span>
        {unit && <span className="pb-0.5 text-sm text-[var(--gs-muted)]">{unit}</span>}
      </div>

      {subtitle && <div className={classNames("mt-2 text-xs text-[var(--gs-muted)]")}>{subtitle}</div>}
    </div>
  );
}
