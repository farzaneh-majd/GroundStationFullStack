export type GroundStationTab = "raw" | "telemetry" | "satellite" | "crud";

export type GroundStationTabConfig = {
  id: GroundStationTab;
  label: string;
  description: string;
};
