import type { TelemetryDefinition } from "@/types/telemetry";

export const telemetryMap: Record<string, TelemetryDefinition> = {
  "1": {
    tlmId: "1",
    name: "LED State",
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
    name: "Environment Data",
    kind: "struct",
    endian: "little",
    fields: [
      { name: "temperature", format: "f32", unit: "°C" },
      { name: "humidity", format: "u8", unit: "%" },
    ],
  },
};

export const telemetryMapVersion = "dev-0.2";
