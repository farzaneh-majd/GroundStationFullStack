"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const TIME_RANGES = ["Last 15 minutes", "Last 1 hour", "Last 6 hours", "Last 24 hours", "Last 2 days", "Last 7 days"] as const;
export const REFRESH_INTERVALS = ["Off", "5s", "10s", "30s", "1m"] as const;

type TimeMode = "live" | "historical";
type MissionTimeState = {
  mode: TimeMode;
  from: Date;
  to: Date;
  rangeLabel: string;
  refreshInterval: string;
  refreshToken: number;
  setLive: () => void;
  setRange: (from: Date, to: Date) => void;
  setPreset: (label: string) => void;
  setRefreshInterval: (label: string) => void;
  refresh: () => void;
};
const MissionTimeContext = createContext<MissionTimeState | null>(null);

const RANGE_MS: Record<string, number> = {
  "Last 15 minutes": 15 * 60_000,
  "Last 1 hour": 60 * 60_000,
  "Last 6 hours": 6 * 60 * 60_000,
  "Last 24 hours": 24 * 60 * 60_000,
  "Last 2 days": 2 * 24 * 60 * 60_000,
  "Last 7 days": 7 * 24 * 60 * 60_000,
};

const REFRESH_MS: Record<string, number> = {
  Off: 0,
  "5s": 5_000,
  "10s": 10_000,
  "30s": 30_000,
  "1m": 60_000,
};

export function MissionTimeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<TimeMode>("live");
  const [rangeLabel, setRangeLabel] = useState("Last 2 days");
  const [refreshInterval, setRefreshInterval] = useState("5s");
  const [refreshToken, setRefreshToken] = useState(0);
  const [range, setRangeState] = useState(() => ({ from: new Date(Date.now() - RANGE_MS["Last 2 days"]), to: new Date() }));

  const refresh = useCallback(() => {
    setRangeState((current) => {
      if (mode !== "live") return current;
      const to = new Date();
      return { from: new Date(to.getTime() - (RANGE_MS[rangeLabel] ?? RANGE_MS["Last 2 days"])), to };
    });
    setRefreshToken((current) => current + 1);
  }, [mode, rangeLabel]);

  useEffect(() => {
    const delay = REFRESH_MS[refreshInterval] ?? 0;
    if (!delay) return;
    const timer = window.setInterval(refresh, delay);
    return () => window.clearInterval(timer);
  }, [refresh, refreshInterval]);

  const value = useMemo<MissionTimeState>(() => ({
    mode,
    from: range.from,
    to: range.to,
    rangeLabel,
    refreshInterval,
    refreshToken,
    setLive: () => {
      setMode("live");
      const to = new Date();
      setRangeState({ from: new Date(to.getTime() - (RANGE_MS[rangeLabel] ?? RANGE_MS["Last 2 days"])), to });
    },
    setRange: (from, to) => { setMode("historical"); setRangeLabel("Custom"); setRangeState({ from, to }); },
    setPreset: (label) => {
      const duration = RANGE_MS[label];
      if (!duration) return;
      setMode("live");
      setRangeLabel(label);
      const to = new Date();
      setRangeState({ from: new Date(to.getTime() - duration), to });
      setRefreshToken((current) => current + 1);
    },
    setRefreshInterval,
    refresh,
  }), [mode, range, rangeLabel, refreshInterval, refreshToken, refresh]);
  return <MissionTimeContext.Provider value={value}>{children}</MissionTimeContext.Provider>;
}

export function useMissionTime() {
  const value = useContext(MissionTimeContext);
  if (!value) throw new Error("useMissionTime must be used inside MissionTimeProvider");
  return value;
}
