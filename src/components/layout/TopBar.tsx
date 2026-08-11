"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconClock, IconRefresh, IconSatellite } from "@/components/ui/icons";
import { classNames } from "@/utils/format";

const TIME_RANGES = ["Last 15 minutes", "Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 2 days", "Last 7 days"];
const REFRESH_INTERVALS = ["Off", "5s", "10s", "30s", "1m"];

function useOutsideClose<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return ref;
}

function ChromeDropdown({
  icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose<HTMLDivElement>(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        className="flex items-center gap-1.5 rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] px-2.5 py-1.5 text-xs text-[var(--gs-text)] transition-colors hover:border-[var(--gs-blue-light)]"
      >
        {icon}
        <span className="whitespace-nowrap">{value}</span>
        <IconChevronDown size={13} className="text-[var(--gs-muted)]" />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-elevated)] shadow-[var(--gs-shadow)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={classNames(
                "block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-[var(--gs-surface-hover)]",
                option === value ? "text-[var(--gs-blue-light)]" : "text-[var(--gs-text)]",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ subtitle }: { subtitle: string }) {
  const [timeRange, setTimeRange] = useState("Last 2 days");
  const [refreshInterval, setRefreshInterval] = useState("5s");
  const [spinning, setSpinning] = useState(false);

  function handleManualRefresh() {
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 500);
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--gs-radius)] bg-[var(--gs-blue)]/15 text-[var(--gs-blue-light)]">
          <IconSatellite size={18} />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[15px] font-semibold leading-tight text-[var(--gs-text-strong)]">
            <span className="text-[var(--gs-muted)]">General /</span>
            <span>CubeSat Ground Station</span>
          </div>
          <p className="truncate text-xs text-[var(--gs-muted)]">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ChromeDropdown
          icon={<IconClock size={14} className="text-[var(--gs-muted)]" />}
          label="Time range"
          options={TIME_RANGES}
          value={timeRange}
          onChange={setTimeRange}
        />

        <ChromeDropdown
          icon={<IconRefresh size={14} className="text-[var(--gs-muted)]" />}
          label="Refresh interval"
          options={REFRESH_INTERVALS}
          value={refreshInterval}
          onChange={setRefreshInterval}
        />

        <button
          type="button"
          onClick={handleManualRefresh}
          aria-label="Refresh now"
          title="Refresh now"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface)] text-[var(--gs-muted)] transition-colors hover:border-[var(--gs-blue-light)] hover:text-[var(--gs-text)]"
        >
          <IconRefresh size={15} className={spinning ? "animate-spin" : ""} />
        </button>
      </div>
    </div>
  );
}
