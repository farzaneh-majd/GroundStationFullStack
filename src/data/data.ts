import { decodeTelemetryPayload } from "@/utils/telemetryDecoder";
import type {
  IncomingRawTelemetryPacket,
  StoredRawTelemetryPacket,
} from "@/types/telemetry";
import type { SampleInput, StoredSample } from "@/types/sample";
import type { HealthState, SatelliteTimeSeriesPoint, Vector3 } from "@/types/satellite";

/**
 * This is the ground station's telemetry data.
 *
 * The team doesn't have access to the satellite's live InfluxDB instance
 * yet, so this file generates a month of physically-plausible orbit data
 * (solar/eclipse cycling, thermal cycling, a slow tumble, a simple ground
 * track, and occasional commanded LED events) once when the app starts,
 * and serves everything from that in-memory dataset. The `/api/samples`
 * and `/api/telemetry/packets` routes and their InfluxDB repositories are
 * left in place for when the real satellite link is available - this file
 * is only what the dashboards read from today.
 */

// ---------------------------------------------------------------------------
// Deterministic random number generator so the dataset looks the same on
// every reload instead of reshuffling every time the dev server restarts.
// ---------------------------------------------------------------------------
function createRandom(seed: number) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(20260101);

function floatToHex(value: number): string {
  const buffer = new ArrayBuffer(4);
  new DataView(buffer).setFloat32(0, value, false);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function byteToHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped.toString(16).padStart(2, "0").toUpperCase();
}

let recordCounter = 0;
function nextRecordId(prefix: string) {
  recordCounter += 1;
  return `${prefix}-${recordCounter.toString().padStart(5, "0")}`;
}

// ---------------------------------------------------------------------------
// Orbit / telemetry timeline generation
// ---------------------------------------------------------------------------

const ORBIT_MINUTES = 92; // roughly LEO orbital period
const ECLIPSE_FRACTION = 0.36; // fraction of each orbit spent in Earth's shadow
const DAYS_OF_HISTORY = 30;
const TICK_MINUTES = 60; // one telemetry tick per simulated hour (~720 ticks)

type OrbitTick = {
  time: string;
  inEclipse: boolean;
  solarVoltage: number;
  batteryVoltage: number;
  temp1: number;
  temp2: number;
  humidity: number;
  accel: Vector3;
  gyro: Vector3;
  mag: Vector3;
  lat: number;
  lon: number;
  altitudeKm: number;
  speedKms: number;
  ledState: 0 | 1;
};

function buildTelemetryTimeline(): OrbitTick[] {
  const totalTicks = Math.floor((DAYS_OF_HISTORY * 24 * 60) / TICK_MINUTES);
  const start = new Date();
  start.setMinutes(start.getMinutes() - DAYS_OF_HISTORY * 24 * 60);

  let battery = 3.9;
  let ledState: 0 | 1 = 0;
  const ticks: OrbitTick[] = [];

  for (let i = 0; i <= totalTicks; i += 1) {
    const minutesFromStart = i * TICK_MINUTES;
    const time = new Date(start.getTime() + minutesFromStart * 60_000);
    const dayIndex = minutesFromStart / (60 * 24);

    const orbitPhase = (minutesFromStart % ORBIT_MINUTES) / ORBIT_MINUTES;
    const inEclipse = orbitPhase > 1 - ECLIPSE_FRACTION;
    const sunAngle = Math.sin(orbitPhase * Math.PI * 2);

    const solarVoltage = inEclipse
      ? 3.6 + random() * 0.15
      : 4.6 + sunAngle * 0.5 + random() * 0.2;

    const batteryTarget = inEclipse ? 3.75 : 4.05;
    battery += (batteryTarget - battery) * 0.08 + (random() - 0.5) * 0.02;
    battery = Math.min(4.2, Math.max(3.55, battery));

    const thermalDrift = Math.sin(dayIndex / 6) * 2;
    const temp1 = 10 + 10 * Math.sin(orbitPhase * Math.PI * 2) + thermalDrift + (random() - 0.5) * 1.2;
    const temp2 = temp1 + 4 + 3 * Math.sin(orbitPhase * Math.PI * 2 + 0.6) + (random() - 0.5) * 1.5;

    const humidity = 42 + 6 * Math.sin(dayIndex / 3) + (random() - 0.5) * 3;

    const spinPhase = (minutesFromStart / 240) * Math.PI * 2; // slow ~4h tumble
    const magMagnitude = 38 + 8 * Math.sin(dayIndex / 4);
    const mag: Vector3 = {
      x: Number((magMagnitude * Math.cos(spinPhase) + (random() - 0.5) * 2).toFixed(2)),
      y: Number((magMagnitude * Math.sin(spinPhase) + (random() - 0.5) * 2).toFixed(2)),
      z: Number((12 * Math.sin(spinPhase / 2) + (random() - 0.5) * 2).toFixed(2)),
    };

    const gyro: Vector3 = {
      x: Number((0.05 * Math.sin(spinPhase) + (random() - 0.5) * 0.03).toFixed(3)),
      y: Number((0.05 * Math.cos(spinPhase) + (random() - 0.5) * 0.03).toFixed(3)),
      z: Number(((random() - 0.5) * 0.02).toFixed(3)),
    };

    const accel: Vector3 = {
      x: Number(((random() - 0.5) * 0.05).toFixed(3)),
      y: Number(((random() - 0.5) * 0.05).toFixed(3)),
      z: Number(((random() - 0.5) * 0.05).toFixed(3)),
    };

    const orbitsCompleted = minutesFromStart / ORBIT_MINUTES;
    const lat = 51.6 * Math.sin(orbitsCompleted * Math.PI * 2);
    const lon = ((orbitsCompleted * 360 * 1.1) % 360) - 180;
    const altitudeKm = 515 + 10 * Math.sin(dayIndex / 10) + (random() - 0.5) * 2;
    const speedKms = 7.6 + (random() - 0.5) * 0.02;

    if (random() < 3 / (24 * (60 / TICK_MINUTES))) {
      ledState = ledState === 0 ? 1 : 0;
    }

    ticks.push({
      time: time.toISOString(),
      inEclipse,
      solarVoltage: Number(solarVoltage.toFixed(2)),
      batteryVoltage: Number(battery.toFixed(2)),
      temp1: Number(temp1.toFixed(1)),
      temp2: Number(temp2.toFixed(1)),
      humidity: Number(Math.max(20, Math.min(70, humidity)).toFixed(0)),
      accel,
      gyro,
      mag,
      lat: Number(lat.toFixed(4)),
      lon: Number(lon.toFixed(4)),
      altitudeKm: Number(altitudeKm.toFixed(1)),
      speedKms: Number(speedKms.toFixed(2)),
      ledState,
    });
  }

  return ticks;
}

