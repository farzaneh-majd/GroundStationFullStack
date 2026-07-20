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
        "rounded px-4 py-2 text-sm transition",
        active
          ? "bg-[#3274d9] text-white shadow-sm"
          : "bg-[#111217] text-[#9fa7b3] hover:bg-[#202430] hover:text-white",
      )}
    >
      {label}
    </button>
  );
}
