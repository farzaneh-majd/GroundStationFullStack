import { classNames } from "@/utils/format";

export default function Panel({
  title,
  subtitle,
  right,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={classNames("rounded border border-[#2f3240] bg-[#181b24]", className)}>
      <div className="flex items-start justify-between gap-4 border-b border-[#2f3240] px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-[#d8d9da]">{title}</div>
          {subtitle && <div className="mt-1 text-xs text-[#9fa7b3]">{subtitle}</div>}
        </div>
        {right}
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}
