import { classNames } from "@/utils/format";

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
  status?: "nominal" | "warning" | "critical" | "muted";
}) {
  const dotClass = {
    nominal: "text-[#73BF69]",
    warning: "text-[#F2CC0C]",
    critical: "text-[#F2495C]",
    muted: "text-[#9fa7b3]",
  }[status];

  return (
    <div className="rounded border border-[#2f3240] bg-[#111217] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs text-[#9fa7b3]">{title}</span>
        <span className={classNames("text-xs", dotClass)}>●</span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-3xl font-semibold text-[#d8d9da]">{value}</span>
        {unit && <span className="pb-1 text-sm text-[#9fa7b3]">{unit}</span>}
      </div>

      {subtitle && <div className="mt-2 text-xs text-[#9fa7b3]">{subtitle}</div>}
    </div>
  );
}
