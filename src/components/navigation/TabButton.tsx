"use client";

import type { GroundStationTab } from "@/types/navigation";
import { classNames } from "@/utils/format";

export default function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: GroundStationTab;
  label: string;
  active: boolean;
  onClick: (id: GroundStationTab) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={classNames(
        "relative px-3 py-2.5 text-sm transition-colors",
        active
          ? "font-medium text-[var(--gs-text-strong)]"
          : "text-[var(--gs-muted)] hover:text-[var(--gs-text)]",
      )}
    >
      {label}
      <span
        className={classNames(
          "pointer-events-none absolute inset-x-2 bottom-0 h-[2px] rounded-full transition-colors",
          active ? "bg-[var(--gs-blue-light)]" : "bg-transparent",
        )}
      />
    </button>
  );
}
