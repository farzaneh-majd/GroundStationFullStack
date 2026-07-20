export type GroundStationTab = "raw" | "mock" | "satellite" | "crud";

export type GroundStationTabConfig = {
  id: GroundStationTab;
  label: string;
  description: string;
};