export const TELEMETRY_TIMELINE = buildTelemetryTimeline();
const latestTick = TELEMETRY_TIMELINE[TELEMETRY_TIMELINE.length - 1];

// ---------------------------------------------------------------------------
// Satellite Monitoring dashboard data
// ---------------------------------------------------------------------------

function formatHM(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const timeSeriesData: SatelliteTimeSeriesPoint[] = TELEMETRY_TIMELINE.map((tick) => ({
  time: formatHM(tick.time),
  solarVoltage: tick.solarVoltage,
  temp1: tick.temp1,
  temp2: tick.temp2,
  humidity: tick.humidity,
}));

export const healthColor: Record<HealthState, "green" | "orange" | "red"> = {
  normal: "green",
  warning: "orange",
  error: "red",
};

function healthFor(value: number, warnLow: number, warnHigh: number, errLow: number, errHigh: number): HealthState {
  if (value <= errLow || value >= errHigh) return "error";
  if (value <= warnLow || value >= warnHigh) return "warning";
  return "normal";
}

export const sensorHealth = {
  solarVoltage: healthFor(latestTick.solarVoltage, 3.8, 5.3, 3.6, 5.6),
  temperature1: healthFor(latestTick.temp1, -5, 28, -10, 32),
  temperature2: healthFor(latestTick.temp2, -5, 30, -10, 34),
  humidity: healthFor(latestTick.humidity, 25, 60, 20, 68),
  gyroscope: healthFor(Math.hypot(latestTick.gyro.x, latestTick.gyro.y, latestTick.gyro.z), 0.3, 0.4, 0.6, 0.8),
  magnetometer: healthFor(Math.hypot(latestTick.mag.x, latestTick.mag.y, latestTick.mag.z), 22, 55, 10, 70),
  gps: "normal",
} satisfies Record<string, HealthState>;

export const satelliteStatus = {
  satelliteMode: latestTick.inEclipse ? "Nominal (Eclipse)" : "Nominal",
  actuatorHealth: "normal" as HealthState,
  actuatorCommand: "Deploy Antenna",
};

export const imuData: { gyroscope: Vector3; magnetometer: Vector3 } = {
  gyroscope: latestTick.gyro,
  magnetometer: latestTick.mag,
};

export const gpsData = {
  latitude: latestTick.lat,
  longitude: latestTick.lon,
  altitudeKm: latestTick.altitudeKm,
  speedKms: latestTick.speedKms,
};

function buildConsoleMessages(): string[] {
  const messages: string[] = [];
  const recent = TELEMETRY_TIMELINE.slice(-24);

  for (let i = 1; i < recent.length; i += 1) {
    const prev = recent[i - 1];
    const cur = recent[i];
    const stamp = new Date(cur.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    if (cur.inEclipse !== prev.inEclipse) {
      messages.push(`[${stamp}] ${cur.inEclipse ? "Entered eclipse - solar input dropping" : "Exited eclipse - solar input recovering"}`);
    }

    if (cur.ledState !== prev.ledState) {
      messages.push(`[${stamp}] Actuator command executed: LED ${cur.ledState ? "ON" : "OFF"}`);
    }

    if (cur.temp2 >= 30 && prev.temp2 < 30) {
      messages.push(`[${stamp}] Temperature sensor 2 warning threshold reached`);
    }
  }

  const latestStamp = new Date(latestTick.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  messages.push(`[${latestStamp}] Telemetry packet received - link nominal`);

  return messages.slice(-12);
}

export const consoleMessages = buildConsoleMessages();

// ---------------------------------------------------------------------------
// Telemetry Dashboard / Raw Telemetry Dashboard - decoded sample store
// (mirrors the tlm_samples measurement the real Influx-backed API would serve)
// ---------------------------------------------------------------------------

function buildInitialSamples(): StoredSample[] {
  const samples: StoredSample[] = [];
  const step = 2; // one battery/temp/mag reading every 2 simulated hours

  for (let i = 0; i < TELEMETRY_TIMELINE.length; i += step) {
    const tick = TELEMETRY_TIMELINE[i];

    samples.push({
      recordId: nextRecordId("sample-batt"),
      time: tick.time,
      sampleType: "battery",
      tlmId: "0x10",
      sync: "AA",
      len: 4,
      payloadHex: floatToHex(tick.batteryVoltage),
      dataHex: floatToHex(tick.batteryVoltage),
      crc: byteToHex(tick.batteryVoltage * 10),
      value: tick.batteryVoltage,
      unit: "V",
    });

    samples.push({
      recordId: nextRecordId("sample-temp"),
      time: tick.time,
      sampleType: "temperature",
      tlmId: "0x11",
      sync: "AA",
      len: 4,
      payloadHex: floatToHex(tick.temp1),
      dataHex: floatToHex(tick.temp1),
      crc: byteToHex(Math.abs(tick.temp1)),
      value: tick.temp1,
      unit: "°C",
    });

    samples.push({
      recordId: nextRecordId("sample-mag"),
      time: tick.time,
      sampleType: "magnetometer",
      tlmId: "0x12",
      sync: "AA",
      len: 6,
      payloadHex: floatToHex(tick.mag.x),
      dataHex: floatToHex(tick.mag.x),
      crc: byteToHex(Math.abs(tick.mag.z)),
      x: tick.mag.x,
      y: tick.mag.y,
      z: tick.mag.z,
      unit: "uT",
    });

    const previousTick = TELEMETRY_TIMELINE[i - step];
    if (previousTick && previousTick.ledState !== tick.ledState) {
      samples.push({
        recordId: nextRecordId("sample-led"),
        time: tick.time,
        sampleType: "led",
        tlmId: "0x13",
        sync: "AA",
        len: 1,
        payloadHex: byteToHex(tick.ledState),
        dataHex: byteToHex(tick.ledState),
        crc: "55",
        value: tick.ledState,
        unit: "state",
      });
    }
  }

  return samples.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function buildInitialPackets(): StoredRawTelemetryPacket[] {
  const packets: StoredRawTelemetryPacket[] = [];
  const step = 3; // IMU + Environment packet every 3 simulated hours

  for (let i = 0; i < TELEMETRY_TIMELINE.length; i += step) {
    const tick = TELEMETRY_TIMELINE[i];

    const imuPayload = [tick.accel.x, tick.accel.y, tick.accel.z, tick.gyro.x, tick.gyro.y, tick.gyro.z]
      .map(floatToHex)
      .join("");

    packets.push({
      record_id: nextRecordId("packet-imu"),
      time: tick.time,
      satellite_id: "SAT-01",
      tlm_id: "2",
      payload: imuPayload,
      decoded: decodeTelemetryPayload("2", imuPayload),
    });

    const envPayload = floatToHex(tick.temp2) + byteToHex(tick.humidity);

    packets.push({
      record_id: nextRecordId("packet-env"),
      time: tick.time,
      satellite_id: "SAT-01",
      tlm_id: "3",
      payload: envPayload,
      decoded: decodeTelemetryPayload("3", envPayload),
    });

    const previousTick = TELEMETRY_TIMELINE[i - step];
    if (previousTick && previousTick.ledState !== tick.ledState) {
      const ledPayload = byteToHex(tick.ledState);

      packets.push({
        record_id: nextRecordId("packet-led"),
        time: tick.time,
        satellite_id: "SAT-01",
        tlm_id: "1",
        payload: ledPayload,
        decoded: decodeTelemetryPayload("1", ledPayload),
      });
    }
  }

  return packets.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

let sampleStore: StoredSample[] = buildInitialSamples();
let packetStore: StoredRawTelemetryPacket[] = buildInitialPackets();

export function listSamples(options?: { sampleType?: string; limit?: number }): StoredSample[] {
  const filtered = sampleStore.filter((sample) => !options?.sampleType || sample.sampleType === options.sampleType);
  return filtered.slice(0, options?.limit ?? filtered.length);
}

export function createSample(input: SampleInput): StoredSample {
  const sampleType = input.sampleType ?? "generic";

  const created: StoredSample = {
    recordId: nextRecordId("sample"),
    time: new Date().toISOString(),
    sampleType,
    tlmId: input.tlmId ?? `0x${sampleType.length}`,
    sync: input.sync ?? "AA",
    len: input.dataHex ? Math.max(1, Math.ceil(input.dataHex.length / 2)) : 1,
    payloadHex: input.dataHex ?? "00",
    dataHex: input.dataHex ?? "00",
    crc: "00",
    value: input.value,
    x: input.x,
    y: input.y,
    z: input.z,
    unit: input.unit ?? (sampleType === "led" ? "state" : ""),
  };

  sampleStore = [created, ...sampleStore];
  return created;
}

export function updateSample(recordId: string, input: SampleInput): StoredSample {
  const index = sampleStore.findIndex((sample) => sample.recordId === recordId);
  if (index === -1) return createSample(input);

  const updated: StoredSample = {
    ...sampleStore[index],
    ...input,
    recordId,
    time: new Date().toISOString(),
    sampleType: input.sampleType ?? sampleStore[index].sampleType,
    tlmId: input.tlmId ?? sampleStore[index].tlmId,
    sync: input.sync ?? sampleStore[index].sync,
    len: input.dataHex ? Math.max(1, Math.ceil(input.dataHex.length / 2)) : sampleStore[index].len,
    payloadHex: input.dataHex ?? sampleStore[index].payloadHex,
    dataHex: input.dataHex ?? sampleStore[index].dataHex,
    unit: input.unit ?? sampleStore[index].unit,
  };

  sampleStore = sampleStore.map((sample) => (sample.recordId === recordId ? updated : sample));
  return updated;
}

export function deleteSample(recordId: string): void {
  sampleStore = sampleStore.filter((sample) => sample.recordId !== recordId);
}

export function listPackets(options?: { limit?: number; satelliteId?: string; tlmId?: string }): StoredRawTelemetryPacket[] {
  const filtered = packetStore.filter((packet) => {
    if (options?.satelliteId && packet.satellite_id !== options.satelliteId) return false;
    if (options?.tlmId && String(packet.tlm_id) !== options.tlmId) return false;
    return true;
  });

  return filtered.slice(0, options?.limit ?? filtered.length);
}

export function createPacket(input: IncomingRawTelemetryPacket): StoredRawTelemetryPacket {
  const tlmId = String(input.tlm_id ?? input.tlmId ?? "1");
  const payload = String(input.payload ?? input.payloadHex ?? input.payload_str ?? "");

  const created: StoredRawTelemetryPacket = {
    record_id: nextRecordId("packet"),
    time: new Date().toISOString(),
    satellite_id: String(input.satellite_id ?? input.satelliteId ?? "SAT-01"),
    tlm_id: tlmId,
    payload,
    decoded: decodeTelemetryPayload(tlmId, payload),
  };

  packetStore = [created, ...packetStore];
  return created;
}

export function updatePacket(recordId: string, input: IncomingRawTelemetryPacket): StoredRawTelemetryPacket {
  const index = packetStore.findIndex((packet) => packet.record_id === recordId);
  if (index === -1) return createPacket(input);

  const existing = packetStore[index];
  const tlmId = String(input.tlm_id ?? input.tlmId ?? existing.tlm_id);
  const payload = String(input.payload ?? input.payloadHex ?? input.payload_str ?? existing.payload);

  const updated: StoredRawTelemetryPacket = {
    ...existing,
    time: new Date().toISOString(),
    satellite_id: String(input.satellite_id ?? input.satelliteId ?? existing.satellite_id),
    tlm_id: tlmId,
    payload,
    decoded: decodeTelemetryPayload(tlmId, payload),
  };

  packetStore = packetStore.map((packet) => (packet.record_id === recordId ? updated : packet));
  return updated;
}

export function deletePacket(recordId: string): void {
  packetStore = packetStore.filter((packet) => packet.record_id !== recordId);
}
