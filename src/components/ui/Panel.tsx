import type { ReactNode } from "react";
import { IconDots } from "@/components/ui/icons";
import { classNames } from "@/utils/format";

export default function Panel({
  title,
  subtitle,
  right,
  children,
  className,
  bodyClassName,
  noPadding = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <section
      className={classNames(
        "flex flex-col rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] shadow-[var(--gs-shadow)]",
        className,
      )}
    >
      <div className="flex min-h-[42px] items-center justify-between gap-4 border-b border-[var(--gs-border)] px-3.5 py-2.5">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-[var(--gs-text-strong)]">{title}</div>
          {subtitle && <div className="mt-0.5 truncate text-xs text-[var(--gs-muted)]">{subtitle}</div>}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {right}
          <IconDots size={16} className="text-[var(--gs-faint)]" />
        </div>
      </div>

      <div className={classNames(noPadding ? "" : "p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
