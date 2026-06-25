export type HealthState = "normal" | "warning" | "error";

export const healthColor: Record<HealthState, string> = {
  normal: "green",
  warning: "orange",
  error: "red",
};

export const satelliteStatus = {
  satelliteMode: "Nominal",
  actuatorHealth: "normal" as HealthState,
  actuatorCommand: "Deploy Antenna",
};

export const sensorHealth = {
  solarVoltage: "normal",
  temperature1: "normal",
  temperature2: "warning",
  humidity: "normal",
  gyroscope: "normal",
  magnetometer: "warning",
  gps: "normal",
} satisfies Record<string, HealthState>;

export const timeSeriesData = [
  { time: "10:00", solarVoltage: 4.8, temp1: 22.4, temp2: 23.1, humidity: 44 },
  { time: "10:05", solarVoltage: 5.1, temp1: 22.8, temp2: 23.5, humidity: 45 },
  { time: "10:10", solarVoltage: 5.4, temp1: 23.2, temp2: 24.0, humidity: 47 },
  { time: "10:15", solarVoltage: 5.0, temp1: 23.5, temp2: 24.4, humidity: 48 },
  { time: "10:20", solarVoltage: 4.9, temp1: 23.3, temp2: 24.8, humidity: 49 },
];

export const imuData = {
  gyroscope: {
    x: 0.12,
    y: -0.08,
    z: 0.04,
  },
  magnetometer: {
    x: 34.2,
    y: -12.6,
    z: 48.9,
  },
};

export const gpsData = {
  latitude: 35.6892,
  longitude: 51.389,
  altitudeKm: 520.4,
  speedKms: 7.61,
};

export const consoleMessages = [
  "[10:00:01] Ground station link established",
  "[10:01:12] Telemetry packet received",
  "[10:02:03] Solar voltage nominal",
  "[10:03:44] Temperature sensor 2 warning threshold reached",
  "[10:05:21] GPS lock confirmed",
  "[10:06:09] Actuator command queued: Deploy Antenna",
];
