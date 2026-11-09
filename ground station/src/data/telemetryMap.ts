import type { TelemetryDefinition } from "@/types/telemetry";

export const telemetryMap: Record<string, TelemetryDefinition> = {
  "1": {
    tlmId: "1",
    name: "LED State",
    subsystem: "OBC",
    source: "FPRIME",
    description: "Discrete LED state telemetry.",
    kind: "scalar",
    fields: [
      {
        name: "led_state",
        format: "u8",
        enum: {
          "0": "OFF",
          "1": "ON",
        },
      },
    ],
  },

  "2": {
    tlmId: "2",
    name: "IMU Data",
    subsystem: "ADCS",
    source: "FPRIME",
    description: "Accelerometer and gyroscope vectors.",
    kind: "struct",
    endian: "big",
    fields: [
      { name: "accel_x", format: "f32", unit: "m/s²" },
      { name: "accel_y", format: "f32", unit: "m/s²" },
      { name: "accel_z", format: "f32", unit: "m/s²" },
      { name: "gyro_x", format: "f32", unit: "deg/s" },
      { name: "gyro_y", format: "f32", unit: "deg/s" },
      { name: "gyro_z", format: "f32", unit: "deg/s" },
    ],
  },

  "3": {
    tlmId: "3",
    name: "Battery Voltage",
    subsystem: "EPS",
    source: "FPRIME",
    description: "Spacecraft battery voltage.",
    kind: "scalar",
    fields: [
      { name: "battery_voltage", format: "f32", unit: "V" },
    ],
  },

  "4": {
    tlmId: "4",
    name: "Solar Cell Voltages",
    subsystem: "EPS",
    source: "FPRIME",
    description: "Individual solar-cell voltage channels.",
    kind: "struct",
    endian: "big",
    fields: [
      { name: "solar_cell_voltage_LL", format: "f32", unit: "V" },
      { name: "solar_cell_voltage_LU", format: "f32", unit: "V" },
      { name: "solar_cell_voltage_RL", format: "f32", unit: "V" },
      { name: "solar_cell_voltage_RU", format: "f32", unit: "V" },
    ],
  },

  "5": {
    tlmId: "5",
    name: "Front Temperature and Humidity",
    subsystem: "THERMAL",
    source: "FPRIME",
    kind: "struct",
    endian: "big",
    fields: [
      { name: "temperature", format: "f32", unit: "°C" },
      { name: "humidity", format: "u8", unit: "%" },
    ],
  },

  "6": {
    tlmId: "6",
    name: "Back Temperature and Humidity",
    subsystem: "THERMAL",
    source: "FPRIME",
    kind: "struct",
    endian: "big",
    fields: [
      { name: "temperature", format: "f32", unit: "°C" },
      { name: "humidity", format: "u8", unit: "%" },
    ],
  },

  "7": {
    tlmId: "7",
    name: "Magnetometer",
    subsystem: "ADCS",
    source: "FPRIME",
    kind: "struct",
    endian: "big",
    fields: [
      { name: "u_x", format: "f32", unit: "T" },
      { name: "u_y", format: "f32", unit: "T" },
      { name: "u_z", format: "f32", unit: "T" },
      { name: "headingDeg", format: "f32", unit: "deg" },
    ],
  },

  "8": {
    tlmId: "8",
    name: "Magnetometer Temperature",
    subsystem: "ADCS",
    source: "FPRIME",
    kind: "scalar",
    fields: [
      { name: "magneto_meter", format: "f32", unit: "°C" },
    ],
  },
};

export const telemetryMapVersion = "edusat-1.0";
