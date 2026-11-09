"use client";

import type { ReactNode } from "react";
import { Badge, Button } from "@grafana/ui";
import { IconRefresh } from "@/components/ui/icons";

type BadgeColor = "blue" | "green" | "orange" | "red" | "purple";

export default function DashboardHeader({
  title,
  description,
  badgeText,
  badgeColor = "blue",
  lastUpdate,
  onRefresh,
  extra,
}: {
  title: string;
  description: string;
  badgeText: string;
  badgeColor?: BadgeColor;
  lastUpdate?: string;
  onRefresh: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--gs-border-weak)] pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-[var(--gs-text-strong)]">{title}</h2>
        <p className="mt-1 text-sm text-[var(--gs-muted)]">{description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {extra}
        <Badge text={badgeText} color={badgeColor} />
        <span className="flex items-center gap-1.5 text-xs text-[var(--gs-muted)]">
          <span className="gs-live-dot" />
          Last update: {lastUpdate || "--"}
        </span>
        <Button size="sm" variant="secondary" onClick={onRefresh}>
          <span className="inline-flex items-center gap-1.5">
            <IconRefresh size={14} />
            Refresh
          </span>
        </Button>
      </div>
    </div>
  );
}
