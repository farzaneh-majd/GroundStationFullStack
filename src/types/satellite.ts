export type HealthState = "normal" | "warning" | "error";

export type SatelliteTimeSeriesPoint = {
  time: string;
  solarVoltage: number;
  temp1: number;
  temp2: number;
  humidity: number;
};

export type Vector3 = {
  x: number;
  y: number;
  z: number;
};
