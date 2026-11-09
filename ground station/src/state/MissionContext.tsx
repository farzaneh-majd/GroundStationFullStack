"use client";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type MissionState = {
  satelliteId: string;
  comparisonSatelliteId: string | null;
  setSatelliteId: (id: string) => void;
  setComparisonSatelliteId: (id: string | null) => void;
};
const MissionContext = createContext<MissionState | null>(null);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [satelliteId, setSatelliteId] = useState("SAT-A");
  const [comparisonSatelliteId, setComparisonSatelliteId] = useState<string | null>("SAT-B");
  const value = useMemo(() => 
    ({ satelliteId, comparisonSatelliteId, setSatelliteId, setComparisonSatelliteId }),
   [satelliteId, comparisonSatelliteId]);
  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
}
export function useMission() {
  const value = useContext(MissionContext);
  if (!value) throw new Error("useMission must be used inside MissionProvider");
  return value;
}
